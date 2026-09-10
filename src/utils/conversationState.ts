export type ConversationRole = "user" | "assistant";

export interface ConversationTurn {
  id: string;
  role: ConversationRole;
  text: string;
  timestamp: number;
  source: "chat" | "live";
}

const STORAGE_KEY = "cloudconnect-conversation-state-v1";
const MAX_TURNS = 50;

export function getConversationState(): ConversationTurn[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (turn): turn is ConversationTurn =>
        turn &&
        typeof turn.id === "string" &&
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.text === "string" &&
        typeof turn.timestamp === "number" &&
        (turn.source === "chat" || turn.source === "live")
    );
  } catch {
    return [];
  }
}

export function addConversationTurn(
  role: ConversationRole,
  text: string,
  source: "chat" | "live"
): ConversationTurn {
  const turn: ConversationTurn = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    text: text.trim(),
    timestamp: Date.now(),
    source,
  };

  const turns = [...getConversationState(), turn].slice(-MAX_TURNS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(turns));
  } catch {
    // Ignore storage failures so conversation continues working.
  }

  return turn;
}

export function clearConversationState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

export function getConversationContext(limit = 12): ConversationTurn[] {
  return getConversationState().slice(-limit);
}
