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
    pace: 1.2,          // seconds per rep
    setRest: 1.5,       // seconds between sets
    currentSet: 0,      // 0-indexed
    currentRep: 0,      // 0-indexed, 0 = not started
    isRunning: false,
    isFinished: false,
    timerId: null,
    beepEnabled: true,  // sound beep
    voiceEnabled: true, // read out loud
    selectedExercises: [],
    currentExerciseIndex: 0,
  };

  // ─── Pace progression helper ───
  function getCurrentPace() {
    if (state.totalSets <= 1) {
      return state.pace;
    }
    // Slowly progress to state.pace + 0.2 from 1st set (index 0) to last set (index totalSets - 1)
    const progress = state.currentSet / (state.totalSets - 1);
    return state.pace + (0.2 * progress);
  }

  // ─── DOM refs ───
  const $ = (id) => document.getElementById(id);

  const dom = {
    // Landing page
    landingPage: $('landing-page'),
    btnStartHere: $('btn-start-here'),
    routinePage: $('routine-page'),
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
    inputSetRest: $('input-set-rest'),
    setRestValue: $('set-rest-value'),
    inputPace: $('input-pace'),
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

      const savedSetRest = localStorage.getItem('ec_setRest');
      if (savedSetRest !== null) state.setRest = parseFloat(savedSetRest);

      const savedPace = localStorage.getItem('ec_pace');
      if (savedPace !== null) state.pace = parseFloat(savedPace);

      const savedBeep = localStorage.getItem('ec_beepEnabled');
      if (savedBeep !== null) state.beepEnabled = savedBeep === 'true';

      const savedVoice = localStorage.getItem('ec_voiceEnabled');
      if (savedVoice !== null) state.voiceEnabled = savedVoice === 'true';
    } catch (e) {
      /* ignore storage access errors */
    }
  }

  function saveState() {
    try {
      localStorage.setItem('ec_totalSets', state.totalSets);
      localStorage.setItem('ec_totalReps', state.totalReps);
      localStorage.setItem('ec_setRest', state.setRest);
      localStorage.setItem('ec_pace', state.pace);
      localStorage.setItem('ec_beepEnabled', state.beepEnabled);
      localStorage.setItem('ec_voiceEnabled', state.voiceEnabled);
    } catch (e) {
      /* ignore storage access errors */
    }
  }

  // ─── Tennis elbow exercise selection ───
  const exerciseDefaults = {
    'extensor-stretch': { selected: false, sets: 2, reps: 8 },
    'wrist-extension': { selected: false, sets: 3, reps: 10 },
    'forearm-rotation': { selected: false, sets: 2, reps: 10 },
    'grip-squeeze': { selected: false, sets: 3, reps: 10 },
  };

  let exerciseSettings = JSON.parse(JSON.stringify(exerciseDefaults));

  function loadExerciseSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem('ec_tennisElbowExercises'));
      if (!saved) return;
      Object.keys(exerciseSettings).forEach((id) => {
        if (saved[id]) exerciseSettings[id] = { ...exerciseSettings[id], ...saved[id] };
      });
    } catch (e) {
      /* keep defaults when saved data is unavailable */
    }
  }

  function saveExerciseSettings() {
    try {
      localStorage.setItem('ec_tennisElbowExercises', JSON.stringify(exerciseSettings));
    } catch (e) {
      /* ignore storage access errors */
    }
  }

  function renderExerciseSettings() {
    const cards = document.querySelectorAll('.exercise-card');
    let selectedCount = 0;

    cards.forEach((card) => {
      const config = exerciseSettings[card.dataset.exerciseId];
      const checkbox = card.querySelector('.exercise-checkbox');
      checkbox.checked = config.selected;
      card.classList.toggle('is-selected', config.selected);
      card.querySelector('[data-value="sets"]').textContent = config.sets;
      card.querySelector('[data-value="reps"]').textContent = config.reps;
      if (config.selected) selectedCount++;
    });

    dom.selectAllExercises.checked = selectedCount === cards.length;
    dom.selectAllExercises.indeterminate = selectedCount > 0 && selectedCount < cards.length;
    dom.btnStartNow.disabled = selectedCount === 0;
    dom.selectionSummary.textContent = selectedCount === 0
      ? 'SELECT AT LEAST ONE EXERCISE'
      : `${selectedCount} EXERCISE${selectedCount === 1 ? '' : 'S'} SELECTED`;
  }

  function openExercisePage() {
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

  // ─── Voice / Speech Synthesis ───
  function ensureSpeech() {
    try {
      if (window.speechSynthesis) {
        // Speak an empty string to unlock/prime TTS engine on mobile/iOS
        const u = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(u);
      }
    } catch (e) {}
  }

  function speak(text) {
    if (!state.voiceEnabled) return;
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Cancel ongoing to speak immediately
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1; // Slightly faster for responsiveness
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
      dom.paceValue.textContent = state.pace.toFixed(1) + 's';
    }
  }

  function updatePlayButton() {
    dom.iconPlay.classList.toggle('hidden', state.isRunning);
    dom.iconPause.classList.toggle('hidden', !state.isRunning);
  }

  function disableSettingsWhileRunning() {
    const disable = state.isRunning;
    dom.inputSetRest.disabled = disable;
    dom.inputPace.disabled = disable;
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
      }, state.setRest * 1000);
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
      }, state.setRest * 1000);
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
      state.currentSet = state.totalSets;
      state.isFinished = true;
      state.isRunning = false;
      fullRender();
      playDoneBeep();
      showCompletionOverlay();
      return;
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
      <button id="btn-restart">Restart</button>
    `;
    document.body.appendChild(overlay);
    document.getElementById('btn-restart').addEventListener('click', () => {
      resetAll();
      dom.app.setAttribute('aria-hidden', 'true');
      dom.landingPage.classList.remove('is-leaving');
      dom.landingPage.setAttribute('aria-hidden', 'false');
    });
  }

  function showCompletionOverlay() {
    const overlay = document.getElementById('completion-overlay');
    const summary = document.getElementById('done-summary');
    const startPace = state.pace;
    const endPace = state.totalSets > 1 ? (state.pace + 0.2) : state.pace;
    const paceText = state.totalSets > 1
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
  function onSetRestChange() {
    const val = parseFloat(dom.inputSetRest.value);
    state.setRest = val;
    dom.setRestValue.textContent = val.toFixed(1) + 's';

    const pct = ((val - 1) / 2) * 100;
    dom.inputSetRest.style.background = `linear-gradient(90deg, var(--accent) ${pct}%, var(--bg-card) ${pct}%)`;
    saveState();
  }

  function onPaceChange() {
    const val = parseFloat(dom.inputPace.value);
    state.pace = val;
    dom.paceValue.textContent = val.toFixed(1) + 's';

    // Update slider gradient
    const pct = ((val - 1) / 2) * 100;
    dom.inputPace.style.background = `linear-gradient(90deg, var(--accent) ${pct}%, var(--bg-card) ${pct}%)`;
    saveState();
  }

  // Steppers removed

  // ─── Init ───
  function init() {
    createCompletionOverlay();

    // Landing page
    dom.btnStartHere.addEventListener('click', () => {
      dom.routinePage.classList.add('is-active');
      dom.routinePage.setAttribute('aria-hidden', 'false');
      dom.landingPage.classList.add('is-leaving');
      dom.landingPage.setAttribute('aria-hidden', 'true');
    });

    dom.btnRoutineBack.addEventListener('click', () => {
      dom.landingPage.classList.remove('is-leaving');
      dom.landingPage.setAttribute('aria-hidden', 'false');
      dom.routinePage.classList.remove('is-active');
      dom.routinePage.setAttribute('aria-hidden', 'true');
    });

    dom.btnTennisElbow.addEventListener('click', openExercisePage);
    dom.btnExerciseBackPill.addEventListener('click', closeExercisePage);
    dom.exercisePage.addEventListener('change', handleExerciseSelection);
    dom.exercisePage.addEventListener('click', handleExerciseStepper);
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

      // Auto-load the locally bundled Lottie for the selected exercise.
      const animationByExercise = {
        'extensor-stretch': 'assets/lottie/forearm-stretch.lottie',
        'wrist-extension': 'assets/lottie/wrist-extension.lottie',
        'forearm-rotation': 'assets/lottie/forearm-stretch.lottie',
        'grip-squeeze': 'assets/lottie/grip-squeeze.lottie',
      };
      dom.mediaLottie.setAttribute('src', animationByExercise[exerciseId]);
      dom.mediaLottie.classList.remove('hidden');
      dom.mediaLottie.play?.();
      dom.mediaImg.classList.add('hidden');
      dom.mediaVideo.classList.add('hidden');
      dom.mediaVideo.pause();
      dom.mediaPlaceholder.classList.add('hidden');
      dom.mediaDisplay.classList.remove('hidden');
      
      resetAll();
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

    // Sync state values with HTML inputs
    dom.inputSetRest.value = state.setRest;
    dom.inputPace.value = state.pace;

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
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
