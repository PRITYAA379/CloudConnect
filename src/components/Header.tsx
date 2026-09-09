import React from 'react';
import { 
  PanelLeftOpen, 
  Mic, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Globe,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  webSearchEnabled: boolean;
  onToggleWebSearch: () => void;
  voiceModeOnly: boolean;
  onToggleVoiceModeOnly: () => void;
  onClearChat: () => void;
  isGlobalVoiceMuted: boolean;
  onToggleVoiceMute: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'switch') => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  webSearchEnabled,
  onToggleWebSearch,
  voiceModeOnly,
  onToggleVoiceModeOnly,
  onClearChat,
  isGlobalVoiceMuted,
  onToggleVoiceMute,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-white/[0.07] bg-[#03060f]/80 backdrop-blur-xl px-5 sm:px-8 flex items-center justify-between z-20 shrink-0 transition-all">
      <div className="flex items-center gap-3 sm:gap-4">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-white/5 transition-all shadow-sm"
            title="Open navigation"
            aria-label="Open navigation"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-sky-500/30 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="text-xs font-semibold tracking-wide text-zinc-200"></span>
            <span className="text-[10px] font-mono text-zinc-500 pl-1 border-l border-zinc-800">Flash 3.8</span>
          </div>

          {/* Voice Mode Active Pill */}
          {voiceModeOnly && (
            <span className="hidden sm:flex items-center gap-1.5 text-[11px] px-3 py-1 rounded-full bg-sky-950/60 border border-sky-400/40 text-sky-300 animate-pulse font-medium shadow-[0_0_12px_rgba(56,189,248,0.2)]">
              <Mic className="w-3 h-3" />
              Voice Mode
            </span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Web Search Grounding Toggle */}
        <button
          onClick={onToggleWebSearch}
          className={`flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-sm ${
            webSearchEnabled
              ? 'bg-sky-950/40 border-sky-500/40 text-sky-200 hover:bg-sky-900/40 shadow-[0_0_15px_rgba(56,189,248,0.15)]'
              : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
          title={webSearchEnabled ? 'Web Grounding is Active (click to disable)' : 'Enable Live Web Grounding'}
        >
          <Globe className={`w-3.5 h-3.5 ${webSearchEnabled ? 'text-sky-400 animate-pulse' : 'text-zinc-500'}`} />
          <span className="hidden md:inline">Web Grounding</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
              webSearchEnabled
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                : 'bg-zinc-800 text-zinc-500'
            }`}
          >
            {webSearchEnabled ? 'Live' : 'Off'}
          </span>
        </button>

        {/* Voice Mode Switcher */}
        <button
          onClick={onToggleVoiceModeOnly}
          className={`p-2 sm:p-2.5 rounded-xl border text-xs transition-colors ${
            voiceModeOnly
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
              : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 border-white/[0.08] hover:bg-white/5'
          }`}
          title={voiceModeOnly ? 'Disable Voice-only mode' : 'Enable Voice-only mode'}
          aria-label="Toggle voice only mode"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Global TTS Audio Read Aloud Mute Toggle */}
        <button
          onClick={onToggleVoiceMute}
          className={`p-2 sm:p-2.5 rounded-xl border text-xs transition-colors ${
            isGlobalVoiceMuted
              ? 'bg-zinc-900/60 text-zinc-500 border-white/[0.08]'
              : 'bg-zinc-900/70 text-sky-400 border-white/[0.08] hover:bg-white/5'
          }`}
          title={isGlobalVoiceMuted ? 'Unmute AI Voice Readout' : 'Mute AI Voice Readout'}
          aria-label="Toggle AI audio readout"
        >
          {isGlobalVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Clear Chat */}
        <button
          onClick={onClearChat}
          className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-white/[0.08] text-zinc-400 hover:text-rose-400 transition-colors"
          title="Clear conversation"
          aria-label="Clear chat messages"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-white/[0.08] mx-1 hidden sm:block" />

        {/* User Profile or Sign In */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 p-1 pl-1.5 pr-3 rounded-xl bg-zinc-900/70 hover:bg-zinc-800/80 border border-white/[0.08] hover:border-sky-500/40 transition-all group"
            title="Open Account & Settings"
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-7 h-7 rounded-lg object-cover border border-zinc-700 group-hover:border-sky-400/50"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-zinc-950 rounded-full" />
            </div>
            <div className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-xs font-medium text-zinc-200 group-hover:text-sky-200 transition-colors">
                {user.name.split(' ')[0]}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">{user.plan}</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth('signin')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs transition-all shadow-md active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
