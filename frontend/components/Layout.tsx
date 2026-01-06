
import React from 'react';
import { ICONS, APP_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  onReset?: () => void;
  onNewChat?: () => void;
  showActions?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onReset, onNewChat, showActions }) => {
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl overflow-hidden md:my-4 md:rounded-2xl">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-emerald-600 text-white shrink-0">
        <div className="flex items-center gap-2">
          <ICONS.Leaf className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight">{APP_NAME}</h1>
        </div>
        
        {showActions && (
          <div className="flex items-center gap-2">
             <button 
              type="button"
              onClick={onNewChat}
              className="flex items-center gap-1.5 text-[11px] font-bold bg-white/15 hover:bg-white/25 px-3 py-2 rounded-xl border border-white/20 transition-all active:scale-95"
              title="Start a fresh conversation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v6"/><path d="M9 10h6"/></svg>
              New Chat
            </button>
            <button 
              type="button"
              onClick={onReset}
              className="text-[11px] font-bold bg-emerald-700/80 hover:bg-red-500/90 px-3 py-2 rounded-xl border border-white/10 transition-all active:scale-95 shadow-sm"
              title="Wipe all profile data"
            >
              Reset Profile
            </button>
          </div>
        )}
      </header>
      
      <main className="flex-1 overflow-hidden relative bg-gray-50">
        {children}
      </main>

      <footer className="px-6 py-2 border-t text-[10px] text-gray-400 text-center shrink-0 bg-gray-50">
        Disclaimer: NutriAI is an AI tool for informational purposes. Not a substitute for professional medical advice.
      </footer>
    </div>
  );
};

export default Layout;
