// ═══════════════════════════════════════════════════════════════════
// CyberGuard — Anxiety Regulation Techniques 2 & 3
//
// Technique 2: Cognitive Reappraisal
//   Evidence: Gross (2002) — reappraising a situation as less
//   threatening before responding reduces emotional reactivity.
//   Aldao et al. (2010) — cognitive reappraisal is the most
//   adaptive emotion regulation strategy across clinical contexts.
//   Implementation: 2-second mandatory pause + reappraisal prompt
//   before answer choices become interactive.
//
// Technique 3: Confidence Scaffolding via Progressive Difficulty
//   Evidence: Bandura (1977) self-efficacy theory — early success
//   experiences build confidence and reduce anxiety for harder tasks.
//   Csikszentmihalyi (1990) flow theory — optimal challenge level
//   matches skill, reducing both boredom and anxiety.
//   Implementation: difficulty badges + streak messages +
//   confidence meter that fills as correct answers accumulate.
// ═══════════════════════════════════════════════════════════════════

const AnxietyRegulation = (() => {

  // ── Technique 2: Cognitive Reappraisal ──────────────────────────
  // Reappraisal messages — injected before choices become active.
  // Each is scenario-context-aware where possible, but all share
  // the core reframe: this is safe, you have time, you cannot fail.
  const REAPPRAISAL_MESSAGES = [
    {
      icon: '🧠',
      text: '<strong>Before you choose:</strong> You\'re in a completely safe training environment. Nothing you click here affects any real account, money, or data. Take a moment — there\'s no timer.'
    },
    {
      icon: '💙',
      text: '<strong>A quick thought:</strong> Even cybersecurity professionals get these wrong sometimes. This is how everyone learns. Read carefully, trust your instincts, and choose.'
    },
    {
      icon: '🔍',
      text: '<strong>Pause and look:</strong> What\'s the worst that could realistically happen from choosing wrong here? Nothing — it\'s a simulation. That calm is the skill you\'re building.'
    },
    {
      icon: '✋',
      text: '<strong>One second:</strong> Attackers rely on you acting fast without thinking. Right now, you have all the time you need. That\'s already an advantage over real life.'
    },
    {
      icon: '💡',
      text: '<strong>Reframe:</strong> Instead of "what\'s the right answer?" try "what would I regret doing?" That question often cuts straight through the uncertainty.'
    },
  ];

  let reappraisalIndex = 0;

  // Inject reappraisal banner above choices and lock them for 2 seconds
  function injectReappraisal(choicesContainer) {
    const msg = REAPPRAISAL_MESSAGES[reappraisalIndex % REAPPRAISAL_MESSAGES.length];
    reappraisalIndex++;

    // Build the banner
    const banner = document.createElement('div');
    banner.className = 'reappraisal-banner';
    banner.innerHTML = `
      <span class="reappraisal-icon">${msg.icon}</span>
      <div class="reappraisal-text">${msg.text}</div>
    `;

    // Build the unlock timer
    const timer = document.createElement('div');
    timer.className = 'unlock-timer';
    timer.textContent = 'Choices unlock in 2 seconds...';

    // Insert before choices
    choicesContainer.parentNode.insertBefore(banner, choicesContainer);
    choicesContainer.parentNode.insertBefore(timer, choicesContainer);

    // Lock choices
    choicesContainer.classList.add('choices-locked');

    // Unlock after 2 seconds
    let count = 2;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        choicesContainer.classList.remove('choices-locked');
        choicesContainer.classList.add('unlocked');
        timer.textContent = ''; // Clear timer text
      } else {
        timer.textContent = `Choices unlock in ${count} second${count !== 1 ? 's' : ''}...`;
      }
    }, 1000);
  }

  // ── Technique 3: Confidence Scaffolding ─────────────────────────

  // Difficulty levels for each module's scenarios (0-indexed)
  // Ordered easy → hard so first scenario always builds confidence
  const DIFFICULTY = {
    phishing: ['easy', 'easy', 'medium', 'medium', 'hard'],
    password: ['easy', 'medium', 'medium', 'hard'],
    social:   ['easy', 'medium', 'medium', 'hard', 'hard'],
  };

  const DIFFICULTY_LABELS = {
    easy:   { label: '● Beginner',     emoji: '🟢' },
    medium: { label: '●● Intermediate', emoji: '🟡' },
    hard:   { label: '●●● Advanced',   emoji: '🔴' },
  };

  // Streak messages — shown after consecutive correct answers
  const STREAK_MESSAGES = [
    null, // 0 streak — nothing
    null, // 1 correct — nothing yet
    { emoji: '🔥', text: '2 in a row — you\'re getting it.' },
    { emoji: '⚡', text: '3 correct — your pattern recognition is sharp.' },
    { emoji: '🛡️', text: '4 correct — you\'re thinking like a defender.' },
    { emoji: '🏆', text: '5 in a row — outstanding awareness.' },
  ];

  let currentStreak = 0;
  let totalCorrectInModule = 0;

  function resetStreak() {
    currentStreak = 0;
    totalCorrectInModule = 0;
    reappraisalIndex = 0;
  }

  function recordResult(correct) {
    if (correct) {
      currentStreak++;
      totalCorrectInModule++;
    } else {
      currentStreak = 0;
    }
  }

  // Build difficulty badge HTML
  function getDifficultyBadge(moduleId, scenarioIndex) {
    const difficulties = DIFFICULTY[moduleId] || [];
    const level = difficulties[scenarioIndex] || 'medium';
    const info = DIFFICULTY_LABELS[level];
    return `<div class="difficulty-badge ${level}">${info.emoji} ${info.label}</div>`;
  }

  // Build confidence meter HTML
  function getConfidenceMeter(moduleId, scenarioIndex) {
    const totalScenarios = (DIFFICULTY[moduleId] || []).length;
    const pct = totalScenarios > 0
      ? Math.min(100, Math.round((totalCorrectInModule / totalScenarios) * 100))
      : 0;

    return `
      <div class="confidence-meter-wrap">
        <div class="confidence-meter-label">
          <span>Confidence Level</span>
          <span>${pct}%</span>
        </div>
        <div class="confidence-meter-bar">
          <div class="confidence-meter-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  }

  // Show streak banner if applicable
  function showStreakBanner() {
    const existing = document.getElementById('streak-banner');
    if (existing) existing.remove();

    const msg = STREAK_MESSAGES[Math.min(currentStreak, STREAK_MESSAGES.length - 1)];
    if (!msg) return;

    const banner = document.createElement('div');
    banner.id = 'streak-banner';
    banner.className = 'streak-banner show';
    banner.innerHTML = `<span>${msg.emoji}</span><span>${msg.text}</span>`;

    // Insert after the feedback box so it persists between scenarios
    const feedback = document.getElementById('feedback');
    if (feedback && feedback.parentNode) {
      feedback.parentNode.insertBefore(banner, feedback.nextSibling);
    }
  }

  return {
    injectReappraisal,
    getDifficultyBadge,
    getConfidenceMeter,
    showStreakBanner,
    recordResult,
    resetStreak,
    get currentStreak() { return currentStreak; },
    get totalCorrect() { return totalCorrectInModule; },
  };
})();
