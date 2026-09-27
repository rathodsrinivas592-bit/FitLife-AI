import React from 'react';
import { Home, Utensils, Activity, TrendingUp, User, Sparkles } from 'lucide-react';
import { AppTab, useApp } from '../../context/AppContext';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsAiModalOpen } = useApp();

  const navItems: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'diet', label: 'Diet', icon: Utensils },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around relative">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] min-h-[48px] rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </button>
          );
        })}

        {/* Quick AI Floating Action Trigger */}
        <button
          onClick={() => setIsAiModalOpen(true)}
          className="absolute -top-6 right-4 flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all"
          title="FitLife AI Assistant"
          aria-label="FitLife AI Assistant"
        >
          <Sparkles className="w-5 h-5 fill-slate-950 text-slate-950" />
        </button>
      </div>
    </nav>
  );
};
