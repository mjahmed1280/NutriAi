
import React from 'react';
import { ICONS, APP_NAME } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  onReset?: () => void;
  showReset?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onReset, showReset }) => {
  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-xl overflow-hidden md:my-4 md:rounded-2xl">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-emerald-600 text-white shrink-0">
        <div className="flex items-center gap-2">
          <ICONS.Leaf className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tight">{APP_NAME}</h1>
        </div>
        {showReset && (
          <button 
            onClick={onReset}
            className="text-sm font-medium hover:bg-emerald-700 px-3 py-1 rounded transition-colors"
          >
            Reset Profile
          </button>
        )}
      </header>
      
      <main className="flex-1 overflow-hidden relative bg-gray-50">
        {children}
      </main>

      <footer className="px-6 py-2 border-t text-[10px] text-gray-400 text-center shrink-0">
        Disclaimer: NutriAI is an AI tool for informational purposes. Not a substitute for professional medical advice.
      </footer>
    </div>
  );
};

export default Layout;
