import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAppStore } from '../../store/useAppStore';

export default function FinalCTA() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const setAppState = useAppStore((s) => s.setAppState);

  return (
    <section className="relative bg-[#0D1F14] py-28 overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[500px] h-[500px] bg-emerald-600/20 -top-20 left-1/2 -translate-x-1/2" />
      <div className="absolute inset-0 bg-noise pointer-events-none" />

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-3xl mx-auto px-6 text-center"
      >
        <h2 className="font-display font-800 text-4xl md:text-6xl text-white tracking-tight leading-tight mb-6">
          Start eating smarter{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">
            today.
          </span>
        </h2>
        <p className="text-white/50 text-lg mb-10">
          Your personal AI nutritionist is one click away.
        </p>

        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 48px rgba(245,158,11,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setAppState('onboarding')}
          className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-amber-500 hover:bg-amber-400 text-[#04090A] font-bold text-lg transition-colors shadow-xl shadow-amber-500/25"
        >
          Build My Profile — It's Free →
        </motion.button>

        <p className="mt-6 text-xs text-white/25">
          No sign-up required · Powered by Google Gemini 2.5 Flash Lite · Hosted on Vercel Edge
        </p>

        <p className="mt-10 text-[10px] text-white/20 max-w-sm mx-auto">
          Disclaimer: NutriAI is an AI tool for informational purposes only.
          Not a substitute for professional medical or dietary advice.
        </p>
      </motion.div>
    </section>
  );
}
