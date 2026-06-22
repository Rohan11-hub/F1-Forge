/* ============================================================
   F1 FORGE — admin.js
   ============================================================ */

let drivers = [];
let raceResults = {
  grid: {},
  finish: {},
  status: {},
  pole: null,
  fastestLap: null
};

// --- LOAD DRIVERS ---
async function loadDrivers() {
  const res = await fetch('data/drivers.json');
  drivers = await res.json();
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
      <input
        type="number"
        class="input"
        placeholder="Grid P"
        min="1"
        max="22"
        id="grid_${driver.id}"
        onchange="raceResults.grid[${driver.id}] = parseInt(this.value)"
      >
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
      <input
        type="number"
        class="input"
        placeholder="Finish P"
        min="1"
        max="22"
        id="finish_${driver.id}"
        onchange="setFinish(${driver.id}, this.value)"
      >
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

// --- POLE + FASTEST LAP SELECTS ---
function populateSelects() {
  const poleSelect    = document.getElementById('poleDriver');
  const fastestSelect = document.getElementById('fastestLapDriver');

  const defaultOpt = '<option value="">— Select Driver —</option>';
  poleSelect.innerHTML    = defaultOpt;
  fastestSelect.innerHTML = defaultOpt;

  drivers.forEach(driver => {
    const opt = `<option value="${driver.id}">${driver.name}</option>`;
    poleSelect.innerHTML    += opt;
    fastestSelect.innerHTML += opt;
  });

  poleSelect.addEventListener('change', () => {
    raceResults.pole = parseInt(poleSelect.value);
  });

  fastestSelect.addEventListener('change', () => {
    raceResults.fastestLap = parseInt(fastestSelect.value);
  });
}

// --- CALCULATE SCORES ---
document.getElementById('calculateBtn').addEventListener('click', () => {
  const users = JSON.parse(localStorage.getItem('f1forge_users') || '[]');

  if (users.length === 0) {
    alert('No users found. Have players sign up first.');
    return;
  }

  const preview        = document.getElementById('resultsPreview');
  const previewContent = document.getElementById('previewContent');
  previewContent.innerHTML = '';

  users.forEach(user => {
    if (!user.team) return;

    const { drivers: teamDrivers, constructors: teamConstructors, turbo } = user.team;
    let totalScore = 0;

    // Driver scores
    teamDrivers.forEach(driverId => {
      const finish    = raceResults.finish[driverId];
      const grid      = raceResults.grid[driverId];
      const status    = raceResults.status[driverId];
      const isPole    = raceResults.pole === driverId;
      const isFastest = raceResults.fastestLap === driverId;

      if (!finish && !status) return;

      const result = {
        finish:     status || finish,
        gridStart:  grid || finish,
        pole:       isPole,
        fastestLap: isFastest
      };

      let score = calculateDriverScore(result);
      if (driverId === turbo) score = applyTurboMultiplier(score);
      totalScore += score;
    });

    // Constructor scores
    if (teamConstructors) {
      teamConstructors.forEach(constructorId => {
        const constructorDrivers = drivers.filter(d => {
          const c = getConstructorById(constructorId);
          return c && d.team === c.name;
        });

        if (constructorDrivers.length < 2) return;

        const d1Result = getDriverResult(constructorDrivers[0].id);
        const d2Result = getDriverResult(constructorDrivers[1].id);

        if (d1Result && d2Result) {
          totalScore += calculateConstructorScore({ driver1Result: d1Result, driver2Result: d2Result });
        }
      });
    }

    // Update user points
    user.points = (user.points || 0) + totalScore;

    // Add to preview
    const row = document.createElement('div');
    row.className = 'preview-row';
    row.innerHTML = `
      <span>${user.username.toUpperCase()}</span>
      <span class="preview-pts ${totalScore >= 0 ? 'positive' : 'negative'}">
        ${totalScore >= 0 ? '+' : ''}${totalScore} PTS
      </span>
    `;
    previewContent.appendChild(row);
  });

  preview.classList.remove('hidden');
  document.getElementById('saveResultsBtn').disabled = false;

  // Save updated users back
  localStorage.setItem('f1forge_users', JSON.stringify(users));
});

// --- SAVE RESULTS ---
document.getElementById('saveResultsBtn').addEventListener('click', () => {
  const race = {
    name:      document.getElementById('raceName').value || 'Unknown Race',
    round:     document.getElementById('raceRound').value || '?',
    date:      document.getElementById('raceDate').value || '',
    results:   raceResults,
    savedAt:   new Date().toISOString()
  };

  const races = JSON.parse(localStorage.getItem('f1forge_races') || '[]');
  races.push(race);
  localStorage.setItem('f1forge_races', JSON.stringify(races));

  alert('Results saved! Leaderboard updated.');
  document.getElementById('saveResultsBtn').disabled = true;
});

// --- HELPERS ---
function getDriverResult(driverId) {
  const finish = raceResults.finish[driverId];
  const status = raceResults.status[driverId];
  if (!finish && !status) return null;
  return {
    finish:     status || finish,
    gridStart:  raceResults.grid[driverId] || finish,
    pole:       raceResults.pole === driverId,
    fastestLap: raceResults.fastestLap === driverId
  };
}

function getConstructorById(id) {
  const constructors = JSON.parse(localStorage.getItem('f1forge_constructors') || '[]');
  return constructors.find(c => c.id === id);
}

// --- INIT ---
loadDrivers();