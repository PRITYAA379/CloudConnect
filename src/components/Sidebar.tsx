import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Layers, 
  Mic, 
  Sparkles, 
  PanelLeftClose, 
  PanelLeftOpen,
  Settings2,
  Cpu,
  LogIn,
  LogOut,
  User,
  RefreshCw,
  ChevronUp,
  Shield
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
  onOpenConnectors: () => void;
  voiceModeOnly: boolean;
  onToggleVoiceModeOnly: () => void;
  activeConnectorCount: number;
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
  onOpenConnectors,
  voiceModeOnly,
  onToggleVoiceModeOnly,
  activeConnectorCount,
  onOpenAuth,
  onOpenProfile,
}) => {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={onToggleOpen}
        className="fixed top-4 left-4 z-40 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors shadow-lg"
        title="Open sidebar"
        aria-label="Open sidebar"
      >
        <PanelLeftOpen className="w-5 h-5" />
      </button>
    );
  }

  return (
    <aside className="w-72 h-screen bg-zinc-950 border-r border-zinc-800/80 flex flex-col shrink-0 z-30 transition-all">
      {/* Top Header */}
      <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-zinc-950 flex items-center justify-center font-bold shadow-md">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 tracking-tight">CloudConnect AI</h1>
            <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              gemini-3.8-flash
            </span>
          </div>
        </div>

        <button
          onClick={onToggleOpen}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title="Close sidebar"
          aria-label="Close sidebar"
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* New Chat & Quick Actions */}
      <div className="p-3 space-y-2 border-b border-zinc-800/60">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs flex items-center justify-between transition-all shadow-md active:scale-98"
        >
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Conversation
          </span>
          <span className="text-[10px] font-mono opacity-80">⌘K</span>
        </button>

        {/* Connectors Hub trigger */}
        <button
          onClick={onOpenConnectors}
          className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800 text-zinc-200 text-xs flex items-center justify-between transition-colors"
        >
          <span className="flex items-center gap-2 font-medium">
            <Layers className="w-4 h-4 text-emerald-400" />
            Connectors &amp; Plugins
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-semibold border border-emerald-500/30">
            {activeConnectorCount}
          </span>
        </button>

        {/* Voice-Only Mode Toggle */}
        <button
          onClick={onToggleVoiceModeOnly}
          className={`w-full py-2 px-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
            voiceModeOnly
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
        >
          <span className="flex items-center gap-2 font-medium">
            <Mic className={`w-4 h-4 ${voiceModeOnly ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
            Voice-Only Mode
          </span>
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${voiceModeOnly ? 'bg-emerald-500 text-zinc-950 font-bold' : 'text-zinc-500'}`}>
            {voiceModeOnly ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-1">
        <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider px-2 py-1">
          Recent Chats
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-xs text-zinc-500">
            No past chats yet. Start talking or send a voice note!
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
                    ? 'bg-zinc-800/90 text-zinc-100 font-medium border border-zinc-700/70 shadow-sm'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  <span className="truncate">{session.title || 'Untitled Conversation'}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    className="p-1 hover:text-red-400 text-zinc-500 rounded"
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
      <div className="border-t border-zinc-800/80 bg-zinc-950/95 p-3 relative">
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
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Account &amp; AI Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    onOpenAuth('switch');
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-zinc-200 hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span>Switch Account / Demo Users</span>
                </button>

                <div className="border-t border-zinc-800 pt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 rounded-xl text-left text-red-400 hover:bg-red-950/40 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}

            {/* Profile Trigger Card */}
            <div 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="p-2 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover border border-zinc-700 group-hover:border-emerald-500/60"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-zinc-950 rounded-full" />
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-300 transition-colors">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate flex items-center gap-1 font-mono">
                    <span className="text-emerald-400 font-semibold">{user.plan}</span>
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
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>

            <button
              onClick={() => onOpenAuth('switch')}
              className="w-full py-1.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Explore Demo Accounts</span>
            </button>
          </div>
        )}

        {/* System Status Line */}
        <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Voice &amp; Connectors Active
          </span>
          <span className="font-mono text-zinc-600">v2.4</span>
        </div>
      </div>
    </aside>
  );
};
