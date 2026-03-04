import { useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MacroData } from '../types';
import { Copy, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

interface MacroCardProps {
  macros: MacroData;
}

const COLORS = {
  protein: '#3B82F6',
  carbs: '#F59E0B',
  fat: '#8B5CF6',
  fiber: '#22C55E',
};

function healthScoreColor(score: number) {
  if (score >= 8) return '#22C55E';
  if (score >= 5) return '#F59E0B';
  return '#EF4444';
}

export default function MacroCard({ macros }: MacroCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const pieData = [
    { name: 'Protein', value: macros.protein, color: COLORS.protein },
    { name: 'Carbs', value: macros.carbs, color: COLORS.carbs },
    { name: 'Fat', value: macros.fat, color: COLORS.fat },
    ...(macros.fiber ? [{ name: 'Fiber', value: macros.fiber, color: COLORS.fiber }] : []),
  ].filter((d) => d.value > 0);

  const handleCopy = () => {
    const dishPart = macros.dish ? `${macros.dish} — ` : '';
    const text = `${dishPart}Calories: ${macros.calories} kcal | Protein: ${macros.protein}g | Carbs: ${macros.carbs}g | Fat: ${macros.fat}g${macros.fiber ? ` | Fiber: ${macros.fiber}g` : ''}`;
    navigator.clipboard.writeText(text);
    toast.success('Macros copied!');
  };

  const handlePrint = () => {
    if (!cardRef.current) return;
    cardRef.current.setAttribute('data-print-target', 'true');
    window.print();
    // Clean up after print dialog closes
    setTimeout(() => cardRef.current?.removeAttribute('data-print-target'), 2000);
  };

  const visibleIngredients = macros.ingredients?.slice(0, 6) ?? [];
  const extraCount = (macros.ingredients?.length ?? 0) - 6;

  return (
    <div ref={cardRef} className="mt-3 rounded-2xl border border-white/10 bg-[#0D1F14]/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 py-3 border-b border-white/8">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">Nutritional Breakdown</span>
          {macros.dish && (
            <span className="text-sm font-semibold text-white mt-0.5 block">{macros.dish}</span>
          )}
          {macros.serving && (
            <span className="text-[10px] text-white/40 mt-0.5 block">{macros.serving}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-white/30 hover:text-white/70 transition-colors text-[10px] font-medium"
            title="Copy macros"
          >
            <Copy size={11} />
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 text-white/30 hover:text-emerald-400 transition-colors text-[10px] font-medium"
            title="Print / Download card"
          >
            <Printer size={11} />
            <span>Save</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        {/* Donut chart */}
        <div className="w-20 h-20 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={36} dataKey="value" strokeWidth={0}>
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#0D1F14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '11px', color: '#F0FDF4' }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [`${value}g`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Numbers */}
        <div className="flex-1 space-y-1.5">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="font-mono font-bold text-2xl text-white">{macros.calories}</span>
            <span className="text-xs text-white/40">kcal</span>
          </div>
          {pieData.map(({ name, value, color }) => (
            <div key={name} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-xs text-white/50 flex-1">{name}</span>
              <span className="text-xs font-bold font-mono text-white/80">{value}g</span>
            </div>
          ))}
        </div>
      </div>

      {/* Health score */}
      {macros.health_score !== undefined && (
        <div className="px-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Health Score</span>
            <span className="text-xs font-bold font-mono" style={{ color: healthScoreColor(macros.health_score) }}>
              {macros.health_score}/10
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${macros.health_score * 10}%`,
                background: healthScoreColor(macros.health_score),
              }}
            />
          </div>
        </div>
      )}

      {/* Ingredients */}
      {visibleIngredients.length > 0 && (
        <div className="px-4 pb-4">
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold block mb-1.5">Ingredients</span>
          <div className="flex flex-wrap gap-1">
            {visibleIngredients.map((ing, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/8 capitalize">
                {ing}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/8">
                +{extraCount} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
