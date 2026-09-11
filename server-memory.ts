import express from "express";
import type { Request, Response, NextFunction } from "express";

/**
 * Runtime conversation memory layer.
 *
 * This intentionally sits outside server.ts so the existing AI/provider logic
 * remains untouched. It implements a bounded two-tier memory model:
 * - recent turns: verbatim, sent to the model every request
 * - compact summary: durable semantic memory for older turns
 *
 * Memory is process-local for now. This matches CloudConnect's current
 * in-memory server model and can later be replaced by a database adapter.
 */

type MemoryMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type ConversationMemory = {
  summary: string;
  turns: MemoryMessage[];
  updatedAt: number;
};

const memories = new Map<string, ConversationMemory>();
const MAX_RECENT_TURNS = 12;
const MAX_SUMMARY_CHARS = 6000;

function keyFor(req: Request): string {
  const body = req.body || {};
  const userId = String(body.userId || body.userName || "guest");
  const sessionId = String(body.sessionId || "default");
  return `${userId}:${sessionId}`;
}

function clean(text: unknown): string {
  return typeof text === "string" ? text.trim() : "";
}

function compact(text: string, max = 900): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max)}…` : normalized;
}

function buildSummary(memory: ConversationMemory): string {
  const prior = memory.summary ? `Existing memory:\n${memory.summary}\n\n` : "";
  const recent = memory.turns
    .slice(0, -MAX_RECENT_TURNS)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${compact(m.content)}`)
    .join("\n");

  if (!recent) return memory.summary;

  const next = `${prior}${recent}`.trim();
  return next.slice(-MAX_SUMMARY_CHARS);
}

function getMemory(key: string): ConversationMemory {
  let memory = memories.get(key);
  if (!memory) {
    memory = { summary: "", turns: [], updatedAt: Date.now() };
    memories.set(key, memory);
  }
  return memory;
}

function prepareHistory(req: Request): void {
  const key = keyFor(req);
  const memory = getMemory(key);
  const incoming = Array.isArray(req.body?.history) ? req.body.history : [];

  // Reconcile client history into server memory without duplicating turns.
  const normalized: MemoryMessage[] = incoming
    .filter((m: any) => (m?.role === "user" || m?.role === "assistant") && clean(m?.content))
    .map((m: any) => ({
      role: m.role,
      content: clean(m.content),
      timestamp: Number(m.timestamp) || Date.now(),
    }));

  if (normalized.length) {
    const existing = new Set(memory.turns.map((m) => `${m.role}:${m.content}`));
    for (const message of normalized) {
      const fingerprint = `${message.role}:${message.content}`;
      if (!existing.has(fingerprint)) memory.turns.push(message);
    }
  }

  // Preserve only recent turns in the actual request, while injecting older
  // semantic context as a system-like context message for the model.
  const recent = memory.turns.slice(-MAX_RECENT_TURNS);
  const olderSummary = memory.summary;

  const contextMessages = olderSummary
    ? [
        {
          role: "assistant",
          content:
            `[CLOUDCONNECT LONG-TERM CONVERSATION MEMORY]\n${olderSummary}\n[/CLOUDCONNECT LONG-TERM CONVERSATION MEMORY]`,
        },
      ]
    : [];

  req.body.history = [...contextMessages, ...recent];
}

function captureTurn(req: Request, responseBody: any): void {
  const key = keyFor(req);
  const memory = getMemory(key);
  const message = clean(req.body?.message);
  const answer = clean(responseBody?.content);

  if (message) memory.turns.push({ role: "user", content: message, timestamp: Date.now() });
  if (answer) memory.turns.push({ role: "assistant", content: answer, timestamp: Date.now() });

  if (memory.turns.length > MAX_RECENT_TURNS * 2) {
    memory.summary = buildSummary(memory);
    memory.turns = memory.turns.slice(-MAX_RECENT_TURNS);
  }

  memory.updatedAt = Date.now();
}

const originalPost = express.application.post;
let patched = false;

export function installConversationMemory(): void {
  if (patched) return;
  patched = true;

  express.application.post = function patchedPost(path: any, ...handlers: any[]) {
    if (path !== "/api/chat") {
      return originalPost.call(this, path, ...handlers);
    }

    const wrapped: any[] = [
      (req: Request, _res: Response, next: NextFunction) => {
        try {
          prepareHistory(req);
        } catch (error) {
          console.warn("[CloudConnect memory] prepare failed:", error);
        }
        next();
      },
      ...handlers.map((handler: any) => {
        if (typeof handler !== "function") return handler;
        return (req: Request, res: Response, next: NextFunction) => {
          const originalJson = res.json.bind(res);
          res.json = (body: any) => {
            try {
              captureTurn(req, body);
            } catch (error) {
              console.warn("[CloudConnect memory] capture failed:", error);
            }
            return originalJson(body);
          };
          return handler(req, res, next);
        };
      }),
    ];

    return originalPost.call(this, path, ...wrapped);
  } as typeof express.application.post;

  console.log("[CloudConnect memory] conversation memory runtime installed");
}

installConversationMemory();

// Patch Express before dynamically loading the real server entrypoint.
await import("./server.ts");
