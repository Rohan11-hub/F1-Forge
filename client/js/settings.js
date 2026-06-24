/* ============================================================
   F1 FORGE — settings.js
   API version
   ============================================================ */

const TOKEN = () => localStorage.getItem('f1forge_token');
let currentUser = JSON.parse(localStorage.getItem('f1forge_user') || 'null');

// Redirect if not logged in
if (!TOKEN()) window.location.href = 'login.html';

// --- LOAD PROFILE ---
async function loadProfile() {
  try {
    const res  = await fetch('/api/auth/me', {
      headers: { 'Authorization': 'Bearer ' + TOKEN() }
    });

    if (!res.ok) {
      localStorage.removeItem('f1forge_token');
      localStorage.removeItem('f1forge_user');
      window.location.href = 'login.html';
      return;
    }

    const user = await res.json();
    currentUser = user;
    localStorage.setItem('f1forge_user', JSON.stringify(user));

    document.getElementById('profileUsername').textContent = user.username || '—';
    document.getElementById('profileEmail').textContent    = user.email    || '—';
    document.getElementById('profilePoints').textContent   = user.points   || 0;

    if (user.joined) {
      const date = new Date(user.joined);
      document.getElementById('profileJoined').textContent = date.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    }

  } catch (err) {
    console.error('Failed to load profile:', err);
  }
}

// --- LOAD TEAM ---
async function loadTeam() {
  const container = document.getElementById('currentTeam');

  try {
    const res = await fetch('/api/team', {
      headers: { 'Authorization': 'Bearer ' + TOKEN() }
    });

    if (!res.ok) {
      container.innerHTML = '<p class="settings-empty">No team saved yet. <a href="teambuilder.html">Build your team →</a></p>';
      return;
    }

    const team = await res.json();

    const [dRes, cRes] = await Promise.all([
      fetch('data/drivers.json'),
      fetch('data/constructors.json')
    ]);
    const drivers      = await dRes.json();
    const constructors = await cRes.json();

    const grid = document.createElement('div');
    grid.className = 'team-grid';

    team.drivers.forEach(id => {
      const driver  = drivers.find(d => d.id === id);
      if (!driver) return;
      const isTurbo = team.turbo === id;
      const card    = document.createElement('div');
      card.className = 'team-card' + (isTurbo ? ' turbo' : '');
      card.innerHTML = `
        <span class="team-type">DRIVER${isTurbo ? ' · ⚡ TURBO' : ''}</span>
        <span class="team-name">${driver.name.toUpperCase()}</span>
        <span class="team-price">${driver.team} · ${driver.price}M</span>
      `;
      grid.appendChild(card);
    });

    team.constructors.forEach(id => {
      const constructor = constructors.find(c => c.id === id);
      if (!constructor) return;
      const card = document.createElement('div');
      card.className = 'team-card';
      card.innerHTML = `
        <span class="team-type">CONSTRUCTOR</span>
        <span class="team-name">${constructor.name.toUpperCase()}</span>
        <span class="team-price">${constructor.price}M</span>
      `;
      grid.appendChild(card);
    });

    container.innerHTML = '';
    container.appendChild(grid);

  } catch (err) {
    container.innerHTML = '<p class="settings-empty">No team saved yet. <a href="teambuilder.html">Build your team →</a></p>';
  }
}

// --- CHANGE PASSWORD ---
document.getElementById('changePasswordBtn').addEventListener('click', async () => {
  const current = document.getElementById('currentPassword');
  const newPw   = document.getElementById('newPassword');
  const confirm = document.getElementById('confirmPassword');

  clearMessages();
  let valid = true;

  if (!current.value) {
    showMsg('currentPwMsg', 'Enter your current password.', 'error');
    current.classList.add('error');
    valid = false;
  }

  if (newPw.value.length < 6) {
    showMsg('newPwMsg', 'Password must be at least 6 characters.', 'error');
    newPw.classList.add('error');
    valid = false;
  }

  if (confirm.value !== newPw.value) {
    showMsg('confirmPwMsg', 'Passwords do not match.', 'error');
    confirm.classList.add('error');
    valid = false;
  }

  if (!valid) return;

  try {
    const res  = await fetch('/api/auth/password', {
      method:  'PUT',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + TOKEN()
      },
      body: JSON.stringify({
        currentPassword: current.value,
        newPassword:     newPw.value
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showMsg('currentPwMsg', data.message, 'error');
      current.classList.add('error');
      return;
    }

    showMsg('newPwMsg', 'Password updated successfully.', 'success');
    newPw.classList.add('success');
    current.value = '';
    newPw.value   = '';
    confirm.value = '';

  } catch (err) {
    showMsg('currentPwMsg', 'Server error. Try again.', 'error');
  }
});

// --- THEME ---
const darkOption  = document.getElementById('darkOption');
const lightOption = document.getElementById('lightOption');
const darkCheck   = document.getElementById('darkCheck');
const lightCheck  = document.getElementById('lightCheck');

function updateThemeUI() {
  const isLight = document.body.classList.contains('light-mode');
  darkCheck.classList.toggle('hidden', isLight);
  lightCheck.classList.toggle('hidden', !isLight);
}

darkOption.addEventListener('click', () => {
  document.body.classList.remove('light-mode');
  localStorage.setItem('theme', 'dark');
  document.getElementById('themeToggle').textContent = 'DARK';
  updateThemeUI();
});

lightOption.addEventListener('click', () => {
  document.body.classList.add('light-mode');
  localStorage.setItem('theme', 'light');
  document.getElementById('themeToggle').textContent = 'LIGHT';
  updateThemeUI();
});

updateThemeUI();

// --- LOGOUT ---
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('f1forge_token');
  localStorage.removeItem('f1forge_user');
  window.location.href = 'login.html';
});

// --- HELPERS ---
function showMsg(id, message, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className   = 'form-message ' + type;
}

function clearMessages() {
  ['currentPwMsg', 'newPwMsg', 'confirmPwMsg'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.className = 'form-message'; }
  });
  ['currentPassword', 'newPassword', 'confirmPassword'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error', 'success');
  });
}

// --- INIT ---
loadProfile();
loadTeam();
