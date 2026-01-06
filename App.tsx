
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import ChatWindow from './components/ChatWindow';
import ConfirmationModal from './components/ConfirmationModal';
import { UserProfile, Message } from './types';
import { STORAGE_KEYS } from './constants';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      const savedHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);

      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Failed to load local storage", e);
    }
    setIsInitialized(true);
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));
  };

  const handleHistoryUpdate = useCallback((newHistory: Message[]) => {
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(newHistory));
  }, []);

  const handleNewChat = useCallback(() => {
    setModalState({
      isOpen: true,
      title: 'Start New Chat?',
      message: 'Your profile settings will be saved, but the current conversation will be cleared.',
      onConfirm: () => {
        geminiService.clearSession();
        setHistory([]);
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
        showToast("New chat started");
        setModalState(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, []);

  const handleReset = useCallback(() => {
    setModalState({
      isOpen: true,
      title: 'Reset Profile?',
      message: 'This will wipe all your data, profile settings, and chat history. You will need to re-onboard.',
      onConfirm: () => {
        showToast("Reset profile is clicked");
        localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
        geminiService.clearSession();
        setProfile(null);
        setHistory([]);
        setModalState(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, []);

  if (!isInitialized) return null;

  return (
    <Layout 
      onReset={handleReset} 
      onNewChat={handleNewChat}
      showActions={!!profile}
    >
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-medium shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {toast}
        </div>
      )}

      <ConfirmationModal 
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm}
        onCancel={() => setModalState(prev => ({ ...prev, isOpen: false }))}
      />

      {!profile ? (
        <Onboarding onComplete={handleProfileComplete} />
      ) : (
        <ChatWindow 
          profile={profile} 
          initialHistory={history}
          onHistoryUpdate={handleHistoryUpdate}
        />
      )}
    </Layout>
  );
};

export default App;
