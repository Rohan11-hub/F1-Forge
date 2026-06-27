/* ============================================================
   F1 FORGE — paddock.js
   Drivers, Constructors, Races tabs with modal
   ============================================================ */

const BASE_URL = 'https://f1-forge.onrender.com';

// --- DRIVER META ---
const driverMeta = {
  1:  { img: 'assets/images/drivers/kimi.jpg',      instagram: 'https://www.instagram.com/kimi.antonelli/',       nationality: 'Italian',       flag: '🇮🇹' },
  2:  { img: 'assets/images/drivers/lewis.jpg',     instagram: 'https://www.instagram.com/lewishamilton/',        nationality: 'British',       flag: '🇬🇧' },
  3:  { img: 'assets/images/drivers/george.jpg',    instagram: 'https://www.instagram.com/georgerussell63/',      nationality: 'British',       flag: '🇬🇧' },
  4:  { img: 'assets/images/drivers/max.jpg',       instagram: 'https://www.instagram.com/maxverstappen1/',       nationality: 'Dutch',         flag: '🇳🇱' },
  5:  { img: 'assets/images/drivers/charles.jpg',   instagram: 'https://www.instagram.com/charles_leclerc/',      nationality: 'Monégasque',    flag: '🇲🇨' },
  6:  { img: 'assets/images/drivers/oscar.jpg',     instagram: 'https://www.instagram.com/oscarpiastri/',         nationality: 'Australian',    flag: '🇦🇺' },
  7:  { img: 'assets/images/drivers/lando.jpg',     instagram: 'https://www.instagram.com/landonorris/',          nationality: 'British',       flag: '🇬🇧' },
  8:  { img: 'assets/images/drivers/pierre.jpg',    instagram: 'https://www.instagram.com/pierregasly/',          nationality: 'French',        flag: '🇫🇷' },
  9:  { img: 'assets/images/drivers/isack.jpg',     instagram: 'https://www.instagram.com/isaackhadjar/',         nationality: 'French',        flag: '🇫🇷' },
  10: { img: 'assets/images/drivers/liam.jpg',      instagram: 'https://www.instagram.com/liamlawson30/',         nationality: 'New Zealander', flag: '🇳🇿' },
  11: { img: 'assets/images/drivers/ollie.jpg',     instagram: 'https://www.instagram.com/ollie_bearman/',        nationality: 'British',       flag: '🇬🇧' },
  12: { img: 'assets/images/drivers/colapinto.jpg', instagram: 'https://www.instagram.com/francocolapinto/',      nationality: 'Argentine',     flag: '🇦🇷' },
  13: { img: 'assets/images/drivers/arvid.jpg',     instagram: 'https://www.instagram.com/arvidlindblad/',        nationality: 'Swedish',       flag: '🇸🇪' },
  14: { img: 'assets/images/drivers/carlos.jpg',    instagram: 'https://www.instagram.com/carlossainz55/',        nationality: 'Spanish',       flag: '🇪🇸' },
  15: { img: 'assets/images/drivers/alex.jpg',      instagram: 'https://www.instagram.com/alexanderalbon/',       nationality: 'Thai',          flag: '🇹🇭' },
  16: { img: 'assets/images/drivers/ocon.jpg',      instagram: 'https://www.instagram.com/estebanocon/',          nationality: 'French',        flag: '🇫🇷' },
  17: { img: 'assets/images/drivers/gabriel.jpg',   instagram: 'https://www.instagram.com/gabrielbortoleto/',     nationality: 'Brazilian',     flag: '🇧🇷' },
  18: { img: 'assets/images/drivers/fernando.jpg',  instagram: 'https://www.instagram.com/fernandoalo_oficial/',  nationality: 'Spanish',       flag: '🇪🇸' },
  19: { img: 'assets/images/drivers/nico.jpg',      instagram: 'https://www.instagram.com/nicohulkenberg/',       nationality: 'German',        flag: '🇩🇪' },
  20: { img: 'assets/images/drivers/valtteri.jpg',  instagram: 'https://www.instagram.com/valtteribottas/',       nationality: 'Finnish',       flag: '🇫🇮' },
  21: { img: 'assets/images/drivers/sergio.jpg',    instagram: 'https://www.instagram.com/schecoperez/',          nationality: 'Mexican',       flag: '🇲🇽' },
  22: { img: 'assets/images/drivers/lance.jpg',     instagram: 'https://www.instagram.com/lancestroll/',          nationality: 'Canadian',      flag: '🇨🇦' },
};

// --- CONSTRUCTOR META ---
const constructorMeta = {
  1:  { img: 'assets/images/constructors/mercedes.jpg', website: 'https://www.mercedesamgf1.com',              nationality: 'German',   flag: '🇩🇪' },
  2:  { img: 'assets/images/constructors/ferrari.jpg',  website: 'https://www.ferrari.com/en-EN/formula1',     nationality: 'Italian',  flag: '🇮🇹' },
  3:  { img: 'assets/images/constructors/mclaren.jpg',  website: 'https://www.mclaren.com/racing',             nationality: 'British',  flag: '🇬🇧' },
  4:  { img: 'assets/images/constructors/red.jpg',      website: 'https://www.redbullracing.com',              nationality: 'Austrian', flag: '🇦🇹' },
  5:  { img: 'assets/images/constructors/alpine.jpg',   website: 'https://www.alpine-cars.co.uk/formula-1',   nationality: 'French',   flag: '🇫🇷' },
  6:  { img: 'assets/images/constructors/racing.jpg',   website: 'https://www.visacashapprb.com',              nationality: 'Italian',  flag: '🇮🇹' },
  7:  { img: 'assets/images/constructors/haas.jpg',     website: 'https://www.haasf1team.com',                 nationality: 'American', flag: '🇺🇸' },
  8:  { img: 'assets/images/constructors/williams.jpg', website: 'https://www.williamsf1.com',                 nationality: 'British',  flag: '🇬🇧' },
  9:  { img: 'assets/images/constructors/audi.jpg',     website: 'https://www.audisport.com',                  nationality: 'German',   flag: '🇩🇪' },
  10: { img: 'assets/images/constructors/cadillac.jpg', website: 'https://www.cadillacf1.com',                 nationality: 'American', flag: '🇺🇸' },
  11: { img: 'assets/images/constructors/aston.jpg',    website: 'https://www.astonmartinf1.com',              nationality: 'British',  flag: '🇬🇧' },
};

// --- RACE CALENDAR ---
const races = [
  { round: 1,  name: 'Australian Grand Prix',    circuit: 'Albert Park Circuit',              country: 'Australia',    date: '2026-03-15T05:00:00Z' },
  { round: 2,  name: 'Chinese Grand Prix',        circuit: 'Shanghai International Circuit',   country: 'China',        date: '2026-03-22T07:00:00Z' },
  { round: 3,  name: 'Japanese Grand Prix',       circuit: 'Suzuka International Racing Course', country: 'Japan',      date: '2026-04-05T05:00:00Z' },
  { round: 4,  name: 'Miami Grand Prix',          circuit: 'Miami International Autodrome',    country: 'USA',          date: '2026-05-03T19:00:00Z' },
  { round: 5,  name: 'Canadian Grand Prix',       circuit: 'Circuit Gilles Villeneuve',        country: 'Canada',       date: '2026-06-07T18:00:00Z' },
  { round: 6,  name: 'Monaco Grand Prix',         circuit: 'Circuit de Monaco',                country: 'Monaco',       date: '2026-05-24T13:00:00Z' },
  { round: 7,  name: 'Spanish Grand Prix',        circuit: 'Circuit de Barcelona-Catalunya',   country: 'Spain',        date: '2026-06-14T13:00:00Z' },
  { round: 8,  name: 'Austrian Grand Prix',       circuit: 'Red Bull Ring',                    country: 'Austria',      date: '2026-06-28T13:00:00Z' },
  { round: 9,  name: 'British Grand Prix',        circuit: 'Silverstone Circuit',              country: 'UK',           date: '2026-07-05T14:00:00Z' },
  { round: 10, name: 'Belgian Grand Prix',        circuit: 'Circuit de Spa-Francorchamps',     country: 'Belgium',      date: '2026-07-19T13:00:00Z' },
  { round: 11, name: 'Hungarian Grand Prix',      circuit: 'Hungaroring',                      country: 'Hungary',      date: '2026-07-26T13:00:00Z' },
  { round: 12, name: 'Dutch Grand Prix',          circuit: 'Circuit Zandvoort',                country: 'Netherlands',  date: '2026-08-23T13:00:00Z' },
  { round: 13, name: 'Italian Grand Prix',        circuit: 'Autodromo Nazionale Monza',        country: 'Italy',        date: '2026-09-06T13:00:00Z' },
  { round: 14, name: 'Spanish Grand Prix Madrid', circuit: 'Circuit Madrid Motorsport',        country: 'Spain',        date: '2026-09-13T13:00:00Z' },
  { round: 15, name: 'Azerbaijan Grand Prix',     circuit: 'Baku City Circuit',                country: 'Azerbaijan',   date: '2026-09-26T11:00:00Z' },
  { round: 16, name: 'Singapore Grand Prix',      circuit: 'Marina Bay Street Circuit',        country: 'Singapore',    date: '2026-10-11T12:00:00Z' },
  { round: 17, name: 'United States Grand Prix',  circuit: 'Circuit of the Americas',          country: 'USA',          date: '2026-10-25T19:00:00Z' },
  { round: 18, name: 'Mexico City Grand Prix',    circuit: 'Autodromo Hermanos Rodriguez',     country: 'Mexico',       date: '2026-11-01T19:00:00Z' },
  { round: 19, name: 'São Paulo Grand Prix',      circuit: 'Autodromo Jose Carlos Pace',       country: 'Brazil',       date: '2026-11-08T17:00:00Z' },
  { round: 20, name: 'Las Vegas Grand Prix',      circuit: 'Las Vegas Strip Circuit',          country: 'USA',          date: '2026-11-21T06:00:00Z' },
  { round: 21, name: 'Qatar Grand Prix',          circuit: 'Lusail International Circuit',     country: 'Qatar',        date: '2026-11-29T13:00:00Z' },
  { round: 22, name: 'Abu Dhabi Grand Prix',      circuit: 'Yas Marina Circuit',               country: 'UAE',          date: '2026-12-06T13:00:00Z' },
];

let drivers      = [];
let constructors = [];
let completedRaces = [];

// --- FORMAT TIME ---
function formatLocalTime(utcStr) {
  return new Date(utcStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
}

function formatLocalDate(utcStr) {
  return new Date(utcStr).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
}

// --- TABS ---
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

// --- LOAD DATA ---
async function loadData() {
  const [dRes, cRes] = await Promise.all([
    fetch('data/drivers.json'),
    fetch('data/constructors.json')
  ]);
  drivers      = await dRes.json();
  constructors = await cRes.json();

  // Load completed races from API
  try {
    const rRes = await fetch(`${BASE_URL}/api/races`);
    if (rRes.ok) completedRaces = await rRes.json();
  } catch (err) {
    console.log('No race data yet.');
  }

  renderDrivers();
  renderConstructors();
  renderRaces();
}

// --- GET WINNER FOR ROUND ---
function getWinner(round) {
  const race = completedRaces.find(r => r.round === round && r.processed);
  if (!race) return null;

  const finishes = race.results?.finish || {};
  const statuses = race.results?.status || {};

  let winnerId = null;
  Object.entries(finishes).forEach(([id, pos]) => {
    if (parseInt(pos) === 1 && !statuses[id]) winnerId = parseInt(id);
  });

  if (!winnerId) return null;
  const driver = drivers.find(d => d.id === winnerId);
  return driver ? driver.name : null;
}

// --- RENDER DRIVERS ---
function renderDrivers() {
  const grid = document.getElementById('driverGrid');
  grid.innerHTML = '';

  drivers.forEach(driver => {
    const meta = driverMeta[driver.id] || {};
    const card = document.createElement('div');
    card.className = 'paddock-card driver';
    card.innerHTML = `
      <span class="card-pos">${meta.flag || ''} P${driver.position} · DRIVER</span>
      <img class="card-img" src="${meta.img || ''}" alt="${driver.name}" onerror="this.style.display='none'">
      <span class="card-name">${driver.name.toUpperCase()}</span>
      <span class="card-sub">${driver.team}</span>
      <span class="card-price driver-price">${driver.price}M</span>
      <span class="card-tap">TAP FOR MORE →</span>
    `;
    card.addEventListener('click', () => openDriverModal(driver));
    grid.appendChild(card);
  });
}

// --- RENDER CONSTRUCTORS ---
function renderConstructors() {
  const grid = document.getElementById('constructorGrid');
  grid.innerHTML = '';

  constructors.forEach(constructor => {
    const meta = constructorMeta[constructor.id] || {};
    const card = document.createElement('div');
    card.className = 'paddock-card constructor';
    card.innerHTML = `
      <span class="card-pos">${meta.flag || ''} P${constructor.position} · CONSTRUCTOR</span>
      <img class="card-img" src="${meta.img || ''}" alt="${constructor.name}" onerror="this.style.display='none'">
      <span class="card-name">${constructor.name.toUpperCase()}</span>
      <span class="card-price constructor-price">${constructor.price}M</span>
      <span class="card-tap">TAP FOR MORE →</span>
    `;
    card.addEventListener('click', () => openConstructorModal(constructor));
    grid.appendChild(card);
  });
}

// --- RENDER RACES ---
function renderRaces() {
  const list = document.getElementById('raceList');
  list.innerHTML = '';
  const now     = new Date();
  const nextIdx = races.findIndex(r => new Date(r.date) > now);

  races.forEach((race, i) => {
    const isPast  = new Date(race.date) <= now;
    const isNext  = i === nextIdx;
    const winner  = isPast ? getWinner(race.round) : null;
    const row     = document.createElement('div');
    row.className = `race-row${isPast ? ' completed' : ''}${isNext ? ' next' : ''}`;

    row.innerHTML = `
      <span class="race-num ${isNext ? 'next-num' : ''}">${String(race.round).padStart(2, '0')}</span>
      <div class="race-info">
        <span class="race-name">${race.name.toUpperCase()}</span>
        <span class="race-circuit">${race.circuit} · ${race.country}</span>
        ${winner ? `<span class="race-winner">🏆 ${winner}</span>` : ''}
      </div>
      <div class="race-datetime">
        <div>${formatLocalDate(race.date)}</div>
        <div>${formatLocalTime(race.date)}</div>
        <span class="race-status ${isPast ? 'done' : isNext ? 'next-race' : 'upcoming'}">
          ${isPast ? 'COMPLETED' : isNext ? 'NEXT RACE' : 'UPCOMING'}
        </span>
      </div>
    `;

    row.addEventListener('click', () => openRaceModal(race, isPast, winner));
    list.appendChild(row);
  });
}

// --- DRIVER MODAL ---
function openDriverModal(driver) {
  const meta = driverMeta[driver.id] || {};

  // Count wins
  const wins = completedRaces.filter(r => {
    const finishes = r.results?.finish || {};
    const statuses = r.results?.status || {};
    return Object.entries(finishes).some(([id, pos]) =>
      parseInt(id) === driver.id && parseInt(pos) === 1 && !statuses[id]
    );
  }).length;

  document.getElementById('modal-content').innerHTML = `
    ${meta.img ? `<img class="modal-img" src="${meta.img}" alt="${driver.name}" onerror="this.style.display='none'">` : ''}
    <div class="modal-pos">${meta.flag || ''} ${meta.nationality || ''} · DRIVER</div>
    <div class="modal-name">${driver.name.toUpperCase()}</div>
    <div class="modal-sub">${driver.team} · P${driver.position} IN CHAMPIONSHIP</div>
    <div class="modal-stats">
      <div class="modal-stat">
        <span class="stat-label">FANTASY PRICE</span>
        <span class="stat-value" style="color:var(--primary)">${driver.price}M</span>
      </div>
      <div class="modal-stat">
        <span class="stat-label">CHAMPIONSHIP</span>
        <span class="stat-value">P${driver.position}</span>
      </div>
      <div class="modal-stat">
        <span class="stat-label">2026 WINS</span>
        <span class="stat-value">${wins}</span>
      </div>
    </div>
    <div class="modal-links">
      ${meta.instagram ? `<a href="${meta.instagram}" target="_blank" class="modal-link instagram">INSTAGRAM →</a>` : ''}
    </div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

// --- CONSTRUCTOR MODAL ---
function openConstructorModal(constructor) {
  const meta     = constructorMeta[constructor.id] || {};
  const drivers_ = drivers.filter(d => d.team === constructor.name);

  // Count wins
  const wins = completedRaces.filter(r => {
    const finishes = r.results?.finish || {};
    const statuses = r.results?.status || {};
    return Object.entries(finishes).some(([id, pos]) => {
      const driver = drivers_.find(d => d.id === parseInt(id));
      return driver && parseInt(pos) === 1 && !statuses[id];
    });
  }).length;

  document.getElementById('modal-content').innerHTML = `
    ${meta.img ? `<img class="modal-img" src="${meta.img}" alt="${constructor.name}" style="border-radius:var(--radius); width:100%; height:120px; object-fit:cover; margin-bottom:1rem;" onerror="this.style.display='none'">` : ''}
    <div class="modal-pos">${meta.flag || ''} ${meta.nationality || ''} · CONSTRUCTOR</div>
    <div class="modal-name">${constructor.name.toUpperCase()}</div>
    <div class="modal-sub">P${constructor.position} IN CHAMPIONSHIP</div>
    <div class="modal-stats">
      <div class="modal-stat">
        <span class="stat-label">FANTASY PRICE</span>
        <span class="stat-value" style="color:var(--secondary)">${constructor.price}M</span>
      </div>
      <div class="modal-stat">
        <span class="stat-label">2026 WINS</span>
        <span class="stat-value">${wins}</span>
      </div>
      ${drivers_.map(d => `
      <div class="modal-stat">
        <span class="stat-label">DRIVER</span>
        <span class="stat-value" style="font-size:14px">${d.name.toUpperCase()}</span>
      </div>`).join('')}
    </div>
    <div class="modal-links">
      ${meta.website ? `<a href="${meta.website}" target="_blank" class="modal-link website">OFFICIAL SITE →</a>` : ''}
    </div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

// --- RACE MODAL ---
function openRaceModal(race, isPast, winner) {
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-pos">ROUND ${race.round} · ${race.country}</div>
    <div class="modal-name">${race.name.toUpperCase()}</div>
    <div class="modal-sub">${race.circuit}</div>
    <div class="modal-stats">
      <div class="modal-stat">
        <span class="stat-label">DATE</span>
        <span class="stat-value" style="font-size:14px">${formatLocalDate(race.date)}</span>
      </div>
      <div class="modal-stat">
        <span class="stat-label">LOCAL TIME</span>
        <span class="stat-value" style="font-size:14px">${formatLocalTime(race.date)}</span>
      </div>
      <div class="modal-stat" style="grid-column: 1 / -1">
        <span class="stat-label">${isPast ? 'RACE WINNER' : 'STATUS'}</span>
        <span class="stat-value" style="font-size:14px; color:${isPast ? 'var(--primary)' : 'var(--muted)'}">
          ${isPast ? (winner ? '🏆 ' + winner : '—') : 'UPCOMING'}
        </span>
      </div>
    </div>
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
}

// --- CLOSE MODAL ---
document.getElementById('modal-close').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.add('hidden');
});

document.getElementById('modal-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) {
    document.getElementById('modal-overlay').classList.add('hidden');
  }
});

// --- INIT ---
loadData();