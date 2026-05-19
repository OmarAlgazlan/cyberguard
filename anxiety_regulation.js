// ═══════════════════════════════════════════════════════════════════
// CyberGuard, Anxiety Regulation Techniques 2, 3 & 4
//
// Technique 2: Cognitive Reappraisal (before each scenario choice)
//   Evidence: Gross (2002); Aldao, Nolen-Hoeksema & Schweizer (2010)
//   Implementation: 2-second pause + rotating reappraisal prompt
//
// Technique 3: Confidence Scaffolding via Progressive Difficulty
//   Evidence: Bandura (1977); Csikszentmihalyi (1990)
//   Implementation: difficulty badges + confidence meter + streaks
//
// Technique 4: Three-Layer Wrong-Answer Response
//   Layer A, Red feedback: what happened and why (cognitive)
//   Layer B, Amber reassurance: blame removal (emotional reframe)
//   Layer C, Blue guidance: specific knowledge to take away
//   Evidence: Gross (2002), emotional reframe must precede
//   cognitive content to be effective. Johnston & Warkentin (2010)
//  , fear-based messaging increases avoidance, not protection.
// ═══════════════════════════════════════════════════════════════════

const AnxietyRegulation = (() => {

  // ── Technique 2: Cognitive Reappraisal ──────────────────────────
  const REAPPRAISAL_MESSAGES = [
    {
      icon: '🧠',
      text: '<strong>Before you choose:</strong> You\'re in a completely safe training environment. Nothing you click here affects any real account, money, or data. Take a moment, there\'s no timer.'
    },
    {
      icon: '💙',
      text: '<strong>A quick thought:</strong> Even cybersecurity professionals get these wrong sometimes. This is how everyone learns. Read carefully, trust your instincts, and choose.'
    },
    {
      icon: '🔍',
      text: '<strong>Pause and look:</strong> What\'s the worst that could realistically happen from choosing wrong here? Nothing, it\'s a simulation. That calm is the skill you\'re building.'
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

  function injectReappraisal(choicesContainer) {
    const msg = REAPPRAISAL_MESSAGES[reappraisalIndex % REAPPRAISAL_MESSAGES.length];
    reappraisalIndex++;

    const banner = document.createElement('div');
    banner.className = 'reappraisal-banner';
    banner.innerHTML = `
      <span class="reappraisal-icon">${msg.icon}</span>
      <div class="reappraisal-text">${msg.text}</div>
    `;

    const timer = document.createElement('div');
    timer.className = 'unlock-timer';
    timer.textContent = 'Choices unlock in 2 seconds...';

    choicesContainer.parentNode.insertBefore(banner, choicesContainer);
    choicesContainer.parentNode.insertBefore(timer, choicesContainer);
    choicesContainer.classList.add('choices-locked');

    let count = 2;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        choicesContainer.classList.remove('choices-locked');
        choicesContainer.classList.add('unlocked');
        timer.textContent = '';
      } else {
        timer.textContent = `Choices unlock in ${count} second${count !== 1 ? 's' : ''}...`;
      }
    }, 1000);
  }

  // ── Technique 3: Confidence Scaffolding ─────────────────────────
  const DIFFICULTY = {
    phishing: ['easy', 'easy', 'medium', 'medium', 'hard'],
    password: ['easy', 'medium', 'medium', 'hard'],
    social:        ['easy', 'medium', 'medium', 'hard', 'hard'],
    malvertising:  ['easy', 'medium', 'medium', 'hard'],
    'ai-injection': ['easy', 'medium', 'medium', 'hard'],
  };

  const DIFFICULTY_LABELS = {
    easy:   { label: '● Beginner',      emoji: '🟢' },
    medium: { label: '●● Intermediate', emoji: '🟡' },
    hard:   { label: '●●● Advanced',   emoji: '🔴' },
  };

  const STREAK_MESSAGES = [
    null,
    null,
    { emoji: '🔥', text: '2 in a row, you\'re getting it.' },
    { emoji: '⚡', text: '3 correct, your pattern recognition is sharp.' },
    { emoji: '🛡️', text: '4 correct, you\'re thinking like a defender.' },
    { emoji: '🏆', text: '5 in a row, outstanding awareness.' },
  ];

  let currentStreak        = 0;
  let totalCorrectInModule = 0;

  function resetStreak() {
    currentStreak        = 0;
    totalCorrectInModule = 0;
    reappraisalIndex     = 0;
  }

  function recordResult(correct) {
    if (correct) { currentStreak++; totalCorrectInModule++; }
    else          { currentStreak = 0; }
  }

  function getDifficultyBadge(moduleId, scenarioIndex) {
    const level = (DIFFICULTY[moduleId] || [])[scenarioIndex] || 'medium';
    const info  = DIFFICULTY_LABELS[level];
    return `<div class="difficulty-badge ${level}">${info.emoji} ${info.label}</div>`;
  }

  function getConfidenceMeter(moduleId) {
    const totalScenarios = (DIFFICULTY[moduleId] || []).length;
    const pct = totalScenarios > 0
      ? Math.min(100, Math.round((totalCorrectInModule / totalScenarios) * 100))
      : 0;
    return `
      <div class="confidence-meter-wrap">
        <div class="confidence-meter-label">
          <span>Confidence Level</span><span>${pct}%</span>
        </div>
        <div class="confidence-meter-bar">
          <div class="confidence-meter-fill" style="width:${pct}%"></div>
        </div>
      </div>`;
  }

  function showStreakBanner() {
    const existing = document.getElementById('streak-banner');
    if (existing) existing.remove();
    const msg = STREAK_MESSAGES[Math.min(currentStreak, STREAK_MESSAGES.length - 1)];
    if (!msg) return;
    const banner = document.createElement('div');
    banner.id        = 'streak-banner';
    banner.className = 'streak-banner show';
    banner.innerHTML = `<span>${msg.emoji}</span><span>${msg.text}</span>`;
    const feedback = document.getElementById('feedback');
    if (feedback && feedback.parentNode) {
      feedback.parentNode.insertBefore(banner, feedback.nextSibling);
    }
  }

  // ── Technique 4: Three-Layer Wrong-Answer Reassurance ───────────
  // Rotating blame-removing messages shown between the red feedback
  // and the blue guidance box. Addresses shame/self-blame which is
  // the primary driver of avoidance behaviour in cybersecurity
  // contexts (Bada, Sasse & Nurse, 2019).
  // Placed BEFORE the technical guidance so emotional state is
  // addressed before cognitive content is delivered (Gross, 2002).

  const REASSURANCE_MESSAGES = [
    {
      text: 'These attacks are engineered by professionals specifically to fool people. Getting caught by one in a simulation is exactly how you build the instinct to avoid it in real life.',
    },
    {
      text: 'Even IT security professionals fall for well-crafted attacks. The difference between them and everyone else is not immunity, it\'s recognising the pattern afterwards. You just did that.',
    },
    {
      text: 'That scenario was deliberately designed to create urgency and bypass careful thinking. Now that you\'ve seen the tactic, your brain will flag it faster next time.',
    },
    {
      text: 'A wrong answer here is more valuable than a right one you guessed. You\'ve just identified a real gap in your awareness, and closing that gap is the entire point of this training.',
    },
    {
      text: 'The anxiety you felt before choosing was real, and intentional. Attackers engineer that feeling. Recognising that the feeling is a manipulation tactic is a defence in itself.',
    },
    {
      text: 'In a real situation, you would have had seconds. Here, you have unlimited time, full explanations, and zero consequences. That is exactly the right environment to build confidence.',
    },
    {
      text: 'No one learns cybersecurity by getting everything right. You learn by seeing how attacks work from the inside. You\'re doing that right now.',
    },
  ];

  let reassuranceIndex = 0;

  // Returns HTML for the amber reassurance layer
  function getReassuranceMessage() {
    const msg = REASSURANCE_MESSAGES[reassuranceIndex % REASSURANCE_MESSAGES.length];
    reassuranceIndex++;
    return `
      <div class="reassurance-box">
        <div class="reassurance-icon">💛</div>
        <div class="reassurance-text">${msg.text}</div>
      </div>`;
  }

  return {
    injectReappraisal,
    getDifficultyBadge,
    getConfidenceMeter,
    showStreakBanner,
    recordResult,
    resetStreak,
    getReassuranceMessage,
    get currentStreak()  { return currentStreak; },
    get totalCorrect()   { return totalCorrectInModule; },
  };
})();
