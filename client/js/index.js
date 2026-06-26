/* ============================================================
   F1 FORGE — index.js
   Dynamic countdown + last race from API
   ============================================================ */

const BASE_URL = 'https://f1-forge.onrender.com';

// Full 2026 F1 Calendar (all times in UTC)
const races = [
  { round: 1,  name: 'Australian Grand Prix',    circuit: 'Albert Park Circuit, Melbourne',      country: 'Australia', date: '2026-03-15T05:00:00Z' },
  { round: 2,  name: 'Chinese Grand Prix',        circuit: 'Shanghai International Circuit',      country: 'China',     date: '2026-03-22T07:00:00Z' },
  { round: 3,  name: 'Japanese Grand Prix',       circuit: 'Suzuka International Racing Course',  country: 'Japan',     date: '2026-04-05T05:00:00Z' },
  { round: 4,  name: 'Miami Grand Prix',          circuit: 'Miami International Autodrome',       country: 'USA',       date: '2026-05-03T19:00:00Z' },
  { round: 5,  name: 'Canadian Grand Prix',       circuit: 'Circuit Gilles Villeneuve, Montreal', country: 'Canada',    date: '2026-06-07T18:00:00Z' },
  { round: 6,  name: 'Monaco Grand Prix',         circuit: 'Circuit de Monaco',                   country: 'Monaco',    date: '2026-05-24T13:00:00Z' },
  { round: 7,  name: 'Spanish Grand Prix',        circuit: 'Circuit de Barcelona-Catalunya',      country: 'Spain',     date: '2026-06-14T13:00:00Z' },
  { round: 8,  name: 'Austrian Grand Prix',       circuit: 'Red Bull Ring, Spielberg',            country: 'Austria',   date: '2026-06-28T13:00:00Z' },
  { round: 9,  name: 'British Grand Prix',        circuit: 'Silverstone Circuit',                 country: 'UK',        date: '2026-07-05T14:00:00Z' },
  { round: 10, name: 'Belgian Grand Prix',        circuit: 'Circuit de Spa-Francorchamps',        country: 'Belgium',   date: '2026-07-19T13:00:00Z' },
  { round: 11, name: 'Hungarian Grand Prix',      circuit: 'Hungaroring, Budapest',               country: 'Hungary',   date: '2026-07-26T13:00:00Z' },
  { round: 12, name: 'Dutch Grand Prix',          circuit: 'Circuit Zandvoort',                   country: 'Netherlands', date: '2026-08-23T13:00:00Z' },
  { round: 13, name: 'Italian Grand Prix',        circuit: 'Autodromo Nazionale Monza',           country: 'Italy',     date: '2026-09-06T13:00:00Z' },
  { round: 14, name: 'Spanish Grand Prix Madrid', circuit: 'Circuit Madrid Motorsport',           country: 'Spain',     date: '2026-09-13T13:00:00Z' },
  { round: 15, name: 'Azerbaijan Grand Prix',     circuit: 'Baku City Circuit',                   country: 'Azerbaijan', date: '2026-09-26T11:00:00Z' },
  { round: 16, name: 'Singapore Grand Prix',      circuit: 'Marina Bay Street Circuit',           country: 'Singapore', date: '2026-10-11T12:00:00Z' },
  { round: 17, name: 'United States Grand Prix',  circuit: 'Circuit of the Americas, Austin',     country: 'USA',       date: '2026-10-25T19:00:00Z' },
  { round: 18, name: 'Mexico City Grand Prix',    circuit: 'Autodromo Hermanos Rodriguez',        country: 'Mexico',    date: '2026-11-01T19:00:00Z' },
  { round: 19, name: 'São Paulo Grand Prix',      circuit: 'Autodromo Jose Carlos Pace',          country: 'Brazil',    date: '2026-11-08T17:00:00Z' },
  { round: 20, name: 'Las Vegas Grand Prix',      circuit: 'Las Vegas Strip Circuit',             country: 'USA',       date: '2026-11-21T06:00:00Z' },
  { round: 21, name: 'Qatar Grand Prix',          circuit: 'Lusail International Circuit',        country: 'Qatar',     date: '2026-11-29T13:00:00Z' },
  { round: 22, name: 'Abu Dhabi Grand Prix',      circuit: 'Yas Marina Circuit',                  country: 'UAE',       date: '2026-12-06T13:00:00Z' },
];

// --- FORMAT LOCAL TIME ---
function formatLocalTime(utcDateStr) {
  const date = new Date(utcDateStr);
  return date.toLocaleTimeString([], {
    hour:   '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

function formatLocalDate(utcDateStr) {
  const date = new Date(utcDateStr);
  return date.toLocaleDateString([], {
    weekday: 'short',
    day:     'numeric',
    month:   'long',
    year:    'numeric'
  });
}

// --- FIND NEXT RACE ---
function getNextRace() {
  const now = new Date();
  return races.find(r => new Date(r.date) > now) || races[races.length - 1];
}

// --- COUNTDOWN ---
function updateCountdown(raceDate) {
  const now  = new Date();
  const diff = new Date(raceDate) - now;

  if (diff <= 0) {
    document.getElementById('days').textContent  = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('mins').textContent  = '00';
    document.getElementById('secs').textContent  = '00';
    return;
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs  = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('days').textContent  = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('mins').textContent  = String(mins).padStart(2, '0');
  document.getElementById('secs').textContent  = String(secs).padStart(2, '0');
}

// --- LOAD NEXT RACE ---
function loadNextRace() {
  const race = getNextRace();

  const nameEl  = document.querySelector('.race-card h3');
  const metaEl  = document.querySelector('.race-meta');
  const roundEl = document.querySelector('.race-round');

  if (nameEl)  nameEl.textContent  = race.name.toUpperCase();
  if (metaEl)  metaEl.textContent  = `${race.circuit} · ${formatLocalDate(race.date)} · ${formatLocalTime(race.date)}`;
  if (roundEl) roundEl.textContent = `ROUND ${race.round}`;

  updateCountdown(race.date);
  setInterval(() => updateCountdown(race.date), 1000);
}

// --- LOAD LAST RACE ---
async function loadLastRace() {
  try {
    const res = await fetch(`${BASE_URL}/api/races/last`);
    if (!res.ok) return;

    const race = await res.json();

    const nameEl    = document.querySelector('.result-card h3');
    const winnerEl  = document.querySelector('#last-race .result-card p:nth-child(2)');
    const poleEl    = document.querySelector('#last-race .result-card p:nth-child(3)');
    const fastestEl = document.querySelector('#last-race .result-card p:nth-child(4)');

    if (nameEl) nameEl.textContent = race.name.toUpperCase();

    const dRes    = await fetch('data/drivers.json');
    const drivers = await dRes.json();

    const getDriverName = (id) => {
      const d = drivers.find(d => d.id === id);
      return d ? d.name : '—';
    };

    const results  = race.results;
    const finishes = results.finish || {};
    const statuses = results.status || {};

    let winner = '—';
    Object.entries(finishes).forEach(([id, pos]) => {
      if (pos === 1 && !statuses[id]) winner = getDriverName(parseInt(id));
    });

    if (winnerEl)  winnerEl.innerHTML  = `<strong>WINNER:</strong> ${winner}`;
    if (poleEl)    poleEl.innerHTML    = `<strong>POLE POSITION:</strong> ${getDriverName(results.pole)}`;
    if (fastestEl) fastestEl.innerHTML = `<strong>FASTEST LAP:</strong> ${getDriverName(results.fastestLap)}`;

  } catch (err) {
    console.log('No last race data yet.');
  }
}

// --- INIT ---
loadNextRace();
loadLastRace();