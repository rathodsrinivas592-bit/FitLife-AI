import React, { useState } from 'react';
import { 
  Flame, 
  RotateCcw, 
  RefreshCw, 
  CheckCircle2, 
  Circle, 
  Info, 
  Sparkles, 
  ArrowRightLeft, 
  UtensilsCrossed, 
  SlidersHorizontal,
  ChevronDown,
  X,
  Scan,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { FOOD_DATABASE, FoodOption, getEligibleFoods } from '../../data/sampleFoods';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { MealItem } from '../../types';

export const DietScreen: React.FC = () => {
  const { 
    userProfile, 
    calculationResults, 
    meals, 
    toggleMealEaten, 
    replaceMeal, 
    regenerateDietPlan, 
    setIsAiModalOpen,
    setAiSuggestedPrompt,
    setIsMealCalculatorOpen
  } = useApp();

  const [activeReplaceMeal, setActiveReplaceMeal] = useState<MealItem | null>(null);
  const [filterIndianOnly, setFilterIndianOnly] = useState<boolean>(false);
  const [showCalculatorDetails, setShowCalculatorDetails] = useState<boolean>(false);

  // Compute total planned macros
  const totalPlannedCalories = meals.reduce((sum, m) => sum + m.calories, 0);
  const totalPlannedProtein = meals.reduce((sum, m) => sum + m.protein, 0);
  const totalPlannedCarbs = meals.reduce((sum, m) => sum + m.carbs, 0);
  const totalPlannedFat = meals.reduce((sum, m) => sum + m.fat, 0);

  // Replacement foods candidate list
  const replacementCandidates: FoodOption[] = activeReplaceMeal
    ? getEligibleFoods(activeReplaceMeal.category, userProfile.foodPreference, userProfile.allergies)
        .filter(f => !filterIndianOnly || f.isIndian)
    : [];

  return (
    <div className="space-y-3.5">
      {/* Title & Actions */}
      <section aria-label="Diet Header" className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white tracking-tight">Personalized Diet Plan</h1>
          <p className="text-xs text-slate-400 capitalize">
            {userProfile.goal.replace('_', ' ')} · {userProfile.foodPreference.replace('_', ' ')}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMealCalculatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-sm"
          >
            <Scan className="w-3.5 h-3.5" />
            <span>AI Calorie Scan</span>
          </button>

          <button
            onClick={regenerateDietPlan}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs transition-colors"
            title="Refresh Meal Plan"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </section>

      {/* LIVE AI MEAL SCANNER INTERACTIVE CARD */}
      <section 
        onClick={() => setIsMealCalculatorOpen(true)}
        className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/35 hover:border-emerald-400 cursor-pointer transition-all flex items-center justify-between group shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
            <Scan className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight">Click Real Meal for Live Calorie Calculation</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">AI</span>
            </div>
            <p className="text-[11px] text-slate-400">Rotis, Paneer, Biryani, Dosa, Eggs, or upload photo</p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
          Open →
        </span>
      </section>

      {/* Calorie Calculator Breakdown Card */}
      <section aria-label="Calorie Calculator Metrics" className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-300">Daily Calorie Target</span>
              <div className="text-lg font-extrabold text-white font-mono">
                {calculationResults.targetCalories.toLocaleString()} <span className="text-xs text-slate-400 font-normal">kcal</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-emerald-400 block font-mono">
              {calculationResults.calorieDifference > 0 
                ? `+${calculationResults.calorieDifference} kcal` 
                : calculationResults.calorieDifference < 0 
                ? `${calculationResults.calorieDifference} kcal` 
                : 'Balanced'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ~{Math.abs(calculationResults.estimatedWeeklyChangeKg)} kg / wk
            </span>
          </div>
        </div>

        {/* Toggleable Mifflin-St Jeor details */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <button
            onClick={() => setShowCalculatorDetails(!showCalculatorDetails)}
            className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1 font-medium">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Mifflin-St Jeor Formula
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              {showCalculatorDetails ? 'Hide' : 'View BMR / TDEE'}
            </span>
          </button>

          {showCalculatorDetails && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>BMR (Basal Metabolic Rate):</span>
                <span className="font-mono font-bold text-white">{calculationResults.bmr} kcal</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>TDEE ({userProfile.activityLevel.replace('_', ' ')}):</span>
                <span className="font-mono font-bold text-white">{calculationResults.tdee} kcal</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Target Offset ({userProfile.goal.replace('_', ' ')}):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {calculationResults.calorieDifference >= 0 ? `+${calculationResults.calorieDifference}` : calculationResults.calorieDifference} kcal
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Macro Split Totals & Visual Progress */}
      <section aria-label="Macronutrient Balance" className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Macro Targets</span>
          <span className="text-[11px] text-slate-400 font-mono">
            {totalPlannedCalories} / {calculationResults.targetCalories} kcal
          </span>
        </div>

        <div className="space-y-2 text-xs">
          {/* Protein Bar */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="font-medium text-amber-300">Protein ({calculationResults.targetProtein}g target)</span>
              <span className="font-mono font-bold text-amber-400">{totalPlannedProtein}g</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalPlannedProtein / calculationResults.targetProtein) * 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs Bar */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="font-medium text-sky-300">Carbs ({calculationResults.targetCarbs}g target)</span>
              <span className="font-mono font-bold text-sky-400">{totalPlannedCarbs}g</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-sky-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalPlannedCarbs / calculationResults.targetCarbs) * 100)}%` }}
              />
            </div>
          </div>

          {/* Fat Bar */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span className="font-medium text-rose-300">Fat ({calculationResults.targetFat}g target)</span>
              <span className="font-mono font-bold text-rose-400">{totalPlannedFat}g</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-rose-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (totalPlannedFat / calculationResults.targetFat) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Daily Meals Breakdown */}
      <section aria-label="Daily Meal Cards" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scheduled Meals</h3>
          <button
            onClick={() => setIsMealCalculatorOpen(true)}
            className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Real Meal</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {meals.map((meal) => (
            <div
              key={meal.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                meal.isEaten 
                  ? 'bg-slate-950/70 border-slate-800/80 text-slate-400' 
                  : 'bg-slate-900 border-slate-800 text-white hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="text-2xl shrink-0 mt-0.5">{meal.icon || '🍽️'}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {meal.category.replace('_', ' ')}
                      </span>
                      {meal.isIndian && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-mono">
                          Indian
                        </span>
                      )}
                    </div>
                    <h4 className={`text-sm font-bold truncate mt-0.5 ${meal.isEaten ? 'line-through text-slate-400' : 'text-white'}`}>
                      {meal.name}
                    </h4>
                    <span className="text-xs text-slate-400 block">{meal.portion}</span>
                  </div>
                </div>

                {/* Eaten Checkbox & Calorie badge */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white block">{meal.calories} kcal</span>
                    <span className="text-[10px] text-amber-400">{meal.protein}g Protein</span>
                  </div>

                  <button
                    onClick={() => toggleMealEaten(meal.id)}
                    className="p-1 rounded-full text-slate-400 hover:text-emerald-400 transition-colors"
                    title={meal.isEaten ? "Mark as uneaten" : "Mark as eaten"}
                  >
                    {meal.isEaten ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-500 hover:text-emerald-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Macro breakdown line & Replace action */}
              <div className="mt-3 pt-2.5 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>P: <strong className="text-amber-400">{meal.protein}g</strong></span>
                  <span>C: <strong className="text-sky-400">{meal.carbs}g</strong></span>
                  <span>F: <strong className="text-rose-400">{meal.fat}g</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveReplaceMeal(meal)}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Swap Food</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Medical Disclaimer */}
      <DisclaimerBanner compact />

      {/* SWAP MEAL MODAL */}
      {activeReplaceMeal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-base">Swap {activeReplaceMeal.name}</h3>
                <p className="text-xs text-slate-400">Select replacement matching your nutrition target</p>
              </div>
              <button onClick={() => setActiveReplaceMeal(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter toggle */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">Dietary Options:</span>
              <button
                onClick={() => setFilterIndianOnly(!filterIndianOnly)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  filterIndianOnly 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {filterIndianOnly ? '✓ Indian Desi Only' : 'All Options'}
              </button>
            </div>

            {/* Food Alternatives List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar text-xs">
              {replacementCandidates.map((food) => (
                <div
                  key={food.id}
                  onClick={() => {
                    replaceMeal(activeReplaceMeal.id, food.id);
                    setActiveReplaceMeal(null);
                  }}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xl shrink-0">{food.icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                          {food.name}
                        </span>
                        {food.isIndian && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">
                            Indian
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 block">{food.portion}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2 font-mono">
                    <span className="font-bold text-white block">{food.calories} kcal</span>
                    <span className="text-[10px] text-amber-400">{food.protein}g Protein</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setActiveReplaceMeal(null);
                  setIsMealCalculatorOpen(true);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-500/20 transition-colors"
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Or Calculate Real Custom Meal with AI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
