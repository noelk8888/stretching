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
  };

  function getCurrentExerciseConfig() {
    const exerciseId = state.selectedExercises[state.currentExerciseIndex];
    if (!exerciseId) return null;
    return exerciseSettings[exerciseId];
  }

  function getCurrentPace() {
    const config = getCurrentExerciseConfig();
    if (!config || !config.progressiveReps) {
      return config ? config.pace : 1.2;
    }
    // Reps are constant within a set, but increase by 10% per set.
    return config.pace * Math.pow(1.1, state.currentSet);
  }

  function getCurrentSetRest() {
    const config = getCurrentExerciseConfig();
    if (!config || !config.progressiveSets) {
      return config ? config.setRest : 1.5;
    }
    // Rest increases by 10% per set.
    return config.setRest * Math.pow(1.1, state.currentSet);
  }

  // ─── DOM refs ───
  const $ = (id) => document.getElementById(id);

  const exerciseDetails = {
    'cat-cow': {
      title: 'CAT & COW',
      description: 'Start on your hands and knees. Inhale and let your belly drop towards the floor, lifting your chest and tailbone towards the ceiling (Cow Pose). Exhale and arch your back towards the ceiling, tucking your chin to your chest (Cat Pose). Move slowly and breathe deeply with each movement.',
      alert: 'If you experience wrist pain, you can perform this stretch resting on your forearms instead of your hands.',
      images: ['assets/images/cat_cow_stretch_1783253633631.png', 'assets/images/cow_pose_proper_1783254613686.png']
    },
    'childs-pose': {
      title: "CHILD'S POSE",
      description: 'Kneel on the floor with your toes together and your knees hip-width apart. Slowly sit back on your heels, walk your hands forward, and gently rest your forehead on the floor. Allow your spine to lengthen and your shoulders to relax.',
      alert: 'If you have knee pain, place a rolled-up towel behind your knees or skip this stretch if it causes sharp discomfort.',
      images: ['assets/images/childs_pose_2_1783254371842.png', 'assets/images/childs_pose_1783254135860.png']
    },
    'thread-needle': {
      title: 'THREAD THE NEEDLE',
      description: 'From all fours, slide your right arm under your left arm, dropping your right shoulder and the right side of your head gently to the floor. Keep your hips high and your left hand planted for support. Hold, then switch sides.',
      alert: 'Do not force the twist. Keep the weight gently on your shoulder, not your neck.',
      images: ['assets/images/thread_needle_2_1783254378821.png', 'assets/images/thread_needle_1783254145200.png']
    },
    'bird-dog': {
      title: 'BIRD-DOG',
      description: 'From all fours, slowly extend your right arm forward and your left leg backward simultaneously. Keep your back completely flat and your core engaged. Hold for a moment, return to start, and switch sides.',
      alert: 'If you feel unsteady, extend *only* your arm or *only* your leg until you build more balance.',
      images: ['assets/images/bird_dog_2_1783254387590.png', 'assets/images/bird_dog_1783254153480.png']
    },
    'sphinx-pose': {
      title: 'SPHINX POSE',
      description: 'Lie flat on your stomach. Prop yourself up on your forearms, keeping your elbows directly under your shoulders. Press your forearms into the floor and gently lift your chest to create a mild lower back arch. Relax your shoulders away from your ears.',
      alert: 'If you feel any pinching in your lower spine, lower your chest slightly or skip the movement.',
      images: ['assets/images/sphinx_pose_2_1783254395595.png', 'assets/images/sphinx_pose_1783254161258.png']
    },
    'extensor-stretch': {
      title: 'WRIST EXTENSOR STRETCH',
      description: 'Extend your arm in front of you with your palm facing down. Use your other hand to gently bend your wrist downward until you feel a stretch along the top of your forearm. Hold the stretch.',
      alert: 'Keep your elbow straight but do not lock it forcefully.',
      images: [] 
    },
    'wrist-extension': {
      title: 'WRIST EXTENSION',
      description: 'Hold a light weight (or just use the weight of your hand). Support your forearm on a table or your thigh with your hand hanging off the edge, palm facing down. Slowly lift your wrist up, then slowly lower it back down.',
      alert: 'Perform this movement slowly. If you feel sharp pain, stop immediately.',
      images: []
    },
    'forearm-rotation': {
      title: 'FOREARM ROTATION',
      description: 'Bend your elbow to 90 degrees, keeping it tucked close to your side. Slowly turn your palm to face up, hold for a moment, then slowly turn your palm to face down.',
      alert: 'Keep your upper arm completely still; all the movement should come from your forearm.',
      images: []
    },
    'grip-squeeze': {
      title: 'GRIP SQUEEZE',
      description: 'Hold a soft stress ball or a rolled-up towel in your hand. Squeeze it firmly, hold for a few seconds, then release with control.',
      alert: 'Do not squeeze so hard that it causes pain in your elbow.',
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
    btnRoutineBack: $('btn-routine-back'),
    btnTennisElbow: $('btn-tennis-elbow'),
    exercisePage: $('exercise-page'),
    btnExerciseBackPill: $('btn-exercise-back-pill'),
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
    mediaRemove: $('media-remove'),

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
    } catch (e) {
      /* ignore storage access errors */
    }
  }

  // ─── Exercise selection defaults ───
  const exerciseDefaults = {
    // Tennis Elbow
    'extensor-stretch': { selected: false, sets: 2, reps: 8, progressiveSets: false, progressiveReps: false, setRest: 1.5, pace: 1.2 },
    'wrist-extension': { selected: false, sets: 3, reps: 10, progressiveSets: false, progressiveReps: false, setRest: 1.5, pace: 1.2 },
    'forearm-rotation': { selected: false, sets: 2, reps: 10, progressiveSets: false, progressiveReps: false, setRest: 1.5, pace: 1.2 },
    'grip-squeeze': { selected: false, sets: 3, reps: 10, progressiveSets: false, progressiveReps: false, setRest: 1.5, pace: 1.2 },
    // Cat & Cow
    'cat-cow': { selected: false, sets: 2, reps: 8, progressiveSets: false, progressiveReps: false, setRest: 1.5, pace: 1.2 },
    'childs-pose': { selected: false, sets: 2, reps: 6, progressiveSets: false, progressiveReps: false, setRest: 1.5, pace: 1.2 },
    'thread-needle': { selected: false, sets: 2, reps: 5, progressiveSets: false, progressiveReps: false, setRest: 1.5, pace: 1.2 },
    'bird-dog': { selected: false, sets: 2, reps: 8, progressiveSets: false, progressiveReps: false, setRest: 1.5, pace: 1.2 },
    'sphinx-pose': { selected: false, sets: 2, reps: 6, progressiveSets: false, progressiveReps: false, setRest: 1.5, pace: 1.2 },
  };

  let exerciseSettings = JSON.parse(JSON.stringify(exerciseDefaults));

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

          const savedSetRest = parseFloat(saved[id].setRest);
          if (!isNaN(savedSetRest)) exerciseSettings[id].setRest = savedSetRest;

          const savedPace = parseFloat(saved[id].pace);
          if (!isNaN(savedPace)) exerciseSettings[id].pace = savedPace;
        }
      });
    } catch (e) {
      console.warn('Could not load exercise settings', e);
    }
  }

  function saveExerciseSettings() {
    try {
      localStorage.setItem('ec_tennisElbowExercises', JSON.stringify(exerciseSettings));
    } catch (e) {
      console.warn('Could not save exercise settings', e);
    }
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
      const config = getCurrentExerciseConfig() || { pace: 1.2 };
      dom.paceValue.textContent = config.pace.toFixed(1) + 's';
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
    const config = getCurrentExerciseConfig() || { pace: 1.2, progressiveReps: false };
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
      dom.setRestValue.textContent = config.setRest.toFixed(1) + 's';
    }
  }

  function updatePaceUI() {
    const config = getCurrentExerciseConfig();
    if (config) {
      dom.paceValue.textContent = config.pace.toFixed(1) + 's';
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

  // ─── Init ───
  function init() {
    createCompletionOverlay();

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
    
    // Open login modal
    dom.btnLogin.addEventListener('click', () => {
      document.getElementById('login-modal').setAttribute('aria-hidden', 'false');
    });

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
    let carouselAutoPlayTimer = null;

    function resetAutoPlay() {
      if (carouselAutoPlayTimer) clearInterval(carouselAutoPlayTimer);
      if (currentCarouselImages.length > 1) {
        carouselAutoPlayTimer = setInterval(() => {
          currentCarouselIndex = (currentCarouselIndex + 1) % currentCarouselImages.length;
          updateCarousel();
        }, 3000);
      }
    }

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
        resetAutoPlay();
      }
    });

    btnNext.addEventListener('click', () => {
      if (currentCarouselIndex < currentCarouselImages.length - 1) {
        currentCarouselIndex++;
        updateCarousel();
        resetAutoPlay();
      }
    });

    document.querySelectorAll('.exercise-animation-placeholder').forEach(el => {
      el.addEventListener('click', (e) => {
        // Prevent click if clicking the checkbox wrapper, but here it's on the placeholder specifically
        const card = e.target.closest('.exercise-card');
        const id = card.dataset.exerciseId;
        const details = exerciseDetails[id];
        
        if (details) {
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
            resetAutoPlay();
            document.getElementById('exercise-carousel-container').style.display = 'block';
          } else {
            document.getElementById('exercise-carousel-container').style.display = 'none';
          }
          
          detailsModal.setAttribute('aria-hidden', 'false');
        }
      });
    });

    detailsClose.addEventListener('click', () => {
      detailsModal.setAttribute('aria-hidden', 'true');
      if (carouselAutoPlayTimer) clearInterval(carouselAutoPlayTimer);
    });

    // Handle dummy auth options (proceeds to routine menu for now)
    document.getElementById('btn-login-email').addEventListener('click', goToRoutineMenu);
    document.getElementById('btn-login-google').addEventListener('click', goToRoutineMenu);
    document.getElementById('btn-login-apple').addEventListener('click', goToRoutineMenu);

    dom.btnRoutineBack.addEventListener('click', () => {
      dom.landingPage.classList.remove('is-leaving');
      dom.landingPage.setAttribute('aria-hidden', 'false');
      dom.routinePage.classList.remove('is-active');
      dom.routinePage.setAttribute('aria-hidden', 'true');
    });

    // Routine menu: clicking any routine pill (except back) goes to exercise page
    const routinePills = dom.sortableRoutines.querySelectorAll('.routine-pill');
    routinePills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        let routineName = e.target.innerText;
        let routineId = '';
        if (routineName.includes('TENNIS ELBOW')) routineId = 'tennis-elbow';
        else if (routineName.includes('CAT & COW')) routineId = 'cat-cow';
        openExercisePage(routineName, routineId);
      });
    });
    dom.btnExerciseBackPill.addEventListener('click', closeExercisePage);
    dom.exercisePage.addEventListener('change', handleExerciseSelection);
    dom.exercisePage.addEventListener('click', (e) => {
      handleExerciseStepper(e);
      handleProgressiveToggle(e);
    });
    dom.selectAllExercises.addEventListener('change', (e) => {
      Object.values(exerciseSettings).forEach((config) => {
        config.selected = e.target.checked;
      });
      saveExerciseSettings();
      renderExerciseSettings();
    });
    function loadCurrentExercise() {
      const exerciseId = state.selectedExercises[state.currentExerciseIndex];
      const config = exerciseSettings[exerciseId];
      state.totalSets = config.sets;
      state.totalReps = config.reps;

      // Sync sliders to current exercise settings
      dom.inputSetRest.value = config.setRest;
      onSetRestChange();
      dom.inputPace.value = config.pace;
      onPaceChange();

      // Reset the previous exercise before mounting the next autoplaying guide.
      resetAll();

      // Auto-load the locally bundled Lottie for the selected exercise.
      const animationByExercise = {
        'extensor-stretch': 'assets/lottie/forearm-stretch.lottie',
        'wrist-extension': 'assets/lottie/wrist-extension.lottie',
        'forearm-rotation': 'assets/lottie/forearm-rotation.json?v=1',
        'grip-squeeze': 'assets/lottie/grip-squeeze.json?v=2',
      };

      const lottieAnim = animationByExercise[exerciseId];
      
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
        const details = exerciseDetails[exerciseId];
        if (details && details.images && details.images.length > 0) {
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
    }

    dom.btnStartNow.addEventListener('click', () => {
      state.selectedExercises = Object.keys(exerciseSettings).filter((id) => exerciseSettings[id].selected);
      if (state.selectedExercises.length === 0) return;
      
      state.currentExerciseIndex = 0;
      loadCurrentExercise();

      dom.exercisePage.classList.remove('is-active');
      dom.exercisePage.setAttribute('aria-hidden', 'true');
      dom.app.setAttribute('aria-hidden', 'false');
    });

    dom.btnAppNext.addEventListener('click', () => {
      if (state.currentExerciseIndex < state.selectedExercises.length - 1) {
        state.currentExerciseIndex++;
        loadCurrentExercise();
      } else {
        // Reached the end of selected exercises, go back to exercise list
        resetAll();
        dom.app.setAttribute('aria-hidden', 'true');
        dom.exercisePage.classList.add('is-active');
        dom.exercisePage.setAttribute('aria-hidden', 'false');
      }
    });

    dom.btnAppBack.addEventListener('click', () => {
      resetAll();
      dom.app.setAttribute('aria-hidden', 'true');
      dom.exercisePage.classList.add('is-active');
      dom.exercisePage.setAttribute('aria-hidden', 'false');
    });

    loadExerciseSettings();
    renderExerciseSettings();
    // Load saved settings
    loadState();

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

    onSetRestChange();
    onPaceChange();
    dom.toggleBeep.checked = state.beepEnabled;
    dom.toggleVoice.checked = state.voiceEnabled;

    // Media
    dom.mediaInput.addEventListener('change', handleMediaUpload);
    dom.mediaRemove.addEventListener('click', removeMedia);

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

    // Settings
    dom.inputSetRest.addEventListener('input', onSetRestChange);
    dom.inputPace.addEventListener('input', onPaceChange);

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

    // Prevent number inputs from scrolling the page
    // Initial render
    onPaceChange();
    fullRender();

    // Initialize drag-and-drop sorting for routines
    if (typeof Sortable !== 'undefined' && dom.sortableRoutines) {
      new Sortable(dom.sortableRoutines, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        delay: 150, // Delay for mobile touch friendliness
        delayOnTouchOnly: true
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
