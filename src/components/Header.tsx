import React from 'react';
import { 
  PanelLeftOpen, 
  Layers, 
  Mic, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Sparkles,
  ChevronDown,
  User,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeConnectorCount: number;
  onOpenConnectors: () => void;
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
  activeConnectorCount,
  onOpenConnectors,
  voiceModeOnly,
  onToggleVoiceModeOnly,
  onClearChat,
  isGlobalVoiceMuted,
  onToggleVoiceMute,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="h-14 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Open sidebar"
            aria-label="Open sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-zinc-200">CloudConnect AI</span>
            <span className="text-[10px] font-mono text-zinc-500 ml-1">3.8 Flash</span>
          </div>

          {/* Voice Mode Badge */}
          {voiceModeOnly && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 animate-pulse font-medium">
              <Mic className="w-3 h-3" />
              Voice Mode Active
            </span>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Connectors Hub button */}
        <button
          onClick={onOpenConnectors}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/40 text-zinc-300 text-xs font-medium transition-all shadow-sm group"
        >
          <Layers className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Connectors</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
            {activeConnectorCount}
          </span>
        </button>

        {/* Voice Mode Switcher */}
        <button
          onClick={onToggleVoiceModeOnly}
          className={`p-2 rounded-xl border text-xs transition-colors ${
            voiceModeOnly
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:bg-zinc-800'
          }`}
          title={voiceModeOnly ? 'Disable Voice-only mode' : 'Enable Voice-only mode'}
          aria-label="Toggle voice only mode"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Global TTS Audio Read Aloud Mute Toggle */}
        <button
          onClick={onToggleVoiceMute}
          className={`p-2 rounded-xl border text-xs transition-colors ${
            isGlobalVoiceMuted
              ? 'bg-zinc-900 text-zinc-500 border-zinc-800'
              : 'bg-zinc-900 text-emerald-400 border-zinc-800 hover:bg-zinc-800'
          }`}
          title={isGlobalVoiceMuted ? 'Unmute AI Voice Readout' : 'Mute AI Voice Readout'}
          aria-label="Toggle AI audio readout"
        >
          {isGlobalVoiceMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Clear Chat */}
        <button
          onClick={onClearChat}
          className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-red-400 transition-colors"
          title="Clear current messages"
          aria-label="Clear chat messages"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-zinc-800 mx-1 hidden sm:block" />

        {/* User Profile or Sign In */}
        {user ? (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/40 transition-all group"
            title="Open Account & Settings"
          >
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-lg object-cover border border-zinc-700 group-hover:border-emerald-500/50"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 border border-zinc-950 rounded-full" />
            </div>
            <div className="hidden md:flex flex-col items-start leading-none">
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-300 transition-colors">
                {user.name.split(' ')[0]}
              </span>
              <span className="text-[9px] font-mono text-zinc-400 mt-0.5">{user.plan}</span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => onOpenAuth('signin')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-sm active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
