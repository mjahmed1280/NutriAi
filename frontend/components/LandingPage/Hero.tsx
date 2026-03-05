import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Leaf, TrendingDown, Zap } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const TYPEWRITER_STRINGS = [
  "What's in this thali?",
  "Plan my keto week.",
  "Is dal good for weight loss?",
  "How much protein in paneer?",
  "Build my meal plan.",
];

function useTypewriter(strings: string[], speed = 60, pause = 2000) {
  const [idx, setIdx] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const target = strings[idx];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < target.length) {
      timer = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), speed);
    } else if (!deleting && displayed.length === target.length) {
      timer = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), speed / 2);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setIdx((i) => (i + 1) % strings.length);
    }

    return () => clearTimeout(timer);
  }, [displayed, deleting, idx, strings, speed, pause]);

  return displayed;
}

// Floating mock chat card
function MockChatCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="animate-float"
    >
      <div className="relative w-80 rounded-2xl overflow-hidden border border-white/12 shadow-[0_32px_80px_rgba(0,0,0,0.6)]"
        style={{ background: 'linear-gradient(160deg, #0D1F14 0%, #0A1810 100%)' }}>
        {/* Card header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8">
          <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center">
            <Leaf size={13} className="text-emerald-400" />
          </div>
          <span className="text-xs font-semibold text-white/80">NutriAI</span>
          <div className="ml-auto flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-white/20" />
            ))}
          </div>
        </div>

        {/* Food image */}
        <div className="mx-4 mt-4 rounded-xl overflow-hidden h-28 relative bg-emerald-950/50 border border-emerald-900/30">
          <img
            src="/friedrice-egg-vegies.jpg"
            alt="Egg Fried Rice with Veggies"
            className="w-full h-full object-cover opacity-90"
          />
          {/* Scan line animation */}
          <div className="absolute inset-x-0 h-px bg-emerald-400/60 top-0 scanning-bar" style={{ animationDuration: '2s' }} />
        </div>

        {/* Analysis results */}
        <div className="px-4 py-3 space-y-2">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Detected: Egg Fried Rice with Veggies</p>
          {[
            { label: 'Calories', value: '450 kcal', color: 'text-amber-400' },
            { label: 'Protein', value: '15g', color: 'text-blue-400' },
            { label: 'Carbs', value: '65g', color: 'text-orange-400' },
            { label: 'Fat', value: '12g', color: 'text-purple-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-xs text-white/50">{label}</span>
              <span className={`text-xs font-bold font-mono ${color}`}>{value}</span>
            </div>
          ))}

          {/* Progress bar */}
          <div className="pt-2 border-t border-white/8">
            <div className="flex justify-between text-[10px] mb-1.5">
              <span className="text-white/40">Vs. your daily goal</span>
              <span className="text-emerald-400 font-bold">64%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '64%' }}
                transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
              />
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="px-4 pb-4 flex gap-2 flex-wrap">
          {['Add paneer for protein', 'View weekly plan'].map((s) => (
            <span key={s} className="text-[9px] px-2 py-1 rounded-full bg-emerald-900/50 text-emerald-300 border border-emerald-800/50">
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};
const item = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const typewritten = useTypewriter(TYPEWRITER_STRINGS);
  const setAppState = useAppStore((s) => s.setAppState);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#04090A]">
      {/* Ambient orbs */}
      <div className="orb w-[600px] h-[600px] bg-emerald-600/20 -top-40 -left-40" style={{ animationDelay: '0s' }} />
      <div className="orb w-[500px] h-[500px] bg-teal-600/15 bottom-0 right-0" style={{ animationDelay: '3s' }} />
      <div className="orb w-[300px] h-[300px] bg-amber-600/10 top-20 right-1/3" style={{ animationDelay: '5s' }} />

      {/* Dot grid overlay */}
      <div className="absolute inset-0 bg-dot-grid bg-dot-grid opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-8 lg:px-20 pt-32 pb-20 flex flex-col lg:flex-row items-center gap-16 w-full">
        {/* Left — Text */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex-1 max-w-2xl"
        >
          {/* Eyebrow badge */}
          <motion.div variants={item} className="inline-flex items-center gap-2 mb-6">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold tracking-wide">
              {/* <img src="/gemini-star.png" alt="Gemini" className="h-4 w-auto rounded" /> */}
              POWERED BY GOOGLE GEMINI 3
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={item}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-800 leading-[1.05] tracking-tight text-white mb-4"
          >
            Your AI nutritionist
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              that sees what
            </span>
            <br />
            you eat.
          </motion.h1>

          {/* Typewriter */}
          <motion.div variants={item} className="mb-6 h-8 flex items-center">
            <span className="text-lg text-white/40 font-medium">
              "
              <span className="text-emerald-300">{typewritten}</span>
              <span className="cursor" />
              "
            </span>
          </motion.div>

          {/* Sub-copy */}
          <motion.p variants={item} className="text-base text-white/55 leading-relaxed mb-10 max-w-lg">
            Snap a photo of any meal — or just ask. NutriAI gives you an instant macro breakdown,
            personalized to your goals, allergies, and diet. No guesswork.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={item} className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(245,158,11,0.35)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setAppState('onboarding')}
              className="px-7 py-3.5 rounded-full bg-amber-500 hover:bg-amber-400 text-[#04090A] font-bold text-base transition-colors shadow-lg shadow-amber-500/25"
            >
              Start Free →
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-7 py-3.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-medium text-base transition-colors"
            >
              See how it works ↓
            </motion.button>
          </motion.div>

          {/* Trust line */}
          <motion.p variants={item} className="mt-8 text-xs text-white/25">
            No sign-up required · Runs in your browser · Data stays with you
          </motion.p>
        </motion.div>

        {/* Right — Floating card */}
        <div className="flex-1 flex justify-center lg:justify-end">
          <MockChatCard />
        </div>
      </div>
    </section>
  );
}
