// ═══════════════════════════════════════════════════════════
// CyberGuard — Box Breathing Module
// Physiological anxiety regulation via controlled breathing
// Evidence base: Jerath et al. (2006); US Navy SEAL tactical
// breathing protocol (4-4-4-4 pattern)
// ═══════════════════════════════════════════════════════════

const BreathingExercise = (() => {

  const PHASES = [
    { label: 'Breathe In',  seconds: 4, instruction: 'Inhale slowly through your nose' },
    { label: 'Hold',        seconds: 4, instruction: 'Hold gently — stay relaxed'       },
    { label: 'Breathe Out', seconds: 4, instruction: 'Exhale slowly through your mouth' },
    { label: 'Hold',        seconds: 4, instruction: 'Rest — let your body settle'       },
  ];

  const STATE_KEY = 'cg_breathing_done';

  function alreadyDone() {
    try { return sessionStorage.getItem(STATE_KEY) === '1'; } catch { return false; }
  }

  function markDone() {
    try { sessionStorage.setItem(STATE_KEY, '1'); } catch {}
  }

  function buildOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'breathing-overlay';
    overlay.id = 'breathing-overlay';

    overlay.innerHTML = `
      <div class="breath-title">Before you begin</div>
      <div class="breath-subtitle" id="breath-subtitle">
        Take one minute to calm your mind. This exercise has been shown to reduce anxiety and improve decision-making.
      </div>

      <div class="box-container" id="box-container">
        <svg class="box-svg" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
          <rect class="box-path" id="box-path" x="20" y="20" width="180" height="180" rx="4"/>
        </svg>
        <div class="box-glow" id="box-glow"></div>
        <div class="breath-instruction">
          <div class="breath-word" id="breath-word">Ready?</div>
          <div class="breath-count" id="breath-count">—</div>
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
          <button class="breath-skip" onclick="BreathingExercise.skip()">Skip — I'm already calm</button>
        </div>
      </div>

      <div id="breath-complete" style="display:none">
        <div class="breath-complete-msg">
          <h3>💚 Well done</h3>
          <p>Your breathing rate has slowed and your focus is sharper.<br>You're ready to begin.</p>
          <button class="btn btn-primary" onclick="BreathingExercise.dismiss()">Start the Challenges →</button>
        </div>
      </div>
    `;

    return overlay;
  }

  function show(onComplete) {
    if (alreadyDone()) { onComplete(); return; }

    const overlay = buildOverlay();
    document.body.appendChild(overlay);
    BreathingExercise._onComplete = onComplete;
  }

  function start() {
    document.getElementById('breath-start-btn').parentElement.style.display = 'none';
    document.getElementById('breath-subtitle').textContent =
      'Follow the guide below. Each side of the square = 4 seconds.';

    const path = document.getElementById('box-path');
    path.classList.add('animate');

    let phaseIndex = 0;
    let secondsLeft = PHASES[0].seconds;

    updateDisplay(phaseIndex, secondsLeft);

    const interval = setInterval(() => {
      secondsLeft--;

      if (secondsLeft <= 0) {
        // Mark this phase done
        const dot = document.getElementById(`dot-${phaseIndex}`);
        if (dot) dot.classList.remove('active');
        if (dot) dot.classList.add('done');

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
    const wordEl = document.getElementById('breath-word');
    const countEl = document.getElementById('breath-count');
    const labelEl = document.getElementById('breath-phase-label');

    if (wordEl) wordEl.textContent = phase.label;
    if (countEl) countEl.textContent = secondsLeft;
    if (labelEl) labelEl.textContent = phase.instruction;

    // Update dots
    PHASES.forEach((_, i) => {
      const dot = document.getElementById(`dot-${i}`);
      if (!dot) return;
      if (i === phaseIndex) dot.classList.add('active');
    });
  }

  function showComplete() {
    const word = document.getElementById('breath-word');
    const count = document.getElementById('breath-count');
    const label = document.getElementById('breath-phase-label');
    if (word) word.textContent = 'Done';
    if (count) count.textContent = '✓';
    if (label) label.textContent = '';

    setTimeout(() => {
      document.getElementById('breath-complete').style.display = 'block';
    }, 500);
  }

  function dismiss() {
    markDone();
    const overlay = document.getElementById('breathing-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.4s';
      setTimeout(() => overlay.remove(), 400);
    }
    if (BreathingExercise._onComplete) BreathingExercise._onComplete();
  }

  function skip() {
    markDone();
    const overlay = document.getElementById('breathing-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.3s';
      setTimeout(() => overlay.remove(), 300);
    }
    if (BreathingExercise._onComplete) BreathingExercise._onComplete();
  }

  return { show, start, dismiss, skip, _onComplete: null };
})();
