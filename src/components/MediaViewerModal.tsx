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
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
              {attachment.category}
            </span>
            <h3 className="text-sm font-bold text-zinc-100 truncate" title={attachment.name}>
              {attachment.name}
            </h3>
            <span className="text-xs text-zinc-500 font-mono">
              ({formatFileSize(attachment.size)})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {attachment.dataUrl && (
              <a
                href={attachment.dataUrl}
                download={attachment.name}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-zinc-950/90">
          {attachment.category === 'image' && attachment.dataUrl ? (
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              referrerPolicy="no-referrer"
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-zinc-800"
            />
          ) : attachment.category === 'video' && attachment.dataUrl ? (
            <video
              src={attachment.dataUrl}
              controls
              playsInline
              className="max-h-[75vh] w-auto max-w-full rounded-xl shadow-lg border border-zinc-800 bg-black"
            />
          ) : attachment.category === 'audio' && attachment.dataUrl ? (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-400 flex items-center justify-center mx-auto">
                <Film className="w-8 h-8" />
              </div>
              <div className="text-sm font-semibold text-zinc-200">{attachment.name}</div>
              <audio src={attachment.dataUrl} controls className="w-full max-w-md mx-auto" />
            </div>
          ) : attachment.textSnippet ? (
            <div className="w-full h-full max-h-[75vh] rounded-xl bg-zinc-900 border border-zinc-800 p-4 overflow-y-auto font-mono text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed">
              {attachment.textSnippet}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
              <FileText className="w-12 h-12 text-zinc-500 mx-auto" />
              <div className="text-sm font-semibold text-zinc-200">{attachment.name}</div>
              <div className="text-xs text-zinc-500">
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
