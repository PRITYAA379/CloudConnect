import React, { useState } from 'react';
import { MapPin, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface GoogleMapsSourcesProps {
  sources?: Array<{
    title: string;
    url: string;
    snippet?: string;
  }>;
}

export const GoogleMapsSources: React.FC<GoogleMapsSourcesProps> = ({ sources = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 text-xs border border-rose-500/25 bg-gradient-to-r from-rose-950/30 via-zinc-900/40 to-amber-950/20 rounded-xl overflow-hidden backdrop-blur-sm transition-all shadow-sm">
      {/* Trigger Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 flex items-center justify-between gap-2 hover:bg-rose-500/10 text-rose-200 font-medium transition-colors"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 font-mono text-[11px] shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            <MapPin className="w-3 h-3 text-rose-400 animate-pulse" />
            Google Maps Grounding
          </span>
          <span className="text-[11px] text-zinc-400">
            {sources.length} verified place {sources.length === 1 ? 'citation' : 'citations'} retrieved
          </span>
        </div>

        <div className="flex items-center gap-1 text-rose-400/70 hover:text-rose-300">
          <span className="text-[11px] hidden sm:inline">{isOpen ? 'Hide citations' : 'View place citations'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Sources Grid */}
      {isOpen && (
        <div className="p-3 border-t border-rose-500/20 bg-zinc-950/80 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sources.map((source, idx) => {
              // Append compliance attribution tracking if missing
              let finalUrl = source.url;
              if (finalUrl && !finalUrl.includes('utm_campaign=')) {
                finalUrl += (finalUrl.includes('?') ? '&' : '?') + 'utm_campaign=gmp_mcp_codeassist_v1_aistudio';
              }

              return (
                <a
                  key={idx}
                  href={finalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/80 hover:bg-rose-950/40 border border-zinc-800/80 hover:border-rose-500/40 text-zinc-300 hover:text-rose-200 transition-all group"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-medium text-zinc-200 group-hover:text-rose-300 truncate">
                      {source.title || 'Google Maps Verified Place'}
                    </div>
                    {source.snippet ? (
                      <div className="text-[10px] text-zinc-400 truncate mt-0.5">
                        {source.snippet}
                      </div>
                    ) : (
                      <div className="text-[10px] text-rose-400/80 font-mono mt-0.5 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        <span>maps.google.com</span>
                      </div>
                    )}
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-rose-400 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              );
            })}
          </div>

          <div className="pt-1 text-[10px] text-zinc-500 font-mono flex items-center justify-between">
            <span>Authoritative Google Maps Platform Reference</span>
            <span>ID: gmp_mcp_codeassist_v1_aistudio</span>
          </div>
        </div>
      )}
    </div>
  );
};
