import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { ConnectorsModal } from './components/ConnectorsModal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { ALL_CONNECTORS } from './data/connectors';

import {
  ChatMessage,
  ChatSession,
  ConnectorDefinition,
  VoiceNoteData,
  UploadedAttachment,
  GeneratedImageData,
  GeneratedVideoData,
} from './types';

import { speakText } from './utils/audio';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ImageStudioModal } from './components/ImageStudioModal';
import { VideoStudioModal } from './components/VideoStudioModal';
import { MediaViewerModal } from './components/MediaViewerModal';

const STORAGE_KEY_CURRENT_SESSION = 'cloudconnect_active_session_id';
const STORAGE_KEY_CONNECTORS = 'cloudconnect_active_connectors';

const DEFAULT_CONNECTOR_IDS = [
  'google-search',
  'code-sandbox',
  'cloud-storage',
  'sql-database',
  'github-devops',
  'api-webhooks',
  'knowledge-rag',
];

const DEFAULT_MODEL = 'gemini-3.8-flash';

function MainChatApp() {
  const { user, incrementStat } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');

  const [connectors, setConnectors] =
    useState<ConnectorDefinition[]>(ALL_CONNECTORS);

  const [activeConnectorIds, setActiveConnectorIds] =
    useState<string[]>(DEFAULT_CONNECTOR_IDS);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connectorsModalOpen, setConnectorsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [authModalMode, setAuthModalMode] =
    useState<'signin' | 'signup' | 'switch'>('signin');

  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [voiceModeOnly, setVoiceModeOnly] = useState(false);
  const [isGlobalVoiceMuted, setIsGlobalVoiceMuted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] =
    useState<string | null>(null);

  // Image / Video Studio
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState(false);

  const [
    selectedAttachmentForPreview,
    setSelectedAttachmentForPreview,
  ] = useState<UploadedAttachment | null>(null);

  const [videoStudioInitial, setVideoStudioInitial] = useState<{
    imageUrl?: string;
    prompt?: string;
  }>({});

  const stopSpeakingRef = useRef<(() => void) | null>(null);
  const chatAbortControllerRef = useRef<AbortController | null>(null);

  // Per-user session storage
  const userSessionStorageKey = user
    ? `cloudconnect_sessions_${user.id}`
    : 'cloudconnect_sessions_guest';

  /*
   * Create a new chat session.
   * Kept outside effects so it can safely be reused by UI handlers.
   */
  const createNewChatSession = () => {
    const now = Date.now();

    const newSession: ChatSession = {
      id: `session_${now}_${Math.random()
        .toString(36)
        .substring(2, 8)}`,

      userId: user?.id,

      title: 'New Conversation',

      createdAt: now,
      updatedAt: now,

      messages: [],

      activeConnectorIds: [...activeConnectorIds],

      voiceModeOnly,
    };

    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  /*
   * Load sessions whenever active user changes.
   */
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(userSessionStorageKey);

      const savedActiveId = localStorage.getItem(
        `${STORAGE_KEY_CURRENT_SESSION}_${user?.id || 'guest'}`
      );

      const savedConnectors = localStorage.getItem(
        STORAGE_KEY_CONNECTORS
      );

      /*
       * Restore connectors safely.
       */
      if (savedConnectors) {
        try {
          const parsedConnectors = JSON.parse(savedConnectors);

          if (Array.isArray(parsedConnectors)) {
            setActiveConnectorIds(parsedConnectors);
          } else {
            setActiveConnectorIds([...DEFAULT_CONNECTOR_IDS]);
          }
        } catch {
          setActiveConnectorIds([...DEFAULT_CONNECTOR_IDS]);
        }
      } else {
        setActiveConnectorIds([...DEFAULT_CONNECTOR_IDS]);
      }

      /*
       * Restore saved sessions safely.
       */
      if (savedSessions) {
        try {
          const parsed: ChatSession[] = JSON.parse(savedSessions);

          if (Array.isArray(parsed) && parsed.length > 0) {
            setSessions(parsed);

            const active =
              parsed.find((session) => session.id === savedActiveId) ||
              parsed[0];

            setCurrentSessionId(active.id);

            return;
          }
        } catch (error) {
          console.error(
            'Failed to parse saved sessions:',
            error
          );
        }
      }

      /*
       * No saved session.
       * Create initial welcome conversation.
       */
      const now = Date.now();

      const initialSession: ChatSession = {
        id: `session_${now}_${Math.random()
          .toString(36)
          .substring(2, 8)}`,

        userId: user?.id,

        title: `Welcome, ${
          user ? user.name.split(' ')[0] : 'Guest'
        }!`,

        createdAt: now,
        updatedAt: now,

        messages: [
          {
            id: `msg_welcome_${now}`,

            role: 'assistant',

            content: `Hello **${
              user ? user.name : 'there'
            }**! 👋

I am **CloudConnect AI**, running on **${DEFAULT_MODEL}** with enterprise cloud plugins and native voice note understanding.

Your session is authenticated as **${
              user ? user.role : 'Guest'
            }** (${user?.plan || 'Free'} Tier).

Feel free to tap the **Microphone** to talk, or query your connected cloud storage, SQL databases, and GitHub repositories.`,

            timestamp: now,
          },
        ],

        activeConnectorIds: [...DEFAULT_CONNECTOR_IDS],

        voiceModeOnly,
      };

      setSessions([initialSession]);
      setCurrentSessionId(initialSession.id);
    } catch (error) {
      console.error(
        'Failed to initialize CloudConnect session:',
        error
      );

      /*
       * Final fallback if localStorage itself fails.
       */
      const now = Date.now();

      const fallbackSession: ChatSession = {
        id: `session_${now}_${Math.random()
          .toString(36)
          .substring(2, 8)}`,

        userId: user?.id,

        title: 'New Conversation',

        createdAt: now,
        updatedAt: now,

        messages: [],

        activeConnectorIds: [...DEFAULT_CONNECTOR_IDS],

        voiceModeOnly,
      };

      setSessions([fallbackSession]);
      setCurrentSessionId(fallbackSession.id);
    }
  }, [user?.id, userSessionStorageKey]);

  /*
   * Save sessions.
   */
  useEffect(() => {
    if (sessions.length === 0) return;

    try {
      localStorage.setItem(
        userSessionStorageKey,
        JSON.stringify(sessions)
      );
    } catch (error) {
      console.error(
        'Failed to save sessions:',
        error
      );
    }
  }, [sessions, userSessionStorageKey]);

  /*
   * Save active session.
   */
  useEffect(() => {
    if (!currentSessionId) return;

    try {
      localStorage.setItem(
        `${STORAGE_KEY_CURRENT_SESSION}_${user?.id || 'guest'}`,
        currentSessionId
      );
    } catch (error) {
      console.error(
        'Failed to save active session:',
        error
      );
    }
  }, [currentSessionId, user?.id]);

  /*
   * Save connectors.
   */
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_CONNECTORS,
        JSON.stringify(activeConnectorIds)
      );
    } catch (error) {
      console.error(
        'Failed to save connectors:',
        error
      );
    }
  }, [activeConnectorIds]);

  /*
   * Cleanup active API request on unmount.
   */
  useEffect(() => {
    return () => {
      if (chatAbortControllerRef.current) {
        chatAbortControllerRef.current.abort();
      }

      if (stopSpeakingRef.current) {
        stopSpeakingRef.current();
        stopSpeakingRef.current = null;
      }
    };
  }, []);

  /*
   * Current session.
   */
  const currentSession =
    sessions.find(
      (session) => session.id === currentSessionId
    ) || {
      id: 'default',

      userId: user?.id,

      title: 'New Chat',

      createdAt: Date.now(),
      updatedAt: Date.now(),

      messages: [],

      activeConnectorIds: activeConnectorIds,

      voiceModeOnly,
    };

  /*
   * Delete session.
   */
  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter(
        (session) => session.id !== id
      );

      if (filtered.length === 0) {
        const now = Date.now();

        const fallback: ChatSession = {
          id: `session_${now}`,

          userId: user?.id,

          title: 'New Conversation',

          createdAt: now,
          updatedAt: now,

          messages: [],

          activeConnectorIds: [...activeConnectorIds],

          voiceModeOnly,
        };

        setCurrentSessionId(fallback.id);

        return [fallback];
      }

      if (currentSessionId === id) {
        setCurrentSessionId(filtered[0].id);
      }

      return filtered;
    });
  };

  /*
   * Clear current chat.
   */
  const handleClearCurrentChat = () => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,
              messages: [],
              updatedAt: Date.now(),
            }
          : session
      )
    );
  };

  /*
   * Toggle connector.
   */
  const handleToggleConnector = (
    connectorId: string
  ) => {
    setActiveConnectorIds((prev) =>
      prev.includes(connectorId)
        ? prev.filter((id) => id !== connectorId)
        : [...prev, connectorId]
    );
  };

  /*
   * Enable all connectors.
   */
  const handleEnableAllConnectors = () => {
    setActiveConnectorIds(
      ALL_CONNECTORS.map((connector) => connector.id)
    );
  };

  /*
   * Reset recommended connectors.
   */
  const handleResetRecommendedConnectors = () => {
    setActiveConnectorIds([
      ...DEFAULT_CONNECTOR_IDS,
    ]);
  };

  /*
   * Authentication modal.
   */
  const handleOpenAuth = (
    mode: 'signin' | 'signup' | 'switch' = 'signin'
  ) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  /*
   * Send message.
   */
  const handleSendMessage = async (
    text: string,
    voiceNote?: VoiceNoteData,
    attachments?: UploadedAttachment[]
  ) => {
    if (
      !text &&
      !voiceNote &&
      (!attachments || attachments.length === 0)
    ) {
      return;
    }

    incrementStat('messagesSent', 1);

    if (voiceNote) {
      incrementStat('voiceNotesRecorded', 1);
    }

    if (attachments && attachments.length > 0) {
      incrementStat(
        'filesUploaded',
        attachments.length
      );
    }

    /*
     * Cancel previous request if one is still active.
     */
    if (chatAbortControllerRef.current) {
      chatAbortControllerRef.current.abort();
    }

    const abortController =
      new AbortController();

    chatAbortControllerRef.current =
      abortController;

    /*
     * Create user message.
     */
    const userMsgId =
      `msg_${Date.now()}_user`;

    const userMessage: ChatMessage = {
      id: userMsgId,

      role: 'user',

      content: text,

      timestamp: Date.now(),

      voiceNote,

      attachments,
    };

    /*
     * First message title.
     */
    const isFirstMessage =
      currentSession.messages.length === 0;

    const sessionTitle = isFirstMessage
      ? text
        ? text.slice(0, 32)
        : attachments &&
          attachments.length > 0
        ? `Files: ${attachments[0].name.slice(
            0,
            24
          )}`
        : 'Voice Note Inquiry'
      : currentSession.title;

    /*
     * Append user message immediately.
     */
    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,

              title: sessionTitle,

              updatedAt: Date.now(),

              messages: [
                ...session.messages,
                userMessage,
              ],
            }
          : session
      )
    );

    setIsLoading(true);

    try {
      /*
       * IMPORTANT FIX:
       *
       * The previous code built history from
       * currentSession.messages only.
       *
       * That meant the NEW user message was missing
       * from the API context.
       *
       * We now explicitly append the current message.
       */
      const historyPayload = [
        ...currentSession.messages.map(
          (message) => ({
            role: message.role,

            content:
              message.content ||
              message.voiceNote?.transcription ||
              'Voice Note',
          })
        ),

        {
          role: 'user',
          content:
            text ||
            voiceNote?.transcription ||
            'Voice Note',
        },
      ];

      /*
       * Send request.
       */
      const res = await fetch('/api/chat', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        signal: abortController.signal,

        body: JSON.stringify({
          message: text,

          voiceNote: voiceNote
            ? {
                mimeType:
                  voiceNote.mimeType,

                audioBase64:
                  voiceNote.audioBase64,

                durationSeconds:
                  voiceNote.durationSeconds,
              }
            : undefined,

          activeConnectorIds,

          history: historyPayload,

          voiceModeOnly,

          model: DEFAULT_MODEL,

          userRole: user?.role,

          userName: user?.name,

          attachments:
            attachments?.map((attachment) => ({
              id: attachment.id,

              name: attachment.name,

              size: attachment.size,

              type: attachment.type,

              category: attachment.category,

              base64: attachment.base64,

              textSnippet:
                attachment.textSnippet,
            })),
        }),
      });

      /*
       * HTTP error.
       */
      if (!res.ok) {
        let errMessage =
          `Server returned ${res.status}: ${res.statusText}`;

        try {
          const errData =
            await res.json();

          if (errData?.error) {
            errMessage = errData.error;
          }
        } catch {
          // Ignore invalid JSON error responses.
        }

        throw new Error(errMessage);
      }

      /*
       * Parse response.
       */
      const data = await res.json();

      /*
       * Count connector executions.
       */
      if (
        Array.isArray(data.connectorLogs) &&
        data.connectorLogs.length > 0
      ) {
        incrementStat(
          'connectorsExecuted',
          data.connectorLogs.length
        );
      }

      /*
       * Update voice transcript.
       */
      if (
        voiceNote &&
        data.transcript
      ) {
        setSessions((prev) =>
          prev.map((session) =>
            session.id === currentSessionId
              ? {
                  ...session,

                  title: isFirstMessage
                    ? data.transcript.slice(
                        0,
                        32
                      )
                    : session.title,

                  messages:
                    session.messages.map(
                      (message) =>
                        message.id ===
                        userMsgId
                          ? {
                              ...message,

                              voiceNote: {
                                ...message.voiceNote!,

                                transcription:
                                  data.transcript,
                              },
                            }
                          : message
                    ),
                }
              : session
          )
        );
      }

      /*
       * Create assistant message.
       */
      const assistantMsgId =
        `msg_${Date.now()}_assistant`;

      const assistantMessage: ChatMessage = {
        id: assistantMsgId,

        role: 'assistant',

        content:
          data.content ||
          'No response was returned by the AI model.',

        timestamp: Date.now(),

        connectorLogs:
          Array.isArray(data.connectorLogs)
            ? data.connectorLogs
            : [],

        groundingSources:
          Array.isArray(
            data.groundingSources
          )
            ? data.groundingSources
            : [],

        audioResponseBase64:
          data.audioResponseBase64,

        modelUsed:
          data.modelUsed ||
          DEFAULT_MODEL,

        isQuotaFallback:
          data.isQuotaFallback,

        generatedImage:
          data.generatedImage,

        generatedVideo:
          data.generatedVideo,
      };

      /*
       * Add assistant message.
       */
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,

                updatedAt: Date.now(),

                messages: [
                  ...session.messages,
                  assistantMessage,
                ],
              }
            : session
        )
      );

      /*
       * Auto voice playback.
       */
      const shouldAutoSpeak =
        !isGlobalVoiceMuted &&
        (
          voiceModeOnly ||
          !!data.audioResponseBase64 ||
          (
            !!user?.preferences
              ?.autoVoicePlayback &&
            !!voiceNote
          )
        );

      if (shouldAutoSpeak) {
        handleSpeakText(
          assistantMessage.content,
          data.audioResponseBase64,
          assistantMsgId
        );
      }
    } catch (err: any) {
      /*
       * Abort is expected when another request starts
       * or the component unmounts.
       */
      if (
        err?.name === 'AbortError'
      ) {
        return;
      }

      console.error(
        'Chat request error:',
        err
      );

      const errorText =
        err?.message || '';

      const isQuota =
        errorText.includes('429') ||
        errorText
          .toLowerCase()
          .includes('quota') ||
        errorText.includes(
          'RESOURCE_EXHAUSTED'
        );

      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,

        role: 'assistant',

        content: isQuota
          ? `> ⚠️ **Gemini API Quota Exceeded (429)**

Your Gemini API key reached its quota or rate limit.

You can retry the prompt after the limit resets, or continue working with local connector data.`
          : `**Error**

${errorText || 'Unable to connect to CloudConnect AI'}.

Please check your API configuration, server logs, network connection, and retry.`,

        timestamp: Date.now(),
      };

      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,

                messages: [
                  ...session.messages,
                  errorMessage,
                ],

                updatedAt: Date.now(),
              }
            : session
        )
      );
    } finally {
      /*
       * Only clear loading state for the active request.
       */
      if (
        chatAbortControllerRef.current ===
        abortController
      ) {
        chatAbortControllerRef.current =
          null;

        setIsLoading(false);
      }
    }
  };

  /*
   * Speak assistant response.
   */
  const handleSpeakText = async (
    text: string,
    audioBase64?: string,
    messageId?: string
  ) => {
    /*
     * Stop existing speech.
     */
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();

      stopSpeakingRef.current = null;
    }

    /*
     * Toggle current message speech.
     */
    if (
      speakingMessageId === messageId
    ) {
      setSpeakingMessageId(null);
      return;
    }

    if (messageId) {
      setSpeakingMessageId(messageId);
    }

    try {
      const stopFn = await speakText(
        text,
        audioBase64,
        () => {
          setSpeakingMessageId(null);

          stopSpeakingRef.current =
            null;
        }
      );

      stopSpeakingRef.current =
        stopFn;
    } catch (error) {
      console.error(
        'Speech playback error:',
        error
      );

      setSpeakingMessageId(null);

      stopSpeakingRef.current =
        null;
    }
  };

  /*
   * Stop speaking.
   */
  const handleStopSpeaking = () => {
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();

      stopSpeakingRef.current = null;
    }

    setSpeakingMessageId(null);
  };

  /*
   * Insert generated image.
   */
  const handleInsertGeneratedImage = (
    imageData: GeneratedImageData
  ) => {
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_img`,

      role: 'assistant',

      content: `🎨 **AI Image Generated**

Prompt: *"${imageData.prompt}"*

Style: \`${
        imageData.style ||
        'photorealistic'
      }\` | Ratio: \`${
        imageData.aspectRatio
      }\``,

      timestamp: Date.now(),

      generatedImage: imageData,
    };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,

              messages: [
                ...session.messages,
                assistantMessage,
              ],

              updatedAt: Date.now(),
            }
          : session
      )
    );

    setIsImageStudioOpen(false);
  };

  /*
   * Insert generated video.
   */
  const handleInsertGeneratedVideo = (
    videoData: GeneratedVideoData
  ) => {
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_vid`,

      role: 'assistant',

      content: `🎬 **Veo Video Generated**

Prompt: *"${videoData.prompt}"*

Resolution: \`${
        videoData.resolution
      }\` | Ratio: \`${
        videoData.aspectRatio
      }\``,

      timestamp: Date.now(),

      generatedVideo: videoData,
    };

    setSessions((prev) =>
      prev.map((session) =>
        session.id === currentSessionId
          ? {
              ...session,

              messages: [
                ...session.messages,
                assistantMessage,
              ],

              updatedAt: Date.now(),
            }
          : session
      )
    );

    setIsVideoStudioOpen(false);
  };

  /*
   * Animate generated image.
   */
  const handleAnimateImage = (
    imageUrl: string,
    prompt: string
  ) => {
    setVideoStudioInitial({
      imageUrl,

      prompt: `Animate: ${prompt}`,
    });

    setIsVideoStudioOpen(true);
  };

  /*
   * Attachment preview.
   */
  const handlePreviewAttachment = (
    attachment: UploadedAttachment
  ) => {
    setSelectedAttachmentForPreview(
      attachment
    );
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggleOpen={() =>
          setSidebarOpen(!sidebarOpen)
        }
        sessions={sessions}
        currentSessionId={
          currentSessionId
        }
        onSelectSession={(id) =>
          setCurrentSessionId(id)
        }
        onNewChat={
          createNewChatSession
        }
        onDeleteSession={
          handleDeleteSession
        }
        onOpenConnectors={() =>
          setConnectorsModalOpen(true)
        }
        voiceModeOnly={
          voiceModeOnly
        }
        onToggleVoiceModeOnly={() =>
          setVoiceModeOnly(
            !voiceModeOnly
          )
        }
        activeConnectorCount={
          activeConnectorIds.length
        }
        onOpenAuth={
          handleOpenAuth
        }
        onOpenProfile={() =>
          setProfileModalOpen(true)
        }
      />

      {/* Main Chat View */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() =>
            setSidebarOpen(true)
          }
          activeConnectorCount={
            activeConnectorIds.length
          }
          onOpenConnectors={() =>
            setConnectorsModalOpen(true)
          }
          voiceModeOnly={
            voiceModeOnly
          }
          onToggleVoiceModeOnly={() =>
            setVoiceModeOnly(
              !voiceModeOnly
            )
          }
          onClearChat={
            handleClearCurrentChat
          }
          isGlobalVoiceMuted={
            isGlobalVoiceMuted
          }
          onToggleVoiceMute={() => {
            if (
              !isGlobalVoiceMuted
            ) {
              handleStopSpeaking();
            }

            setIsGlobalVoiceMuted(
              !isGlobalVoiceMuted
            );
          }}
          onOpenAuth={
            handleOpenAuth
          }
          onOpenProfile={() =>
            setProfileModalOpen(true)
          }
        />

        <ChatArea
          messages={
            currentSession.messages
          }
          isLoading={isLoading}
          onSendMessage={
            handleSendMessage
          }
          onOpenConnectors={() =>
            setConnectorsModalOpen(true)
          }
          activeConnectorIds={
            activeConnectorIds
          }
          allConnectors={
            connectors
          }
          onToggleConnector={
            handleToggleConnector
          }
          voiceModeOnly={
            voiceModeOnly
          }
          onToggleVoiceModeOnly={() =>
            setVoiceModeOnly(
              !voiceModeOnly
            )
          }
          onSpeakText={(
            text,
            audio
          ) =>
            handleSpeakText(
              text,
              audio
            )
          }
          isCurrentlySpeaking={
            !!speakingMessageId
          }
          onStopSpeaking={
            handleStopSpeaking
          }
          onOpenImageStudio={() =>
            setIsImageStudioOpen(
              true
            )
          }
          onOpenVideoStudio={() => {
            setVideoStudioInitial(
              {}
            );

            setIsVideoStudioOpen(
              true
            );
          }}
          onAnimateImage={
            handleAnimateImage
          }
          onPreviewAttachment={
            handlePreviewAttachment
          }
        />
      </div>

      {/* Connectors & Plugins Modal */}
      <ConnectorsModal
        isOpen={
          connectorsModalOpen
        }
        onClose={() =>
          setConnectorsModalOpen(
            false
          )
        }
        connectors={connectors}
        activeConnectorIds={
          activeConnectorIds
        }
        onToggleConnector={
          handleToggleConnector
        }
        onEnableAll={
          handleEnableAllConnectors
        }
        onResetDefaults={
          handleResetRecommendedConnectors
        }
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() =>
          setAuthModalOpen(false)
        }
        initialMode={
          authModalMode
        }
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={
          profileModalOpen
        }
        onClose={() =>
          setProfileModalOpen(false)
        }
        onOpenSwitchAccount={() =>
          handleOpenAuth('switch')
        }
      />

      {/* AI Image Studio */}
      <ImageStudioModal
        isOpen={
          isImageStudioOpen
        }
        onClose={() =>
          setIsImageStudioOpen(
            false
          )
        }
        onInsertToChat={
          handleInsertGeneratedImage
        }
      />

      {/* Veo Video Studio */}
      <VideoStudioModal
        isOpen={
          isVideoStudioOpen
        }
        onClose={() =>
          setIsVideoStudioOpen(
            false
          )
        }
        onInsertToChat={
          handleInsertGeneratedVideo
        }
        initialStartingImage={
          videoStudioInitial.imageUrl
        }
        initialPrompt={
          videoStudioInitial.prompt
        }
      />

      {/* Media Viewer */}
      <MediaViewerModal
        attachment={
          selectedAttachmentForPreview
        }
        onClose={() =>
          setSelectedAttachmentForPreview(
            null
          )
        }
        onAnimateImage={
          handleAnimateImage
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainChatApp />
    </AuthProvider>
  );
}
