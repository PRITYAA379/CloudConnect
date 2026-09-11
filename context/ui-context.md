# UI Context

## Theme

CloudConnect uses a dark, technical AI workspace aesthetic. The interface should feel focused and premium rather than decorative. Preserve the existing adaptive AI-presence behavior and responsive layout.

## Colors

The current repository contains existing CSS and AI-presence styles. When adding UI, inspect the existing tokens/classes first and extend them rather than introducing a second visual language.

| Role | Guidance |
|---|---|
| Page background | Existing CloudConnect dark background tokens/styles |
| Surface | Existing panel/card surface styles |
| Primary text | Existing high-contrast text styles |
| Muted text | Existing secondary text styles |
| Accent | Existing CloudConnect accent/presence styles |
| Error | Existing error state styles |
| Success | Existing success state styles |

Do not hardcode a new palette for an isolated feature.

## Typography

Use the typography already established in the application. New components should inherit the surrounding UI rather than introducing an unrelated font stack.

## Layout Patterns

- Main workspace: sidebar + header + central chat area.
- Modals: existing application modal components and backdrop behavior.
- Chat: assistant/user message separation with support for markdown, attachments, grounding, maps, audio, and generated media.
- Responsive behavior: preserve desktop and smaller-screen usability.
- AI presence: state is represented through `data-cloudconnect-state` on the document root.

## Components

Prefer existing components in `src/components/` before creating new primitives. Keep new components narrowly scoped and reusable when a pattern is repeated.

## Icons

Use `lucide-react` for new interface icons to remain consistent with the existing application.
