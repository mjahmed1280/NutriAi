
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import ChatWindow from './components/ChatWindow';
import { UserProfile, Message } from './types';
import { STORAGE_KEYS } from './constants';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load persisted state
    const savedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    const savedHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    setIsInitialized(true);
  }, []);

  const handleProfileComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));
  };

  const handleHistoryUpdate = (newHistory: Message[]) => {
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(newHistory));
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your profile? Your chat history will be cleared.")) {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
      setProfile(null);
      setHistory([]);
    }
  };

  if (!isInitialized) return null;

  return (
    <Layout onReset={handleReset} showReset={!!profile}>
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
