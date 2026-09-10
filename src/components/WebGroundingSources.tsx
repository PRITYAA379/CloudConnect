import React, { useState } from 'react';
import { Globe, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface WebGroundingSourcesProps {
  sources?: Array<{ title: string; url: string }>;
}

export const WebGroundingSources: React.FC<WebGroundingSourcesProps> = ({ sources = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  // Helper to extract clean domain
  const getDomain = (url: string) => {
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return 'web';
    }
  };

  return (
    <div className="mt-3 text-xs border border-[#A3FF12]/20 bg-gradient-to-r from-sky-950/30 via-zinc-900/40 to-indigo-950/20 rounded-xl overflow-hidden backdrop-blur-sm transition-all shadow-sm">
      {/* Trigger Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-[#A3FF12]/10 text-sky-200 font-medium transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#A3FF12]/15 border border-[#A3FF12]/30 text-sky-300 font-mono text-[11px] shadow-[0_0_12px_rgba(56,189,248,0.15)]">
            <Globe className="w-3 h-3 text-[#A3FF12] animate-pulse" />
            Live Web Grounding
          </span>
          <span className="text-[11px] text-[#A0A0A0]">
            {sources.length} verified {sources.length === 1 ? 'source' : 'sources'} retrieved
          </span>
        </div>

        <div className="flex items-center gap-1 text-[#A3FF12]/70 hover:text-sky-300">
          <span className="text-[11px] hidden sm:inline">{isOpen ? 'Hide sources' : 'View sources'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Sources Grid */}
      {isOpen && (
        <div className="p-3 border-t border-[#A3FF12]/15 bg-[#0F0F0F]/60 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map((source, idx) => {
              const domain = getDomain(source.url);
              return (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[#1A1A1A]/80 hover:bg-sky-950/40 border border-[#2D2D2D]/80 hover:border-[#A3FF12]/40 text-[#A0A0A0] hover:text-sky-200 transition-all group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-xs font-medium text-[#FFFFFF] group-hover:text-sky-200">
                      {source.title || source.url}
                    </p>
                    <p className="text-[10px] font-mono text-[#A0A0A0] group-hover:text-sky-300 mt-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-sky-400"></span>
                      {domain}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#A0A0A0] group-hover:text-sky-300 transition-colors" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
