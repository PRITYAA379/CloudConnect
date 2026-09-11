# Progress Tracker

## Current Phase

- In progress — Six-File Context System established and first runtime memory feature implemented.

## Current Goal

- Give CloudConnect both explicit developer context and coherent multi-turn user conversation memory without replacing the existing AI provider or chat flow.

## Completed

- Added root `CLAUDE.md` as the AI-development entry point.
- Added `context/project-overview.md` with product definition, flows, features, scope, and success criteria.
- Added `context/architecture.md` with the current stack, boundaries, storage model, request flow, and invariants.
- Added `context/code-standards.md` with implementation conventions.
- Added `context/ai-workflow-rules.md` with scoped, spec-driven development rules.
- Added `context/ui-context.md` with the existing UI language and component conventions.
- Added `server-memory.ts` as a bounded runtime conversation-memory layer.
- Runtime memory keeps recent turns verbatim and compacts older turns into a bounded semantic summary.
- Activated the memory runtime for development and production builds through `package.json` entrypoint changes.

## In Progress

- Verify the new runtime with `npm run lint` and `npm run build` locally.
- Validate conversation continuity across more than six turns.

## Next Up

- Add explicit client `sessionId` propagation so server memory is perfectly isolated between separate chats.
- Replace process-local memory with a persistent store when production persistence is required.
- Add automated tests for memory trimming, duplicate reconciliation, and session isolation.

## Open Questions

- Should CloudConnect move conversation/session persistence from browser localStorage and in-memory auth to a production database?
- What long-term memory policy should be exposed to end users, and what information is allowed to persist?
- Which model/provider should be the primary production chat model, and what are the fallback guarantees?
- Should workspace context eventually be persisted server-side or remain local to the browser/project?

## Architecture Decisions

- The Six-File Context System lives under root `context/` and is consumed by AI coding agents; it is not injected into end-user prompts by default.
- Runtime conversation memory is deliberately separate from developer context.
- `server-memory.ts` wraps the existing `/api/chat` route rather than rewriting the existing AI orchestration, preserving current provider, grounding, attachment, voice, and fallback behavior.
- Current runtime memory is process-local, matching CloudConnect's existing in-memory server model. It is not presented as production-grade persistence.

## Session Notes

- Current repository uses React + TypeScript + Vite on the client and Express/Node on the server.
- `src/App.tsx` already sends conversation history to `/api/chat` and uses `src/utils/workspaceContext.ts` for workspace state.
- The existing server only sends the last six history messages to Gemini; the new runtime memory layer expands usable continuity by retaining recent turns and a bounded summary of older context.
- Local repository execution could not be run from this environment because outbound GitHub/network access from the execution container is unavailable.
