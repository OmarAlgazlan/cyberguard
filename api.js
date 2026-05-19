// ═══════════════════════════════════════════════════════════════
// CyberGuard, Frontend API Client
// Handles all communication with the Node.js backend.
// Falls back gracefully if the backend is unavailable so the
// platform remains fully functional in guest (offline) mode.
// ═══════════════════════════════════════════════════════════════

const CyberGuardAPI = (() => {

  // Update this to your Railway deployment URL after deploying
  const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://cyberguard-backend.up.railway.app'; // Update after Railway deploy

  const TOKEN_KEY = 'cg_auth_token';
  const USER_KEY  = 'cg_user';

  // ── Token management ─────────────────────────────────────────
  function getToken() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }

  function setToken(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
  }

  function clearToken() {
    try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); } catch {}
  }

  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  }

  function setUser(user) {
    try { localStorage.setItem(USER_KEY, JSON.stringify(user)); } catch {}
  }

  function isLoggedIn() { return !!getToken(); }

  // ── HTTP helpers ─────────────────────────────────────────────
  async function request(method, path, body, requiresAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (requiresAuth) {
      const token = getToken();
      if (!token) throw new Error('Not authenticated');
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
    return data;
  }

  // ── Auth ─────────────────────────────────────────────────────
  async function register(email, password, displayName) {
    const data = await request('POST', '/api/register', { email, password, display_name: displayName });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function login(email, password) {
    const data = await request('POST', '/api/login', { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    clearToken();
  }

  // ── Results ──────────────────────────────────────────────────
  async function saveResults(state) {
    if (!isLoggedIn()) return null;

    const payload = {
      pre_anxiety:       state.preAnxiety,
      post_anxiety:      state.postAnxiety,
      total_score:       state.score,
      accuracy:          CyberGuard.getAccuracy(),
      modules_completed: state.challengesCompleted.length,
      module_results:    [] // Populated from module progress if available
    };

    return await request('POST', '/api/results', payload, true);
  }

  async function getHistory() {
    if (!isLoggedIn()) return null;
    return await request('GET', '/api/results/history', null, true);
  }

  async function getSharedResult(token) {
    return await request('GET', `/api/shared/${token}`);
  }

  async function getLeaderboard() {
    return await request('GET', '/api/leaderboard');
  }

  // ── Health check ─────────────────────────────────────────────
  async function checkBackend() {
    try {
      await request('GET', '/api/health');
      return true;
    } catch { return false; }
  }

  return {
    register, login, logout,
    isLoggedIn, getUser, getToken,
    saveResults, getHistory, getSharedResult, getLeaderboard,
    checkBackend, BASE_URL,
  };
})();
