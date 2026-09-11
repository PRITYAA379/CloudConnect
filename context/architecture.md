# Architecture Context

## Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | React 19 + TypeScript | Chat application UI and state management |
| Build | Vite 6 | Frontend development and production build |
| Styling | Tailwind CSS 4 + application CSS | UI styling and adaptive presence states |
| Icons | lucide-react | Interface icons |
| Markdown | react-markdown | Assistant response rendering |
| Server | Node.js + Express 4 + TypeScript | API, authentication, AI orchestration, and static serving |
| AI | `@google/genai` | Gemini client and model interaction |
| Voice | WebSocket / Gemini realtime-related integration | Live/voice interaction support |
| Media | External image-generation endpoint | Image generation fallback/service |
| Maps | Google Maps-oriented server/client flow | Business/location research |

## System Boundaries

- `src/components/` — reusable UI components and modals.
- `src/context/` — React application context providers, including authentication.
- `src/data/` — static application data.
- `src/utils/` — client utilities such as workspace context and file handling.
- `src/App.tsx` — top-level chat/session orchestration and UI composition.
- `server.ts` — server runtime, authentication endpoints, AI orchestration, fallback logic, and API routes.
- `context/` — developer-facing project context; these files describe how the codebase should be changed and maintained.

## Storage Model

- **Browser localStorage**: current chat sessions, active session identifiers, feature preferences, and workspace context.
- **In-memory server state**: current demo/server authentication users and active session tokens.
- **Request payloads**: conversation history, attachments, voice data, user context, and capability toggles are sent to the server for each chat request.
- **External services**: AI, web grounding, maps/business research, and image generation are invoked by the server/client flows where configured.

## Auth and Access Model

- Authentication is currently implemented with server-side demo/in-memory user records and bearer-style session tokens.
- The client uses the authenticated user's ID to isolate locally stored conversations.
- The server exposes login, signup, current-user, and logout endpoints.
- Production-grade persistent authentication/database behavior is not assumed by this context file until explicitly implemented.

## Request/Data Flow

1. React captures user input and current-session history.
2. `src/App.tsx` sends the message, history, capability flags, user metadata, workspace/location context, and attachments to `/api/chat`.
3. `server.ts` handles model calls and supporting integrations.
4. The response is normalized into assistant content, grounding data, maps data, audio, generated media, and model metadata.
5. React appends the assistant message to the active session and persists the session locally.

## Invariants

1. The server is the boundary for secrets and external AI API calls; API keys must not be moved into client code.
2. Conversation history sent to the model must preserve role and message order.
3. A user's locally persisted sessions must use a user-specific storage key.
4. Feature toggles such as web search and maps research must be respected by the request flow.
5. External model failures must not unnecessarily crash the chat UI; existing fallback behavior should remain intact.
6. Context documentation is developer guidance and must not be confused with end-user conversation memory.
