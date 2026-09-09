import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Sparkles, 
  Globe, 
  Plus, 
  Loader2,
  X,
  Paperclip,
  Image as ImageIcon,
  Upload,
  BookOpen,
  FileText,
  Compass,
  ArrowUp,
  MapPin,
  Navigation
} from 'lucide-react';
import { ChatMessage, VoiceNoteData, UploadedAttachment, GoogleMapsBusiness } from '../types';
import { MessageItem } from './MessageItem';
import { VoiceRecorderBar } from './VoiceRecorderBar';
import { AttachmentList } from './AttachmentList';
import { processUploadedFile } from '../utils/fileHelper';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string, voiceNote?: VoiceNoteData, attachments?: UploadedAttachment[]) => void;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  mapsResearchEnabled?: boolean;
  onToggleMapsResearch?: () => void;
  voiceModeOnly: boolean;
  onToggleVoiceModeOnly: () => void;
  onSpeakText: (text: string, audioBase64?: string) => void;
  isCurrentlySpeaking: boolean;
  onStopSpeaking: () => void;
  onOpenImageStudio: () => void;
  onPreviewAttachment?: (attachment: UploadedAttachment) => void;
  onOpenMapModal?: (business: GoogleMapsBusiness) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
  webSearchEnabled,
  onToggleWebSearch,
  mapsResearchEnabled = true,
  onToggleMapsResearch,
  voiceModeOnly,
  onToggleVoiceModeOnly,
  onSpeakText,
  isCurrentlySpeaking,
  onStopSpeaking,
  onOpenImageStudio,
  onPreviewAttachment,
  onOpenMapModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<UploadedAttachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleSendText = () => {
    if ((!inputText.trim() && pendingAttachments.length === 0) || isLoading) return;
    const text = inputText.trim();
    const attachmentsToSend = [...pendingAttachments];
    setInputText('');
    setPendingAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSendMessage(text, undefined, attachmentsToSend.length > 0 ? attachmentsToSend : undefined);
  };

  const handleVoiceNoteSubmit = (voiceNote: VoiceNoteData) => {
    setIsRecordingVoice(false);
    const attachmentsToSend = [...pendingAttachments];
    setPendingAttachments([]);
    onSendMessage(inputText.trim(), voiceNote, attachmentsToSend.length > 0 ? attachmentsToSend : undefined);
    setInputText('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const processed: UploadedAttachment[] = [];
      for (let i = 0; i < files.length; i++) {
        const item = await processUploadedFile(files[i]);
        processed.push(item);
      }
      setPendingAttachments((prev) => [...prev, ...processed]);
    } catch (err) {
      console.error('File processing error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      setIsUploading(true);
      try {
        const processed: UploadedAttachment[] = [];
        for (let i = 0; i < files.length; i++) {
          const item = await processUploadedFile(files[i]);
          processed.push(item);
        }
        setPendingAttachments((prev) => [...prev, ...processed]);
      } catch (err) {
        console.error('File drop error:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const starterPrompts = [
    {
      title: 'Google Maps Business Research',
      subtitle: 'Research any business, restaurant, or venue on Earth with verified details & hours',
      icon: <MapPin className="w-5 h-5 text-rose-400" />,
      prompt: 'Research Tartine Bakery in San Francisco using Google Maps. Provide their full address, operating hours, ratings, customer review highlights, and signature specialties.',
    },
    {
      title: 'Global Place & Venue Analysis',
      subtitle: 'Explore Tokyo, Paris, or New York landmark businesses and verified reviews',
      icon: <Navigation className="w-5 h-5 text-amber-400" />,
      prompt: "Research Joe's Pizza on Carmine Street in Greenwich Village, NYC using Google Maps. What makes it iconic, what are their hours, and what do reviewers say?",
    },
    {
      title: 'Live Web Grounding Search',
      subtitle: 'Real-time facts, research papers, and live citations from the web',
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      prompt: 'What are the most significant recent breakthroughs in AI multimodal agent architectures and deep reasoning models?',
    },
    {
      title: 'Analyze Books & Complex Documents',
      subtitle: 'Digest lengthy PDFs, extract key themes, citations, and summaries',
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
      action: () => fileInputRef.current?.click(),
    },
    {
      title: 'Multimodal Image Studio',
      subtitle: 'Render high-resolution concept art, photos, and visual diagrams',
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />,
      action: onOpenImageStudio,
    },
    {
      title: 'Interactive Conversational Voice',
      subtitle: 'Engage naturally via voice notes with real-time speech responses',
      icon: <Mic className="w-5 h-5 text-emerald-400" />,
      action: () => setIsRecordingVoice(true),
    },
  ];

  return (
    <div 
      className="flex-1 min-h-0 flex flex-col bg-[#030612] text-zinc-100 overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Vast Horizon Ambient Glows */}
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-64 bg-[radial-gradient(ellipse_80%_50%_at_50%_120%,rgba(99,102,241,0.06),transparent_70%)] pointer-events-none" />

      {/* Hidden File Input supporting all files */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drag and Drop Active Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-40 bg-[#040817]/90 backdrop-blur-md border-2 border-dashed border-sky-400 flex flex-col items-center justify-center p-6 pointer-events-none transition-all">
          <div className="w-20 h-20 rounded-3xl bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300 mb-5 animate-bounce shadow-[0_0_30px_rgba(56,189,248,0.3)]">
            <Upload className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Drop Files into Vast Canvas</h3>
          <p className="text-sm text-sky-200/80 mt-2 text-center max-w-md">
            Books, PDFs, photos, research docs, code files, or audio — processed natively by Gemini 3.8 Flash.
          </p>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.length === 0 ? (
          /* Empty / Welcome State - Vast and Panoramic */
          <div className="max-w-4xl mx-auto py-12 sm:py-20 flex flex-col items-center justify-center text-center">
            {/* Celestial Emblem */}
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center font-bold shadow-[0_0_40px_rgba(56,189,248,0.3)] ring-1 ring-white/20">
                <Sparkles className="w-10 h-10 fill-current animate-pulse" />
              </div>
              <div className="absolute -inset-4 bg-sky-500/10 rounded-full blur-xl -z-10" />
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Vast Intelligence
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-4 max-w-xl leading-relaxed font-light">
              Boundless multimodal cognition with verified live web search grounding, document understanding, image creation, and native voice synthesis.
            </p>

            {/* Feature Capability Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6 text-xs">
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 flex items-center gap-2 backdrop-blur-sm">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Live Web Grounding
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 flex items-center gap-2 backdrop-blur-sm">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                Books &amp; High-Volume Docs
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 flex items-center gap-2 backdrop-blur-sm">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                AI Image Studio
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 flex items-center gap-2 backdrop-blur-sm">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                Conversational Voice
              </span>
            </div>

            {/* Vast Panoramic Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-10 text-left">
              {starterPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else if (item.prompt) {
                      onSendMessage(item.prompt);
                    }
                  }}
                  className="p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.08] hover:border-sky-500/40 transition-all duration-200 group text-left flex flex-col justify-between shadow-lg shadow-black/30 active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3.5 mb-2.5">
                    <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] group-hover:scale-110 transition-transform">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-sky-300 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed pl-0.5">
                    {item.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-w-5xl mx-auto">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onSpeakText={onSpeakText}
                isCurrentlySpeaking={isCurrentlySpeaking}
                onStopSpeaking={onStopSpeaking}
                onPreviewAttachment={onPreviewAttachment}
                onOpenMapModal={onOpenMapModal}
              />
            ))}

            {isLoading && (
              <div className="py-6 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto flex gap-4 items-center">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-400 text-white flex items-center justify-center font-bold text-xs shadow-md animate-pulse">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-sky-300 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    <span>Synthesizing intelligence &amp; grounding facts...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Voice Recording Drawer (when active) */}
      {isRecordingVoice && (
        <div className="p-4 bg-[#050a1b] border-t border-sky-500/30 animate-slide-up z-20">
          <VoiceRecorderBar
            isRecording={isRecordingVoice}
            onSendVoiceNote={handleVoiceNoteSubmit}
            onCancel={() => setIsRecordingVoice(false)}
          />
        </div>
      )}

      {/* Spacious Floating Composer Section */}
      <div className="p-4 sm:p-6 bg-gradient-to-t from-[#02050e] via-[#02050e]/95 to-transparent z-20">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Pending Attachments List */}
          {pendingAttachments.length > 0 && (
            <div className="p-3 bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span className="flex items-center gap-1.5 font-medium text-sky-300">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  Ready to send ({pendingAttachments.length} file{pendingAttachments.length > 1 ? 's' : ''})
                </span>
                <button
                  onClick={() => setPendingAttachments([])}
                  className="text-zinc-500 hover:text-zinc-300 text-[11px]"
                >
                  Clear all
                </button>
              </div>
              <AttachmentList
                attachments={pendingAttachments}
                removable
                onRemove={handleRemoveAttachment}
                onPreview={onPreviewAttachment}
              />
            </div>
          )}

          {/* Composer Capsule */}
          <div className="relative rounded-2xl sm:rounded-3xl bg-[#090e1f]/90 backdrop-blur-xl border border-white/[0.12] focus-within:border-sky-500/60 transition-all duration-200 shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-3 sm:p-4 space-y-3">
            {/* Textarea Input */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                pendingAttachments.length > 0
                  ? "Add instructions for analyzing attached documents/photos..."
                  : "Ask anything, research live topics, explore code, or drop books and media..."
              }
              className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-sm sm:text-base outline-none resize-none max-h-48 leading-relaxed scrollbar-thin px-1"
            />

            {/* Bottom Actions Bar */}
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
              {/* Left Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* File Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 hover:text-white border border-white/[0.08] text-xs transition-colors"
                  title="Upload books, PDFs, photos, documents"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  ) : (
                    <Paperclip className="w-4 h-4 text-zinc-400" />
                  )}
                  <span className="hidden sm:inline">Attach Media / Books</span>
                </button>

                {/* AI Image Studio Trigger */}
                <button
                  type="button"
                  onClick={onOpenImageStudio}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-indigo-300 hover:text-indigo-200 border border-white/[0.08] text-xs transition-colors"
                  title="Open AI Image Studio"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">Image Studio</span>
                </button>

                {/* Web Search Grounding Toggle Capsule */}
                <button
                  type="button"
                  onClick={onToggleWebSearch}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    webSearchEnabled
                      ? 'bg-sky-500/15 border-sky-400/40 text-sky-300'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={webSearchEnabled ? "Live Web Search is active" : "Enable Web Search"}
                >
                  <Globe className={`w-3.5 h-3.5 ${webSearchEnabled ? 'text-sky-400' : 'text-zinc-500'}`} />
                  <span className="hidden md:inline">Web Grounding</span>
                  <span className="text-[10px] font-mono font-bold uppercase">{webSearchEnabled ? 'On' : 'Off'}</span>
                </button>

                {/* Google Maps Business Research Toggle Capsule */}
                <button
                  type="button"
                  onClick={onToggleMapsResearch}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                    mapsResearchEnabled
                      ? 'bg-rose-500/15 border-rose-400/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                      : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-zinc-200'
                  }`}
                  title={mapsResearchEnabled ? "Google Maps Business Research is active" : "Enable Google Maps Business Research"}
                >
                  <MapPin className={`w-3.5 h-3.5 ${mapsResearchEnabled ? 'text-rose-400' : 'text-zinc-500'}`} />
                  <span className="hidden md:inline">Maps Research</span>
                  <span className="text-[10px] font-mono font-bold uppercase">{mapsResearchEnabled ? 'On' : 'Off'}</span>
                </button>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Voice Note Trigger */}
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(true)}
                  className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-sky-300 border border-white/[0.08] transition-colors"
                  title="Record voice note"
                  aria-label="Record voice note"
                >
                  <Mic className="w-4 h-4" />
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={handleSendText}
                  disabled={(!inputText.trim() && pendingAttachments.length === 0) || isLoading}
                  className={`p-2 sm:p-2.5 rounded-xl flex items-center justify-center transition-all ${
                    (inputText.trim() || pendingAttachments.length > 0) && !isLoading
                      ? 'bg-sky-500 hover:bg-sky-400 text-zinc-950 shadow-[0_0_20px_rgba(56,189,248,0.4)] scale-100 active:scale-95 font-bold'
                      : 'bg-white/[0.05] text-zinc-600 cursor-not-allowed border border-white/[0.05]'
                  }`}
                  title="Send message"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 px-3">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-400 font-mono text-[10px]">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-zinc-400 font-mono text-[10px]">Shift+Enter</kbd> for new line</span>
            <span className="hidden sm:inline">Multimodal • Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
};
