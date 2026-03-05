import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

interface Stat {
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
}

const STATS: Stat[] = [
  { value: 100, suffix: '+', label: 'Meals Analyzed', prefix: '' },
  { value: 99, suffix: 'ms', label: 'Avg. Response Time', prefix: '<' },
  { value: 2.5, suffix: '', label: 'Vision AI Model', prefix: 'Gemini' },
  { value: 100, suffix: '%', label: 'Edge Powered', prefix: 'Vercel' },
];

function CountUp({ value, prefix, suffix, inView }: { value: number; prefix?: string; suffix: string; inView: boolean }) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString()),
    });
    return controls.stop;
  }, [inView, value]);

  return (
    <span className="font-display font-800 text-4xl text-white">
      {prefix} {display}{suffix}
    </span>
  );
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="bg-[#0D1F14] border-y border-white/8 py-14">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
        {STATS.map(({ value, suffix, label, prefix }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-center"
          >
            {label === 'Vision AI Model' && (
              <img src="/gemini-star.png" alt="Gemini" className="h-7 w-auto mx-auto mb-2 opacity-75 rounded" />
            )}
            <CountUp value={value} prefix={prefix} suffix={suffix} inView={inView} />
            <p className="text-sm text-white/40 mt-1 font-medium">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
