/* ============================================================
   F1 FORGE — scoring.js
   Pure calculation module — NO UI logic
   ============================================================ */

const POSITION_POINTS = {
  1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
  6: 8,  7: 6,  8: 4,  9: 2,  10: 1
};

const FAIL_STATES  = ['DNF', 'DNS', 'DSQ'];
const FAIL_PENALTY = -5;
const POLE_BONUS   = 5;
const FASTEST_BONUS = 5;
const POSITION_GAIN_BONUS = 1;
const POSITION_LOSS_PENALTY = -1;
const CONSTRUCTOR_DOUBLE_PODIUM = 10;
const TURBO_MULTIPLIER = 2;
const TRANSFER_PENALTY = -10;

/* ============================================================
   calculateDriverScore
   
   @param {object} driverResult - {
     finish:     number | 'DNF' | 'DNS' | 'DSQ',
     gridStart:  number,
     pole:       boolean,
     fastestLap: boolean
   }
   @returns {number} score
   ============================================================ */
function calculateDriverScore(driverResult) {
  const { finish, gridStart, pole, fastestLap } = driverResult;

  // Fail state — no other points apply
  if (FAIL_STATES.includes(finish)) return FAIL_PENALTY;

  let score = 0;

  // Finishing position points
  score += POSITION_POINTS[finish] || 0;

  // Pole position bonus
  if (pole) score += POLE_BONUS;

  // Fastest lap bonus
  if (fastestLap) score += FASTEST_BONUS;

  // Positions gained / lost
  const positionDelta = gridStart - finish;
  if (positionDelta > 0) {
    score += positionDelta * POSITION_GAIN_BONUS;
  } else if (positionDelta < 0) {
    score += positionDelta * Math.abs(POSITION_LOSS_PENALTY);
  }

  return score;
}

/* ============================================================
   calculateConstructorScore

   @param {object} constructorResult - {
     driver1Result: driverResult object,
     driver2Result: driverResult object
   }
   @returns {number} score
   ============================================================ */
function calculateConstructorScore(constructorResult) {
  const { driver1Result, driver2Result } = constructorResult;

  const d1Score = calculateDriverScore(driver1Result);
  const d2Score = calculateDriverScore(driver2Result);

  let score = d1Score + d2Score;

  // Double podium bonus
  const d1Podium = !FAIL_STATES.includes(driver1Result.finish) && driver1Result.finish <= 3;
  const d2Podium = !FAIL_STATES.includes(driver2Result.finish) && driver2Result.finish <= 3;

  if (d1Podium && d2Podium) score += CONSTRUCTOR_DOUBLE_PODIUM;

  return score;
}

/* ============================================================
   applyTurboMultiplier

   @param {number} driverScore
   @returns {number} doubled score
   ============================================================ */
function applyTurboMultiplier(driverScore) {
  return driverScore * TURBO_MULTIPLIER;
}

/* ============================================================
   calculateTeamScore

   @param {object} teamData - {
     drivers: [{ id, result: driverResult }],
     constructors: [{ id, result: constructorResult }],
     turboDriverId: number
   }
   @param {object} raceResults - full race result object from admin
   @returns {object} { totalScore, breakdown }
   ============================================================ */
function calculateTeamScore(teamData, raceResults) {
  const { drivers, constructors, turboDriverId } = teamData;
  let totalScore = 0;
  const breakdown = { drivers: [], constructors: [], turbo: null };

  // Driver scores
  drivers.forEach(({ id }) => {
    const result = raceResults.drivers[id];
    if (!result) return;

    let score = calculateDriverScore(result);
    const isTurbo = id === turboDriverId;

    if (isTurbo) {
      score = applyTurboMultiplier(score);
      breakdown.turbo = { id, score };
    }

    totalScore += score;
    breakdown.drivers.push({ id, score, isTurbo });
  });

  // Constructor scores
  constructors.forEach(({ id }) => {
    const result = raceResults.constructors[id];
    if (!result) return;

    const score = calculateConstructorScore(result);
    totalScore += score;
    breakdown.constructors.push({ id, score });
  });

  return { totalScore, breakdown };
}

/* ============================================================
   calculateLeaderboard

   @param {array} teams - [{ userId, username, totalPoints }]
   @returns {array} sorted leaderboard
   ============================================================ */
function calculateLeaderboard(teams) {
  return [...teams].sort((a, b) => b.totalPoints - a.totalPoints).map((team, index) => ({
    ...team,
    rank: index + 1
  }));
}

/* ============================================================
   applyTransferPenalty

   @param {number} extraTransfers - number of transfers over the free allowance
   @returns {number} penalty points
   ============================================================ */
function applyTransferPenalty(extraTransfers) {
  return extraTransfers * TRANSFER_PENALTY;
}

/* ============================================================
   EXPORTS (for use in admin.js and leaderboard.js)
   ============================================================ */
if (typeof module !== 'undefined') {
  module.exports = {
    calculateDriverScore,
    calculateConstructorScore,
    applyTurboMultiplier,
    calculateTeamScore,
    calculateLeaderboard,
    applyTransferPenalty
  };
}