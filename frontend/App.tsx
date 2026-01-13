import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Onboarding from './components/Onboarding';
import ChatWindow from './components/ChatWindow';
import ConfirmationModal from './components/ConfirmationModal';
import HealthSidebar from './components/HealthSidebar';
import { UserProfile, Message } from './types';
import { geminiService } from './services/geminiService';
import { STORAGE_KEYS } from './constants';

function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed
  const [key, setKey] = useState(0); // To force re-render components on reset/new chat

  useEffect(() => {
    // Load persisted data
    const savedProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    const savedHistory = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
      setIsSidebarOpen(true); // Open sidebar by default if profile exists
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(newProfile));
    setIsSidebarOpen(true);
  };

  const handleHistoryUpdate = (messages: Message[]) => {
    setHistory(messages);
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
  };

  const handleNewChat = async () => {
    await geminiService.clearSession();
    setHistory([]);
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    setKey(prev => prev + 1); // Force chat window to re-mount/reset
  };

  const handleResetProfile = () => {
    setShowResetModal(true);
  };

  const confirmReset = async () => {
    await geminiService.clearSession();
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    setProfile(null);
    setHistory([]);
    setIsSidebarOpen(false);
    setShowResetModal(false);
    setKey(prev => prev + 1);
  };

  return (
    <>
      <Layout 
        showActions={!!profile} 
        onReset={handleResetProfile}
        onNewChat={handleNewChat}
      >
        {!profile ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <ChatWindow 
            key={key}
            profile={profile} 
            initialHistory={history}
            onHistoryUpdate={handleHistoryUpdate}
          />
        )}
      </Layout>

      {/* Right Sidebar - only show if profile exists */}
      <HealthSidebar 
        profile={profile} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Profile & Data"
        message="Are you sure you want to delete your profile and chat history? This action cannot be undone."
        onConfirm={confirmReset}
        onCancel={() => setShowResetModal(false)}
      />
    </>
  );
}

export default App;
