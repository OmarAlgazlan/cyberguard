// ═══════════════════════════════════════════════════════════════
// CyberGuard, Auth UI Module
// Handles login/register modal, nav bar user state,
// and result saving on session completion.
// ═══════════════════════════════════════════════════════════════

const CyberGuardAuth = (() => {

  function buildAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'auth-modal';
    modal.style.cssText = `
      position:fixed;inset:0;z-index:300;
      background:rgba(8,12,16,0.92);
      display:flex;align-items:center;justify-content:center;
      animation:fadeIn 0.2s ease;
    `;
    modal.innerHTML = `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;
                  padding:2rem;width:100%;max-width:400px;position:relative">
        <button onclick="CyberGuardAuth.closeModal()" style="position:absolute;top:1rem;right:1rem;
          background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:1.1rem">✕</button>

        <div style="text-align:center;margin-bottom:1.5rem">
          <div style="font-size:1.5rem;margin-bottom:0.5rem">🔐</div>
          <h2 style="font-size:1.2rem;margin-bottom:0.25rem" id="modal-title">Save your progress</h2>
          <p style="font-size:0.82rem;color:var(--text-muted)" id="modal-subtitle">
            Create an account to save results and share your score.
          </p>
        </div>

        <div id="auth-error" style="display:none;background:rgba(255,59,59,0.08);border:1px solid rgba(255,59,59,0.25);
             border-radius:4px;padding:0.6rem 0.75rem;font-size:0.82rem;color:var(--red);margin-bottom:1rem"></div>

        <div id="register-form">
          <input id="auth-name" placeholder="Display name" style="width:100%;background:var(--surface2);border:1px solid var(--border);
            border-radius:4px;padding:0.65rem 0.75rem;color:var(--text);font-family:inherit;font-size:0.9rem;margin-bottom:0.75rem;box-sizing:border-box"/>
          <input id="auth-email" type="email" placeholder="Email address" style="width:100%;background:var(--surface2);border:1px solid var(--border);
            border-radius:4px;padding:0.65rem 0.75rem;color:var(--text);font-family:inherit;font-size:0.9rem;margin-bottom:0.75rem;box-sizing:border-box"/>
          <input id="auth-password" type="password" placeholder="Password (min 8 characters)" style="width:100%;background:var(--surface2);border:1px solid var(--border);
            border-radius:4px;padding:0.65rem 0.75rem;color:var(--text);font-family:inherit;font-size:0.9rem;margin-bottom:1rem;box-sizing:border-box"/>
          <button onclick="CyberGuardAuth.submitRegister()" class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:0.75rem">
            Create Account and Save Results
          </button>
          <p style="text-align:center;font-size:0.8rem;color:var(--text-muted)">
            Already have an account?
            <button onclick="CyberGuardAuth.switchToLogin()" style="background:none;border:none;color:var(--blue-bright);cursor:pointer;font-size:0.8rem;padding:0">Sign in</button>
          </p>
        </div>

        <div id="login-form" style="display:none">
          <input id="login-email" type="email" placeholder="Email address" style="width:100%;background:var(--surface2);border:1px solid var(--border);
            border-radius:4px;padding:0.65rem 0.75rem;color:var(--text);font-family:inherit;font-size:0.9rem;margin-bottom:0.75rem;box-sizing:border-box"/>
          <input id="login-password" type="password" placeholder="Password" style="width:100%;background:var(--surface2);border:1px solid var(--border);
            border-radius:4px;padding:0.65rem 0.75rem;color:var(--text);font-family:inherit;font-size:0.9rem;margin-bottom:1rem;box-sizing:border-box"/>
          <button onclick="CyberGuardAuth.submitLogin()" class="btn btn-primary" style="width:100%;justify-content:center;margin-bottom:0.75rem">
            Sign In
          </button>
          <p style="text-align:center;font-size:0.8rem;color:var(--text-muted)">
            No account?
            <button onclick="CyberGuardAuth.switchToRegister()" style="background:none;border:none;color:var(--blue-bright);cursor:pointer;font-size:0.8rem;padding:0">Create one</button>
          </p>
        </div>

        <p style="text-align:center;font-size:0.75rem;color:var(--text-dim);margin-top:1rem">
          Or <button onclick="CyberGuardAuth.continueAsGuest()" style="background:none;border:none;color:var(--text-dim);cursor:pointer;font-size:0.75rem;text-decoration:underline;padding:0">continue as guest</button> without saving
        </p>
      </div>
    `;
    return modal;
  }

  function showError(msg) {
    const el = document.getElementById('auth-error');
    if (el) { el.textContent = msg; el.style.display = 'block'; }
  }

  function hideError() {
    const el = document.getElementById('auth-error');
    if (el) el.style.display = 'none';
  }

  function openModal() {
    if (document.getElementById('auth-modal')) return;
    document.body.appendChild(buildAuthModal());
  }

  function closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.remove();
  }

  function switchToLogin() {
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('modal-title').textContent = 'Welcome back';
    document.getElementById('modal-subtitle').textContent = 'Sign in to view your history and save new results.';
    hideError();
  }

  function switchToRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('modal-title').textContent = 'Save your progress';
    document.getElementById('modal-subtitle').textContent = 'Create an account to save results and share your score.';
    hideError();
  }

  async function submitRegister() {
    hideError();
    const name  = document.getElementById('auth-name')?.value?.trim();
    const email = document.getElementById('auth-email')?.value?.trim();
    const pass  = document.getElementById('auth-password')?.value;

    if (!name || !email || !pass) return showError('Please fill in all fields');

    try {
      await CyberGuardAPI.register(email, pass, name);
      closeModal();
      updateNavBar();
      // Auto-save results after registration
      const state = CyberGuard.getState();
      const saved = await CyberGuardAPI.saveResults(state);
      if (saved) showShareBanner(saved.share_url);
    } catch (err) {
      showError(err.message);
    }
  }

  async function submitLogin() {
    hideError();
    const email = document.getElementById('login-email')?.value?.trim();
    const pass  = document.getElementById('login-password')?.value;

    if (!email || !pass) return showError('Please enter your email and password');

    try {
      await CyberGuardAPI.login(email, pass);
      closeModal();
      updateNavBar();
      const state = CyberGuard.getState();
      const saved = await CyberGuardAPI.saveResults(state);
      if (saved) showShareBanner(saved.share_url);
    } catch (err) {
      showError(err.message);
    }
  }

  function continueAsGuest() { closeModal(); }

  function showShareBanner(shareUrl) {
    const existing = document.getElementById('share-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'share-banner';
    banner.style.cssText = `
      position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);
      background:var(--surface);border:1px solid rgba(63,185,80,0.3);
      border-radius:8px;padding:1rem 1.25rem;z-index:200;
      box-shadow:0 4px 24px rgba(0,0,0,0.4);max-width:380px;width:90%;
      animation:fadeIn 0.3s ease;
    `;
    banner.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem">
        <span style="font-size:1.1rem">✅</span>
        <div>
          <div style="font-size:0.88rem;font-weight:700;color:var(--green)">Results saved!</div>
          <div style="font-size:0.78rem;color:var(--text-muted)">Share your score with this link:</div>
        </div>
      </div>
      <div style="display:flex;gap:0.5rem">
        <input id="share-url-input" value="${shareUrl}" readonly
          style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:4px;
                 padding:0.4rem 0.6rem;font-family:'Space Mono',monospace;font-size:0.7rem;color:var(--text-muted)"/>
        <button onclick="CyberGuardAuth.copyShareUrl('${shareUrl}')"
          style="background:var(--blue);color:white;border:none;border-radius:4px;
                 padding:0.4rem 0.75rem;font-size:0.78rem;cursor:pointer;white-space:nowrap">
          Copy Link
        </button>
      </div>
      <button onclick="this.parentElement.remove()"
        style="position:absolute;top:0.5rem;right:0.75rem;background:none;border:none;
               color:var(--text-dim);cursor:pointer;font-size:0.9rem">✕</button>
    `;
    document.body.appendChild(banner);
    setTimeout(() => { if (banner.parentNode) banner.remove(); }, 8000);
  }

  function copyShareUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.querySelector('#share-banner button');
      if (btn) { btn.textContent = 'Copied!'; btn.style.background = 'var(--green)'; }
    });
  }

  function updateNavBar() {
    const user = CyberGuardAPI.getUser();
    const authBtn = document.getElementById('nav-auth-btn');
    if (!authBtn) return;

    if (user) {
      authBtn.textContent = user.display_name;
      authBtn.style.color = 'var(--green)';
      authBtn.onclick = () => {
        if (confirm('Sign out?')) { CyberGuardAPI.logout(); updateNavBar(); }
      };
    } else {
      authBtn.textContent = 'Save Progress';
      authBtn.style.color = 'var(--text-muted)';
      authBtn.onclick = openModal;
    }
  }

  function init() {
    updateNavBar();
  }

  return {
    openModal, closeModal,
    switchToLogin, switchToRegister,
    submitRegister, submitLogin,
    continueAsGuest, copyShareUrl,
    updateNavBar, init,
    showShareBanner,
  };
})();
