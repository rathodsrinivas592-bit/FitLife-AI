import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Droplet, 
  Dumbbell, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Volume2, 
  Sparkles, 
  Send,
  RotateCcw,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { notificationService } from '../../services/notificationService';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    userProfile, 
    dailyMetrics, 
    completedWorkouts, 
    notifications, 
    triggerTestReminder, 
    updateProfile,
    browserPermission,
    requestNotificationPermission
  } = useApp();

  const [waterTime, setWaterTime] = useState<string>(userProfile.reminderTimes.water || '14:00');
  const [workoutTime, setWorkoutTime] = useState<string>(userProfile.reminderTimes.workout || '18:00');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const isWaterGoalMet = dailyMetrics.waterConsumedMl >= userProfile.dailyWaterGoal;
  const isWorkoutCompleted = completedWorkouts.length > 0;

  const handleSaveTimes = () => {
    updateProfile({
      reminderTimes: {
        ...userProfile.reminderTimes,
        water: waterTime,
        workout: workoutTime,
      },
    });
    setSaveStatus('Reminder times updated!');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleResetLog = () => {
    notificationService.resetTodayReminderLog();
    setSaveStatus('Today’s reminder log reset! Reminders can fire again.');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Push Reminders</h3>
              <span className="text-[10px] text-slate-400">Local Notification Engine</span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-full text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner feedback */}
        {saveStatus && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveStatus}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-4 pr-1 no-scrollbar text-xs">
          {/* 1. Browser Native Push Permission Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Browser Push Notifications
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold capitalize ${
                browserPermission === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : browserPermission === 'denied'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {browserPermission === 'granted' ? 'Enabled ✓' : browserPermission}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              When enabled, your device receives gentle system push notifications even if the tab is inactive. In-app push alerts are always active.
            </p>

            {browserPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-95 transition-all mt-1"
              >
                Enable Device Push Permissions
              </button>
            )}
          </div>

          {/* 2. Interactive Testing Studio */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Test Push Alerts
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Immediate Demo</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Test how gentle push reminders sound and appear when you haven't met your goal by the scheduled time.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => triggerTestReminder('water')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-cyan-500/30 text-cyan-300 font-medium text-left space-y-1 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <Droplet className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                  <Send className="w-3 h-3 text-slate-500 group-hover:text-cyan-400" />
                </div>
                <span className="font-bold block text-white text-[11px]">Water Reminder</span>
                <span className="text-[10px] text-slate-400 block truncate">Hydration nudge</span>
              </button>

              <button
                onClick={() => triggerTestReminder('workout')}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-emerald-500/30 text-emerald-300 font-medium text-left space-y-1 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <Dumbbell className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <Send className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <span className="font-bold block text-white text-[11px]">Workout Reminder</span>
                <span className="text-[10px] text-slate-400 block truncate">Scheduled session</span>
              </button>
            </div>
          </div>

          {/* 3. Scheduled Conditions & Time Settings */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                Scheduled Goal Reminders
              </span>
              <button
                onClick={handleResetLog}
                title="Reset trigger history for today"
                className="text-[10px] text-slate-400 hover:text-emerald-400 font-mono flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Trigger Log</span>
              </button>
            </div>

            {/* Water Reminder Condition */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="font-bold text-white block">Water Intake Goal</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Current: {dailyMetrics.waterConsumedMl} / {userProfile.dailyWaterGoal} ml
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isWaterGoalMet
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isWaterGoalMet ? 'Goal Met ✓' : 'Pending Goal'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-300">Remind by time:</span>
                <input
                  type="time"
                  value={waterTime}
                  onChange={(e) => setWaterTime(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Workout Reminder Condition */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block">Scheduled Workout</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Completed: {completedWorkouts.length > 0 ? '1 session' : '0 sessions'}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                  isWorkoutCompleted
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {isWorkoutCompleted ? 'Completed ✓' : 'Pending Workout'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-[11px] text-slate-300">Remind by time:</span>
                <input
                  type="time"
                  value={workoutTime}
                  onChange={(e) => setWorkoutTime(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleSaveTimes}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 font-bold text-xs border border-emerald-500/30 transition-colors"
            >
              Save Schedule Times
            </button>
          </div>

          {/* 4. Recent Notification History */}
          <div className="space-y-2">
            <span className="text-slate-400 font-semibold block text-[11px]">
              Recent Reminders Log ({notifications.length})
            </span>

            {notifications.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-950 text-center text-slate-500 text-xs">
                No reminders sent yet today. Reminders trigger automatically when scheduled times arrive.
              </div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start gap-2.5"
                  >
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                      {n.type === 'water' ? (
                        <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                      ) : (
                        <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white truncate text-[11px]">{n.title}</span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{n.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
