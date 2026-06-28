/* ============================================================
   F1 FORGE — predictions.js
   ============================================================ */

const BASE_URL = 'https://f1-forge.onrender.com';
const TOKEN    = () => localStorage.getItem('f1forge_token');

if (!TOKEN()) window.location.href = 'login.html';

// Race calendar with qualifying times (UTC)
const races = [
  { round: 1,  name: 'Australian Grand Prix',    qualiDate: '2026-03-14T06:00:00Z' },
  { round: 2,  name: 'Chinese Grand Prix',        qualiDate: '2026-03-21T08:00:00Z' },
  { round: 3,  name: 'Japanese Grand Prix',       qualiDate: '2026-04-04T06:00:00Z' },
  { round: 4,  name: 'Miami Grand Prix',          qualiDate: '2026-05-02T20:00:00Z' },
  { round: 5,  name: 'Canadian Grand Prix',       qualiDate: '2026-06-06T20:00:00Z' },
  { round: 6,  name: 'Monaco Grand Prix',         qualiDate: '2026-05-23T14:00:00Z' },
  { round: 7,  name: 'Spanish Grand Prix',        qualiDate: '2026-06-13T14:00:00Z' },
  { round: 8,  name: 'Austrian Grand Prix',       qualiDate: '2026-06-27T14:00:00Z' },
  { round: 9,  name: 'British Grand Prix',        qualiDate: '2026-07-04T14:00:00Z' },
  { round: 10, name: 'Belgian Grand Prix',        qualiDate: '2026-07-18T14:00:00Z' },
  { round: 11, name: 'Hungarian Grand Prix',      qualiDate: '2026-07-25T14:00:00Z' },
  { round: 12, name: 'Dutch Grand Prix',          qualiDate: '2026-08-22T13:00:00Z' },
  { round: 13, name: 'Italian Grand Prix',        qualiDate: '2026-09-05T13:00:00Z' },
  { round: 14, name: 'Spanish Grand Prix Madrid', qualiDate: '2026-09-12T13:00:00Z' },
  { round: 15, name: 'Azerbaijan Grand Prix',     qualiDate: '2026-09-25T12:00:00Z' },
  { round: 16, name: 'Singapore Grand Prix',      qualiDate: '2026-10-10T13:00:00Z' },
  { round: 17, name: 'United States Grand Prix',  qualiDate: '2026-10-24T21:00:00Z' },
  { round: 18, name: 'Mexico City Grand Prix',    qualiDate: '2026-10-31T21:00:00Z' },
  { round: 19, name: 'São Paulo Grand Prix',      qualiDate: '2026-11-07T18:00:00Z' },
  { round: 20, name: 'Las Vegas Grand Prix',      qualiDate: '2026-11-20T06:00:00Z' },
  { round: 21, name: 'Qatar Grand Prix',          qualiDate: '2026-11-28T13:00:00Z' },
  { round: 22, name: 'Abu Dhabi Grand Prix',      qualiDate: '2026-12-05T13:00:00Z' },
];

let drivers      = [];
let constructors = [];
let nextRace     = null;
let isLocked     = false;

// --- FIND NEXT RACE ---
function getNextRace() {
  const now = new Date();
  return races.find(r => new Date(r.qualiDate) > now) || null;
}

// --- FORMAT TIME ---
function formatTimeLeft(ms) {
  if (ms <= 0) return 'LOCKED';
  const d = Math.floor(ms / (1000 * 60 * 60 * 24));
  const h = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (d > 0) return `${d}D ${h}H ${m}M`;
  if (h > 0) return `${h}H ${m}M`;
  return `${m}M`;
}

// --- UPDATE LOCK BAR ---
function updateLockBar() {
  const lockValue = document.getElementById('lockValue');
  const lockTimer = document.getElementById('lockTimer');
  const lockRace  = document.getElementById('lockRace');

  if (!nextRace) {
    lockValue.textContent = 'SEASON ENDED';
    lockTimer.textContent = '—';
    lockRace.textContent  = '—';
    return;
  }

  const now      = new Date();
  const qualiTime = new Date(nextRace.qualiDate);
  const diff     = qualiTime - now;

  lockRace.textContent = `R${nextRace.round} · ${nextRace.name.toUpperCase()}`;

  if (diff <= 0) {
    isLocked = true;
    lockValue.textContent = 'LOCKED';
    lockValue.className   = 'lock-value locked';
    lockTimer.textContent = 'QUALIFYING STARTED';
    showLockedState();
  } else {
    lockValue.textContent = 'OPEN';
    lockValue.className   = 'lock-value open';
    lockTimer.textContent = formatTimeLeft(diff);
  }
}

// --- POPULATE SELECTS ---
function populateSelects() {
  const driverOptions      = `<option value="">— Select Driver —</option>` +
    drivers.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
  const constructorOptions = `<option value="">— Select Team —</option>` +
    constructors.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  ['podium1', 'podium2', 'podium3', 'pole', 'fastestLap', 'dnfDriver', 'mostPositions', 'driverOfTheDay'].forEach(id => {
    document.getElementById(id).innerHTML = driverOptions;
  });

  ['fastestPit', 'topTeam'].forEach(id => {
    document.getElementById(id).innerHTML = constructorOptions;
  });
}

// --- SAFETY CAR TOGGLE ---
document.getElementById('scYes').addEventListener('click', () => {
  document.getElementById('scYes').classList.add('active');
  document.getElementById('scNo').classList.remove('active');
  document.getElementById('safetyCar').value = 'true';
});

document.getElementById('scNo').addEventListener('click', () => {
  document.getElementById('scNo').classList.add('active');
  document.getElementById('scYes').classList.remove('active');
  document.getElementById('safetyCar').value = 'false';
});

// --- LOAD EXISTING PREDICTION ---
async function loadExistingPrediction() {
  if (!nextRace) return;
  try {
    const res = await fetch(`${BASE_URL}/api/predictions/my/${nextRace.round}`, {
      headers: { 'Authorization': 'Bearer ' + TOKEN() }
    });
    if (!res.ok) return;

    const data = await res.json();
    const p    = data.predictions;

    if (p.podium && p.podium[0]) document.getElementById('podium1').value = p.podium[0];
    if (p.podium && p.podium[1]) document.getElementById('podium2').value = p.podium[1];
    if (p.podium && p.podium[2]) document.getElementById('podium3').value = p.podium[2];
    if (p.pole)           document.getElementById('pole').value           = p.pole;
    if (p.fastestLap)     document.getElementById('fastestLap').value     = p.fastestLap;
    if (p.dnfDriver)      document.getElementById('dnfDriver').value      = p.dnfDriver;
    if (p.fastestPit)     document.getElementById('fastestPit').value     = p.fastestPit;
    if (p.topTeam)        document.getElementById('topTeam').value        = p.topTeam;
    if (p.mostPositions)  document.getElementById('mostPositions').value  = p.mostPositions;
    if (p.driverOfTheDay) document.getElementById('driverOfTheDay').value = p.driverOfTheDay;
    if (p.retirements !== undefined) document.getElementById('retirements').value = p.retirements;

    if (p.safetyCar === false) {
      document.getElementById('scNo').classList.add('active');
      document.getElementById('scYes').classList.remove('active');
      document.getElementById('safetyCar').value = 'false';
    }

    document.getElementById('submitNote').textContent = 'Predictions previously saved — you can update them before qualifying.';
    document.getElementById('submitNote').className = 'submit-note success';

  } catch (err) {
    console.log('No existing prediction.');
  }
}

// --- SUBMIT ---
document.getElementById('submitBtn').addEventListener('click', async () => {
  if (isLocked) return;
  if (!nextRace) return;

  const podium1 = parseInt(document.getElementById('podium1').value);
  const podium2 = parseInt(document.getElementById('podium2').value);
  const podium3 = parseInt(document.getElementById('podium3').value);

  if (!podium1 || !podium2 || !podium3) {
    document.getElementById('submitNote').textContent = 'Please select all 3 podium positions.';
    document.getElementById('submitNote').className = 'submit-note error';
    return;
  }

  if (new Set([podium1, podium2, podium3]).size !== 3) {
    document.getElementById('submitNote').textContent = 'Podium drivers must all be different.';
    document.getElementById('submitNote').className = 'submit-note error';
    return;
  }

  const predictions = {
    podium:         [podium1, podium2, podium3],
    pole:           parseInt(document.getElementById('pole').value)           || null,
    fastestLap:     parseInt(document.getElementById('fastestLap').value)     || null,
    safetyCar:      document.getElementById('safetyCar').value === 'true',
    dnfDriver:      parseInt(document.getElementById('dnfDriver').value)      || null,
    fastestPit:     parseInt(document.getElementById('fastestPit').value)     || null,
    retirements:    parseInt(document.getElementById('retirements').value)    ?? null,
    topTeam:        parseInt(document.getElementById('topTeam').value)        || null,
    mostPositions:  parseInt(document.getElementById('mostPositions').value)  || null,
    driverOfTheDay: parseInt(document.getElementById('driverOfTheDay').value) || null,
  };

  const btn = document.getElementById('submitBtn');
  btn.textContent = 'SAVING...';
  btn.disabled    = true;

  try {
    const res = await fetch(`${BASE_URL}/api/predictions/save`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + TOKEN()
      },
      body: JSON.stringify({ race: nextRace.round, predictions })
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById('submitNote').textContent = data.message;
      document.getElementById('submitNote').className = 'submit-note error';
    } else {
      document.getElementById('submitNote').textContent = '✓ Predictions saved! You can update them before qualifying starts.';
      document.getElementById('submitNote').className = 'submit-note success';
    }

  } catch (err) {
    document.getElementById('submitNote').textContent = 'Server error. Try again.';
    document.getElementById('submitNote').className = 'submit-note error';
  }

  btn.textContent = 'SUBMIT PREDICTIONS →';
  btn.disabled    = false;
});

// --- SHOW LOCKED STATE ---
function showLockedState() {
  document.getElementById('prediction-form').classList.add('hidden');
  document.getElementById('locked-state').classList.remove('hidden');
}

// --- LOAD PAST PREDICTIONS ---
async function loadPastPredictions() {
  try {
    const res = await fetch(`${BASE_URL}/api/predictions/my`, {
      headers: { 'Authorization': 'Bearer ' + TOKEN() }
    });
    if (!res.ok) return;

    const predictions = await res.json();
    const container   = document.getElementById('pastPredictions');

    if (predictions.length === 0) {
      container.innerHTML = '<p class="no-predictions">No past predictions yet.</p>';
      return;
    }

    const completed = predictions.filter(p => p.points !== null);

    if (completed.length === 0) {
      container.innerHTML = '<p class="no-predictions">No results calculated yet.</p>';
      return;
    }

    container.innerHTML = completed.map(p => {
      const race = races.find(r => r.round === p.race);
      return `
        <div class="past-race">
          <span class="past-race-name">${race ? race.name.toUpperCase() : `ROUND ${p.race}`}</span>
          <span class="past-race-pts">${p.points} PTS</span>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load past predictions:', err);
  }
}

// --- INIT ---
async function init() {
  const [dRes, cRes] = await Promise.all([
    fetch('data/drivers.json'),
    fetch('data/constructors.json')
  ]);
  drivers      = await dRes.json();
  constructors = await cRes.json();

  nextRace = getNextRace();

  updateLockBar();
  setInterval(updateLockBar, 60000);

  if (!isLocked) {
    populateSelects();
    loadExistingPrediction();
  }

  loadPastPredictions();
}

init();