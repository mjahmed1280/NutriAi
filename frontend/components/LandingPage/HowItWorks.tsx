import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { UserCheck, MessageSquare, Sparkles } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: <UserCheck size={24} />,
    title: 'Build your profile',
    description: 'A 2-minute visual wizard. Tell us your goals, diet preference, allergies, and body stats. No boring dropdowns.',
    color: 'emerald',
  },
  {
    number: '02',
    icon: <MessageSquare size={24} />,
    title: 'Chat or snap',
    description: 'Ask anything in plain English or drag a food photo into the chat. The AI sees, understands, and responds instantly.',
    color: 'teal',
  },
  {
    number: '03',
    icon: <Sparkles size={24} />,
    title: 'Get your plan',
    description: 'Personalized meal plans, macro targets, and smart recommendations — all tailored to you, not a generic template.',
    color: 'amber',
  },
];

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string; line: string }> = {
  emerald: { bg: 'bg-emerald-100', border: 'border-emerald-200', text: 'text-emerald-700', glow: 'shadow-emerald-100', line: 'from-emerald-300' },
  teal: { bg: 'bg-teal-100', border: 'border-teal-200', text: 'text-teal-700', glow: 'shadow-teal-100', line: 'from-teal-300' },
  amber: { bg: 'bg-amber-100', border: 'border-amber-200', text: 'text-amber-700', glow: 'shadow-amber-100', line: 'from-amber-300' },
};

export default function HowItWorks() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="how-it-works" className="bg-[#04090A] py-24">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-20"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-900/40 text-emerald-400 border border-emerald-800/60 mb-4">
            How it works
          </span>
          <h2 className="font-display font-800 text-4xl md:text-5xl text-white tracking-tight">
            From zero to your first<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              meal plan in 3 steps.
            </span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {STEPS.map(({ number, icon, title, description, color }, i) => {
              const c = colorMap[color];
              return (
                <motion.div
                  key={number}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.15 + i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step number circle */}
                  <div className="relative mb-6 z-10">
                    <div className={`w-20 h-20 rounded-2xl border ${c.border} ${c.bg} flex items-center justify-center shadow-lg ${c.glow} ${c.text}`}>
                      {icon}
                    </div>
                    <span className="absolute -top-2 -right-2 text-[10px] font-bold text-white/30 bg-[#0D1F14] rounded-full w-6 h-6 flex items-center justify-center border border-white/10">
                      {number}
                    </span>
                  </div>

                  <h3 className="font-display font-700 text-xl text-white mb-3">{title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed max-w-xs">{description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
