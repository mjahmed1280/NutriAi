import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppStore } from './store/useAppStore';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import ChatWindow from './components/ChatWindow';
import HealthSidebar from './components/HealthSidebar';
import ConfirmationModal from './components/ConfirmationModal';
import { geminiService } from './services/geminiService';
import { useState } from 'react';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

function App() {
  const { appState, profile, isSidebarOpen, setSidebarOpen, resetAll, clearSession } = useAppStore();
  const [showResetModal, setShowResetModal] = useState(false);

  // geminiService is initialized by ChatWindow on mount; only re-init needed here after explicit reset

  const handleNewChat = async () => {
    await geminiService.clearSession();
    clearSession();
    if (profile) {
      geminiService.startChat(profile, []);
    }
  };

  const handleConfirmReset = async () => {
    await geminiService.clearSession();
    resetAll();
    setShowResetModal(false);
  };

  return (
    <div className="min-h-screen bg-brand-dark font-body">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0D1F14',
            color: '#F0FDF4',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '12px',
            fontSize: '14px',
          },
        }}
      />

      <AnimatePresence mode="wait">
        {appState === 'landing' && (
          <motion.div key="landing" {...pageVariants}>
            <LandingPage />
          </motion.div>
        )}

        {appState === 'onboarding' && (
          <motion.div key="onboarding" {...pageVariants} className="min-h-screen">
            <Onboarding />
          </motion.div>
        )}

        {appState === 'chat' && profile && (
          <motion.div key="chat" {...pageVariants} className="flex h-screen overflow-hidden">
            <HealthSidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <ChatWindow
                onReset={() => setShowResetModal(true)}
                onNewChat={handleNewChat}
                onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
                isSidebarOpen={isSidebarOpen}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Profile & Data"
        message="Are you sure you want to delete your profile and chat history? This action cannot be undone."
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
}

export default App;
