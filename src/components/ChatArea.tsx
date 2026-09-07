import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  Sparkles, 
  Globe, 
  Cloud, 
  Database, 
  Layers, 
  Plus, 
  Loader2,
  X,
  Paperclip,
  Image as ImageIcon,
  Film,
  Upload,
  BookOpen,
  FileText,
  Video
} from 'lucide-react';
import { ChatMessage, ConnectorDefinition, VoiceNoteData, UploadedAttachment } from '../types';
import { MessageItem } from './MessageItem';
import { VoiceRecorderBar } from './VoiceRecorderBar';
import { AttachmentList } from './AttachmentList';
import { processUploadedFile } from '../utils/fileHelper';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string, voiceNote?: VoiceNoteData, attachments?: UploadedAttachment[]) => void;
  onOpenConnectors: () => void;
  activeConnectorIds: string[];
  allConnectors: ConnectorDefinition[];
  onToggleConnector: (id: string) => void;
  voiceModeOnly: boolean;
  onToggleVoiceModeOnly: () => void;
  onSpeakText: (text: string, audioBase64?: string) => void;
  isCurrentlySpeaking: boolean;
  onStopSpeaking: () => void;
  onOpenImageStudio: () => void;
  onOpenVideoStudio: () => void;
  onAnimateImage?: (imageUrl: string, prompt: string) => void;
  onPreviewAttachment?: (attachment: UploadedAttachment) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onOpenConnectors,
  activeConnectorIds,
  allConnectors,
  onToggleConnector,
  voiceModeOnly,
  onToggleVoiceModeOnly,
  onSpeakText,
  isCurrentlySpeaking,
  onStopSpeaking,
  onOpenImageStudio,
  onOpenVideoStudio,
  onAnimateImage,
  onPreviewAttachment,
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
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
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Drag and drop handlers
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
      title: 'Upload Book or PDF Document',
      subtitle: 'Summarize chapters, extract insights, and analyze arguments',
      icon: <BookOpen className="w-4 h-4 text-amber-400" />,
      action: () => fileInputRef.current?.click(),
    },
    {
      title: 'Analyze Photo or Visual Diagram',
      subtitle: 'Upload any image for deep multimodal visual breakdown',
      icon: <ImageIcon className="w-4 h-4 text-emerald-400" />,
      action: () => fileInputRef.current?.click(),
    },
    {
      title: 'AI Image Studio (Flash Image)',
      subtitle: 'Generate high-res artwork, photos, and book illustrations',
      icon: <Sparkles className="w-4 h-4 text-teal-400" />,
      action: onOpenImageStudio,
    },
    {
      title: 'Veo 3.1 AI Video Studio',
      subtitle: 'Synthesize cinematic motion scenes and animate photos',
      icon: <Film className="w-4 h-4 text-purple-400" />,
      action: onOpenVideoStudio,
    },
    {
      title: 'Voice Note Multi-Cloud Query',
      subtitle: 'Ask about Cloud Architecture via voice note',
      icon: <Mic className="w-4 h-4 text-emerald-400" />,
      action: () => setIsRecordingVoice(true),
    },
    {
      title: 'Analyze Cloud Storage CSV',
      subtitle: 'Summarize q3_revenue_and_churn.csv trends',
      icon: <Cloud className="w-4 h-4 text-sky-400" />,
      prompt: 'Access the Cloud Storage connector, read q3_revenue_and_churn.csv, and summarize MRR growth and regional churn metrics.',
    },
  ];

  return (
    <div 
      className="flex-1 min-h-0 flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
        <div className="absolute inset-0 z-40 bg-emerald-950/80 backdrop-blur-sm border-2 border-dashed border-emerald-400 flex flex-col items-center justify-center p-6 pointer-events-none transition-all">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300 mb-4 animate-bounce">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Drop to Upload Anything</h3>
          <p className="text-xs text-emerald-300/80 mt-1 text-center max-w-sm">
            Books, PDFs, photos, images, documents, audio, videos, or code — Gemini multimodal will analyze it all.
          </p>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-zinc-950 flex items-center justify-center font-bold shadow-xl mb-5">
              <Sparkles className="w-8 h-8 fill-current" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 tracking-tight">
              CloudConnect AI Multimodal
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-lg leading-relaxed">
              Upload <strong className="text-emerald-400">books, documents, photos, images</strong>, generate <strong className="text-teal-400">AI images</strong>, render <strong className="text-purple-400">Veo videos</strong>, and converse with full voice and cloud infrastructure connectors.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs">
              <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                Books &amp; File Uploads
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-teal-400" />
                AI Image Studio
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                Veo 3.1 Video Engine
              </span>
              <span className="px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                Voice Notes
              </span>
            </div>

            {/* Quick Starter Prompts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-6">
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
                  className="p-3.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 text-left transition-all group flex items-start gap-3 shadow-sm hover:shadow-md"
                >
                  <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700/80 group-hover:border-emerald-500/40 transition-colors shrink-0">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-300 transition-colors">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages List */
          <div className="divide-y divide-zinc-900/60 pb-6">
            {messages.map((msg) => (
              <MessageItem
                key={msg.id}
                message={msg}
                onSpeakText={onSpeakText}
                isCurrentlySpeaking={isCurrentlySpeaking}
                onStopSpeaking={onStopSpeaking}
                onAnimateImage={onAnimateImage}
                onPreviewAttachment={onPreviewAttachment}
              />
            ))}

            {/* Thinking / Processing Indicator */}
            {isLoading && (
              <div className="py-5 px-4 sm:px-6 bg-zinc-950/40">
                <div className="max-w-4xl mx-auto flex gap-4 items-center">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-zinc-950 flex items-center justify-center font-bold text-xs shadow-md animate-pulse">
                    <Sparkles className="w-4 h-4 fill-current" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Processing multimodal inquiry, files &amp; connectors...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer Bottom Section */}
      <div className="p-3 sm:p-4 bg-zinc-950/90 border-t border-zinc-800/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Active Voice Recorder Bar */}
          <VoiceRecorderBar
            isRecording={isRecordingVoice}
            onCancel={() => setIsRecordingVoice(false)}
            onSendVoiceNote={handleVoiceNoteSubmit}
            voiceModeOnly={voiceModeOnly}
          />

          {/* Pending Attachments Tray */}
          {pendingAttachments.length > 0 && (
            <div className="p-2.5 rounded-xl bg-zinc-900/95 border border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1 px-1">
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  Attached Items ({pendingAttachments.length}):
                </span>
                <button
                  onClick={() => setPendingAttachments([])}
                  className="text-zinc-500 hover:text-red-400 text-[10px]"
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

          {/* Connectors & Media Tools Pill Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] font-mono text-zinc-500 mr-1 flex items-center gap-1">
                <Layers className="w-3 h-3 text-emerald-400" />
                Active:
              </span>

              {activeConnectorIds.slice(0, 4).map((id) => {
                const def = allConnectors.find((c) => c.id === id);
                if (!def) return null;
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-medium shrink-0"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="truncate max-w-[100px]">{def.name.split(' ')[0]}</span>
                    <button
                      onClick={() => onToggleConnector(id)}
                      className="text-zinc-500 hover:text-zinc-300 ml-0.5"
                      title={`Disable ${def.name}`}
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                );
              })}

              {activeConnectorIds.length > 4 && (
                <span className="text-[11px] text-zinc-400 font-mono px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-800">
                  +{activeConnectorIds.length - 4}
                </span>
              )}

              <button
                onClick={onOpenConnectors}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium px-2 py-0.5 rounded-md bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-500/30 flex items-center gap-1 transition-colors shrink-0"
              >
                <Plus className="w-3 h-3" />
                Connectors
              </button>
            </div>

            {/* Quick studio openers */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenImageStudio}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-teal-400 text-[11px] transition-colors"
                title="Open AI Image Studio"
              >
                <ImageIcon className="w-3 h-3" />
                <span className="hidden sm:inline">Image Studio</span>
              </button>

              <button
                onClick={onOpenVideoStudio}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-purple-400 text-[11px] transition-colors"
                title="Open Veo Video Generator"
              >
                <Film className="w-3 h-3" />
                <span className="hidden sm:inline">Veo Video</span>
              </button>
            </div>
          </div>

          {/* Input Box Capsule */}
          <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 focus-within:border-emerald-500/60 transition-colors shadow-lg flex items-end p-2 gap-1.5 sm:gap-2">
            {/* Attach File Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400 transition-colors shrink-0 flex items-center justify-center"
              title="Upload files, books, photos, videos, or documents"
              aria-label="Upload files"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
            </button>

            {/* Voice Record Button (Microphone) */}
            <button
              onClick={() => setIsRecordingVoice(!isRecordingVoice)}
              className={`p-2.5 rounded-xl transition-all shrink-0 flex items-center justify-center ${
                isRecordingVoice
                  ? 'bg-red-500 text-white animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-emerald-400 hover:text-emerald-300'
              }`}
              title={isRecordingVoice ? 'Stop recording' : 'Record voice note'}
              aria-label="Record voice note"
            >
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder={
                pendingAttachments.length > 0
                  ? `Ask questions about ${pendingAttachments.length} attached item(s)...`
                  : voiceModeOnly
                  ? 'Voice Mode is active: Tap mic to talk or type here...'
                  : 'Ask anything, upload books/photos, or say "generate an image/video of..."'
              }
              className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none py-2 px-1 max-h-40 leading-relaxed font-sans"
            />

            {/* Send Button */}
            <button
              onClick={handleSendText}
              disabled={(!inputText.trim() && pendingAttachments.length === 0) || isLoading}
              className={`p-2.5 rounded-xl transition-all shrink-0 flex items-center justify-center ${
                (inputText.trim() || pendingAttachments.length > 0) && !isLoading
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold shadow-md active:scale-95'
                  : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
              }`}
              title="Send message"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Footer note */}
          <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1">
            <span>
              Supports books, photos, documents &amp; media generation with <strong>Gemini 3.8 + Veo</strong>.
            </span>
            <span className="hidden sm:inline font-mono text-[10px]">
              Drop files anywhere to upload
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
