// CyberGuard — Shared App State & Utilities
// Gamified Cybersecurity Anxiety Reduction Platform
// Computer Systems Engineering Final Year Project — QMUL 2025/26

const CyberGuard = (() => {

  const STATE_KEY = 'cyberguard_state';

  const defaultState = {
    preAnxiety: null,
    postAnxiety: null,
    score: 0,
    maxScore: 0,
    challengesCompleted: [],
    correctAnswers: 0,
    totalAnswers: 0,
    sessionStart: null,
    moduleProgress: { phishing: 0, password: 0, social: 0 },
  };

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STATE_KEY);
      if (!raw) return { ...defaultState, sessionStart: Date.now() };
      const saved = JSON.parse(raw);
      return {
        ...defaultState,
        ...saved,
        moduleProgress: { ...defaultState.moduleProgress, ...(saved.moduleProgress || {}) },
      };
    } catch { return { ...defaultState, sessionStart: Date.now() }; }
  }

  function saveState(state) {
    try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn('CyberGuard: state save failed', e); }
  }

  function getState() { return loadState(); }

  function updateState(patch) {
    const state = loadState();
    const next = { ...state, ...patch };
    saveState(next);
    return next;
  }

  function resetState() {
    sessionStorage.removeItem(STATE_KEY);
    return { ...defaultState, sessionStart: Date.now() };
  }

  // Fix for refresh bug: save and restore scenario position per module
  function saveModuleProgress(moduleId, scenarioIndex) {
    const s = loadState();
    const mp = { ...s.moduleProgress, [moduleId]: scenarioIndex };
    return updateState({ moduleProgress: mp });
  }

  function getModuleProgress(moduleId) {
    return loadState().moduleProgress[moduleId] || 0;
  }

  function addScore(points) {
    const s = loadState();
    return updateState({ score: s.score + points, maxScore: s.maxScore + points });
  }

  function recordAnswer(correct) {
    const s = loadState();
    return updateState({
      correctAnswers: s.correctAnswers + (correct ? 1 : 0),
      totalAnswers: s.totalAnswers + 1,
    });
  }

  function markChallengeComplete(id) {
    const s = loadState();
    if (!s.challengesCompleted.includes(id)) {
      const mp = { ...s.moduleProgress, [id]: 0 };
      return updateState({ challengesCompleted: [...s.challengesCompleted, id], moduleProgress: mp });
    }
    return s;
  }

  function setPreAnxiety(val) { return updateState({ preAnxiety: val }); }
  function setPostAnxiety(val) { return updateState({ postAnxiety: val }); }

  function getAnxietyDelta() {
    const s = loadState();
    if (s.preAnxiety === null || s.postAnxiety === null) return null;
    return s.preAnxiety - s.postAnxiety;
  }

  function getAnxietyLabel(val) {
    if (val <= 2) return 'Very Low';
    if (val <= 4) return 'Low';
    if (val <= 6) return 'Moderate';
    if (val <= 8) return 'High';
    return 'Very High';
  }

  // All guidance written in plain, calm language for non-technical users
  const GUIDANCE = {
    breathe: {
      icon: '💙',
      title: "Take a breath — you're completely safe here",
      body: "Nothing you do in this training can cause real harm. There are no real accounts, no real money, and no real data at risk. Every mistake is just a learning moment. Take your time with each question — slow and careful beats fast and wrong every time.",
    },
    phishing: {
      icon: '💙',
      title: "Don't worry — spotting fake emails takes practice",
      body: "Phishing emails are designed by professionals to trick people. Even cybersecurity experts get fooled sometimes. The key habit: always check the actual email address (not just the sender name shown), and never click a link when you're unsure — go directly to the website yourself instead. The more you practise, the more natural this becomes.",
    },
    password: {
      icon: '💙',
      title: "Passwords don't have to be stressful",
      body: "Most people find passwords overwhelming — you're not alone in that. The good news: you don't need to memorise complex passwords. A password manager app stores them all safely for you. The one golden rule is simple: never use the same password on more than one account. If one gets stolen, the others stay safe.",
    },
    social: {
      icon: '💙',
      title: "Getting tricked doesn't mean you're not smart",
      body: "Social engineering works by targeting emotions — urgency, fear, wanting to help, trusting authority. These are completely normal human responses. Attackers spend a long time crafting these traps specifically to bypass careful thinking. The only defence is one simple habit: when something unexpected asks you to act fast, slow down instead. Verify through a separate channel — call back on a number you look up yourself.",
    },
    confident: {
      icon: '💚',
      title: "You're building real confidence",
      body: "Practising with simulated threats — exactly what you're doing right now — is proven to reduce real anxiety over time. Each scenario you complete makes the next one feel less scary. You're not just learning facts, you're changing how your brain responds to these situations. Keep going.",
    },
  };

  function getGuidance(key) { return GUIDANCE[key] || GUIDANCE.breathe; }

  function getAccuracy() {
    const s = loadState();
    if (s.totalAnswers === 0) return 0;
    return Math.round((s.correctAnswers / s.totalAnswers) * 100);
  }

  function refreshNavScore() {
    const el = document.getElementById('nav-score');
    if (el) el.textContent = `⬡ ${loadState().score} pts`;
  }

  // Cubic ease-out animation for results counter
  function animateValue(el, start, end, duration) {
    const range = end - start;
    const startTime = performance.now();
    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + range * ease);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  return {
    getState, updateState, resetState,
    saveModuleProgress, getModuleProgress,
    addScore, recordAnswer, markChallengeComplete,
    setPreAnxiety, setPostAnxiety, getAnxietyDelta, getAnxietyLabel,
    getGuidance, getAccuracy,
    refreshNavScore, animateValue, sleep,
  };
})();
