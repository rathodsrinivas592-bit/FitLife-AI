export type Gender = 'male' | 'female';

export type ActivityLevel = 
  | 'sedentary' 
  | 'lightly_active' 
  | 'moderately_active' 
  | 'very_active' 
  | 'extremely_active';

export type FitnessGoal = 
  | 'lose_weight' 
  | 'gain_weight' 
  | 'maintain_weight';

export type FoodPreference = 
  | 'vegetarian' 
  | 'non_vegetarian' 
  | 'vegan' 
  | 'eggetarian';

export interface UserProfile {
  name: string;
  age: number;
  gender: Gender;
  height: number; // in cm
  weight: number; // in kg
  targetWeight: number; // in kg
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  foodPreference: FoodPreference;
  allergies: string[];
  dailyWaterGoal: number; // in ml
  sleepGoal: number; // in hours
  mealsPerDay: number; // 3, 4, 5, 6
  isOnboarded: boolean;
  reminders: {
    water: boolean;
    meals: boolean;
    workout: boolean;
    walk: boolean;
    sleep: boolean;
    weight: boolean;
  };
  reminderTimes: {
    water: string;
    meals: string;
    workout: string;
    walk: string;
    sleep: string;
    weight: string;
  };
}

export type MealCategory = 
  | 'breakfast' 
  | 'morning_snack' 
  | 'lunch' 
  | 'evening_snack' 
  | 'dinner';

export interface MealItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  category: MealCategory;
  isEaten: boolean;
  isIndian: boolean;
  icon?: string;
  notes?: string;
  allergens?: string[];
  foodPreference: FoodPreference[];
  alternatives?: Omit<MealItem, 'alternatives'>[];
}

export type WorkoutCategory = 
  | 'beginner' 
  | 'fat_loss' 
  | 'muscle_gain' 
  | 'full_body' 
  | 'home' 
  | 'gym' 
  | 'walking' 
  | 'running' 
  | 'strength'
  | 'split';

export type ExerciseAnimationType = 
  | 'pushup'
  | 'squat'
  | 'bridge'
  | 'plank'
  | 'lunge'
  | 'climber'
  | 'jumping_jack'
  | 'crunch'
  | 'bench_press'
  | 'incline_bench'
  | 'decline_bench'
  | 'dumbbell_fly'
  | 'pullup'
  | 'lat_pulldown'
  | 'row'
  | 'dumbbell_row'
  | 'overhead_press'
  | 'lateral_raise'
  | 'front_raise'
  | 'rear_delt_fly'
  | 'face_pull'
  | 'bicep_curl'
  | 'hammer_curl'
  | 'preacher_curl'
  | 'triceps_pushdown'
  | 'skull_crusher'
  | 'dip'
  | 'deadlift'
  | 'rdl'
  | 'leg_press'
  | 'leg_extension'
  | 'leg_curl'
  | 'hip_thrust'
  | 'calf_raise'
  | 'russian_twist'
  | 'leg_raise'
  | 'walk'
  | 'run'
  | 'generic';

export interface ExercisePhase {
  phase: 'setup' | 'eccentric' | 'concentric' | 'recovery';
  title: string;
  instruction: string;
  cue: string;
  durationSeconds: number;
}

export interface ExerciseFormCheckpoint {
  aspect: string;
  correct: string;
  mistakeToAvoid: string;
}

export interface ExerciseDemoData {
  animationType: ExerciseAnimationType;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  tempo: {
    down: number; // seconds lowering
    pause: number; // seconds hold
    up: number; // seconds push/pull
    reset: number; // seconds transition
  };
  phases: ExercisePhase[];
  formCheckpoints: ExerciseFormCheckpoint[];
  breathingGuide: string;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  durationEstimate: string;
  instructions: string;
  targetMuscle: string;
  tips: string;
  // Scalable Exercise Database Fields
  category?: string;
  muscleGroup?: string;
  secondaryMuscles?: string[];
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment?: string;
  goal?: string;
  steps?: string[];
  commonMistakes?: string[];
  safetyTips?: string[];
  tempo?: {
    down: number;
    pause: number;
    up: number;
    reset: number;
  };
  breathing?: string;
  demoType?: ExerciseAnimationType;
  demo?: ExerciseDemoData;
}

export interface Workout {
  id: string;
  title: string;
  category: WorkoutCategory;
  categoryLabel: string;
  durationMinutes: number;
  caloriesBurned: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  targetMuscles: string[];
  description: string;
  exercises: Exercise[];
  splitDay?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  location?: 'Gym' | 'Home' | 'Both';
  goal?: 'weight_loss' | 'muscle_gain' | 'general_fitness' | 'strength';
}

export interface WorkoutSessionRecord {
  id: string;
  userId?: string;
  workoutId: string;
  workoutTitle: string;
  date: string; // YYYY-MM-DD
  durationSeconds: number;
  caloriesBurned: number;
  exercisesCompleted: number;
  setsCompleted: number;
  repsCompleted: number;
  completedAt: string; // ISO string
  dayOfWeek?: string;
}

export interface DailyMetrics {
  date: string; // YYYY-MM-DD
  caloriesConsumed: number;
  proteinConsumed: number;
  carbsConsumed: number;
  fatConsumed: number;
  steps: number;
  stepGoal: number;
  distanceKm: number;
  caloriesBurned: number;
  waterConsumedMl: number;
  sleepMinutes: number;
  heartRateCurrent: number;
  heartRateResting: number;
  heartRateAvg: number;
  weightLogged?: number;
  wearableConnected: boolean;
}

export interface WeightLog {
  id: string;
  date: string;
  weight: number; // kg
  notes?: string;
}

export interface BodyMeasurements {
  id: string;
  date: string;
  waist: number; // cm
  chest: number; // cm
  arms: number; // cm
  thighs: number; // cm
  neck: number; // cm
}

export interface CalculationResults {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  calorieDifference: number; // e.g., -500 for loss, +350 for gain
  estimatedWeeklyChangeKg: number;
  bmi: number;
  bmiCategory: string;
  bmiDescription: string;
  healthyWeightMin: number;
  healthyWeightMax: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export type NotificationType = 'water' | 'workout' | 'meal' | 'walk' | 'general';

export interface NotificationAction {
  id: string;
  label: string;
  actionType: 'add_water_250' | 'add_water_500' | 'start_workout' | 'navigate_water' | 'navigate_workout' | 'dismiss';
  primary?: boolean;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string; // ISO string
  read: boolean;
  actions?: NotificationAction[];
  metadata?: {
    currentWaterMl?: number;
    targetWaterMl?: number;
    workoutId?: string;
    workoutTitle?: string;
    scheduledTime?: string;
  };
}
