# CloudConnect Application Context

This file is the entry point for AI-assisted development in CloudConnect.

## Read Before Making Changes

Read these files in order before implementing a feature or making an architectural decision:

1. `context/project-overview.md` — product goals, user flows, scope, and success criteria
2. `context/architecture.md` — runtime architecture, boundaries, data flow, storage, and invariants
3. `context/ui-context.md` — visual system and UI conventions
4. `context/code-standards.md` — TypeScript, React, server, API, and file-organization rules
5. `context/ai-workflow-rules.md` — spec-driven workflow, scoping, verification, and recovery rules
6. `context/progress-tracker.md` — current state, completed work, open questions, and next steps

## Operating Rule

CloudConnect is built incrementally. Do not guess about existing behavior when the repository can be inspected. Preserve working behavior unless the requested change explicitly replaces it.

Before a meaningful implementation change, identify the relevant context file(s), inspect the existing implementation, make the smallest coherent change, and verify it.

After each meaningful change, update `context/progress-tracker.md`. If the implementation changes architecture, UI conventions, standards, or scope, update the corresponding context file in the same change.

## Feature Workflow

For every feature:

1. Define the outcome and acceptance criteria.
2. Inspect the current code and dependencies.
3. Keep the change within one clear feature boundary.
4. Implement the smallest end-to-end increment.
5. Verify with the available checks (`npm run lint` and `npm run build`).
6. Record the result in `context/progress-tracker.md`.

## Do Not

- Do not invent APIs, folders, components, or product behavior without checking the repository first.
- Do not rewrite unrelated code while implementing a feature.
- Do not remove existing working functionality to make a new feature easier.
- Do not treat generated UI or third-party internals as application-owned code unless explicitly required.
- Do not mark a feature complete without verification.
