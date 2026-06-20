/* ============================================================
   F1 FORGE — auth.js
   Login & Signup validation
   ============================================================ */

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

// --- VALIDATION RULES ---
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

function validateUsername(username) {
  return username.trim().length >= 3;
}

// --- LOGIN ---
const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email    = document.getElementById('loginEmail');
    const password = document.getElementById('loginPassword');
    let valid = true;

    clearMsg('emailMsg');
    clearMsg('passwordMsg');

    if (!validateEmail(email.value)) {
      showMsg('emailMsg', 'Enter a valid email address.', 'error');
      setInputState(email, 'error');
      valid = false;
    } else {
      setInputState(email, 'success');
    }

    if (!validatePassword(password.value)) {
      showMsg('passwordMsg', 'Password must be at least 6 characters.', 'error');
      setInputState(password, 'error');
      valid = false;
    } else {
      setInputState(password, 'success');
    }

    if (!valid) return;

    // Phase 1: localStorage check
    const users = JSON.parse(localStorage.getItem('f1forge_users') || '[]');
    const user  = users.find(u => u.email === email.value && u.password === password.value);

    if (!user) {
      showMsg('emailMsg', 'Incorrect email or password.', 'error');
      setInputState(email, 'error');
      setInputState(password, 'error');
      return;
    }

    localStorage.setItem('f1forge_current', JSON.stringify(user));
    window.location.href = 'index.html';
  });
}

// --- SIGNUP ---
const signupForm = document.getElementById('signupForm');

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = document.getElementById('signupUsername');
    const email    = document.getElementById('signupEmail');
    const password = document.getElementById('signupPassword');
    const confirm  = document.getElementById('signupConfirm');
    let valid = true;

    clearMsg('usernameMsg');
    clearMsg('emailMsg');
    clearMsg('passwordMsg');
    clearMsg('confirmMsg');

    if (!validateUsername(username.value)) {
      showMsg('usernameMsg', 'Username must be at least 3 characters.', 'error');
      setInputState(username, 'error');
      valid = false;
    } else {
      setInputState(username, 'success');
    }

    if (!validateEmail(email.value)) {
      showMsg('emailMsg', 'Enter a valid email address.', 'error');
      setInputState(email, 'error');
      valid = false;
    } else {
      setInputState(email, 'success');
    }

    if (!validatePassword(password.value)) {
      showMsg('passwordMsg', 'Password must be at least 6 characters.', 'error');
      setInputState(password, 'error');
      valid = false;
    } else {
      setInputState(password, 'success');
    }

    if (confirm.value !== password.value) {
      showMsg('confirmMsg', 'Passwords do not match.', 'error');
      setInputState(confirm, 'error');
      valid = false;
    } else if (confirm.value) {
      setInputState(confirm, 'success');
    }

    if (!valid) return;

    // Phase 1: localStorage
    const users = JSON.parse(localStorage.getItem('f1forge_users') || '[]');

    if (users.find(u => u.email === email.value)) {
      showMsg('emailMsg', 'An account with this email already exists.', 'error');
      setInputState(email, 'error');
      return;
    }

    const newUser = {
      username: username.value.trim(),
      email:    email.value,
      password: password.value,
      points:   0,
      team:     null,
      joined:   new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('f1forge_users', JSON.stringify(users));
    localStorage.setItem('f1forge_current', JSON.stringify(newUser));

    window.location.href = 'teambuilder.html';
  });
}