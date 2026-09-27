import { ActivityLevel, CalculationResults, FitnessGoal, Gender, UserProfile } from '../types';

export const MEDICAL_DISCLAIMER = 
  "Estimates for wellness only. Not medical advice. Consult a physician before changing diet or exercise.";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, { title: string; desc: string }> = {
  sedentary: { title: 'Sedentary', desc: 'Little to no exercise, desk job' },
  lightly_active: { title: 'Lightly Active', desc: 'Light exercise / sports 1-3 days/week' },
  moderately_active: { title: 'Moderately Active', desc: 'Moderate exercise 3-5 days/week' },
  very_active: { title: 'Very Active', desc: 'Hard exercise 6-7 days/week' },
  extremely_active: { title: 'Extremely Active', desc: 'Very hard exercise, physical job or 2x training' },
};

/**
 * Calculates BMR using the Mifflin-St Jeor Equation
 * Men: BMR = 10 × weight (kg) + 6.25 × height (cm) - 5 × age + 5
 * Women: BMR = 10 × weight (kg) + 6.25 × height (cm) - 5 × age - 161
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender = 'male'): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const bmr = gender === 'male' ? base + 5 : base - 161;
  return Math.round(bmr);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculates full health & calorie results
 */
export function calculateHealthPlan(profile: Pick<UserProfile, 'weight' | 'height' | 'age' | 'gender' | 'activityLevel' | 'goal'>): CalculationResults {
  const { weight, height, age, gender, activityLevel, goal } = profile;

  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  let calorieDifference = 0;
  let estimatedWeeklyChangeKg = 0;

  // Calorie adjustments with safety floors
  if (goal === 'lose_weight') {
    // 500 kcal deficit ≈ 0.5 kg loss per week (3500 kcal / week)
    calorieDifference = -500;
    estimatedWeeklyChangeKg = -0.45;
  } else if (goal === 'gain_weight') {
    // 350 kcal surplus ≈ 0.35 kg lean gain per week
    calorieDifference = 350;
    estimatedWeeklyChangeKg = 0.35;
  } else {
    // Maintenance
    calorieDifference = 0;
    estimatedWeeklyChangeKg = 0;
  }

  // Safety floor: Ensure target calories don't drop below 1500 kcal for adult males
  const rawTargetCalories = tdee + calorieDifference;
  const minSafeCalories = gender === 'male' ? 1500 : 1250;
  const targetCalories = Math.max(minSafeCalories, rawTargetCalories);

  // Macro distribution calculations
  // Protein: higher for weight loss (2.0g/kg) to preserve lean mass; 1.8g/kg for gain; 1.6g/kg for maintenance
  let proteinFactor = 1.6;
  if (goal === 'lose_weight') proteinFactor = 2.0;
  if (goal === 'gain_weight') proteinFactor = 1.8;

  const targetProtein = Math.round(weight * proteinFactor);
  const proteinCalories = targetProtein * 4;

  // Fat: 25% of target calories
  const fatCalories = targetCalories * 0.25;
  const targetFat = Math.round(fatCalories / 9);

  // Carbs: Remainder of calories
  const remainingCalories = Math.max(0, targetCalories - proteinCalories - fatCalories);
  const targetCarbs = Math.round(remainingCalories / 4);

  // BMI calculations
  const heightInMeters = height / 100;
  const bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));

  let bmiCategory = 'Normal Weight';
  let bmiDescription = 'Your weight is currently within the standard healthy recommended range for your height.';

  if (bmi < 18.5) {
    bmiCategory = 'Underweight';
    bmiDescription = 'Your weight is below the standard healthy range. Focus on nutrient-dense calorie surplus with strength training.';
  } else if (bmi >= 18.5 && bmi < 25) {
    bmiCategory = 'Normal Weight';
    bmiDescription = 'Your weight is in the healthy BMI bracket. Maintain balanced nutrition and regular physical activity.';
  } else if (bmi >= 25 && bmi < 30) {
    bmiCategory = 'Overweight';
    bmiDescription = 'Your BMI indicates slight excess mass relative to height. A steady, moderate calorie deficit and active steps can optimize body composition.';
  } else {
    bmiCategory = 'Obesity Class';
    bmiDescription = 'Your weight is significantly above the standard baseline. A sustainable, gradual deficit with professional medical guidance is encouraged.';
  }

  const healthyWeightMin = Math.round(18.5 * heightInMeters * heightInMeters);
  const healthyWeightMax = Math.round(24.9 * heightInMeters * heightInMeters);

  return {
    bmr,
    tdee,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
    calorieDifference,
    estimatedWeeklyChangeKg,
    bmi,
    bmiCategory,
    bmiDescription,
    healthyWeightMin,
    healthyWeightMax,
  };
}

/**
 * Calculates optimal water recommendation in ml based on weight and activity
 */
export function calculateRecommendedWater(weightKg: number, activityLevel: ActivityLevel): number {
  // Baseline ~35ml per kg + activity boost
  let baseMl = weightKg * 35;
  if (activityLevel === 'moderately_active') baseMl += 400;
  if (activityLevel === 'very_active' || activityLevel === 'extremely_active') baseMl += 750;
  // Round to nearest 250ml
  return Math.round(baseMl / 250) * 250;
}
