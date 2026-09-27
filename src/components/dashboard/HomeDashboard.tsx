import React, { useState } from 'react';
import { 
  Flame, 
  Footprints, 
  Droplet, 
  Moon, 
  Heart, 
  Dumbbell, 
  TrendingDown, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Plus, 
  Sparkles,
  Zap,
  Activity,
  Scan,
  Camera,
  Utensils,
  Play,
  Bell
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricRing } from '../common/MetricRing';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { WORKOUT_DATABASE } from '../../data/sampleWorkouts';
import { Workout } from '../../types';
import { LiveDemoWorkoutModal } from '../workouts/LiveDemoWorkoutModal';
import { ThemeToggle } from '../common/ThemeToggle';

export const HomeDashboard: React.FC = () => {
  const [activeDemoWorkout, setActiveDemoWorkout] = useState<Workout | null>(null);
  const { 
    userProfile, 
    dailyMetrics, 
    calculationResults, 
    meals, 
    toggleMealEaten, 
    setActiveTab, 
    setActivitySubTab, 
    addWater, 
    healthScore,
    setIsAiModalOpen,
    setAiSuggestedPrompt,
    setIsMealCalculatorOpen,
    setIsNotificationCenterOpen,
    notifications
  } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  const todayWeekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
  const todayWorkout = WORKOUT_DATABASE.find(w => w.splitDay === todayWeekday) || WORKOUT_DATABASE[0];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Dynamic progress percentages for the 4 core health goals
  const caloriesProgress = Math.min(100, Math.round(
    (dailyMetrics.caloriesConsumed / calculationResults.targetCalories) * 100
  ));
  const stepsProgress = Math.min(100, Math.round(
    (dailyMetrics.steps / dailyMetrics.stepGoal) * 100
  ));
  const waterProgress = Math.min(100, Math.round(
    (dailyMetrics.waterConsumedMl / userProfile.dailyWaterGoal) * 100
  ));
  const sleepGoalMinutes = userProfile.sleepGoal * 60;
  const sleepProgress = Math.min(100, Math.round(
    (dailyMetrics.sleepMinutes / sleepGoalMinutes) * 100
  ));

  return (
    <div className="space-y-3.5">
      {/* Top Bar Greeting */}
      <section aria-label="Daily Welcome" className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
            <Zap className="w-3 h-3 fill-emerald-400" />
            <span>Today's Energy</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
            {greeting()}, {userProfile.name}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <ThemeToggle variant="icon" />

          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            aria-label="Open reminders"
            className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors relative"
            title="Push Reminders & Schedule"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => {
              setAiSuggestedPrompt("What should I eat next based on my remaining calories?");
              setIsAiModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-slate-850 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>FitLife AI</span>
          </button>
        </div>
      </section>

      {/* Main Today's Calorie Goal Hero Card with Dynamic Circular Progress Ring */}
      <section 
        aria-label="Today's Nutrition Target"
        onClick={() => setActiveTab('diet')}
        className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-850 border border-slate-800 shadow-xl cursor-pointer hover:border-slate-700 transition-all relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Calories Target</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                {dailyMetrics.caloriesConsumed.toLocaleString()}
              </span>
              <span className="text-sm text-slate-400 font-mono">
                / {calculationResults.targetCalories.toLocaleString()} kcal
              </span>
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium font-mono">
              <span>{Math.max(0, calculationResults.targetCalories - dailyMetrics.caloriesConsumed)} kcal remaining</span>
            </div>
          </div>

          {/* Dynamic Circular Progress Indicator - Goal 1: Calories */}
          <MetricRing 
            progress={caloriesProgress} 
            size={90} 
            strokeWidth={9} 
            color="#10B981" 
            backgroundColor="rgba(30, 41, 59, 0.8)"
          >
            <div className="flex flex-col items-center">
              <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400 mb-0.5" />
              <span className="text-xs font-bold text-white font-mono leading-none">{caloriesProgress}%</span>
              <span className="text-[8px] text-slate-400 uppercase mt-0.5 font-medium">Goal</span>
            </div>
          </MetricRing>
        </div>

        {/* Macro quick badges */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Protein</span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {dailyMetrics.proteinConsumed}g
            </span>
            <span className="text-[10px] text-slate-400 font-mono"> / {calculationResults.targetProtein}g</span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Carbs</span>
            <span className="text-xs font-bold text-sky-400 font-mono">
              {dailyMetrics.carbsConsumed}g
            </span>
            <span className="text-[10px] text-slate-400 font-mono"> / {calculationResults.targetCarbs}g</span>
          </div>

          <div className="bg-slate-950/60 p-2 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 font-medium block">Fats</span>
            <span className="text-xs font-bold text-rose-400 font-mono">
              {dailyMetrics.fatConsumed}g
            </span>
            <span className="text-[10px] text-slate-400 font-mono"> / {calculationResults.targetFat}g</span>
          </div>
        </div>
      </section>

      {/* LIVE AI REAL MEAL CALORIE SCANNER BUTTON - PROMINENT ACTION */}
      <section aria-label="Real Meal Live Calculation">
        <button
          onClick={() => setIsMealCalculatorOpen(true)}
          className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/35 hover:border-emerald-400 transition-all flex items-center justify-between group shadow-lg active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
              <Scan className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white tracking-tight">Live AI Meal Calorie Scanner</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  NEW
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Click real meals or snap photos for instant macros</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
            <span>Calculate</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </section>

      {/* Quick Visual Rings Strip: 4 Core Health Goals at a glance */}
      <section aria-label="Core Health Goals Summary" className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Core Daily Goal Completion
          </span>
          <span className="text-[11px] font-mono font-bold text-emerald-400">
            {healthScore}% Overall
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Ring 1: Calories */}
          <div 
            onClick={() => setActiveTab('diet')}
            className="flex flex-col items-center p-2 rounded-xl bg-slate-950/60 hover:bg-slate-850 cursor-pointer transition-all border border-slate-850"
          >
            <MetricRing 
              progress={caloriesProgress}
              size={52}
              strokeWidth={5}
              color="#10B981"
              backgroundColor="rgba(30, 41, 59, 0.7)"
            >
              <span className="text-[10px] font-bold font-mono text-white">{caloriesProgress}%</span>
            </MetricRing>
            <span className="text-[10px] font-medium text-slate-300 mt-1.5">Calories</span>
            <span className="text-[9px] text-slate-400 font-mono">{dailyMetrics.caloriesConsumed}</span>
          </div>

          {/* Ring 2: Steps */}
          <div 
            onClick={() => { setActiveTab('activity'); setActivitySubTab('steps'); }}
            className="flex flex-col items-center p-2 rounded-xl bg-slate-950/60 hover:bg-slate-850 cursor-pointer transition-all border border-slate-850"
          >
            <MetricRing 
              progress={stepsProgress}
              size={52}
              strokeWidth={5}
              color="#14B8A6"
              backgroundColor="rgba(30, 41, 59, 0.7)"
            >
              <span className="text-[10px] font-bold font-mono text-white">{stepsProgress}%</span>
            </MetricRing>
            <span className="text-[10px] font-medium text-slate-300 mt-1.5">Steps</span>
            <span className="text-[9px] text-slate-400 font-mono">{(dailyMetrics.steps / 1000).toFixed(1)}k</span>
          </div>

          {/* Ring 3: Water */}
          <div 
            onClick={() => { setActiveTab('activity'); setActivitySubTab('water'); }}
            className="flex flex-col items-center p-2 rounded-xl bg-slate-950/60 hover:bg-slate-850 cursor-pointer transition-all border border-slate-850"
          >
            <MetricRing 
              progress={waterProgress}
              size={52}
              strokeWidth={5}
              color="#06B6D4"
              backgroundColor="rgba(30, 41, 59, 0.7)"
            >
              <span className="text-[10px] font-bold font-mono text-white">{waterProgress}%</span>
            </MetricRing>
            <span className="text-[10px] font-medium text-slate-300 mt-1.5">Water</span>
            <span className="text-[9px] text-slate-400 font-mono">{(dailyMetrics.waterConsumedMl / 1000).toFixed(1)}L</span>
          </div>

          {/* Ring 4: Sleep */}
          <div 
            onClick={() => { setActiveTab('activity'); setActivitySubTab('sleep'); }}
            className="flex flex-col items-center p-2 rounded-xl bg-slate-950/60 hover:bg-slate-850 cursor-pointer transition-all border border-slate-850"
          >
            <MetricRing 
              progress={sleepProgress}
              size={52}
              strokeWidth={5}
              color="#818CF8"
              backgroundColor="rgba(30, 41, 59, 0.7)"
            >
              <span className="text-[10px] font-bold font-mono text-white">{sleepProgress}%</span>
            </MetricRing>
            <span className="text-[10px] font-medium text-slate-300 mt-1.5">Sleep</span>
            <span className="text-[9px] text-slate-400 font-mono">{(dailyMetrics.sleepMinutes / 60).toFixed(1)}h</span>
          </div>
        </div>
      </section>

      {/* Vital Metric Cards Grid with Dynamic Circular Progress Indicators */}
      <section aria-label="Vital Health Metrics" className="grid grid-cols-2 gap-3">
        {/* Dynamic Circular Progress Indicator - Goal 2: Steps Card */}
        <div 
          onClick={() => { setActiveTab('activity'); setActivitySubTab('steps'); }}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Footprints className="w-4 h-4" />
            </div>

            {/* Circular Progress Ring for Steps */}
            <MetricRing 
              progress={stepsProgress} 
              size={48} 
              strokeWidth={5} 
              color="#14B8A6" 
              backgroundColor="rgba(30, 41, 59, 0.8)"
            >
              <span className="text-[10px] font-mono font-bold text-teal-400">{stepsProgress}%</span>
            </MetricRing>
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-slate-400 font-medium">Steps Today</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {dailyMetrics.steps.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Goal: {dailyMetrics.stepGoal.toLocaleString()}</span>
          </div>
        </div>

        {/* Dynamic Circular Progress Indicator - Goal 3: Water Card */}
        <div 
          onClick={() => { setActiveTab('activity'); setActivitySubTab('water'); }}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between relative group"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Droplet className="w-4 h-4" />
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={(e) => { e.stopPropagation(); addWater(250); }}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-colors"
                title="Quick Add 250ml"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>

              {/* Circular Progress Ring for Water */}
              <MetricRing 
                progress={waterProgress} 
                size={48} 
                strokeWidth={5} 
                color="#06B6D4" 
                backgroundColor="rgba(30, 41, 59, 0.8)"
              >
                <span className="text-[10px] font-mono font-bold text-cyan-400">{waterProgress}%</span>
              </MetricRing>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-slate-400 font-medium">Water Intake</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {(dailyMetrics.waterConsumedMl / 1000).toFixed(1)}L <span className="text-xs font-normal text-slate-400">/ {(userProfile.dailyWaterGoal / 1000).toFixed(1)}L</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-mono">{waterProgress}% reached</span>
          </div>
        </div>

        {/* Dynamic Circular Progress Indicator - Goal 4: Sleep Card */}
        <div 
          onClick={() => { setActiveTab('activity'); setActivitySubTab('sleep'); }}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Moon className="w-4 h-4" />
            </div>

            {/* Circular Progress Ring for Sleep */}
            <MetricRing 
              progress={sleepProgress} 
              size={48} 
              strokeWidth={5} 
              color="#818CF8" 
              backgroundColor="rgba(30, 41, 59, 0.8)"
            >
              <span className="text-[10px] font-mono font-bold text-indigo-300">{sleepProgress}%</span>
            </MetricRing>
          </div>

          <div className="mt-3">
            <span className="text-[11px] text-slate-400 font-medium">Sleep Duration</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {Math.floor(dailyMetrics.sleepMinutes / 60)}h {dailyMetrics.sleepMinutes % 60}m
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Goal: {userProfile.sleepGoal}h 00m</span>
          </div>
        </div>

        {/* Heart Rate Card */}
        <div 
          onClick={() => { setActiveTab('activity'); setActivitySubTab('heart_rate'); }}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4 fill-rose-500 animate-heart-pulse" />
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Rest: {dailyMetrics.heartRateResting}</span>
          </div>
          <div className="mt-3">
            <span className="text-[11px] text-slate-400 font-medium">Heart Rate</span>
            <div className="text-lg font-bold text-white font-mono mt-0.5">
              {dailyMetrics.heartRateCurrent} <span className="text-xs text-rose-400">BPM</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Avg: {dailyMetrics.heartRateAvg} BPM</span>
          </div>
        </div>
      </section>

      {/* Today's Diet Section */}
      <section aria-label="Today's Meal Plan" className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Today's Diet Plan</span>
            <span className="text-[11px] text-slate-400 font-mono">
              ({meals.filter(m => m.isEaten).length}/{meals.length} eaten)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMealCalculatorOpen(true)}
              className="text-xs text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Meal</span>
            </button>
            <button
              onClick={() => setActiveTab('diet')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-0.5"
            >
              <span>View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {meals.slice(0, 4).map((meal) => (
            <div 
              key={meal.id}
              onClick={() => toggleMealEaten(meal.id)}
              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                meal.isEaten 
                  ? 'bg-slate-950/60 border-slate-800/80 text-slate-400' 
                  : 'bg-slate-850/80 border-slate-750 text-white hover:border-emerald-500/40'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-lg shrink-0">{meal.icon || '🍽️'}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-[10px]">
                      {meal.category.replace('_', ' ')}
                    </span>
                    {meal.isIndian && (
                      <span className="text-[9px] px-1 rounded bg-amber-500/10 text-amber-300 font-mono">
                        Desi
                      </span>
                    )}
                  </div>
                  <h4 className={`text-xs font-medium truncate ${meal.isEaten ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                    {meal.name}
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 ml-2">
                <div className="text-right">
                  <span className="text-xs font-bold font-mono block">{meal.calories} kcal</span>
                  <span className="text-[10px] text-amber-400 font-mono">{meal.protein}g P</span>
                </div>
                {meal.isEaten ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400 shrink-0" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Workout & Weight Progress Duo */}
      <section aria-label="Activity & Weight Glance" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Workout Glance */}
        <div 
          onClick={() => { setActiveTab('activity'); setActivitySubTab('workout'); }}
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-emerald-400" />
                Today's Workout ({todayWeekday})
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider font-mono">3D Studio</span>
            </div>
            <div className="mt-2.5">
              <h4 className="text-sm font-semibold text-white">{todayWorkout.title}</h4>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>⏱ {todayWorkout.durationMinutes} min</span>
                <span>·</span>
                <span>🔥 ~{todayWorkout.caloriesBurned} kcal</span>
                <span>·</span>
                <span className="text-amber-400">{todayWorkout.exercises.length} exercises</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">3D Anatomical Demonstration</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDemoWorkout(todayWorkout);
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold flex items-center gap-1 transition-colors"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              <span>Launch 3D</span>
            </button>
          </div>
        </div>

        {/* Weight Progress Glance */}
        <div 
          onClick={() => setActiveTab('progress')}
          className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-cyan-400" />
              Weight Progress
            </span>
            <span className="text-[11px] text-cyan-400 font-mono font-semibold">
              -3.5 kg
            </span>
          </div>
          <div className="mt-2.5">
            <div className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>76.5 kg</span>
              <span className="text-slate-400">→</span>
              <span className="text-cyan-400">{userProfile.targetWeight} kg</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">
              ~{Math.abs(Math.round((76.5 - userProfile.targetWeight) / 0.5))} weeks to target
            </p>
          </div>
        </div>
      </section>

      {/* Health Disclaimer */}
      <DisclaimerBanner compact />

      {/* Live Demo Workout Modal */}
      {activeDemoWorkout && (
        <LiveDemoWorkoutModal
          workout={activeDemoWorkout}
          onClose={() => setActiveDemoWorkout(null)}
        />
      )}
    </div>
  );
};
