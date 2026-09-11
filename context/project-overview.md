# CloudConnect

## Overview

CloudConnect is a web-based AI workspace that combines conversational AI with authenticated user sessions, multimodal attachments, voice interaction, live web grounding, Google Maps/business research, image generation, and workspace-aware context. The primary goal is to provide one place where a user can have a useful, continuous AI conversation while keeping project and session state organized.

## Goals

1. Provide a reliable conversational AI experience with coherent multi-turn history.
2. Keep user sessions isolated and recoverable across browser sessions.
3. Support multimodal interaction: text, voice, files, images, web research, maps/business research, and generated media.
4. Make AI-assisted development and workspace context explicit rather than relying on implicit assumptions.
5. Evolve the application incrementally without breaking existing working capabilities.

## Core User Flow

1. User opens CloudConnect.
2. User signs in or creates an account, or continues with the available default session behavior.
3. CloudConnect loads the user's sessions and active conversation.
4. User sends a text message, voice note, or attachment.
5. The client sends the current conversation history and enabled capabilities to `/api/chat`.
6. The server processes the request using the configured AI and supporting services.
7. CloudConnect renders the assistant response, grounding information, media, and optional audio.
8. The conversation is persisted in the user's browser session storage and can be resumed later.

## Features

### Conversation

- Multi-turn chat sessions
- Automatic conversation titles
- Per-user session isolation
- Clear, create, and delete conversations
- Voice notes and optional voice playback

### AI and Grounding

- Gemini-backed server AI client
- Web-search grounding when enabled
- Google Maps/business research when enabled
- Graceful quota/high-demand fallback behavior
- Image generation support

### Multimodal Workspace

- File attachments with extracted snippets
- Image/media viewing
- Workspace context containing active file, selected code, terminal output, and last action
- Adaptive UI state for thinking, voice, coding, and errors

### Authentication

- Sign-in and sign-up endpoints
- Session token handling
- User profile and plan metadata

## Scope

### In Scope

- Reliable chat and conversation history
- Existing authentication/session behavior
- Multimodal input and response rendering
- Grounding and research integrations already present in the application
- Workspace context
- AI-assisted development workflow using the Six-File Context System

### Out of Scope

- Replacing the current AI provider without a defined migration plan
- Rewriting the application into a different framework
- Introducing a production database solely for the context methodology
- Unrelated redesigns while implementing individual features
- Inventing new product capabilities without an explicit requirement

## Success Criteria

1. A user can start a conversation and receive a response using the existing `/api/chat` flow.
2. Previous messages in the active session are supplied as conversation history.
3. User sessions remain isolated by user identity in the current client storage model.
4. Workspace context can be captured and supplied to relevant application workflows.
5. Every meaningful code change can be traced through `context/progress-tracker.md`.
6. `npm run lint` and `npm run build` pass before a feature is considered complete.
