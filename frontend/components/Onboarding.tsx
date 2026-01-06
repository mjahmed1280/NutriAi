
import React, { useState } from 'react';
import { UserProfile, ActivityLevel, DietPreference, FitnessGoal } from '../types';
import { ICONS } from '../constants';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    age: 25,
    gender: 'Other',
    height: 170,
    weight: 70,
    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
    dietaryPreference: DietPreference.ANYTHING,
    fitnessGoal: FitnessGoal.MAINTENANCE,
    allergies: [],
    medicalConditions: [],
    isCompleted: false,
  });

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'age' || name === 'height' || name === 'weight' ? Number(value) : value }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'allergies' | 'medicalConditions') => {
    const values = e.target.value.split(',').map(s => s.trim()).filter(s => s !== '');
    setProfile(prev => ({ ...prev, [field]: values }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ ...profile, isCompleted: true });
  };

  return (
    <div className="h-full flex items-center justify-center p-6 overflow-y-auto">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white rounded-xl p-8 shadow-sm border">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full mb-4">
            <ICONS.User className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome to NutriAI</h2>
          <p className="text-gray-500 mt-2">Let's build your nutrition profile to get started.</p>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                required
                type="text"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="e.g. Alex"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                <input
                  required
                  type="number"
                  name="age"
                  value={profile.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={nextStep}
              disabled={!profile.name}
              className="w-full mt-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 transition-colors"
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  required
                  type="number"
                  name="height"
                  value={profile.height}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  required
                  type="number"
                  name="weight"
                  value={profile.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Level</label>
              <select
                name="activityLevel"
                value={profile.activityLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {Object.values(ActivityLevel).map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={prevStep} className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Back</button>
              <button type="button" onClick={nextStep} className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fitness Goal</label>
              <select
                name="fitnessGoal"
                value={profile.fitnessGoal}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {Object.values(FitnessGoal).map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Preference</label>
              <select
                name="dietaryPreference"
                value={profile.dietaryPreference}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {Object.values(DietPreference).map(pref => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. peanuts, shellfish"
                onChange={(e) => handleArrayChange(e, 'allergies')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={prevStep} className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50">Back</button>
              <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Finish</button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-1">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-1 w-8 rounded-full ${step >= i ? 'bg-emerald-500' : 'bg-gray-200'}`} />
          ))}
        </div>
      </form>
    </div>
  );
};

export default Onboarding;
