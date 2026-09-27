import { Exercise, ExerciseDemoData, ExerciseAnimationType } from '../types';

// Concrete demo definitions for key exercises to transform text instructions into rich real demo workouts
export const EXERCISE_DEMO_DATABASE: Record<string, ExerciseDemoData> = {
  // Pushups (Incline, Standard, Floor, Diamond)
  'ex-1': {
    animationType: 'pushup',
    primaryMuscles: ['Chest (Pectoralis)', 'Triceps'],
    secondaryMuscles: ['Anterior Deltoids', 'Core', 'Serratus Anterior'],
    tempo: { down: 2, pause: 1, up: 1, reset: 1 },
    breathingGuide: 'Inhale smoothly as you lower your chest; exhale forcefully as you drive up through the palms.',
    phases: [
      {
        phase: 'setup',
        title: 'Rigid Plank Stance',
        instruction: 'Place palms slightly wider than shoulder-width. Screw hands into floor to externally rotate shoulders. Brace abs, glutes, and quadriceps into a straight line.',
        cue: 'Straight line from heels to ears.',
        durationSeconds: 2,
      },
      {
        phase: 'eccentric',
        title: 'Controlled 2s Descent',
        instruction: 'Lower your entire torso together. Keep elbows tucked at approximately a 45-degree angle (arrowhead shape, not flared out T-shape).',
        cue: 'Chest leads the descent.',
        durationSeconds: 2,
      },
      {
        phase: 'concentric',
        title: 'Peak Chest Contraction',
        instruction: 'Pause 1 inch above the deck. Explosively drive the ground away through your palms, squeezing pecs and locking out triceps at the apex.',
        cue: 'Push the floor away.',
        durationSeconds: 1,
      },
      {
        phase: 'recovery',
        title: 'Top Lockout & Reset',
        instruction: 'Maintain hollow-body core brace without letting your lower back sag or hips poke upward.',
        cue: 'Squeeze glutes & reset breath.',
        durationSeconds: 1,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Elbow Flare Angle',
        correct: 'Elbows track at 45° angle to torso like an arrow.',
        mistakeToAvoid: 'Elbows flared 90° wide, straining shoulder joints.',
      },
      {
        aspect: 'Lumbar Spine Alignment',
        correct: 'Transverse core locked tight with zero sagging in hips.',
        mistakeToAvoid: 'Lower back dipping into excessive lordosis / belly sagging.',
      },
      {
        aspect: 'Range of Motion',
        correct: 'Full depth until chest is 1–2 inches from floor.',
        mistakeToAvoid: 'Short neck bobs with minimal arm flexion.',
      },
    ],
  },

  // Air Squats
  'ex-2': {
    animationType: 'squat',
    primaryMuscles: ['Quadriceps', 'Gluteus Maximus'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Adductors', 'Calves'],
    tempo: { down: 2.5, pause: 1, up: 1.5, reset: 1 },
    breathingGuide: 'Take a deep 360-degree belly breath at top; hold intra-abdominal pressure down; exhale past the sticking point on rise.',
    phases: [
      {
        phase: 'setup',
        title: 'Athletic Foot Anchoring',
        instruction: 'Stand with feet shoulder-width apart, toes turned outward 10–20 degrees. Grip floor with tripod foot pressure (heel, big toe, pinky toe).',
        cue: 'Weight balanced over midfoot.',
        durationSeconds: 2,
      },
      {
        phase: 'eccentric',
        title: 'Hip Hinge & Knee Flexion',
        instruction: 'Send hips back slightly while simultaneously bending knees. Push knees outward tracking directly over your 2nd and 3rd toes.',
        cue: 'Sit between your thighs.',
        durationSeconds: 2,
      },
      {
        phase: 'concentric',
        title: 'Parallel Depth & Drive',
        instruction: 'Descend until hip crease is level with or just below knee cap. Drive whole foot down into floor to reverse direction with power.',
        cue: 'Push floor away, chest proud.',
        durationSeconds: 1,
      },
      {
        phase: 'recovery',
        title: 'Full Hip Extension',
        instruction: 'Stand tall to full lockout. Squeeze glutes firmly at top without hyperextending lower back.',
        cue: 'Lock hips, reset breath.',
        durationSeconds: 1,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Knee Tracking',
        correct: 'Knees stay wide, tracking parallel with toes.',
        mistakeToAvoid: 'Knees caving inward (valgus collapse) on ascent.',
      },
      {
        aspect: 'Torso Angle',
        correct: 'Chest stays tall and proud, spine maintains neutral curve.',
        mistakeToAvoid: 'Excessive forward bend tipping torso parallel to floor.',
      },
      {
        aspect: 'Heel Contact',
        correct: 'Heels remain glued to ground throughout entire movement.',
        mistakeToAvoid: 'Heels peeling off floor, shifting stress to knee tendons.',
      },
    ],
  },

  // Glute Bridges
  'ex-3': {
    animationType: 'bridge',
    primaryMuscles: ['Gluteus Maximus', 'Hamstrings'],
    secondaryMuscles: ['Erector Spinae', 'Lower Abdominals'],
    tempo: { down: 2, pause: 2, up: 1, reset: 1 },
    breathingGuide: 'Inhale as hips rest; exhale powerfully as you bridge up and lock into peak glute contraction.',
    phases: [
      {
        phase: 'setup',
        title: 'Supine Position',
        instruction: 'Lie on your back, knees bent at 90 degrees, feet flat on floor about hip-width apart. Arms relaxed at sides.',
        cue: 'Shins vertical at top of movement.',
        durationSeconds: 2,
      },
      {
        phase: 'eccentric',
        title: 'Pelvic Posterior Tilt',
        instruction: 'Flatten lower back against floor to engage abs before initiating the drive. Dig heels into ground.',
        cue: 'Tuck pelvis under.',
        durationSeconds: 1,
      },
      {
        phase: 'concentric',
        title: 'Explosive Hip Thrust',
        instruction: 'Drive through heels to elevate hips until thighs and torso form a straight diagonal line. Squeeze glutes aggressively.',
        cue: 'Hold 2-second glute clamp.',
        durationSeconds: 2,
      },
      {
        phase: 'recovery',
        title: 'Controlled Lowering',
        instruction: 'Lower hips vertebra by vertebra with control until glutes graze the floor, then immediately re-engage.',
        cue: 'Control down, keep tension.',
        durationSeconds: 1,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Hip Extension Height',
        correct: 'Straight line from knees to shoulders driven by glute squeeze.',
        mistakeToAvoid: 'Arching lower back past neutral to force hips higher.',
      },
      {
        aspect: 'Foot Placement',
        correct: 'Feet close enough that shins are nearly vertical at top.',
        mistakeToAvoid: 'Feet too far forward (causes hamstring cramping).',
      },
    ],
  },

  // Forearm Plank
  'ex-4': {
    animationType: 'plank',
    primaryMuscles: ['Transverse Abdominis', 'Rectus Abdominis'],
    secondaryMuscles: ['Glutes', 'Shoulders', 'Quadriceps', 'Lats'],
    tempo: { down: 0, pause: 30, up: 0, reset: 5 },
    breathingGuide: 'Take steady, shallow rhythmic breaths while keeping abdominal wall fully pressurized and drawn inward.',
    phases: [
      {
        phase: 'setup',
        title: 'Elbow Stack',
        instruction: 'Elbows directly below shoulders, forearms parallel on mat. Extend legs back on balls of feet.',
        cue: 'Shoulders stacked over elbows.',
        durationSeconds: 2,
      },
      {
        phase: 'concentric',
        title: 'Full Body Tension Hold',
        instruction: 'Pull belly button toward spine. Actively pull elbows toward toes and toes toward elbows to create high isometric irradiation.',
        cue: 'Total body tension: glutes & abs hard as rock.',
        durationSeconds: 10,
      },
      {
        phase: 'recovery',
        title: 'Sustained Alignment',
        instruction: 'Breathe smoothly through nose. Prevent shoulder blades from winging by pushing upper back toward ceiling.',
        cue: 'Don’t hold breath; stay rock solid.',
        durationSeconds: 5,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Hip Elevation',
        correct: 'Hips level with mid-back in a rigid plank.',
        mistakeToAvoid: 'Sagging hips causing lower back compression, or piking butt up.',
      },
      {
        aspect: 'Head Position',
        correct: 'Neck neutral, gaze directly down at wrists.',
        mistakeToAvoid: 'Craning neck up to look forward.',
      },
    ],
  },

  // Walking Lunges
  'ex-fl-1': {
    animationType: 'lunge',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core Stabilizers'],
    tempo: { down: 2, pause: 1, up: 1, reset: 1 },
    breathingGuide: 'Inhale stepping into lunge; exhale forcefully as you drive up through the front heel.',
    phases: [
      {
        phase: 'setup',
        title: 'Upright Posture',
        instruction: 'Stand tall with core braced and hands on hips or holding weights. Shoulders back and relaxed.',
        cue: 'Tall spine, eyes forward.',
        durationSeconds: 1,
      },
      {
        phase: 'eccentric',
        title: 'Long Forward Stride',
        instruction: 'Take a controlled step forward. Lower until both knees form clean 90-degree angles, back knee hovering 1 inch from ground.',
        cue: 'Drop straight down, not forwards.',
        durationSeconds: 2,
      },
      {
        phase: 'concentric',
        title: 'Front Heel Drive',
        instruction: 'Press firmly into the front heel and midfoot. Drive up smoothly to swing back leg forward into the next lunge.',
        cue: 'Drive through front heel.',
        durationSeconds: 1,
      },
      {
        phase: 'recovery',
        title: 'Seamless Transition',
        instruction: 'Stabilize pelvis and smoothly land next stride with zero wobbling.',
        cue: 'Flow into next stride.',
        durationSeconds: 1,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Front Knee Position',
        correct: 'Front knee directly over ankle/laces, never passing toes.',
        mistakeToAvoid: 'Front knee shooting far beyond toes with heel lifting.',
      },
      {
        aspect: 'Torso Angle',
        correct: 'Torso stays tall with slight athletic forward hinge.',
        mistakeToAvoid: 'Leaning backward and hyperextending lumbar spine.',
      },
    ],
  },

  // Mountain Climbers
  'ex-fl-2': {
    animationType: 'climber',
    primaryMuscles: ['Core & Hip Flexors', 'Cardio / Aerobic Engine'],
    secondaryMuscles: ['Shoulders', 'Chest', 'Quadriceps'],
    tempo: { down: 0.5, pause: 0, up: 0.5, reset: 0 },
    breathingGuide: 'Continuous rhythmic breathing in sync with alternating leg cadence.',
    phases: [
      {
        phase: 'setup',
        title: 'Tall Plank Stance',
        instruction: 'Hands directly under shoulders, fingers spread. Body in a straight line from heels to crown.',
        cue: 'Firm floor grip, tight abs.',
        durationSeconds: 1,
      },
      {
        phase: 'concentric',
        title: 'Knee Drive to Chest',
        instruction: 'Drive right knee rapidly toward chest without bouncing hips upward. Ball of foot hovers above floor.',
        cue: 'Drive knee in, keep hips low.',
        durationSeconds: 0.5,
      },
      {
        phase: 'recovery',
        title: 'Rapid Leg Switch',
        instruction: 'Quickly switch legs, extending right back while driving left knee forward with athletic rhythm.',
        cue: 'Stay light on your feet.',
        durationSeconds: 0.5,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Hip Bounce',
        correct: 'Hips remain level and quiet throughout rapid leg drives.',
        mistakeToAvoid: 'Butt bouncing up into the air with every step.',
      },
      {
        aspect: 'Shoulder Position',
        correct: 'Shoulders stay stacked over wrists.',
        mistakeToAvoid: 'Drifting backward away from hands into a pseudo down-dog.',
      },
    ],
  },

  // Jumping Jacks
  'ex-fl-3': {
    animationType: 'jumping_jack',
    primaryMuscles: ['Full Body Cardio', 'Calves'],
    secondaryMuscles: ['Deltoids', 'Glute Medius', 'Quadriceps'],
    tempo: { down: 0.5, pause: 0, up: 0.5, reset: 0 },
    breathingGuide: 'Inhale expanding arms, exhale returning to center.',
    phases: [
      {
        phase: 'setup',
        title: 'Neutral Standing',
        instruction: 'Feet together, arms resting relaxed at sides.',
        cue: 'Tall posture, soft knees.',
        durationSeconds: 1,
      },
      {
        phase: 'concentric',
        title: 'Lateral Jump & Overhead Reach',
        instruction: 'Hop feet wide out past shoulders while sweeping arms overhead in an arc to meet.',
        cue: 'Spring off balls of feet.',
        durationSeconds: 0.5,
      },
      {
        phase: 'recovery',
        title: 'Soft Landing & Reset',
        instruction: 'Hop back to starting stance, landing softly with springy ankles and knees.',
        cue: 'Absorb impact smoothly.',
        durationSeconds: 0.5,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Landing Softness',
        correct: 'Land lightly on balls of feet with knees springy.',
        mistakeToAvoid: 'Heavy heel stomping with rigid locked knees.',
      },
    ],
  },

  // Bicycle Crunches
  'ex-fl-4': {
    animationType: 'crunch',
    primaryMuscles: ['Obliques', 'Rectus Abdominis'],
    secondaryMuscles: ['Hip Flexors', 'Transverse Abdominis'],
    tempo: { down: 1.5, pause: 1, up: 1.5, reset: 0 },
    breathingGuide: 'Exhale during rotational crunch; inhale passing through center.',
    phases: [
      {
        phase: 'setup',
        title: 'Tabletop Supine',
        instruction: 'Lie on back, fingertips lightly behind ears, knees bent at 90 degrees elevated.',
        cue: 'Lower back pressed flat.',
        durationSeconds: 1,
      },
      {
        phase: 'concentric',
        title: 'Cross-Body Rotational Drive',
        instruction: 'Rotate torso to bring right armpit (not just elbow) toward left knee while extending right leg straight out at 45°.',
        cue: 'Armpit to knee, squeeze oblique.',
        durationSeconds: 1.5,
      },
      {
        phase: 'recovery',
        title: 'Controlled Alternation',
        instruction: 'Pause 1 second at peak contraction, then reverse smoothly to the opposite side with zero jerking.',
        cue: 'Slow, deliberate rotation.',
        durationSeconds: 1.5,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Neck Strain',
        correct: 'Fingertips resting lightly; rotation generated from thoracic spine.',
        mistakeToAvoid: 'Yanking neck forward with intertwined fingers.',
      },
      {
        aspect: 'Pace Control',
        correct: 'Controlled 2-second contractions with full rotation.',
        mistakeToAvoid: 'Flapping elbows wildly without abdominal engagement.',
      },
    ],
  },

  // Bench Press
  'ex-mg-1': {
    animationType: 'bench_press',
    primaryMuscles: ['Pectoralis Major', 'Anterior Deltoids'],
    secondaryMuscles: ['Triceps Brachii', 'Lats (Stabilizers)'],
    tempo: { down: 2.5, pause: 1, up: 1, reset: 1 },
    breathingGuide: 'Big chest breath at top; hold on descent; exhale past mid-press sticking point.',
    phases: [
      {
        phase: 'setup',
        title: 'Arch & Shoulder Retraction',
        instruction: 'Lie with eyes under bar. Pinch shoulder blades down and back into bench. Feet driven firmly into floor for leg drive.',
        cue: 'Pinch shoulder blades into back pockets.',
        durationSeconds: 2,
      },
      {
        phase: 'eccentric',
        title: 'Barbell Path to Sternum',
        instruction: 'Unrack bar. Lower bar in a slight diagonal arc to touch mid-sternum. Keep forearms vertical under bar.',
        cue: 'Pull bar down into chest.',
        durationSeconds: 2.5,
      },
      {
        phase: 'concentric',
        title: 'Leg Drive & Explosive Press',
        instruction: 'Pause on chest without bouncing. Drive heels into floor and press bar up and slightly back toward eye line.',
        cue: 'Drive heels down, press hard.',
        durationSeconds: 1,
      },
      {
        phase: 'recovery',
        title: 'Apex Lockout',
        instruction: 'Lock elbows at top over shoulders while keeping shoulder blades firmly pinned against bench.',
        cue: 'Lockout over shoulders, reset air.',
        durationSeconds: 1,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Bar Path',
        correct: 'Slight diagonal arc from eye level to lower sternum and back.',
        mistakeToAvoid: 'Straight vertical path dropping onto neck/collarbone.',
      },
      {
        aspect: 'Shoulder Blade Anchor',
        correct: 'Scapulae remain pinched tight throughout the entire set.',
        mistakeToAvoid: 'Reaching shoulders forward at top, losing bench stability.',
      },
    ],
  },

  // Pull-ups / Lat Pulldowns
  'ex-mg-2': {
    animationType: 'pullup',
    primaryMuscles: ['Latissimus Dorsi', 'Biceps Brachii'],
    secondaryMuscles: ['Rhomboids', 'Rear Deltoids', 'Brachialis', 'Core'],
    tempo: { down: 2, pause: 1, up: 1.5, reset: 1 },
    breathingGuide: 'Exhale as you pull your chest to the bar; inhale on the controlled descent.',
    phases: [
      {
        phase: 'setup',
        title: 'Active Deadhang',
        instruction: 'Grip bar slightly wider than shoulder width. Depress scapulae to engage lats before bending arms.',
        cue: 'Pull shoulder blades down away from ears.',
        durationSeconds: 2,
      },
      {
        phase: 'concentric',
        title: 'Elbows to Back Pockets',
        instruction: 'Drive elbows down and back toward your ribs. Lead with chest tall until chin clears bar or touches upper chest.',
        cue: 'Lead with sternum, elbows drive down.',
        durationSeconds: 1.5,
      },
      {
        phase: 'recovery',
        title: 'Full Eccentric Stretch',
        instruction: 'Lower slowly over 2 seconds to full arm extension without dropping dead into shoulder joints.',
        cue: 'Full stretch at bottom, control descent.',
        durationSeconds: 2,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Elbow Drive',
        correct: 'Elbows pull down and back, engaging broad lat fibers.',
        mistakeToAvoid: 'Curling solely with arms and kipping with legs.',
      },
      {
        aspect: 'Chest Angle',
        correct: 'Chest lifted toward bar with slight backward torso tilt.',
        mistakeToAvoid: 'Rounding upper back forward into a hunched posture.',
      },
    ],
  },

  // Overhead Shoulder Press
  'ex-mg-3': {
    animationType: 'overhead_press',
    primaryMuscles: ['Anterior & Lateral Deltoids', 'Triceps'],
    secondaryMuscles: ['Upper Traps', 'Core (Stability)', 'Glutes'],
    tempo: { down: 2, pause: 1, up: 1.5, reset: 1 },
    breathingGuide: 'Inhale deeply into belly; brace abs; exhale as bar clears forehead and locks overhead.',
    phases: [
      {
        phase: 'setup',
        title: 'Front Rack Stance',
        instruction: 'Dumbbells or bar at collarbone height. Glutes squeezed, quads flexed, ribs tucked down.',
        cue: 'Tight pillar from floor to shoulders.',
        durationSeconds: 2,
      },
      {
        phase: 'concentric',
        title: 'Vertical Overhead Press',
        instruction: 'Press weight straight up. Pull head back slightly as bar passes face, then bring head through window at top.',
        cue: 'Press straight overhead, head through.',
        durationSeconds: 1.5,
      },
      {
        phase: 'recovery',
        title: 'Controlled Lowering',
        instruction: 'Lower weight back to shoulders over 2 seconds with forearms vertical.',
        cue: 'Control back to collarbones.',
        durationSeconds: 2,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Lumbar Spine',
        correct: 'Glutes squeezed tight to prevent lower back arching.',
        mistakeToAvoid: 'Leaning back excessively to turn it into an incline press.',
      },
    ],
  },

  // Conventional Deadlift
  'ex-st-1': {
    animationType: 'deadlift',
    primaryMuscles: ['Hamstrings', 'Glutes', 'Erector Spinae'],
    secondaryMuscles: ['Latissimus Dorsi', 'Trapezius', 'Forearms / Grip', 'Core'],
    tempo: { down: 2, pause: 1, up: 1.5, reset: 1.5 },
    breathingGuide: 'Big diaphragmatic breath into abdominal belt before lifting; hold valsalva through pull; exhale standing tall.',
    phases: [
      {
        phase: 'setup',
        title: 'Wedge & Bar Placement',
        instruction: 'Barbell over midfoot (1 inch from shins). Hinge hips back, take overhand grip, pull slack out of bar until it clicks.',
        cue: 'Chest tall, bar glued to shins.',
        durationSeconds: 2,
      },
      {
        phase: 'concentric',
        title: 'Leg Press & Hip Extension',
        instruction: 'Drive floor away through whole foot. Keep bar path perfectly vertical skimming shins and thighs. Squeeze glutes at lockout.',
        cue: 'Push floor away, snap hips.',
        durationSeconds: 1.5,
      },
      {
        phase: 'eccentric',
        title: 'Hip Hinge Descent',
        instruction: 'Hinge hips backward until bar passes knees, then bend knees to return bar softly to deck.',
        cue: 'Hinge back first, control bar path.',
        durationSeconds: 2,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Spinal Curvature',
        correct: 'Spine locked in rigid neutral position from pelvis to neck.',
        mistakeToAvoid: 'Rounding lumbar spine (cat back) when pulling off floor.',
      },
      {
        aspect: 'Bar Path',
        correct: 'Straight vertical trajectory touching legs.',
        mistakeToAvoid: 'Bar drifting forward away from body, multiplying torque on back.',
      },
    ],
  },

  // Barbell Squat
  'ex-st-2': {
    animationType: 'squat',
    primaryMuscles: ['Quadriceps', 'Glutes'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Adductors'],
    tempo: { down: 2.5, pause: 1, up: 1.5, reset: 1 },
    breathingGuide: 'Deep belly breath, expand torso 360°, hold valsalva down, exhale past halfway up.',
    phases: [
      {
        phase: 'setup',
        title: 'Upper Back Shelf',
        instruction: 'Barbell resting firmly across upper traps. Elbows pulled down into ribs. Feet shoulder-width, toes angled 15° out.',
        cue: 'Tight upper back, chest proud.',
        durationSeconds: 2,
      },
      {
        phase: 'eccentric',
        title: 'Deep Controlled Descent',
        instruction: 'Break hips and knees together. Lower until hip crease drops slightly below top of knees.',
        cue: 'Spread the floor with feet, hit parallel.',
        durationSeconds: 2.5,
      },
      {
        phase: 'concentric',
        title: 'Explosive Drive',
        instruction: 'Drive through midfoot, keep chest and hips rising at identical angles. Lockout with glute squeeze.',
        cue: 'Drive back up through midfoot.',
        durationSeconds: 1.5,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Good Morning Squat',
        correct: 'Hips and chest rise at the exact same rate.',
        mistakeToAvoid: 'Hips shooting up first, turning squat into a stiff-leg deadlift.',
      },
    ],
  },

  // Chair Dips / Dips
  'ex-hm-3': {
    animationType: 'dip',
    primaryMuscles: ['Triceps Brachii', 'Lower Chest'],
    secondaryMuscles: ['Anterior Deltoids'],
    tempo: { down: 2, pause: 1, up: 1, reset: 1 },
    breathingGuide: 'Inhale lowering body; exhale driving through palms to lockout.',
    phases: [
      {
        phase: 'setup',
        title: 'Tall Support Stance',
        instruction: 'Palms pressed firmly on edge of chair or dip bars. Shoulders depressed away from ears, legs extended or knees bent.',
        cue: 'Shoulders down, chest open.',
        durationSeconds: 2,
      },
      {
        phase: 'eccentric',
        title: '90-Degree Elbow Bend',
        instruction: 'Lower hips straight down close to the chair edge until upper arms are parallel to floor (90° bend).',
        cue: 'Keep back skimming the chair.',
        durationSeconds: 2,
      },
      {
        phase: 'concentric',
        title: 'Triceps Press',
        instruction: 'Press straight through palms to lock out arms and squeeze triceps.',
        cue: 'Drive through palms, squeeze triceps.',
        durationSeconds: 1,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Shoulder Elevation',
        correct: 'Keep shoulders pressed down throughout movement.',
        mistakeToAvoid: 'Shoulders shrugging up toward ears, causing joint pinching.',
      },
    ],
  },

  // Brisk Cadence Walk
  'ex-wk-1': {
    animationType: 'walk',
    primaryMuscles: ['Cardiovascular System', 'Calves'],
    secondaryMuscles: ['Glutes', 'Hamstrings', 'Core'],
    tempo: { down: 0.5, pause: 0, up: 0.5, reset: 0 },
    breathingGuide: 'Steady deep nasal breathing; exhale relaxed through mouth.',
    phases: [
      {
        phase: 'setup',
        title: 'Zone 2 Posture',
        instruction: 'Keep head held high, shoulders relaxed, arms bent at 90 degrees.',
        cue: 'Tall, relaxed stride.',
        durationSeconds: 1,
      },
      {
        phase: 'concentric',
        title: 'Heel-to-Toe Cadence',
        instruction: 'Strike heel softly, roll through midfoot, push off with big toe. Swing arms naturally in opposition to legs.',
        cue: 'Aim for 115–125 steps per minute.',
        durationSeconds: 1,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Arm Motion',
        correct: 'Gentle forward-backward 90° arm pendulum.',
        mistakeToAvoid: 'Crossing arms across the body midline.',
      },
    ],
  },

  // Jog & Sprint Alternations
  'ex-rn-1': {
    animationType: 'run',
    primaryMuscles: ['Heart & Lungs (VO2 Max)', 'Leg Stamina'],
    secondaryMuscles: ['Calves', 'Hamstrings', 'Quadriceps', 'Core'],
    tempo: { down: 0.35, pause: 0, up: 0.35, reset: 0 },
    breathingGuide: 'Rhythmic 2-stride inhale, 2-stride exhale cadence.',
    phases: [
      {
        phase: 'setup',
        title: 'Forward Fall & Stride',
        instruction: 'Maintain slight forward lean from ankles, not waist. Compact arm swing.',
        cue: 'Lean forward slightly from ankles.',
        durationSeconds: 1,
      },
      {
        phase: 'concentric',
        title: 'Midfoot Strike & Rapid Cadence',
        instruction: 'Land lightly beneath center of mass on midfoot. Quick turnover cadence ~160–175 steps/min.',
        cue: 'Fast, light foot contacts.',
        durationSeconds: 1,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Foot Strike',
        correct: 'Midfoot landing directly underneath your hips.',
        mistakeToAvoid: 'Overstriding with heel striking far out in front.',
      },
    ],
  },
};

// Intelligent helper to resolve or dynamically synthesise demo metadata for any exercise
export function getExerciseDemo(exercise: Exercise): ExerciseDemoData {
  if (exercise.demo) {
    return exercise.demo;
  }

  // Check known ID
  if (EXERCISE_DEMO_DATABASE[exercise.id]) {
    return EXERCISE_DEMO_DATABASE[exercise.id];
  }

  // Deduce animation type based on exercise name keywords
  const nameLower = exercise.name.toLowerCase();
  let animationType: ExerciseAnimationType = 'generic';

  if (nameLower.includes('push-up') || nameLower.includes('pushup')) {
    animationType = 'pushup';
  } else if (nameLower.includes('squat')) {
    animationType = 'squat';
  } else if (nameLower.includes('bridge')) {
    animationType = 'bridge';
  } else if (nameLower.includes('plank')) {
    animationType = 'plank';
  } else if (nameLower.includes('lunge') || nameLower.includes('split squat')) {
    animationType = 'lunge';
  } else if (nameLower.includes('climber')) {
    animationType = 'climber';
  } else if (nameLower.includes('jack') || nameLower.includes('jump')) {
    animationType = 'jumping_jack';
  } else if (nameLower.includes('crunch') || nameLower.includes('sit-up') || nameLower.includes('deadbug')) {
    animationType = 'crunch';
  } else if (nameLower.includes('bench') || nameLower.includes('chest press')) {
    animationType = 'bench_press';
  } else if (nameLower.includes('pull-up') || nameLower.includes('pullup') || nameLower.includes('lat pulldown')) {
    animationType = 'pullup';
  } else if (nameLower.includes('overhead') || nameLower.includes('military') || nameLower.includes('shoulder press')) {
    animationType = 'overhead_press';
  } else if (nameLower.includes('deadlift')) {
    animationType = 'deadlift';
  } else if (nameLower.includes('dip')) {
    animationType = 'dip';
  } else if (nameLower.includes('walk') || nameLower.includes('farmer')) {
    animationType = 'walk';
  } else if (nameLower.includes('run') || nameLower.includes('jog') || nameLower.includes('sprint')) {
    animationType = 'run';
  } else if (nameLower.includes('row')) {
    animationType = 'row';
  }

  // Synthesise full demo metadata from instructions & target muscle
  const primaryMuscles = [exercise.targetMuscle || 'Target Muscle Group'];
  const secondaryMuscles = ['Core Stabilizers', 'Kinetic Chain'];

  return {
    animationType,
    primaryMuscles,
    secondaryMuscles,
    tempo: { down: 2, pause: 1, up: 1.5, reset: 1 },
    breathingGuide: 'Exhale forcefully during the exertion phase; inhale steadily during the controlled return.',
    phases: [
      {
        phase: 'setup',
        title: 'Starting Stance & Setup',
        instruction: 'Anchor body firmly in position. Brace core, engage target stabilizers, and ensure joints are aligned.',
        cue: 'Neutral spine, stable foundation.',
        durationSeconds: 2,
      },
      {
        phase: 'eccentric',
        title: 'Controlled Movement Descent',
        instruction: exercise.instructions || 'Execute movement through full comfortable range of motion with deliberate tempo.',
        cue: 'Smooth controlled tempo.',
        durationSeconds: 2,
      },
      {
        phase: 'concentric',
        title: 'Peak Muscle Contraction',
        instruction: 'Drive through primary mover muscles and achieve full contraction at apex.',
        cue: 'Max contraction, squeeze target muscle.',
        durationSeconds: 1.5,
      },
      {
        phase: 'recovery',
        title: 'Reset & Rep Transition',
        instruction: exercise.tips ? `Key Form Tip: ${exercise.tips}` : 'Reset breath and maintain tension into next repetition.',
        cue: 'Reset breathing, ready for next rep.',
        durationSeconds: 1,
      },
    ],
    formCheckpoints: [
      {
        aspect: 'Range of Motion',
        correct: 'Full active joint range without compensating through lower back.',
        mistakeToAvoid: 'Rushing reps or cutting range of motion short.',
      },
      {
        aspect: 'Control & Tempo',
        correct: 'Deliberate 2s descent with explosive controlled return.',
        mistakeToAvoid: 'Bouncing or relying on inertia/momentum.',
      },
    ],
  };
}
