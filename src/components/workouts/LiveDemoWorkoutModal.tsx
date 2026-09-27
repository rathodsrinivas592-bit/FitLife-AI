import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Flame, 
  Clock, 
  Heart, 
  CheckCircle2, 
  Trophy, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Wind
} from 'lucide-react';
import { Workout, Exercise } from '../../types';
import { getExerciseDemo } from '../../data/exerciseDemoRegistry';
import { ExerciseKineticDemo } from './ExerciseKineticDemo';
import { ExerciseDemo } from './ExerciseDemo';
import { audioFeedback } from '../../utils/audioFeedback';
import { useApp } from '../../context/AppContext';

interface LiveDemoWorkoutModalProps {
  workout: Workout;
  initialExerciseIndex?: number;
  onClose: () => void;
}

export const LiveDemoWorkoutModal: React.FC<LiveDemoWorkoutModalProps> = ({
  workout,
  initialExerciseIndex = 0,
  onClose,
}) => {
  const { markWorkoutComplete, saveWorkoutSession, userProfile } = useApp();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(initialExerciseIndex);
  const [demoViewMode, setDemoViewMode] = useState<'3d' | 'cadence'>('3d');
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [completedSetsCount, setCompletedSetsCount] = useState<number>(0);
  const [repCount, setRepCount] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);
  const [isActiveSession, setIsActiveSession] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Overall workout stats
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [caloriesBurnedLive, setCaloriesBurnedLive] = useState<number>(0);
  const [currentBpm, setCurrentBpm] = useState<number>(128);

  // Cadence / Rep Metronome state
  // tempo stages: 'down' -> 'pause' -> 'up' -> 'reset'
  const [tempoStage, setTempoStage] = useState<'down' | 'pause' | 'up' | 'reset'>('down');
  const [tempoCountdown, setTempoCountdown] = useState<number>(2);

  // Completion state
  const [isWorkoutCompleted, setIsWorkoutCompleted] = useState<boolean>(false);

  const currentExercise: Exercise = workout.exercises[currentExerciseIndex] || workout.exercises[0];
  const demoData = getExerciseDemo(currentExercise);

  // Parse target reps from string e.g. "12 reps", "8 - 10 reps", "30 secs"
  const targetRepsMatch = currentExercise.reps.match(/\d+/);
  const targetReps = targetRepsMatch ? parseInt(targetRepsMatch[0], 10) : 10;
  const isTimedExercise = currentExercise.reps.toLowerCase().includes('sec') || currentExercise.reps.toLowerCase().includes('min');

  // Metronome and workout timer refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Toggle Mute
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    audioFeedback.setMuted(next);
  };

  // Workout Duration & Live Calories ticker
  useEffect(() => {
    if (!isActiveSession || isWorkoutCompleted) return;

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        // METs estimation: ~0.15 - 0.22 kcal/sec for active bodyweight/strength workout
        const weightKg = userProfile?.weight || 75;
        const burnRatePerSec = (7.5 * 3.5 * weightKg) / (200 * 60); // standard MET formula
        setCaloriesBurnedLive(Math.round(next * burnRatePerSec * 1.1));

        // Heart rate fluctuation
        const baseBpm = isResting ? 105 : 138;
        const randomFluct = Math.floor(Math.sin(next * 0.2) * 6);
        setCurrentBpm(baseBpm + randomFluct);

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActiveSession, isWorkoutCompleted, isResting, userProfile?.weight]);

  // Exercise Cadence & Metronome Loop
  useEffect(() => {
    if (!isActiveSession || isResting || isWorkoutCompleted) return;

    const tempo = demoData.tempo;
    let stage: 'down' | 'pause' | 'up' | 'reset' = 'down';
    let timeLeft = tempo.down;
    setTempoStage('down');
    setTempoCountdown(timeLeft);

    const cadenceInterval = setInterval(() => {
      timeLeft -= 0.5;
      if (timeLeft <= 0) {
        // Transition to next tempo stage
        if (stage === 'down') {
          stage = 'pause';
          timeLeft = tempo.pause || 0.5;
        } else if (stage === 'pause') {
          stage = 'up';
          timeLeft = tempo.up || 1.5;
          if (!isMuted) audioFeedback.playRepTick();
        } else if (stage === 'up') {
          stage = 'reset';
          timeLeft = tempo.reset || 1.0;
        } else {
          // Completed one full repetition!
          stage = 'down';
          timeLeft = tempo.down || 2.0;
          setRepCount((prevReps) => {
            const nextReps = prevReps + 1;
            if (!isMuted) audioFeedback.playRepTick();

            // Auto-check if target reps completed
            if (nextReps >= targetReps && targetReps > 0) {
              handleCompleteSet();
            }
            return nextReps;
          });
        }
        setTempoStage(stage);
      }
      setTempoCountdown(Math.max(0, Math.ceil(timeLeft)));
    }, 500);

    return () => clearInterval(cadenceInterval);
  }, [isActiveSession, isResting, isWorkoutCompleted, currentExerciseIndex, currentSet, isMuted, targetReps, demoData.tempo]);

  // Rest Timer loop
  useEffect(() => {
    if (!isResting) return;

    restTimerRef.current = setInterval(() => {
      setRestSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (!isMuted) audioFeedback.playCountdownTick(true);
          endRest();
          return 0;
        }
        if (prev <= 4 && prev > 1 && !isMuted) {
          audioFeedback.playCountdownTick(false);
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, [isResting, isMuted]);

  // Complete a set
  const handleCompleteSet = () => {
    if (!isMuted) audioFeedback.playSetCompleted();
    setCompletedSetsCount((prev) => prev + 1);

    if (currentSet < currentExercise.sets) {
      // More sets remaining in this exercise -> Start rest timer
      setCurrentSet((prev) => prev + 1);
      setRepCount(0);
      startRest(currentExercise.restSeconds || 45);
    } else {
      // All sets of this exercise finished
      if (currentExerciseIndex < workout.exercises.length - 1) {
        // Move to next exercise
        setCurrentExerciseIndex((prev) => prev + 1);
        setCurrentSet(1);
        setRepCount(0);
        startRest(60); // 60s transition between exercises
      } else {
        // All exercises in the workout finished!
        finishWorkout();
      }
    }
  };

  const startRest = (seconds: number) => {
    setIsResting(true);
    setRestSecondsRemaining(seconds);
    if (!isMuted) audioFeedback.playRestStart();
  };

  const endRest = () => {
    setIsResting(false);
    setRestSecondsRemaining(0);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
  };

  const skipRest = () => {
    endRest();
  };

  const addRestTime = (seconds: number) => {
    setRestSecondsRemaining((prev) => prev + seconds);
  };

  // Finish Workout
  const finishWorkout = () => {
    setIsWorkoutCompleted(true);
    setIsActiveSession(false);
    if (!isMuted) audioFeedback.playVictoryFanfare();
  };

  const handleSaveAndSync = () => {
    saveWorkoutSession({
      id: `session-${Date.now()}`,
      workoutId: workout.id,
      workoutTitle: workout.title,
      date: new Date().toISOString().split('T')[0],
      durationSeconds: secondsElapsed,
      caloriesBurned: caloriesBurnedLive || workout.caloriesBurned,
      exercisesCompleted: workout.exercises.length,
      setsCompleted: completedSetsCount || workout.exercises.length * 3,
      repsCompleted: (completedSetsCount || workout.exercises.length * 3) * 10,
      completedAt: new Date().toISOString(),
      dayOfWeek: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()),
    });
    markWorkoutComplete(workout.id);
    onClose();
  };

  // Helper formatting for seconds to MM:SS
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl relative my-auto max-h-[96vh] flex flex-col justify-between">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase font-mono tracking-wider">
                Live Demo Session
              </span>
              <span className="text-xs text-slate-400">
                Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">{workout.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onClose}
              aria-label="Close demo"
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live HUD (Time Elapsed · Calories · Heart Rate) */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Time Elapsed</span>
            </div>
            <span className="font-mono font-bold text-white text-sm">{formatTime(secondsElapsed)}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Burned</span>
            </div>
            <span className="font-mono font-bold text-amber-400 text-sm">~{caloriesBurnedLive} kcal</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
              <Heart className="w-3 h-3 text-rose-400 animate-pulse" />
              <span>Heart Rate</span>
            </div>
            <span className="font-mono font-bold text-rose-400 text-sm">{currentBpm} BPM</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* REST MODE BANNER / DIALOG */}
        {/* ============================================================== */}
        {isResting && (
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/40 text-center space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold">
              <Wind className="w-3.5 h-3.5" />
              <span>Recovery & Breathing Interval</span>
            </div>

            {/* Circular Countdown Ring */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="#1e293b" strokeWidth="8" fill="none" />
                <circle 
                  cx="56" 
                  cy="56" 
                  r="48" 
                  stroke="#10b981" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="301.6" 
                  strokeDashoffset={301.6 * (1 - restSecondsRemaining / (currentExercise.restSeconds || 45))}
                  strokeLinecap="round" 
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
                <span className="text-3xl font-black text-white">{restSecondsRemaining}</span>
                <span className="text-[10px] text-slate-400 uppercase">seconds</span>
              </div>
            </div>

            <div className="text-xs text-slate-300">
              <span className="text-slate-400 block mb-1">Up Next:</span>
              <span className="font-bold text-white text-sm">
                Set {currentSet} of {currentExercise.sets} · {currentExercise.name}
              </span>
            </div>

            {/* Rest Actions */}
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => addRestTime(30)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
              >
                +30s Rest
              </button>
              <button
                onClick={skipRest}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                Skip & Start Set Now ➔
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* ACTIVE EXERCISE DEMO MODE */}
        {/* ============================================================== */}
        {!isResting && !isWorkoutCompleted && (
          <div className="space-y-4">
            {/* Exercise Title & Set Tracker */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase block font-semibold">
                  Active Movement Demo
                </span>
                <h4 className="text-base font-bold text-white">{currentExercise.name}</h4>
              </div>

              {/* Set Indicator */}
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Current Set</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {currentSet} / {currentExercise.sets}
                </span>
              </div>
            </div>

            {/* View Mode Switcher: 3D Anatomical vs 2D Metronome */}
            <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <span className="text-[11px] text-slate-400 font-semibold px-2">Visualization:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setDemoViewMode('3d')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    demoViewMode === '3d'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3D Anatomical Studio
                </button>
                <button
                  onClick={() => setDemoViewMode('cadence')}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                    demoViewMode === 'cadence'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2D Tempo Cadence
                </button>
              </div>
            </div>

            {demoViewMode === '3d' ? (
              <ExerciseDemo 
                exercise={currentExercise}
                currentSet={currentSet}
                totalSets={currentExercise.sets}
                onSetCompleted={handleCompleteSet}
                compact={false}
              />
            ) : (
              <>
                {/* Embedded Kinetic Demo */}
                <div className="overflow-hidden">
                  <ExerciseKineticDemo exercise={currentExercise} compact={true} />
                </div>

                {/* Interactive Cadence & Rep Control Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Cadence Pacing
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-mono font-bold capitalize px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {tempoStage === 'down' && '⬇ Lowering (Eccentric)'}
                          {tempoStage === 'pause' && '⏸ Isometric Hold'}
                          {tempoStage === 'up' && '⬆ Drive / Squeeze (Concentric)'}
                          {tempoStage === 'reset' && '🔄 Reset Breath'}
                        </span>
                      </div>
                    </div>

                    {/* Rep Counter Display */}
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Target Reps</span>
                      <div className="flex items-baseline gap-1 font-mono justify-end">
                        <span className="text-2xl font-black text-white">{repCount}</span>
                        <span className="text-xs text-slate-400">/ {targetReps || 'Max'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Rep Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setRepCount((prev) => prev + 1);
                        if (!isMuted) audioFeedback.playRepTick();
                      }}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <span>+1 Rep Completed</span>
                    </button>

                    <button
                      onClick={handleCompleteSet}
                      className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Set Finished ✓</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Exercise Navigator (Prev / Next) */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <button
                disabled={currentExerciseIndex === 0}
                onClick={() => {
                  setCurrentExerciseIndex((prev) => Math.max(0, prev - 1));
                  setCurrentSet(1);
                  setRepCount(0);
                }}
                className="flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Prev Exercise</span>
              </button>

              <button
                onClick={finishWorkout}
                className="text-amber-400 hover:text-amber-300 font-medium underline text-[11px]"
              >
                Finish Early
              </button>

              <button
                disabled={currentExerciseIndex >= workout.exercises.length - 1}
                onClick={() => {
                  setCurrentExerciseIndex((prev) => Math.min(workout.exercises.length - 1, prev + 1));
                  setCurrentSet(1);
                  setRepCount(0);
                }}
                className="flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed hover:text-white"
              >
                <span>Next Exercise</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* WORKOUT COMPLETION CELEBRATION SUMMARY */}
        {/* ============================================================== */}
        {isWorkoutCompleted && (
          <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/40 text-center space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs uppercase font-mono font-bold text-emerald-400 block tracking-wider">
                Workout Complete!
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Outstanding Execution!</h3>
              <p className="text-xs text-slate-400 mt-1">
                You successfully mastered the demo movements for {workout.title}.
              </p>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Duration</span>
                <span className="text-base font-bold text-white font-mono mt-1 block">
                  {formatTime(secondsElapsed)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Active Burn</span>
                <span className="text-base font-bold text-amber-400 font-mono mt-1 block">
                  {caloriesBurnedLive} kcal
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sets Completed</span>
                <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">
                  {completedSetsCount} Sets
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSaveAndSync}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/30 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Save to Activity & Burn kcal</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
