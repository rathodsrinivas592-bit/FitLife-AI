import React, { useState } from 'react';
import { 
  X, 
  Play, 
  CheckCircle2, 
  Clock, 
  Flame, 
  Dumbbell, 
  Sparkles, 
  ChevronRight,
  Eye,
  Activity
} from 'lucide-react';
import { Workout } from '../../types';
import { useApp } from '../../context/AppContext';
import { ExerciseKineticDemo } from './ExerciseKineticDemo';
import { LiveDemoWorkoutModal } from './LiveDemoWorkoutModal';
import { SingleExerciseModal } from './SingleExerciseModal';
import { Exercise } from '../../types';

interface WorkoutDetailModalProps {
  workout: Workout;
  onClose: () => void;
}

export const WorkoutDetailModal: React.FC<WorkoutDetailModalProps> = ({ workout, onClose }) => {
  const { markWorkoutComplete, completedWorkouts, setIsAiModalOpen, setAiSuggestedPrompt } = useApp();
  const isCompleted = completedWorkouts.includes(workout.id);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState<number>(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [isLiveDemoOpen, setIsLiveDemoOpen] = useState<boolean>(false);
  const [selectedDemoIndex, setSelectedDemoIndex] = useState<number>(0);
  const [preview3dExercise, setPreview3dExercise] = useState<Exercise | null>(null);

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds);
    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLaunchLiveDemo = (exerciseIdx = 0) => {
    setSelectedDemoIndex(exerciseIdx);
    setIsLiveDemoOpen(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[92vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase tracking-wider font-mono">
                  {workout.level}
                </span>
                <span className="text-xs text-slate-400">· {workout.durationMinutes} mins</span>
              </div>
              <h3 className="font-bold text-white text-base mt-1">{workout.title}</h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Workout Meta Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Est. Calorie Burn</span>
              <span className="font-bold text-amber-400 font-mono mt-0.5 block">{workout.caloriesBurned} kcal</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Target Muscles</span>
              <span className="font-bold text-slate-200 truncate mt-0.5 block">{workout.targetMuscles[0]} & More</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Exercises</span>
              <span className="font-bold text-emerald-400 font-mono mt-0.5 block">{workout.exercises.length} Total</span>
            </div>
          </div>

          {/* Real Demo Workout Launcher Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-teal-950/70 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-md">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block">
                Interactive Follow-Along
              </span>
              <span className="text-xs font-semibold text-white">
                Convert Instructions to Live Demo
              </span>
            </div>
            <button
              onClick={() => handleLaunchLiveDemo(0)}
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/25 active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Start Live Demo</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {workout.description}
          </p>

          {/* Rest Timer Banner if triggered */}
          {restTimer !== null && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs animate-pulse">
              <span className="text-emerald-300 font-medium">Rest Timer Active:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{restTimer}s</span>
            </div>
          )}

          {/* Exercises List with Kinetic Demos replacing static instructions */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
            {workout.exercises.map((ex, idx) => {
              const isSelected = activeExerciseIndex === idx;
              return (
                <div
                  key={ex.id}
                  onClick={() => setActiveExerciseIndex(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-850/90 border-emerald-500/60 shadow-lg' 
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-mono text-emerald-400 font-bold">
                        {idx + 1}
                      </span>
                      <h5 className="font-semibold text-white text-xs">{ex.name}</h5>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">{ex.sets} sets × {ex.reps}</span>
                      <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90 text-emerald-400' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Real Demo Workout Component */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3" onClick={(e) => e.stopPropagation()}>
                      {/* Real Kinetic Demo Player replacing raw text */}
                      <ExerciseKineticDemo 
                        exercise={ex} 
                        compact={false}
                        onStartLiveDemo={() => handleLaunchLiveDemo(idx)}
                      />

                      {/* Quick Rest Timer & 3D Anatomy Triggers */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-amber-300 italic">💡 {ex.tips}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setPreview3dExercise(ex)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold text-[10px] flex items-center gap-1 transition-all"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>3D Anatomy</span>
                          </button>
                          <button
                            onClick={() => startRestTimer(ex.restSeconds)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-emerald-400 font-mono text-[10px]"
                          >
                            ⏱ Rest ({ex.restSeconds}s)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setAiSuggestedPrompt(`How can I improve my form on ${workout.exercises[activeExerciseIndex]?.name || 'pushups'}?`);
                setIsAiModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Form AI Tips</span>
            </button>

            <button
              onClick={() => handleLaunchLiveDemo(activeExerciseIndex)}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>Demo Mode</span>
            </button>

            <button
              onClick={() => {
                markWorkoutComplete(workout.id);
                onClose();
              }}
              disabled={isCompleted}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isCompleted
                  ? 'bg-slate-800 text-emerald-400 cursor-default'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25 active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Workout Completed ✓' : 'Mark Completed (+Burn)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Live Demo Workout Modal */}
      {isLiveDemoOpen && (
        <LiveDemoWorkoutModal
          workout={workout}
          initialExerciseIndex={selectedDemoIndex}
          onClose={() => setIsLiveDemoOpen(false)}
        />
      )}

      {/* 3D Anatomical Single Exercise Demo Modal */}
      {preview3dExercise && (
        <SingleExerciseModal
          exercise={preview3dExercise}
          onClose={() => setPreview3dExercise(null)}
        />
      )}
    </>
  );
};
