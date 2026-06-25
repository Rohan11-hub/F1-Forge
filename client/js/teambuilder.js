/* ============================================================
   F1 FORGE — teambuilder.js
   API version
   ============================================================ */

const BUDGET = 150;
const TOKEN  = () => localStorage.getItem('f1forge_token');

let drivers      = [];
let constructors = [];
let selectedDrivers      = [];
let selectedConstructors = [];
let turboDriver          = null;

// --- LOAD DATA ---
async function loadData() {
  const [dRes, cRes] = await Promise.all([
    fetch('data/drivers.json'),
    fetch('data/constructors.json')
  ]);
  drivers      = await dRes.json();
  constructors = await cRes.json();

  // Load saved team from API
  if (TOKEN()) {
    try {
      const res = await fetch('https://f1-forge.onrender.com/api/team', {
        headers: { 'Authorization': 'Bearer ' + TOKEN() }
      });
      if (res.ok) {
        const team = await res.json();
        selectedDrivers      = team.drivers      || [];
        selectedConstructors = team.constructors || [];
        turboDriver          = team.turbo        || null;
      }
    } catch (err) {
      console.log('No saved team found.');
    }
  }

  renderDrivers();
  renderConstructors();
  updateTurboSection();
  updateSummary();
  updateBudget();
}

// --- BUDGET ---
function getTotalCost() {
  const dCost = selectedDrivers.reduce((sum, id) => {
    const d = drivers.find(d => d.id === id);
    return sum + (d ? d.price : 0);
  }, 0);
  const cCost = selectedConstructors.reduce((sum, id) => {
    const c = constructors.find(c => c.id === id);
    return sum + (c ? c.price : 0);
  }, 0);
  return dCost + cCost;
}

function updateBudget() {
  const spent     = getTotalCost();
  const remaining = BUDGET - spent;
  const el        = document.getElementById('budgetRemaining');
  const dCount    = document.getElementById('driversCount');
  const cCount    = document.getElementById('constructorsCount');
  const saveBtn   = document.getElementById('saveTeamBtn');

  el.textContent = remaining.toFixed(1) + 'M';
  el.className   = 'budget-amount' + (remaining < 0 ? ' over' : remaining < 20 ? ' low' : '');

  dCount.textContent = selectedDrivers.length + ' / 5';
  cCount.textContent = selectedConstructors.length + ' / 2';

  const complete = selectedDrivers.length === 5 && selectedConstructors.length === 2 && turboDriver !== null && remaining >= 0;
  saveBtn.disabled = !complete;
}

// --- RENDER DRIVERS ---
function renderDrivers() {
  const grid = document.getElementById('driverGrid');
  grid.innerHTML = '';

  drivers.forEach(driver => {
    const selected = selectedDrivers.includes(driver.id);
    const maxed    = selectedDrivers.length >= 5 && !selected;
    const isTurbo  = turboDriver === driver.id;

    const card = document.createElement('div');
    card.className = 'driver-card' +
      (selected ? ' selected' : '') +
      (maxed    ? ' disabled' : '') +
      (isTurbo  ? ' turbo-active' : '');

    card.innerHTML = `
      <span class="driver-pos">P${driver.position} · DRIVER</span>
      <span class="driver-name">${driver.name.toUpperCase()}</span>
      <span class="driver-team">${driver.team}</span>
      <span class="driver-price">${driver.price}M</span>
      ${selected ? '<span class="selected-tag">SELECTED</span>' : ''}
    `;

    card.addEventListener('click', () => toggleDriver(driver.id));
    grid.appendChild(card);
  });
}

// --- RENDER CONSTRUCTORS ---
function renderConstructors() {
  const grid = document.getElementById('constructorGrid');
  grid.innerHTML = '';

  constructors.forEach(constructor => {
    const selected = selectedConstructors.includes(constructor.id);
    const maxed    = selectedConstructors.length >= 2 && !selected;

    const card = document.createElement('div');
    card.className = 'constructor-card' +
      (selected ? ' selected' : '') +
      (maxed    ? ' disabled' : '');

    card.innerHTML = `
      <span class="constructor-pos">P${constructor.position} · CONSTRUCTOR</span>
      <span class="constructor-name">${constructor.name.toUpperCase()}</span>
      <span class="constructor-price">${constructor.price}M</span>
      ${selected ? '<span class="selected-tag">SELECTED</span>' : ''}
    `;

    card.addEventListener('click', () => toggleConstructor(constructor.id));
    grid.appendChild(card);
  });
}

// --- TOGGLE DRIVER ---
function toggleDriver(id) {
  if (selectedDrivers.includes(id)) {
    selectedDrivers = selectedDrivers.filter(d => d !== id);
    if (turboDriver === id) turboDriver = null;
  } else {
    if (selectedDrivers.length >= 5) return;
    const driver  = drivers.find(d => d.id === id);
    const newCost = getTotalCost() + driver.price;
    if (newCost > BUDGET) {
      alert('Over budget! Remove a driver or constructor first.');
      return;
    }
    selectedDrivers.push(id);
  }
  renderDrivers();
  updateTurboSection();
  updateSummary();
  updateBudget();
}

// --- TOGGLE CONSTRUCTOR ---
function toggleConstructor(id) {
  if (selectedConstructors.includes(id)) {
    selectedConstructors = selectedConstructors.filter(c => c !== id);
  } else {
    if (selectedConstructors.length >= 2) return;
    const constructor = constructors.find(c => c.id === id);
    const newCost     = getTotalCost() + constructor.price;
    if (newCost > BUDGET) {
      alert('Over budget! Remove a driver or constructor first.');
      return;
    }
    selectedConstructors.push(id);
  }
  renderConstructors();
  updateSummary();
  updateBudget();
}

// --- TURBO SECTION ---
function updateTurboSection() {
  const grid = document.getElementById('turboGrid');
  grid.innerHTML = '';

  if (selectedDrivers.length === 0) {
    grid.innerHTML = '<p class="turbo-placeholder">Select your 5 drivers first.</p>';
    return;
  }

  selectedDrivers.forEach(id => {
    const driver   = drivers.find(d => d.id === id);
    const selected = turboDriver === id;

    const card = document.createElement('div');
    card.className = 'turbo-card' + (selected ? ' selected' : '');

    card.innerHTML = `
      <span class="turbo-tag ${selected ? 'active' : ''}">${selected ? '⚡ TURBO ACTIVE' : 'TURBO DRIVER'}</span>
      <span class="driver-name">${driver.name.toUpperCase()}</span>
      <span class="driver-team">${driver.team}</span>
      <span class="driver-price">${driver.price}M · ×2</span>
    `;

    card.addEventListener('click', () => {
      turboDriver = selected ? null : id;
      updateTurboSection();
      renderDrivers();
      updateSummary();
      updateBudget();
    });

    grid.appendChild(card);
  });
}

// --- SUMMARY ---
function updateSummary() {
  const grid = document.getElementById('summaryGrid');
  grid.innerHTML = '';

  if (selectedDrivers.length === 0 && selectedConstructors.length === 0) {
    grid.innerHTML = '<p class="turbo-placeholder">Your team will appear here.</p>';
    return;
  }

  selectedDrivers.forEach(id => {
    const driver  = drivers.find(d => d.id === id);
    const isTurbo = turboDriver === id;
    const card    = document.createElement('div');
    card.className = 'summary-card';
    card.innerHTML = `
      <span class="summary-type">DRIVER${isTurbo ? ' · ⚡ TURBO' : ''}</span>
      <span class="summary-name">${driver.name.toUpperCase()}</span>
      <span class="summary-price">${driver.team} · ${driver.price}M</span>
    `;
    grid.appendChild(card);
  });

  selectedConstructors.forEach(id => {
    const constructor = constructors.find(c => c.id === id);
    const card        = document.createElement('div');
    card.className    = 'summary-card constructor-summary';
    card.innerHTML    = `
      <span class="summary-type">CONSTRUCTOR</span>
      <span class="summary-name">${constructor.name.toUpperCase()}</span>
      <span class="summary-price">${constructor.price}M</span>
    `;
    grid.appendChild(card);
  });
}

// --- SAVE TEAM ---
document.getElementById('saveTeamBtn').addEventListener('click', async () => {
  if (!TOKEN()) {
    alert('You must be logged in to save a team.');
    window.location.href = 'login.html';
    return;
  }

  const totalCost = getTotalCost();

  try {
    const res = await fetch('https://f1-forge.onrender.com/api/team/save', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + TOKEN()
      },
      body: JSON.stringify({
        drivers:      selectedDrivers,
        constructors: selectedConstructors,
        turbo:        turboDriver,
        totalCost
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to save team.');
      return;
    }

    if (data.penaltyPoints) {
      alert(`Team saved! Note: ${data.extraTransfers} extra transfer(s) = ${data.penaltyPoints} points penalty.`);
    } else {
      alert('Team saved successfully!');
    }

  } catch (err) {
    alert('Server error. Try again.');
  }
});

// --- INIT ---
loadData();
