# Progress Tracker

## Current Phase

- In progress — Six-File Context System established.

## Current Goal

- Make CloudConnect maintainable for AI-assisted development by giving coding agents a persistent, explicit project context and a repeatable implementation workflow.

## Completed

- Added root `CLAUDE.md` as the AI-development entry point.
- Added `context/project-overview.md` with product definition, flows, features, scope, and success criteria.
- Added `context/architecture.md` with the current stack, boundaries, storage model, request flow, and invariants.
- Added `context/code-standards.md` with implementation conventions.
- Added `context/ai-workflow-rules.md` with scoped, spec-driven development rules.
- Added `context/ui-context.md` with the existing UI language and component conventions.

## In Progress

- Establish the first feature unit using the new context system.
- Verify the repository after the context-only change.

## Next Up

- Run `npm run lint` and `npm run build` locally.
- For the next product feature, define a small spec/acceptance criteria before editing implementation code.
- Improve conversational context/memory separately from developer context; do not conflate the Six-File developer methodology with runtime user memory.

## Open Questions

- Should CloudConnect move conversation/session persistence from browser localStorage and in-memory auth to a production database?
- What long-term memory policy should be exposed to end users, and what information is allowed to persist?
- Which model/provider should be the primary production chat model, and what are the fallback guarantees?
- Should workspace context eventually be persisted server-side or remain local to the browser/project?

## Architecture Decisions

- The Six-File Context System lives under root `context/` and is consumed by AI coding agents; it is not injected into end-user prompts by default.
- `CLAUDE.md` is the entry point and requires the six context files to be read in a fixed order.
- Existing CloudConnect runtime architecture remains unchanged by this documentation-only implementation.

## Session Notes

- Current repository uses React + TypeScript + Vite on the client and Express/Node on the server.
- `src/App.tsx` already sends conversation history to `/api/chat` and uses `src/utils/workspaceContext.ts` for workspace state.
- This methodology layer should make future code changes smaller, more consistent, and resumable across AI coding sessions.
