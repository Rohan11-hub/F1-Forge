/* ============================================================
   F1 FORGE — admin.js
   API version with prediction support
   ============================================================ */

const BASE_URL = 'https://f1-forge.onrender.com';
const TOKEN    = () => localStorage.getItem('f1forge_token');

const user = JSON.parse(localStorage.getItem('f1forge_user') || 'null');
if (!user || !user.isAdmin) {
  alert('Admin access only.');
  window.location.href = 'index.html';
}

let drivers      = [];
let constructors = [];
let raceResults  = {
  grid: {}, finish: {}, status: {},
  pole: null, fastestLap: null
};

// --- LOAD DATA ---
async function loadDrivers() {
  const [dRes, cRes] = await Promise.all([
    fetch('data/drivers.json'),
    fetch('data/constructors.json')
  ]);
  drivers      = await dRes.json();
  constructors = await cRes.json();

  renderGridTable();
  renderResultsTable();
  populateSelects();
}

// --- GRID TABLE ---
function renderGridTable() {
  const table = document.getElementById('gridTable');
  table.innerHTML = '';
  drivers.forEach(driver => {
    const row = document.createElement('div');
    row.className = 'driver-row';
    row.innerHTML = `
      <div>
        <div class="driver-row-name">${driver.name.toUpperCase()}</div>
        <div class="driver-row-team">${driver.team}</div>
      </div>
      <input type="number" class="input" placeholder="Grid P" min="1" max="22"
        id="grid_${driver.id}" onchange="raceResults.grid[${driver.id}] = parseInt(this.value)">
    `;
    table.appendChild(row);
  });
}

// --- RESULTS TABLE ---
function renderResultsTable() {
  const table = document.getElementById('resultsTable');
  table.innerHTML = '';
  drivers.forEach(driver => {
    const row = document.createElement('div');
    row.className = 'driver-row';
    row.innerHTML = `
      <div>
        <div class="driver-row-name">${driver.name.toUpperCase()}</div>
        <div class="driver-row-team">${driver.team}</div>
      </div>
      <input type="number" class="input" placeholder="Finish P" min="1" max="22"
        id="finish_${driver.id}" onchange="setFinish(${driver.id}, this.value)">
      <select class="input status-select" id="status_${driver.id}" onchange="setStatus(${driver.id}, this.value)">
        <option value="">— Normal —</option>
        <option value="DNF">DNF</option>
        <option value="DNS">DNS</option>
        <option value="DSQ">DSQ</option>
      </select>
    `;
    table.appendChild(row);
  });
}

function setFinish(id, value) {
  raceResults.finish[id] = parseInt(value);
  raceResults.status[id] = '';
  document.getElementById(`status_${id}`).value = '';
}

function setStatus(id, value) {
  if (value) {
    raceResults.status[id] = value;
    raceResults.finish[id] = value;
    document.getElementById(`finish_${id}`).value = '';
  }
}

// --- POPULATE SELECTS ---
function populateSelects() {
  const driverOpts      = '<option value="">— Select Driver —</option>' +
    drivers.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  const constructorOpts = '<option value="">— Select Team —</option>' +
    constructors.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  ['poleDriver', 'fastestLapDriver', 'mostPositions', 'driverOfTheDay'].forEach(id => {
    document.getElementById(id).innerHTML = driverOpts;
  });

  ['fastestPitTeam', 'topTeam'].forEach(id => {
    document.getElementById(id).innerHTML = constructorOpts;
  });

  document.getElementById('poleDriver').addEventListener('change', e => {
    raceResults.pole = parseInt(e.target.value);
  });
  document.getElementById('fastestLapDriver').addEventListener('change', e => {
    raceResults.fastestLap = parseInt(e.target.value);
  });
}

// --- CALCULATE & SAVE ---
document.getElementById('calculateBtn').addEventListener('click', async () => {
  const name  = document.getElementById('raceName').value;
  const round = document.getElementById('raceRound').value;
  const date  = document.getElementById('raceDate').value;

  if (!name || !round) {
    alert('Enter race name and round number first.');
    return;
  }

  const preview        = document.getElementById('resultsPreview');
  const previewContent = document.getElementById('previewContent');
  previewContent.innerHTML = '<p class="turbo-placeholder">Calculating...</p>';
  preview.classList.remove('hidden');

  // Build podium from results
  const podium = [];
  Object.entries(raceResults.finish).forEach(([id, pos]) => {
    if ([1, 2, 3].includes(parseInt(pos)) && !raceResults.status[id]) {
      podium[parseInt(pos) - 1] = parseInt(id);
    }
  });

  // Build DNF list
  const dnfDrivers = Object.entries(raceResults.status)
    .filter(([, s]) => ['DNF', 'DNS', 'DSQ'].includes(s))
    .map(([id]) => parseInt(id));

  const predictionResults = {
    podium,
    pole:           raceResults.pole,
    fastestLap:     raceResults.fastestLap,
    safetyCar:      document.getElementById('safetyCar').value === 'true',
    dnfDrivers,
    fastestPit:     parseInt(document.getElementById('fastestPitTeam').value) || null,
    retirements:    parseInt(document.getElementById('retirements').value)    ?? null,
    topTeam:        parseInt(document.getElementById('topTeam').value)        || null,
    mostPositions:  parseInt(document.getElementById('mostPositions').value)  || null,
    driverOfTheDay: parseInt(document.getElementById('driverOfTheDay').value) || null,
  };

  try {
    const res = await fetch(`${BASE_URL}/api/admin/results`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + TOKEN()
      },
      body: JSON.stringify({
        name,
        round:        parseInt(round),
        date,
        grid:         raceResults.grid,
        finish:       raceResults.finish,
        status:       raceResults.status,
        pole:         raceResults.pole,
        fastestLap:   raceResults.fastestLap,
        predictionResults,
        drivers,
        constructors
      })
    });

    const data = await res.json();

    if (!res.ok) {
      previewContent.innerHTML = `<p style="color:var(--error)">${data.message}</p>`;
      return;
    }

    previewContent.innerHTML = `<p style="color:var(--success)">✓ ${data.message}</p>`;
    document.getElementById('saveResultsBtn').disabled = false;

  } catch (err) {
    previewContent.innerHTML = '<p style="color:var(--error)">Server error. Try again.</p>';
  }
});

document.getElementById('saveResultsBtn').addEventListener('click', () => {
  alert('Results saved and leaderboard updated!');
  document.getElementById('saveResultsBtn').disabled = true;
});

loadDrivers();