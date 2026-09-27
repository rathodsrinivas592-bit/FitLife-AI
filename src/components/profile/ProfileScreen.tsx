import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Bell, 
  ShieldCheck, 
  Edit3, 
  RotateCcw, 
  Download, 
  Watch, 
  Check, 
  Activity, 
  X,
  Target,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityLevel, FitnessGoal, FoodPreference, Gender, UserProfile } from '../../types';
import { ACTIVITY_LABELS } from '../../utils/calculator';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { ThemeToggle } from '../common/ThemeToggle';

export const ProfileScreen: React.FC = () => {
  const { 
    userProfile, 
    updateProfile, 
    calculationResults, 
    isWearableConnected, 
    toggleWearableConnection,
    resetAllData,
    setIsOnboardingOpen,
    setIsNotificationCenterOpen,
    triggerTestReminder,
    browserPermission,
    requestNotificationPermission,
    isDarkMode
  } = useApp();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<UserProfile>(userProfile);
  const [notificationStatus, setNotificationStatus] = useState<string>('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editForm);
    setIsEditProfileOpen(false);
  };

  const toggleReminder = (key: keyof UserProfile['reminders']) => {
    const updated = {
      ...userProfile.reminders,
      [key]: !userProfile.reminders[key],
    };
    updateProfile({ reminders: updated });
    setNotificationStatus(`Reminder for ${key} updated`);
    setTimeout(() => setNotificationStatus(''), 2500);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({
        profile: userProfile,
        calculations: calculationResults,
        exportedAt: new Date().toISOString(),
      }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `fitlife-data-${userProfile.name.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Header Profile Summary */}
      <section aria-label="User Profile Card" className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl">
            {userProfile.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{userProfile.name}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 capitalize mt-0.5">
              <span>{userProfile.gender}</span>
              <span>·</span>
              <span>{userProfile.age} yrs</span>
              <span>·</span>
              <span className="text-emerald-400 font-semibold">{userProfile.goal.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditForm(userProfile);
            setIsEditProfileOpen(true);
          }}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Edit Profile"
        >
          <Edit3 className="w-4 h-4 text-emerald-400" />
        </button>
      </section>

      {/* Profile Metrics Overview */}
      <section aria-label="Biometrics Summary" className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Height</span>
          <span className="font-bold text-white font-mono mt-0.5 block">{userProfile.height} cm</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Current Weight</span>
          <span className="font-bold text-emerald-400 font-mono mt-0.5 block">{userProfile.weight} kg</span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 block">Target Weight</span>
          <span className="font-bold text-cyan-400 font-mono mt-0.5 block">{userProfile.targetWeight} kg</span>
        </div>
      </section>

      {/* Activity & Diet Preferences Summary */}
      <section aria-label="Preferences Overview" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2">Program Parameters</h3>

        <div className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Activity Level:</span>
          <span className="font-semibold text-white capitalize">{userProfile.activityLevel.replace('_', ' ')}</span>
        </div>

        <div className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Dietary Preference:</span>
          <span className="font-semibold text-white capitalize">{userProfile.foodPreference.replace('_', ' ')}</span>
        </div>

        <div className="flex justify-between items-center text-slate-300 py-1 border-b border-slate-800/60">
          <span className="text-slate-400">Meals per Day:</span>
          <span className="font-mono font-semibold text-white">{userProfile.mealsPerDay} Meals</span>
        </div>

        <div className="flex justify-between items-center text-slate-300 py-1">
          <span className="text-slate-400">Known Allergies:</span>
          <span className="font-medium text-amber-300">
            {userProfile.allergies.length > 0 ? userProfile.allergies.join(', ') : 'None'}
          </span>
        </div>
      </section>

      {/* Reminders / Notifications Configuration */}
      <section aria-label="Reminders and Notifications" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Daily Push Reminders</h3>
          </div>
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold font-mono flex items-center gap-1"
          >
            <span>Center & Settings ➔</span>
          </button>
        </div>

        {/* Quick Test Reminders Bar */}
        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
          <div className="text-[11px] text-slate-300">
            <span className="font-semibold block text-white">Instant Test Reminders</span>
            <span className="text-[10px] text-slate-400">Preview gentle push nudges</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => triggerTestReminder('water')}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold transition-colors"
            >
              💧 Test Water
            </button>
            <button
              onClick={() => triggerTestReminder('workout')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold transition-colors"
            >
              ⚡ Test Workout
            </button>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          {[
            { key: 'water', label: 'Drink Water Reminder', time: userProfile.reminderTimes.water },
            { key: 'meals', label: 'Eat Meals on Schedule', time: userProfile.reminderTimes.meals },
            { key: 'workout', label: 'Workout Session', time: userProfile.reminderTimes.workout },
            { key: 'walk', label: 'Evening Walk / Steps Goal', time: userProfile.reminderTimes.walk },
            { key: 'sleep', label: 'Bedtime Wind-down', time: userProfile.reminderTimes.sleep },
            { key: 'weight', label: 'Record Morning Weight', time: userProfile.reminderTimes.weight },
          ].map((item) => {
            const isEnabled = userProfile.reminders[item.key as keyof UserProfile['reminders']];
            return (
              <div
                key={item.key}
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-slate-200 block">{item.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Scheduled: {item.time}</span>
                </div>

                <button
                  onClick={() => toggleReminder(item.key as keyof UserProfile['reminders'])}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                    isEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Appearance & Lighting Theme Section */}
      <section aria-label="Appearance and Theme" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <h3 className="text-sm font-bold text-white">Appearance & Lighting</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {isDarkMode ? 'Midnight OLED Dark' : 'Daylight High Contrast'}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Switch between dark and light modes to maintain optimal visual comfort, energy efficiency, and readability in all lighting conditions.
        </p>

        <ThemeToggle variant="full" />
      </section>

      {/* Connected Devices & Health APIs */}
      <section aria-label="Health Integrations" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Watch className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Device & Health APIs</h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-medium">Ready</span>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-white block">Smartwatch / Smart Band</span>
            <span className="text-[11px] text-slate-400">
              {isWearableConnected ? 'Simulated PPG Pulse & Pedometer Active' : 'Disconnected'}
            </span>
          </div>

          <button
            onClick={toggleWearableConnection}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isWearableConnected
                ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
            }`}
          >
            {isWearableConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-850 flex items-center justify-between text-xs">
          <div>
            <span className="font-medium text-slate-300 block">Android Health Connect</span>
            <span className="text-[10px] text-slate-400">Ready for system-level sync</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Standby</span>
        </div>
      </section>

      {/* Data Management & Onboarding Reset */}
      <section aria-label="Data Management" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-2">Data & Storage</h3>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Rerun Onboarding</span>
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm("Reset all user metrics, weight logs, and meals to initial defaults?")) {
              resetAllData();
            }
          }}
          className="w-full mt-1 py-2 text-center text-xs text-rose-400 hover:text-rose-300 font-medium"
        >
          Reset All Data to Defaults
        </button>
      </section>

      {/* Medical Disclaimer */}
      <DisclaimerBanner compact />

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Edit Health Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Age</label>
                  <input
                    type="number"
                    min="15"
                    max="100"
                    required
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as Gender })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    min="100"
                    max="240"
                    required
                    value={editForm.height}
                    onChange={(e) => setEditForm({ ...editForm, height: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="250"
                    required
                    value={editForm.weight}
                    onChange={(e) => setEditForm({ ...editForm, weight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Target (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="35"
                    max="250"
                    required
                    value={editForm.targetWeight}
                    onChange={(e) => setEditForm({ ...editForm, targetWeight: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Primary Goal</label>
                <select
                  value={editForm.goal}
                  onChange={(e) => setEditForm({ ...editForm, goal: e.target.value as FitnessGoal })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="lose_weight">Lose Weight (Calorie Deficit)</option>
                  <option value="gain_weight">Gain Weight / Muscle (Calorie Surplus)</option>
                  <option value="maintain_weight">Maintain Weight (Calorie Balance)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Activity Level</label>
                <select
                  value={editForm.activityLevel}
                  onChange={(e) => setEditForm({ ...editForm, activityLevel: e.target.value as ActivityLevel })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="sedentary">Sedentary (Desk job, little exercise)</option>
                  <option value="lightly_active">Lightly Active (1-3 days/wk)</option>
                  <option value="moderately_active">Moderately Active (3-5 days/wk)</option>
                  <option value="very_active">Very Active (6-7 days/wk)</option>
                  <option value="extremely_active">Extremely Active (Hard physical work)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Food Preference</label>
                <select
                  value={editForm.foodPreference}
                  onChange={(e) => setEditForm({ ...editForm, foodPreference: e.target.value as FoodPreference })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white"
                >
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non_vegetarian">Non-Vegetarian</option>
                  <option value="eggetarian">Eggetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Water Goal (ml)</label>
                  <input
                    type="number"
                    step="250"
                    min="1500"
                    max="6000"
                    value={editForm.dailyWaterGoal}
                    onChange={(e) => setEditForm({ ...editForm, dailyWaterGoal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Sleep Goal (hrs)</label>
                  <input
                    type="number"
                    min="5"
                    max="12"
                    value={editForm.sleepGoal}
                    onChange={(e) => setEditForm({ ...editForm, sleepGoal: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
