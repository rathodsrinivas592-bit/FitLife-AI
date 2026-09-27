import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { Exercise } from '../../types';
import { ExerciseDemo } from './ExerciseDemo';

interface SingleExerciseModalProps {
  exercise: Exercise;
  onClose: () => void;
}

export const SingleExerciseModal: React.FC<SingleExerciseModalProps> = ({ exercise, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl relative my-auto max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase font-mono tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>3D Exercise Studio</span>
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close demo"
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded ExerciseDemo Component */}
        <ExerciseDemo exercise={exercise} />
      </div>
    </div>
  );
};
