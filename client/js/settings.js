/* ============================================================
   F1 FORGE — settings.js
   ============================================================ */

const user = JSON.parse(localStorage.getItem('f1forge_current') || 'null');

// Redirect if not logged in
if (!user) window.location.href = 'login.html';

// --- LOAD PROFILE ---
function loadProfile() {
  document.getElementById('profileUsername').textContent = user.username || '—';
  document.getElementById('profileEmail').textContent    = user.email    || '—';
  document.getElementById('profilePoints').textContent   = user.points   || 0;

  if (user.joined) {
    const date = new Date(user.joined);
    document.getElementById('profileJoined').textContent = date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }
}

// --- LOAD TEAM ---
async function loadTeam() {
  const team = user.team;
  const container = document.getElementById('currentTeam');

  if (!team) {
    container.innerHTML = '<p class="settings-empty">No team saved yet. <a href="teambuilder.html">Build your team →</a></p>';
    return;
  }

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
}

// --- CHANGE PASSWORD ---
document.getElementById('changePasswordBtn').addEventListener('click', () => {
  const current = document.getElementById('currentPassword');
  const newPw   = document.getElementById('newPassword');
  const confirm = document.getElementById('confirmPassword');

  clearMessages();
  let valid = true;

  if (current.value !== user.password) {
    showMsg('currentPwMsg', 'Incorrect current password.', 'error');
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

  // Update password
  const users   = JSON.parse(localStorage.getItem('f1forge_users') || '[]');
  const userIdx = users.findIndex(u => u.email === user.email);
  if (userIdx !== -1) {
    users[userIdx].password = newPw.value;
    user.password = newPw.value;
    localStorage.setItem('f1forge_users', JSON.stringify(users));
    localStorage.setItem('f1forge_current', JSON.stringify(user));
  }

  showMsg('newPwMsg', 'Password updated successfully.', 'success');
  newPw.classList.add('success');
  current.value = '';
  newPw.value   = '';
  confirm.value = '';
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
  localStorage.removeItem('f1forge_current');
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