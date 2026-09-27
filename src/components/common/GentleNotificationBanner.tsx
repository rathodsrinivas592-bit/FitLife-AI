import React, { useEffect } from 'react';
import { 
  X, 
  Droplet, 
  Dumbbell, 
  Bell, 
  Check, 
  ArrowRight, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import { AppNotification, NotificationAction } from '../../types';
import { useApp } from '../../context/AppContext';

interface GentleNotificationBannerProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onActionClick: (action: NotificationAction) => void;
}

export const GentleNotificationBanner: React.FC<GentleNotificationBannerProps> = ({
  notification,
  onDismiss,
  onActionClick,
}) => {
  useEffect(() => {
    if (!notification) return;

    // Auto-dismiss after 12 seconds if not interacted with
    const timer = setTimeout(() => {
      onDismiss();
    }, 12000);

    return () => clearTimeout(timer);
  }, [notification, onDismiss]);

  if (!notification) return null;

  const isWater = notification.type === 'water';
  const isWorkout = notification.type === 'workout';

  return (
    <div className="fixed top-12 left-0 right-0 z-50 px-3 sm:px-4 max-w-md mx-auto pointer-events-none animate-in slide-in-from-top-4 duration-300">
      <div className="pointer-events-auto p-4 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isWater 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                : isWorkout 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {isWater ? (
                <Droplet className="w-5 h-5 fill-cyan-400/40" />
              ) : isWorkout ? (
                <Dumbbell className="w-5 h-5" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 tracking-wider">
                  Push Reminder
                </span>
                <span className="text-[10px] text-slate-400">· Just Now</span>
              </div>
              <h4 className="text-sm font-bold text-white mt-0.5">{notification.title}</h4>
            </div>
          </div>

          <button
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Body */}
        <p className="text-xs text-slate-300 leading-relaxed pl-1">
          {notification.body}
        </p>

        {/* Actions Bar */}
        {notification.actions && notification.actions.length > 0 && (
          <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
            {notification.actions.map((act) => (
              <button
                key={act.id}
                onClick={() => onActionClick(act)}
                className={`py-1.5 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-95 ${
                  act.primary
                    ? isWater 
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20 font-bold'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
                }`}
              >
                {act.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
