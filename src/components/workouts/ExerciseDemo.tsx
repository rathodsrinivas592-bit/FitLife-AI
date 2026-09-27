import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Wind, 
  CheckCircle2, 
  Clock, 
  Flame, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  Maximize2,
  ChevronRight,
  Sparkles,
  Layers
} from 'lucide-react';
import { Exercise, ExerciseAnimationType } from '../../types';
import { EXERCISE_DATABASE } from '../../data/exerciseDatabase';
import { audioFeedback } from '../../utils/audioFeedback';

interface ExerciseDemoProps {
  exercise: Exercise;
  currentSet?: number;
  totalSets?: number;
  onSetCompleted?: () => void;
  compact?: boolean;
}

export const ExerciseDemo: React.FC<ExerciseDemoProps> = ({
  exercise,
  currentSet = 1,
  totalSets = exercise.sets || 3,
  onSetCompleted,
  compact = false,
}) => {
  // Resolve rich definition if present
  const fullDef = EXERCISE_DATABASE[exercise.id] || exercise;

  // Primary & secondary muscles
  const primaryMuscle = fullDef.muscleGroup || fullDef.targetMuscle || 'Target Muscle';
  const secondaryMuscles = fullDef.secondaryMuscles || ['Stabilizers', 'Core'];
  const equipment = fullDef.equipment || 'Gym Equipment';
  const difficulty = fullDef.difficulty || 'Intermediate';

  // Demo Controls State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [cameraView, setCameraView] = useState<'front' | 'side' | 'back' | 'persp'>('front');
  const [showMusclesHighlight, setShowMusclesHighlight] = useState<boolean>(true);

  // Animation cycle & execution progression
  const [executionProgress, setExecutionProgress] = useState<number>(0); // 0 to 100%
  const [currentPhase, setCurrentPhase] = useState<string>('PHASE 1: START POSITION');
  const [breathingCue, setBreathingCue] = useState<string>('INHALE ↓');

  // Reps & Set Counter
  const targetRepsNumber = useMemo(() => {
    const match = exercise.reps.match(/\d+/);
    return match ? parseInt(match[0], 10) : 10;
  }, [exercise.reps]);

  const [repCount, setRepCount] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number>(0);

  // Three.js Canvas and Scene Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Mannequin Nodes
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const spineGroupRef = useRef<THREE.Group | null>(null);
  const headMeshRef = useRef<THREE.Mesh | null>(null);
  const leftArmGroupRef = useRef<THREE.Group | null>(null);
  const leftForearmGroupRef = useRef<THREE.Group | null>(null);
  const rightArmGroupRef = useRef<THREE.Group | null>(null);
  const rightForearmGroupRef = useRef<THREE.Group | null>(null);
  const leftLegGroupRef = useRef<THREE.Group | null>(null);
  const leftShinGroupRef = useRef<THREE.Group | null>(null);
  const rightLegGroupRef = useRef<THREE.Group | null>(null);
  const rightShinGroupRef = useRef<THREE.Group | null>(null);

  // Equipment Models in Three.js
  const barbellMeshRef = useRef<THREE.Group | null>(null);
  const benchMeshRef = useRef<THREE.Mesh | null>(null);
  const leftDumbbellRef = useRef<THREE.Group | null>(null);
  const rightDumbbellRef = useRef<THREE.Group | null>(null);

  // Muscle materials for glowing orange/yellow
  const targetMuscleMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const neutralBodyMatRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const secondaryMuscleMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Orbit camera control
  const orbitRef = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0,
    phi: Math.PI / 2,
    radius: 4.6,
  });
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Camera presets
  const handleCameraChange = (preset: 'front' | 'side' | 'back' | 'persp') => {
    setCameraView(preset);
    if (preset === 'front') {
      orbitRef.current.theta = 0;
      orbitRef.current.phi = Math.PI / 2;
    } else if (preset === 'side') {
      orbitRef.current.theta = Math.PI / 2;
      orbitRef.current.phi = Math.PI / 2;
    } else if (preset === 'back') {
      orbitRef.current.theta = Math.PI;
      orbitRef.current.phi = Math.PI / 2;
    } else {
      orbitRef.current.theta = 0.55;
      orbitRef.current.phi = 1.2;
    }
  };

  // Rest Timer ticker
  useEffect(() => {
    if (!isResting) return;
    const interval = setInterval(() => {
      setRestSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsResting(false);
          audioFeedback.playCountdownTick(true);
          return 0;
        }
        if (prev <= 4) audioFeedback.playCountdownTick(false);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting]);

  // Handle Set completion
  const handleCompleteCurrentSet = () => {
    audioFeedback.playSetCompleted();
    setIsResting(true);
    setRestSecondsRemaining(exercise.restSeconds || 60);
    setRepCount(0);
    if (onSetCompleted) {
      onSetCompleted();
    }
  };

  // Setup Three.js 3D Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 360;
    const height = compact ? 240 : 340;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.08);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.7);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 8, 4);
    scene.add(keyLight);

    // Dynamic orange rim light highlighting muscles
    const orangeRim = new THREE.DirectionalLight(0xf97316, 2.2);
    orangeRim.position.set(-4, 3, -3);
    scene.add(orangeRim);

    // Floor Studio Grid
    const floorGeo = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.5;
    scene.add(floor);

    const grid = new THREE.GridHelper(8, 16, 0x10b981, 0x1e293b);
    grid.position.y = -1.49;
    scene.add(grid);

    // Ring platform
    const ringGeo = new THREE.RingGeometry(1.3, 1.35, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -1.48;
    scene.add(ring);

    // 5. Materials
    const neutralBodyMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Athletic slate gray-white
      metalness: 0.3,
      roughness: 0.4,
    });
    neutralBodyMatRef.current = neutralBodyMat;

    // Glowing Orange Target Muscle Material
    const targetMuscleMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Vibrant Amber/Orange
      emissive: 0xea580c,
      emissiveIntensity: 0.85,
      roughness: 0.25,
      metalness: 0.1,
    });
    targetMuscleMatRef.current = targetMuscleMat;

    // Soft Gold Secondary Muscle Material
    const secondaryMuscleMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    secondaryMuscleMatRef.current = secondaryMuscleMat;

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      metalness: 0.5,
      roughness: 0.4,
    });

    // 6. Build Athletic 3D Human Figure
    const mannequin = new THREE.Group();
    mannequinGroupRef.current = mannequin;
    scene.add(mannequin);

    // Determine muscle highlights based on exercise target
    const isChest = primaryMuscle.toLowerCase().includes('chest') || exercise.name.toLowerCase().includes('press') || exercise.name.toLowerCase().includes('push-up');
    const isBack = primaryMuscle.toLowerCase().includes('lat') || primaryMuscle.toLowerCase().includes('back') || exercise.name.toLowerCase().includes('row') || exercise.name.toLowerCase().includes('pull');
    const isShoulder = primaryMuscle.toLowerCase().includes('shoulder') || primaryMuscle.toLowerCase().includes('delt') || exercise.name.toLowerCase().includes('raise');
    const isLeg = primaryMuscle.toLowerCase().includes('quad') || primaryMuscle.toLowerCase().includes('leg') || primaryMuscle.toLowerCase().includes('glute') || exercise.name.toLowerCase().includes('squat') || exercise.name.toLowerCase().includes('lunge');
    const isArm = primaryMuscle.toLowerCase().includes('bicep') || primaryMuscle.toLowerCase().includes('tricep') || exercise.name.toLowerCase().includes('curl');

    // Pelvis
    const pelvis = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.25, 16), neutralBodyMat);
    pelvis.position.y = 0;
    mannequin.add(pelvis);

    // Spine & Torso Group
    const spine = new THREE.Group();
    spineGroupRef.current = spine;
    pelvis.add(spine);

    // Torso / Chest Mesh (Highlighted orange if chest exercise)
    const torsoMat = isChest ? targetMuscleMat : (isBack ? targetMuscleMat : neutralBodyMat);
    const chestMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.24, 0.5, 16), torsoMat);
    chestMesh.position.y = 0.35;
    spine.add(chestMesh);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), neutralBodyMat);
    head.position.y = 0.75;
    headMeshRef.current = head;
    spine.add(head);

    // Shoulders & Arms
    const shoulderMat = isShoulder ? targetMuscleMat : neutralBodyMat;
    const armMat = isArm ? targetMuscleMat : neutralBodyMat;

    // Left Arm
    const leftArm = new THREE.Group();
    leftArm.position.set(-0.38, 0.5, 0);
    leftArmGroupRef.current = leftArm;
    spine.add(leftArm);
    const lDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), shoulderMat);
    leftArm.add(lDeltoid);
    const lBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.32, 12), armMat);
    lBicep.position.y = -0.18;
    leftArm.add(lBicep);

    const lForearm = new THREE.Group();
    lForearm.position.y = -0.34;
    leftForearmGroupRef.current = lForearm;
    leftArm.add(lForearm);
    const lElbow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), jointMat);
    lForearm.add(lElbow);
    const lLowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 12), neutralBodyMat);
    lLowerArm.position.y = -0.16;
    lForearm.add(lLowerArm);

    // Right Arm
    const rightArm = new THREE.Group();
    rightArm.position.set(0.38, 0.5, 0);
    rightArmGroupRef.current = rightArm;
    spine.add(rightArm);
    const rDeltoid = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), shoulderMat);
    rightArm.add(rDeltoid);
    const rBicep = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.32, 12), armMat);
    rBicep.position.y = -0.18;
    rightArm.add(rBicep);

    const rForearm = new THREE.Group();
    rForearm.position.y = -0.34;
    rightForearmGroupRef.current = rForearm;
    rightArm.add(rForearm);
    const rElbow = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), jointMat);
    rForearm.add(rElbow);
    const rLowerArm = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.32, 12), neutralBodyMat);
    rLowerArm.position.y = -0.16;
    rForearm.add(rLowerArm);

    // Legs
    const legMat = isLeg ? targetMuscleMat : neutralBodyMat;

    // Left Leg
    const leftLeg = new THREE.Group();
    leftLeg.position.set(-0.16, -0.15, 0);
    leftLegGroupRef.current = leftLeg;
    pelvis.add(leftLeg);
    const lThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.55, 14), legMat);
    lThigh.position.y = -0.28;
    leftLeg.add(lThigh);

    const lShin = new THREE.Group();
    lShin.position.y = -0.56;
    leftShinGroupRef.current = lShin;
    leftLeg.add(lShin);
    const lKnee = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), jointMat);
    lShin.add(lKnee);
    const lCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.55, 14), neutralBodyMat);
    lCalf.position.y = -0.28;
    lShin.add(lCalf);

    // Right Leg
    const rightLeg = new THREE.Group();
    rightLeg.position.set(0.16, -0.15, 0);
    rightLegGroupRef.current = rightLeg;
    pelvis.add(rightLeg);
    const rThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.1, 0.55, 14), legMat);
    rThigh.position.y = -0.28;
    rightLeg.add(rThigh);

    const rShin = new THREE.Group();
    rShin.position.y = -0.56;
    rightShinGroupRef.current = rShin;
    rightLeg.add(rShin);
    const rKnee = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), jointMat);
    rShin.add(rKnee);
    const rCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.55, 14), neutralBodyMat);
    rCalf.position.y = -0.28;
    rShin.add(rCalf);

    // 7. Equipment Props (Barbell, Dumbbells, Bench)
    const barbell = new THREE.Group();
    const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.2, 16);
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.9, roughness: 0.1 });
    const barMesh = new THREE.Mesh(barGeo, chromeMat);
    barMesh.rotation.z = Math.PI / 2;
    barbell.add(barMesh);

    // Weight Plates (Olympic 45lb/20kg style)
    const plateGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.06, 24);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const plateL = new THREE.Mesh(plateGeo, plateMat);
    plateL.rotation.z = Math.PI / 2;
    plateL.position.x = -0.95;
    barbell.add(plateL);
    const plateR = plateL.clone();
    plateR.position.x = 0.95;
    barbell.add(plateR);

    barbellMeshRef.current = barbell;
    scene.add(barbell);

    // Flat Bench
    const benchGeo = new THREE.BoxGeometry(0.6, 0.45, 1.6);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const bench = new THREE.Mesh(benchGeo, benchMat);
    bench.position.set(0, -1.25, 0);
    benchMeshRef.current = bench;
    scene.add(bench);

    // Hide or show equipment based on exercise
    const needsBench = exercise.name.toLowerCase().includes('bench') || exercise.name.toLowerCase().includes('press') && !exercise.name.toLowerCase().includes('shoulder');
    const needsBarbell = exercise.name.toLowerCase().includes('barbell') || exercise.name.toLowerCase().includes('bench press') || exercise.name.toLowerCase().includes('squat');

    bench.visible = needsBench;
    barbell.visible = needsBarbell;

    // 8. Animation Loop
    let clock = new THREE.Clock();
    let timeAcc = 0;

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isPlaying) {
        timeAcc += delta * playbackSpeed;
      }

      // Smooth normalized cycle [0 to 1]
      const cycleTime = 4.0; // 4 second full rep cycle
      const cycleNorm = (timeAcc % cycleTime) / cycleTime;
      const t = Math.sin(cycleNorm * Math.PI); // 0 -> 1 -> 0

      // Update execution % and phases
      const progressPercent = Math.round(cycleNorm * 100);
      setExecutionProgress(progressPercent);

      if (cycleNorm < 0.25) {
        setCurrentPhase('PHASE 1: START POSITION');
        setBreathingCue('PREPARE & BRACE');
      } else if (cycleNorm < 0.5) {
        setCurrentPhase('PHASE 2: CONTROLLED DESCENT (ECCENTRIC)');
        setBreathingCue('INHALE ↓');
      } else if (cycleNorm < 0.8) {
        setCurrentPhase('PHASE 3: PEAK DRIVE (CONCENTRIC)');
        setBreathingCue('EXHALE ↑');
      } else {
        setCurrentPhase('PHASE 4: LOCKOUT & RETURN');
        setBreathingCue('RESET BREATH');
      }

      // Biomechanical kinematics based on exercise type
      const exName = exercise.name.toLowerCase();

      if (exName.includes('squat')) {
        // Squat Kinematics
        mannequin.position.set(0, -t * 0.45, 0);
        if (leftLegGroupRef.current && rightLegGroupRef.current) {
          leftLegGroupRef.current.rotation.x = -t * 1.35;
          rightLegGroupRef.current.rotation.x = -t * 1.35;
        }
        if (leftShinGroupRef.current && rightShinGroupRef.current) {
          leftShinGroupRef.current.rotation.x = t * 1.45;
          rightShinGroupRef.current.rotation.x = t * 1.45;
        }
        if (spineGroupRef.current) {
          spineGroupRef.current.rotation.x = t * 0.35; // gentle hip hinge
        }
        if (barbellMeshRef.current) {
          barbellMeshRef.current.visible = true;
          barbellMeshRef.current.position.set(0, 0.7 - t * 0.45, -0.05);
        }
      } else if (exName.includes('bench press') || exName.includes('chest press')) {
        // Bench Press Kinematics (Lying down)
        mannequin.position.set(0, -0.95, 0);
        mannequin.rotation.x = -Math.PI / 2; // Lie flat on back
        if (leftArmGroupRef.current && rightArmGroupRef.current) {
          leftArmGroupRef.current.rotation.z = -0.4 + t * 0.6;
          rightArmGroupRef.current.rotation.z = 0.4 - t * 0.6;
        }
        if (leftForearmGroupRef.current && rightForearmGroupRef.current) {
          leftForearmGroupRef.current.rotation.x = -1.2 + t * 0.8;
          rightForearmGroupRef.current.rotation.x = -1.2 + t * 0.8;
        }
        if (barbellMeshRef.current) {
          barbellMeshRef.current.visible = true;
          barbellMeshRef.current.position.set(0, -0.55 + t * 0.4, 0);
        }
      } else if (exName.includes('lateral raise')) {
        // Lateral Raise Kinematics
        mannequin.position.set(0, 0, 0);
        mannequin.rotation.x = 0;
        if (leftArmGroupRef.current && rightArmGroupRef.current) {
          leftArmGroupRef.current.rotation.z = t * 1.5; // Raise arm laterally to 90 deg
          rightArmGroupRef.current.rotation.z = -t * 1.5;
        }
      } else if (exName.includes('bicep') || exName.includes('curl')) {
        // Bicep Curl Kinematics
        mannequin.position.set(0, 0, 0);
        mannequin.rotation.x = 0;
        if (leftForearmGroupRef.current && rightForearmGroupRef.current) {
          leftForearmGroupRef.current.rotation.x = t * 2.1; // Forearms curl tightly upward
          rightForearmGroupRef.current.rotation.x = t * 2.1;
        }
      } else if (exName.includes('lat pulldown') || exName.includes('pull-up')) {
        // Lat Pulldown / Pull-up Kinematics
        mannequin.position.set(0, -0.2, 0);
        if (leftArmGroupRef.current && rightArmGroupRef.current) {
          leftArmGroupRef.current.rotation.z = 2.4 - t * 1.1; // Arms pull down
          rightArmGroupRef.current.rotation.z = -2.4 + t * 1.1;
        }
      } else if (exName.includes('shoulder press') || exName.includes('overhead')) {
        // Shoulder Press Kinematics
        mannequin.position.set(0, 0, 0);
        if (leftArmGroupRef.current && rightArmGroupRef.current) {
          leftArmGroupRef.current.rotation.z = 1.2 + t * 0.9; // Press upward overhead
          rightArmGroupRef.current.rotation.z = -1.2 - t * 0.9;
        }
      } else {
        // Default Dynamic Functional Movement
        mannequin.position.set(0, -t * 0.15, 0);
        if (leftArmGroupRef.current) leftArmGroupRef.current.rotation.x = t * 0.4;
        if (rightArmGroupRef.current) rightArmGroupRef.current.rotation.x = -t * 0.4;
      }

      // Camera Orbit Update
      const radius = orbitRef.current.radius;
      const phi = orbitRef.current.phi;
      const theta = orbitRef.current.theta;

      camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = radius * Math.cos(phi) + 0.2;
      camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    // Mouse / Touch Orbit controls
    const canvas = canvasRef.current;
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - prevMousePos.current.x;
      const dy = e.clientY - prevMousePos.current.y;
      orbitRef.current.theta += dx * 0.01;
      orbitRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, orbitRef.current.phi - dy * 0.01));
      prevMousePos.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, [exercise, primaryMuscle, isPlaying, playbackSpeed, compact]);

  return (
    <div className="space-y-4">
      {/* 1. Header & Set Tracker */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold uppercase tracking-wider">
              3D Anatomical Demonstration
            </span>
            <span className="text-xs text-slate-400">· {equipment}</span>
          </div>
          <h3 className="text-lg font-extrabold text-white tracking-tight">{exercise.name}</h3>
        </div>

        {/* Set & Target Display */}
        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Set Progress</span>
          <span className="text-sm font-black text-amber-400 font-mono">
            Set {currentSet} / {totalSets}
          </span>
        </div>
      </div>

      {/* 2. Top Muscle-Group View & Camera Preset Bar */}
      <div className="flex items-center justify-between bg-slate-950 p-2 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 mr-1 font-medium">Angle:</span>
          {(['front', 'side', 'back', 'persp'] as const).map((angle) => (
            <button
              key={angle}
              onClick={() => handleCameraChange(angle)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                cameraView === angle
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/25'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {angle}
            </button>
          ))}
        </div>

        {/* Muscle Glow Switch */}
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-500" />
          <span className="text-[11px] font-bold text-amber-300 font-mono">
            {primaryMuscle.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 3. 3D WebGL Canvas Viewport */}
      <div 
        ref={containerRef}
        className="relative w-full h-[280px] sm:h-[340px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group cursor-grab active:cursor-grabbing"
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Dynamic Overlay HUD: Phase & Breathing */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Phase Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-lg">
            <span className="text-[10px] font-mono font-bold text-amber-400 uppercase block tracking-wider">
              {currentPhase}
            </span>
          </div>

          {/* Breathing Guide */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 flex items-center gap-1.5 shadow-lg">
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono font-bold text-cyan-300">
              {breathingCue}
            </span>
          </div>
        </div>

        {/* Dynamic Execution Progression Bar */}
        <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
          <div className="p-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-xl space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Movement Progression</span>
              <span className="font-bold text-amber-400">{executionProgress}% Execution</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-100 ease-out"
                style={{ width: `${executionProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Playback Controls & Speed Toggle */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={() => {
              setIsPlaying(true);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Restart movement"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector (0.5x, 1x, 1.5x, 2x) */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 uppercase font-mono mr-1">Speed:</span>
          {[0.5, 1.0, 1.5, 2.0].map((s) => (
            <button
              key={s}
              onClick={() => setPlaybackSpeed(s)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                playbackSpeed === s
                  ? 'bg-white text-slate-950'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* 5. Set & Rep Interactivity */}
      <div className="p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl space-y-3">
        {/* Rest Timer Banner */}
        {isResting ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold uppercase font-mono">
              <Clock className="w-4 h-4" />
              <span>Rest Interval Active</span>
            </div>
            <div className="text-3xl font-black text-white font-mono">
              00:{restSecondsRemaining.toString().padStart(2, '0')}
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                onClick={() => setRestSecondsRemaining(0)}
                className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20"
              >
                Skip Rest & Start Next Set ➔
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Interactive Reps</span>
              <div className="flex items-baseline gap-1 font-mono mt-0.5">
                <span className="text-3xl font-black text-white">{repCount}</span>
                <span className="text-xs text-slate-400">/ {targetRepsNumber} Target</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRepCount((prev) => prev + 1);
                  audioFeedback.playRepTick();
                }}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs active:scale-95 transition-all"
              >
                +1 Rep
              </button>

              <button
                onClick={handleCompleteCurrentSet}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Set ✓</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. Detailed Anatomical & Performance Guidance */}
      <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-xs">
        {/* Muscles & Equipment Badges */}
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Primary Target</span>
            <span className="font-bold text-amber-400">{primaryMuscle}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-slate-400 block mb-0.5">Secondary Muscles</span>
            <span className="font-semibold text-slate-200">{secondaryMuscles.join(', ')}</span>
          </div>
        </div>

        {/* Step-by-Step Instructions */}
        {fullDef.steps && fullDef.steps.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>How To Perform</span>
            </h4>
            <div className="space-y-1.5">
              {fullDef.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono font-bold flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Mistakes */}
        {fullDef.commonMistakes && fullDef.commonMistakes.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-rose-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Common Mistakes To Avoid</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              {fullDef.commonMistakes.map((mistake, idx) => (
                <li key={idx} className="leading-relaxed">{mistake}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Safety Tips */}
        {fullDef.safetyTips && fullDef.safetyTips.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety & Technique Tips</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-300">
              {fullDef.safetyTips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
