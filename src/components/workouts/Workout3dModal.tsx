import React, { useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Dumbbell, 
  Flame, 
  Clock, 
  Sparkles, 
  CheckCircle2,
  Info,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Workout } from '../../types';
import { Workout3dViewer } from './Workout3dViewer';
import { useApp } from '../../context/AppContext';

interface Workout3dModalProps {
  workout: Workout;
  initialExerciseIndex?: number;
  onClose: () => void;
}

export const Workout3dModal: React.FC<Workout3dModalProps> = ({ 
  workout, 
  initialExerciseIndex = 0, 
  onClose 
}) => {
  const { markWorkoutComplete, completedWorkouts, setAiSuggestedPrompt, setIsAiModalOpen } = useApp();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(initialExerciseIndex);
  const isCompleted = completedWorkouts.includes(workout.id);

  const currentExercise = workout.exercises[currentExerciseIndex] || workout.exercises[0];

  const handleNext = () => {
    if (currentExerciseIndex < workout.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-4 sm:p-5 flex flex-col max-h-[92vh] shadow-2xl overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase font-mono tracking-wider">
                3D Workout Studio
              </span>
              <span className="text-xs text-slate-400 capitalize">· {workout.categoryLabel}</span>
            </div>
            <h3 className="font-bold text-white text-base mt-0.5">{workout.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-750 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Biomechanical Interactive Viewer */}
        <div className="mt-3 shrink-0">
          <Workout3dViewer 
            exercise={currentExercise}
            workoutTitle={workout.title}
          />
        </div>

        {/* Exercise Switcher Navigation Carousel */}
        <div className="flex items-center justify-between mt-3 py-2 px-3 rounded-2xl bg-slate-950/70 border border-slate-850 shrink-0">
          <button
            onClick={handlePrev}
            disabled={currentExerciseIndex === 0}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all ${
              currentExerciseIndex === 0
                ? 'opacity-40 cursor-not-allowed text-slate-600'
                : 'text-emerald-400 bg-slate-900 hover:bg-slate-850'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          {/* Exercise Step Dots */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-mono text-slate-300 font-semibold">
              Exercise {currentExerciseIndex + 1} of {workout.exercises.length}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {workout.exercises.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentExerciseIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    currentExerciseIndex === i
                      ? 'w-5 bg-emerald-400'
                      : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                  }`}
                  title={`Exercise ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={currentExerciseIndex === workout.exercises.length - 1}
            className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl transition-all ${
              currentExerciseIndex === workout.exercises.length - 1
                ? 'opacity-40 cursor-not-allowed text-slate-600'
                : 'text-emerald-400 bg-slate-900 hover:bg-slate-850'
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Current Exercise Detail Card */}
        <div className="mt-3 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-center font-bold">
                {currentExerciseIndex + 1}
              </span>
              <span>{currentExercise.name}</span>
            </h4>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              {currentExercise.sets} sets × {currentExercise.reps}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Biomechanics & Instructions
            </span>
            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
              {currentExercise.instructions}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-850 text-xs">
            <span className="text-[11px] text-amber-300 flex items-center gap-1 font-medium">
              💡 {currentExercise.tips}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ⏱ Rest: {currentExercise.restSeconds}s
            </span>
          </div>
        </div>

        {/* Quick Muscle Breakdown & AI Guidance */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-400 block">Target Musculature</span>
            <span className="text-xs font-bold text-emerald-400 block mt-0.5 truncate">
              {currentExercise.targetMuscle}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-850">
            <span className="text-[10px] text-slate-400 block">Total Est. Calorie Burn</span>
            <span className="text-xs font-bold text-amber-400 block mt-0.5 font-mono">
              ~{workout.caloriesBurned} kcal
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            onClick={() => {
              setAiSuggestedPrompt(`Give me 3 precise biomechanical form cues to perfect my execution on ${currentExercise.name}.`);
              setIsAiModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Form Cues</span>
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
            <span>{isCompleted ? 'Workout Completed ✓' : 'Finish & Log Calories (+Burn)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
