/* ============================================================
   F1 FORGE — auth.js
   Login & Signup — API version
   ============================================================ */

const API = 'https://f1-forge.onrender.com/api/auth';

// --- HELPERS ---
function showMsg(id, message, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = 'form-message ' + type;
}

function clearMsg(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '';
  el.className = 'form-message';
}

function setInputState(input, state) {
  input.classList.remove('error', 'success');
  if (state) input.classList.add(state);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// --- LOGIN ---
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email    = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    const btn      = document.getElementById('loginBtn');

    clearMsg('emailMsg');
    clearMsg('passwordMsg');
    let valid = true;

    if (!validateEmail(email.value)) {
      showMsg('emailMsg', 'Enter a valid email address.', 'error');
      setInputState(email, 'error');
      valid = false;
    }

    if (password.value.length < 6) {
      showMsg('passwordMsg', 'Password must be at least 6 characters.', 'error');
      setInputState(password, 'error');
      valid = false;
    }

    if (!valid) return;

    btn.textContent = 'LOGGING IN...';
    btn.disabled    = true;

    try {
      const res  = await fetch(`${API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.value, password: password.value })
      });

      const data = await res.json();

      if (!res.ok) {
        showMsg('emailMsg', data.message || 'Login failed.', 'error');
        setInputState(email, 'error');
        setInputState(password, 'error');
        btn.textContent = 'LOGIN →';
        btn.disabled    = false;
        return;
      }

      localStorage.setItem('f1forge_token', data.token);
      localStorage.setItem('f1forge_user',  JSON.stringify(data.user));

      window.location.href = 'index.html';

    } catch (err) {
      showMsg('emailMsg', 'Server error. Try again.', 'error');
      btn.textContent = 'LOGIN →';
      btn.disabled    = false;
    }
  });
}

// --- SIGNUP ---
const signupForm = document.getElementById('signupForm');

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('signupUsername');
    const email    = document.getElementById('signupEmail');
    const password = document.getElementById('signupPassword');
    const confirm  = document.getElementById('signupConfirm');
    const btn      = document.getElementById('signupBtn');

    clearMsg('usernameMsg');
    clearMsg('emailMsg');
    clearMsg('passwordMsg');
    clearMsg('confirmMsg');

    let valid = true;

    if (username.value.trim().length < 3) {
      showMsg('usernameMsg', 'Username must be at least 3 characters.', 'error');
      setInputState(username, 'error');
      valid = false;
    } else { setInputState(username, 'success'); }

    if (!validateEmail(email.value)) {
      showMsg('emailMsg', 'Enter a valid email address.', 'error');
      setInputState(email, 'error');
      valid = false;
    } else { setInputState(email, 'success'); }

    if (password.value.length < 6) {
      showMsg('passwordMsg', 'Password must be at least 6 characters.', 'error');
      setInputState(password, 'error');
      valid = false;
    } else { setInputState(password, 'success'); }

    if (confirm.value !== password.value) {
      showMsg('confirmMsg', 'Passwords do not match.', 'error');
      setInputState(confirm, 'error');
      valid = false;
    } else if (confirm.value) { setInputState(confirm, 'success'); }

    if (!valid) return;

    btn.textContent = 'CREATING ACCOUNT...';
    btn.disabled    = true;

    try {
      const res  = await fetch(`${API}/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          username: username.value.trim(),
          email:    email.value,
          password: password.value
        })
      });

      const data = await res.json();

      if (!res.ok) {
        const field = data.message.toLowerCase().includes('email') ? 'emailMsg' : 'usernameMsg';
        showMsg(field, data.message, 'error');
        btn.textContent = 'CREATE ACCOUNT →';
        btn.disabled    = false;
        return;
      }

      localStorage.setItem('f1forge_token', data.token);
      localStorage.setItem('f1forge_user',  JSON.stringify(data.user));

      window.location.href = 'teambuilder.html';

    } catch (err) {
      showMsg('emailMsg', 'Server error. Try again.', 'error');
      btn.textContent = 'CREATE ACCOUNT →';
      btn.disabled    = false;
    }
  });
}
