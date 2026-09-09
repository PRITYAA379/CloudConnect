import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Briefcase, 
  Building, 
  ShieldCheck, 
  Sparkles, 
  Key, 
  LogOut, 
  Layers, 
  Mic, 
  Check, 
  Save, 
  RefreshCw, 
  Volume2, 
  HardDrive, 
  Lock, 
  Cpu, 
  Globe, 
  Github, 
  CreditCard,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserPreferences } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSwitchAccount: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=256&q=80',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenSwitchAccount,
}) => {
  const { user, isGuest, updateProfile, updatePreferences, logout } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'usage' | 'security'>('profile');

  // Profile edit states
  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || '');
  const [company, setCompany] = useState(user?.company || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');

  // Preferences states
  const [defaultVoice, setDefaultVoice] = useState<UserPreferences['defaultVoice']>(
    user?.preferences?.defaultVoice || 'Zephyr'
  );
  const [autoVoicePlayback, setAutoVoicePlayback] = useState(
    user?.preferences?.autoVoicePlayback ?? true
  );
  const [streamResponses, setStreamResponses] = useState(
    user?.preferences?.streamResponses ?? true
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  if (!isOpen || !user) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      role,
      company,
      avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSavePreferences = () => {
    updatePreferences({
      defaultVoice,
      autoVoicePlayback,
      streamResponses,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleLogoutClick = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-11 h-11 rounded-xl object-cover border-2 border-emerald-500/50 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-100">{user.name}</h2>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full border ${
                  user.plan === 'Enterprise'
                    ? 'bg-purple-950/80 text-purple-300 border-purple-500/40'
                    : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                }`}>
                  {user.plan} Tier
                </span>
              </div>
              <p className="text-xs text-zinc-400">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenSwitchAccount();
              }}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Switch user account"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Switch Account</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 px-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-4 h-4" />
            Profile &amp; Identity
          </button>

          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'preferences'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Voice &amp; AI Settings
          </button>

          <button
            onClick={() => setActiveTab('usage')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'usage'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Usage &amp; Telemetry
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'security'
                ? 'border-emerald-500 text-emerald-400 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            Security &amp; Logout
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Settings saved successfully!</span>
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Avatar</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(url)}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        avatar === url ? 'border-emerald-500 scale-105 shadow-md' : 'border-zinc-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      {avatar === url && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-emerald-300 drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3 py-2 bg-zinc-950/50 border border-zinc-800/80 rounded-xl text-xs text-zinc-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Job Title / Role</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Organization / Team</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-98"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: PREFERENCES */}
          {activeTab === 'preferences' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  AI Speech Voice Profile
                </label>
                <div className="text-[11px] text-zinc-400 mb-2">
                  Select your preferred natural voice model for conversational audio readbacks:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['Zephyr', 'Aoede', 'Puck', 'Charon', 'Fenrir'] as const).map((voice) => (
                    <button
                      key={voice}
                      onClick={() => setDefaultVoice(voice)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        defaultVoice === voice
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className={`w-3.5 h-3.5 ${defaultVoice === voice ? 'text-emerald-400' : 'text-zinc-500'}`} />
                        <span className="text-xs font-semibold">{voice}</span>
                      </div>
                      {defaultVoice === voice && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-zinc-200">Auto Audio Readout</div>
                    <div className="text-[11px] text-zinc-400">
                      Automatically synthesize and speak answers when sending voice notes
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoVoicePlayback}
                    onChange={(e) => setAutoVoicePlayback(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                  <div>
                    <div className="text-xs font-medium text-zinc-200">Stream Responses</div>
                    <div className="text-[11px] text-zinc-400">
                      Display tokens incrementally for lower perceived latency
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={streamResponses}
                    onChange={(e) => setStreamResponses(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-0"
                  />
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-98"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Voice Preferences</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: USAGE & TELEMETRY */}
          {activeTab === 'usage' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">Messages Sent</div>
                  <div className="text-xl font-bold text-zinc-100 mt-1 font-mono">
                    {user.stats?.messagesSent || 0}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">Voice Notes</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">
                    {user.stats?.voiceNotesRecorded || 0}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">Web Grounding</div>
                  <div className="text-xl font-bold text-sky-400 mt-1 font-mono">
                    {user.stats?.webSearchesPerformed || 0}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">Maps Researched</div>
                  <div className="text-xl font-bold text-rose-400 mt-1 font-mono">
                    {user.stats?.businessesResearched || 0}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase">Storage Read</div>
                  <div className="text-xl font-bold text-zinc-300 mt-1 font-mono">
                    {user.stats?.storageReadMb || 0} MB
                  </div>
                </div>
              </div>

              {/* Connected Cloud Accounts */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                <div className="text-xs font-semibold text-zinc-200">Connected Cloud Identity Providers</div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span>Google Cloud Identity</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      Connected
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Github className="w-4 h-4 text-zinc-300" />
                      <span>GitHub Cloud Org</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SECURITY & LOGOUT */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Session Security</div>
                    <div className="text-[11px] text-zinc-400">Authenticated via token authorization</div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Active Session
                  </span>
                </div>

                <div className="text-[11px] font-mono p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 break-all">
                  Session Token: cc_auth_session_{user.id.slice(0, 10)}...verified
                </div>
              </div>

              {/* Danger Zone: Log Out */}
              <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-red-300">Sign Out of Account</div>
                    <div className="text-[11px] text-zinc-400">
                      Terminate current session. Your chat histories will remain saved under your account.
                    </div>
                  </div>
                </div>

                {confirmLogout ? (
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={handleLogoutClick}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
                    >
                      Confirm Sign Out
                    </button>
                    <button
                      onClick={() => setConfirmLogout(false)}
                      className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmLogout(true)}
                    className="py-2 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
