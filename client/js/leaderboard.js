/* ============================================================
   F1 FORGE — leaderboard.js
   ============================================================ */

function loadLeaderboard() {
  const users       = JSON.parse(localStorage.getItem('f1forge_users') || '[]');
  const currentUser = JSON.parse(localStorage.getItem('f1forge_current') || 'null');

  const podiumSection = document.getElementById('podiumSection');
  const lbRows        = document.getElementById('lbRows');
  const emptyState    = document.getElementById('emptyState');
  const tableSection  = document.querySelector('.table-section');

  // No users
  if (users.length === 0) {
    podiumSection.classList.add('hidden');
    tableSection.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  // Sort by points descending
  const sorted = [...users].sort((a, b) => (b.points || 0) - (a.points || 0));

  // --- PODIUM (top 3) ---
  podiumSection.innerHTML = '';
  const podiumClasses = ['p1', 'p2', 'p3'];
  const podiumLabels  = ['1ST', '2ND', '3RD'];

  sorted.slice(0, 3).forEach((user, i) => {
    const card = document.createElement('div');
    card.className = `podium-card ${podiumClasses[i]}`;
    card.innerHTML = `
      <span class="podium-rank">${podiumLabels[i]}</span>
      <span class="podium-name">${user.username.toUpperCase()}</span>
      <span class="podium-pts">${user.points || 0} PTS</span>
    `;
    podiumSection.appendChild(card);
  });

  // Hide podium if less than 3 users
  if (sorted.length < 3) {
    const needed = 3 - sorted.length;
    for (let i = 0; i < needed; i++) {
      const empty = document.createElement('div');
      empty.className = `podium-card ${podiumClasses[sorted.length + i]}`;
      empty.innerHTML = `
        <span class="podium-rank">${podiumLabels[sorted.length + i]}</span>
        <span class="podium-name" style="color:var(--muted)">—</span>
        <span class="podium-pts">0 PTS</span>
      `;
      podiumSection.appendChild(empty);
    }
  }

  // --- FULL TABLE ---
  lbRows.innerHTML = '';

  sorted.forEach((user, i) => {
    const rank        = i + 1;
    const isCurrent   = currentUser && user.email === currentUser.email;
    const row         = document.createElement('div');
    row.className     = 'lb-row' + (isCurrent ? ' current-user' : '');

    // Movement placeholder (Phase 2 will track real movement)
    const moveHTML = '<span class="col-move move-same">—</span>';

    row.innerHTML = `
      <span class="col-rank ${rank <= 3 ? 'top' : ''}">${rank}</span>
      <div class="col-user">
        <span class="user-name">${user.username.toUpperCase()}</span>
        <span class="user-tag">${isCurrent ? 'YOU' : 'PLAYER'}</span>
      </div>
      <span class="col-pts">${user.points || 0}</span>
      ${moveHTML}
    `;

    lbRows.appendChild(row);
  });
}

loadLeaderboard();