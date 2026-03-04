import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactConfetti from 'react-confetti';
import { Leaf, Check, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { UserProfile, ActivityLevel, DietPreference, FitnessGoal } from '../types';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';

const slideIn = (dir: number) => ({
  initial: { opacity: 0, x: dir * 40 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as any } },
  exit: { opacity: 0, x: dir * -40, transition: { duration: 0.3 } },
});

interface SelectCardProps {
  label: string;
  sublabel?: string;
  icon?: string;
  selected?: boolean;
  onClick: () => void;
  className?: string;
}
function SelectCard({ label, sublabel, icon, selected, onClick, className }: SelectCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      type="button"
      className={cn(
        'relative flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer',
        selected
          ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.25)]'
          : 'border-white/10 bg-white/5 text-white/60 hover:border-white/25 hover:text-white/80',
        className
      )}
    >
      {icon && <span className="text-2xl">{icon}</span>}
      <span className="text-sm font-semibold leading-tight">{label}</span>
      {sublabel && <span className="text-[10px] text-white/35 leading-tight">{sublabel}</span>}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-md"
          >
            <Check size={11} className="text-white" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  altUnit?: string;
  altValue?: number;
  onChange: (v: number) => void;
}
function RangeSlider({ label, value, min, max, unit, altUnit, altValue, onChange }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-white/60">{label}</span>
        <span className="font-display font-bold text-xl text-white">
          {value}
          <span className="text-sm text-white/40 ml-1">{unit}</span>
          {altUnit && altValue !== undefined && (
            <span className="text-xs text-white/30 ml-2">({altValue} {altUnit})</span>
          )}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-white/10">
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
          style={{ zIndex: 2 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-lg border-2 border-emerald-500 pointer-events-none"
          style={{ left: `calc(${pct}% - 10px)`, zIndex: 1 }}
        />
      </div>
    </div>
  );
}

function TagInput({ tags, placeholder, onChange }: { tags: string[]; placeholder: string; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput('');
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            {t}
            <button type="button" onClick={() => onChange(tags.filter((x) => x !== t))} className="hover:text-red-400 transition-colors">
              <X size={11} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-emerald-500/60 transition-colors"
        />
        <button type="button" onClick={add} className="px-4 py-2.5 rounded-xl bg-emerald-900/50 border border-emerald-800/60 text-emerald-400 text-sm font-semibold hover:bg-emerald-800/60 transition-colors">
          Add
        </button>
      </div>
    </div>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center mb-10">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ width: i < step ? '2.5rem' : '0.5rem', backgroundColor: i < step ? '#22C55E' : 'rgba(255,255,255,0.12)' }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-1.5 rounded-full"
          style={{ minWidth: i < step ? '2.5rem' : '0.5rem' }}
        />
      ))}
    </div>
  );
}

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const { setProfile, setAppState } = useAppStore();
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

  const [profile, setLocalProfile] = useState<UserProfile>({
    name: '', age: 25, gender: 'Other', height: 170, weight: 70,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    dietaryPreference: DietPreference.ANYTHING,
    fitnessGoal: FitnessGoal.MAINTENANCE,
    allergies: [], medicalConditions: [], isCompleted: false,
  });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const [nameFocused, setNameFocused] = useState(false);

  // Auto-focus name input when on step 1
  useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => nameInputRef.current?.focus(), 380); // after slide-in
      return () => clearTimeout(t);
    }
  }, [step]);

  const update = useCallback((patch: Partial<UserProfile>) => setLocalProfile((p) => ({ ...p, ...patch })), []);
  const next = () => { setDir(1); setStep((s) => s + 1); };
  const prev = () => { setDir(-1); setStep((s) => s - 1); };

  const handleFinish = () => {
    setShowConfetti(true);
    setTimeout(() => setProfile({ ...profile, isCompleted: true }), 2800);
  };

  const vars = slideIn(dir);

  return (
    <div className="min-h-screen bg-[#04090A] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {showConfetti && (
        <ReactConfetti recycle={false} numberOfPieces={350} colors={['#22C55E', '#16A34A', '#F59E0B', '#14B8A6', '#FFFFFF']} tweenDuration={3000} />
      )}
      <div className="absolute w-96 h-96 rounded-full bg-emerald-700/15 -top-24 -left-24 blur-[80px] pointer-events-none animate-[orb_8s_ease-in-out_infinite]" />
      <div className="absolute w-72 h-72 rounded-full bg-teal-700/15 bottom-0 right-0 blur-[80px] pointer-events-none animate-[orb_8s_ease-in-out_infinite_3s]" />

      {step === 1 && (
        <button onClick={() => setAppState('landing')} className="absolute top-6 left-6 flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm transition-colors">
          <ChevronLeft size={16} /> Back
        </button>
      )}

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Leaf size={18} className="text-emerald-400" />
            </div>
            <span className="font-display font-bold text-xl text-white">NutriAI</span>
          </div>
        </div>

        <ProgressBar step={step} total={TOTAL_STEPS} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" {...vars} className="space-y-7">
              <div className="text-center">
                <h2 className="font-display font-bold text-3xl text-white mb-2">What should we call you?</h2>
                <p className="text-white/40 text-sm">Let's start with the basics.</p>
              </div>

              {/* Name input with blinking cursor */}
              <div className="relative">
                <input
                  ref={nameInputRef}
                  type="text"
                  value={profile.name}
                  onChange={(e) => update({ name: e.target.value })}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && profile.name) next(); }}
                  placeholder=""
                  className="w-full bg-transparent border-0 border-b-2 border-white/15 focus:border-emerald-500 py-3 text-2xl font-bold text-white outline-none transition-colors text-center caret-emerald-400"
                />
                {/* Placeholder + blinking cursor shown when input is empty */}
                {!profile.name && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                    <span className="text-2xl font-bold text-white/20">Your name</span>
                    {nameFocused && (
                      <span className="ml-1 inline-block w-[2px] h-7 bg-emerald-400 animate-[blink_1s_step-end_infinite] rounded-full" />
                    )}
                  </div>
                )}
                {/* "Press Enter" hint when name is typed */}
                <AnimatePresence>
                  {profile.name && (
                    <motion.p
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute -bottom-6 w-full text-center text-[11px] text-emerald-500/70 font-medium"
                    >
                      Press Enter to continue →
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <div className="pt-2">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 text-center">Gender</p>
                <div className="grid grid-cols-3 gap-3">
                  {[['♂', 'Male'], ['♀', 'Female'], ['⚧', 'Other']].map(([icon, val]) => (
                    <SelectCard key={val} icon={icon} label={val} selected={profile.gender === val} onClick={() => update({ gender: val })} />
                  ))}
                </div>
              </div>
              <RangeSlider label="How old are you?" value={profile.age} min={14} max={90} unit="yrs" onChange={(v) => update({ age: v })} />
              <motion.button
                whileHover={profile.name ? { scale: 1.02, boxShadow: '0 0 28px rgba(34,197,94,0.35)' } : {}}
                whileTap={{ scale: 0.98 }}
                disabled={!profile.name}
                onClick={next}
                className={cn(
                  'w-full py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2',
                  profile.name
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/40'
                    : 'bg-white/8 text-white/25 cursor-not-allowed'
                )}
              >
                {profile.name ? `Continue as ${profile.name}` : 'Continue'}
                <ChevronRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" {...vars} className="space-y-7">
              <div className="text-center">
                <h2 className="font-display font-bold text-3xl text-white mb-2">Tell us about your body.</h2>
                <p className="text-white/40 text-sm">Used to calculate your personalized targets.</p>
              </div>
              <RangeSlider label="Height" value={profile.height} min={130} max={220} unit="cm"
                altUnit="ft" altValue={Math.round((profile.height / 30.48) * 10) / 10}
                onChange={(v) => update({ height: v })} />
              <RangeSlider label="Weight" value={profile.weight} min={35} max={200} unit="kg"
                altUnit="lbs" altValue={Math.round(profile.weight * 2.205)}
                onChange={(v) => update({ weight: v })} />
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Activity Level</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: ActivityLevel.SEDENTARY, icon: '🪑', label: 'Sedentary', sub: 'Desk job, little movement' },
                    { val: ActivityLevel.LIGHTLY_ACTIVE, icon: '🚶', label: 'Lightly Active', sub: '1–3 workouts/week' },
                    { val: ActivityLevel.MODERATELY_ACTIVE, icon: '🏃', label: 'Moderately Active', sub: '3–5 workouts/week' },
                    { val: ActivityLevel.VERY_ACTIVE, icon: '⚡', label: 'Very Active', sub: 'Daily training' },
                  ].map(({ val, icon, label, sub }) => (
                    <SelectCard key={val} icon={icon} label={label} sublabel={sub}
                      selected={profile.activityLevel === val} onClick={() => update({ activityLevel: val })} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={prev} className="flex-1 py-4 rounded-2xl border border-white/12 text-white/50 hover:text-white hover:border-white/25 font-semibold transition-colors flex items-center justify-center gap-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={next}
                  className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center gap-2">
                  Continue <ChevronRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" {...vars} className="space-y-7">
              <div className="text-center">
                <h2 className="font-display font-bold text-3xl text-white mb-2">What are you working towards?</h2>
                <p className="text-white/40 text-sm">Your goal shapes every recommendation.</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Fitness Goal</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: FitnessGoal.WEIGHT_LOSS, icon: '📉', label: 'Weight Loss' },
                    { val: FitnessGoal.MUSCLE_GAIN, icon: '💪', label: 'Muscle Gain' },
                    { val: FitnessGoal.MAINTENANCE, icon: '⚖️', label: 'Maintenance' },
                    { val: FitnessGoal.ATHLETIC_PERFORMANCE, icon: '🏅', label: 'Athletic Perf.' },
                  ].map(({ val, icon, label }) => (
                    <SelectCard key={val} icon={icon} label={label} selected={profile.fitnessGoal === val}
                      onClick={() => update({ fitnessGoal: val })} className="py-6" />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Dietary Preference</p>
                <div className="flex flex-wrap gap-2">
                  {Object.values(DietPreference).map((pref) => (
                    <motion.button key={pref} type="button" whileTap={{ scale: 0.95 }} onClick={() => update({ dietaryPreference: pref })}
                      className={cn('px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200',
                        profile.dietaryPreference === pref
                          ? 'border-emerald-500 bg-emerald-900/40 text-emerald-300'
                          : 'border-white/10 bg-white/5 text-white/50 hover:border-white/25 hover:text-white/70')}>
                      {pref}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={prev} className="flex-1 py-4 rounded-2xl border border-white/12 text-white/50 hover:text-white hover:border-white/25 font-semibold transition-colors flex items-center justify-center gap-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={next}
                  className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center justify-center gap-2">
                  Continue <ChevronRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" {...vars} className="space-y-7">
              <div className="text-center">
                <h2 className="font-display font-bold text-3xl text-white mb-2">Almost done!</h2>
                <p className="text-white/40 text-sm">Health details help keep advice safe. Totally optional.</p>
              </div>
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-white/60 mb-2">Allergies</p>
                  <TagInput tags={profile.allergies} placeholder="e.g. peanuts, shellfish (Enter to add)" onChange={(allergies) => update({ allergies })} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white/60 mb-2">Medical Conditions <span className="text-white/25 text-xs">(optional)</span></p>
                  <TagInput tags={profile.medicalConditions} placeholder="e.g. diabetes, hypertension" onChange={(medicalConditions) => update({ medicalConditions })} />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={prev} className="flex-1 py-4 rounded-2xl border border-white/12 text-white/50 hover:text-white hover:border-white/25 font-semibold transition-colors flex items-center justify-center gap-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <motion.button whileHover={{ scale: 1.02, boxShadow: '0 0 32px rgba(34,197,94,0.4)' }} whileTap={{ scale: 0.97 }} onClick={handleFinish}
                  className="flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base transition-colors flex items-center justify-center gap-2">
                  🎉 Let's Go!
                </motion.button>
              </div>
              <button type="button" onClick={handleFinish} className="w-full text-center text-xs text-white/25 hover:text-white/50 transition-colors py-1">
                Skip this step
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
