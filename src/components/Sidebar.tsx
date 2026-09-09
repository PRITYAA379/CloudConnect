import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Mic, 
  Sparkles, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Cpu, 
  LogIn, 
  LogOut, 
  User, 
  RefreshCw, 
  ChevronUp,
  Globe
} from 'lucide-react';
import { ChatSession } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  voiceModeOnly: boolean;
  onToggleVoiceModeOnly: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup' | 'switch') => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggleOpen,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  voiceModeOnly,
  onToggleVoiceModeOnly,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed top-4 left-4 z-40 p-2.5 rounded-2xl bg-[#030611]/90 backdrop-blur-md border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all shadow-xl"
        title="Open sidebar"
        aria-label="Open sidebar"
      >
        <PanelLeftOpen className="w-5 h-5" />
      </button>
    );
  }

  return (
    <aside className="w-72 sm:w-80 h-screen bg-[#02050d] border-r border-white/[0.06] flex flex-col shrink-0 z-30 transition-all">
      {/* Top Brand Header */}
      <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center font-bold shadow-[0_0_20px_rgba(56,189,248,0.25)]">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 tracking-tight"></h1>
            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
              <Cpu className="w-3 h-3 text-sky-400" />
              gemini-3.8-flash
            </span>
          </div>
        </div>

        <button
          onClick={onToggleOpen}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors"
          title="Collapse navigation"
          aria-label="Close sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat & Voice Mode Toggle */}
      <div className="p-4 space-y-2 border-b border-white/[0.06]">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs flex items-center justify-between transition-all shadow-lg shadow-sky-950/40 active:scale-98"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Conversation
          </span>
          <span className="text-[10px] font-mono opacity-80 font-bold">⌘K</span>
        </button>

        {/* Voice-Only Mode Toggle */}
        <button
          onClick={onToggleVoiceModeOnly}
          className={`w-full py-2 px-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
            voiceModeOnly
              ? 'bg-sky-950/60 border-sky-500/50 text-sky-200 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
              : 'bg-zinc-900/40 border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
          }`}
        >
          <span className="flex items-center gap-2 font-medium">
            <Mic className={`w-4 h-4 ${voiceModeOnly ? 'text-sky-400 animate-pulse' : 'text-zinc-500'}`} />
            Voice Mode
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${voiceModeOnly ? 'bg-sky-500 text-zinc-950 font-bold' : 'text-zinc-500'}`}>
            {voiceModeOnly ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
        <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider px-3 py-2">
          Conversations
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-10 px-4 text-xs text-zinc-500 leading-relaxed">
            No past conversations yet.<br />Ask anything or drop a book, document, or image!
          </div>
        ) : (
          sessions.map((session) => {
            const isSelected = session.id === currentSessionId;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group px-3 py-2.5 rounded-xl cursor-pointer text-xs flex items-center justify-between gap-2 transition-all ${
                  isSelected
                    ? 'bg-white/[0.08] text-white font-medium border border-white/10 shadow-sm'
                    : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-sky-400' : 'text-zinc-500'}`} />
                  <span className="truncate">{session.title || 'Untitled Conversation'}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="p-1 hover:text-rose-400 text-zinc-500 rounded transition-colors"
                    title="Delete conversation"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User Profile & Account Footer */}
      <div className="border-t border-white/[0.06] bg-[#02050d] p-3 relative">
        {user ? (
          <div>
            {/* Popover Menu when clicked */}
            {userMenuOpen && (
              <div 
                className="absolute bottom-full left-3 right-3 mb-2 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl p-1.5 space-y-1 z-50 text-xs animate-fade-in"
              >
                <div className="px-3 py-2 border-b border-zinc-800 text-zinc-400">
                  <div className="font-semibold text-zinc-200">{user.name}</div>
                  <div className="text-[10px] text-zinc-400 font-mono truncate">{user.email}</div>
                </div>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-zinc-200 hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
                >
                  <User className="w-4 h-4 text-sky-400" />
                  <span>Account &amp; AI Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenAuth('switch');
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-zinc-200 hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-sky-400" />
                  <span>Switch Account / Demo Users</span>
                </button>

                <div className="border-t border-zinc-800 pt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-rose-400 hover:bg-rose-950/40 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Profile Trigger Card */}
            <div 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover border border-zinc-700 group-hover:border-sky-400/60"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#02050d] rounded-full" />
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-sky-300 transition-colors">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1 font-mono">
                    <span className="text-sky-400 font-semibold">{user.plan}</span>
                    <span>•</span>
                    <span className="truncate">{user.role.split(' ')[0]}</span>
                  </div>
                </div>
              </div>

              <ChevronUp className={`w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        ) : (
          /* When Logged Out or Guest */
          <div className="space-y-2">
            <button
              onClick={() => onOpenAuth('signin')}
              className="w-full py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>

            <button
              onClick={() => onOpenAuth('switch')}
              className="w-full py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
              <span>Explore Demo Accounts</span>
            </button>
          </div>
        )}

        {/* System Status Line */}
        <div className="mt-2 pt-2 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
             Online
          </span>
          <span className="font-mono text-zinc-600">Gemini 3.8</span>
        </div>
      </div>
    </aside>
  );
};
