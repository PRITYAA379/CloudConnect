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
  GeneratedVideoData
} from './types';
import { speakText } from './utils/audio';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ImageStudioModal } from './components/ImageStudioModal';
import { VideoStudioModal } from './components/VideoStudioModal';
import { MediaViewerModal } from './components/MediaViewerModal';

const STORAGE_KEY_CURRENT_SESSION = 'cloudconnect_active_session_id';
const STORAGE_KEY_CONNECTORS = 'cloudconnect_active_connectors';

function MainChatApp() {
  const { user, isGuest, incrementStat } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [connectors, setConnectors] = useState<ConnectorDefinition[]>(ALL_CONNECTORS);
  const [activeConnectorIds, setActiveConnectorIds] = useState<string[]>([
    'google-search',
    'code-sandbox',
    'cloud-storage',
    'sql-database',
    'github-devops',
    'api-webhooks',
    'knowledge-rag',
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connectorsModalOpen, setConnectorsModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'switch'>('signin');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  const [voiceModeOnly, setVoiceModeOnly] = useState(false);
  const [isGlobalVoiceMuted, setIsGlobalVoiceMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Multimodal Image & Video Studio Modals State
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [isVideoStudioOpen, setIsVideoStudioOpen] = useState(false);
  const [selectedAttachmentForPreview, setSelectedAttachmentForPreview] = useState<UploadedAttachment | null>(null);
  const [videoStudioInitial, setVideoStudioInitial] = useState<{
    imageUrl?: string;
    prompt?: string;
  }>({});

  const stopSpeakingRef = useRef<(() => void) | null>(null);

  // Per-user isolated sessions storage key
  const userSessionStorageKey = user
    ? `cloudconnect_sessions_${user.id}`
    : 'cloudconnect_sessions_guest';

  // Load user sessions whenever the active user changes
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(userSessionStorageKey);
      const savedActiveId = localStorage.getItem(`${STORAGE_KEY_CURRENT_SESSION}_${user?.id || 'guest'}`);
      const savedConnectors = localStorage.getItem(STORAGE_KEY_CONNECTORS);

      if (savedConnectors) {
        setActiveConnectorIds(JSON.parse(savedConnectors));
      }

      if (savedSessions) {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        if (parsed.length > 0) {
          setSessions(parsed);
          const active = parsed.find((s) => s.id === savedActiveId) || parsed[0];
          setCurrentSessionId(active.id);
          return;
        }
      }

      // If no sessions exist for this user, create an initial welcome conversation
      const initialSession: ChatSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: user?.id,
        title: `Welcome, ${user ? user.name.split(' ')[0] : 'Guest'}!`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [
          {
            id: `msg_welcome_${Date.now()}`,
            role: 'assistant',
            content: `Hello **${user ? user.name : 'there'}**! 👋\n\nI am **CloudConnect AI**, running on **gemini-3.8-flash** with enterprise cloud plugins and native voice note understanding. Your session is authenticated as **${user ? user.role : 'Guest'}** (${user?.plan || 'Free'} Tier).\n\nFeel free to tap the **Microphone** to talk, or query your connected cloud storage, SQL databases, and GitHub repositories.`,
            timestamp: Date.now(),
          },
        ],
        activeConnectorIds: [...activeConnectorIds],
        voiceModeOnly,
      };

      setSessions([initialSession]);
      setCurrentSessionId(initialSession.id);
    } catch (e) {
      console.error('Failed to load user sessions:', e);
      createNewChatSession();
    }
  }, [user?.id]);

  // Save sessions to user-specific localStorage key
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(userSessionStorageKey, JSON.stringify(sessions));
    }
  }, [sessions, userSessionStorageKey]);

  // Save current session ID
  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem(`${STORAGE_KEY_CURRENT_SESSION}_${user?.id || 'guest'}`, currentSessionId);
    }
  }, [currentSessionId, user?.id]);

  // Save connectors
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONNECTORS, JSON.stringify(activeConnectorIds));
  }, [activeConnectorIds]);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || {
    id: 'default',
    userId: user?.id,
    title: 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    activeConnectorIds: activeConnectorIds,
  };

  const createNewChatSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: user?.id,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      activeConnectorIds: [...activeConnectorIds],
      voiceModeOnly,
    };
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const handleDeleteSession = (id: string) => {
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fallback: ChatSession = {
          id: `session_${Date.now()}`,
          userId: user?.id,
          title: 'New Conversation',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
          activeConnectorIds: [...activeConnectorIds],
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

  const handleClearCurrentChat = () => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId ? { ...s, messages: [], updatedAt: Date.now() } : s
      )
    );
  };

  const handleToggleConnector = (connectorId: string) => {
    setActiveConnectorIds((prev) =>
      prev.includes(connectorId) ? prev.filter((id) => id !== connectorId) : [...prev, connectorId]
    );
  };

  const handleEnableAllConnectors = () => {
    setActiveConnectorIds(ALL_CONNECTORS.map((c) => c.id));
  };

  const handleResetRecommendedConnectors = () => {
    setActiveConnectorIds([
      'google-search',
      'code-sandbox',
      'cloud-storage',
      'sql-database',
      'github-devops',
      'api-webhooks',
      'knowledge-rag',
    ]);
  };

  const handleOpenAuth = (mode: 'signin' | 'signup' | 'switch' = 'signin') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSendMessage = async (
    text: string, 
    voiceNote?: VoiceNoteData, 
    attachments?: UploadedAttachment[]
  ) => {
    if (!text && !voiceNote && (!attachments || attachments.length === 0)) return;

    // Increment user telemetry
    incrementStat('messagesSent', 1);
    if (voiceNote) {
      incrementStat('voiceNotesRecorded', 1);
    }
    if (attachments && attachments.length > 0) {
      incrementStat('filesUploaded', attachments.length);
    }

    // Create User Message
    const userMsgId = `msg_${Date.now()}_user`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      voiceNote,
      attachments,
    };

    // Auto title if first message
    const isFirstMessage = currentSession.messages.length === 0;
    const sessionTitle = isFirstMessage
      ? text
        ? text.slice(0, 32)
        : attachments && attachments.length > 0
        ? `Files: ${attachments[0].name.slice(0, 24)}`
        : 'Voice Note Inquiry'
      : currentSession.title;

    // Append user message immediately
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              title: sessionTitle,
              updatedAt: Date.now(),
              messages: [...s.messages, userMessage],
            }
          : s
      )
    );

    setIsLoading(true);

    try {
      // Build history for context
      const historyPayload = currentSession.messages.map((m) => ({
        role: m.role,
        content: m.content || m.voiceNote?.transcription || 'Voice Note',
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          voiceNote: voiceNote
            ? {
                mimeType: voiceNote.mimeType,
                audioBase64: voiceNote.audioBase64,
                durationSeconds: voiceNote.durationSeconds,
              }
            : undefined,
          activeConnectorIds,
          history: historyPayload,
          voiceModeOnly,
          model: 'gemini-3.8-flash',
          userRole: user?.role,
          userName: user?.name,
          attachments: attachments?.map((a) => ({
            id: a.id,
            name: a.name,
            size: a.size,
            type: a.type,
            category: a.category,
            base64: a.base64,
            textSnippet: a.textSnippet,
          })),
        }),
      });

      if (!res.ok) {
        let errMessage = `Server returned ${res.status}: ${res.statusText}`;
        try {
          const errData = await res.json();
          if (errData?.error) errMessage = errData.error;
        } catch (_) {}
        throw new Error(errMessage);
      }

      const data = await res.json();

      // Count connector executions
      if (data.connectorLogs?.length) {
        incrementStat('connectorsExecuted', data.connectorLogs.length);
      }

      // Update user message if transcript was extracted from audio
      if (voiceNote && data.transcript) {
        setSessions((prev) =>
          prev.map((s) =>
            s.id === currentSessionId
              ? {
                  ...s,
                  title: isFirstMessage ? data.transcript.slice(0, 32) : s.title,
                  messages: s.messages.map((m) =>
                    m.id === userMsgId
                      ? {
                          ...m,
                          voiceNote: { ...m.voiceNote!, transcription: data.transcript },
                        }
                      : m
                  ),
                }
              : s
          )
        );
      }

      // Create Assistant Message
      const assistantMsgId = `msg_${Date.now()}_assistant`;
      const assistantMessage: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: data.content,
        timestamp: Date.now(),
        connectorLogs: data.connectorLogs || [],
        groundingSources: data.groundingSources || [],
        audioResponseBase64: data.audioResponseBase64,
        modelUsed: data.modelUsed || 'gemini-3.8-flash',
        isQuotaFallback: data.isQuotaFallback,
        generatedImage: data.generatedImage,
        generatedVideo: data.generatedVideo,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                updatedAt: Date.now(),
                messages: [...s.messages, assistantMessage],
              }
            : s
        )
      );

      // If voice-only mode or voice response returned, read aloud automatically unless muted
      const shouldAutoSpeak =
        !isGlobalVoiceMuted &&
        (voiceModeOnly || data.audioResponseBase64 || (user?.preferences?.autoVoicePlayback && voiceNote));

      if (shouldAutoSpeak) {
        handleSpeakText(data.content, data.audioResponseBase64, assistantMsgId);
      }
    } catch (err: any) {
      console.error('Chat request error:', err);
      const isQuota =
        (err.message || '').includes('429') ||
        (err.message || '').includes('quota') ||
        (err.message || '').includes('RESOURCE_EXHAUSTED');
      const errorMessage: ChatMessage = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        content: isQuota
          ? `> ⚠️ **Gemini API Quota Exceeded (429)**: Your Gemini API key reached its quota or rate limit. CloudConnect AI is standing by; you can retry your prompt or query local connector data.`
          : `**Error**: ${err.message || 'Unable to connect to CloudConnect AI'}. Please check your network and retry.`,
        timestamp: Date.now(),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? { ...s, messages: [...s.messages, errorMessage] }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakText = async (
    text: string,
    audioBase64?: string,
    messageId?: string
  ) => {
    // Stop any existing speech
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
    }

    if (speakingMessageId === messageId) {
      setSpeakingMessageId(null);
      return;
    }

    if (messageId) {
      setSpeakingMessageId(messageId);
    }

    const stopFn = await speakText(text, audioBase64, () => {
      setSpeakingMessageId(null);
      stopSpeakingRef.current = null;
    });

    stopSpeakingRef.current = stopFn;
  };

  const handleStopSpeaking = () => {
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
    }
    setSpeakingMessageId(null);
  };

  const handleInsertGeneratedImage = (imageData: GeneratedImageData) => {
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_img`,
      role: 'assistant',
      content: `🎨 **AI Image Generated**\n\nPrompt: *"${imageData.prompt}"*\nStyle: \`${imageData.style || 'photorealistic'}\` | Ratio: \`${imageData.aspectRatio}\``,
      timestamp: Date.now(),
      generatedImage: imageData,
    };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, assistantMessage], updatedAt: Date.now() }
          : s
      )
    );
    setIsImageStudioOpen(false);
  };

  const handleInsertGeneratedVideo = (videoData: GeneratedVideoData) => {
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_vid`,
      role: 'assistant',
      content: `🎬 **Veo Video Generated**\n\nPrompt: *"${videoData.prompt}"*\nResolution: \`${videoData.resolution}\` | Ratio: \`${videoData.aspectRatio}\``,
      timestamp: Date.now(),
      generatedVideo: videoData,
    };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? { ...s, messages: [...s.messages, assistantMessage], updatedAt: Date.now() }
          : s
      )
    );
    setIsVideoStudioOpen(false);
  };

  const handleAnimateImage = (imageUrl: string, prompt: string) => {
    setVideoStudioInitial({ imageUrl, prompt: `Animate: ${prompt}` });
    setIsVideoStudioOpen(true);
  };

  const handlePreviewAttachment = (att: UploadedAttachment) => {
    setSelectedAttachmentForPreview(att);
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewChat={createNewChatSession}
        onDeleteSession={handleDeleteSession}
        onOpenConnectors={() => setConnectorsModalOpen(true)}
        voiceModeOnly={voiceModeOnly}
        onToggleVoiceModeOnly={() => setVoiceModeOnly(!voiceModeOnly)}
        activeConnectorCount={activeConnectorIds.length}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Chat View */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(true)}
          activeConnectorCount={activeConnectorIds.length}
          onOpenConnectors={() => setConnectorsModalOpen(true)}
          voiceModeOnly={voiceModeOnly}
          onToggleVoiceModeOnly={() => setVoiceModeOnly(!voiceModeOnly)}
          onClearChat={handleClearCurrentChat}
          isGlobalVoiceMuted={isGlobalVoiceMuted}
          onToggleVoiceMute={() => {
            if (!isGlobalVoiceMuted) {
              handleStopSpeaking();
            }
            setIsGlobalVoiceMuted(!isGlobalVoiceMuted);
          }}
          onOpenAuth={handleOpenAuth}
          onOpenProfile={() => setProfileModalOpen(true)}
        />

        <ChatArea
          messages={currentSession.messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onOpenConnectors={() => setConnectorsModalOpen(true)}
          activeConnectorIds={activeConnectorIds}
          allConnectors={connectors}
          onToggleConnector={handleToggleConnector}
          voiceModeOnly={voiceModeOnly}
          onToggleVoiceModeOnly={() => setVoiceModeOnly(!voiceModeOnly)}
          onSpeakText={(text, audio) => handleSpeakText(text, audio)}
          isCurrentlySpeaking={!!speakingMessageId}
          onStopSpeaking={handleStopSpeaking}
          onOpenImageStudio={() => setIsImageStudioOpen(true)}
          onOpenVideoStudio={() => {
            setVideoStudioInitial({});
            setIsVideoStudioOpen(true);
          }}
          onAnimateImage={handleAnimateImage}
          onPreviewAttachment={handlePreviewAttachment}
        />
      </div>

      {/* Connectors & Plugins Modal */}
      <ConnectorsModal
        isOpen={connectorsModalOpen}
        onClose={() => setConnectorsModalOpen(false)}
        connectors={connectors}
        activeConnectorIds={activeConnectorIds}
        onToggleConnector={handleToggleConnector}
        onEnableAll={handleEnableAllConnectors}
        onResetDefaults={handleResetRecommendedConnectors}
      />

      {/* Authentication Modal (Sign In, Create Account, Quick Switch) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* User Profile & Account Settings Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onOpenSwitchAccount={() => handleOpenAuth('switch')}
      />

      {/* AI Image Studio Modal */}
      <ImageStudioModal
        isOpen={isImageStudioOpen}
        onClose={() => setIsImageStudioOpen(false)}
        onInsertToChat={handleInsertGeneratedImage}
      />

      {/* Veo Video Studio Modal */}
      <VideoStudioModal
        isOpen={isVideoStudioOpen}
        onClose={() => setIsVideoStudioOpen(false)}
        onInsertToChat={handleInsertGeneratedVideo}
        initialStartingImage={videoStudioInitial.imageUrl}
        initialPrompt={videoStudioInitial.prompt}
      />

      {/* Media Viewer Lightbox */}
      <MediaViewerModal
        attachment={selectedAttachmentForPreview}
        onClose={() => setSelectedAttachmentForPreview(null)}
        onAnimateImage={handleAnimateImage}
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
