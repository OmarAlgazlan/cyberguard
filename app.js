// CyberGuard — Shared App State & Utilities
// Gamified Cybersecurity Anxiety Reduction Platform
// Computer Systems Engineering Final Year Project — QMUL 2024/25

const CyberGuard = (() => {

  // ── State ──────────────────────────────────────────────────────────
  const STATE_KEY = 'cyberguard_state';

  const defaultState = {
    preAnxiety: null,        // 1–10 rating before challenges
    postAnxiety: null,       // 1–10 rating after challenges
    score: 0,
    maxScore: 0,
    challengesCompleted: [], // ['phishing', 'password', 'social']
    correctAnswers: 0,
    totalAnswers: 0,
    sessionStart: null,
    guidanceShown: [],
  };

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STATE_KEY);
      return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState, sessionStart: Date.now() };
    } catch { return { ...defaultState, sessionStart: Date.now() }; }
  }

  function saveState(state) {
    try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); }
    catch (e) { console.warn('State save failed:', e); }
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

  // ── Score ──────────────────────────────────────────────────────────
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
      return updateState({ challengesCompleted: [...s.challengesCompleted, id] });
    }
    return s;
  }

  // ── Anxiety ────────────────────────────────────────────────────────
  function setPreAnxiety(val) { return updateState({ preAnxiety: val }); }
  function setPostAnxiety(val) { return updateState({ postAnxiety: val }); }

  function getAnxietyDelta() {
    const s = loadState();
    if (s.preAnxiety === null || s.postAnxiety === null) return null;
    return s.preAnxiety - s.postAnxiety; // positive = improvement
  }

  function getAnxietyLabel(val) {
    if (val <= 2) return 'Very Low';
    if (val <= 4) return 'Low';
    if (val <= 6) return 'Moderate';
    if (val <= 8) return 'High';
    return 'Very High';
  }

  // ── Guidance messages ─────────────────────────────────────────────
  const GUIDANCE = {
    breathe: {
      title: 'Take a breath — you\'re in a safe space',
      body: 'Everything here is simulated. No real accounts or data are at risk. Mistakes are how we learn. Take your time with each scenario.'
    },
    phishing: {
      title: 'Spotting phishing — what to look for',
      body: 'Real phishing emails rely on urgency and fear. Always check: (1) the sender\'s actual email domain, (2) hover over links before clicking, (3) question any request for credentials. Feeling uncertain is normal — it means you\'re thinking carefully.'
    },
    password: {
      title: 'Passwords don\'t have to be stressful',
      body: 'A strong password is any long passphrase you can remember. Length beats complexity. Use a password manager so you never need to memorise them all. You\'re doing the right thing by learning this.'
    },
    social: {
      title: 'Social engineering targets emotions, not systems',
      body: 'Attackers create urgency, authority and fear deliberately. Recognising the pattern is the first defence. It\'s completely normal to feel tricked — even security professionals get targeted. The key is to pause and verify through a separate channel.'
    },
    confident: {
      title: 'Your confidence is growing',
      body: 'Research shows that repeated safe exposure to threat scenarios reduces anxiety significantly. Each challenge you complete builds genuine resilience. You\'re not just learning facts — you\'re rewiring your responses.'
    }
  };

  function getGuidance(key) { return GUIDANCE[key] || null; }

  // ── Accuracy ───────────────────────────────────────────────────────
  function getAccuracy() {
    const s = loadState();
    if (s.totalAnswers === 0) return 0;
    return Math.round((s.correctAnswers / s.totalAnswers) * 100);
  }

  // ── Nav score update ───────────────────────────────────────────────
  function refreshNavScore() {
    const el = document.getElementById('nav-score');
    if (el) {
      const s = loadState();
      el.textContent = `⬡ ${s.score} pts`;
    }
  }

  // ── Render nav ─────────────────────────────────────────────────────
  function renderNav(activePage) {
    const s = loadState();
    const navHtml = `
      <nav>
        <a class="nav-logo" href="index.html">Cyber<span>Guard</span></a>
        <ul class="nav-links">
          <li><a href="index.html" ${activePage==='home'?'style="color:var(--text)"':''}>Home</a></li>
          <li><a href="challenges.html" ${activePage==='challenges'?'style="color:var(--text)"':''}>Challenges</a></li>
          <li><a href="results.html" ${activePage==='results'?'style="color:var(--text)"':''}>Results</a></li>
        </ul>
        <div class="nav-score" id="nav-score">⬡ ${s.score} pts</div>
      </nav>`;
    document.body.insertAdjacentHTML('afterbegin', navHtml);
  }

  // ── Utility ────────────────────────────────────────────────────────
  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

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

  return {
    getState, updateState, resetState,
    addScore, recordAnswer, markChallengeComplete,
    setPreAnxiety, setPostAnxiety, getAnxietyDelta, getAnxietyLabel,
    getGuidance, getAccuracy,
    renderNav, refreshNavScore,
    sleep, animateValue
  };
})();
