import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Flame, 
  User, 
  Scale, 
  Target, 
  Heart, 
  Utensils 
} from 'lucide-react';
import { ActivityLevel, FitnessGoal, FoodPreference, Gender, UserProfile } from '../../types';
import { calculateHealthPlan } from '../../utils/calculator';
import { useApp } from '../../context/AppContext';

export const OnboardingModal: React.FC = () => {
  const { isOnboardingOpen, completeOnboarding } = useApp();
  const [step, setStep] = useState<number>(1);

  // Form State
  const [formData, setFormData] = useState<UserProfile>({
    name: 'Srinivasa',
    age: 28,
    gender: 'male',
    height: 178,
    weight: 76.5,
    targetWeight: 70.0,
    activityLevel: 'moderately_active',
    goal: 'lose_weight',
    foodPreference: 'eggetarian',
    allergies: ['peanuts'],
    dailyWaterGoal: 3000,
    sleepGoal: 8,
    mealsPerDay: 4,
    isOnboarded: false,
    reminders: {
      water: true,
      meals: true,
      workout: true,
      walk: true,
      sleep: true,
      weight: true,
    },
    reminderTimes: {
      water: '09:00',
      meals: '13:00',
      workout: '18:00',
      walk: '19:30',
      sleep: '22:30',
      weight: '07:30',
    },
  });

  if (!isOnboardingOpen) return null;

  const previewCalcs = calculateHealthPlan(formData);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      completeOnboarding(formData);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between max-w-md mx-auto sm:border-x sm:border-slate-800 antialiased text-white">
      {/* Top Header */}
      <div className="p-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-sm">
              F
            </div>
            <span className="font-extrabold text-base tracking-tight text-white">FitLife AI</span>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">Step {step} of 4</span>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-emerald-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Form Body */}
      <div className="flex-1 overflow-y-auto px-6 py-2 no-scrollbar">
        {/* STEP 1: WELCOME & BASICS */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalized Health Setup</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Let's build your plan</h2>
              <p className="text-xs text-slate-400 mt-1">
                Tell us about yourself to calculate your basal metabolism and precision daily calorie requirements.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">What is your name?</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Srinivasa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Age</label>
                  <input
                    type="number"
                    min="14"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm font-mono focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-sm focus:border-emerald-500 outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: BODY METRICS */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Your Body Metrics</h2>
              <p className="text-xs text-slate-400 mt-1">
                Used for the Mifflin-St Jeor metabolic formula.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Height (cm)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="120"
                    max="230"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-base font-mono font-bold focus:border-emerald-500 outline-none"
                  />
                  <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-mono">cm</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Current Weight</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="35"
                      max="220"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-base font-mono font-bold focus:border-emerald-500 outline-none"
                    />
                    <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-mono">kg</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Target Weight</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="35"
                      max="220"
                      value={formData.targetWeight}
                      onChange={(e) => setFormData({ ...formData, targetWeight: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-base font-mono font-bold focus:border-emerald-500 outline-none"
                    />
                    <span className="absolute right-4 top-3.5 text-xs text-slate-400 font-mono">kg</span>
                  </div>
                </div>
              </div>

              {/* Realtime BMI insight */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-400">Estimated Current BMI:</span>
                  <div className="font-bold text-white font-mono mt-0.5">
                    {previewCalcs.bmi} · <span className="text-emerald-400 font-sans">{previewCalcs.bmiCategory}</span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-400">
                  Target delta: {Number((formData.targetWeight - formData.weight).toFixed(1))} kg
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: GOAL & ACTIVITY LEVEL */}
        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Your Goal & Activity</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your focus and typical daily physical exertion.
              </p>
            </div>

            {/* Goal Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 block">Select Primary Goal</label>
              {[
                { id: 'lose_weight', title: 'Lose Weight', subtitle: 'Moderate caloric deficit targeting fat reduction (-500 kcal)' },
                { id: 'gain_weight', title: 'Gain Weight / Muscle', subtitle: 'Caloric surplus with high-protein hypertrophy (+350 kcal)' },
                { id: 'maintain_weight', title: 'Maintain Weight', subtitle: 'Metabolic equilibrium and body recomposition' },
              ].map((g) => (
                <div
                  key={g.id}
                  onClick={() => setFormData({ ...formData, goal: g.id as FitnessGoal })}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    formData.goal === g.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{g.title}</span>
                    {formData.goal === g.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{g.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Activity Level Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-medium text-slate-300 block">Activity Level</label>
              <select
                value={formData.activityLevel}
                onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value as ActivityLevel })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs focus:border-emerald-500 outline-none"
              >
                <option value="sedentary">Sedentary (Desk job, minimal movement)</option>
                <option value="lightly_active">Lightly Active (1-3 workout days/wk)</option>
                <option value="moderately_active">Moderately Active (3-5 workout days/wk)</option>
                <option value="very_active">Very Active (6-7 intense days/wk)</option>
                <option value="extremely_active">Extremely Active (Athletic training / physical labor)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 4: NUTRITION & LIFESTYLE */}
        {step === 4 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Nutrition & Habits</h2>
              <p className="text-xs text-slate-400 mt-1">
                Customize your meal plans, dietary preferences, and water/sleep targets.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Food Preference</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'vegetarian', label: 'Vegetarian' },
                    { id: 'non_vegetarian', label: 'Non-Vegetarian' },
                    { id: 'eggetarian', label: 'Eggetarian' },
                    { id: 'vegan', label: 'Vegan' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, foodPreference: p.id as FoodPreference })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        formData.foodPreference === p.id
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Daily Water (ml)</label>
                  <input
                    type="number"
                    step="250"
                    min="1500"
                    max="6000"
                    value={formData.dailyWaterGoal}
                    onChange={(e) => setFormData({ ...formData, dailyWaterGoal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Sleep Goal (hrs)</label>
                  <input
                    type="number"
                    min="5"
                    max="12"
                    value={formData.sleepGoal}
                    onChange={(e) => setFormData({ ...formData, sleepGoal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Meals Per Day</label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, mealsPerDay: num })}
                      className={`py-2 rounded-xl border text-xs font-bold font-mono transition-colors ${
                        formData.mealsPerDay === num
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {num} Meals
                    </button>
                  ))}
                </div>
              </div>

              {/* Instant Calculated Plan Summary Box */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 text-xs space-y-1.5">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block">
                  Computed Preview
                </span>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-300">Daily Calorie Target:</span>
                  <span className="font-mono font-bold text-white text-base">
                    {previewCalcs.targetCalories} kcal
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-[11px] text-slate-400">
                  <span>Protein Target:</span>
                  <span className="font-mono text-amber-300 font-semibold">{previewCalcs.targetProtein}g / day</span>
                </div>
                <div className="flex justify-between items-baseline text-[11px] text-slate-400">
                  <span>Weekly Pace:</span>
                  <span className="font-mono text-cyan-300">~{Math.abs(previewCalcs.estimatedWeeklyChangeKg)} kg / week</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <div className="p-6 pt-3 pb-6 border-t border-slate-900 flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-slate-900 text-slate-300 hover:text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
        >
          <span>{step === 4 ? 'Calculate My Plan' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
