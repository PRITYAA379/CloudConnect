import React, { useState } from 'react';
import { 
  MapPin, 
  Star, 
  Clock, 
  Navigation, 
  ExternalLink, 
  Copy, 
  Check, 
  Phone, 
  Globe, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  Map as MapIcon
} from 'lucide-react';
import { GoogleMapsBusiness } from '../types';

interface GoogleMapsBusinessCardProps {
  business: GoogleMapsBusiness;
  onOpenMapModal?: (business: GoogleMapsBusiness) => void;
}

export const GoogleMapsBusinessCard: React.FC<GoogleMapsBusinessCardProps> = ({
  business,
  onOpenMapModal,
}) => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showHours, setShowHours] = useState(false);

  const handleCopyAddress = () => {
    const addr = business.formattedAddress || business.address || business.name;
    navigator.clipboard.writeText(addr);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Ensure Google Maps deep link has attribution parameter
  const getMapsUrl = () => {
    let url = business.googleMapsUri;
    if (!url) {
      const q = encodeURIComponent(`${business.name} ${business.address || business.cityCountry || ''}`);
      url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    }
    const separator = url.includes('?') ? '&' : '?';
    if (!url.includes('utm_campaign=')) {
      return `${url}${separator}utm_campaign=gmp_mcp_codeassist_v1_aistudio`;
    }
    return url;
  };

  const getDirectionsUrl = () => {
    if (business.directionsUri) {
      const sep = business.directionsUri.includes('?') ? '&' : '?';
      return `${business.directionsUri}${sep}utm_campaign=gmp_mcp_codeassist_v1_aistudio`;
    }
    const dest = encodeURIComponent(`${business.name} ${business.formattedAddress || business.address || ''}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${dest}&utm_campaign=gmp_mcp_codeassist_v1_aistudio`;
  };

  return (
    <div className="my-3 rounded-2xl bg-gradient-to-b from-zinc-900/90 via-zinc-950/95 to-zinc-950 border border-white/[0.08] hover:border-sky-500/40 transition-all duration-300 shadow-xl overflow-hidden backdrop-blur-md">
      {/* Top Banner with Category & Rating */}
      <div className="px-4 py-3.5 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-300 font-semibold flex items-center gap-1.5">
              Google Maps Verified Place
            </span>
            {business.category && (
              <span className="text-xs text-zinc-400 block sm:inline sm:before:content-['•'] sm:before:mx-1.5">
                {business.category}
              </span>
            )}
          </div>
        </div>

        {/* Rating and Price Badge */}
        <div className="flex items-center gap-2">
          {business.priceLevel && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-zinc-300 font-mono text-xs font-semibold">
              {business.priceLevel}
            </span>
          )}

          {typeof business.rating === 'number' && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{business.rating.toFixed(1)}</span>
              {business.userRatingCount && (
                <span className="text-[10px] text-zinc-400 font-normal">
                  ({business.userRatingCount.toLocaleString()})
                </span>
              )}
            </div>
          )}

          {business.isOpenNow !== undefined && (
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                business.isOpenNow
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400'
              }`}
            >
              {business.isOpenNow ? 'Open Now' : 'Closed'}
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-3.5">
        {/* Title */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              {business.name}
            </h3>
            {business.cityCountry && (
              <p className="text-xs text-zinc-400 mt-0.5">
                {business.cityCountry}
              </p>
            )}
          </div>

          {onOpenMapModal && (
            <button
              onClick={() => onOpenMapModal(business)}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Open interactive map modal"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Interactive Map</span>
            </button>
          )}
        </div>

        {/* Editorial Summary / Description */}
        {business.editorialSummary && (
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
            {business.editorialSummary}
          </p>
        )}

        {/* Address Row */}
        {(business.formattedAddress || business.address) && (
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs text-zinc-300">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span className="truncate">{business.formattedAddress || business.address}</span>
            </div>
            <button
              onClick={handleCopyAddress}
              className="shrink-0 px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] flex items-center gap-1 transition-colors"
              title="Copy address"
            >
              {copiedAddress ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-zinc-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Key Highlights / Chips */}
        {business.keyHighlights && business.keyHighlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {business.keyHighlights.map((highlight, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] text-zinc-300 flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                {highlight}
              </span>
            ))}
          </div>
        )}

        {/* Review Snippet Quote */}
        {business.reviewsSnippet && (
          <div className="text-xs text-zinc-400 italic border-l-2 border-rose-500/50 pl-3 py-1 bg-white/[0.01] rounded-r-lg">
            "{business.reviewsSnippet}"
          </div>
        )}

        {/* Expandable Hours */}
        {business.openingHours && business.openingHours.length > 0 && (
          <div className="pt-1">
            <button
              onClick={() => setShowHours(!showHours)}
              className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>{showHours ? 'Hide operating hours' : 'View operating schedule'}</span>
              {showHours ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showHours && (
              <div className="mt-2 p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-1 text-xs text-zinc-300 font-mono">
                {business.openingHours.map((line, idx) => (
                  <div key={idx} className="flex justify-between py-0.5 border-b border-zinc-800/40 last:border-0">
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2 flex-wrap border-t border-white/[0.06]">
          <a
            href={getMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-98"
          >
            <MapPin className="w-3.5 h-3.5 fill-current" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3 h-3 stroke-[2.5]" />
          </a>

          <a
            href={getDirectionsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span>Get Directions</span>
          </a>

          {business.websiteUri && (
            <a
              href={business.websiteUri}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Website</span>
            </a>
          )}

          {business.phoneNumber && (
            <a
              href={`tel:${business.phoneNumber}`}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-400" />
              <span>{business.phoneNumber}</span>
            </a>
          )}
        </div>

        {/* Compliance & Grounding Attribution Footnote */}
        <div className="pt-1 text-[10px] text-zinc-500 font-mono flex items-center justify-between flex-wrap gap-2">
          <span>Grounded with Google Maps Platform Data</span>
          <span>Attribution ID: gmp_mcp_codeassist_v1_aistudio</span>
        </div>
      </div>
    </div>
  );
};
