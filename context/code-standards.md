# Code Standards

## General

- Keep modules focused and avoid mixing unrelated concerns.
- Prefer fixing the root cause instead of adding layered workarounds.
- Preserve existing behavior unless the requirement explicitly changes it.
- Reuse existing utilities/components before introducing duplicates.
- Keep types explicit at application boundaries.

## TypeScript

- TypeScript is required for application code.
- Avoid `any` in new code unless an external library or dynamic boundary makes it necessary and the usage is narrowly contained.
- Validate unknown external data before relying on its shape.
- Keep shared domain types in `src/types.ts` when they are used across multiple components.

## React

- Keep state ownership close to the component or provider that owns the behavior.
- Use callbacks/effects deliberately; avoid effects that can be replaced by derived state.
- Keep API payload construction explicit and backwards-compatible.
- Do not duplicate session persistence logic across components.

## Server

- Keep secrets and provider credentials server-side.
- Keep API handlers focused on request validation, orchestration, and response shaping.
- Preserve graceful error/fallback handling around external model calls.
- Do not expose raw provider credentials or internal errors to clients.

## API Routes

- Validate required request fields before invoking external services.
- Preserve stable response fields consumed by the client unless a migration is planned.
- Treat attachments, voice input, user metadata, and history as untrusted request data.
- Keep feature flags such as web search and maps research explicit in the request flow.

## Styling

- Reuse the existing CloudConnect visual system and CSS tokens where available.
- Do not introduce unrelated visual redesigns during functional feature work.
- Keep responsive behavior intact.

## File Organization

- `src/components/` — UI components.
- `src/context/` — React context/providers.
- `src/utils/` — reusable client utilities.
- `src/data/` — static data.
- `src/types.ts` — shared application types.
- `server.ts` — server/API orchestration.
- `context/` — AI/developer context documentation, not runtime user memory.

## Verification

Before declaring a change complete:

1. Run `npm run lint`.
2. Run `npm run build`.
3. Manually verify the affected user flow when practical.
4. Update `context/progress-tracker.md`.
