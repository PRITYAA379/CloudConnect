import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Star, 
  Clock, 
  Copy, 
  Check, 
  Info,
  Maximize2,
  Minimize2,
  Compass
} from 'lucide-react';
import { GoogleMapsBusiness } from '../types';

interface GoogleMapsModalProps {
  business: GoogleMapsBusiness | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleMapsModal: React.FC<GoogleMapsModalProps> = ({
  business,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen || !business) return null;

  const searchQuery = encodeURIComponent(
    `${business.name} ${business.formattedAddress || business.address || business.cityCountry || ''}`
  );

  // Canonical Google Maps deep links with mandatory attribution parameter
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}&utm_campaign=gmp_mcp_codeassist_v1_aistudio`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${searchQuery}&utm_campaign=gmp_mcp_codeassist_v1_aistudio`;
  
  // Interactive Google Maps Embed URL
  const embedUrl = `https://maps.google.com/maps?q=${searchQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handleCopy = () => {
    const textToCopy = `${business.name}\n${business.formattedAddress || business.address || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className={`w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-w-6xl h-[92vh]' : 'max-w-4xl max-h-[88vh]'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-950/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-zinc-100 truncate">
                  {business.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20 hidden sm:inline-block">
                  Google Maps Grounded
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                {business.formattedAddress || business.address || business.cityCountry || 'Global Business Research'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors hidden sm:flex"
              title={isExpanded ? 'Standard view' : 'Maximize map'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Interactive Map Iframe */}
          <div className="flex-1 min-h-[300px] md:min-h-[420px] bg-zinc-950 relative">
            <iframe
              title={`Google Map - ${business.name}`}
              src={embedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              allowFullScreen
            />
            
            {/* Quick overlay badge */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-md text-[11px] font-mono text-zinc-300 flex items-center gap-2 shadow-lg">
              <Compass className="w-3.5 h-3.5 text-rose-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Interactive Earth Navigation</span>
            </div>
          </div>

          {/* Details Sidebar */}
          <div className="w-full md:w-80 p-5 bg-zinc-950/60 border-t md:border-t-0 md:border-l border-zinc-800 space-y-4 shrink-0 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Rating & Status */}
              <div className="flex items-center justify-between gap-2">
                {typeof business.rating === 'number' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold">{business.rating.toFixed(1)}</span>
                    {business.userRatingCount && (
                      <span className="text-[11px] text-zinc-400 font-normal">
                        ({business.userRatingCount.toLocaleString()} reviews)
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400">Google Maps Place</span>
                )}

                {business.isOpenNow !== undefined && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      business.isOpenNow
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    {business.isOpenNow ? 'Open Now' : 'Closed'}
                  </span>
                )}
              </div>

              {/* Address with copy */}
              {(business.formattedAddress || business.address) && (
                <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5 text-xs">
                  <div className="text-[10px] uppercase font-mono text-zinc-500">Verified Address</div>
                  <div className="text-zinc-200 leading-relaxed">
                    {business.formattedAddress || business.address}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="mt-1 text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied to clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy address details</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Editorial / highlights */}
              {business.editorialSummary && (
                <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/40 p-3 rounded-xl border border-zinc-800/60">
                  {business.editorialSummary}
                </div>
              )}

              {/* Operating Hours preview if available */}
              {business.openingHours && business.openingHours.length > 0 && (
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 space-y-1 text-xs text-zinc-300">
                  <div className="text-[10px] uppercase font-mono text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Operating Schedule</span>
                  </div>
                  <div className="space-y-1 pt-1 font-mono text-[11px]">
                    {business.openingHours.slice(0, 4).map((h, i) => (
                      <div key={i} className="text-zinc-400 truncate">{h}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Launch Actions */}
            <div className="space-y-2 pt-4 border-t border-zinc-800">
              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
              >
                <MapPin className="w-3.5 h-3.5 fill-current" />
                <span>Open in Official Google Maps</span>
                <ExternalLink className="w-3 h-3 stroke-[2.5]" />
              </a>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-400" />
                <span>Navigate &amp; Directions</span>
              </a>

              {/* Compliance & Cost Notice */}
              <div className="pt-2 text-[10px] text-zinc-500 leading-normal space-y-1">
                <div className="flex items-start gap-1">
                  <Info className="w-3 h-3 text-zinc-400 shrink-0 mt-0.5" />
                  <span>
                    Grounded with Google Maps Platform API. Data attributed under ID <code className="text-zinc-400 font-mono">gmp_mcp_codeassist_v1_aistudio</code>.
                  </span>
                </div>
                <div className="text-zinc-500 text-[9px]">
                  <a
                    href="https://developers.google.com/maps/documentation?utm_campaign=gmp_mcp_codeassist_v1_aistudio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-zinc-300 underline"
                  >
                    Google Maps Platform Docs
                  </a>
                  {' '}• Prototyping supports free Maps Demo Key.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
