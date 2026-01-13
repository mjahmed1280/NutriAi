
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, HealthMetrics } from '../types';
import { ICONS } from '../constants';

interface HealthSidebarProps {
  profile: UserProfile | null;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const HealthSidebar: React.FC<HealthSidebarProps> = ({ profile, isOpen, toggleSidebar }) => {
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [waterCount, setWaterCount] = useState(0);

  // Calculate Metrics on profile change
  useEffect(() => {
    if (!profile) return;

    const heightM = profile.height / 100;
    const bmi = profile.weight / (heightM * heightM);
    
    let bmiCategory: HealthMetrics['bmiCategory'] = 'Normal';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi >= 25 && bmi < 30) bmiCategory = 'Overweight';
    else if (bmi >= 30) bmiCategory = 'Obese';

    // Mifflin-St Jeor Equation
    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    bmr += profile.gender === 'Male' ? 5 : -161;

    // Rough Body Fat Estimate (Navy Tape measure method requires more inputs, using simple BMI-based approximation for demo)
    // Adult Body Fat % = (1.20 × BMI) + (0.23 × Age) − (10.8 × sex) − 5.4 
    // sex: 1 for men, 0 for women
    const sexFactor = profile.gender === 'Male' ? 1 : 0;
    const bodyFat = (1.20 * bmi) + (0.23 * profile.age) - (10.8 * sexFactor) - 5.4;

    // Ideal Weight (BMI 18.5 - 25)
    const minWeight = 18.5 * (heightM * heightM);
    const maxWeight = 25 * (heightM * heightM);

    // Metabolic Age (Simplistic heuristic: lower if BMI/BodyFat is good, higher if bad)
    // Real calculation requires BIA scale.
    let metabolicAge = profile.age;
    if (bmiCategory === 'Obese') metabolicAge += 5;
    if (bmiCategory === 'Overweight') metabolicAge += 2;
    if (bmiCategory === 'Underweight') metabolicAge += 1;
    if (bmiCategory === 'Normal') metabolicAge -= 3; // "Younger"

    setMetrics({
      bmi: parseFloat(bmi.toFixed(1)),
      bmiCategory,
      bodyFatPercentage: parseFloat(bodyFat.toFixed(1)),
      visceralFat: Math.min(Math.max(Math.round(bmi / 2), 1), 20), // Placeholder logic
      bmr: Math.round(bmr),
      metabolicAge,
      idealWeightRange: `${Math.round(minWeight)}kg - ${Math.round(maxWeight)}kg`,
      waterIntake: 0,
      actionItems: [
        `Target ${Math.round(bmr * 1.2)} daily calories`,
        `Aim for ${Math.round(profile.weight * 0.8)}g protein`,
        "30 mins cardio daily"
      ]
    });
  }, [profile]);

  if (!profile || !metrics) return null;

  // Calculate position for the linear slider (15 to 40 scale)
  const getBmiPosition = (bmi: number) => {
    const min = 15;
    const max = 40;
    const clamped = Math.min(Math.max(bmi, min), max);
    return ((clamped - min) / (max - min)) * 100;
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Toggle Button (Visible when collapsed) */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed right-0 top-24 z-40 bg-white border border-r-0 border-gray-200 shadow-lg rounded-l-xl p-2 text-emerald-600 hover:bg-gray-50 transition-transform hover:-translate-x-1"
          title="Open Health Insights"
        >
          <ICONS.Leaf className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:absolute right-0 top-0 h-full bg-white z-40 transition-all duration-300 ease-in-out shadow-2xl border-l border-emerald-100 flex flex-col
          ${isOpen ? 'translate-x-0 w-80' : 'translate-x-full w-0 opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Health Insights</h2>
              <p className="text-xs text-gray-500">{profile.name} • {profile.fitnessGoal}</p>
            </div>
            <button onClick={toggleSidebar} className="text-gray-400 hover:text-gray-600">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* BMI Linear Bar Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-6 text-center">BMI Score</h3>
            
            {/* External Labels Row */}
            <div className="flex text-[9px] font-bold text-gray-400 mb-1.5 px-0.5 uppercase tracking-wide">
               <div style={{ width: '14%' }} className="text-center">Under</div>
               <div style={{ width: '26%' }} className="text-center">Healthy</div>
               <div style={{ width: '20%' }} className="text-center">Over</div>
               <div style={{ width: '40%' }} className="text-center">Obese</div>
            </div>

            {/* The Bar Container */}
            <div className="relative h-3 w-full rounded-full flex overflow-visible">
               {/* Colored Segments (No text inside) */}
               <div className="h-full bg-red-400/90 rounded-l-full" style={{ width: '14%' }} />
               <div className="h-full bg-emerald-400/90" style={{ width: '26%' }} />
               <div className="h-full bg-amber-400/90" style={{ width: '20%' }} />
               <div className="h-full bg-red-400/90 rounded-r-full" style={{ width: '40%' }} />

               {/* The Indicator (Needle) */}
               <div 
                 className="absolute top-0 bottom-0 transition-all duration-1000 ease-in-out z-20"
                 style={{ left: `${getBmiPosition(metrics.bmi)}%` }}
               >
                  {/* Vertical Guide Line */}
                  <div className="absolute -top-1 h-5 w-0.5 bg-gray-800/20 -translate-x-1/2"></div>
                  {/* Circle Cap */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-gray-800 rounded-full shadow-md z-30" />
               </div>
            </div>

            {/* Value Display */}
            <div className="text-center mt-5">
              <span className={`text-3xl font-bold block
                 ${metrics.bmiCategory === 'Normal' ? 'text-emerald-500' : 
                   metrics.bmiCategory === 'Overweight' ? 'text-amber-500' : 'text-red-500'}`
              }>
                {metrics.bmi}
              </span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                {metrics.bmiCategory}
              </span>
            </div>
          </div>

          {/* Age & Comparison */}
          <AgeCard metrics={metrics} profile={profile} />

          {/* Body Composition Matrix */}
          <div className="grid grid-cols-2 gap-3">
             <MetricCard label="Body Fat" value={`${metrics.bodyFatPercentage}%`} sub="Estimated" />
             <MetricCard 
                label="Visceral Fat" 
                value={metrics.visceralFat.toString()} 
                sub={metrics.visceralFat < 10 ? '(Low Risk)' : metrics.visceralFat < 15 ? '(Moderate)' : '(High Risk)'} 
                alertLevel={metrics.visceralFat >= 10}
             />
             <MetricCard label="BMR" value={metrics.bmr.toString()} sub="Kcal/day" />
             
             {/* Weight Range Slider */}
             <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-center">
                <p className="text-[10px] text-gray-400 font-medium uppercase mb-3">Weight Range</p>
                {/* Calculate relative positions */}
                {(() => {
                   const minIdeal = parseFloat(metrics.idealWeightRange.split('-')[0]);
                   const maxIdeal = parseFloat(metrics.idealWeightRange.split('-')[1]);
                   const displayMin = Math.floor(minIdeal - 10);
                   const displayMax = Math.ceil(maxIdeal + 10);
                   
                   // Ensure 0-100 clamping
                   const currentPos = Math.min(Math.max((profile.weight - displayMin) / (displayMax - displayMin) * 100, 0), 100);
                   const idealStartPos = ((minIdeal - displayMin) / (displayMax - displayMin)) * 100;
                   const idealWidth = ((maxIdeal - minIdeal) / (displayMax - displayMin)) * 100;

                   return (
                     <div className="relative pt-1 pb-4">
                        {/* Track */}
                        <div className="relative h-1.5 bg-gray-100 rounded-full w-full">
                           {/* Green Zone (Ideal) */}
                           <div 
                              className="absolute h-full bg-emerald-300/50 rounded-full" 
                              style={{ left: `${idealStartPos}%`, width: `${idealWidth}%` }}
                           /> 
                           {/* Current Weight Dot */}
                           <div 
                              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-gray-800 border-2 border-white rounded-full shadow-md z-10 transition-all duration-1000"
                              style={{ left: `${currentPos}%` }} 
                           />
                        </div>

                        {/* Labels Container */}
                        <div className="relative w-full h-4 mt-2 text-[9px] text-gray-400 font-medium">
                           {/* Min Label */}
                           <span className="absolute left-0">{displayMin}kg</span>
                           
                           {/* Max Label */}
                           <span className="absolute right-0">{displayMax}kg</span>

                           {/* Current Label (Floating) */}
                           <div 
                              className="absolute top-0 -translate-x-1/2 text-gray-900 font-extrabold text-xs transition-all duration-1000"
                              style={{ left: `${currentPos}%` }}
                           >
                             {profile.weight}
                           </div>
                        </div>
                     </div>
                   );
                })()}
             </div>
          </div>

          {/* Water Tracker */}
          <div className={`bg-blue-50 rounded-2xl p-4 border border-blue-100 transition-all duration-500 ${waterCount === 8 ? 'shadow-lg shadow-blue-200 ring-1 ring-blue-300' : ''}`}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-blue-900">Water Intake</h3>
              <span className="text-xs font-semibold text-blue-600">{waterCount} / 8 glasses</span>
            </div>
            <div className="flex gap-1 mb-3">
              {[...Array(8)].map((_, i) => (
                 <div key={i} className={`h-8 flex-1 rounded-md transition-all duration-300 ${i < waterCount ? 'bg-blue-500' : 'bg-blue-200/50'} ${waterCount === 8 ? 'animate-pulse' : ''}`} />
              ))}
            </div>
            <div className="flex gap-2">
               <button onClick={() => setWaterCount(Math.max(0, waterCount - 1))} className="flex-1 py-1.5 bg-white text-blue-600 border border-blue-200 rounded-lg text-sm font-bold hover:bg-blue-50">-</button>
               <button onClick={() => setWaterCount(Math.min(8, waterCount + 1))} className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">+</button>
            </div>
          </div>

          {/* AI Action Items */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">AI Recommendations</h3>
            <ul className="space-y-2">
              {metrics.actionItems.map((item, idx) => (
                <li key={idx} className="flex gap-2 items-start text-sm text-gray-600">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </aside>
    </>
  );
};

const MetricCard: React.FC<{ label: string; value: string; sub: string; smallValue?: boolean; alertLevel?: boolean }> = ({ label, value, sub, smallValue, alertLevel }) => (
  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
    <p className="text-[10px] text-gray-400 font-medium uppercase">{label}</p>
    <p className={`font-bold ${alertLevel ? 'text-orange-500' : 'text-gray-800'} ${smallValue ? 'text-sm mt-1' : 'text-xl'}`}>{value}</p>
    <p className="text-[10px] text-gray-400">{sub}</p>
  </div>
);

const AgeCard: React.FC<{ metrics: HealthMetrics; profile: UserProfile }> = ({ metrics, profile }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const diff = metrics.metabolicAge - profile.age;

  return (
    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between relative">
       <div>
          <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Metabolic Age</p>
          <div className="flex items-baseline gap-1">
             <p className="text-2xl font-bold text-emerald-900">{metrics.metabolicAge}</p>
             <span className="text-sm text-emerald-700">yrs</span>
          </div>
       </div>
       <div className="text-right">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-emerald-600/80 font-medium uppercase">Actual Age</span>
            <span className="text-xl font-bold text-gray-700">{profile.age}</span>
          </div>
          <button 
             onClick={() => setShowTooltip(!showTooltip)}
             className={`text-[10px] font-bold block mt-1 hover:underline cursor-pointer transition-colors ${diff < 0 ? 'text-emerald-600' : 'text-orange-500'}`}
          >
            {diff <= 0 ? '↓ Trending Younger' : '↑ Older than actual'}
          </button>
       </div>

       {/* Tooltip */}
       {showTooltip && (
          <div className="absolute top-full right-0 mt-2 w-56 p-3 bg-white border border-emerald-100 shadow-xl rounded-xl z-50 text-xs text-gray-600 animate-in fade-in zoom-in-95 duration-200">
             <p className="font-bold text-gray-800 mb-1">About Metabolic Age</p>
             <p>Your BMR suggests your body is functioning like that of a {metrics.metabolicAge}-year-old. {diff < 0 ? "Great job!" : "We can improve this."}</p>
             <div className="absolute top-0 right-4 w-2 h-2 bg-white border-l border-t border-emerald-100 -translate-y-1/2 rotate-45"></div>
          </div>
       )}
    </div>
  );
};

export default HealthSidebar;
