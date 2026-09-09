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
    <div className="mt-3 text-xs border border-sky-500/20 bg-gradient-to-r from-sky-950/30 via-zinc-900/40 to-indigo-950/20 rounded-xl overflow-hidden backdrop-blur-sm transition-all shadow-sm">
      {/* Trigger Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-sky-500/10 text-sky-200 font-medium transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 font-mono text-[11px] shadow-[0_0_12px_rgba(56,189,248,0.15)]">
            <Globe className="w-3 h-3 text-sky-400 animate-pulse" />
            Live Web Grounding
          </span>
          <span className="text-[11px] text-zinc-400">
            {sources.length} verified {sources.length === 1 ? 'source' : 'sources'} retrieved
          </span>
        </div>

        <div className="flex items-center gap-1 text-sky-400/70 hover:text-sky-300">
          <span className="text-[11px] hidden sm:inline">{isOpen ? 'Hide sources' : 'View sources'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Sources Grid */}
      {isOpen && (
        <div className="p-3 border-t border-sky-500/15 bg-zinc-950/60 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map((source, idx) => {
              const domain = getDomain(source.url);
              return (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/80 hover:bg-sky-950/40 border border-zinc-800/80 hover:border-sky-500/40 text-zinc-300 hover:text-sky-200 transition-all group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="truncate text-xs font-medium text-zinc-200 group-hover:text-sky-200">
                      {source.title || source.url}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400 group-hover:text-sky-300 mt-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-sky-400"></span>
                      {domain}
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-zinc-400 group-hover:text-sky-300 transition-colors" />
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
