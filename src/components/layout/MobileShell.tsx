import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  BatteryMedium, 
  Signal, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  Bell 
} from 'lucide-react';
import { BottomNav } from './BottomNav';
import { useApp } from '../../context/AppContext';
import { GentleNotificationBanner } from '../common/GentleNotificationBanner';
import { ThemeToggle } from '../common/ThemeToggle';

export const MobileShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    userProfile,
    activePushNotification,
    dismissPushNotification,
    executeNotificationAction,
    setIsNotificationCenterOpen,
    notifications,
    isDarkMode
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [deviceFrameMode, setDeviceFrameMode] = useState<boolean>(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-start sm:p-4 md:p-6 antialiased transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-slate-950 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-400' 
        : 'bg-slate-100 text-slate-900 selection:bg-emerald-500/30 selection:text-emerald-700'
    }`}>
      {/* Top Device View Toggle Bar for Desktop Testing */}
      <aside aria-label="Device Preview Controls" className="hidden sm:flex items-center justify-between w-full max-w-md mb-3 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs shadow-md transition-colors">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white text-xs">FitLife AI</span>
          <span className="text-[10px] text-slate-400">· {isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Quick Theme Toggle Pill */}
          <ThemeToggle variant="pill" />

          {/* Reminders Center Trigger */}
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-slate-800 hover:bg-slate-750 text-emerald-400 transition-colors"
            title="Open Notification Center"
          >
            <Bell className="w-3 h-3" />
            <span>Reminders</span>
          </button>

          {/* Mobile Bezel Toggle */}
          <button
            onClick={() => setDeviceFrameMode(!deviceFrameMode)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors"
            title="Toggle Smartphone Bezel Frame"
          >
            {deviceFrameMode ? <Smartphone className="w-3 h-3 text-emerald-400" /> : <Monitor className="w-3 h-3 text-cyan-400" />}
            <span>{deviceFrameMode ? 'Frame' : 'Full'}</span>
          </button>
        </div>
      </aside>

      {/* Main Container / Mobile Device Enclosure */}
      <div
        className={`w-full flex flex-col relative transition-all duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} ${
          deviceFrameMode
            ? isDarkMode
              ? 'max-w-md min-h-[844px] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[42px] sm:border-[8px] sm:border-slate-800 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.08)] overflow-hidden'
              : 'max-w-md min-h-[844px] sm:h-[880px] sm:max-h-[92vh] sm:rounded-[42px] sm:border-[8px] sm:border-slate-300 sm:shadow-[0_20px_50px_rgba(0,0,0,0.1),0_0_20px_rgba(0,0,0,0.05)] overflow-hidden'
            : 'max-w-md min-h-screen border-x border-slate-200 dark:border-slate-800/60'
        }`}
      >
        {/* Android / Smartphone Status Bar */}
        <header className="sticky top-0 z-30 bg-slate-950/90 dark:bg-slate-950/90 backdrop-blur-md px-4 pt-3 pb-2 flex items-center justify-between text-xs text-slate-300 select-none border-b border-slate-900/60 transition-colors">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-tight text-[13px] font-mono text-slate-200">{currentTime}</span>
            <button
              onClick={() => setIsNotificationCenterOpen(true)}
              aria-label="Open reminders"
              className="p-1 rounded-full text-slate-400 hover:text-emerald-400 transition-colors relative"
            >
              <Bell className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
            </button>
          </div>

          {/* Android Punch-Hole Camera */}
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-700/60 shadow-inner flex items-center justify-center">
            <span className="w-1 h-1 rounded-full bg-slate-800" />
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            {/* Quick Status Bar Theme Toggle */}
            <ThemeToggle variant="icon" />

            <div className="flex items-center gap-1.5 ml-1">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-mono">88%</span>
                <BatteryMedium className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Gentle Push Notification In-App Banner */}
        <GentleNotificationBanner
          notification={activePushNotification}
          onDismiss={dismissPushNotification}
          onActionClick={executeNotificationAction}
        />

        {/* Content Area with smooth scrolling */}
        <main className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-4 no-scrollbar">
          {children}
        </main>

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
};
