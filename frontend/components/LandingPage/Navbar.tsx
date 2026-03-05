import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Menu, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const setAppState = useAppStore((s) => s.setAppState);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'backdrop-blur-xl bg-[#04090A]/80 border-b border-white/8 shadow-dark'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <Leaf className="w-4.5 h-4.5 text-emerald-400" size={18} />
          </div>
          <span className="font-display font-700 text-lg text-white tracking-tight">NutriAI</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[['Features', 'features'], ['How it works', 'how-it-works']].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-white/60 hover:text-white transition-colors font-medium"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setAppState('onboarding')}
            className="relative overflow-hidden px-5 py-2 rounded-full bg-amber-500 hover:bg-amber-400 text-[#04090A] text-sm font-bold transition-colors shadow-lg shadow-amber-500/20"
          >
            <span className="relative z-10">Get Started →</span>
          </motion.button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/70 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0D1F14]/95 backdrop-blur-xl border-b border-white/10 px-6 py-4 space-y-3"
        >
          {[['Features', 'features'], ['How it works', 'how-it-works']].map(([label, id]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="block w-full text-left text-sm text-white/70 hover:text-white py-2"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => { setAppState('onboarding'); setMenuOpen(false); }}
            className="block w-full text-center px-5 py-2.5 rounded-full bg-amber-500 text-[#04090A] text-sm font-bold mt-2"
          >
            Get Started →
          </button>
        </motion.div>
      )}
    </motion.header>
  );
}
