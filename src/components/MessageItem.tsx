import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RotateCcw,
  Download,
  Maximize2,
  ZoomIn
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, UploadedAttachment, GoogleMapsBusiness } from '../types';
import { VoiceMessageBubble } from './VoiceMessageBubble';
import { WebGroundingSources } from './WebGroundingSources';
import { GoogleMapsSources } from './GoogleMapsSources';
import { GoogleMapsBusinessCard } from './GoogleMapsBusinessCard';
import { AttachmentList } from './AttachmentList';

interface MessageItemProps {
  message: ChatMessage;
  onSpeakText: (text: string, audioBase64?: string) => void;
  isCurrentlySpeaking: boolean;
  onStopSpeaking: () => void;
  onPreviewAttachment?: (attachment: UploadedAttachment) => void;
  onOpenMapModal?: (business: GoogleMapsBusiness) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onSpeakText,
  isCurrentlySpeaking,
  onStopSpeaking,
  onPreviewAttachment,
  onOpenMapModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [codeCopiedIndex, setCodeCopiedIndex] = useState<number | null>(null);

  const isAssistant = message.role === 'assistant';

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCodeBlock = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCodeCopiedIndex(index);
    setTimeout(() => setCodeCopiedIndex(null), 2000);
  };

  return (
    <div
      className={`py-5 px-4 sm:px-6 transition-colors ${
        isAssistant ? 'bg-[#0F0F0F]/40' : 'bg-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto flex gap-4 sm:gap-5 items-start">
        {/* Avatar */}
        <div
          className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-md ${
            isAssistant
              ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-zinc-950'
              : 'bg-[#1A1A1A] border border-[#2D2D2D] text-[#A0A0A0]'
          }`}
        >
          {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#FFFFFF]">
                {isAssistant ? 'CloudConnect AI' : 'You'}
              </span>
              {isAssistant && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  ChatGPT Core + Multimodal
                </span>
              )}
            </div>

            <span className="text-[10px] text-[#A0A0A0] font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Uploaded attachments if present */}
          {message.attachments && message.attachments.length > 0 && (
            <AttachmentList
              attachments={message.attachments}
              onPreview={onPreviewAttachment}
            />
          )}

          {/* Voice note component if present */}
          {message.voiceNote && (
            <div className="my-1.5">
              <VoiceMessageBubble voiceNote={message.voiceNote} />
            </div>
          )}

          {/* Generated Image Card */}
          {message.generatedImage && (
            <div className="my-3 rounded-2xl overflow-hidden border border-[#2D2D2D] bg-[#1A1A1A]/90 shadow-lg max-w-xl">
              <div className="relative group overflow-hidden bg-[#0F0F0F] flex items-center justify-center">
                <img
                  src={message.generatedImage.url}
                  alt={message.generatedImage.prompt}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[420px] object-contain rounded-t-xl transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>

              <div className="p-3 bg-[#0F0F0F]/80 border-t border-[#2D2D2D]/80 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-[#A0A0A0] truncate" title={message.generatedImage.prompt}>
                    "{message.generatedImage.prompt}"
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#A0A0A0] mt-0.5">
                    <span className="text-emerald-400 font-semibold">AI Generated Image</span>
                    {message.generatedImage.aspectRatio && (
                      <span>• Ratio: {message.generatedImage.aspectRatio}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={message.generatedImage.url}
                    download={`ai-image-${Date.now()}.png`}
                    className="p-1.5 rounded-lg bg-[#1A1A1A] hover:bg-[#2D2D2D] text-[#A0A0A0] hover:text-emerald-400 transition-colors"
                    title="Download full resolution"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Text Message Content */}
          {message.content && (
            <div className="prose prose-invert max-w-none text-sm text-[#FFFFFF] leading-relaxed font-sans">
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');

                    if (!inline && match) {
                      const lang = match[1];
                      return (
                        <div className="relative my-3 rounded-xl overflow-hidden border border-[#2D2D2D] bg-[#0F0F0F]">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-[#1A1A1A]/90 border-b border-[#2D2D2D] text-[11px] font-mono text-[#A0A0A0]">
                            <span>{lang}</span>
                            <button
                              onClick={() => handleCopyCodeBlock(codeString, 1)}
                              className="flex items-center gap-1 hover:text-[#FFFFFF] transition-colors"
                            >
                              {codeCopiedIndex === 1 ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>{codeCopiedIndex === 1 ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <pre className="p-3 text-xs overflow-x-auto font-mono text-emerald-300/90 leading-normal">
                            <code className={className} {...props}>
                              {children}
                            </code>
                          </pre>
                        </div>
                      );
                    }

                    return (
                      <code className="bg-[#1A1A1A]/80 px-1.5 py-0.5 rounded text-emerald-400 font-mono text-xs" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }: any) {
                    return (
                      <div className="overflow-x-auto my-3 border border-[#2D2D2D] rounded-xl">
                        <table className="w-full text-xs text-left text-[#A0A0A0] divide-y divide-zinc-800">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }: any) {
                    return <th className="px-3 py-2 bg-[#1A1A1A] font-semibold text-[#FFFFFF]">{children}</th>;
                  },
                  td({ children }: any) {
                    return <td className="px-3 py-2 border-t border-[#2D2D2D]/60">{children}</td>;
                  },
                  ul({ children }: any) {
                    return <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>;
                  },
                  ol({ children }: any) {
                    return <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>;
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Google Maps Researched Businesses */}
          {isAssistant && message.mapsBusinesses && message.mapsBusinesses.length > 0 && (
            <div className="space-y-3 pt-1">
              {message.mapsBusinesses.map((biz) => (
                <GoogleMapsBusinessCard
                  key={biz.id || biz.name}
                  business={biz}
                  onOpenMapModal={onOpenMapModal}
                />
              ))}
            </div>
          )}

          {/* Google Maps Grounding Sources */}
          {isAssistant && message.mapsGroundingSources && message.mapsGroundingSources.length > 0 && (
            <GoogleMapsSources
              sources={message.mapsGroundingSources}
            />
          )}

          {/* Live web grounding sources */}
          {isAssistant && message.groundingSources && message.groundingSources.length > 0 && (
            <WebGroundingSources
              sources={message.groundingSources}
            />
          )}

          {/* Assistant Action Bar */}
          {isAssistant && (
            <div className="pt-2 flex items-center gap-2 text-[#A0A0A0] text-xs">
              <button
                onClick={
                  isCurrentlySpeaking
                    ? onStopSpeaking
                    : () => onSpeakText(message.content, message.audioResponseBase64)
                }
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                  isCurrentlySpeaking
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400 font-medium'
                    : 'bg-[#1A1A1A]/60 border-[#2D2D2D] hover:text-[#FFFFFF] hover:bg-[#1A1A1A]'
                }`}
                title={isCurrentlySpeaking ? 'Stop speaking' : 'Read answer aloud with AI Voice'}
              >
                {isCurrentlySpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                    <span>Stop Voice</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen Aloud</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyText}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A1A1A]/60 border border-[#2D2D2D] hover:text-[#FFFFFF] hover:bg-[#1A1A1A] transition-colors"
                title="Copy response to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
