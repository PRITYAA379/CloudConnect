import React from 'react';
import { 
  FileText, 
  Image as ImageIcon, 
  BookOpen, 
  Film, 
  Music, 
  Code, 
  File, 
  X, 
  Download, 
  ExternalLink 
} from 'lucide-react';
import { UploadedAttachment } from '../types';
import { formatFileSize } from '../utils/fileHelper';

interface AttachmentListProps {
  attachments: UploadedAttachment[];
  removable?: boolean;
  onRemove?: (id: string) => void;
  onPreview?: (attachment: UploadedAttachment) => void;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  removable = false,
  onRemove,
  onPreview,
}) => {
  if (!attachments || attachments.length === 0) return null;

  const renderIcon = (category: UploadedAttachment['category']) => {
    switch (category) {
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-400" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-[#A3FF12]" />;
      case 'video':
        return <Film className="w-4 h-4 text-purple-400" />;
      case 'audio':
        return <Music className="w-4 h-4 text-pink-400" />;
      case 'code':
        return <Code className="w-4 h-4 text-[#A3FF12]" />;
      default:
        return <File className="w-4 h-4 text-[#A0A0A0]" />;
    }
  };

  const getCategoryBadgeClass = (category: UploadedAttachment['category']) => {
    switch (category) {
      case 'image':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/30';
      case 'book':
        return 'bg-amber-950/80 text-amber-400 border-amber-500/30';
      case 'document':
        return 'bg-sky-950/80 text-[#A3FF12] border-[#A3FF12]/30';
      case 'video':
        return 'bg-purple-950/80 text-purple-400 border-purple-500/30';
      case 'audio':
        return 'bg-pink-950/80 text-pink-400 border-pink-500/30';
      case 'code':
        return 'bg-indigo-950/80 text-[#A3FF12] border-indigo-500/30';
      default:
        return 'bg-[#1A1A1A] text-[#A0A0A0] border-[#2D2D2D]';
    }
  };

  return (
    <div className="flex flex-wrap gap-2.5 my-2.5">
      {attachments.map((att) => {
        const isImage = att.category === 'image' && att.dataUrl;

        return (
          <div
            key={att.id}
            onClick={() => onPreview && onPreview(att)}
            className={`group relative flex items-center gap-2.5 p-2 rounded-xl bg-[#1A1A1A]/90 hover:bg-[#1A1A1A] border border-[#2D2D2D] hover:border-[#2D2D2D] transition-all ${
              onPreview ? 'cursor-pointer' : ''
            } max-w-xs shadow-sm`}
          >
            {/* Thumbnail or Icon */}
            {isImage ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-[#2D2D2D]/80 bg-[#0F0F0F]">
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#1A1A1A]/90 border border-[#2D2D2D]/70 flex items-center justify-center shrink-0">
                {renderIcon(att.category)}
              </div>
            )}

            {/* File Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[#FFFFFF] truncate group-hover:text-white" title={att.name}>
                  {att.name}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border ${getCategoryBadgeClass(att.category)}`}>
                  {att.category}
                </span>
                <span className="text-[11px] font-mono text-[#A0A0A0]">
                  {formatFileSize(att.size)}
                </span>
              </div>
            </div>

            {/* Actions */}
            {removable && onRemove && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(att.id);
                }}
                className="p-1 rounded-md text-[#A0A0A0] hover:text-red-400 hover:bg-[#1A1A1A]/80 transition-colors"
                title="Remove attachment"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {!removable && att.dataUrl && (
              <a
                href={att.dataUrl}
                download={att.name}
                onClick={(e) => e.stopPropagation()}
                className="p-1 rounded-md text-[#A0A0A0] hover:text-emerald-400 hover:bg-[#1A1A1A]/80 transition-colors"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
};
