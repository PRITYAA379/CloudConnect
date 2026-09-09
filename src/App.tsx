import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { 
  ChatMessage, 
  ChatSession, 
  VoiceNoteData,
  UploadedAttachment,
  GeneratedImageData,
  GoogleMapsBusiness
} from './types';
import { speakText } from './utils/audio';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ImageStudioModal } from './components/ImageStudioModal';
import { MediaViewerModal } from './components/MediaViewerModal';
import { GoogleMapsModal } from './components/GoogleMapsModal';

const STORAGE_KEY_CURRENT_SESSION = 'vast_active_session_id';
const STORAGE_KEY_WEB_SEARCH = 'vast_web_search_enabled';
const STORAGE_KEY_MAPS_RESEARCH = 'vast_maps_research_enabled';

function MainChatApp() {
  const { user, incrementStat } = useAuth();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WEB_SEARCH);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [mapsResearchEnabled, setMapsResearchEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAPS_RESEARCH);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [selectedBusinessForMap, setSelectedBusinessForMap] = useState<GoogleMapsBusiness | null>(null);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | undefined>(undefined);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'switch'>('signin');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  
  const [voiceModeOnly, setVoiceModeOnly] = useState(false);
  const [isGlobalVoiceMuted, setIsGlobalVoiceMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Multimodal Image Studio Modal State
  const [isImageStudioOpen, setIsImageStudioOpen] = useState(false);
  const [selectedAttachmentForPreview, setSelectedAttachmentForPreview] = useState<UploadedAttachment | null>(null);

  const stopSpeakingRef = useRef<(() => void) | null>(null);

  // Attempt to acquire geolocation gracefully for Google Maps Platform retrieval
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          // Graceful fallback if permission is ignored or denied
        },
        { timeout: 4000 }
      );
    }
  }, []);

  // Per-user isolated sessions storage key
  const userSessionStorageKey = user
    ? `vast_sessions_${user.id}`
    : 'vast_sessions_guest';

  // Load user sessions whenever the active user changes
  useEffect(() => {
    try {
      const savedSessions = localStorage.getItem(userSessionStorageKey);
      const savedActiveId = localStorage.getItem(`${STORAGE_KEY_CURRENT_SESSION}_${user?.id || 'guest'}`);

      if (savedSessions) {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        if (parsed.length > 0) {
          setSessions(parsed);
          const active = parsed.find((s) => s.id === savedActiveId) || parsed[0];
          setCurrentSessionId(active.id);
          return;
        }
      }

      // If no sessions exist for this user, create an initial vast welcome conversation
      const initialSession: ChatSession = {
        id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        userId: user?.id,
        title: `Welcome, ${user ? user.name.split(' ')[0] : 'Explorer'}!`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [
          {
            id: `msg_welcome_${Date.now()}`,
            role: 'assistant',
            content: `Hello **${user ? user.name : 'there'}**! 🌌\n\nWelcome to ****, powered by **gemini-3.8-flash** with live web search grounding, deep document synthesis, AI image creation, and native voice understanding.\n\nYour session is authenticated as **${user ? user.role : 'Explorer'}** (${user?.plan || 'Free'} Tier).\n\nFeel free to ask complex questions, search the live web, drop in books and research papers, or tap the **Microphone** to speak naturally.`,
            timestamp: Date.now(),
          },
        ],
        webSearchEnabled: true,
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

  // Save web search toggle preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WEB_SEARCH, JSON.stringify(webSearchEnabled));
  }, [webSearchEnabled]);

  const currentSession = sessions.find((s) => s.id === currentSessionId) || {
    id: 'default',
    userId: user?.id,
    title: 'New Chat',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    webSearchEnabled,
  };

  const createNewChatSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: user?.id,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      webSearchEnabled,
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
          webSearchEnabled,
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
          webSearch: webSearchEnabled,
          mapsResearch: mapsResearchEnabled,
          userLocation: userCoords,
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

      // Count web search grounding executions
      if (data.groundingSources?.length) {
        incrementStat('webSearchesPerformed', 1);
      }

      // Count Google Maps research executions
      if (data.mapsBusinesses?.length) {
        incrementStat('businessesResearched', data.mapsBusinesses.length);
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
        groundingSources: data.groundingSources || [],
        mapsGroundingSources: data.mapsGroundingSources || [],
        mapsBusinesses: data.mapsBusinesses || [],
        audioResponseBase64: data.audioResponseBase64,
        modelUsed: data.modelUsed || 'gemini-3.8-flash',
        isQuotaFallback: data.isQuotaFallback,
        generatedImage: data.generatedImage,
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

      // Auto voice playback if user has preference enabled and not muted
      const autoPlayVoice = user?.preferences?.autoVoicePlayback ?? true;
      if (autoPlayVoice && !isGlobalVoiceMuted && (data.audioResponseBase64 || voiceModeOnly)) {
        handleSpeakText(data.content, data.audioResponseBase64, assistantMsgId);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: `**Notice**: ${error.message || 'An unexpected error occurred. Please try again.'}`,
        timestamp: Date.now(),
        isQuotaFallback: true,
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                updatedAt: Date.now(),
                messages: [...s.messages, errorMessage],
              }
            : s
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakText = async (text: string, audioBase64?: string, messageId?: string) => {
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
    }

    if (speakingMessageId && !messageId) {
      setSpeakingMessageId(null);
      return;
    }

    if (messageId) setSpeakingMessageId(messageId);

    const cancel = await speakText(
      text,
      audioBase64,
      () => {
        setSpeakingMessageId(null);
        stopSpeakingRef.current = null;
      }
    );

    stopSpeakingRef.current = cancel;
  };

  const handleStopSpeaking = () => {
    if (stopSpeakingRef.current) {
      stopSpeakingRef.current();
      stopSpeakingRef.current = null;
    }
    setSpeakingMessageId(null);
  };

  const handleInsertGeneratedImage = (imageData: GeneratedImageData) => {
    setIsImageStudioOpen(false);
    const imageMessage: ChatMessage = {
      id: `msg_img_${Date.now()}`,
      role: 'assistant',
      content: `**Generated Artwork**: *${imageData.prompt}*\n\nStyle: **${imageData.style || 'Photorealistic'}** • Aspect Ratio: **${imageData.aspectRatio || '1:1'}**`,
      timestamp: Date.now(),
      generatedImage: imageData,
    };
    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              updatedAt: Date.now(),
              messages: [...s.messages, imageMessage],
            }
          : s
      )
    );
  };

  const handlePreviewAttachment = (attachment: UploadedAttachment) => {
    setSelectedAttachmentForPreview(attachment);
  };

  return (
    <div className="flex h-screen bg-[#02050c] text-zinc-100 overflow-hidden font-sans select-none antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen(!sidebarOpen)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(id) => setCurrentSessionId(id)}
        onNewChat={createNewChatSession}
        onDeleteSession={handleDeleteSession}
        voiceModeOnly={voiceModeOnly}
        onToggleVoiceModeOnly={() => setVoiceModeOnly(!voiceModeOnly)}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Vast Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
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
          webSearchEnabled={webSearchEnabled}
          onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
          mapsResearchEnabled={mapsResearchEnabled}
          onToggleMapsResearch={() => {
            const next = !mapsResearchEnabled;
            setMapsResearchEnabled(next);
            localStorage.setItem(STORAGE_KEY_MAPS_RESEARCH, JSON.stringify(next));
          }}
          voiceModeOnly={voiceModeOnly}
          onToggleVoiceModeOnly={() => setVoiceModeOnly(!voiceModeOnly)}
          onSpeakText={(text, audio) => handleSpeakText(text, audio)}
          isCurrentlySpeaking={!!speakingMessageId}
          onStopSpeaking={handleStopSpeaking}
          onOpenImageStudio={() => setIsImageStudioOpen(true)}
          onPreviewAttachment={handlePreviewAttachment}
          onOpenMapModal={(biz) => setSelectedBusinessForMap(biz)}
        />
      </div>

      {/* Interactive Google Maps Place Modal */}
      <GoogleMapsModal
        isOpen={!!selectedBusinessForMap}
        business={selectedBusinessForMap}
        onClose={() => setSelectedBusinessForMap(null)}
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

      {/* Media Viewer Lightbox */}
      <MediaViewerModal
        attachment={selectedAttachmentForPreview}
        onClose={() => setSelectedAttachmentForPreview(null)}
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
