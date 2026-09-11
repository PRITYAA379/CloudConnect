# AI Workflow Rules

## Approach

Use a spec-driven, context-first workflow. The six context files are the source of truth for developer decisions. Inspect the repository before changing code, work in small end-to-end increments, and verify every meaningful change.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, reversible changes over large speculative rewrites.
- Do not combine unrelated UI, API, authentication, storage, and provider changes in one unit unless the feature genuinely crosses those boundaries.
- Preserve stable API response shapes unless a deliberate migration is part of the feature.

## When to Split Work

Split an implementation step when it combines:

- Multiple unrelated user-facing features.
- A UI redesign with unrelated backend behavior.
- Multiple provider migrations.
- A behavior that is not clearly defined in the context files.
- Changes that cannot be verified quickly and independently.

## Handling Missing Requirements

- Do not invent product behavior from assumptions.
- Inspect the existing repository and context first.
- If a requirement is ambiguous, document the decision or open question before implementation.
- If a requirement changes architecture, update `architecture.md` before proceeding.

## Protected Areas

- Do not modify third-party package internals.
- Do not remove working fallback, authentication, session, voice, maps, or multimodal behavior merely to simplify a new feature.
- Do not expose environment secrets to the browser.

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes:

- Product scope or success criteria → `project-overview.md`
- System boundaries, data flow, providers, or invariants → `architecture.md`
- UI language or component conventions → `ui-context.md`
- Coding conventions → `code-standards.md`
- Development process → `ai-workflow-rules.md`
- Current implementation state → `progress-tracker.md`

## Before Moving to the Next Unit

1. The unit works within its defined scope.
2. Existing invariants are preserved.
3. `context/progress-tracker.md` is updated.
4. `npm run lint` passes.
5. `npm run build` passes.
