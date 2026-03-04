import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Camera, Target, BarChart2, Dna, Apple, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const MACRO_DATA = [
  { name: 'Protein', value: 28, color: '#3B82F6' },
  { name: 'Carbs', value: 72, color: '#F59E0B' },
  { name: 'Fat', value: 22, color: '#8B5CF6' },
];

function MiniPieChart() {
  return (
    <ResponsiveContainer width="100%" height={100}>
      <PieChart>
        <Pie data={MACRO_DATA} cx="50%" cy="50%" innerRadius={28} outerRadius={44} dataKey="value" strokeWidth={0}>
          {MACRO_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
  delay?: number;
}

function FeatureCard({ icon, title, description, className = '', children, delay = 0 }: FeatureCardProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.015, transition: { duration: 0.2 } }}
      className={`group relative rounded-2xl border border-gray-200/60 bg-white p-6 overflow-hidden shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all duration-300 ${className}`}
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(34,197,94,0.05) 0%, transparent 70%)' }} />

      <div className="relative z-10">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-emerald-600">
          {icon}
        </div>
        <h3 className="font-display font-700 text-lg text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </motion.div>
  );
}

export default function Features() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });

  return (
    <section id="features" className="bg-[#F7F8F3] py-24">
      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 mb-4">
            What NutriAI does
          </span>
          <h2 className="font-display font-800 text-4xl md:text-5xl text-gray-900 tracking-tight">
            Everything a nutritionist<br />would tell you.
          </h2>
        </motion.div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Large card */}
          <FeatureCard
            icon={<Camera size={20} />}
            title="Snap & Analyze"
            description="Upload any food photo and get a full nutritional breakdown in seconds. Our vision AI identifies every ingredient and estimates portion size."
            className="md:col-span-2 md:row-span-2"
            delay={0.05}
          >
            <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4 flex items-center gap-4">
              <span className="text-3xl">🍛</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-800 mb-2">Chicken Biryani detected</p>
                {[
                  { label: 'Calories', value: '630 kcal', w: '82%', color: 'bg-amber-400' },
                  { label: 'Protein', value: '28g', w: '70%', color: 'bg-blue-400' },
                  { label: 'Carbs', value: '72g', w: '88%', color: 'bg-orange-400' },
                ].map(({ label, value, w, color }) => (
                  <div key={label} className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] w-14 text-gray-400">{label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: w }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 w-14 text-right font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            icon={<Target size={20} />}
            title="Goal-Driven Advice"
            description="Whether you're losing weight or building muscle, every recommendation adapts to your personal targets."
            delay={0.1}
          />

          <FeatureCard
            icon={<Apple size={20} />}
            title="Diet Aware"
            description="Vegan, keto, gluten-free — NutriAI respects your restrictions and flags conflicts automatically."
            delay={0.15}
          />

          {/* Wide chart card */}
          <FeatureCard
            icon={<BarChart2 size={20} />}
            title="Visual Nutrition Charts"
            description="Macro breakdowns rendered as interactive charts directly in your chat — no copy-pasting numbers."
            className="md:col-span-2"
            delay={0.2}
          >
            <div className="flex items-center gap-6 mt-2">
              <div className="w-28 h-28">
                <MiniPieChart />
              </div>
              <div className="space-y-2">
                {MACRO_DATA.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                    <span className="text-xs text-gray-600">{name}</span>
                    <span className="text-xs font-bold font-mono ml-auto">{value}g</span>
                  </div>
                ))}
              </div>
            </div>
          </FeatureCard>

          <FeatureCard
            icon={<Zap size={20} />}
            title="Instant Streaming"
            description="Powered by Vercel Edge — responses start streaming in under 100ms, even for complex meal plans."
            delay={0.25}
          />
        </div>
      </div>
    </section>
  );
}
