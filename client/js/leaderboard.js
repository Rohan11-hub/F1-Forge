/* ============================================================
   F1 FORGE — leaderboard.js
   API version
   ============================================================ */

const currentUser = JSON.parse(localStorage.getItem('f1forge_user') || 'null');

async function loadLeaderboard() {
  const podiumSection = document.getElementById('podiumSection');
  const lbRows        = document.getElementById('lbRows');
  const emptyState    = document.getElementById('emptyState');
  const tableSection  = document.querySelector('.table-section');

  try {
    const res  = await fetch('/api/leaderboard');
    const data = await res.json();

    if (!data || data.length === 0) {
      podiumSection.classList.add('hidden');
      tableSection.classList.add('hidden');
      emptyState.classList.remove('hidden');
      return;
    }

    // --- PODIUM ---
    podiumSection.innerHTML = '';
    const podiumClasses = ['p1', 'p2', 'p3'];
    const podiumLabels  = ['1ST', '2ND', '3RD'];

    const top3 = data.slice(0, 3);
    top3.forEach((player, i) => {
      const card = document.createElement('div');
      card.className = `podium-card ${podiumClasses[i]}`;
      card.innerHTML = `
        <span class="podium-rank">${podiumLabels[i]}</span>
        <span class="podium-name">${player.username.toUpperCase()}</span>
        <span class="podium-pts">${player.points} PTS</span>
      `;
      podiumSection.appendChild(card);
    });

    // Fill empty podium spots
    if (top3.length < 3) {
      for (let i = top3.length; i < 3; i++) {
        const empty = document.createElement('div');
        empty.className = `podium-card ${podiumClasses[i]}`;
        empty.innerHTML = `
          <span class="podium-rank">${podiumLabels[i]}</span>
          <span class="podium-name" style="color:var(--muted)">—</span>
          <span class="podium-pts">0 PTS</span>
        `;
        podiumSection.appendChild(empty);
      }
    }

    // --- FULL TABLE ---
    lbRows.innerHTML = '';

    data.forEach((player) => {
      const isCurrent = currentUser && player.username === currentUser.username;
      const row       = document.createElement('div');
      row.className   = 'lb-row' + (isCurrent ? ' current-user' : '');

      let moveHTML = '<span class="col-move move-same">—</span>';
      if (player.movement > 0) {
        moveHTML = `<span class="col-move move-up">▲${player.movement}</span>`;
      } else if (player.movement < 0) {
        moveHTML = `<span class="col-move move-down">▼${Math.abs(player.movement)}</span>`;
      }

      row.innerHTML = `
        <span class="col-rank ${player.rank <= 3 ? 'top' : ''}">${player.rank}</span>
        <div class="col-user">
          <span class="user-name">${player.username.toUpperCase()}</span>
          <span class="user-tag">${isCurrent ? 'YOU' : 'PLAYER'}</span>
        </div>
        <span class="col-pts">${player.points}</span>
        ${moveHTML}
      `;

      lbRows.appendChild(row);
    });

  } catch (err) {
    console.error('Failed to load leaderboard:', err);
    emptyState.classList.remove('hidden');
  }
}

loadLeaderboard();
