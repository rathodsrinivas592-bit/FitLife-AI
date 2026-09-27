import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BodyMeasurements, 
  CalculationResults, 
  DailyMetrics, 
  MealItem, 
  UserProfile, 
  WeightLog, 
  Workout,
  WorkoutSessionRecord,
  AppNotification,
  NotificationAction
} from '../types';
import { calculateHealthPlan, calculateRecommendedWater } from '../utils/calculator';
import { generatePersonalizedDietPlan, FOOD_DATABASE } from '../data/sampleFoods';
import { WORKOUT_DATABASE } from '../data/sampleWorkouts';
import { healthDeviceService } from '../services/healthDeviceService';
import { notificationService } from '../services/notificationService';
import { audioFeedback } from '../utils/audioFeedback';

export type AppTab = 'home' | 'diet' | 'activity' | 'progress' | 'profile';
export type ActivitySubTab = 'steps' | 'workout' | 'heart_rate' | 'water' | 'sleep';

interface AppContextType {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  updateProfile: (updated: Partial<UserProfile>) => void;
  calculationResults: CalculationResults;
  
  dailyMetrics: DailyMetrics;
  setDailyMetrics: React.Dispatch<React.SetStateAction<DailyMetrics>>;
  
  meals: MealItem[];
  setMeals: React.Dispatch<React.SetStateAction<MealItem[]>>;
  toggleMealEaten: (mealId: string) => void;
  replaceMeal: (mealId: string, newFoodId: string) => void;
  regenerateDietPlan: () => void;
  addCustomMeal: (meal: MealItem) => void;
  
  // Real Meal Live AI Calculator
  isMealCalculatorOpen: boolean;
  setIsMealCalculatorOpen: (open: boolean) => void;
  
  weightHistory: WeightLog[];
  addWeightLog: (weight: number, date?: string, notes?: string) => void;
  
  measurementsHistory: BodyMeasurements[];
  addMeasurements: (measurements: Omit<BodyMeasurements, 'id' | 'date'>) => void;
  
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  activitySubTab: ActivitySubTab;
  setActivitySubTab: (subTab: ActivitySubTab) => void;
  
  // Quick trackers
  addWater: (amountMl: number) => void;
  resetWater: () => void;
  addSteps: (steps: number) => void;
  updateSleep: (minutes: number) => void;
  
  // Wearable status
  isWearableConnected: boolean;
  toggleWearableConnection: () => void;
  
  // Health score
  healthScore: number;
  goalsCompletedCount: number;
  totalGoalsCount: number;
  
  // AI assistant drawer
  isAiModalOpen: boolean;
  setIsAiModalOpen: (open: boolean) => void;
  aiSuggestedPrompt: string;
  setAiSuggestedPrompt: (prompt: string) => void;

  // Onboarding modal
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  completeOnboarding: (newProfile: UserProfile) => void;

  // Workout state
  activeWorkout: Workout | null;
  setActiveWorkout: (workout: Workout | null) => void;
  markWorkoutComplete: (workoutId: string) => void;
  completedWorkouts: string[];
  workoutHistory: WorkoutSessionRecord[];
  saveWorkoutSession: (session: WorkoutSessionRecord) => void;

  // Notification & Gentle Push Reminders
  notifications: AppNotification[];
  activePushNotification: AppNotification | null;
  dismissPushNotification: () => void;
  isNotificationCenterOpen: boolean;
  setIsNotificationCenterOpen: (open: boolean) => void;
  browserPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  triggerTestReminder: (type: 'water' | 'workout') => void;
  executeNotificationAction: (action: NotificationAction) => void;
  activeLiveDemoWorkout: Workout | null;
  setActiveLiveDemoWorkout: (workout: Workout | null) => void;

  // App Theme
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  toggleTheme: () => void;

  // Reset
  resetAllData: () => void;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Srinivasa',
  age: 28,
  gender: 'male',
  height: 178, // cm
  weight: 76.5, // kg
  targetWeight: 70.0, // kg
  activityLevel: 'moderately_active',
  goal: 'lose_weight',
  foodPreference: 'eggetarian',
  allergies: ['peanuts'],
  dailyWaterGoal: 3000, // ml
  sleepGoal: 8, // hours
  mealsPerDay: 4,
  isOnboarded: true,
  reminders: {
    water: true,
    meals: true,
    workout: true,
    walk: true,
    sleep: true,
    weight: true,
  },
  reminderTimes: {
    water: '09:00',
    meals: '13:00',
    workout: '18:00',
    walk: '19:30',
    sleep: '22:30',
    weight: '07:30',
  },
};

const DEFAULT_WEIGHT_HISTORY: WeightLog[] = [
  { id: 'w-1', date: '2026-08-27', weight: 80.0, notes: 'Starting fitness journey' },
  { id: 'w-2', date: '2026-09-03', weight: 78.5, notes: 'Clean nutrition & 10k steps' },
  { id: 'w-3', date: '2026-09-10', weight: 77.4, notes: 'Consistent strength training' },
  { id: 'w-4', date: '2026-09-17', weight: 76.8, notes: 'Great energy levels' },
  { id: 'w-5', date: '2026-09-24', weight: 76.5, notes: 'Current check-in' },
];

const DEFAULT_MEASUREMENTS: BodyMeasurements[] = [
  { id: 'm-1', date: '2026-08-27', waist: 88, chest: 102, arms: 36, thighs: 58, neck: 39 },
  { id: 'm-2', date: '2026-09-24', waist: 84, chest: 101.5, arms: 36.5, thighs: 56.5, neck: 38.5 },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or defaults
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('fitlife_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [activitySubTab, setActivitySubTab] = useState<ActivitySubTab>('steps');
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiSuggestedPrompt, setAiSuggestedPrompt] = useState<string>('');
  const [isMealCalculatorOpen, setIsMealCalculatorOpen] = useState<boolean>(false);

  const addCustomMeal = (meal: MealItem) => {
    setMeals(prev => [meal, ...prev]);
  };
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(!userProfile.isOnboarded);
  const [isWearableConnected, setIsWearableConnected] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('fitlife_theme');
      if (saved !== null) {
        return saved === 'dark';
      }
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch {}
    return true; // Default dark
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Sync theme with document.documentElement
  useEffect(() => {
    try {
      localStorage.setItem('fitlife_theme', isDarkMode ? 'dark' : 'light');
      if (typeof document !== 'undefined') {
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.setAttribute('data-theme', 'light');
        }
      }
    } catch {}
  }, [isDarkMode]);

  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [completedWorkouts, setCompletedWorkouts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fitlife_completed_workouts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [workoutHistory, setWorkoutHistory] = useState<WorkoutSessionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('fitlife_workout_history');
      return saved ? JSON.parse(saved) : [
        {
          id: 'hist-sample-1',
          workoutId: 'split-monday-chest',
          workoutTitle: 'Monday — Chest Annihilation',
          date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
          durationSeconds: 3120,
          caloriesBurned: 420,
          exercisesCompleted: 6,
          setsCompleted: 18,
          repsCompleted: 180,
          completedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          dayOfWeek: 'Monday'
        }
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fitlife_completed_workouts', JSON.stringify(completedWorkouts));
    } catch {}
  }, [completedWorkouts]);

  useEffect(() => {
    try {
      localStorage.setItem('fitlife_workout_history', JSON.stringify(workoutHistory));
    } catch {}
  }, [workoutHistory]);

  // Computed calculations
  const calculationResults = calculateHealthPlan(userProfile);

  // Daily Metrics
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics>(() => {
    try {
      const saved = localStorage.getItem('fitlife_metrics');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      date: new Date().toISOString().split('T')[0],
      caloriesConsumed: 1420,
      proteinConsumed: 82,
      carbsConsumed: 145,
      fatConsumed: 48,
      steps: 7842,
      stepGoal: 10000,
      distanceKm: 5.8,
      caloriesBurned: 420,
      waterConsumedMl: 1800,
      sleepMinutes: 440, // 7h 20m
      heartRateCurrent: 72,
      heartRateResting: 64,
      heartRateAvg: 74,
      weightLogged: 76.5,
      wearableConnected: true,
    };
  });

  // Weight History
  const [weightHistory, setWeightHistory] = useState<WeightLog[]>(() => {
    try {
      const saved = localStorage.getItem('fitlife_weights');
      return saved ? JSON.parse(saved) : DEFAULT_WEIGHT_HISTORY;
    } catch {
      return DEFAULT_WEIGHT_HISTORY;
    }
  });

  // Body Measurements
  const [measurementsHistory, setMeasurementsHistory] = useState<BodyMeasurements[]>(() => {
    try {
      const saved = localStorage.getItem('fitlife_measurements');
      return saved ? JSON.parse(saved) : DEFAULT_MEASUREMENTS;
    } catch {
      return DEFAULT_MEASUREMENTS;
    }
  });

  // Meals Plan
  const [meals, setMeals] = useState<MealItem[]>(() => {
    try {
      const saved = localStorage.getItem('fitlife_meals');
      if (saved) return JSON.parse(saved);
    } catch {}
    const initialPlan = generatePersonalizedDietPlan(
      userProfile,
      calculationResults.targetCalories,
      calculationResults.targetProtein
    );
    // Set first two meals as eaten to simulate active day
    if (initialPlan.length > 0) initialPlan[0].isEaten = true;
    if (initialPlan.length > 1) initialPlan[1].isEaten = true;
    return initialPlan;
  });

  // Notification & Gentle Push Reminder States
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('fitlife_notifications_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'notif-welcome',
        type: 'general',
        title: '🌟 Welcome to FitLife Reminders',
        body: 'Gentle push reminders are configured for hydration check-ins and scheduled workout sessions.',
        timestamp: new Date().toISOString(),
        read: true,
      },
    ];
  });

  const [activePushNotification, setActivePushNotification] = useState<AppNotification | null>(null);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>(() => 
    notificationService.getPermissionStatus()
  );
  const [activeLiveDemoWorkout, setActiveLiveDemoWorkout] = useState<Workout | null>(null);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('fitlife_profile', JSON.stringify(userProfile));
    } catch {}
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('fitlife_metrics', JSON.stringify(dailyMetrics));
    } catch {}
  }, [dailyMetrics]);

  useEffect(() => {
    try {
      localStorage.setItem('fitlife_meals', JSON.stringify(meals));
    } catch {}
  }, [meals]);

  useEffect(() => {
    try {
      localStorage.setItem('fitlife_weights', JSON.stringify(weightHistory));
    } catch {}
  }, [weightHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('fitlife_measurements', JSON.stringify(measurementsHistory));
    } catch {}
  }, [measurementsHistory]);

  // Recalculate daily consumed nutrients from eaten meals
  useEffect(() => {
    const eatenMeals = meals.filter(m => m.isEaten);
    const totalCal = eatenMeals.reduce((acc, m) => acc + m.calories, 0);
    const totalProt = eatenMeals.reduce((acc, m) => acc + m.protein, 0);
    const totalCarb = eatenMeals.reduce((acc, m) => acc + m.carbs, 0);
    const totalFat = eatenMeals.reduce((acc, m) => acc + m.fat, 0);

    setDailyMetrics(prev => ({
      ...prev,
      caloriesConsumed: totalCal,
      proteinConsumed: totalProt,
      carbsConsumed: totalCarb,
      fatConsumed: totalFat,
    }));
  }, [meals]);

  const updateProfile = (updated: Partial<UserProfile>) => {
    setUserProfile(prev => {
      const newProf = { ...prev, ...updated };
      return newProf;
    });
  };

  const completeOnboarding = (newProfile: UserProfile) => {
    const readyProfile = { ...newProfile, isOnboarded: true };
    setUserProfile(readyProfile);
    setIsOnboardingOpen(false);

    // Generate fresh plan for new user
    const calcs = calculateHealthPlan(readyProfile);
    const newMeals = generatePersonalizedDietPlan(readyProfile, calcs.targetCalories, calcs.targetProtein);
    setMeals(newMeals);

    // Initial weight log
    setWeightHistory([
      {
        id: `w-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        weight: readyProfile.weight,
        notes: 'Initial weight recorded during onboarding',
      },
    ]);
  };

  const regenerateDietPlan = () => {
    const newMeals = generatePersonalizedDietPlan(
      userProfile,
      calculationResults.targetCalories,
      calculationResults.targetProtein
    );
    setMeals(newMeals);
  };

  const toggleMealEaten = (mealId: string) => {
    setMeals(prev =>
      prev.map(m => (m.id === mealId ? { ...m, isEaten: !m.isEaten } : m))
    );
  };

  const replaceMeal = (mealId: string, newFoodId: string) => {
    const food = FOOD_DATABASE.find(f => f.id === newFoodId);
    if (!food) return;

    setMeals(prev =>
      prev.map(m => {
        if (m.id === mealId) {
          return {
            ...m,
            name: food.name,
            portion: food.portion,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            isIndian: food.isIndian,
            icon: food.icon,
            notes: food.notes,
          };
        }
        return m;
      })
    );
  };

  const addWeightLog = (weight: number, date?: string, notes?: string) => {
    const today = date || new Date().toISOString().split('T')[0];
    const newEntry: WeightLog = {
      id: `w-${Date.now()}`,
      date: today,
      weight,
      notes,
    };
    setWeightHistory(prev => [...prev.filter(w => w.date !== today), newEntry].sort((a, b) => a.date.localeCompare(b.date)));
    setUserProfile(prev => ({ ...prev, weight }));
    setDailyMetrics(prev => ({ ...prev, weightLogged: weight }));
  };

  const addMeasurements = (measurements: Omit<BodyMeasurements, 'id' | 'date'>) => {
    const today = new Date().toISOString().split('T')[0];
    const newEntry: BodyMeasurements = {
      id: `m-${Date.now()}`,
      date: today,
      ...measurements,
    };
    setMeasurementsHistory(prev => [...prev, newEntry]);
  };

  const addWater = (amountMl: number) => {
    setDailyMetrics(prev => ({
      ...prev,
      waterConsumedMl: Math.min(8000, prev.waterConsumedMl + amountMl),
    }));
  };

  const resetWater = () => {
    setDailyMetrics(prev => ({
      ...prev,
      waterConsumedMl: 0,
    }));
  };

  const addSteps = (stepsToAdd: number) => {
    setDailyMetrics(prev => {
      const newSteps = prev.steps + stepsToAdd;
      const newDist = Number((newSteps * 0.00075).toFixed(2)); // ~0.75m per step
      const newBurned = Math.round(newSteps * 0.045); // ~0.045 kcal per step
      return {
        ...prev,
        steps: newSteps,
        distanceKm: newDist,
        caloriesBurned: newBurned,
      };
    });
  };

  const updateSleep = (minutes: number) => {
    setDailyMetrics(prev => ({
      ...prev,
      sleepMinutes: minutes,
    }));
  };

  const toggleWearableConnection = () => {
    const newState = !isWearableConnected;
    setIsWearableConnected(newState);
    healthDeviceService.toggleConnection(newState);
    setDailyMetrics(prev => ({
      ...prev,
      wearableConnected: newState,
    }));
  };

  const markWorkoutComplete = (workoutId: string) => {
    if (!completedWorkouts.includes(workoutId)) {
      setCompletedWorkouts(prev => [...prev, workoutId]);
    }
    const workout = WORKOUT_DATABASE.find(w => w.id === workoutId);
    if (workout) {
      setDailyMetrics(prev => ({
        ...prev,
        caloriesBurned: prev.caloriesBurned + workout.caloriesBurned,
      }));
    }
  };

  const saveWorkoutSession = (session: WorkoutSessionRecord) => {
    setWorkoutHistory(prev => [session, ...prev]);
    if (!completedWorkouts.includes(session.workoutId)) {
      setCompletedWorkouts(prev => [...prev, session.workoutId]);
    }
    setDailyMetrics(prev => ({
      ...prev,
      caloriesBurned: prev.caloriesBurned + session.caloriesBurned,
    }));
  };

  // Health Score calculation (0 to 100%)
  const totalGoalsCount = 7;
  let goalsCompletedCount = 0;
  if (dailyMetrics.caloriesConsumed >= calculationResults.targetCalories * 0.85 && dailyMetrics.caloriesConsumed <= calculationResults.targetCalories * 1.1) {
    goalsCompletedCount += 1;
  }
  if (dailyMetrics.proteinConsumed >= calculationResults.targetProtein * 0.8) {
    goalsCompletedCount += 1;
  }
  if (dailyMetrics.steps >= dailyMetrics.stepGoal) {
    goalsCompletedCount += 1;
  }
  if (dailyMetrics.waterConsumedMl >= userProfile.dailyWaterGoal) {
    goalsCompletedCount += 1;
  }
  if (dailyMetrics.sleepMinutes >= userProfile.sleepGoal * 60 * 0.85) {
    goalsCompletedCount += 1;
  }
  if (completedWorkouts.length > 0) {
    goalsCompletedCount += 1;
  }
  if (dailyMetrics.weightLogged) {
    goalsCompletedCount += 1;
  }

  const healthScore = Math.round((goalsCompletedCount / totalGoalsCount) * 100);

  const resetAllData = () => {
    localStorage.clear();
    setUserProfile(DEFAULT_PROFILE);
    setWeightHistory(DEFAULT_WEIGHT_HISTORY);
    setMeasurementsHistory(DEFAULT_MEASUREMENTS);
    const calcs = calculateHealthPlan(DEFAULT_PROFILE);
    setMeals(generatePersonalizedDietPlan(DEFAULT_PROFILE, calcs.targetCalories, calcs.targetProtein));
    setDailyMetrics({
      date: new Date().toISOString().split('T')[0],
      caloriesConsumed: 1420,
      proteinConsumed: 82,
      carbsConsumed: 145,
      fatConsumed: 48,
      steps: 7842,
      stepGoal: 10000,
      distanceKm: 5.8,
      caloriesBurned: 420,
      waterConsumedMl: 1800,
      sleepMinutes: 440,
      heartRateCurrent: 72,
      heartRateResting: 64,
      heartRateAvg: 74,
      weightLogged: 76.5,
      wearableConnected: true,
    });
    setCompletedWorkouts([]);
    setIsWearableConnected(true);
  };

  // Notification methods
  const pushNotification = (notif: AppNotification) => {
    setActivePushNotification(notif);
    setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
    audioFeedback.playGentleReminderChime();
    notificationService.dispatchBrowserNotification(notif, () => {
      if (notif.type === 'water') {
        setActiveTab('activity');
        setActivitySubTab('water');
      } else if (notif.type === 'workout') {
        setActiveTab('activity');
        setActivitySubTab('workout');
        setActiveLiveDemoWorkout(WORKOUT_DATABASE[0]);
      }
    });
  };

  const dismissPushNotification = () => {
    setActivePushNotification(null);
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    const perm = await notificationService.requestPermission();
    setBrowserPermission(perm);
    return perm;
  };

  const triggerTestReminder = (type: 'water' | 'workout') => {
    const testNotif = notificationService.generateTestReminder(type, userProfile, dailyMetrics);
    pushNotification(testNotif);
  };

  const executeNotificationAction = (action: NotificationAction) => {
    if (action.actionType === 'add_water_250') {
      addWater(250);
      dismissPushNotification();
    } else if (action.actionType === 'add_water_500') {
      addWater(500);
      dismissPushNotification();
    } else if (action.actionType === 'start_workout') {
      setActiveTab('activity');
      setActivitySubTab('workout');
      setActiveLiveDemoWorkout(WORKOUT_DATABASE[0]);
      dismissPushNotification();
    } else if (action.actionType === 'navigate_water') {
      setActiveTab('activity');
      setActivitySubTab('water');
      dismissPushNotification();
    } else if (action.actionType === 'navigate_workout') {
      setActiveTab('activity');
      setActivitySubTab('workout');
      dismissPushNotification();
    } else {
      dismissPushNotification();
    }
  };

  // Save notifications to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('fitlife_notifications_history', JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Automated background interval checker for scheduled reminders
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const pendingReminder = notificationService.evaluateReminders({
        userProfile,
        dailyMetrics,
        completedWorkouts,
      });

      if (pendingReminder) {
        pushNotification(pendingReminder);
      }
    }, 25000); // Check every 25 seconds

    return () => clearInterval(checkInterval);
  }, [userProfile, dailyMetrics, completedWorkouts]);

  return (
    <AppContext.Provider
      value={{
        userProfile,
        setUserProfile,
        updateProfile,
        calculationResults,
        dailyMetrics,
        setDailyMetrics,
        meals,
        setMeals,
        toggleMealEaten,
        replaceMeal,
        regenerateDietPlan,
        addCustomMeal,
        isMealCalculatorOpen,
        setIsMealCalculatorOpen,
        weightHistory,
        addWeightLog,
        measurementsHistory,
        addMeasurements,
        activeTab,
        setActiveTab,
        activitySubTab,
        setActivitySubTab,
        addWater,
        resetWater,
        addSteps,
        updateSleep,
        isWearableConnected,
        toggleWearableConnection,
        healthScore,
        goalsCompletedCount,
        totalGoalsCount,
        isAiModalOpen,
        setIsAiModalOpen,
        aiSuggestedPrompt,
        setAiSuggestedPrompt,
        isOnboardingOpen,
        setIsOnboardingOpen,
        completeOnboarding,
        activeWorkout,
        setActiveWorkout,
        markWorkoutComplete,
        completedWorkouts,
        workoutHistory,
        saveWorkoutSession,
        notifications,
        activePushNotification,
        dismissPushNotification,
        isNotificationCenterOpen,
        setIsNotificationCenterOpen,
        browserPermission,
        requestNotificationPermission,
        triggerTestReminder,
        executeNotificationAction,
        activeLiveDemoWorkout,
        setActiveLiveDemoWorkout,
        isDarkMode,
        setIsDarkMode,
        toggleTheme,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
