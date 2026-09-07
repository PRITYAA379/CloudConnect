import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserPreferences } from '../types';
import { DEMO_USERS, GUEST_USER } from '../data/users';

const STORAGE_KEY_AUTH_USER = 'cloudconnect_auth_user_v1';
const STORAGE_KEY_ALL_USERS = 'cloudconnect_registered_users_v1';
const STORAGE_KEY_AUTH_TOKEN = 'cloudconnect_auth_token_v1';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  allUsers: UserProfile[];
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    name: string;
    email: string;
    password?: string;
    role?: string;
    company?: string;
    avatar?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loginAsGuest: () => void;
  loginAsDemoUser: (userId: string) => void;
  updateProfile: (updated: Partial<UserProfile>) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
  incrementStat: (
    statKey: 'messagesSent' | 'voiceNotesRecorded' | 'connectorsExecuted' | 'storageReadMb' | 'filesUploaded',
    amount?: number
  ) => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (saved) {
        return JSON.parse(saved);
      }
      // Default to Preet Jagtap (first user, matching metadata email)
      return DEMO_USERS[0];
    } catch (e) {
      return DEMO_USERS[0];
    }
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALL_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure pre-built demo users always exist
        const existingIds = new Set(parsed.map((u: UserProfile) => u.id));
        const merged = [...parsed];
        for (const demo of DEMO_USERS) {
          if (!existingIds.has(demo.id)) {
            merged.push(demo);
          }
        }
        return merged;
      }
    } catch (e) {
      console.warn('Failed reading users from storage');
    }
    return DEMO_USERS;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTH_TOKEN) || 'token_session_verified';
  });

  // Sync state to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ALL_USERS, JSON.stringify(allUsers));
  }, [allUsers]);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    
    // Simulate brief network latency
    await new Promise((r) => setTimeout(r, 400));

    // Try finding user in registered users list or demo users
    const matched = allUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (matched) {
      setUser(matched);
      const fakeToken = `token_${matched.id}_${Date.now()}`;
      setToken(fakeToken);
      localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, fakeToken);
      return { success: true };
    }

    // If not found in demo users, create a new registered profile for this email
    const namePart = email.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: formattedName,
      email: cleanEmail,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80`,
      role: 'Cloud Developer',
      company: 'Enterprise Cloud',
      plan: 'Pro',
      createdAt: new Date().toISOString().split('T')[0],
      preferences: {
        defaultVoice: 'Zephyr',
        autoVoicePlayback: true,
        streamResponses: true,
        theme: 'dark',
        favoriteConnectors: ['google-search', 'code-sandbox', 'cloud-storage'],
      },
      stats: {
        messagesSent: 0,
        voiceNotesRecorded: 0,
        connectorsExecuted: 0,
        storageReadMb: 0,
      },
      connectedAccounts: {
        google: true,
        github: true,
        aws: false,
        slack: false,
      },
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setUser(newUser);
    const newToken = `token_${newUser.id}_${Date.now()}`;
    setToken(newToken);
    localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, newToken);
    return { success: true };
  };

  const signup = async (userData: {
    name: string;
    email: string;
    password?: string;
    role?: string;
    company?: string;
    avatar?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = userData.email.trim().toLowerCase();

    // Check if user already exists
    if (allUsers.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    await new Promise((r) => setTimeout(r, 450));

    const newUser: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name.trim() || 'Cloud Engineer',
      email: cleanEmail,
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      role: userData.role || 'Cloud Engineer',
      company: userData.company || 'Cloud Enterprise',
      plan: 'Pro',
      createdAt: new Date().toISOString().split('T')[0],
      preferences: {
        defaultVoice: 'Zephyr',
        autoVoicePlayback: true,
        streamResponses: true,
        theme: 'dark',
        favoriteConnectors: ['google-search', 'code-sandbox', 'cloud-storage'],
      },
      stats: {
        messagesSent: 0,
        voiceNotesRecorded: 0,
        connectorsExecuted: 0,
        storageReadMb: 0,
      },
      connectedAccounts: {
        google: true,
        github: false,
        aws: false,
        slack: false,
      },
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setUser(newUser);
    const newToken = `token_${newUser.id}_${Date.now()}`;
    setToken(newToken);
    localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, newToken);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    localStorage.removeItem(STORAGE_KEY_AUTH_TOKEN);
  };

  const loginAsGuest = () => {
    setUser(GUEST_USER);
    setToken('guest_token');
    localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, 'guest_token');
  };

  const loginAsDemoUser = (userId: string) => {
    const target = allUsers.find((u) => u.id === userId) || DEMO_USERS.find((u) => u.id === userId);
    if (target) {
      setUser(target);
      const newToken = `token_${target.id}_${Date.now()}`;
      setToken(newToken);
      localStorage.setItem(STORAGE_KEY_AUTH_TOKEN, newToken);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const merged: UserProfile = { ...user, ...updated };
    setUser(merged);
    setAllUsers((prev) => prev.map((u) => (u.id === merged.id ? merged : u)));
  };

  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    if (!user) return;
    const merged: UserProfile = {
      ...user,
      preferences: { ...user.preferences, ...prefs },
    };
    setUser(merged);
    setAllUsers((prev) => prev.map((u) => (u.id === merged.id ? merged : u)));
  };

  const incrementStat = (
    statKey: 'messagesSent' | 'voiceNotesRecorded' | 'connectorsExecuted' | 'storageReadMb',
    amount = 1
  ) => {
    if (!user) return;
    const updatedStats = {
      ...user.stats,
      [statKey]: (user.stats[statKey] || 0) + amount,
    };
    const merged: UserProfile = { ...user, stats: updatedStats };
    setUser(merged);
    setAllUsers((prev) => prev.map((u) => (u.id === merged.id ? merged : u)));
  };

  const isGuest = user?.id === GUEST_USER.id;
  const isAuthenticated = user !== null && !isGuest;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isGuest,
        allUsers,
        login,
        signup,
        logout,
        loginAsGuest,
        loginAsDemoUser,
        updateProfile,
        updatePreferences,
        incrementStat,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
