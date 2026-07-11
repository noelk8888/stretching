/* ============================================
   EXERCISE CLOCK — Application Logic
   ============================================ */

(function () {
  'use strict';

  // ─── Alphabet helper ───
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // ─── State ───
  const state = {
    totalSets: 8,
    totalReps: 8,
    currentSet: 0,      // 0-indexed
    currentRep: 0,      // 0-indexed, 0 = not started
    isRunning: false,
    isFinished: false,
    timerId: null,
    beepEnabled: true,  // sound beep
    voiceEnabled: true, // read out loud
    selectedExercises: [],
    currentExerciseIndex: 0,
    globalDarkMode: true,
    globalSoundMode: true,
    imageCyclerTimerId: null,
  };

  const supabaseConfig = window.EXERCISE_CLOCK_SUPABASE || {};
  const isSupabaseConfigured = Boolean(
    supabaseConfig.url &&
    supabaseConfig.anonKey &&
    window.supabase
  );
  const supabaseClient = isSupabaseConfigured
    ? window.supabase.createClient(supabaseConfig.url, supabaseConfig.anonKey)
    : null;
  const PASSWORD_SETUP_KEY = 'bendandmend:password-setup-email';
  let currentUser = null;
  let isAdmin = false;
  let adminRoutines = [];
  let adminExercises = [];
  let remoteSaveTimerId = null;
  window.EXERCISE_CLOCK_DATA_SOURCE = 'fallback';

  function getCurrentExerciseConfig() {
    const exerciseId = state.selectedExercises[state.currentExerciseIndex];
    if (!exerciseId) return null;
    return exerciseSettings[exerciseId];
  }

  function getCurrentPace() {
    const config = getCurrentExerciseConfig();
    if (!config || !config.progressiveReps) {
      return config ? config.pace : 1.0;
    }
    // Reps are constant within a set, but increase by 10% per set.
    return config.pace * Math.pow(1.1, state.currentSet);
  }

  function getCurrentSetRest() {
    const config = getCurrentExerciseConfig();
    if (!config || !config.progressiveSets) {
      return config ? config.setRest : 1.0;
    }
    // Rest increases by 10% per set.
    return config.setRest * Math.pow(1.1, state.currentSet);
  }

  // ─── Wake Lock ───
  let wakeLock = null;
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
          console.log('Screen Wake Lock released:', wakeLock.released);
        });
        console.log('Screen Wake Lock acquired');
      }
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  }
  function releaseWakeLock() {
    if (wakeLock !== null) {
      wakeLock.release().then(() => {
        wakeLock = null;
      });
    }
  }
  document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
      await requestWakeLock();
    }
  });

  // ─── DOM refs ───
  const $ = (id) => document.getElementById(id);

  let exerciseDetails = {
    'cat-cow': {
      title: 'CAT & COW',
      description: 'Start on your hands and knees. Inhale and let your belly drop towards the floor, lifting your chest and tailbone towards the ceiling (Cow Pose). Exhale and arch your back towards the ceiling, tucking your chin to your chest (Cat Pose). Move slowly and breathe deeply with each movement.',
      alert: 'If you experience wrist pain, you can perform this stretch resting on your forearms instead of your hands.',
      images: ['assets/images/cat_cow_cow_pose.jpg', 'assets/images/cat_cow_cat_pose.jpg']
    },
    'childs-pose': {
      title: "CHILD'S POSE",
      description: 'Kneel on the floor with your toes together and your knees hip-width apart. Slowly sit back on your heels, walk your hands forward, and gently rest your forehead on the floor. Allow your spine to lengthen and your shoulders to relax.',
      alert: 'If you have knee pain, place a rolled-up towel behind your knees or skip this stretch if it causes sharp discomfort.',
      images: ['assets/images/childs_pose_new_1.png', 'assets/images/childs_pose_new_2.png']
    },
    'thread-needle': {
      title: 'THREAD THE NEEDLE',
      description: 'From all fours, slide your right arm under your left arm, dropping your right shoulder and the right side of your head gently to the floor. Keep your hips high and your left hand planted for support. Hold, then switch sides.',
      alert: 'Do not force the twist. Keep the weight gently on your shoulder, not your neck.',
      images: ['assets/images/thread_needle_pose.jpg']
    },
    'bird-dog': {
      title: 'BIRD-DOG',
      description: 'From all fours, slowly extend your right arm forward and your left leg backward simultaneously. Keep your back completely flat and your core engaged. Hold for a moment, return to start, and switch sides.',
      alert: 'If you feel unsteady, extend *only* your arm or *only* your leg until you build more balance.',
      images: ['assets/images/bird_dog_studio.png']
    },
    'sphinx-pose': {
      title: 'SPHINX POSE',
      description: 'Lie flat on your stomach. Prop yourself up on your forearms, keeping your elbows directly under your shoulders. Press your forearms into the floor and gently lift your chest to create a mild lower back arch. Relax your shoulders away from your ears.',
      alert: 'If you feel any pinching in your lower spine, lower your chest slightly or skip the movement.',
      images: ['assets/images/sphinx_pose_prone.jpg', 'assets/images/sphinx_pose_lift.jpg']
    },
    'extensor-stretch': {
      title: 'WRIST EXTENSOR STRETCH',
      description: 'Extend your arm in front of you with your palm facing down. Use your other hand to gently bend your wrist downward until you feel a stretch along the top of your forearm. Hold the stretch.',
      alert: 'Keep your elbow straight but do not lock it forcefully.',
      images: ['assets/images/extensor_stretch_1.png', 'assets/images/extensor_stretch_2.png']
    },
    'wrist-extension': {
      title: 'WRIST EXTENSION',
      description: 'Hold a light weight (or just use the weight of your hand). Support your forearm on a table or your thigh with your hand hanging off the edge, palm facing down. Slowly lift your wrist up, then slowly lower it back down.',
      alert: 'Perform this movement slowly. If you feel sharp pain, stop immediately.',
      images: ['assets/images/wrist_extension_1.png', 'assets/images/wrist_extension_2.png']
    },
    'forearm-rotation': {
      title: 'FOREARM ROTATION',
      description: 'Bend your elbow to 90 degrees, keeping it tucked close to your side. Slowly turn your palm to face up, hold for a moment, then slowly turn your palm to face down.',
      alert: 'Keep your upper arm completely still; all the movement should come from your forearm.',
      images: ['assets/images/forearm_rotation_1.png', 'assets/images/forearm_rotation_2.png']
    },
    'grip-squeeze': {
      title: 'GRIP SQUEEZE',
      description: 'Hold a soft stress ball or a rolled-up towel in your hand. Squeeze it firmly, hold for a few seconds, then release with control.',
      alert: 'Do not squeeze so hard that it causes pain in your elbow.',
      images: ['assets/images/grip_squeeze_1.png', 'assets/images/grip_squeeze_2.png']
    },
    'ward-off': {
      title: 'WARD OFF',
      description: 'Shift your weight onto one leg and raise both arms in a gentle rounded arc, as if you are holding a large ball. Turn your waist slowly as you complete the movement. Return to centre and repeat on the other side.',
      alert: 'Keep a slight bend in your knees at all times. Never lock your joints.',
      images: []
    },
    'cloud-hands': {
      title: 'CLOUD HANDS',
      description: 'Stand with feet shoulder-width apart. Shift your weight from side to side while sweeping both hands in slow, overlapping horizontal circles at chest height. Let your waist lead the movement, eyes following your top hand.',
      alert: 'Move slowly and breathe continuously. Avoid holding your breath.',
      images: []
    },
    'golden-rooster': {
      title: 'GOLDEN ROOSTER',
      description: 'Stand tall, shift your weight to one leg, then slowly lift the opposite knee to hip height while raising the same-side arm upward. Hold for a breath, then lower with control and switch sides.',
      alert: 'Use a wall or chair nearby if you need extra support while building your balance.',
      images: []
    }
  };

  const dom = {
    // Landing page
    landingPage: $('landing-page'),
    btnGuestMode: $('btn-guest-mode'),
    btnLogin: $('btn-login'),
    btnDarkMode: $('btn-dark-mode'),
    btnSoundMode: $('btn-sound-mode'),
    routinePage: $('routine-page'),
    sortableRoutines: $('sortable-routines'),
    btnTennisElbow: $('btn-tennis-elbow'),
    exercisePage: $('exercise-page'),
    btnExerciseBackPill: $('btn-exercise-back-pill'),
    btnExerciseNextPill: $('btn-exercise-next-pill'),
    selectAllExercises: $('select-all-exercises'),
    selectionSummary: $('selection-summary'),
    btnStartNow: $('btn-start-now'),
    app: $('app'),
    btnAppBack: $('btn-app-back'),

    // Media
    mediaPlaceholder: $('media-placeholder'),
    mediaDisplay: $('media-display'),
    mediaInput: $('media-input'),
    mediaLottie: $('media-lottie'),
    mediaImg: $('media-img'),
    mediaVideo: $('media-video'),

    // Visuals
    repDots: $('rep-dots-container'),
    setBarTrack: $('set-bar-track'),

    // Transport
    btnPlay: $('btn-play'),
    btnReset: $('btn-reset'),
    btnSkip: $('btn-skip'),
    iconPlay: $('icon-play'),
    iconPause: $('icon-pause'),

    // Settings
    btnSetRestDec: $('btn-set-rest-dec'),
    btnSetRestInc: $('btn-set-rest-inc'),
    setRestValue: $('set-rest-value'),
    btnPaceDec: $('btn-pace-dec'),
    btnPaceInc: $('btn-pace-inc'),
    paceValue: $('pace-value'),
    toggleBeep: $('toggle-beep'),
    toggleVoice: $('toggle-voice'),
    btnAppNext: $('btn-app-next'),
  };

  // ─── LocalStorage Persistence ───
  function loadState() {
    try {
      const savedSets = localStorage.getItem('ec_totalSets');
      if (savedSets !== null) state.totalSets = parseInt(savedSets, 10);

      const savedReps = localStorage.getItem('ec_totalReps');
      if (savedReps !== null) state.totalReps = parseInt(savedReps, 10);

      const savedBeep = localStorage.getItem('ec_beepEnabled');
      if (savedBeep !== null) state.beepEnabled = savedBeep === 'true';

      const savedVoice = localStorage.getItem('ec_voiceEnabled');
      if (savedVoice !== null) state.voiceEnabled = savedVoice === 'true';

      const savedDarkMode = localStorage.getItem('ec_globalDarkMode');
      if (savedDarkMode !== null) state.globalDarkMode = savedDarkMode === 'true';

      const savedSoundMode = localStorage.getItem('ec_globalSoundMode');
      if (savedSoundMode !== null) state.globalSoundMode = savedSoundMode === 'true';
    } catch (e) {
      /* ignore storage access errors */
    }
  }

  function saveState() {
    try {
      localStorage.setItem('ec_totalSets', state.totalSets);
      localStorage.setItem('ec_totalReps', state.totalReps);
      localStorage.setItem('ec_beepEnabled', state.beepEnabled);
      localStorage.setItem('ec_voiceEnabled', state.voiceEnabled);
      localStorage.setItem('ec_globalDarkMode', state.globalDarkMode);
      localStorage.setItem('ec_globalSoundMode', state.globalSoundMode);
      scheduleRemoteProfileSave();
    } catch (e) {
      /* ignore storage access errors */
    }
  }

  const ROUTINE_ORDER_STORAGE_KEY = 'ec_routineOrder';
  const routineNameToId = {
    'TENNIS ELBOW': 'tennis-elbow',
    'CAT & COW': 'cat-cow',
    'TAI-CHI': 'tai-chi',
    'NECK RELIEF': 'neck-relief',
    'LOWER BACK': 'lower-back'
  };

  function getRoutineIdFromPill(pill) {
    if (!pill) return '';
    if (pill.dataset.routineId) return pill.dataset.routineId;
    if (pill.id === 'btn-tennis-elbow') return 'tennis-elbow';
    if (pill.id === 'btn-cat-cow') return 'cat-cow';
    if (pill.id === 'btn-tai-chi') return 'tai-chi';
    return routineNameToId[pill.innerText.trim()] || '';
  }

  function getOrderedRoutines() {
    if (!dom.sortableRoutines) return [];
    return Array.from(dom.sortableRoutines.querySelectorAll('.routine-pill')).map((pill) => ({
      name: pill.innerText.trim(),
      id: getRoutineIdFromPill(pill)
    }));
  }

  function saveRoutineOrder() {
    if (!dom.sortableRoutines) return;
    try {
      const order = getOrderedRoutines().map((routine) => routine.id).filter(Boolean);
      localStorage.setItem(ROUTINE_ORDER_STORAGE_KEY, JSON.stringify(order));
      scheduleRemoteProfileSave();
    } catch (e) {
      console.warn('Could not save routine order', e);
    }
  }

  function loadRoutineOrder() {
    if (!dom.sortableRoutines) return;
    try {
      const savedOrder = JSON.parse(localStorage.getItem(ROUTINE_ORDER_STORAGE_KEY));
      if (!Array.isArray(savedOrder)) return;

      const pills = Array.from(dom.sortableRoutines.querySelectorAll('.routine-pill'));
      const pillByRoutineId = new Map(pills.map((pill) => [getRoutineIdFromPill(pill), pill]));
      const orderedPills = savedOrder
        .map((id) => pillByRoutineId.get(id))
        .filter(Boolean);
      const remainingPills = pills.filter((pill) => !orderedPills.includes(pill));

      [...orderedPills, ...remainingPills].forEach((pill) => {
        dom.sortableRoutines.appendChild(pill);
      });
    } catch (e) {
      console.warn('Could not load routine order', e);
    }
  }

  // ─── Exercise selection defaults ───
  let exerciseDefaults = {
    // Tennis Elbow
    'extensor-stretch': { selected: false, sets: 2, reps: 8, progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    'wrist-extension': { selected: false, sets: 3, reps: 10, progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    'forearm-rotation': { selected: false, sets: 2, reps: 10, progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    'grip-squeeze': { selected: false, sets: 3, reps: 10, progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    // Cat & Cow
    'cat-cow': { selected: false, sets: 2, reps: 8, progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    'childs-pose': { selected: false, sets: 2, reps: 6, progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    'thread-needle': { selected: false, sets: 2, reps: 5, progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    'bird-dog': { selected: false, sets: 2, reps: 8, progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    'sphinx-pose': { selected: false, sets: 2, reps: 6, progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    // Tai-Chi
    'ward-off':       { selected: false, sets: 3, reps: 8,  progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    'cloud-hands':    { selected: false, sets: 3, reps: 10, progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
    'golden-rooster': { selected: false, sets: 2, reps: 6,  progressiveSets: false, progressiveReps: false, setRest: 1.0, pace: 1.0 },
  };

  let exerciseSettings = JSON.parse(JSON.stringify(exerciseDefaults));

  function getVisibleExerciseIds() {
    return Array.from(document.querySelectorAll('.exercise-card'))
      .filter((card) => card.style.display !== 'none')
      .map((card) => card.dataset.exerciseId)
      .filter(Boolean);
  }

  function sanitizeUrl(url) {
    return typeof url === 'string' ? url.trim() : '';
  }

  function createRoutineButton(routine) {
    const button = document.createElement('button');
    button.className = 'routine-pill routine-pill--named';
    button.type = 'button';
    button.dataset.routineId = routine.id;
    button.textContent = routine.name;
    return button;
  }

  function createExerciseCard(routine, exercise) {
    const card = document.createElement('article');
    card.className = 'exercise-card';
    card.dataset.routine = routine.id;
    card.dataset.exerciseId = exercise.id;
    card.style.display = 'none';

    const thumbnail = sanitizeUrl(exercise.thumbnail);
    const previewStyle = thumbnail
      ? `background-image: url('${thumbnail}'); background-size: cover; background-position: center;`
      : 'background: var(--bg-elevated);';

    card.innerHTML = `
      <label class="exercise-select">
        <input class="exercise-checkbox" type="checkbox" />
        <span class="exercise-checkmark" aria-hidden="true"></span>
        <span class="sr-only">Select ${exercise.title}</span>
      </label>
      <div class="exercise-animation-placeholder" aria-hidden="true" style="${previewStyle}"></div>
      <div class="exercise-copy">
        <h2></h2>
        <p></p>
        <div class="exercise-dosage">
          <div class="exercise-dose" data-type="sets">
            <button class="progressive-toggle-btn" type="button" data-type="sets">SETS</button>
            <button class="exercise-step-btn" type="button" data-field="sets" data-dir="-1">−</button>
            <strong data-value="sets"></strong>
            <button class="exercise-step-btn" type="button" data-field="sets" data-dir="1">+</button>
          </div>
          <div class="exercise-dose" data-type="reps">
            <button class="progressive-toggle-btn" type="button" data-type="reps">REPS</button>
            <button class="exercise-step-btn" type="button" data-field="reps" data-dir="-1">−</button>
            <strong data-value="reps"></strong>
            <button class="exercise-step-btn" type="button" data-field="reps" data-dir="1">+</button>
          </div>
        </div>
      </div>
    `;

    card.querySelector('h2').textContent = exercise.title;
    card.querySelector('p').textContent = exercise.shortDescription || '';
    card.querySelector('[data-value="sets"]').textContent = exercise.sets;
    card.querySelector('[data-value="reps"]').textContent = exercise.reps;
    return card;
  }

  function applyRemoteContent(routines) {
    if (!Array.isArray(routines) || routines.length === 0) return false;

    const nextDefaults = {};
    const nextDetails = {};
    const exerciseOptions = document.querySelector('.exercise-options');

    dom.sortableRoutines.innerHTML = '';
    if (exerciseOptions) exerciseOptions.innerHTML = '';

    routines.forEach((routine) => {
      dom.sortableRoutines.appendChild(createRoutineButton(routine));
      routine.exercises.forEach((exercise) => {
        nextDefaults[exercise.id] = {
          selected: false,
          sets: exercise.sets,
          reps: exercise.reps,
          progressiveSets: Boolean(exercise.progressiveSets),
          progressiveReps: Boolean(exercise.progressiveReps),
          setRest: exercise.setRest,
          pace: exercise.pace
        };
        nextDetails[exercise.id] = {
          title: exercise.title,
          description: exercise.description,
          alert: exercise.alert,
          images: exercise.images,
          lottieUrl: exercise.lottieUrl
        };
        if (exerciseOptions) {
          exerciseOptions.appendChild(createExerciseCard(routine, exercise));
        }
      });
    });

    exerciseDefaults = nextDefaults;
    exerciseDetails = nextDetails;
    exerciseSettings = JSON.parse(JSON.stringify(exerciseDefaults));
    return true;
  }

  async function fetchRemoteContent() {
    if (!supabaseClient) return false;

    const { data: routines, error: routineError } = await supabaseClient
      .from('routines')
      .select('id, slug, title, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (routineError) {
      console.warn('Could not load routines from Supabase', routineError);
      return false;
    }
    if (!routines || routines.length === 0) return false;

    const routineIds = routines.map((routine) => routine.id);
    const { data: exercises, error: exerciseError } = await supabaseClient
      .from('exercises')
      .select('id, routine_id, slug, title, short_description, long_description, safety_alert, thumbnail_url, default_sets, default_reps, progressive_sets, progressive_reps, set_rest_seconds, pace_seconds, lottie_url, sort_order')
      .in('routine_id', routineIds)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (exerciseError) {
      console.warn('Could not load exercises from Supabase', exerciseError);
      return false;
    }

    const exerciseIds = (exercises || []).map((exercise) => exercise.id);
    let images = [];
    if (exerciseIds.length > 0) {
      const { data, error } = await supabaseClient
        .from('exercise_images')
        .select('exercise_id, image_url, sort_order')
        .in('exercise_id', exerciseIds)
        .order('sort_order', { ascending: true });
      if (error) {
        console.warn('Could not load exercise images from Supabase', error);
      } else {
        images = data || [];
      }
    }

    const routineSlugById = new Map(routines.map((routine) => [routine.id, routine.slug]));
    const imagesByExerciseId = new Map();
    images.forEach((image) => {
      const list = imagesByExerciseId.get(image.exercise_id) || [];
      list.push(image.image_url);
      imagesByExerciseId.set(image.exercise_id, list);
    });

    const remoteRoutines = routines.map((routine) => ({
      id: routine.slug,
      name: routine.title,
      exercises: []
    }));
    const remoteRoutineBySlug = new Map(remoteRoutines.map((routine) => [routine.id, routine]));

    (exercises || []).forEach((exercise) => {
      const routineSlug = routineSlugById.get(exercise.routine_id);
      const routine = remoteRoutineBySlug.get(routineSlug);
      if (!routine) return;

      const imageList = imagesByExerciseId.get(exercise.id) || [];
      routine.exercises.push({
        id: exercise.slug,
        title: exercise.title,
        shortDescription: exercise.short_description,
        description: exercise.long_description || exercise.short_description || '',
        alert: exercise.safety_alert || '',
        thumbnail: exercise.thumbnail_url || imageList[0] || '',
        images: imageList,
        lottieUrl: exercise.lottie_url || '',
        sets: Number(exercise.default_sets) || 1,
        reps: Number(exercise.default_reps) || 1,
        progressiveSets: Boolean(exercise.progressive_sets),
        progressiveReps: Boolean(exercise.progressive_reps),
        setRest: Number(exercise.set_rest_seconds) || 1,
        pace: Number(exercise.pace_seconds) || 1
      });
    });

    const applied = applyRemoteContent(remoteRoutines);
    if (applied) window.EXERCISE_CLOCK_DATA_SOURCE = 'supabase';
    return applied;
  }

  function loadExerciseSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('ec_tennisElbowExercises'));
      if (!saved || typeof saved !== 'object') return;
      
      Object.keys(exerciseSettings).forEach((id) => {
        if (saved[id] && typeof saved[id] === 'object') {
          // Explicitly coerce to ensure we don't accidentally load strings or NaNs
          exerciseSettings[id].selected = Boolean(saved[id].selected);
          
          if (saved[id].progressiveSets !== undefined) exerciseSettings[id].progressiveSets = Boolean(saved[id].progressiveSets);
          if (saved[id].progressiveReps !== undefined) exerciseSettings[id].progressiveReps = Boolean(saved[id].progressiveReps);
          
          const savedSets = parseInt(saved[id].sets, 10);
          if (!isNaN(savedSets)) exerciseSettings[id].sets = savedSets;
          
          const savedReps = parseInt(saved[id].reps, 10);
          if (!isNaN(savedReps)) exerciseSettings[id].reps = savedReps;

          exerciseSettings[id].setRest = 1.0;
          exerciseSettings[id].pace = 1.0;
        }
      });
    } catch (e) {
      console.warn('Could not load exercise settings', e);
    }
  }

  function saveExerciseSettings() {
    try {
      localStorage.setItem('ec_tennisElbowExercises', JSON.stringify(exerciseSettings));
      scheduleRemoteProfileSave();
    } catch (e) {
      console.warn('Could not save exercise settings', e);
    }
  }

  function getProfilePayload() {
    return {
      app_state: {
        totalSets: state.totalSets,
        totalReps: state.totalReps,
        beepEnabled: state.beepEnabled,
        voiceEnabled: state.voiceEnabled,
        globalDarkMode: state.globalDarkMode,
        globalSoundMode: state.globalSoundMode
      },
      exercise_settings: exerciseSettings,
      routine_order: getOrderedRoutines().map((routine) => routine.id).filter(Boolean)
    };
  }

  function applyProfilePayload(profile) {
    if (!profile) return;

    const appState = profile.app_state || {};
    if (appState.totalSets !== undefined) state.totalSets = Number(appState.totalSets) || state.totalSets;
    if (appState.totalReps !== undefined) state.totalReps = Number(appState.totalReps) || state.totalReps;
    if (appState.beepEnabled !== undefined) state.beepEnabled = Boolean(appState.beepEnabled);
    if (appState.voiceEnabled !== undefined) state.voiceEnabled = Boolean(appState.voiceEnabled);
    if (appState.globalDarkMode !== undefined) state.globalDarkMode = Boolean(appState.globalDarkMode);
    if (appState.globalSoundMode !== undefined) state.globalSoundMode = Boolean(appState.globalSoundMode);

    if (profile.exercise_settings && typeof profile.exercise_settings === 'object') {
      Object.keys(exerciseSettings).forEach((id) => {
        if (profile.exercise_settings[id]) {
          exerciseSettings[id] = {
            ...exerciseSettings[id],
            ...profile.exercise_settings[id],
            selected: Boolean(profile.exercise_settings[id].selected)
          };
        }
      });
    }

    if (Array.isArray(profile.routine_order)) {
      localStorage.setItem(ROUTINE_ORDER_STORAGE_KEY, JSON.stringify(profile.routine_order));
      loadRoutineOrder();
    }
  }

  async function saveRemoteProfile() {
    if (!supabaseClient || !currentUser) return;

    const payload = getProfilePayload();
    const { error } = await supabaseClient
      .from('user_settings')
      .upsert({
        user_id: currentUser.id,
        app_state: payload.app_state,
        exercise_settings: payload.exercise_settings,
        routine_order: payload.routine_order,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) console.warn('Could not save user settings to Supabase', error);
  }

  function scheduleRemoteProfileSave() {
    if (!supabaseClient || !currentUser) return;
    clearTimeout(remoteSaveTimerId);
    remoteSaveTimerId = setTimeout(saveRemoteProfile, 500);
  }

  async function loadRemoteProfile() {
    if (!supabaseClient || !currentUser) return;

    const { data, error } = await supabaseClient
      .from('user_settings')
      .select('app_state, exercise_settings, routine_order')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.warn('Could not load user settings from Supabase', error);
      return;
    }

    if (data) {
      applyProfilePayload(data);
    } else {
      await saveRemoteProfile();
    }
  }

  async function ensureUserProfile() {
    if (!supabaseClient || !currentUser) return;

    const metadata = currentUser.user_metadata || {};
    await supabaseClient
      .from('profiles')
      .upsert({
        user_id: currentUser.id,
        display_name: metadata.full_name || metadata.name || '',
        avatar_url: metadata.avatar_url || '',
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
  }

  function setAdminStatus(message) {
    const el = document.getElementById('admin-status');
    if (el) el.textContent = message || '';
  }

  function updateAdminButton() {
    const button = document.getElementById('btn-admin-mode');
    if (!button) return;
    button.hidden = !isAdmin;
  }

  async function checkAdminStatus() {
    isAdmin = false;
    if (!supabaseClient || !currentUser) {
      updateAdminButton();
      return false;
    }

    const { data, error } = await supabaseClient
      .from('admin_users')
      .select('user_id')
      .eq('user_id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.warn('Could not check admin status', error);
      updateAdminButton();
      return false;
    }

    isAdmin = Boolean(data);
    updateAdminButton();
    return isAdmin;
  }

  function createAdminShell() {
    if (document.getElementById('admin-modal')) return;

    const adminButton = document.createElement('button');
    adminButton.id = 'btn-admin-mode';
    adminButton.className = 'admin-open-btn';
    adminButton.type = 'button';
    adminButton.hidden = true;
    adminButton.textContent = 'ADMIN';
    dom.routinePage.appendChild(adminButton);

    const modal = document.createElement('div');
    modal.id = 'admin-modal';
    modal.className = 'modal-overlay admin-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-content admin-modal-content">
        <div class="admin-header">
          <div>
            <p class="admin-kicker">ADMIN</p>
            <h2>Content Editor</h2>
          </div>
          <button id="btn-close-admin" class="admin-icon-btn" type="button" aria-label="Close admin editor">×</button>
        </div>
        <p id="admin-status" class="admin-status"></p>
        <div class="admin-actions-row">
          <button id="btn-admin-refresh" class="admin-secondary-btn" type="button">Refresh</button>
        </div>
        <section class="admin-section">
          <h3>Menu Routines</h3>
          <div id="admin-routines-list" class="admin-list"></div>
        </section>
        <section class="admin-section">
          <h3>Routine Exercises</h3>
          <label class="admin-field">
            <span>Show routine</span>
            <select id="admin-routine-filter"></select>
          </label>
          <div id="admin-exercises-list" class="admin-list"></div>
        </section>
      </div>
    `;
    document.body.appendChild(modal);

    adminButton.addEventListener('click', openAdminEditor);
    document.getElementById('btn-close-admin').addEventListener('click', closeAdminEditor);
    document.getElementById('btn-admin-refresh').addEventListener('click', openAdminEditor);
    document.getElementById('admin-routine-filter').addEventListener('change', renderAdminExercises);
    document.getElementById('admin-modal').addEventListener('submit', handleAdminSubmit);
    document.getElementById('admin-modal').addEventListener('click', handleAdminClick);
  }

  function closeAdminEditor() {
    document.getElementById('admin-modal')?.setAttribute('aria-hidden', 'true');
  }

  async function openAdminEditor() {
    if (!isAdmin) return;
    document.getElementById('admin-modal')?.setAttribute('aria-hidden', 'false');
    try {
      setAdminStatus('Loading editor...');
      await loadAdminData();
      renderAdminEditor();
      setAdminStatus('Ready.');
    } catch (error) {
      console.error(error);
      setAdminStatus(error.message || 'Could not load admin editor.');
    }
  }

  async function loadAdminData() {
    if (!supabaseClient || !isAdmin) return;

    const [routinesResult, exercisesResult] = await Promise.all([
      supabaseClient
        .from('routines')
        .select('id, slug, title, sort_order, is_active')
        .order('sort_order', { ascending: true }),
      supabaseClient
        .from('exercises')
        .select('id, routine_id, slug, title, short_description, long_description, safety_alert, thumbnail_url, default_sets, default_reps, sort_order, is_active')
        .order('sort_order', { ascending: true })
    ]);

    if (routinesResult.error) throw routinesResult.error;
    if (exercisesResult.error) throw exercisesResult.error;

    adminRoutines = routinesResult.data || [];
    adminExercises = exercisesResult.data || [];
  }

  function renderAdminEditor() {
    renderAdminRoutines();
    renderAdminRoutineFilter();
    renderAdminExercises();
  }

  function renderAdminRoutines() {
    const list = document.getElementById('admin-routines-list');
    if (!list) return;
    list.innerHTML = '';

    adminRoutines.forEach((routine) => {
      const card = document.createElement('form');
      card.className = `admin-edit-card${routine.is_active ? '' : ' is-inactive'}`;
      card.dataset.kind = 'routine';
      card.dataset.id = routine.id;
      card.innerHTML = `
        <div class="admin-card-title">
          <strong></strong>
          <span></span>
        </div>
        <label class="admin-field">
          <span>Menu title</span>
          <input name="title" type="text" required />
        </label>
        <div class="admin-grid">
          <label class="admin-field">
            <span>Slug</span>
            <input name="slug" type="text" readonly />
          </label>
          <label class="admin-field">
            <span>Order</span>
            <input name="sort_order" type="number" step="1" />
          </label>
        </div>
        <label class="admin-check-row">
          <input name="is_active" type="checkbox" />
          <span>Visible in menu</span>
        </label>
        <div class="admin-card-actions">
          <button class="admin-secondary-btn" type="button" data-action="toggle-routine"></button>
          <button class="admin-save-btn" type="submit">Save Routine</button>
        </div>
      `;
      card.querySelector('strong').textContent = routine.title;
      card.querySelector('.admin-card-title span').textContent = routine.is_active ? 'Visible' : 'Hidden';
      card.querySelector('[name="title"]').value = routine.title;
      card.querySelector('[name="slug"]').value = routine.slug;
      card.querySelector('[name="sort_order"]').value = routine.sort_order;
      card.querySelector('[name="is_active"]').checked = routine.is_active;
      card.querySelector('[data-action="toggle-routine"]').textContent = routine.is_active ? 'Hide' : 'Show';
      list.appendChild(card);
    });
  }

  function renderAdminRoutineFilter() {
    const select = document.getElementById('admin-routine-filter');
    if (!select) return;
    const previous = select.value || 'all';
    select.innerHTML = '<option value="all">All routines</option>';
    adminRoutines.forEach((routine) => {
      const option = document.createElement('option');
      option.value = routine.id;
      option.textContent = routine.title;
      select.appendChild(option);
    });
    select.value = adminRoutines.some((routine) => routine.id === previous) ? previous : 'all';
  }

  function renderAdminExercises() {
    const list = document.getElementById('admin-exercises-list');
    const filter = document.getElementById('admin-routine-filter')?.value || 'all';
    if (!list) return;
    list.innerHTML = '';

    const routineById = new Map(adminRoutines.map((routine) => [routine.id, routine]));
    const filteredExercises = adminExercises.filter((exercise) => {
      return filter === 'all' || exercise.routine_id === filter;
    });

    filteredExercises.forEach((exercise) => {
      const routine = routineById.get(exercise.routine_id);
      const card = document.createElement('form');
      card.className = `admin-edit-card${exercise.is_active ? '' : ' is-inactive'}`;
      card.dataset.kind = 'exercise';
      card.dataset.id = exercise.id;
      card.innerHTML = `
        <div class="admin-card-title">
          <strong></strong>
          <span></span>
        </div>
        <label class="admin-field">
          <span>Exercise title</span>
          <input name="title" type="text" required />
        </label>
        <div class="admin-grid">
          <label class="admin-field">
            <span>Routine</span>
            <select name="routine_id"></select>
          </label>
          <label class="admin-field">
            <span>Order</span>
            <input name="sort_order" type="number" step="1" />
          </label>
        </div>
        <label class="admin-field">
          <span>Short card description</span>
          <textarea name="short_description" rows="2"></textarea>
        </label>
        <label class="admin-field">
          <span>Full detail description</span>
          <textarea name="long_description" rows="4"></textarea>
        </label>
        <label class="admin-field">
          <span>Safety alert</span>
          <textarea name="safety_alert" rows="2"></textarea>
        </label>
        <label class="admin-field">
          <span>Thumbnail URL</span>
          <input name="thumbnail_url" type="text" />
        </label>
        <div class="admin-grid">
          <label class="admin-field">
            <span>Default sets</span>
            <input name="default_sets" type="number" min="1" step="1" />
          </label>
          <label class="admin-field">
            <span>Default reps</span>
            <input name="default_reps" type="number" min="1" step="1" />
          </label>
        </div>
        <label class="admin-check-row">
          <input name="is_active" type="checkbox" />
          <span>Visible in routine</span>
        </label>
        <div class="admin-card-actions">
          <button class="admin-secondary-btn" type="button" data-action="toggle-exercise"></button>
          <button class="admin-save-btn" type="submit">Save Exercise</button>
        </div>
      `;

      const routineSelect = card.querySelector('[name="routine_id"]');
      adminRoutines.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.title;
        routineSelect.appendChild(option);
      });

      card.querySelector('strong').textContent = exercise.title;
      card.querySelector('.admin-card-title span').textContent = `${routine?.title || 'No routine'} · ${exercise.is_active ? 'Visible' : 'Hidden'}`;
      card.querySelector('[name="title"]').value = exercise.title;
      routineSelect.value = exercise.routine_id;
      card.querySelector('[name="sort_order"]').value = exercise.sort_order;
      card.querySelector('[name="short_description"]').value = exercise.short_description || '';
      card.querySelector('[name="long_description"]').value = exercise.long_description || '';
      card.querySelector('[name="safety_alert"]').value = exercise.safety_alert || '';
      card.querySelector('[name="thumbnail_url"]').value = exercise.thumbnail_url || '';
      card.querySelector('[name="default_sets"]').value = exercise.default_sets;
      card.querySelector('[name="default_reps"]').value = exercise.default_reps;
      card.querySelector('[name="is_active"]').checked = exercise.is_active;
      card.querySelector('[data-action="toggle-exercise"]').textContent = exercise.is_active ? 'Hide' : 'Show';
      list.appendChild(card);
    });
  }

  async function handleAdminSubmit(e) {
    const form = e.target.closest('.admin-edit-card');
    if (!form) return;
    e.preventDefault();

    try {
      setAdminStatus('Saving...');
      if (form.dataset.kind === 'routine') {
        await saveAdminRoutine(form);
      } else if (form.dataset.kind === 'exercise') {
        await saveAdminExercise(form);
      }
      await refreshContentAfterAdminSave();
      setAdminStatus('Saved.');
    } catch (error) {
      console.error(error);
      setAdminStatus(error.message || 'Could not save changes.');
    }
  }

  async function handleAdminClick(e) {
    const button = e.target.closest('[data-action]');
    if (!button) return;
    const form = button.closest('.admin-edit-card');
    if (!form) return;

    try {
      setAdminStatus('Updating visibility...');
      if (button.dataset.action === 'toggle-routine') {
        const routine = adminRoutines.find((item) => item.id === form.dataset.id);
        const { error } = await supabaseClient.from('routines').update({
          is_active: !routine.is_active,
          updated_at: new Date().toISOString()
        }).eq('id', form.dataset.id);
        if (error) throw error;
      } else if (button.dataset.action === 'toggle-exercise') {
        const exercise = adminExercises.find((item) => item.id === form.dataset.id);
        const { error } = await supabaseClient.from('exercises').update({
          is_active: !exercise.is_active,
          updated_at: new Date().toISOString()
        }).eq('id', form.dataset.id);
        if (error) throw error;
      }
      await refreshContentAfterAdminSave();
      setAdminStatus('Visibility updated.');
    } catch (error) {
      console.error(error);
      setAdminStatus(error.message || 'Could not update visibility.');
    }
  }

  async function saveAdminRoutine(form) {
    const payload = {
      title: form.elements.title.value.trim(),
      sort_order: parseInt(form.elements.sort_order.value, 10) || 0,
      is_active: form.elements.is_active.checked,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from('routines')
      .update(payload)
      .eq('id', form.dataset.id);
    if (error) throw error;
  }

  async function saveAdminExercise(form) {
    const payload = {
      routine_id: form.elements.routine_id.value,
      title: form.elements.title.value.trim(),
      short_description: form.elements.short_description.value.trim(),
      long_description: form.elements.long_description.value.trim(),
      safety_alert: form.elements.safety_alert.value.trim(),
      thumbnail_url: form.elements.thumbnail_url.value.trim(),
      default_sets: Math.max(1, parseInt(form.elements.default_sets.value, 10) || 1),
      default_reps: Math.max(1, parseInt(form.elements.default_reps.value, 10) || 1),
      sort_order: parseInt(form.elements.sort_order.value, 10) || 0,
      is_active: form.elements.is_active.checked,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabaseClient
      .from('exercises')
      .update(payload)
      .eq('id', form.dataset.id);
    if (error) throw error;
  }

  async function refreshContentAfterAdminSave() {
    await loadAdminData();
    renderAdminEditor();
    await fetchRemoteContent();
    loadExerciseSettings();
    renderExerciseSettings();
  }

  // ─── Estimate total workout time ───
  function calculateTotalTime() {
    const visibleIds = getVisibleExerciseIds();
    const selectedIds = visibleIds.filter(id => exerciseSettings[id]?.selected);
    if (selectedIds.length === 0) return 0;

    let totalSeconds = 0;
    selectedIds.forEach(id => {
      const config = exerciseSettings[id];
      // sets × reps × pace + rest intervals between sets
      totalSeconds += config.sets * config.reps * config.pace
                    + Math.max(0, config.sets - 1) * config.setRest;
    });

    // 60-second break between each exercise (if 2 or more selected)
    if (selectedIds.length >= 2) {
      totalSeconds += (selectedIds.length - 1) * 60;
    }

    return totalSeconds;
  }

  // ─── Update exercise duration display in timer page ───
  function updateTimerDuration() {
    const el = document.getElementById('timer-duration-text');
    if (!el) return;
    const config = getCurrentExerciseConfig();
    if (!config) { el.textContent = '—'; return; }

    const rawSecs = config.sets * config.reps * config.pace
               + Math.max(0, config.sets - 1) * config.setRest;
    const secs = rawSecs * 1.2; // +20% buffer

    let label;
    if (secs < 60) {
      label = `ESTIMATED TIME · ~${Math.round(secs)}s`;
    } else {
      const mins = Math.round(secs / 60);
      label = `ESTIMATED TIME · ~${mins} min`;
    }
    el.textContent = label;
  }

  function renderExerciseSettings() {
    let selectedCount = 0;
    let visibleCardsCount = 0;
    const cards = Array.from(document.querySelectorAll('.exercise-card'));
    
    cards.forEach((card) => {
      if (card.style.display === 'none') return;
      visibleCardsCount++;
      const id = card.dataset.exerciseId;
      if (!exerciseSettings[id]) return;
      
      const config = exerciseSettings[id];
      const checkbox = card.querySelector('.exercise-checkbox');
      
      if (checkbox) checkbox.checked = config.selected;
      if (config.selected) {
        card.classList.add('is-selected');
        selectedCount++;
      } else {
        card.classList.remove('is-selected');
      }

      const setsEl = card.querySelector('[data-value="sets"]');
      const repsEl = card.querySelector('[data-value="reps"]');
      if (setsEl) setsEl.textContent = config.sets;
      if (repsEl) repsEl.textContent = config.reps;
    });

    dom.selectAllExercises.checked = visibleCardsCount > 0 && selectedCount === visibleCardsCount;
    dom.selectAllExercises.indeterminate = selectedCount > 0 && selectedCount < visibleCardsCount;
    dom.btnStartNow.disabled = selectedCount === 0;
    dom.selectionSummary.textContent = selectedCount === 0
      ? 'SELECT AT LEAST ONE EXERCISE'
      : `${selectedCount} EXERCISE${selectedCount === 1 ? '' : 'S'} SELECTED`;

    // Update START button label with estimated time
    if (selectedCount === 0) {
      dom.btnStartNow.textContent = 'START';
    } else {
      const totalSecs = calculateTotalTime() * 1.2; // +20% buffer
      const totalMins = Math.max(1, Math.round(totalSecs / 60));
      dom.btnStartNow.textContent = `START — ${totalMins} min`;
    }
  }

  function openExercisePage(routineName, routineId) {
    document.getElementById('exercise-page-title').innerText = routineName;
    const cards = Array.from(document.querySelectorAll('.exercise-card'));
    cards.forEach(card => {
      if (card.dataset.routine === routineId) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
    renderExerciseSettings();
    
    dom.routinePage.classList.remove('is-active');
    dom.routinePage.setAttribute('aria-hidden', 'true');
    dom.exercisePage.classList.add('is-active');
    dom.exercisePage.setAttribute('aria-hidden', 'false');
  }

  function closeExercisePage() {
    dom.exercisePage.classList.remove('is-active');
    dom.exercisePage.setAttribute('aria-hidden', 'true');
    dom.routinePage.classList.add('is-active');
    dom.routinePage.setAttribute('aria-hidden', 'false');
  }

  function returnToMainMenu() {
    resetAll();
    dom.app.setAttribute('aria-hidden', 'true');
    closeExercisePage();
    releaseWakeLock();
  }

  // Goes back to the exercise card list (routine page) without going all the way to the menu
  function returnToExercisePage() {
    pauseTimer();
    releaseWakeLock();
    dom.app.setAttribute('aria-hidden', 'true');
    dom.exercisePage.classList.add('is-active');
    dom.exercisePage.setAttribute('aria-hidden', 'false');
    dom.routinePage.classList.remove('is-active');
    dom.routinePage.setAttribute('aria-hidden', 'true');
  }

  function handleExerciseSelection(e) {
    const checkbox = e.target.closest('.exercise-checkbox');
    if (!checkbox) return;
    const card = checkbox.closest('.exercise-card');
    exerciseSettings[card.dataset.exerciseId].selected = checkbox.checked;
    saveExerciseSettings();
    renderExerciseSettings();
  }

  function handleExerciseStepper(e) {
    const btn = e.target.closest('.exercise-step-btn');
    if (!btn) return;
    const card = btn.closest('.exercise-card');
    const config = exerciseSettings[card.dataset.exerciseId];
    const field = btn.dataset.field;
    const maximum = field === 'sets' ? 10 : 99;
    config[field] = Math.min(maximum, Math.max(1, config[field] + parseInt(btn.dataset.dir, 10)));
    saveExerciseSettings();
    renderExerciseSettings();
  }

  function handleProgressiveToggle(e) {
    const btn = e.target.closest('.progressive-toggle-btn');
    if (!btn) return;
    const card = btn.closest('.exercise-card');
    const config = exerciseSettings[card.dataset.exerciseId];
    const type = btn.dataset.type;
    
    if (type === 'sets') {
      config.progressiveSets = !config.progressiveSets;
    } else if (type === 'reps') {
      config.progressiveReps = !config.progressiveReps;
    }
    
    saveExerciseSettings();
    renderExerciseSettings();
  }

  // ─── Voice / Speech Synthesis ───
  function ensureSpeech() {
    try {
      if (window.speechSynthesis) {
        // Speak an empty string to unlock/prime TTS engine on mobile/iOS
        const u = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(u);
        // Pre-fetch voices
        window.speechSynthesis.getVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
        }
      }
    } catch (e) {}
  }

  function speak(text) {
    if (!state.voiceEnabled) return;
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Cancel ongoing to speak immediately
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0; // Normal speed for natural voices
        
        // Try to pick a natural-sounding voice
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          // Look for premium/enhanced voices or specific known good ones
          let bestVoice = voices.find(v => v.name.includes('Premium') || v.name.includes('Enhanced')) ||
                          voices.find(v => v.name.includes('Samantha') || v.name.includes('Google US English') || v.name.includes('Daniel') || v.name.includes('Karen')) ||
                          voices.find(v => v.lang.startsWith('en-'));
          if (bestVoice) {
            utterance.voice = bestVoice;
          }
        }
        
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      /* silently fail */
    }
  }

  // ─── Audio context for beep ───
  let audioCtx = null;

  function ensureAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playBeep(frequency = 660, duration = 80) {
    if (!state.beepEnabled) return;
    try {
      ensureAudioCtx();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration / 1000);
    } catch (e) {
      /* silently fail if audio not available */
    }
  }

  function playSetBeep() {
    if (!state.beepEnabled) return;
    playBeep(880, 150);
  }

  function playDoneBeep() {
    if (!state.beepEnabled) return;
    try {
      ensureAudioCtx();
      [0, 150, 300].forEach((delay, i) => {
        setTimeout(() => playBeep(660 + i * 220, 120), delay);
      });
    } catch (e) {
      /* silently fail */
    }
  }

  // ─── Render helpers ───
  function renderRepDots() {
    dom.repDots.innerHTML = '';
    for (let i = 1; i <= state.totalReps; i++) {
      const dot = document.createElement('div');
      dot.className = 'rep-dot';
      dot.textContent = i;
      dot.dataset.index = i;
      dom.repDots.appendChild(dot);
    }
    updateRepDots();
  }

  function updateRepDots() {
    const dots = dom.repDots.querySelectorAll('.rep-dot');
    dots.forEach((dot) => {
      const idx = parseInt(dot.dataset.index, 10);
      dot.classList.remove('completed', 'current');
      if (idx < state.currentRep) {
        dot.classList.add('completed');
      } else if (idx === state.currentRep) {
        dot.classList.add('current');
      }
    });
  }

  function renderSetBar() {
    dom.setBarTrack.innerHTML = '';
    for (let i = 0; i < state.totalSets; i++) {
      const seg = document.createElement('div');
      seg.className = 'set-bar-segment';
      seg.dataset.index = i;
      dom.setBarTrack.appendChild(seg);
    }
    updateSetBar();
  }

  function updateSetBar() {
    const segs = dom.setBarTrack.querySelectorAll('.set-bar-segment');
    segs.forEach((seg) => {
      const idx = parseInt(seg.dataset.index, 10);
      seg.classList.remove('completed', 'current');
      if (idx < state.currentSet) {
        seg.classList.add('completed');
      } else if (idx === state.currentSet && !state.isFinished) {
        seg.classList.add('current');
      }
    });
  }

  function updateCounterDisplay() {
    // Show progressive pace while running, otherwise base pace
    const currentPace = getCurrentPace();
    if (state.isRunning && !state.isFinished) {
      dom.paceValue.textContent = currentPace.toFixed(2) + 's';
    } else {
      const config = getCurrentExerciseConfig() || { pace: 1.0 };
      dom.paceValue.textContent = config.pace.toFixed(2) + 's';
    }
  }

  function updatePlayButton() {
    dom.iconPlay.classList.toggle('hidden', state.isRunning);
    dom.iconPause.classList.toggle('hidden', !state.isRunning);
  }

  function disableSettingsWhileRunning() {
    const disable = state.isRunning;
    dom.btnSetRestDec.disabled = disable;
    dom.btnSetRestInc.disabled = disable;
    dom.btnPaceDec.disabled = disable;
    dom.btnPaceInc.disabled = disable;
  }

  function fullRender() {
    renderRepDots();
    renderSetBar();
    updateCounterDisplay();
    updatePlayButton();
    disableSettingsWhileRunning();
  }

  // ─── Timer logic ───
  function tick() {
    if (!state.isRunning) return;

    state.currentRep++;

    if (state.currentRep > state.totalReps) {
      // Set finished
      state.currentRep = state.totalReps; // show last rep completed
      updateCounterDisplay();
      updateRepDots();

      state.currentSet++;
      updateSetBar();

      if (state.currentSet >= state.totalSets) {
        if (state.currentExerciseIndex < state.selectedExercises.length - 1) {
          // Go to next exercise
          state.currentExerciseIndex++;
          loadCurrentExercise();
          startTimer();
          return;
        } else {
          // All done!
          state.isRunning = false;
          state.isFinished = true;
          updatePlayButton();
          disableSettingsWhileRunning();
          updateCounterDisplay();
          updateSetBar();
          playDoneBeep();
          speak("Workout Complete!");
          showCompletionOverlay();
          return;
        }
      }

      // Brief pause between sets, then start next
      playSetBeep();
      const nextSetLetter = ALPHA[state.currentSet] || (state.currentSet + 1);
      speak(nextSetLetter.toString().toLowerCase());

      state.currentRep = 0;
      updateCounterDisplay();
      updateRepDots();

      // Small delay before next set starts
      state.timerId = setTimeout(() => {
        if (!state.isRunning) return;
        tick();
      }, getCurrentSetRest() * 1000);
      return;
    }

    playBeep();
    updateCounterDisplay();
    updateRepDots();
    speak(state.currentRep.toString());

    state.timerId = setTimeout(() => {
      if (!state.isRunning) return;
      tick();
    }, getCurrentPace() * 1000);
  }

  function startTimer() {
    if (state.isFinished) {
      resetAll();
    }

    state.isRunning = true;
    dom.mediaLottie.play?.();
    updatePlayButton();
    disableSettingsWhileRunning();

    if (state.currentRep === 0) {
      const currentSetLetter = ALPHA[state.currentSet] || (state.currentSet + 1);
      speak(currentSetLetter.toString().toLowerCase());

      // Natural pacing delay before counting the first rep
      state.timerId = setTimeout(() => {
        if (!state.isRunning) return;
        tick();
      }, getCurrentSetRest() * 1000);
    } else {
      // Resuming mid-set: tick immediately
      tick();
    }
  }

  function pauseTimer() {
    state.isRunning = false;
    dom.mediaLottie.pause?.();
    clearTimeout(state.timerId);
    updatePlayButton();
    disableSettingsWhileRunning();
  }

  function resetAll() {
    pauseTimer();
    state.currentSet = 0;
    state.currentRep = 0;
    state.isFinished = false;
    hideCompletionOverlay();
    fullRender();
  }

  function skipToNextSet() {
    if (state.isFinished) return;

    const wasRunning = state.isRunning;
    if (wasRunning) pauseTimer();

    state.currentSet++;
    state.currentRep = 0;

    if (state.currentSet >= state.totalSets) {
      if (state.currentExerciseIndex < state.selectedExercises.length - 1) {
        state.currentExerciseIndex++;
        loadCurrentExercise();
        if (wasRunning) {
          startTimer();
        } else {
          fullRender();
        }
        return;
      } else {
        state.currentSet = state.totalSets;
        state.isFinished = true;
        state.isRunning = false;
        fullRender();
        playDoneBeep();
        showCompletionOverlay();
        return;
      }
    }

    fullRender();

    if (wasRunning) {
      startTimer();
    }
  }

  // ─── Completion overlay ───
  function createCompletionOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'completion-overlay';
    overlay.innerHTML = `
      <div class="done-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0f1117" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <div class="done-text">Workout Complete!</div>
      <div class="done-sub" id="done-summary"></div>
      <div class="done-actions">
        <button id="btn-done-repeat">Repeat</button>
        <button id="btn-done-restart">Restart</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('btn-done-repeat').addEventListener('click', () => {
      resetAll();
      dom.app.setAttribute('aria-hidden', 'true');
      dom.exercisePage.classList.remove('is-leaving');
      dom.exercisePage.classList.add('is-active');
      dom.exercisePage.setAttribute('aria-hidden', 'false');
    });

    document.getElementById('btn-done-restart').addEventListener('click', () => {
      resetAll();
      dom.app.setAttribute('aria-hidden', 'true');
      dom.routinePage.classList.remove('is-leaving');
      dom.routinePage.classList.add('is-active');
      dom.routinePage.setAttribute('aria-hidden', 'false');
    });
  }

  function showCompletionOverlay() {
    const overlay = document.getElementById('completion-overlay');
    const summary = document.getElementById('done-summary');
    const config = getCurrentExerciseConfig() || { pace: 1.0, progressiveReps: false };
    const startPace = config.pace;
    const endPace = config.progressiveReps && state.totalSets > 1 
      ? startPace * Math.pow(1.1, state.totalSets - 1)
      : startPace;
      
    const paceText = endPace > startPace
      ? `${startPace.toFixed(1)}s–${endPace.toFixed(1)}s pace`
      : `${startPace.toFixed(1)}s pace`;
    summary.textContent = `${state.totalSets} sets × ${state.totalReps} reps at ${paceText}`;
    requestAnimationFrame(() => overlay.classList.add('show'));
  }

  function hideCompletionOverlay() {
    const overlay = document.getElementById('completion-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  // ─── Media handling ───
  function handleMediaUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);

    if (file.type.startsWith('video/')) {
      dom.mediaLottie.classList.add('hidden');
      dom.mediaLottie.pause?.();
      dom.mediaImg.classList.add('hidden');
      dom.mediaVideo.classList.remove('hidden');
      dom.mediaVideo.src = url;
      dom.mediaVideo.play().catch(() => {});
    } else {
      dom.mediaLottie.classList.add('hidden');
      dom.mediaLottie.pause?.();
      dom.mediaVideo.classList.add('hidden');
      dom.mediaImg.classList.remove('hidden');
      dom.mediaImg.src = url;
    }

    dom.mediaPlaceholder.classList.add('hidden');
    dom.mediaDisplay.classList.remove('hidden');
  }

  function removeMedia() {
    dom.mediaLottie.pause?.();
    dom.mediaLottie.removeAttribute('src');
    dom.mediaLottie.classList.add('hidden');
    if (dom.mediaImg.src) URL.revokeObjectURL(dom.mediaImg.src);
    if (dom.mediaVideo.src) URL.revokeObjectURL(dom.mediaVideo.src);
    dom.mediaImg.src = '';
    dom.mediaImg.classList.add('hidden');
    dom.mediaVideo.pause();
    dom.mediaVideo.src = '';
    dom.mediaVideo.classList.add('hidden');
    dom.mediaDisplay.classList.add('hidden');
    dom.mediaPlaceholder.classList.remove('hidden');
    dom.mediaInput.value = '';
  }

  // ─── Settings handlers ───
  // ─── Settings handlers ───
  function updateSetRestUI() {
    const config = getCurrentExerciseConfig();
    if (config) {
      dom.setRestValue.textContent = config.setRest.toFixed(2) + 's';
    }
  }

  function updatePaceUI() {
    const config = getCurrentExerciseConfig();
    if (config) {
      dom.paceValue.textContent = config.pace.toFixed(2) + 's';
    }
  }

  dom.btnSetRestDec.addEventListener('click', () => {
    if (state.isRunning) return;
    const config = getCurrentExerciseConfig();
    if (config && config.setRest > 0.5) {
      config.setRest = Math.max(0.5, config.setRest - 0.25);
      saveExerciseSettings();
      updateSetRestUI();
    }
  });

  dom.btnSetRestInc.addEventListener('click', () => {
    if (state.isRunning) return;
    const config = getCurrentExerciseConfig();
    if (config && config.setRest < 5.0) {
      config.setRest = Math.min(5.0, config.setRest + 0.25);
      saveExerciseSettings();
      updateSetRestUI();
    }
  });

  dom.btnPaceDec.addEventListener('click', () => {
    if (state.isRunning) return;
    const config = getCurrentExerciseConfig();
    if (config && config.pace > 0.5) {
      config.pace = Math.max(0.5, config.pace - 0.25);
      saveExerciseSettings();
      updatePaceUI();
    }
  });

  dom.btnPaceInc.addEventListener('click', () => {
    if (state.isRunning) return;
    const config = getCurrentExerciseConfig();
    if (config && config.pace < 5.0) {
      config.pace = Math.min(5.0, config.pace + 0.25);
      saveExerciseSettings();
      updatePaceUI();
    }
  });
  // Steppers removed

  function setLoginStatus(message) {
    const el = document.getElementById('login-status');
    if (el) el.textContent = message || '';
  }

  function setPasswordSetupStatus(message) {
    const el = document.getElementById('password-setup-status');
    if (el) el.textContent = message || '';
  }

  function closeLoginModal() {
    const modal = document.getElementById('login-modal');
    if (modal) modal.setAttribute('aria-hidden', 'true');
  }

  function closePasswordSetupModal() {
    const modal = document.getElementById('password-setup-modal');
    if (modal) modal.setAttribute('aria-hidden', 'true');
  }

  function maybePromptPasswordSetup() {
    if (!currentUser) return;
    const pendingEmail = localStorage.getItem(PASSWORD_SETUP_KEY);
    if (!pendingEmail || pendingEmail !== currentUser.email) return;

    closeLoginModal();
    setPasswordSetupStatus('');
    document.getElementById('password-setup-modal')?.setAttribute('aria-hidden', 'false');
  }

  async function initializeSupabaseSession() {
    if (!supabaseClient) return;

    const { data } = await supabaseClient.auth.getSession();
    currentUser = data.session?.user || null;
    if (currentUser) {
      await ensureUserProfile();
      await loadRemoteProfile();
      await checkAdminStatus();
      maybePromptPasswordSetup();
    } else {
      isAdmin = false;
      updateAdminButton();
    }

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      currentUser = session?.user || null;
      if (currentUser) {
        await ensureUserProfile();
        await loadRemoteProfile();
        await checkAdminStatus();
        renderExerciseSettings();
        setLoginStatus('Signed in. Your settings will sync on this device.');
        maybePromptPasswordSetup();
      } else {
        isAdmin = false;
        updateAdminButton();
      }
    });
  }

  async function signInWithEmail() {
    if (!supabaseClient) {
      setLoginStatus('Add Supabase credentials first.');
      return;
    }

    const email = document.getElementById('login-email')?.value?.trim();
    if (!email) {
      setLoginStatus('Enter your email address first.');
      return;
    }

    const { error } = await supabaseClient.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.href
      }
    });

    if (error) {
      setLoginStatus(error.message);
      return;
    }

    localStorage.setItem(PASSWORD_SETUP_KEY, email);
    setLoginStatus('Check your email for the sign-in link.');
  }

  async function signInWithPassword() {
    if (!supabaseClient) {
      setLoginStatus('Add Supabase credentials first.');
      return;
    }

    const email = document.getElementById('login-email')?.value?.trim();
    const password = document.getElementById('login-password')?.value || '';
    if (!email || !password) {
      setLoginStatus('Enter your email and password first.');
      return;
    }

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setLoginStatus(error.message);
      return;
    }

    setLoginStatus('Signed in. Your settings will sync on this device.');
  }

  async function saveLoginPassword() {
    if (!supabaseClient || !currentUser) {
      setPasswordSetupStatus('Please sign in with the magic link first.');
      return;
    }

    const password = document.getElementById('setup-password')?.value || '';
    const confirm = document.getElementById('setup-password-confirm')?.value || '';
    if (password.length < 6) {
      setPasswordSetupStatus('Use at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setPasswordSetupStatus('Passwords do not match.');
      return;
    }

    const { error } = await supabaseClient.auth.updateUser({ password });
    if (error) {
      setPasswordSetupStatus(error.message);
      return;
    }

    localStorage.removeItem(PASSWORD_SETUP_KEY);
    document.getElementById('setup-password').value = '';
    document.getElementById('setup-password-confirm').value = '';
    setPasswordSetupStatus('Password saved. Next time, use LOG IN.');
    window.setTimeout(closePasswordSetupModal, 900);
  }

  function skipLoginPasswordSetup() {
    localStorage.removeItem(PASSWORD_SETUP_KEY);
    document.getElementById('setup-password').value = '';
    document.getElementById('setup-password-confirm').value = '';
    closePasswordSetupModal();
  }

  // ─── Init ───
  async function init() {
    createCompletionOverlay();
    await fetchRemoteContent();
    createAdminShell();

    // Landing page
    const goToRoutineMenu = () => {
      dom.landingPage.classList.remove('is-active');
      dom.landingPage.setAttribute('aria-hidden', 'true');
      dom.routinePage.classList.add('is-active');
      dom.routinePage.setAttribute('aria-hidden', 'false');
      
      // Close modal if open
      const loginModal = document.getElementById('login-modal');
      if (loginModal) loginModal.setAttribute('aria-hidden', 'true');
    };

    dom.btnGuestMode.addEventListener('click', goToRoutineMenu);

    if (isSupabaseConfigured) {
      dom.btnGuestMode.style.display = '';
    }

    dom.btnLogin.addEventListener('click', () => {
      if (isSupabaseConfigured) {
        document.getElementById('login-modal').setAttribute('aria-hidden', 'false');
      } else {
        goToRoutineMenu();
      }
    });

    // BACK button on routine/menu page → return to landing page
    const goToLandingPage = () => {
      dom.routinePage.classList.remove('is-active');
      dom.routinePage.setAttribute('aria-hidden', 'true');
      dom.landingPage.classList.add('is-active');
      dom.landingPage.setAttribute('aria-hidden', 'false');
    };
    const btnRoutineBack = document.getElementById('btn-routine-back');
    if (btnRoutineBack) btnRoutineBack.addEventListener('click', goToLandingPage);


    // Close login modal
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      document.getElementById('login-modal').setAttribute('aria-hidden', 'true');
    });

    // Exercise Details Modal Logic
    const detailsModal = document.getElementById('exercise-details-modal');
    const detailsClose = document.getElementById('btn-close-details');
    const track = document.getElementById('exercise-carousel-track');
    const dotsContainer = document.getElementById('exercise-carousel-dots');
    const btnPrev = document.getElementById('btn-carousel-prev');
    const btnNext = document.getElementById('btn-carousel-next');
    let currentCarouselIndex = 0;
    let currentCarouselImages = [];

    function updateCarousel() {
      track.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
      Array.from(dotsContainer.children).forEach((dot, i) => {
        dot.style.background = i === currentCarouselIndex ? 'var(--accent)' : 'rgba(255,255,255,0.3)';
      });
      btnPrev.style.display = currentCarouselIndex === 0 ? 'none' : 'flex';
      btnNext.style.display = currentCarouselIndex === currentCarouselImages.length - 1 ? 'none' : 'flex';
      
      if (currentCarouselImages.length <= 1) {
        btnPrev.style.display = 'none';
        btnNext.style.display = 'none';
      }
    }

    btnPrev.addEventListener('click', () => {
      if (currentCarouselIndex > 0) {
        currentCarouselIndex--;
        updateCarousel();
      }
    });

    btnNext.addEventListener('click', () => {
      if (currentCarouselIndex < currentCarouselImages.length - 1) {
        currentCarouselIndex++;
        updateCarousel();
      }
    });

    dom.exercisePage.addEventListener('click', (e) => {
      const placeholder = e.target.closest('.exercise-animation-placeholder');
      if (!placeholder) return;

      const card = placeholder.closest('.exercise-card');
      const id = card.dataset.exerciseId;
      const details = exerciseDetails[id];
      if (!details) return;

      document.getElementById('exercise-details-title').innerText = details.title;
      document.getElementById('exercise-details-desc').innerText = details.description;
      
      if (details.alert) {
        document.getElementById('exercise-details-alert').style.display = 'block';
        document.getElementById('exercise-details-alert-text').innerText = details.alert;
      } else {
        document.getElementById('exercise-details-alert').style.display = 'none';
      }

      currentCarouselImages = details.images || [];
      currentCarouselIndex = 0;
      track.innerHTML = '';
      dotsContainer.innerHTML = '';

      if (currentCarouselImages.length > 0) {
        currentCarouselImages.forEach((src, i) => {
          const slide = document.createElement('div');
          slide.style.minWidth = '100%';
          slide.style.height = '100%';
          slide.style.backgroundImage = `url('${src}')`;
          slide.style.backgroundSize = 'contain';
          slide.style.backgroundRepeat = 'no-repeat';
          slide.style.backgroundPosition = 'center';
          track.appendChild(slide);

          const dot = document.createElement('div');
          dot.style.width = '8px';
          dot.style.height = '8px';
          dot.style.borderRadius = '50%';
          dot.style.background = 'rgba(255,255,255,0.3)';
          dot.style.cursor = 'pointer';
          dot.addEventListener('click', () => {
            currentCarouselIndex = i;
            updateCarousel();
          });
          dotsContainer.appendChild(dot);
        });
        updateCarousel();
        document.getElementById('exercise-carousel-container').style.display = 'block';
      } else {
        document.getElementById('exercise-carousel-container').style.display = 'none';
      }
      
      detailsModal.setAttribute('aria-hidden', 'false');
    });

    detailsClose.addEventListener('click', () => {
      detailsModal.setAttribute('aria-hidden', 'true');
    });

    document.getElementById('btn-login-password').addEventListener('click', signInWithPassword);
    document.getElementById('btn-login-email').addEventListener('click', signInWithEmail);
    document.getElementById('btn-save-password').addEventListener('click', saveLoginPassword);
    document.getElementById('btn-skip-password').addEventListener('click', skipLoginPasswordSetup);

    // btnRoutineBack logic removed

    // Routine menu: clicking any routine pill opens that routine.
    dom.sortableRoutines.addEventListener('click', (e) => {
      const pill = e.target.closest('.routine-pill');
      if (!pill) return;
      const routineName = pill.innerText;
      const routineId = getRoutineIdFromPill(pill);
      openExercisePage(routineName, routineId);
    });
    dom.btnExerciseBackPill.addEventListener('click', () => {
      const ROUTINES = getOrderedRoutines();
      if (ROUTINES.length === 0) return;
      const currentTitle = document.getElementById('exercise-page-title').innerText;
      let currentIndex = ROUTINES.findIndex(r => currentTitle.includes(r.name));
      if (currentIndex === -1) currentIndex = 0;
      const prevIndex = (currentIndex - 1 + ROUTINES.length) % ROUTINES.length;
      openExercisePage(ROUTINES[prevIndex].name, ROUTINES[prevIndex].id);
    });
    dom.btnExerciseNextPill.addEventListener('click', () => {
      const ROUTINES = getOrderedRoutines();
      if (ROUTINES.length === 0) return;
      const currentTitle = document.getElementById('exercise-page-title').innerText;
      let currentIndex = ROUTINES.findIndex(r => currentTitle.includes(r.name));
      if (currentIndex === -1) currentIndex = 0;
      const nextIndex = (currentIndex + 1) % ROUTINES.length;
      openExercisePage(ROUTINES[nextIndex].name, ROUTINES[nextIndex].id);
    });
    dom.exercisePage.addEventListener('change', handleExerciseSelection);
    dom.exercisePage.addEventListener('click', (e) => {
      handleExerciseStepper(e);
      handleProgressiveToggle(e);
    });
    dom.selectAllExercises.addEventListener('change', (e) => {
      const cards = Array.from(document.querySelectorAll('.exercise-card'));
      cards.forEach((card) => {
        if (card.style.display !== 'none') {
          const id = card.dataset.exerciseId;
          if (exerciseSettings[id]) {
            exerciseSettings[id].selected = e.target.checked;
          }
        }
      });
      saveExerciseSettings();
      renderExerciseSettings();
    });
    function loadCurrentExercise() {
      const exerciseId = state.selectedExercises[state.currentExerciseIndex];
      const config = exerciseSettings[exerciseId];
      state.totalSets = config.sets;
      state.totalReps = config.reps;

      // Sync stepper UI to current exercise settings
      updateSetRestUI();
      updatePaceUI();

      // Reset the previous exercise before mounting the next autoplaying guide.
      resetAll();

      // Auto-load the locally bundled Lottie for the selected exercise.
      const animationByExercise = {
        'extensor-stretch': 'assets/lottie/forearm-stretch.lottie',
        'wrist-extension': 'assets/lottie/wrist-extension.lottie',
        'forearm-rotation': 'assets/lottie/forearm-rotation.json?v=1',
        'grip-squeeze': 'assets/lottie/grip-squeeze.json?v=2',
      };

      const details = exerciseDetails[exerciseId];
      const lottieAnim = details?.lottieUrl || animationByExercise[exerciseId];
      
      if (lottieAnim) {
        // The player component does not reliably reload when only its src changes.
        // Replace it so each guide screen renders the selected exercise animation.
        const nextMediaLottie = document.createElement('dotlottie-player');
        nextMediaLottie.id = 'media-lottie';
        nextMediaLottie.setAttribute('src', lottieAnim);
        nextMediaLottie.setAttribute('autoplay', '');
        nextMediaLottie.setAttribute('loop', '');
        nextMediaLottie.setAttribute('aria-label', 'Exercise demonstration animation');
        nextMediaLottie.dataset.exercise = exerciseId;
        const playGuideAnimation = () => nextMediaLottie.play?.();
        nextMediaLottie.addEventListener('ready', playGuideAnimation, { once: true });
        nextMediaLottie.addEventListener('load', playGuideAnimation, { once: true });
        nextMediaLottie.addEventListener('data_ready', playGuideAnimation, { once: true });
        dom.mediaLottie.replaceWith(nextMediaLottie);
        dom.mediaLottie = nextMediaLottie;
        nextMediaLottie.classList.remove('hidden');
        requestAnimationFrame(playGuideAnimation);
        setTimeout(playGuideAnimation, 400);
        setTimeout(playGuideAnimation, 1000);
        dom.mediaImg.classList.add('hidden');
      } else {
        // Hide Lottie and show Image
        dom.mediaLottie.classList.add('hidden');

        if (details && details.images && details.images.length > 0) {
          state.currentImageIndex = 0;
          dom.mediaImg.style.opacity = '1';
          dom.mediaImg.src = details.images[0];
          dom.mediaImg.classList.remove('hidden');
        } else {
          dom.mediaImg.classList.add('hidden');
        }
      }
      dom.mediaVideo.classList.add('hidden');
      dom.mediaVideo.pause();
      dom.mediaPlaceholder.classList.add('hidden');
      dom.mediaDisplay.classList.remove('hidden');

      // Update exercise name overlay
      const nameOverlay = document.getElementById('timer-exercise-name');
      if (nameOverlay) {
        const details = exerciseDetails[exerciseId];
        nameOverlay.textContent = details ? details.title : '';
      }

      updateNavButtons();
      updateTimerDuration();
    }

    function updateNavButtons() {
      if (!state.selectedExercises || state.selectedExercises.length === 0) return;

      if (state.currentExerciseIndex === state.selectedExercises.length - 1) {
        dom.btnAppNext.style.backgroundColor = "#ff453a";
        dom.btnAppNext.style.color = "white";
        dom.btnAppNext.style.borderColor = "#ff453a";
        dom.btnAppNext.textContent = "LAST";
      } else {
        dom.btnAppNext.style.backgroundColor = "";
        dom.btnAppNext.style.color = "";
        dom.btnAppNext.style.borderColor = "";
        dom.btnAppNext.textContent = "NEXT";
      }

      if (state.currentExerciseIndex === 0) {
        dom.btnAppBack.style.backgroundColor = "#ff453a";
        dom.btnAppBack.style.color = "white";
        dom.btnAppBack.style.borderColor = "#ff453a";
        dom.btnAppBack.textContent = "FIRST";
      } else {
        dom.btnAppBack.style.backgroundColor = "";
        dom.btnAppBack.style.color = "";
        dom.btnAppBack.style.borderColor = "";
        dom.btnAppBack.textContent = "BACK";
      }
    }

    dom.btnStartNow.addEventListener('click', () => {
      state.selectedExercises = getVisibleExerciseIds().filter((id) => exerciseSettings[id]?.selected);
      if (state.selectedExercises.length === 0) return;
      
      state.currentExerciseIndex = 0;
      loadCurrentExercise();

      dom.exercisePage.classList.remove('is-active');
      dom.exercisePage.setAttribute('aria-hidden', 'true');
      dom.app.setAttribute('aria-hidden', 'false');
      
      requestWakeLock();
    });

    dom.btnAppNext.addEventListener('click', () => {
      if (state.currentExerciseIndex < state.selectedExercises.length - 1) {
        state.currentExerciseIndex++;
        loadCurrentExercise();
      } else {
        // At LAST — go back to exercise selection page
        returnToExercisePage();
      }
    });

    dom.btnAppBack.addEventListener('click', () => {
      if (state.currentExerciseIndex > 0) {
        state.currentExerciseIndex--;
        loadCurrentExercise();
      } else {
        // At FIRST — go back to exercise selection page
        returnToExercisePage();
      }
    });

    loadState();
    loadExerciseSettings();
    await initializeSupabaseSession();
    renderExerciseSettings();
    if (currentUser) goToRoutineMenu();

    function applyGlobalDarkMode() {
      if (state.globalDarkMode) {
        document.body.classList.remove('light-mode');
        dom.btnDarkMode.classList.add('is-active');
      } else {
        document.body.classList.add('light-mode');
        dom.btnDarkMode.classList.remove('is-active');
      }
    }
    applyGlobalDarkMode();

    function applyGlobalSoundMode() {
      if (state.globalSoundMode) {
        dom.btnSoundMode.classList.add('is-active');
      } else {
        dom.btnSoundMode.classList.remove('is-active');
      }
    }
    applyGlobalSoundMode();

    dom.btnDarkMode.addEventListener('click', () => {
      state.globalDarkMode = !state.globalDarkMode;
      applyGlobalDarkMode();
      saveState();
    });

    dom.btnSoundMode.addEventListener('click', () => {
      state.globalSoundMode = !state.globalSoundMode;
      if (state.globalSoundMode) {
        state.beepEnabled = true;
        state.voiceEnabled = true;
      } else {
        state.beepEnabled = false;
        state.voiceEnabled = false;
      }
      dom.toggleBeep.checked = state.beepEnabled;
      dom.toggleVoice.checked = state.voiceEnabled;
      applyGlobalSoundMode();
      saveState();
    });

    // Initial setup of toggles

    // Settings initialized during loadCurrentExercise
    dom.toggleBeep.checked = state.beepEnabled;
    dom.toggleVoice.checked = state.voiceEnabled;

    // Media
    dom.mediaInput.addEventListener('change', handleMediaUpload);
    dom.mediaImg.addEventListener('click', () => {
      const exerciseId = state.selectedExercises[state.currentExerciseIndex];
      const details = exerciseDetails[exerciseId];
      if (details && details.images && details.images.length > 1) {
        state.currentImageIndex = ((state.currentImageIndex || 0) + 1) % details.images.length;
        
        // Fade out
        dom.mediaImg.style.opacity = '0';
        setTimeout(() => {
          dom.mediaImg.src = details.images[state.currentImageIndex];
          // Fade in
          dom.mediaImg.style.opacity = '1';
        }, 300);
      }
    });

    // Transport
    dom.btnPlay.addEventListener('click', () => {
      ensureAudioCtx(); // Unlock audio on user gesture
      ensureSpeech();   // Unlock speech synthesis on user gesture
      if (state.isRunning) {
        pauseTimer();
      } else {
        startTimer();
      }
    });
    dom.btnReset.addEventListener('click', resetAll);
    dom.btnSkip.addEventListener('click', skipToNextSet);

    // (Old Settings slider listeners removed)
    // Sound Beep and Voice Guide toggles
    dom.toggleBeep.addEventListener('change', (e) => {
      state.beepEnabled = e.target.checked;
      saveState();
    });
    dom.toggleVoice.addEventListener('change', (e) => {
      state.voiceEnabled = e.target.checked;
      saveState();
      if (state.voiceEnabled) {
        ensureSpeech();
        speak("Voice Guide on");
      }
    });

    const btnExerciseClose = $('btn-exercise-close');
    if (btnExerciseClose) {
      btnExerciseClose.addEventListener('click', returnToMainMenu);
    }
    const btnAppCloseGlobal = $('btn-app-close-global');
    if (btnAppCloseGlobal) {
      btnAppCloseGlobal.addEventListener('click', returnToMainMenu);
    }

    // Prevent number inputs from scrolling the page
    // Initial render
    fullRender();

    // Initialize drag-and-drop sorting for routines
    loadRoutineOrder();
    if (typeof Sortable !== 'undefined' && dom.sortableRoutines) {
      new Sortable(dom.sortableRoutines, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        delay: 150, // Delay for mobile touch friendliness
        delayOnTouchOnly: true,
        onEnd: saveRoutineOrder
      });
    }
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
