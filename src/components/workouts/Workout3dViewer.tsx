import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';
import { Exercise } from '../../types';

interface Workout3dViewerProps {
  exercise: Exercise;
  workoutTitle?: string;
  isCompact?: boolean;
}

export type ExerciseMovementType = 
  | 'squat' 
  | 'pushup' 
  | 'deadlift' 
  | 'bench_press' 
  | 'shoulder_press' 
  | 'lunge' 
  | 'pullup' 
  | 'row' 
  | 'walk' 
  | 'run' 
  | 'plank' 
  | 'crunch' 
  | 'dip' 
  | 'climber' 
  | 'jumping_jack' 
  | 'carry';

export function detectMovementType(name: string, targetMuscle: string): ExerciseMovementType {
  const n = name.toLowerCase();
  const m = targetMuscle.toLowerCase();

  if (n.includes('squat')) return 'squat';
  if (n.includes('push-up') || n.includes('pushup') || n.includes('push up')) return 'pushup';
  if (n.includes('deadlift')) return 'deadlift';
  if (n.includes('bench press') || n.includes('chest press')) return 'bench_press';
  if (n.includes('shoulder press') || n.includes('military press') || n.includes('overhead press')) return 'shoulder_press';
  if (n.includes('lunge') || n.includes('split squat')) return 'lunge';
  if (n.includes('pull-up') || n.includes('pullup') || n.includes('lat pull')) return 'pullup';
  if (n.includes('row')) return 'row';
  if (n.includes('walk') || n.includes('cadence')) return 'walk';
  if (n.includes('run') || n.includes('sprint') || n.includes('jog')) return 'run';
  if (n.includes('plank')) return 'plank';
  if (n.includes('crunch') || n.includes('deadbug') || n.includes('ab') || n.includes('core')) return 'crunch';
  if (n.includes('dip')) return 'dip';
  if (n.includes('climber')) return 'climber';
  if (n.includes('jack') || n.includes('jumping')) return 'jumping_jack';
  if (n.includes('farmer') || n.includes('carry')) return 'carry';

  // Fallbacks based on muscles
  if (m.includes('chest')) return 'pushup';
  if (m.includes('quad') || m.includes('glute')) return 'squat';
  if (m.includes('shoulder') || m.includes('delt')) return 'shoulder_press';
  if (m.includes('back') || m.includes('lat')) return 'row';
  if (m.includes('cardio')) return 'run';
  return 'squat';
}

export const Workout3dViewer: React.FC<Workout3dViewerProps> = ({ 
  exercise, 
  workoutTitle, 
  isCompact = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [repCount, setRepCount] = useState<number>(1);
  const [currentPhase, setCurrentPhase] = useState<'concentric' | 'eccentric' | 'isometric'>('eccentric');
  const [cameraAngle, setCameraAngle] = useState<'persp' | 'front' | 'side' | 'top'>('persp');
  const [showMusclesHighlight, setShowMusclesHighlight] = useState<boolean>(true);

  // References to Three.js elements
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Mannequin nodes references
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const pelvisMeshRef = useRef<THREE.Mesh | null>(null);
  const spineGroupRef = useRef<THREE.Group | null>(null);
  const chestMeshRef = useRef<THREE.Mesh | null>(null);
  const headMeshRef = useRef<THREE.Mesh | null>(null);

  const leftArmGroupRef = useRef<THREE.Group | null>(null);
  const leftForearmGroupRef = useRef<THREE.Group | null>(null);
  const rightArmGroupRef = useRef<THREE.Group | null>(null);
  const rightForearmGroupRef = useRef<THREE.Group | null>(null);

  const leftLegGroupRef = useRef<THREE.Group | null>(null);
  const leftShinGroupRef = useRef<THREE.Group | null>(null);
  const rightLegGroupRef = useRef<THREE.Group | null>(null);
  const rightShinGroupRef = useRef<THREE.Group | null>(null);

  // Equipment props
  const barbellGroupRef = useRef<THREE.Group | null>(null);
  const leftDumbbellRef = useRef<THREE.Group | null>(null);
  const rightDumbbellRef = useRef<THREE.Group | null>(null);
  const benchMeshRef = useRef<THREE.Mesh | null>(null);

  // Highlightable muscle materials
  const muscleMaterialsRef = useRef<{ [key: string]: THREE.MeshStandardMaterial }>({});

  // Orbit state
  const isDraggingRef = useRef<boolean>(false);
  const prevMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitAngles = useRef<{ theta: number; phi: number; radius: number }>({
    theta: 0.6,
    phi: 1.1,
    radius: 4.8,
  });

  const movementType = detectMovementType(exercise.name, exercise.targetMuscle);

  // Helper to build a styled capsule / cylinder
  const createLimbMesh = (radiusTop: number, radiusBottom: number, height: number, material: THREE.Material) => {
    const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 16);
    return new THREE.Mesh(geo, material);
  };

  // Helper to build joint sphere
  const createJointMesh = (radius: number, material: THREE.Material) => {
    const geo = new THREE.SphereGeometry(radius, 16, 16);
    return new THREE.Mesh(geo, material);
  };

  // Camera presets
  const setCameraPreset = (preset: 'persp' | 'front' | 'side' | 'top') => {
    setCameraAngle(preset);
    if (preset === 'front') {
      orbitAngles.current.theta = 0;
      orbitAngles.current.phi = Math.PI / 2;
    } else if (preset === 'side') {
      orbitAngles.current.theta = Math.PI / 2;
      orbitAngles.current.phi = Math.PI / 2;
    } else if (preset === 'top') {
      orbitAngles.current.theta = 0.01;
      orbitAngles.current.phi = 0.2;
    } else {
      orbitAngles.current.theta = 0.6;
      orbitAngles.current.phi = 1.1;
    }
  };

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 360;
    const height = isCompact ? 220 : 340;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.07);
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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.6);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(4, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 2.0);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    const floorLight = new THREE.PointLight(0x06b6d4, 1.2, 8);
    floorLight.position.set(0, 0.2, 0);
    scene.add(floorLight);

    // 5. Training Stage / Floor Grid
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.5;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Grid helper
    const gridHelper = new THREE.GridHelper(8, 16, 0x10b981, 0x1e293b);
    gridHelper.position.y = -1.49;
    scene.add(gridHelper);

    // Concentric glowing rings on floor
    const ringGeo = new THREE.RingGeometry(1.4, 1.45, 32);
    const ringMat = new THREE.MeshBasicMaterial({ 
      color: 0x10b981, 
      side: THREE.DoubleSide, 
      transparent: true, 
      opacity: 0.4 
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = -Math.PI / 2;
    ringMesh.position.y = -1.48;
    scene.add(ringMesh);

    // 6. Materials
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.7,
      roughness: 0.35,
    });

    const jointMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      metalness: 0.8,
      roughness: 0.2,
    });

    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      emissive: 0x10b981,
      emissiveIntensity: 0.9,
      roughness: 0.1,
    });

    // Muscle target materials
    const chestMuscleMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.4,
    });
    const legMuscleMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.4,
    });
    const armMuscleMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.4,
    });
    const backMuscleMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x10b981,
      emissiveIntensity: 0.6,
      metalness: 0.3,
      roughness: 0.4,
    });

    muscleMaterialsRef.current = {
      chest: chestMuscleMat,
      legs: legMuscleMat,
      arms: armMuscleMat,
      back: backMuscleMat,
    };

    // 7. Assemble 3D Biomechanical Mannequin
    const mannequinGroup = new THREE.Group();
    mannequinGroupRef.current = mannequinGroup;
    scene.add(mannequinGroup);

    // Pelvis (Root)
    const pelvisGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.2, 16);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, chassisMat);
    pelvisMesh.position.y = 0.2;
    pelvisMesh.castShadow = true;
    pelvisMeshRef.current = pelvisMesh;
    mannequinGroup.add(pelvisMesh);

    // Spine group
    const spineGroup = new THREE.Group();
    spineGroup.position.set(0, 0.15, 0);
    spineGroupRef.current = spineGroup;
    pelvisMesh.add(spineGroup);

    // Lower abdomen
    const abdomenGeo = new THREE.CylinderGeometry(0.22, 0.21, 0.25, 16);
    const abdomenMesh = new THREE.Mesh(abdomenGeo, chassisMat);
    abdomenMesh.position.y = 0.12;
    abdomenMesh.castShadow = true;
    spineGroup.add(abdomenMesh);

    // Chest / Upper Torso
    const chestGeo = new THREE.BoxGeometry(0.55, 0.38, 0.28);
    const chestMesh = new THREE.Mesh(chestGeo, chassisMat);
    chestMesh.position.y = 0.42;
    chestMesh.castShadow = true;
    chestMeshRef.current = chestMesh;
    spineGroup.add(chestMesh);

    // Pectoral Muscle Highlight Plates (Front)
    const pecGeo = new THREE.BoxGeometry(0.48, 0.22, 0.04);
    const pecMesh = new THREE.Mesh(pecGeo, chestMuscleMat);
    pecMesh.position.set(0, 0.04, 0.15);
    chestMesh.add(pecMesh);

    // Lat / Back Muscle Plate (Rear)
    const backGeo = new THREE.BoxGeometry(0.48, 0.28, 0.04);
    const backMesh = new THREE.Mesh(backGeo, backMuscleMat);
    backMesh.position.set(0, 0, -0.15);
    chestMesh.add(backMesh);

    // Neck
    const neck = createLimbMesh(0.08, 0.09, 0.14, chassisMat);
    neck.position.y = 0.26;
    chestMesh.add(neck);

    // Head
    const headGroup = new THREE.Group();
    headGroup.position.y = 0.2;
    headMeshRef.current = headGroup as any;
    neck.add(headGroup);

    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), chassisMat);
    skull.scale.set(0.9, 1.1, 1);
    headGroup.add(skull);

    // Glowing Neon Visor / Eye
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.12), visorMat);
    visor.position.set(0, 0.04, 0.12);
    headGroup.add(visor);

    // Shoulder Joints & Arms
    // Left Arm
    const leftShoulderJoint = createJointMesh(0.1, jointMat);
    leftShoulderJoint.position.set(0.35, 0.12, 0);
    chestMesh.add(leftShoulderJoint);

    const leftArmGroup = new THREE.Group();
    leftArmGroupRef.current = leftArmGroup;
    leftShoulderJoint.add(leftArmGroup);

    const leftUpperArm = createLimbMesh(0.085, 0.075, 0.38, armMuscleMat);
    leftUpperArm.position.y = -0.19;
    leftUpperArm.castShadow = true;
    leftArmGroup.add(leftUpperArm);

    const leftElbowJoint = createJointMesh(0.08, jointMat);
    leftElbowJoint.position.y = -0.38;
    leftArmGroup.add(leftElbowJoint);

    const leftForearmGroup = new THREE.Group();
    leftForearmGroupRef.current = leftForearmGroup;
    leftElbowJoint.add(leftForearmGroup);

    const leftForearm = createLimbMesh(0.075, 0.065, 0.34, chassisMat);
    leftForearm.position.y = -0.17;
    leftForearm.castShadow = true;
    leftForearmGroup.add(leftForearm);

    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.09), chassisMat);
    leftHand.position.y = -0.36;
    leftForearmGroup.add(leftHand);

    // Right Arm
    const rightShoulderJoint = createJointMesh(0.1, jointMat);
    rightShoulderJoint.position.set(-0.35, 0.12, 0);
    chestMesh.add(rightShoulderJoint);

    const rightArmGroup = new THREE.Group();
    rightArmGroupRef.current = rightArmGroup;
    rightShoulderJoint.add(rightArmGroup);

    const rightUpperArm = createLimbMesh(0.085, 0.075, 0.38, armMuscleMat);
    rightUpperArm.position.y = -0.19;
    rightUpperArm.castShadow = true;
    rightArmGroup.add(rightUpperArm);

    const rightElbowJoint = createJointMesh(0.08, jointMat);
    rightElbowJoint.position.y = -0.38;
    rightArmGroup.add(rightElbowJoint);

    const rightForearmGroup = new THREE.Group();
    rightForearmGroupRef.current = rightForearmGroup;
    rightElbowJoint.add(rightForearmGroup);

    const rightForearm = createLimbMesh(0.075, 0.065, 0.34, chassisMat);
    rightForearm.position.y = -0.17;
    rightForearm.castShadow = true;
    rightForearmGroup.add(rightForearm);

    const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.09), chassisMat);
    rightHand.position.y = -0.36;
    rightForearmGroup.add(rightHand);

    // Hip Joints & Legs
    // Left Leg
    const leftHipJoint = createJointMesh(0.11, jointMat);
    leftHipJoint.position.set(0.17, -0.1, 0);
    pelvisMesh.add(leftHipJoint);

    const leftLegGroup = new THREE.Group();
    leftLegGroupRef.current = leftLegGroup;
    leftHipJoint.add(leftLegGroup);

    const leftThigh = createLimbMesh(0.11, 0.09, 0.52, legMuscleMat);
    leftThigh.position.y = -0.26;
    leftThigh.castShadow = true;
    leftLegGroup.add(leftThigh);

    const leftKneeJoint = createJointMesh(0.09, jointMat);
    leftKneeJoint.position.y = -0.52;
    leftLegGroup.add(leftKneeJoint);

    const leftShinGroup = new THREE.Group();
    leftShinGroupRef.current = leftShinGroup;
    leftKneeJoint.add(leftShinGroup);

    const leftShin = createLimbMesh(0.085, 0.07, 0.52, chassisMat);
    leftShin.position.y = -0.26;
    leftShin.castShadow = true;
    leftShinGroup.add(leftShin);

    const leftFoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.24), chassisMat);
    leftFoot.position.set(0, -0.54, 0.06);
    leftShinGroup.add(leftFoot);

    // Right Leg
    const rightHipJoint = createJointMesh(0.11, jointMat);
    rightHipJoint.position.set(-0.17, -0.1, 0);
    pelvisMesh.add(rightHipJoint);

    const rightLegGroup = new THREE.Group();
    rightLegGroupRef.current = rightLegGroup;
    rightHipJoint.add(rightLegGroup);

    const rightThigh = createLimbMesh(0.11, 0.09, 0.52, legMuscleMat);
    rightThigh.position.y = -0.26;
    rightThigh.castShadow = true;
    rightLegGroup.add(rightThigh);

    const rightKneeJoint = createJointMesh(0.09, jointMat);
    rightKneeJoint.position.y = -0.52;
    rightLegGroup.add(rightKneeJoint);

    const rightShinGroup = new THREE.Group();
    rightShinGroupRef.current = rightShinGroup;
    rightKneeJoint.add(rightShinGroup);

    const rightShin = createLimbMesh(0.085, 0.07, 0.52, chassisMat);
    rightShin.position.y = -0.26;
    rightShin.castShadow = true;
    rightShinGroup.add(rightShin);

    const rightFoot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.24), chassisMat);
    rightFoot.position.set(0, -0.54, 0.06);
    rightShinGroup.add(rightFoot);

    // 8. Equipments / Props
    // Barbell
    const barbellGroup = new THREE.Group();
    barbellGroupRef.current = barbellGroup;
    const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.8, 16);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.rotation.z = Math.PI / 2;
    barbellGroup.add(bar);

    // Weight plates
    const plateGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.05, 24);
    const plateMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.5, roughness: 0.4 });
    const leftPlate = new THREE.Mesh(plateGeo, plateMat);
    leftPlate.rotation.z = Math.PI / 2;
    leftPlate.position.x = 0.75;
    barbellGroup.add(leftPlate);

    const rightPlate = new THREE.Mesh(plateGeo, plateMat);
    rightPlate.rotation.z = Math.PI / 2;
    rightPlate.position.x = -0.75;
    barbellGroup.add(rightPlate);

    barbellGroup.visible = false;
    scene.add(barbellGroup);

    // Dumbbells
    const makeDumbbell = () => {
      const g = new THREE.Group();
      const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.24, 12), barMat);
      g.add(handle);
      const head1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), plateMat);
      head1.position.y = 0.12;
      g.add(head1);
      const head2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), plateMat);
      head2.position.y = -0.12;
      g.add(head2);
      g.visible = false;
      return g;
    };

    const leftDb = makeDumbbell();
    leftDumbbellRef.current = leftDb;
    scene.add(leftDb);

    const rightDb = makeDumbbell();
    rightDumbbellRef.current = rightDb;
    scene.add(rightDb);

    // Workout Flat Bench
    const benchGroup = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.4, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 })
    );
    benchGroup.position.set(0, -1.3, 0);
    benchGroup.visible = false;
    benchMeshRef.current = benchGroup;
    scene.add(benchGroup);

    // Resize listener
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = isCompact ? 220 : 340;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
    };
  }, [isCompact]);

  // Main Biomechanical Animation Loop
  useEffect(() => {
    let startTime = performance.now();
    let completedReps = 1;

    const animate = (time: number) => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

      // Update camera position based on orbit angles
      const { theta, phi, radius } = orbitAngles.current;
      cameraRef.current.position.x = radius * Math.sin(phi) * Math.sin(theta);
      cameraRef.current.position.y = radius * Math.cos(phi);
      cameraRef.current.position.z = radius * Math.cos(phi) * Math.cos(theta) + radius * Math.sin(phi) * Math.cos(theta);
      cameraRef.current.lookAt(0, -0.2, 0);

      // Movement timing
      const speed = isPlaying ? playbackSpeed : 0;
      const cycleDuration = 3000 / (speed || 1); // 3 seconds per rep cycle
      const elapsed = isPlaying ? (time - startTime) * speed : 0;
      const cycleProgress = (elapsed % 3000) / 3000; // 0 to 1

      // Track reps
      const currentCycle = Math.floor(elapsed / 3000) + 1;
      if (currentCycle !== completedReps && isPlaying) {
        completedReps = currentCycle;
        setRepCount(completedReps);
      }

      // Movement phases
      const isConcentric = cycleProgress > 0.5;
      setCurrentPhase(isConcentric ? 'concentric' : 'eccentric');

      // Parametric progress curve (sine wave)
      const t = 0.5 - 0.5 * Math.cos(cycleProgress * Math.PI * 2);

      // Props visibility reset
      if (barbellGroupRef.current) barbellGroupRef.current.visible = false;
      if (leftDumbbellRef.current) leftDumbbellRef.current.visible = false;
      if (rightDumbbellRef.current) rightDumbbellRef.current.visible = false;
      if (benchMeshRef.current) benchMeshRef.current.visible = false;

      // Default postures
      if (mannequinGroupRef.current) {
        mannequinGroupRef.current.position.set(0, 0, 0);
        mannequinGroupRef.current.rotation.set(0, 0, 0);
      }
      if (pelvisMeshRef.current) pelvisMeshRef.current.rotation.set(0, 0, 0);
      if (spineGroupRef.current) spineGroupRef.current.rotation.set(0, 0, 0);
      if (leftArmGroupRef.current) leftArmGroupRef.current.rotation.set(0, 0, 0);
      if (rightArmGroupRef.current) rightArmGroupRef.current.rotation.set(0, 0, 0);
      if (leftForearmGroupRef.current) leftForearmGroupRef.current.rotation.set(0, 0, 0);
      if (rightForearmGroupRef.current) rightForearmGroupRef.current.rotation.set(0, 0, 0);
      if (leftLegGroupRef.current) leftLegGroupRef.current.rotation.set(0, 0, 0);
      if (rightLegGroupRef.current) rightLegGroupRef.current.rotation.set(0, 0, 0);
      if (leftShinGroupRef.current) leftShinGroupRef.current.rotation.set(0, 0, 0);
      if (rightShinGroupRef.current) rightShinGroupRef.current.rotation.set(0, 0, 0);

      // Pulse muscle emission
      const pulseIntensity = showMusclesHighlight ? 0.3 + 0.7 * (isConcentric ? t : (1 - t)) : 0.2;
      if (muscleMaterialsRef.current.chest) {
        muscleMaterialsRef.current.chest.emissiveIntensity = pulseIntensity * 1.2;
      }
      if (muscleMaterialsRef.current.legs) {
        muscleMaterialsRef.current.legs.emissiveIntensity = pulseIntensity * 1.2;
      }
      if (muscleMaterialsRef.current.arms) {
        muscleMaterialsRef.current.arms.emissiveIntensity = pulseIntensity * 1.2;
      }
      if (muscleMaterialsRef.current.back) {
        muscleMaterialsRef.current.back.emissiveIntensity = pulseIntensity * 1.2;
      }

      // Kinematic simulation based on exercise pattern
      switch (movementType) {
        case 'squat': {
          // Squat: Pelvis drops, knees flex to ~85°, spine stays neutral with slight forward lean
          const squatDepth = t * 0.65;
          if (pelvisMeshRef.current) {
            pelvisMeshRef.current.position.y = 0.2 - squatDepth;
            pelvisMeshRef.current.position.z = -t * 0.15;
          }
          if (spineGroupRef.current) {
            spineGroupRef.current.rotation.x = t * 0.32; // forward torso lean
          }
          if (leftLegGroupRef.current && rightLegGroupRef.current) {
            leftLegGroupRef.current.rotation.x = -t * 1.45; // hip flexion
            rightLegGroupRef.current.rotation.x = -t * 1.45;
          }
          if (leftShinGroupRef.current && rightShinGroupRef.current) {
            leftShinGroupRef.current.rotation.x = t * 1.7; // knee flexion
            rightShinGroupRef.current.rotation.x = t * 1.7;
          }
          // Arms hold counterbalance or goblet dumbbell
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.x = 0.6 + t * 0.4;
            rightArmGroupRef.current.rotation.x = 0.6 + t * 0.4;
          }
          if (leftForearmGroupRef.current && rightForearmGroupRef.current) {
            leftForearmGroupRef.current.rotation.x = 0.8;
            rightForearmGroupRef.current.rotation.x = 0.8;
          }
          // Show barbell on shoulders
          if (barbellGroupRef.current) {
            barbellGroupRef.current.visible = true;
            barbellGroupRef.current.position.set(0, 0.7 - squatDepth, -t * 0.15);
          }
          break;
        }

        case 'pushup': {
          // Push-up: Mannequin rotated 90° face-down in plank, elbows flare and bend
          if (mannequinGroupRef.current) {
            mannequinGroupRef.current.rotation.x = Math.PI / 2;
            mannequinGroupRef.current.position.set(0, -1.1 + (1 - t) * 0.35, 0.2);
          }
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.z = (1 - t) * 0.9;
            rightArmGroupRef.current.rotation.z = -(1 - t) * 0.9;
            leftArmGroupRef.current.rotation.y = (1 - t) * 0.4;
            rightArmGroupRef.current.rotation.y = -(1 - t) * 0.4;
          }
          if (leftForearmGroupRef.current && rightForearmGroupRef.current) {
            leftForearmGroupRef.current.rotation.x = -(1 - t) * 1.4;
            rightForearmGroupRef.current.rotation.x = -(1 - t) * 1.4;
          }
          break;
        }

        case 'deadlift': {
          // Deadlift: Hip hinge back, spine angles forward 45°, hands lower barbell to floor
          const hinge = t * 0.9;
          if (pelvisMeshRef.current) {
            pelvisMeshRef.current.position.y = 0.2 - t * 0.3;
            pelvisMeshRef.current.position.z = -t * 0.35;
          }
          if (spineGroupRef.current) {
            spineGroupRef.current.rotation.x = hinge;
          }
          if (leftLegGroupRef.current && rightLegGroupRef.current) {
            leftLegGroupRef.current.rotation.x = -t * 0.5;
            rightLegGroupRef.current.rotation.x = -t * 0.5;
          }
          if (leftShinGroupRef.current && rightShinGroupRef.current) {
            leftShinGroupRef.current.rotation.x = t * 0.55;
            rightShinGroupRef.current.rotation.x = t * 0.55;
          }
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.x = -hinge * 0.8;
            rightArmGroupRef.current.rotation.x = -hinge * 0.8;
          }
          if (barbellGroupRef.current) {
            barbellGroupRef.current.visible = true;
            barbellGroupRef.current.position.set(0, -0.4 - t * 0.9, 0.45);
          }
          break;
        }

        case 'bench_press': {
          // Bench press: Lie supine on bench, press bar up from chest
          if (mannequinGroupRef.current) {
            mannequinGroupRef.current.rotation.x = -Math.PI / 2;
            mannequinGroupRef.current.position.set(0, -0.9, 0);
          }
          if (benchMeshRef.current) benchMeshRef.current.visible = true;

          const pressY = (1 - t) * 0.5;
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.z = 0.5 + t * 0.7;
            rightArmGroupRef.current.rotation.z = -0.5 - t * 0.7;
          }
          if (leftForearmGroupRef.current && rightForearmGroupRef.current) {
            leftForearmGroupRef.current.rotation.x = -0.3 - t * 0.9;
            rightForearmGroupRef.current.rotation.x = -0.3 - t * 0.9;
          }
          if (barbellGroupRef.current) {
            barbellGroupRef.current.visible = true;
            barbellGroupRef.current.position.set(0, -0.5 + pressY, 0.15);
          }
          break;
        }

        case 'shoulder_press': {
          // Overhead press: Arms press from collarbone straight to overhead
          const press = t;
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.z = 0.4 + press * 2.4;
            rightArmGroupRef.current.rotation.z = -0.4 - press * 2.4;
            leftArmGroupRef.current.rotation.x = 0.2 - press * 0.4;
            rightArmGroupRef.current.rotation.x = 0.2 - press * 0.4;
          }
          if (leftForearmGroupRef.current && rightForearmGroupRef.current) {
            leftForearmGroupRef.current.rotation.x = 0.4 - press * 0.4;
            rightForearmGroupRef.current.rotation.x = 0.4 - press * 0.4;
          }
          if (barbellGroupRef.current) {
            barbellGroupRef.current.visible = true;
            barbellGroupRef.current.position.set(0, 0.75 + press * 0.65, 0.1);
          }
          break;
        }

        case 'lunge': {
          // Lunge: Left leg steps forward, right drops toward floor
          const lungeY = t * 0.45;
          if (pelvisMeshRef.current) {
            pelvisMeshRef.current.position.y = 0.2 - lungeY;
          }
          if (leftLegGroupRef.current) {
            leftLegGroupRef.current.rotation.x = -t * 1.35;
          }
          if (leftShinGroupRef.current) {
            leftShinGroupRef.current.rotation.x = t * 1.45;
          }
          if (rightLegGroupRef.current) {
            rightLegGroupRef.current.rotation.x = t * 0.8;
          }
          if (rightShinGroupRef.current) {
            rightShinGroupRef.current.rotation.x = t * 1.5;
          }
          break;
        }

        case 'walk': {
          // Walking cycle: Alternating legs and arms with continuous stride
          const walkCycle = (elapsed * 0.004) % (Math.PI * 2);
          const legSwing = Math.sin(walkCycle) * 0.65;
          const armSwing = Math.cos(walkCycle) * 0.55;

          if (leftLegGroupRef.current && rightLegGroupRef.current) {
            leftLegGroupRef.current.rotation.x = legSwing;
            rightLegGroupRef.current.rotation.x = -legSwing;
          }
          if (leftShinGroupRef.current && rightShinGroupRef.current) {
            leftShinGroupRef.current.rotation.x = Math.max(0, -legSwing * 0.9);
            rightShinGroupRef.current.rotation.x = Math.max(0, legSwing * 0.9);
          }
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.x = -armSwing;
            rightArmGroupRef.current.rotation.x = armSwing;
          }
          if (pelvisMeshRef.current) {
            pelvisMeshRef.current.position.y = 0.2 + Math.abs(Math.sin(walkCycle * 2)) * 0.06;
          }
          break;
        }

        case 'run': {
          // Running cycle: dynamic knee drive and arm pump
          const runCycle = (elapsed * 0.007) % (Math.PI * 2);
          const runLeg = Math.sin(runCycle) * 1.1;
          const runArm = Math.cos(runCycle) * 1.0;

          if (leftLegGroupRef.current && rightLegGroupRef.current) {
            leftLegGroupRef.current.rotation.x = runLeg;
            rightLegGroupRef.current.rotation.x = -runLeg;
          }
          if (leftShinGroupRef.current && rightShinGroupRef.current) {
            leftShinGroupRef.current.rotation.x = Math.max(0.1, -runLeg * 1.3);
            rightShinGroupRef.current.rotation.x = Math.max(0.1, runLeg * 1.3);
          }
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.x = -runArm;
            rightArmGroupRef.current.rotation.x = runArm;
          }
          if (pelvisMeshRef.current) {
            pelvisMeshRef.current.position.y = 0.2 + Math.abs(Math.sin(runCycle * 2)) * 0.12;
          }
          if (spineGroupRef.current) {
            spineGroupRef.current.rotation.x = 0.25; // athletic forward lean
          }
          break;
        }

        case 'plank': {
          // Plank: horizontal isometric hold
          if (mannequinGroupRef.current) {
            mannequinGroupRef.current.rotation.x = Math.PI / 2;
            mannequinGroupRef.current.position.set(0, -1.0, 0);
          }
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.x = -0.4;
            rightArmGroupRef.current.rotation.x = -0.4;
          }
          if (leftForearmGroupRef.current && rightForearmGroupRef.current) {
            leftForearmGroupRef.current.rotation.x = -1.2;
            rightForearmGroupRef.current.rotation.x = -1.2;
          }
          break;
        }

        case 'pullup':
        case 'row': {
          // Upper body pull
          const pull = t;
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.x = 1.6 - pull * 1.2;
            rightArmGroupRef.current.rotation.x = 1.6 - pull * 1.2;
          }
          if (leftForearmGroupRef.current && rightForearmGroupRef.current) {
            leftForearmGroupRef.current.rotation.x = 0.2 + pull * 1.4;
            rightForearmGroupRef.current.rotation.x = 0.2 + pull * 1.4;
          }
          if (spineGroupRef.current) {
            spineGroupRef.current.rotation.x = -0.15 * pull;
          }
          break;
        }

        case 'dip': {
          // Dips
          const dipY = t * 0.45;
          if (pelvisMeshRef.current) {
            pelvisMeshRef.current.position.y = 0.2 - dipY;
          }
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.x = -0.2 - t * 0.8;
            rightArmGroupRef.current.rotation.x = -0.2 - t * 0.8;
          }
          if (leftForearmGroupRef.current && rightForearmGroupRef.current) {
            leftForearmGroupRef.current.rotation.x = -0.4 - t * 1.1;
            rightForearmGroupRef.current.rotation.x = -0.4 - t * 1.1;
          }
          break;
        }

        case 'jumping_jack': {
          // Jumping jack: abduction / adduction
          const jack = t;
          if (leftLegGroupRef.current && rightLegGroupRef.current) {
            leftLegGroupRef.current.rotation.z = jack * 0.45;
            rightLegGroupRef.current.rotation.z = -jack * 0.45;
          }
          if (leftArmGroupRef.current && rightArmGroupRef.current) {
            leftArmGroupRef.current.rotation.z = jack * 2.6;
            rightArmGroupRef.current.rotation.z = -jack * 2.6;
          }
          if (pelvisMeshRef.current) {
            pelvisMeshRef.current.position.y = 0.2 + (1 - jack) * 0.1;
          }
          break;
        }

        default: {
          // Default gentle breathing / idle
          if (spineGroupRef.current) {
            spineGroupRef.current.position.y = 0.15 + Math.sin(elapsed * 0.003) * 0.02;
          }
          break;
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [movementType, isPlaying, playbackSpeed, showMusclesHighlight]);

  // Pointer drag to orbit 360°
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    prevMousePos.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMousePos.current.x;
    const deltaY = e.clientY - prevMousePos.current.y;
    prevMousePos.current = { x: e.clientX, y: e.clientY };

    orbitAngles.current.theta += deltaX * 0.01;
    orbitAngles.current.phi = Math.max(0.15, Math.min(Math.PI / 2 + 0.15, orbitAngles.current.phi - deltaY * 0.01));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Wheel to zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    orbitAngles.current.radius = Math.max(2.8, Math.min(8.0, orbitAngles.current.radius + e.deltaY * 0.005));
  };

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none"
    >
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full cursor-grab active:cursor-grabbing block touch-none"
        style={{ height: isCompact ? '220px' : '340px' }}
      />

      {/* Top Overlay Badge: Exercise Name & Movement Type */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-bold text-white truncate max-w-[170px] sm:max-w-[240px]">
            {exercise.name}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono uppercase font-semibold">
            3D
          </span>
        </div>

        {/* Rep & Phase Counter */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md font-mono text-[10px]">
          <span className="text-slate-400">Rep</span>
          <span className="font-bold text-white text-xs">{repCount}</span>
          <span className="text-slate-600">·</span>
          <span className={`capitalize font-semibold ${currentPhase === 'concentric' ? 'text-emerald-400' : 'text-cyan-400'}`}>
            {currentPhase === 'concentric' ? 'Push' : 'Control'}
          </span>
        </div>
      </div>

      {/* Target Muscle Glow HUD Indicator */}
      <div className="absolute top-11 left-2.5 pointer-events-none">
        <div className="flex items-center gap-1 text-[10px] text-slate-300 px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-slate-400">Focus:</span>
          <span className="font-semibold text-emerald-300 truncate max-w-[160px]">
            {exercise.targetMuscle}
          </span>
        </div>
      </div>

      {/* Camera Presets Selector */}
      <div className="absolute top-11 right-2.5 flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
        {(['persp', 'front', 'side', 'top'] as const).map((angle) => (
          <button
            key={angle}
            onClick={() => setCameraPreset(angle)}
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase transition-colors ${
              cameraAngle === angle 
                ? 'bg-emerald-500 text-slate-950 font-bold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {angle === 'persp' ? '3D' : angle}
          </button>
        ))}
      </div>

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        {/* Play / Pause */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-7 h-7 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-transform active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          {/* Speed Toggle (0.5x, 1x, 1.5x) */}
          <button
            onClick={() => {
              const speeds = [0.5, 1.0, 1.5];
              const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
              setPlaybackSpeed(speeds[nextIdx]);
            }}
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono text-[10px] font-bold"
          >
            {playbackSpeed}x
          </button>

          {/* Reset Orbit */}
          <button
            onClick={() => setCameraPreset('persp')}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-white"
            title="Reset Camera Angle"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Form Tip Cues */}
        <div className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[170px] italic">
          💡 {exercise.tips || 'Keep core engaged & spine neutral'}
        </div>

        {/* Toggle Muscle Highlight */}
        <button
          onClick={() => setShowMusclesHighlight(!showMusclesHighlight)}
          className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${
            showMusclesHighlight
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle Biomechanical Muscle Activation"
        >
          <Layers className="w-3 h-3" />
          <span className="hidden xs:inline">Muscles</span>
        </button>
      </div>

      {/* Drag instruction helper on hover / initial */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 pointer-events-none opacity-40 hover:opacity-80 transition-opacity">
        <span className="text-[9px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded-full border border-slate-800/60 font-mono">
          drag to rotate 360° · scroll to zoom
        </span>
      </div>
    </div>
  );
};
