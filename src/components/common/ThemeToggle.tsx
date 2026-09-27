import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'switch' | 'full';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  className = '',
  showLabel = false,
}) => {
  const { isDarkMode, setIsDarkMode } = useApp();

  const toggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (variant === 'pill') {
    return (
      <button
        onClick={toggle}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
          isDarkMode
            ? 'bg-slate-900 border border-slate-800 text-amber-400 hover:bg-slate-850 hover:border-amber-400/40'
            : 'bg-white border border-slate-200 text-amber-500 shadow-sm hover:bg-slate-50'
        } ${className}`}
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span>Light</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
            <span>Dark</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'switch') {
    return (
      <button
        onClick={toggle}
        role="switch"
        aria-checked={isDarkMode}
        aria-label={isDarkMode ? 'Dark mode enabled' : 'Light mode enabled'}
        className={`w-14 h-7 rounded-full p-1 transition-colors duration-300 relative flex items-center shadow-inner cursor-pointer ${
          isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-amber-100 border border-amber-200'
        } ${className}`}
      >
        <div
          className={`w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center shadow-md transform ${
            isDarkMode
              ? 'translate-x-7 bg-slate-900 text-indigo-400'
              : 'translate-x-0 bg-white text-amber-500'
          }`}
        >
          {isDarkMode ? (
            <Moon className="w-3 h-3 fill-indigo-400/40" />
          ) : (
            <Sun className="w-3 h-3 fill-amber-500/40" />
          )}
        </div>
      </button>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`grid grid-cols-2 gap-2 w-full ${className}`}>
        {/* Dark Mode Card */}
        <button
          onClick={() => setIsDarkMode(true)}
          className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
            isDarkMode
              ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
              : 'bg-slate-100 border-slate-200 hover:border-slate-300 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
              <Moon className="w-4 h-4 fill-indigo-400/30" />
            </div>
            {isDarkMode && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" />
            )}
          </div>
          <div className="mt-3">
            <span className="font-bold text-xs block text-white">Midnight Dark</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">OLED high contrast</span>
          </div>
        </button>

        {/* Light Mode Card */}
        <button
          onClick={() => setIsDarkMode(false)}
          className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
            !isDarkMode
              ? 'bg-white border-amber-500 shadow-lg shadow-amber-500/10'
              : 'bg-slate-950 border-slate-800 hover:border-slate-700 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500">
              <Sun className="w-4 h-4 fill-amber-500/30" />
            </div>
            {!isDarkMode && (
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
            )}
          </div>
          <div className="mt-3">
            <span className="font-bold text-xs block text-slate-900">Daylight Light</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Clear sunlit visibility</span>
          </div>
        </button>
      </div>
    );
  }

  // Default 'icon' variant
  return (
    <button
      onClick={toggle}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDarkMode ? 'Switch to daylight mode' : 'Switch to midnight dark mode'}
      className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center active:scale-90 ${
        isDarkMode
          ? 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 shadow-sm'
          : 'bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 hover:text-indigo-700 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center transition-transform duration-500">
        {isDarkMode ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-500 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-500 fill-indigo-600/30 hover:-rotate-12" />
        )}
      </div>
      {showLabel && (
        <span className="ml-1.5 text-xs font-semibold">
          {isDarkMode ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};
