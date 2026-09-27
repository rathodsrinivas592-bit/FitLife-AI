import React, { useState } from 'react';
import { 
  Footprints, 
  Dumbbell, 
  Heart, 
  Droplet, 
  Moon, 
  Plus, 
  Flame, 
  Compass, 
  RotateCcw, 
  Activity as ActivityIcon, 
  Watch, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  ChevronRight, 
  TrendingUp, 
  Clock, 
  Play, 
  Zap,
  Calendar,
  Search,
  Trophy,
  Filter,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MetricRing } from '../common/MetricRing';
import { WORKOUT_DATABASE } from '../../data/sampleWorkouts';
import { ALL_EXERCISES_LIST, ExerciseDefinition } from '../../data/exerciseDatabase';
import { Workout, WorkoutCategory, Exercise } from '../../types';
import { WorkoutDetailModal } from '../workouts/WorkoutDetailModal';
import { LiveDemoWorkoutModal } from '../workouts/LiveDemoWorkoutModal';
import { SingleExerciseModal } from '../workouts/SingleExerciseModal';

export const ActivityScreen: React.FC = () => {
  const { 
    activitySubTab, 
    setActivitySubTab, 
    dailyMetrics, 
    userProfile, 
    addWater, 
    resetWater, 
    addSteps, 
    updateSleep, 
    isWearableConnected, 
    toggleWearableConnection,
    setIsAiModalOpen,
    setAiSuggestedPrompt,
    workoutHistory,
    calculationResults
  } = useApp();

  // Workout Section Sub-Navigation
  const [workoutSection, setWorkoutSection] = useState<'split' | 'programs' | 'library' | 'history'>('split');
  const [selectedSplitDay, setSelectedSplitDay] = useState<string>('Monday');
  const [selectedWorkoutCategory, setSelectedWorkoutCategory] = useState<string>('all');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState<string>('');
  const [selectedExerciseMuscle, setSelectedExerciseMuscle] = useState<string>('all');

  const [modalWorkout, setModalWorkout] = useState<Workout | null>(null);
  const [liveDemoWorkout, setLiveDemoWorkout] = useState<Workout | null>(null);
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  // Manual sleep picker state
  const [sleepHoursInput, setSleepHoursInput] = useState<number>(7);
  const [sleepMinutesInput, setSleepMinutesInput] = useState<number>(30);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState<boolean>(false);

  const subTabs = [
    { id: 'steps', label: 'Steps', icon: Footprints },
    { id: 'workout', label: 'Workouts', icon: Dumbbell },
    { id: 'heart_rate', label: 'Heart Rate', icon: Heart },
    { id: 'water', label: 'Water', icon: Droplet },
    { id: 'sleep', label: 'Sleep', icon: Moon },
  ];

  // Weekly steps mock data
  const weeklySteps = [
    { day: 'Mon', steps: 8420, goal: 10000 },
    { day: 'Tue', steps: 10150, goal: 10000 },
    { day: 'Wed', steps: 9340, goal: 10000 },
    { day: 'Thu', steps: 7200, goal: 10000 },
    { day: 'Fri', steps: 11200, goal: 10000 },
    { day: 'Sat', steps: 8900, goal: 10000 },
    { day: 'Sun (Today)', steps: dailyMetrics.steps, goal: 10000 },
  ];

  // Weekly sleep mock data
  const weeklySleep = [
    { day: 'Mon', hours: 7.2 },
    { day: 'Tue', hours: 7.8 },
    { day: 'Wed', hours: 6.9 },
    { day: 'Thu', hours: 8.1 },
    { day: 'Fri', hours: 7.5 },
    { day: 'Sat', hours: 8.4 },
    { day: 'Sun (Today)', hours: Number((dailyMetrics.sleepMinutes / 60).toFixed(1)) },
  ];

  // Intraday heart rate readings
  const hrTimeline = [
    { time: '06:00', bpm: 62 },
    { time: '08:30', bpm: 78 },
    { time: '11:00', bpm: 71 },
    { time: '13:30', bpm: 75 },
    { time: '16:00', bpm: 69 },
    { time: '18:15', bpm: 124 }, // Workout spike
    { time: '20:00', bpm: 72 }, // Current
  ];

  // Filter workouts
  const filteredWorkouts = selectedWorkoutCategory === 'all'
    ? WORKOUT_DATABASE
    : WORKOUT_DATABASE.filter(w => w.category === selectedWorkoutCategory);

  return (
    <div className="space-y-4">
      {/* Activity Top Navigation Sub-Tabs */}
      <section aria-label="Activity Categories Navigation" className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activitySubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivitySubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </section>

      {/* ==================== 1. STEPS TRACKER ==================== */}
      {activitySubTab === 'steps' && (
        <section aria-label="Steps Tracker" className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="flex items-center justify-between w-full mb-3 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Today's Activity Pedometer</span>
              <span className="font-mono text-emerald-400">Target: {dailyMetrics.stepGoal.toLocaleString()}</span>
            </div>

            <MetricRing 
              progress={(dailyMetrics.steps / dailyMetrics.stepGoal) * 100}
              size={170}
              strokeWidth={14}
              color="#10B981"
              backgroundColor="rgba(30, 41, 59, 0.7)"
            >
              <div className="flex flex-col items-center">
                <Footprints className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="text-2xl font-black text-white font-mono tracking-tight">
                  {dailyMetrics.steps.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Steps Today</span>
              </div>
            </MetricRing>

            {/* Quick Stats: Distance & Calories */}
            <div className="grid grid-cols-2 gap-3 w-full mt-5 pt-4 border-t border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-850">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-0.5">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Distance</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {dailyMetrics.distanceKm} <span className="text-xs text-slate-400 font-normal">km</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-850">
                <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-0.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Est. Burned</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {dailyMetrics.caloriesBurned} <span className="text-xs text-slate-400 font-normal">kcal</span>
                </div>
              </div>
            </div>

            {/* Quick Simulate Button */}
            <div className="w-full mt-4 flex items-center justify-between gap-2">
              <button
                onClick={() => addSteps(500)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Simulate Walk (+500 steps)</span>
              </button>
            </div>
          </div>

          {/* Weekly Step History Bar Chart */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Weekly Step History</span>
              <span className="text-[11px] text-slate-400 font-mono">Avg: 9,060 steps/day</span>
            </div>

            <div className="h-40 flex items-end justify-between gap-2 pt-4 px-1">
              {weeklySteps.map((item, i) => {
                const heightPct = Math.min(100, Math.round((item.steps / 12000) * 100));
                const isGoalMet = item.steps >= item.goal;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {(item.steps / 1000).toFixed(1)}k
                    </span>
                    <div 
                      className={`w-full rounded-t-lg transition-all ${
                        isGoalMet ? 'bg-emerald-400' : 'bg-slate-700 group-hover:bg-slate-600'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[34px]">
                      {item.day.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-800/80">
              * Step counts sync via simulated hardware pedometer layer, ready for Health Connect & Google Fit.
            </p>
          </div>
        </section>
      )}

      {/* ==================== 2. WORKOUT SECTION ==================== */}
      {activitySubTab === 'workout' && (
        <section aria-label="Workouts Section" className="space-y-4">
          {/* User Fitness Goal & Nutrition Alignment Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Flame className="w-4 h-4" />
                </span>
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                    Goal Aligned: {userProfile.goal.replace('_', ' ').toUpperCase()}
                  </span>
                  <h4 className="text-sm font-bold text-white">
                    {userProfile.goal === 'lose_weight' ? 'High Metabolic Density & Caloric Deficit' : 'Progressive Hypertrophy & Protein Surplus'}
                  </h4>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono">
                <span className="text-slate-400 block">Daily Target</span>
                <span className="font-bold text-emerald-400">{calculationResults.targetCalories} kcal</span>
                <span className="text-slate-300 block">{calculationResults.targetProtein}g Protein</span>
              </div>
            </div>
          </div>

          {/* Workout Navigation Sub-Tabs */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-semibold gap-1">
            <button
              onClick={() => setWorkoutSection('split')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                workoutSection === 'split'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Weekly Split</span>
            </button>
            <button
              onClick={() => setWorkoutSection('programs')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                workoutSection === 'programs'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Programs</span>
            </button>
            <button
              onClick={() => setWorkoutSection('library')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                workoutSection === 'library'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Exercise Library</span>
            </button>
            <button
              onClick={() => setWorkoutSection('history')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                workoutSection === 'history'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </div>

          {/* ================= VIEW 1: WEEKLY GYM SPLIT ================= */}
          {workoutSection === 'split' && (
            <div className="space-y-4">
              {/* Day Selector Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const).map((day) => {
                  const isDaySelected = selectedSplitDay === day;
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedSplitDay(day)}
                      className={`px-3 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                        isDaySelected
                          ? 'bg-white text-slate-950 shadow-md'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>{day.slice(0, 3)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Day Workout Display */}
              {(() => {
                const dayWorkout = WORKOUT_DATABASE.find(w => w.splitDay === selectedSplitDay);
                if (!dayWorkout) return null;
                return (
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase font-mono tracking-wider">
                            {selectedSplitDay.toUpperCase()} SPLIT
                          </span>
                          <span className="text-xs text-slate-400">{dayWorkout.durationMinutes} mins · {dayWorkout.caloriesBurned} kcal</span>
                        </div>
                        <h3 className="text-base font-bold text-white">{dayWorkout.title}</h3>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{dayWorkout.description}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => setLiveDemoWorkout(dayWorkout)}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>Start 3D Live Workout</span>
                      </button>

                      <button
                        onClick={() => setModalWorkout(dayWorkout)}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>View Routine Plan</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Exercises in Split */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Exercises ({dayWorkout.exercises.length})
                      </span>
                      <div className="space-y-2">
                        {dayWorkout.exercises.map((ex, idx) => (
                          <div
                            key={ex.id || idx}
                            onClick={() => setPreviewExercise(ex)}
                            className="p-3 rounded-2xl bg-slate-950/80 border border-slate-850 hover:border-amber-500/50 flex items-center justify-between cursor-pointer transition-all group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-slate-800 text-[11px] font-mono font-bold flex items-center justify-center text-amber-400">
                                {idx + 1}
                              </span>
                              <div>
                                <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors block">
                                  {ex.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {ex.sets} Sets · {ex.reps} · {ex.targetMuscle}
                                </span>
                              </div>
                            </div>

                            <button className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 text-[10px] font-bold transition-all flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>3D Demo</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= VIEW 2: ALL WORKOUT PROGRAMS ================= */}
          {workoutSection === 'programs' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {['all', 'beginner', 'fat_loss', 'muscle_gain', 'strength', 'home', 'gym'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedWorkoutCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap capitalize transition-all ${
                      selectedWorkoutCategory === cat
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Workouts Grid */}
              <div className="space-y-3">
                {WORKOUT_DATABASE.filter(w => selectedWorkoutCategory === 'all' || w.category === selectedWorkoutCategory).map((workout) => (
                  <div
                    key={workout.id}
                    onClick={() => setModalWorkout(workout)}
                    className="p-4 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex flex-col justify-between group shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold uppercase font-mono">
                            {workout.level}
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {workout.categoryLabel}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                          {workout.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{workout.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0 ml-2" />
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{workout.durationMinutes} min</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1 font-mono text-amber-400">
                          <Flame className="w-3.5 h-3.5" />
                          <span>~{workout.caloriesBurned} kcal</span>
                        </div>
                        <span>·</span>
                        <span className="text-slate-300 font-medium">{workout.exercises.length} exercises</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLiveDemoWorkout(workout);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 border border-amber-500/30 text-amber-400 hover:text-slate-950 font-bold text-[11px] flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>3D Demo</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= VIEW 3: EXERCISE & ANATOMY LIBRARY ================= */}
          {workoutSection === 'library' && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search 40+ exercises (e.g. Bench, Squat, Lat Pulldown)..."
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Muscle Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                {['all', 'Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Core'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedExerciseMuscle(m)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                      selectedExerciseMuscle === m
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m === 'all' ? 'All Muscles' : m}
                  </button>
                ))}
              </div>

              {/* Exercises Grid */}
              <div className="space-y-2">
                {ALL_EXERCISES_LIST
                  .filter((ex) => {
                    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) || 
                      ex.targetMuscle.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
                    const matchesMuscle = selectedExerciseMuscle === 'all' || ex.muscleGroup === selectedExerciseMuscle;
                    return matchesSearch && matchesMuscle;
                  })
                  .map((ex) => (
                    <div
                      key={ex.exerciseId}
                      onClick={() => setPreviewExercise(ex)}
                      className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 cursor-pointer flex items-center justify-between transition-all group"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                            {ex.muscleGroup}
                          </span>
                          <span className="text-[10px] text-slate-400">{ex.equipment}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                          {ex.name}
                        </h4>
                        <span className="text-[11px] text-slate-400 block">
                          Target: {ex.targetMuscle} · {ex.sets} sets × {ex.reps}
                        </span>
                      </div>

                      <button className="px-3 py-1.5 rounded-xl bg-amber-500/15 group-hover:bg-amber-500 border border-amber-500/30 text-amber-400 group-hover:text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ml-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Launch 3D Demo</span>
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================= VIEW 4: WORKOUT HISTORY ================= */}
          {workoutSection === 'history' && (
            <div className="space-y-4">
              {/* Summary Stats Card */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Workouts</span>
                  <span className="text-lg font-black text-amber-400 font-mono mt-0.5 block">{workoutHistory.length}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Sets</span>
                  <span className="text-lg font-black text-white font-mono mt-0.5 block">
                    {workoutHistory.reduce((acc, h) => acc + h.setsCompleted, 0)}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Active Burn</span>
                  <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                    {workoutHistory.reduce((acc, h) => acc + h.caloriesBurned, 0)} kcal
                  </span>
                </div>
              </div>

              {/* History Items */}
              <div className="space-y-2">
                {workoutHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                          {item.dayOfWeek || item.date}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white">{item.workoutTitle}</h4>
                      <span className="text-[11px] text-slate-400">
                        {Math.round(item.durationSeconds / 60)} mins · {item.setsCompleted} sets · {item.repsCompleted} reps
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-amber-400 font-mono">
                        +{item.caloriesBurned} kcal
                      </span>
                      <span className="text-[10px] text-slate-500 block">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== 3. HEART RATE SECTION ==================== */}
      {activitySubTab === 'heart_rate' && (
        <section aria-label="Heart Rate Monitor" className="space-y-4">
          {/* Wearable Connection Hardware Toggle Warning */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Watch className={`w-4 h-4 ${isWearableConnected ? 'text-emerald-400' : 'text-slate-400'}`} />
              <div>
                <span className="font-semibold text-white block">
                  {isWearableConnected ? 'Smart Wearable: Connected' : 'No Wearable Connected'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isWearableConnected ? 'Receiving real-time PPG pulse data' : 'Optical pulse sensor disconnected'}
                </span>
              </div>
            </div>
            <button
              onClick={toggleWearableConnection}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                isWearableConnected 
                  ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {isWearableConnected ? 'Disconnect' : 'Connect Device'}
            </button>
          </div>

          {/* Conditional Display: If Disconnected vs Connected */}
          {!isWearableConnected ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Hardware Connection Required</h3>
              <p className="text-xs text-amber-300 leading-relaxed font-medium">
                "Connect a supported health device to view real heart-rate data."
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                Modern mobile phones cannot measure clinical heart rate accurately without an integrated photoplethysmography sensor or a connected smartwatch/chest strap.
              </p>
              <button
                onClick={toggleWearableConnection}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
              >
                Connect Simulated Smartwatch
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Active Heart Rate Reading Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-850 border border-slate-800 shadow-xl flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">Current Heart Rate</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black text-white font-mono tracking-tight">
                      {dailyMetrics.heartRateCurrent}
                    </span>
                    <span className="text-sm font-bold text-rose-400">BPM</span>
                  </div>
                  <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
                    <span>● Normal Resting Rhythm</span>
                  </div>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center">
                  <Heart className="w-8 h-8 text-rose-500 fill-rose-500 animate-heart-pulse" />
                </div>
              </div>

              {/* Resting & Avg Dual Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium block">Resting Heart Rate</span>
                  <span className="text-xl font-bold text-white font-mono mt-0.5 block">
                    {dailyMetrics.heartRateResting} <span className="text-xs text-slate-400 font-normal">BPM</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">Optimal baseline</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium block">Daily Average</span>
                  <span className="text-xl font-bold text-white font-mono mt-0.5 block">
                    {dailyMetrics.heartRateAvg} <span className="text-xs text-slate-400 font-normal">BPM</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Max recorded: 128</span>
                </div>
              </div>

              {/* Heart Rate Timeline Chart */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Today's Heart Rate Curve</span>
                  <span className="text-[10px] text-slate-400 font-mono">BPM Range: 62 - 124</span>
                </div>

                {/* SVG Curve Chart */}
                <div className="h-32 w-full pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 90">
                    <polyline
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="10,65 55,42 105,52 155,48 205,56 245,15 285,50"
                    />
                    {/* Data dots */}
                    {[
                      { x: 10, y: 65, v: 62 },
                      { x: 55, y: 42, v: 78 },
                      { x: 105, y: 52, v: 71 },
                      { x: 155, y: 48, v: 75 },
                      { x: 205, y: 56, v: 69 },
                      { x: 245, y: 15, v: 124 },
                      { x: 285, y: 50, v: 72 },
                    ].map((dot, idx) => (
                      <circle key={idx} cx={dot.x} cy={dot.y} r="3.5" className="fill-rose-500 stroke-slate-900 stroke-2" />
                    ))}
                  </svg>

                  <div className="flex justify-between text-[9px] text-slate-400 mt-2 font-mono">
                    <span>06:00</span>
                    <span>09:00</span>
                    <span>12:00</span>
                    <span>15:00</span>
                    <span>18:00</span>
                    <span>Now</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== 4. WATER TRACKER ==================== */}
      {activitySubTab === 'water' && (
        <section aria-label="Water Hydration Tracker" className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col items-center text-center relative overflow-hidden">
            <div className="flex items-center justify-between w-full mb-3 text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Daily Hydration Goal</span>
              <button
                onClick={resetWater}
                className="text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                title="Reset Intake"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Water Wave Progress Cup Visualization */}
            <div className="relative w-36 h-48 rounded-3xl border-4 border-slate-800 bg-slate-950 overflow-hidden shadow-inner flex flex-col justify-end">
              <div 
                className="w-full bg-gradient-to-t from-cyan-600 to-sky-400 transition-all duration-700 ease-out relative"
                style={{ height: `${Math.min(100, (dailyMetrics.waterConsumedMl / userProfile.dailyWaterGoal) * 100)}%` }}
              >
                <div className="absolute top-0 left-0 right-0 h-2 bg-white/30" />
              </div>

              {/* Center Water Overlay Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Droplet className="w-5 h-5 text-white/80 mb-1" />
                <span className="text-xl font-black text-white font-mono">
                  {(dailyMetrics.waterConsumedMl / 1000).toFixed(2)}L
                </span>
                <span className="text-[10px] text-slate-300 font-mono">
                  of {(userProfile.dailyWaterGoal / 1000).toFixed(1)}L
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 w-full mt-5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-850">
                <span className="text-[10px] text-slate-400 block">Consumed</span>
                <span className="font-bold text-cyan-400 font-mono text-base block mt-0.5">
                  {dailyMetrics.waterConsumedMl} ml
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-850">
                <span className="text-[10px] text-slate-400 block">Remaining</span>
                <span className="font-bold text-slate-200 font-mono text-base block mt-0.5">
                  {Math.max(0, userProfile.dailyWaterGoal - dailyMetrics.waterConsumedMl)} ml
                </span>
              </div>
            </div>

            {/* Add Water Increments as requested: 250, 500, 750, 1000 */}
            <div className="w-full mt-4 space-y-2">
              <span className="text-xs text-slate-400 font-medium block text-left">Quick Log Intake:</span>
              <div className="grid grid-cols-4 gap-2">
                {[250, 500, 750, 1000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => addWater(amt)}
                    className="py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-cyan-300 border border-slate-750 text-xs font-bold font-mono transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
                  >
                    <span>+{amt}</span>
                    <span className="text-[9px] text-slate-400 font-normal">ml</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== 5. SLEEP TRACKER ==================== */}
      {activitySubTab === 'sleep' && (
        <section aria-label="Sleep Quality Tracker" className="space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Last Night's Sleep</span>
              <button
                onClick={() => setIsSleepModalOpen(true)}
                className="text-indigo-400 hover:underline text-[11px] font-medium"
              >
                + Log Sleep Manually
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Sleep Duration</span>
                <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
                  {Math.floor(dailyMetrics.sleepMinutes / 60)}h {dailyMetrics.sleepMinutes % 60}m
                </div>
                <span className="text-xs text-indigo-400 font-medium">
                  {dailyMetrics.sleepMinutes >= userProfile.sleepGoal * 60 ? 'Optimal recovery achieved' : 'Light sleep deficit'}
                </span>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Moon className="w-8 h-8" />
              </div>
            </div>

            {/* Consistency & Goal Stats */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-850">
                <span className="text-[10px] text-slate-400 block">Sleep Goal</span>
                <span className="text-base font-bold text-white font-mono mt-0.5 block">{userProfile.sleepGoal}h 00m</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-850">
                <span className="text-[10px] text-slate-400 block">Consistency Score</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-0.5 block">88% (Excellent)</span>
              </div>
            </div>
          </div>

          {/* Weekly Sleep Chart */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Weekly Sleep Duration</span>
              <span className="text-[10px] text-slate-400 font-mono">Goal: 8.0h</span>
            </div>

            <div className="h-36 flex items-end justify-between gap-2 pt-4 px-1">
              {weeklySleep.map((item, i) => {
                const heightPct = Math.min(100, Math.round((item.hours / 9.5) * 100));
                const isOptimal = item.hours >= 7.5;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.hours}h
                    </span>
                    <div 
                      className={`w-full rounded-t-lg transition-all ${
                        isOptimal ? 'bg-indigo-400' : 'bg-slate-700'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[34px]">
                      {item.day.slice(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Manual Sleep Entry Modal */}
          {isSleepModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
                <h4 className="font-bold text-white text-base">Record Sleep Hours</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Hours</label>
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={sleepHoursInput}
                      onChange={(e) => setSleepHoursInput(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={sleepMinutesInput}
                      onChange={(e) => setSleepMinutesInput(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsSleepModalOpen(false)}
                    className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      updateSleep(sleepHoursInput * 60 + sleepMinutesInput);
                      setIsSleepModalOpen(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
                  >
                    Save Sleep
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Workout Detail Modal if open */}
      {modalWorkout && (
        <WorkoutDetailModal
          workout={modalWorkout}
          onClose={() => setModalWorkout(null)}
        />
      )}

      {/* Live Demo Workout Modal if open */}
      {liveDemoWorkout && (
        <LiveDemoWorkoutModal
          workout={liveDemoWorkout}
          onClose={() => setLiveDemoWorkout(null)}
        />
      )}

      {/* Individual 3D Exercise Demo Modal if open */}
      {previewExercise && (
        <SingleExerciseModal
          exercise={previewExercise}
          onClose={() => setPreviewExercise(null)}
        />
      )}
    </div>
  );
};
