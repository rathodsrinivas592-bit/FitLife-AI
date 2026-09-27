import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Gauge, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  Wind,
  Layers,
  Sparkles
} from 'lucide-react';
import { Exercise, ExerciseDemoData, ExercisePhase } from '../../types';
import { getExerciseDemo } from '../../data/exerciseDemoRegistry';

interface ExerciseKineticDemoProps {
  exercise: Exercise;
  compact?: boolean;
  onStartLiveDemo?: () => void;
}

export const ExerciseKineticDemo: React.FC<ExerciseKineticDemoProps> = ({
  exercise,
  compact = false,
  onStartLiveDemo,
}) => {
  const demoData: ExerciseDemoData = getExerciseDemo(exercise);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [currentProgress, setCurrentProgress] = useState<number>(0); // 0 to 1
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [showCheckpoints, setShowCheckpoints] = useState<boolean>(!compact);

  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Total cycle duration calculated from tempo or default 4 seconds
  const totalCycleDuration = (demoData.tempo.down + demoData.tempo.pause + demoData.tempo.up + demoData.tempo.reset) || 4.5;

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== null && isPlaying) {
        const delta = (time - previousTimeRef.current) / 1000;
        setCurrentProgress((prev) => {
          const next = (prev + (delta * speed) / totalCycleDuration) % 1.0;
          return next;
        });
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, speed, totalCycleDuration]);

  // Sync active phase with current progress
  useEffect(() => {
    const numPhases = demoData.phases.length;
    if (numPhases > 0) {
      const idx = Math.min(numPhases - 1, Math.floor(currentProgress * numPhases));
      setActivePhaseIndex(idx);
    }
  }, [currentProgress, demoData.phases.length]);

  const jumpToPhase = (phaseIndex: number) => {
    setIsPlaying(false);
    setActivePhaseIndex(phaseIndex);
    const numPhases = demoData.phases.length;
    setCurrentProgress(phaseIndex / numPhases);
  };

  // Kinetic SVG rendering based on animationType & progress
  // Progress goes 0 -> 1. We compute movement interpolation 't' (0 to 1 then back or cyclical)
  // For standard reps: eccentric (0 -> 0.5), concentric (0.5 -> 1.0)
  const repT = Math.sin(currentProgress * Math.PI); // 0 -> 1 -> 0 smooth sinusoidal bounce

  const renderVisualFigure = () => {
    const type = demoData.animationType;

    switch (type) {
      case 'squat': {
        // Squat: hips sink down, knees bend forward, chest maintains posture, quads & glutes glow
        const hipY = 120 + repT * 38;
        const kneeY = 145 + repT * 12;
        const chestY = 85 + repT * 35;
        const headY = 55 + repT * 35;
        const barY = 70 + repT * 35;
        const muscleGlow = repT > 0.45;

        return (
          <svg viewBox="0 0 280 230" className="w-full h-full select-none" aria-label="Squat movement demo">
            <defs>
              <linearGradient id="muscleActiveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
              </linearGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Floor line & grid */}
            <line x1="30" y1="205" x2="250" y2="205" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            <line x1="70" y1="205" x2="210" y2="205" stroke="#10b981" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />

            {/* Depth Guideline / Target line */}
            <line x1="60" y1="158" x2="220" y2="158" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="3 3" opacity={repT > 0.7 ? 0.8 : 0.25} />
            <text x="225" y="161" fill="#0ea5e9" fontSize="9" opacity={repT > 0.7 ? 0.9 : 0.4} fontFamily="monospace">Parallel Depth</text>

            {/* Feet */}
            <ellipse cx="110" cy="204" rx="14" ry="4" fill="#64748b" />
            <ellipse cx="170" cy="204" rx="14" ry="4" fill="#64748b" />

            {/* Lower legs / shins */}
            <line x1="110" y1="204" x2="102" y2={kneeY} stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
            <line x1="170" y1="204" x2="178" y2={kneeY} stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />

            {/* Thighs / Quadriceps with Dynamic Contraction Highlight */}
            <line 
              x1="102" 
              y1={kneeY} 
              x2="125" 
              y2={hipY} 
              stroke={muscleGlow ? 'url(#muscleActiveGlow)' : '#64748b'} 
              strokeWidth={muscleGlow ? "12" : "9"} 
              strokeLinecap="round"
              filter={muscleGlow ? 'url(#glowFilter)' : undefined}
              className="transition-all duration-150"
            />
            <line 
              x1="178" 
              y1={kneeY} 
              x2="155" 
              y2={hipY} 
              stroke={muscleGlow ? 'url(#muscleActiveGlow)' : '#64748b'} 
              strokeWidth={muscleGlow ? "12" : "9"} 
              strokeLinecap="round"
              filter={muscleGlow ? 'url(#glowFilter)' : undefined}
              className="transition-all duration-150"
            />

            {/* Pelvis / Glutes */}
            <ellipse 
              cx="140" 
              cy={hipY} 
              rx="22" 
              ry="11" 
              fill={muscleGlow ? '#10b981' : '#475569'} 
              filter={muscleGlow ? 'url(#glowFilter)' : undefined}
            />

            {/* Torso / Spine (Upright with slight athletic hinge) */}
            <line x1="140" y1={hipY} x2="140" y2={chestY} stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" />

            {/* Head */}
            <circle cx="140" cy={headY} r="14" fill="#e2e8f0" />
            {/* Gaze direction line */}
            <circle cx="144" cy={headY - 2} r="2.5" fill="#0f172a" />

            {/* Arms / Barbell or Hands */}
            <line x1="140" y1={chestY - 5} x2="115" y2={barY + 6} stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
            <line x1="140" y1={chestY - 5} x2="165" y2={barY + 6} stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />

            {/* Barbell Across Traps */}
            <line x1="80" y1={barY} x2="200" y2={barY} stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
            <rect x="72" y={barY - 12} width="8" height="24" rx="2" fill="#d97706" />
            <rect x="200" y={barY - 12} width="8" height="24" rx="2" fill="#d97706" />

            {/* Kinetic Energy / Force Arrows at apex */}
            {repT > 0.6 && (
              <g className="animate-pulse">
                <path d={`M 95 ${hipY + 5} L 95 ${hipY - 10} M 90 ${hipY - 5} L 95 ${hipY - 10} L 100 ${hipY - 5}`} stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                <path d={`M 185 ${hipY + 5} L 185 ${hipY - 10} M 180 ${hipY - 5} L 185 ${hipY - 10} L 190 ${hipY - 5}`} stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
              </g>
            )}
          </svg>
        );
      }

      case 'pushup': {
        // Pushup: floor horizontal, chest lowers, elbows bend 45°, pecs & triceps glow
        const angle = -12 + repT * 6; // plank angle
        const chestY = 135 + repT * 32;
        const shoulderX = 85;
        const elbowX = 75 - repT * 15;
        const elbowY = 150 + repT * 18;
        const muscleGlow = repT > 0.5;

        return (
          <svg viewBox="0 0 280 230" className="w-full h-full select-none" aria-label="Push-up movement demo">
            <defs>
              <linearGradient id="chestGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Exercise Mat */}
            <rect x="35" y="195" width="210" height="8" rx="4" fill="#1e293b" stroke="#334155" />

            {/* Hand on floor */}
            <circle cx="85" cy="195" r="7" fill="#64748b" />
            {/* Feet on floor */}
            <circle cx="215" cy="192" r="7" fill="#64748b" />

            {/* Forearm & Upper Arm */}
            <line x1="85" y1="195" x2={elbowX} y2={elbowY} stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
            <line 
              x1={elbowX} 
              y1={elbowY} 
              x2={shoulderX} 
              y2={chestY} 
              stroke={muscleGlow ? '#10b981' : '#94a3b8'} 
              strokeWidth={muscleGlow ? "10" : "7"} 
              strokeLinecap="round" 
            />

            {/* Rigid Body Line (Torso + Legs) */}
            <line 
              x1={shoulderX} 
              y1={chestY} 
              x2="215" 
              y2="190" 
              stroke={muscleGlow ? 'url(#chestGlow)' : '#cbd5e1'} 
              strokeWidth="11" 
              strokeLinecap="round" 
            />

            {/* Head */}
            <circle cx="65" cy={chestY - 12} r="13" fill="#e2e8f0" />
            <circle cx="60" cy={chestY - 10} r="2.5" fill="#0f172a" />

            {/* Chest Contraction Arc */}
            {muscleGlow && (
              <circle cx={shoulderX} cy={chestY} r="18" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="3 3" className="animate-spin" />
            )}

            {/* Floor Proximity Indicator */}
            <line x1="60" y1="185" x2="110" y2="185" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
            <text x="115" y="188" fill="#38bdf8" fontSize="8" fontFamily="monospace">1" Chest Deck Clearance</text>
          </svg>
        );
      }

      case 'plank': {
        // Forearm plank: isometric hold with breathing pulse wave
        const breathWave = Math.sin(currentProgress * Math.PI * 4) * 3;

        return (
          <svg viewBox="0 0 280 230" className="w-full h-full select-none" aria-label="Plank isometric demo">
            <rect x="30" y="185" width="220" height="8" rx="4" fill="#1e293b" stroke="#334155" />

            {/* Forearm on mat */}
            <line x1="75" y1="185" x2="98" y2="185" stroke="#64748b" strokeWidth="7" strokeLinecap="round" />
            <line x1="98" y1="185" x2="98" y2="152" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />

            {/* Feet */}
            <circle cx="215" cy="180" r="7" fill="#64748b" />

            {/* Straight Spine & Hollow Core */}
            <line x1="98" y1="152" x2="215" y2="180" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" />

            {/* Core Pulse Wave */}
            <line 
              x1="125" 
              y1={158 + breathWave} 
              x2="175" 
              y2={170 + breathWave} 
              stroke="#10b981" 
              strokeWidth="10" 
              strokeLinecap="round" 
              className="animate-pulse"
            />

            {/* Head */}
            <circle cx="80" cy="142" r="13" fill="#e2e8f0" />
            <circle cx="77" cy="147" r="2.5" fill="#0f172a" />

            {/* Isometric Tension Rings */}
            <g opacity="0.8">
              <circle cx="150" cy="164" r="16" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="125" y="132" fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">Core Braced (360° Tension)</text>
            </g>
          </svg>
        );
      }

      case 'bridge': {
        // Glute bridge: hips thrust upward from floor to diagonal bridge
        const hipY = 175 - repT * 42;
        const gluteGlow = repT > 0.55;

        return (
          <svg viewBox="0 0 280 230" className="w-full h-full select-none" aria-label="Glute bridge demo">
            <rect x="30" y="195" width="220" height="6" rx="3" fill="#1e293b" />

            {/* Head & upper back flat on floor */}
            <circle cx="65" cy="185" r="13" fill="#e2e8f0" />
            <line x1="75" y1="190" x2="110" y2="190" stroke="#94a3b8" strokeWidth="10" strokeLinecap="round" />

            {/* Feet planted flat */}
            <ellipse cx="205" cy="195" rx="12" ry="4" fill="#64748b" />

            {/* Shins (nearly vertical) */}
            <line x1="205" y1="195" x2="195" y2={hipY + 5} stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />

            {/* Thighs & Torso */}
            <line 
              x1="110" 
              y1="190" 
              x2="155" 
              y2={hipY} 
              stroke={gluteGlow ? '#10b981' : '#cbd5e1'} 
              strokeWidth="12" 
              strokeLinecap="round" 
            />
            <line 
              x1="155" 
              y1={hipY} 
              x2="195" 
              y2={hipY + 5} 
              stroke={gluteGlow ? '#06b6d4' : '#cbd5e1'} 
              strokeWidth="11" 
              strokeLinecap="round" 
            />

            {/* Glute Contraction Badge */}
            {gluteGlow && (
              <g className="animate-pulse">
                <circle cx="155" cy={hipY} r="16" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="2" />
                <path d={`M 155 ${hipY - 22} L 155 ${hipY - 32} M 150 ${hipY - 26} L 155 ${hipY - 32} L 160 ${hipY - 26}`} stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                <text x="120" y={hipY - 36} fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">Glute Clamp Squeeze</text>
              </g>
            )}
          </svg>
        );
      }

      case 'lunge': {
        // Walking lunge: dual 90° knee drop
        const dropY = repT * 32;
        const frontKneeY = 145 + dropY * 0.4;
        const backKneeY = 150 + dropY;

        return (
          <svg viewBox="0 0 280 230" className="w-full h-full select-none" aria-label="Lunge movement demo">
            <line x1="30" y1="205" x2="250" y2="205" stroke="#334155" strokeWidth="3" strokeLinecap="round" />

            {/* Front foot & shin */}
            <ellipse cx="175" cy="204" rx="12" ry="4" fill="#64748b" />
            <line x1="175" y1="204" x2="175" y2={frontKneeY} stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />

            {/* Back foot (ball of foot) & shin */}
            <circle cx="95" cy="201" r="5" fill="#64748b" />
            <line x1="95" y1="201" x2="115" y2={backKneeY} stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />

            {/* Front thigh & Back thigh meeting at pelvis */}
            <line 
              x1="175" 
              y1={frontKneeY} 
              x2="140" 
              y2={115 + dropY} 
              stroke={repT > 0.5 ? '#10b981' : '#cbd5e1'} 
              strokeWidth={repT > 0.5 ? "12" : "9"} 
              strokeLinecap="round" 
            />
            <line 
              x1="115" 
              y1={backKneeY} 
              x2="140" 
              y2={115 + dropY} 
              stroke="#64748b" 
              strokeWidth="9" 
              strokeLinecap="round" 
            />

            {/* Torso & Head */}
            <line x1="140" y1={115 + dropY} x2="140" y2={70 + dropY} stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" />
            <circle cx="140" cy={50 + dropY} r="14" fill="#e2e8f0" />
            <circle cx="145" cy={48 + dropY} r="2.5" fill="#0f172a" />

            {/* 90-degree angle indicators */}
            {repT > 0.6 && (
              <text x="182" y={frontKneeY + 4} fill="#10b981" fontSize="9" fontWeight="bold" fontFamily="monospace">90° Box</text>
            )}
          </svg>
        );
      }

      case 'deadlift': {
        // Deadlift: barbell hip hinge and vertical bar path
        const barY = 190 - repT * 70;
        const hipX = 145 + (1 - repT) * 25;
        const hipY = 125 + (1 - repT) * 22;
        const chestX = 145 - (1 - repT) * 20;
        const chestY = 80 + (1 - repT) * 35;
        const posteriorGlow = repT > 0.4;

        return (
          <svg viewBox="0 0 280 230" className="w-full h-full select-none" aria-label="Deadlift movement demo">
            <line x1="30" y1="205" x2="250" y2="205" stroke="#334155" strokeWidth="3" strokeLinecap="round" />

            {/* Vertical Bar Path guideline */}
            <line x1="115" y1="95" x2="115" y2="200" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <text x="65" y="110" fill="#f59e0b" fontSize="8" opacity="0.7" fontFamily="monospace">Vertical Path</text>

            {/* Feet */}
            <ellipse cx="125" cy="204" rx="14" ry="4" fill="#64748b" />
            {/* Shins */}
            <line x1="125" y1="204" x2="128" y2="155" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />

            {/* Hamstrings & Glutes (hip hinge) */}
            <line 
              x1="128" 
              y1="155" 
              x2={hipX} 
              y2={hipY} 
              stroke={posteriorGlow ? '#10b981' : '#64748b'} 
              strokeWidth={posteriorGlow ? "12" : "9"} 
              strokeLinecap="round" 
            />

            {/* Neutral Spine to Chest */}
            <line 
              x1={hipX} 
              y1={hipY} 
              x2={chestX} 
              y2={chestY} 
              stroke={posteriorGlow ? '#06b6d4' : '#cbd5e1'} 
              strokeWidth="11" 
              strokeLinecap="round" 
            />

            {/* Head (neutral with spine) */}
            <circle cx={chestX - (1 - repT) * 8} cy={chestY - 18} r="13" fill="#e2e8f0" />

            {/* Arms holding bar straight down */}
            <line x1={chestX} y1={chestY + 4} x2="115" y2={barY} stroke="#94a3b8" strokeWidth="6" strokeLinecap="round" />

            {/* Barbell Plates */}
            <line x1="90" y1={barY} x2="140" y2={barY} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
            <rect x="84" y={barY - 18} width="8" height="36" rx="2" fill="#ef4444" />
            <rect x="138" y={barY - 18} width="8" height="36" rx="2" fill="#ef4444" />
          </svg>
        );
      }

      case 'overhead_press':
      case 'bench_press': {
        // Bench/Overhead press barbell trajectory
        const barY = 160 - repT * 65;
        const shoulderGlow = repT > 0.45;

        return (
          <svg viewBox="0 0 280 230" className="w-full h-full select-none" aria-label="Press movement demo">
            <line x1="30" y1="205" x2="250" y2="205" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            {/* Athletic standing figure */}
            <line x1="125" y1="204" x2="135" y2="155" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
            <line x1="155" y1="204" x2="145" y2="155" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
            <line x1="140" y1="155" x2="140" y2="105" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" />
            <circle cx="140" cy="85" r="14" fill="#e2e8f0" />

            {/* Arms pressing bar */}
            <line 
              x1="125" 
              y1="105" 
              x2="115" 
              y2={barY + 4} 
              stroke={shoulderGlow ? '#10b981' : '#94a3b8'} 
              strokeWidth={shoulderGlow ? "8" : "6"} 
              strokeLinecap="round" 
            />
            <line 
              x1="155" 
              y1="105" 
              x2="165" 
              y2={barY + 4} 
              stroke={shoulderGlow ? '#10b981' : '#94a3b8'} 
              strokeWidth={shoulderGlow ? "8" : "6"} 
              strokeLinecap="round" 
            />

            {/* Barbell */}
            <line x1="85" y1={barY} x2="195" y2={barY} stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" />
            <rect x="76" y={barY - 14} width="9" height="28" rx="2" fill="#d97706" />
            <rect x="195" y={barY - 14} width="9" height="28" rx="2" fill="#d97706" />
          </svg>
        );
      }

      default: {
        // Generic athletic cadence cycle (jumping jack / climber / cardio / general)
        const stride = Math.sin(currentProgress * Math.PI * 2) * 20;

        return (
          <svg viewBox="0 0 280 230" className="w-full h-full select-none" aria-label="Dynamic workout demo">
            <line x1="30" y1="205" x2="250" y2="205" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
            {/* Dynamic Limbs */}
            <line x1="140" y1="150" x2={125 - stride} y2="204" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
            <line x1="140" y1="150" x2={155 + stride} y2="204" stroke="#94a3b8" strokeWidth="8" strokeLinecap="round" />
            <line x1="140" y1="150" x2="140" y2="95" stroke="#cbd5e1" strokeWidth="12" strokeLinecap="round" />
            <circle cx="140" cy="75" r="14" fill="#e2e8f0" />
            {/* Arms swinging in opposition */}
            <line x1="140" y1="100" x2={120 + stride * 0.8} y2="135" stroke="#10b981" strokeWidth="7" strokeLinecap="round" />
            <line x1="140" y1="100" x2={160 - stride * 0.8} y2="135" stroke="#06b6d4" strokeWidth="7" strokeLinecap="round" />
          </svg>
        );
      }
    }
  };

  const activePhase: ExercisePhase | undefined = demoData.phases[activePhaseIndex] || demoData.phases[0];

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
      {/* Top Demo Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Real Kinetic Workout Demo
          </span>
          <span className="text-[10px] text-slate-400">· {demoData.animationType.toUpperCase()}</span>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px] font-mono">
          {[0.5, 1.0, 1.5].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 rounded transition-colors ${
                speed === s ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Main Kinetic Stage */}
      <div className="relative aspect-video w-full rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border border-slate-800/80 overflow-hidden flex items-center justify-center">
        {/* Animated Visual Canvas / SVG */}
        <div className="w-full h-full max-w-[340px] flex items-center justify-center p-2">
          {renderVisualFigure()}
        </div>

        {/* Phase Overlay Badge */}
        {activePhase && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg pointer-events-none">
            <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 block">
              Phase {activePhaseIndex + 1}: {activePhase.title}
            </span>
            <span className="text-[11px] text-slate-200 font-medium">{activePhase.cue}</span>
          </div>
        )}

        {/* Active Breathing Rhythm Guide */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-[10px] text-cyan-300 flex items-center gap-1.5 shadow-md">
          <Wind className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentProgress < 0.5 ? 'Inhale ⬇' : 'Exhale Drive ⬆'}</span>
        </div>

        {/* Play / Pause Floating Toggle */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause demo' : 'Play demo'}
          className="absolute bottom-3 left-3 p-2 rounded-xl bg-emerald-500/90 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg transition-transform active:scale-95"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>

      {/* Interactive Phase Scrubber */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 font-medium">Movement Progression</span>
          <span className="font-mono text-emerald-400 font-semibold">
            {Math.round(currentProgress * 100)}% Execution
          </span>
        </div>

        {/* Timeline bar with phase nodes */}
        <div className="relative">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={currentProgress}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentProgress(parseFloat(e.target.value));
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 focus:outline-none"
          />
        </div>

        {/* Phase Pill Buttons */}
        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {demoData.phases.map((ph, idx) => {
            const isCurrent = activePhaseIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => jumpToPhase(idx)}
                className={`py-1 px-1.5 rounded-lg text-[10px] font-medium truncate text-center transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                    : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
                }`}
              >
                {ph.title.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Phase Instruction Breakdown (Replaces raw static text) */}
      {activePhase && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Step {activePhaseIndex + 1} of {demoData.phases.length}: {activePhase.title}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              {activePhase.cue}
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {activePhase.instruction}
          </p>
        </div>
      )}

      {/* Muscle Engagement & Form Checkpoints */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300">Target Muscle Engagement</span>
          <span className="text-[11px] font-mono text-slate-400">
            Tempo: {demoData.tempo.down}s-{demoData.tempo.pause}s-{demoData.tempo.up}s
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {demoData.primaryMuscles.map((muscle) => (
            <span
              key={muscle}
              className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium"
            >
              Primary: {muscle}
            </span>
          ))}
          {demoData.secondaryMuscles.map((muscle) => (
            <span
              key={muscle}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60"
            >
              Support: {muscle}
            </span>
          ))}
        </div>
      </div>

      {/* Form Checkpoints Toggle / Box */}
      <div className="border-t border-slate-800/80 pt-2 space-y-2">
        <button
          onClick={() => setShowCheckpoints(!showCheckpoints)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-white"
        >
          <span>Form Master Checkpoints ({demoData.formCheckpoints.length})</span>
          <span className="text-[10px] text-emerald-400 font-mono">
            {showCheckpoints ? 'Hide ▲' : 'Show Checklist ▼'}
          </span>
        </button>

        {showCheckpoints && (
          <div className="space-y-2 pt-1 text-xs">
            {demoData.formCheckpoints.map((cp, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="font-semibold text-slate-200 block text-[11px]">
                  {cp.aspect}
                </span>
                <div className="flex items-start gap-1.5 text-emerald-300 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{cp.correct}</span>
                </div>
                <div className="flex items-start gap-1.5 text-rose-300 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span>Avoid: {cp.mistakeToAvoid}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Live Guided Workout Button */}
      {onStartLiveDemo && (
        <button
          onClick={onStartLiveDemo}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Start Real Guided Demo Session</span>
        </button>
      )}
    </div>
  );
};
