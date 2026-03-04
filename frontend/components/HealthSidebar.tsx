import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Flame, Dumbbell, Activity } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { HealthMetrics } from '../types';
import { cn } from '../lib/utils';

// ── BMI Linear Bar Gauge ────────────────────────────────────────────────────────
const BMIGauge: React.FC<{ bmi: number; category: string }> = ({ bmi, category }) => {
  const zones = [
    { label: 'UNDER',  bmiMin: 15,   bmiMax: 18.5, barMin: 0,  barMax: 15,  color: '#6366F1' },
    { label: 'NORMAL', bmiMin: 18.5, bmiMax: 25,   barMin: 15, barMax: 45,  color: '#22C55E' },
    { label: 'OVER',   bmiMin: 25,   bmiMax: 30,   barMin: 45, barMax: 70,  color: '#F59E0B' },
    { label: 'OBESE',  bmiMin: 30,   bmiMax: 40,   barMin: 70, barMax: 100, color: '#EF4444' },
  ];

  const catColor =
    category === 'Normal'       ? '#22C55E'
    : category === 'Overweight' ? '#F59E0B'
    : category === 'Underweight'? '#6366F1'
    : '#EF4444';

  // Zone-aware needle position: interpolate within the active zone's bar range
  const clampedBmi = Math.min(Math.max(bmi, 15), 40);
  const activeZone = zones.find((z) => clampedBmi >= z.bmiMin && clampedBmi <= z.bmiMax) ?? zones[zones.length - 1];
  const needlePct = activeZone.barMin +
    ((clampedBmi - activeZone.bmiMin) / (activeZone.bmiMax - activeZone.bmiMin)) *
    (activeZone.barMax - activeZone.barMin);

  return (
    <div className="w-full py-1 select-none">
      {/* BMI value + category — pinned to same x as needle */}
      <div className="relative h-[72px] mb-3">
        <div
          className="absolute flex flex-col items-center"
          style={{ left: `${needlePct}%`, transform: 'translateX(-50%)', top: 0 }}
        >
          <span
            className="text-[46px] font-bold font-mono leading-none"
            style={{ color: catColor, textShadow: `0 0 28px ${catColor}55` }}
          >
            {bmi}
          </span>
          <span
            className="text-[9px] font-bold tracking-[0.25em] mt-1"
            style={{ color: catColor }}
          >
            {category.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Gauge bar + glowing vertical needle */}
      <div className="relative">
        {/* Needle — spans above and below bar */}
        <div
          className="absolute z-10 rounded-full pointer-events-none"
          style={{
            left: `${needlePct}%`,
            transform: 'translateX(-50%)',
            top: '-5px',
            width: '2.5px',
            height: 'calc(100% + 10px)',
            background: '#ffffff',
            boxShadow: `0 0 8px 3px ${catColor}80, 0 0 3px 1px #ffffffa0`,
          }}
        />

        {/* Coloured segments */}
        <div className="flex h-[10px] gap-[2px]">
          {zones.map(({ label, color, barMin, barMax }, i) => (
            <div
              key={label}
              style={{
                width: `${barMax - barMin}%`,
                backgroundColor: color,
                opacity: color === activeZone.color ? 0.85 : 0.28,
                borderRadius:
                  i === 0 ? '5px 0 0 5px'
                  : i === zones.length - 1 ? '0 5px 5px 0'
                  : '0',
                boxShadow: color === activeZone.color ? `0 0 6px ${color}70` : 'none',
              }}
            />
          ))}
        </div>

        {/* Zone labels */}
        <div className="flex mt-2">
          {zones.map(({ label, color, barMin, barMax }) => (
            <div
              key={label}
              className="flex justify-center"
              style={{ width: `${barMax - barMin}%` }}
            >
              <span
                className="text-[7.5px] font-semibold tracking-[0.12em] uppercase"
                style={{ color: color === activeZone.color ? color + 'BB' : '#ffffff25' }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Metric calculations ─────────────────────────────────────────────────────────
function calcMetrics(profile: NonNullable<ReturnType<typeof useAppStore.getState>['profile']>): HealthMetrics {
  const hm = profile.height / 100;
  const bmi = profile.weight / (hm * hm);

  let bmiCategory: HealthMetrics['bmiCategory'] = 'Normal';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
  else if (bmi >= 30) bmiCategory = 'Obese';

  // Mifflin-St Jeor BMR
  let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  bmr += profile.gender === 'Male' ? 5 : -161;

  const sexFactor = profile.gender === 'Male' ? 1 : 0;
  const bodyFat = 1.2 * bmi + 0.23 * profile.age - 10.8 * sexFactor - 5.4;

  const minW = 18.5 * hm * hm;
  const maxW = 25 * hm * hm;

  return {
    bmi: +bmi.toFixed(1),
    bmiCategory,
    bodyFatPercentage: +bodyFat.toFixed(1),
    visceralFat: Math.min(Math.max(Math.round(bmi / 2), 1), 20),
    bmr: Math.round(bmr),
    metabolicAge: profile.age,
    idealWeightRange: `${Math.round(minW)}–${Math.round(maxW)}kg`,
    waterIntake: 0,
    actionItems: [],
  };
}

// Activity multipliers (Harris-Benedict / Mifflin-St Jeor convention)
const ACT_MULT: Record<string, number> = {
  'Sedentary': 1.2,
  'Lightly Active': 1.375,
  'Moderately Active': 1.55,
  'Very Active': 1.725,
  'Extremely Active': 1.9,
};

// ── Main ────────────────────────────────────────────────────────────────────────
const HealthSidebar: React.FC = () => {
  const { profile, messages, isSidebarOpen, setSidebarOpen } = useAppStore();

  const metrics = useMemo(() => (profile ? calcMetrics(profile) : null), [profile]);

  // TDEE-based macro targets — dietitian standard
  const macros = useMemo(() => {
    if (!metrics || !profile) return null;
    const tdee = Math.round(metrics.bmr * (ACT_MULT[profile.activityLevel] ?? 1.55));

    // Goal-adjusted calorie target
    const targetCals =
      profile.fitnessGoal === 'Weight Loss'          ? Math.max(1200, tdee - 500)
      : profile.fitnessGoal === 'Muscle Gain'        ? tdee + 250
      : tdee;

    // Protein: evidence-based g/kg by goal
    // Weight Loss 1.8 g/kg (preserve lean mass) | Muscle Gain 2.0 g/kg | Athletic 1.6 g/kg | Maintenance 1.4 g/kg
    const ppkg =
      profile.fitnessGoal === 'Muscle Gain'          ? 2.0
      : profile.fitnessGoal === 'Weight Loss'        ? 1.8
      : profile.fitnessGoal === 'Athletic Performance' ? 1.6
      : 1.4;

    const proteinG = Math.round(profile.weight * ppkg);
    // Fat: 28% of calories (AHA: 25–35%)
    const fatG = Math.round((targetCals * 0.28) / 9);
    // Carbs: remainder
    const carbG = Math.max(0, Math.round((targetCals - proteinG * 4 - fatG * 9) / 4));

    return { tdee, targetCals, proteinG, fatG, carbG, ppkg };
  }, [metrics, profile]);

  const todayAnalyses = useMemo(() =>
    messages
      .filter((m) => m.role === 'model' && m.macros)
      .map((m) => ({ id: m.id, macros: m.macros!, label: m.macros!.dish || m.text.slice(0, 36) || 'Food analysis' })),
    [messages]
  );

  // Wellness score: BMI (50pts) + activity (30pts) + body fat (20pts)
  const wellnessScore = useMemo(() => {
    if (!metrics || !profile) return 0;
    let s = 0;
    s += metrics.bmiCategory === 'Normal' ? 50
       : metrics.bmiCategory === 'Overweight' ? 28
       : metrics.bmiCategory === 'Underweight' ? 22 : 8;
    const actMap: Record<string, number> = {
      'Sedentary': 5, 'Lightly Active': 12,
      'Moderately Active': 20, 'Very Active': 26, 'Extremely Active': 30,
    };
    s += actMap[profile.activityLevel] ?? 15;
    const bfTarget = profile.gender === 'Male' ? 18 : 25;
    s += metrics.bodyFatPercentage <= bfTarget ? 20
       : metrics.bodyFatPercentage <= bfTarget + 7 ? 12 : 4;
    return Math.min(100, Math.max(0, s));
  }, [metrics, profile]);

  const wellnessColor = wellnessScore >= 70 ? '#22C55E' : wellnessScore >= 45 ? '#F59E0B' : '#EF4444';

  if (!profile || !metrics || !macros) return null;

  const macroRows = [
    { label: 'Protein', g: macros.proteinG, color: '#3B82F6', calPct: (macros.proteinG * 4 / macros.targetCals) * 100 },
    { label: 'Carbs',   g: macros.carbG,    color: '#F59E0B', calPct: (macros.carbG   * 4 / macros.targetCals) * 100 },
    { label: 'Fat',     g: macros.fatG,     color: '#8B5CF6', calPct: (macros.fatG    * 9 / macros.targetCals) * 100 },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 38 }}
            className="fixed md:relative left-0 top-0 h-full w-[30%] min-w-64 bg-[#08110D] border-r border-white/6 z-40 flex flex-col overflow-hidden"
          >
            {/* ── Profile card ─────────────────────────────────────────────── */}
            <div className="shrink-0 px-5 py-4 border-b border-white/6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-emerald-400">{profile.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F0FDF4] truncate">{profile.name}</p>
                    <p className="text-xs text-white/40">{profile.age}y · {profile.gender}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 flex items-center justify-center transition-all shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">{profile.fitnessGoal}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/8">{profile.dietaryPreference}</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Height',   value: `${profile.height}`, unit: 'cm' },
                  { label: 'Weight',   value: `${profile.weight}`, unit: 'kg' },
                  { label: 'Activity', value: profile.activityLevel.split(' ')[0], unit: '' },
                ].map(({ label, value, unit }) => (
                  <div key={label} className="bg-white/[0.03] rounded-lg px-1.5 py-1.5 text-center">
                    <p className="text-[8px] text-white/25 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-[11px] font-mono font-semibold text-white/60 leading-tight">
                      {value}<span className="text-[8px] text-white/30">{unit ? ` ${unit}` : ''}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Scrollable metrics ──────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

              {/* BMI Gauge */}
              <div>
                <SectionLabel label="BMI Index" />
                <BMIGauge bmi={metrics.bmi} category={metrics.bmiCategory} />
              </div>

              {/* BMR + Body Fat tiles */}
              <div className="grid grid-cols-2 gap-2.5">
                <StatTile label="BMR"       value={`${metrics.bmr}`}              unit="kcal" icon={<Flame   size={12} />} color="text-amber-400" />
                <StatTile label="Body Fat"  value={`${metrics.bodyFatPercentage}`} unit="%"    icon={<Dumbbell size={12} />} color="text-blue-400"  />
              </div>

              {/* Daily Macro Targets */}
              <div>
                <div className="flex items-baseline justify-between mb-3.5">
                  <SectionLabel label="Daily Targets" />
                  <span className="font-mono font-bold text-white/65 text-[13px]">
                    {macros.targetCals}<span className="text-[10px] font-normal text-white/30 ml-1">kcal</span>
                  </span>
                </div>
                <div className="space-y-3">
                  {macroRows.map(({ label, g, color, calPct }) => (
                    <div key={label}>
                      <div className="flex justify-between text-[10px] mb-1.5">
                        <span className="text-white/40">{label}</span>
                        <span className="font-mono text-white/50">{g}g</span>
                      </div>
                      <div className="h-[3px] rounded-full bg-white/[0.06]">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(calPct, 100)}%`, background: color + 'B0' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-white/20 mt-2.5">
                  TDEE {macros.tdee} kcal · protein {macros.ppkg}g/kg
                </p>
              </div>

              {/* Today's Log */}
              {todayAnalyses.length > 0 && (
                <div>
                  <SectionLabel label="Today's Log" />
                  <div className="space-y-2 mt-3">
                    {todayAnalyses.map((a) => (
                      <div key={a.id} className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 min-w-0">
                          <ChevronRight size={10} className="text-emerald-500/50 shrink-0" />
                          <span className="text-white/40 truncate">{a.label}</span>
                        </div>
                        <span className="font-mono font-semibold text-emerald-400/75 ml-2 shrink-0">
                          {a.macros.calories} kcal
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="pb-2">
                <SectionLabel label="Recommendations" />
                <ul className="space-y-2.5 mt-3">
                  {[
                    `Target ${macros.targetCals} kcal/day`,
                    `Protein ${macros.proteinG}g (${macros.ppkg}g/kg body weight)`,
                    `Carbs ${macros.carbG}g · Fat ${macros.fatG}g`,
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-[11px] text-white/40 leading-relaxed">
                      <span className="mt-[5px] w-1 h-1 rounded-full bg-emerald-500/50 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* ── Wellness Score (pinned bottom) ──────────────────────────── */}
            <div className="shrink-0 px-5 py-3.5 border-t border-white/6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Activity size={11} className="text-white/30" />
                  <span className="text-[9px] text-white/30 uppercase tracking-widest font-semibold">Wellness Score</span>
                </div>
                <span className="text-xs font-bold font-mono" style={{ color: wellnessColor }}>{wellnessScore}/100</span>
              </div>
              <div className="h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${wellnessScore}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  style={{ background: `linear-gradient(to right, ${wellnessColor}70, ${wellnessColor})` }}
                />
              </div>
              <p className="text-[8.5px] text-white/15 mt-1.5 text-center">BMI · body fat · activity level</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────────
const SectionLabel: React.FC<{ label: string }> = ({ label }) => (
  <span className="text-[9px] font-semibold text-white/25 uppercase tracking-[0.15em] block">{label}</span>
);

const StatTile: React.FC<{
  label: string; value: string; unit: string;
  icon: React.ReactNode; color: string;
}> = ({ label, value, unit, icon, color }) => (
  <div className={cn('bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]')}>
    <div className={cn('flex items-center gap-1 mb-1.5', color)}>
      {icon}
      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-60">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="font-mono font-bold text-[#F0FDF4] text-lg leading-none">{value}</span>
      {unit && <span className="text-[10px] text-white/25">{unit}</span>}
    </div>
  </div>
);

export default HealthSidebar;
