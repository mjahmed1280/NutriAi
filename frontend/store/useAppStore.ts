import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, Message } from '../types';

export type AppState = 'landing' | 'onboarding' | 'chat';

interface AppStore {
  appState: AppState;
  profile: UserProfile | null;
  messages: Message[];
  waterCount: number;
  isSidebarOpen: boolean;

  setAppState: (state: AppState) => void;
  setProfile: (profile: UserProfile) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateLastMessage: (updater: (msg: Message) => Message) => void;
  clearSession: () => void;
  resetAll: () => void;
  setWaterCount: (count: number) => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      appState: 'landing',
      profile: null,
      messages: [],
      waterCount: 0,
      isSidebarOpen: false,

      setAppState: (appState) => set({ appState }),

      setProfile: (profile) =>
        set({ profile, appState: 'chat', isSidebarOpen: true }),

      setMessages: (messages) => set({ messages }),

      addMessage: (message) =>
        set((s) => ({ messages: [...s.messages, message] })),

      updateLastMessage: (updater) =>
        set((s) => {
          const msgs = [...s.messages];
          if (msgs.length === 0) return s;
          msgs[msgs.length - 1] = updater(msgs[msgs.length - 1]);
          return { messages: msgs };
        }),

      clearSession: () => set({ messages: [] }),

      resetAll: () =>
        set({
          profile: null,
          messages: [],
          appState: 'landing',
          isSidebarOpen: false,
          waterCount: 0,
        }),

      setWaterCount: (waterCount) => set({ waterCount }),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
    }),
    {
      name: 'nutri-ai-store',
      partialize: (state) => ({
        profile: state.profile,
        messages: state.messages,
        appState: state.appState === 'onboarding' ? 'landing' : state.appState,
        waterCount: state.waterCount,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
