// ═══════════════════════════════════════════════════════════
// CyberGuard, Box Breathing Module
// Physiological anxiety regulation via controlled breathing
// Evidence: Jerath et al. (2006); Ma et al. (2017)
// 4-4-4-4 pattern: inhale, hold, exhale, hold
// Used in two contexts:
//   1. Before challenges, reduces baseline arousal
//   2. Before results, reduces anticipatory score anxiety
// ═══════════════════════════════════════════════════════════

const BreathingExercise = (() => {

  const PHASES = [
    { label: 'Breathe In',  seconds: 4, instruction: 'Inhale slowly through your nose' },
    { label: 'Hold',        seconds: 4, instruction: 'Hold gently. Stay relaxed.'       },
    { label: 'Breathe Out', seconds: 4, instruction: 'Exhale slowly through your mouth' },
    { label: 'Hold',        seconds: 4, instruction: 'Rest and let your body settle'       },
  ];

  const CHALLENGES_KEY = 'cg_breathing_challenges_done';
  const RESULTS_KEY    = 'cg_breathing_results_done';

  // Context-specific intro content
  const CONTEXTS = {
    challenges: {
      title:    'Before you begin',
      subtitle: 'Take 16 seconds to settle your mind. Research shows one breathing cycle measurably reduces anxiety before a stressful task.',
      complete_title: '💚 You\'re ready',
      complete_body:  'Your breathing has slowed and your focus is sharper. The challenges ahead are a safe space. Nothing here can cause real harm.',
      btn_label: 'Start the Challenges →',
    },
    results: {
      title:    'Before you see your results',
      subtitle: 'Your score does not measure your intelligence. It measures where your awareness is today, and awareness grows with every single session.',
      complete_title: '💚 One more thing to remember',
      complete_body:  'Every wrong answer in there was a learning moment, not a failure. Professional security teams get caught by these same attacks. What you built today is instinct, and instinct compounds.',
      btn_label: 'See My Results →',
    },
  };

  function storageKey(context) {
    return context === 'results' ? RESULTS_KEY : CHALLENGES_KEY;
  }

  function alreadyDone(context) {
    try { return sessionStorage.getItem(storageKey(context)) === '1'; } catch { return false; }
  }

  function markDone(context) {
    try { sessionStorage.setItem(storageKey(context), '1'); } catch {}
  }

  function buildOverlay(context) {
    const ctx = CONTEXTS[context] || CONTEXTS.challenges;
    const overlay = document.createElement('div');
    overlay.className = 'breathing-overlay';
    overlay.id = 'breathing-overlay';

    overlay.innerHTML = `
      <div class="breath-title">${ctx.title}</div>
      <div class="breath-subtitle" id="breath-subtitle">${ctx.subtitle}</div>

      <div class="box-container" id="box-container">
        <svg class="box-svg" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
          <rect class="box-path" id="box-path" x="20" y="20" width="180" height="180" rx="4"/>
        </svg>
        <div class="box-glow" id="box-glow"></div>
        <div class="breath-instruction">
          <div class="breath-word" id="breath-word">Ready?</div>
          <div class="breath-count" id="breath-count">&#x2022;</div>
          <div class="breath-phase-label" id="breath-phase-label">Press start</div>
        </div>
      </div>

      <div class="breath-progress" id="breath-progress">
        ${PHASES.map((_,i) => `<div class="breath-dot" id="dot-${i}"></div>`).join('')}
      </div>

      <div id="breath-action">
        <button class="btn btn-primary" id="breath-start-btn" onclick="BreathingExercise.start()">
          Start Breathing Exercise
        </button>
        <div style="margin-top:0.75rem">
          <button class="breath-skip" onclick="BreathingExercise.skip()">Skip, I am already calm</button>
        </div>
      </div>

      <div id="breath-complete" style="display:none">
        <div class="breath-complete-msg">
          <h3>${ctx.complete_title}</h3>
          <p>${ctx.complete_body}</p>
          <button class="btn btn-primary" onclick="BreathingExercise.dismiss()">${ctx.btn_label}</button>
        </div>
      </div>
    `;
    return overlay;
  }

  function show(context, onComplete) {
    if (alreadyDone(context)) { if (onComplete) onComplete(); return; }
    const overlay = buildOverlay(context);
    document.body.appendChild(overlay);
    BreathingExercise._context   = context;
    BreathingExercise._onComplete = onComplete;
  }

  function start() {
    document.getElementById('breath-action').style.display = 'none';
    document.getElementById('breath-subtitle').textContent =
      'Follow the guide. Each side of the square = 4 seconds.';

    document.getElementById('box-path').classList.add('animate');

    let phaseIndex  = 0;
    let secondsLeft = PHASES[0].seconds;
    updateDisplay(phaseIndex, secondsLeft);

    const interval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        const dot = document.getElementById(`dot-${phaseIndex}`);
        if (dot) { dot.classList.remove('active'); dot.classList.add('done'); }
        phaseIndex++;
        if (phaseIndex >= PHASES.length) {
          clearInterval(interval);
          showComplete();
          return;
        }
        secondsLeft = PHASES[phaseIndex].seconds;
        updateDisplay(phaseIndex, secondsLeft);
      } else {
        updateDisplay(phaseIndex, secondsLeft);
      }
    }, 1000);
  }

  function updateDisplay(phaseIndex, secondsLeft) {
    const phase = PHASES[phaseIndex];
    const wordEl  = document.getElementById('breath-word');
    const countEl = document.getElementById('breath-count');
    const labelEl = document.getElementById('breath-phase-label');
    if (wordEl)  wordEl.textContent  = phase.label;
    if (countEl) countEl.textContent = secondsLeft;
    if (labelEl) labelEl.textContent = phase.instruction;
    PHASES.forEach((_, i) => {
      const dot = document.getElementById(`dot-${i}`);
      if (dot && i === phaseIndex) dot.classList.add('active');
    });
  }

  function showComplete() {
    const wordEl  = document.getElementById('breath-word');
    const countEl = document.getElementById('breath-count');
    const labelEl = document.getElementById('breath-phase-label');
    if (wordEl)  wordEl.textContent  = 'Done';
    if (countEl) countEl.textContent = '✓';
    if (labelEl) labelEl.textContent = '';
    setTimeout(() => {
      const comp = document.getElementById('breath-complete');
      if (comp) comp.style.display = 'block';
    }, 500);
  }

  function _dismiss() {
    markDone(BreathingExercise._context || 'challenges');
    const overlay = document.getElementById('breathing-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.4s';
      setTimeout(() => overlay.remove(), 400);
    }
    if (BreathingExercise._onComplete) BreathingExercise._onComplete();
  }

  function dismiss() { _dismiss(); }
  function skip()    { _dismiss(); }

  return { show, start, dismiss, skip, _context: 'challenges', _onComplete: null };
})();
