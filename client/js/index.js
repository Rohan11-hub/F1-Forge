/* ============================================================
   F1 FORGE — index.js
   Countdown Timer
   ============================================================ */

// Austrian GP — 28 June 2026, 6:30 PM IST = 13:00 UTC
const raceDate = new Date('2026-06-28T13:00:00Z');

function updateCountdown() {
  const now  = new Date();
  const diff = raceDate - now;

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

updateCountdown();
setInterval(updateCountdown, 1000);