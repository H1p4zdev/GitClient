import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  company?: string;
  blog?: string;
  location?: string;
  email?: string;
  twitter_username?: string;
  created_at: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'gitmobile-storage',
    }
  )
);
