/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MobileShell } from './components/layout/MobileShell';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { DietScreen } from './components/diet/DietScreen';
import { ActivityScreen } from './components/activity/ActivityScreen';
import { ProgressScreen } from './components/progress/ProgressScreen';
import { ProfileScreen } from './components/profile/ProfileScreen';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { AiHealthAssistantModal } from './components/ai/AiHealthAssistantModal';
import { LiveAiMealCalculatorModal } from './components/diet/LiveAiMealCalculatorModal';
import { NotificationCenterModal } from './components/common/NotificationCenterModal';
import { LiveDemoWorkoutModal } from './components/workouts/LiveDemoWorkoutModal';

const MainScreenRouter: React.FC = () => {
  const { 
    activeTab, 
    isNotificationCenterOpen, 
    setIsNotificationCenterOpen,
    activeLiveDemoWorkout,
    setActiveLiveDemoWorkout
  } = useApp();

  return (
    <>
      {activeTab === 'home' && <HomeDashboard />}
      {activeTab === 'diet' && <DietScreen />}
      {activeTab === 'activity' && <ActivityScreen />}
      {activeTab === 'progress' && <ProgressScreen />}
      {activeTab === 'profile' && <ProfileScreen />}

      {/* Global Modals */}
      <OnboardingModal />
      <AiHealthAssistantModal />
      <LiveAiMealCalculatorModal />
      <NotificationCenterModal 
        isOpen={isNotificationCenterOpen} 
        onClose={() => setIsNotificationCenterOpen(false)} 
      />
      {activeLiveDemoWorkout && (
        <LiveDemoWorkoutModal 
          workout={activeLiveDemoWorkout} 
          onClose={() => setActiveLiveDemoWorkout(null)} 
        />
      )}
    </>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MobileShell>
        <MainScreenRouter />
      </MobileShell>
    </AppProvider>
  );
}
