import { WeightLog, DailyMetrics } from '../types';

export interface DayWeightPoint {
  date: string; // YYYY-MM-DD
  displayDate: string; // "Sep 5"
  dayNumber: number; // 1 - 30
  weight: number;
  isRecorded: boolean;
  movingAvg: number;
  changeFromStart: number;
  targetWeight: number;
  deficitKcal: number;
}

export interface DayActivityPoint {
  date: string;
  displayDate: string;
  dayOfWeek: string;
  dayNumber: number;
  steps: number;
  stepGoal: number;
  goalMet: boolean;
  caloriesBurned: number;
  distanceKm: number;
  activeMinutes: number;
  isToday: boolean;
}

/**
 * Generates continuous 30-day weight data with 7-day moving averages and real log integration
 */
export function getThirtyDayWeightData(
  weightHistory: WeightLog[],
  currentWeight: number,
  targetWeight: number,
  goal: string = 'lose_weight'
): DayWeightPoint[] {
  const result: DayWeightPoint[] = [];
  const today = new Date();
  
  // Create a map of existing logged weights
  const logMap = new Map<string, number>();
  weightHistory.forEach(log => {
    logMap.set(log.date, log.weight);
  });

  const startWeight = weightHistory.length > 0 ? weightHistory[0].weight : currentWeight + 3.5;
  const totalChange = currentWeight - startWeight;
  const isLosing = goal === 'lose_weight' || totalChange < 0;

  // Build 30 days history up to today
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayNumber = 30 - i;

    let weightVal: number;
    let isRecorded = false;

    if (logMap.has(dateStr)) {
      weightVal = logMap.get(dateStr)!;
      isRecorded = true;
    } else if (i === 0) {
      weightVal = currentWeight;
      isRecorded = true;
    } else {
      // Linear interpolation between startWeight and currentWeight with realistic slight day-to-day water/glycogen noise
      const progressFraction = (30 - i) / 30;
      const baseTrend = startWeight + totalChange * Math.pow(progressFraction, 0.95);
      
      // Realistic sinusoidal fluctuation (-0.25kg to +0.25kg)
      const dayFactor = Math.sin(dayNumber * 1.8) * 0.22 + Math.cos(dayNumber * 0.7) * 0.12;
      weightVal = Number((baseTrend + dayFactor).toFixed(1));
    }

    result.push({
      date: dateStr,
      displayDate,
      dayNumber,
      weight: Number(weightVal.toFixed(1)),
      isRecorded,
      movingAvg: Number(weightVal.toFixed(1)), // will compute in next pass
      changeFromStart: Number((weightVal - startWeight).toFixed(1)),
      targetWeight,
      deficitKcal: isLosing ? 500 : 350,
    });
  }

  // Calculate 7-day trailing moving average
  for (let idx = 0; idx < result.length; idx++) {
    const windowStart = Math.max(0, idx - 6);
    const slice = result.slice(windowStart, idx + 1);
    const avg = slice.reduce((sum, item) => sum + item.weight, 0) / slice.length;
    result[idx].movingAvg = Number(avg.toFixed(2));
  }

  return result;
}

/**
 * Generates continuous 30-day activity data based on user metrics and realistic active patterns
 */
export function getThirtyDayActivityData(
  dailyMetrics: DailyMetrics,
  stepGoal: number = 10000
): DayActivityPoint[] {
  const result: DayActivityPoint[] = [];
  const today = new Date();

  // Seeded mock template for the last 30 days
  const stepModifiers = [
    0.85, 1.05, 1.12, 0.92, 1.18, 0.95, 0.78, // week 1
    0.98, 1.08, 1.15, 0.88, 1.02, 1.25, 0.82, // week 2
    1.04, 0.96, 1.10, 1.14, 0.91, 1.20, 0.80, // week 3
    1.06, 1.15, 0.94, 1.08, 1.18, 1.02, 0.85, // week 4
    1.12, 1.00 // week 5 (days 29, 30)
  ];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayOfWeek = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dayIndex = 29 - i;
    const isToday = i === 0;

    let steps = isToday 
      ? dailyMetrics.steps 
      : Math.round(stepGoal * (stepModifiers[dayIndex] || 1.0));
      
    // Slight jitter
    if (!isToday) {
      steps += Math.floor((Math.sin(dayIndex * 3.7) * 450));
    }

    const goalMet = steps >= stepGoal;
    const distanceKm = Number((steps * 0.00078).toFixed(2));
    
    // Active calories: base walk burn (~0.04 kcal/step) + extra workout bonus on high activity days
    let caloriesBurned = Math.round(steps * 0.042);
    if (steps > 10500) {
      caloriesBurned += 180; // Added workout session
    }
    if (isToday) {
      caloriesBurned = dailyMetrics.caloriesBurned;
    }

    const activeMinutes = Math.round(steps / 115) + (steps > 10000 ? 35 : 10);

    result.push({
      date: dateStr,
      displayDate,
      dayOfWeek,
      dayNumber: 30 - i,
      steps,
      stepGoal,
      goalMet,
      caloriesBurned,
      distanceKm,
      activeMinutes,
      isToday
    });
  }

  return result;
}
