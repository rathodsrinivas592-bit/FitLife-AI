import React, { useState, useMemo } from 'react';
import { 
  TrendingDown, 
  TrendingUp, 
  Scale, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Target, 
  Footprints, 
  Flame, 
  Droplet, 
  Moon, 
  Dumbbell, 
  Ruler, 
  Info,
  Calendar,
  X,
  Activity,
  BarChart3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import { D3WeightTrendChart } from './D3WeightTrendChart';
import { D3ActivityTrendsChart } from './D3ActivityTrendsChart';
import { getThirtyDayWeightData, getThirtyDayActivityData } from '../../utils/historyData';

export const ProgressScreen: React.FC = () => {
  const { 
    userProfile, 
    calculationResults, 
    dailyMetrics, 
    weightHistory, 
    addWeightLog, 
    measurementsHistory, 
    addMeasurements,
    completedWorkouts,
    healthScore,
    goalsCompletedCount,
    totalGoalsCount
  } = useApp();

  const [activeChartTab, setActiveChartTab] = useState<'all' | 'weight' | 'activity'>('all');
  const [isLogWeightModalOpen, setIsLogWeightModalOpen] = useState<boolean>(false);
  const [newWeightInput, setNewWeightInput] = useState<number>(userProfile.weight);
  const [weightNotesInput, setWeightNotesInput] = useState<string>('');

  const [isMeasurementsModalOpen, setIsMeasurementsModalOpen] = useState<boolean>(false);
  const [waistInput, setWaistInput] = useState<number>(84);
  const [chestInput, setChestInput] = useState<number>(101);
  const [armsInput, setArmsInput] = useState<number>(36.5);
  const [thighsInput, setThighsInput] = useState<number>(56.5);
  const [neckInput, setNeckInput] = useState<number>(38.5);

  const startWeight = weightHistory.length > 0 ? weightHistory[0].weight : userProfile.weight;
  const currentWeight = userProfile.weight;
  const targetWeight = userProfile.targetWeight;

  // Memoized 30-Day D3 Data
  const thirtyDayWeightData = useMemo(() => {
    return getThirtyDayWeightData(
      weightHistory, 
      userProfile.weight, 
      userProfile.targetWeight, 
      userProfile.goal
    );
  }, [weightHistory, userProfile.weight, userProfile.targetWeight, userProfile.goal]);

  const thirtyDayActivityData = useMemo(() => {
    return getThirtyDayActivityData(
      dailyMetrics, 
      dailyMetrics.stepGoal || 10000
    );
  }, [dailyMetrics]);

  // Latest measurements
  const latestMeasure = measurementsHistory[measurementsHistory.length - 1];
  const initialMeasure = measurementsHistory[0];

  return (
    <div className="space-y-4">
      {/* Title */}
      <section aria-label="Progress Title" className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Progress & Analytics</h1>
          <p className="text-xs text-slate-400 capitalize">
            {userProfile.goal.replace('_', ' ')} Plan · Body Composition
          </p>
        </div>

        <button
          onClick={() => setIsLogWeightModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Weight</span>
        </button>
      </section>

      {/* 30-Day D3 Analytics Filter Tabs */}
      <section aria-label="Chart Filter Navigation" className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveChartTab('all')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeChartTab === 'all'
                ? 'bg-slate-800 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>All 30D Charts</span>
          </button>

          <button
            onClick={() => setActiveChartTab('weight')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeChartTab === 'weight'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Weight Loss</span>
          </button>

          <button
            onClick={() => setActiveChartTab('activity')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeChartTab === 'activity'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Activity Levels</span>
          </button>
        </div>

        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
          D3.js Interactive
        </span>
      </section>

      {/* D3 Weight Trend Chart */}
      {(activeChartTab === 'all' || activeChartTab === 'weight') && (
        <section aria-label="30-Day Weight Trend">
          <D3WeightTrendChart
            data={thirtyDayWeightData}
            startWeight={startWeight}
            currentWeight={currentWeight}
            targetWeight={targetWeight}
            goal={userProfile.goal}
          />
        </section>
      )}

      {/* D3 Activity Trends Chart */}
      {(activeChartTab === 'all' || activeChartTab === 'activity') && (
        <section aria-label="30-Day Activity Trends">
          <D3ActivityTrendsChart
            data={thirtyDayActivityData}
            stepGoal={dailyMetrics.stepGoal || 10000}
          />
        </section>
      )}

      {/* Goal Blueprint: Weight Loss or Weight Gain Specific Plan */}
      <section aria-label="Goal Blueprint Details" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white capitalize">
              {userProfile.goal === 'lose_weight' 
                ? 'Personalized Weight Loss Plan' 
                : userProfile.goal === 'gain_weight' 
                ? 'Personalized Weight Gain Plan' 
                : 'Weight Maintenance Plan'}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {calculationResults.calorieDifference >= 0 ? `+${calculationResults.calorieDifference}` : calculationResults.calorieDifference} kcal/day
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Daily Calorie Target</span>
              <span className="font-bold text-white font-mono">{calculationResults.targetCalories} kcal</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Protein Target</span>
              <span className="font-bold text-white font-mono">{calculationResults.targetProtein} g/day</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Footprints className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Daily Walking Target</span>
              <span className="font-bold text-white font-mono">10,000 steps</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Workout Regimen</span>
              <span className="font-bold text-white font-mono">4-5 days / week</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Droplet className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Water Target</span>
              <span className="font-bold text-white font-mono">{(userProfile.dailyWaterGoal / 1000).toFixed(1)} Liters</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2">
            <Moon className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Sleep Target</span>
              <span className="font-bold text-white font-mono">{userProfile.sleepGoal} Hours</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed pt-2 border-t border-slate-800">
          {userProfile.goal === 'lose_weight'
            ? 'Safety Notice: This plan applies a healthy, scientifically sound 500 kcal deficit targeting ~0.45 kg loss per week. We never recommend extreme calorie restriction under 1,500 kcal for male health.'
            : 'Safety Notice: This plan utilizes a clean surplus of +350 kcal paired with hypertrophy-oriented strength recommendations for progressive lean tissue development without excessive fat accumulation.'}
        </p>
      </section>

      {/* BMI Calculator & Visual Gauge */}
      <section aria-label="BMI Calculator" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">BMI Calculator</h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400">
            BMI: {calculationResults.bmi}
          </span>
        </div>

        {/* Visual BMI Gauge */}
        <div className="space-y-1.5">
          <div className="w-full h-3 rounded-full bg-slate-800 flex overflow-hidden">
            <div className="w-[18.5%] bg-sky-400/80" title="Underweight (< 18.5)" />
            <div className="w-[32%] bg-emerald-400" title="Normal (18.5 - 24.9)" />
            <div className="w-[25%] bg-amber-400" title="Overweight (25 - 29.9)" />
            <div className="w-[24.5%] bg-rose-400" title="Obese (>= 30)" />
          </div>

          <div className="flex justify-between text-[9px] text-slate-400 font-mono">
            <span>&lt;18.5</span>
            <span>18.5 - 24.9</span>
            <span>25.0 - 29.9</span>
            <span>30.0+</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Category:</span>
            <span className="font-bold text-white">{calculationResults.bmiCategory}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Estimated Healthy Weight Range:</span>
            <span className="font-mono text-slate-200">{calculationResults.healthyWeightMin} kg - {calculationResults.healthyWeightMax} kg</span>
          </div>
          <p className="text-[10px] text-slate-400 pt-1 text-justify leading-relaxed">
            * Note: BMI is weight / height² ({userProfile.weight}kg / {(userProfile.height/100).toFixed(2)}m²). It does not distinguish between lean skeletal muscle mass and body fat.
          </p>
        </div>
      </section>

      {/* Body Measurements Section */}
      <section aria-label="Body Measurements" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Body Measurements</h3>
          </div>
          <button
            onClick={() => setIsMeasurementsModalOpen(true)}
            className="text-xs text-emerald-400 hover:underline font-semibold"
          >
            + Update
          </button>
        </div>

        {latestMeasure && (
          <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-[10px] text-slate-400 block">Waist</span>
              <span className="font-bold text-white font-mono mt-0.5 block">{latestMeasure.waist} cm</span>
              {initialMeasure && (
                <span className="text-[9px] text-emerald-400 font-mono font-semibold">
                  {(latestMeasure.waist - initialMeasure.waist).toFixed(1)} cm
                </span>
              )}
            </div>

            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-[10px] text-slate-400 block">Chest</span>
              <span className="font-bold text-white font-mono mt-0.5 block">{latestMeasure.chest} cm</span>
              {initialMeasure && (
                <span className="text-[9px] text-slate-400 font-mono">
                  {(latestMeasure.chest - initialMeasure.chest).toFixed(1)} cm
                </span>
              )}
            </div>

            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-[10px] text-slate-400 block">Arms</span>
              <span className="font-bold text-white font-mono mt-0.5 block">{latestMeasure.arms} cm</span>
              {initialMeasure && (
                <span className="text-[9px] text-emerald-400 font-mono font-semibold">
                  +{(latestMeasure.arms - initialMeasure.arms).toFixed(1)} cm
                </span>
              )}
            </div>

            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-[10px] text-slate-400 block">Thighs</span>
              <span className="font-bold text-white font-mono mt-0.5 block">{latestMeasure.thighs} cm</span>
              {initialMeasure && (
                <span className="text-[9px] text-emerald-400 font-mono font-semibold">
                  {(latestMeasure.thighs - initialMeasure.thighs).toFixed(1)} cm
                </span>
              )}
            </div>

            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-850">
              <span className="text-[10px] text-slate-400 block">Neck</span>
              <span className="font-bold text-white font-mono mt-0.5 block">{latestMeasure.neck} cm</span>
              {initialMeasure && (
                <span className="text-[9px] text-slate-400 font-mono">
                  {(latestMeasure.neck - initialMeasure.neck).toFixed(1)} cm
                </span>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Daily Goals Checklist Section */}
      <section aria-label="Daily Goals Checklist" className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Daily Health Goals</h3>
            <p className="text-[11px] text-slate-400">Score: {healthScore}% ({goalsCompletedCount}/{totalGoalsCount} completed)</p>
          </div>
          <span className="text-sm font-bold font-mono text-emerald-400">{healthScore}%</span>
        </div>

        <div className="space-y-2 text-xs">
          {[
            {
              title: 'Calories Target',
              val: `${dailyMetrics.caloriesConsumed} / ${calculationResults.targetCalories} kcal`,
              met: dailyMetrics.caloriesConsumed >= calculationResults.targetCalories * 0.85 && dailyMetrics.caloriesConsumed <= calculationResults.targetCalories * 1.1,
            },
            {
              title: 'Protein Target',
              val: `${dailyMetrics.proteinConsumed} / ${calculationResults.targetProtein} g`,
              met: dailyMetrics.proteinConsumed >= calculationResults.targetProtein * 0.8,
            },
            {
              title: 'Steps Target',
              val: `${dailyMetrics.steps.toLocaleString()} / ${dailyMetrics.stepGoal.toLocaleString()} (${Math.round((dailyMetrics.steps / dailyMetrics.stepGoal) * 100)}%)`,
              met: dailyMetrics.steps >= dailyMetrics.stepGoal,
            },
            {
              title: 'Water Hydration',
              val: `${(dailyMetrics.waterConsumedMl / 1000).toFixed(1)} / ${(userProfile.dailyWaterGoal / 1000).toFixed(1)} L (${Math.round((dailyMetrics.waterConsumedMl / userProfile.dailyWaterGoal) * 100)}%)`,
              met: dailyMetrics.waterConsumedMl >= userProfile.dailyWaterGoal,
            },
            {
              title: 'Sleep Rest',
              val: `${Math.floor(dailyMetrics.sleepMinutes / 60)}h ${dailyMetrics.sleepMinutes % 60}m / ${userProfile.sleepGoal}h`,
              met: dailyMetrics.sleepMinutes >= userProfile.sleepGoal * 60 * 0.85,
            },
            {
              title: 'Workout Completed',
              val: completedWorkouts.length > 0 ? `${completedWorkouts.length} Session Done` : 'Pending today',
              met: completedWorkouts.length > 0,
            },
            {
              title: 'Weight Logged',
              val: dailyMetrics.weightLogged ? `${dailyMetrics.weightLogged} kg recorded` : 'Not recorded today',
              met: Boolean(dailyMetrics.weightLogged),
            },
          ].map((goal, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border flex items-center justify-between ${
                goal.met 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {goal.met ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                )}
                <span className="font-medium text-xs">{goal.title}</span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">{goal.val}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Medical Disclaimer */}
      <DisclaimerBanner compact />

      {/* LOG WEIGHT MODAL */}
      {isLogWeightModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-base">Record Today's Weight</h4>
              <button onClick={() => setIsLogWeightModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Body Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="35"
                max="250"
                value={newWeightInput}
                onChange={(e) => setNewWeightInput(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-lg font-bold"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Notes (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Weighed morning empty stomach"
                value={weightNotesInput}
                onChange={(e) => setWeightNotesInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsLogWeightModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addWeightLog(newWeightInput, undefined, weightNotesInput);
                  setIsLogWeightModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Save Weight
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE MEASUREMENTS MODAL */}
      {isMeasurementsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-base">Record Body Measurements (cm)</h4>
              <button onClick={() => setIsMeasurementsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Waist (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={waistInput}
                  onChange={(e) => setWaistInput(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Chest (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={chestInput}
                  onChange={(e) => setChestInput(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Arms (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={armsInput}
                  onChange={(e) => setArmsInput(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Thighs (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={thighsInput}
                  onChange={(e) => setThighsInput(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>

              <div className="col-span-2">
                <label className="text-slate-400 block mb-1">Neck (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={neckInput}
                  onChange={(e) => setNeckInput(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsMeasurementsModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addMeasurements({
                    waist: waistInput,
                    chest: chestInput,
                    arms: armsInput,
                    thighs: thighsInput,
                    neck: neckInput,
                  });
                  setIsMeasurementsModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
              >
                Save Measurements
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
