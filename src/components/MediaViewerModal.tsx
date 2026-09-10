import React from 'react';
import { 
  X, 
  Download, 
  BookOpen, 
  FileText, 
  Film, 
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import { UploadedAttachment } from '../types';
import { formatFileSize } from '../utils/fileHelper';

interface MediaViewerModalProps {
  attachment: UploadedAttachment | null;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  attachment,
  onClose,
}) => {
  if (!attachment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#2D2D2D] bg-[#0F0F0F]/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-[#1A1A1A] text-[#A0A0A0] border border-[#2D2D2D]">
              {attachment.category}
            </span>
            <h3 className="text-sm font-bold text-[#FFFFFF] truncate" title={attachment.name}>
              {attachment.name}
            </h3>
            <span className="text-xs text-[#A0A0A0] font-mono">
              ({formatFileSize(attachment.size)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {attachment.dataUrl && (
              <a
                href={attachment.dataUrl}
                download={attachment.name}
                className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-emerald-400 hover:bg-[#1A1A1A] transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#A0A0A0] hover:text-[#FFFFFF] hover:bg-[#1A1A1A] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-[#0F0F0F]/90">
          {attachment.category === 'image' && attachment.dataUrl ? (
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-[#2D2D2D]"
            />
          ) : attachment.category === 'video' && attachment.dataUrl ? (
            <video
              src={attachment.dataUrl}
              controls
              playsInline
              className="max-h-[75vh] w-auto max-w-full rounded-xl shadow-lg border border-[#2D2D2D] bg-black"
            />
          ) : attachment.category === 'audio' && attachment.dataUrl ? (
            <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D] text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-400 flex items-center justify-center mx-auto">
                <Film className="w-8 h-8" />
              </div>
              <div className="text-sm font-semibold text-[#FFFFFF]">{attachment.name}</div>
              <audio src={attachment.dataUrl} controls className="w-full max-w-md mx-auto" />
            </div>
          ) : attachment.textSnippet ? (
            <div className="w-full h-full max-h-[75vh] rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] p-4 overflow-y-auto font-mono text-xs text-[#A0A0A0] whitespace-pre-wrap leading-relaxed">
              {attachment.textSnippet}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#1A1A1A] border border-[#2D2D2D] text-center space-y-3">
              <FileText className="w-12 h-12 text-[#A0A0A0] mx-auto" />
              <div className="text-sm font-semibold text-[#FFFFFF]">{attachment.name}</div>
              <div className="text-xs text-[#A0A0A0]">
                Binary / Document attached for Gemini multimodal analysis
              </div>
              {attachment.dataUrl && (
                <a
                  href={attachment.dataUrl}
                  download={attachment.name}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
