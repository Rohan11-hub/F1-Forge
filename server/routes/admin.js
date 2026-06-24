/* ============================================================
   F1 FORGE — routes/admin.js
   ============================================================ */

const express       = require('express');
const User          = require('../models/User');
const Team          = require('../models/Team');
const Race          = require('../models/Race');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Admin check middleware
const adminOnly = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access only.' });
  }
  next();
};

// --- SCORING FUNCTIONS ---
const POSITION_POINTS = { 1:25, 2:18, 3:15, 4:12, 5:10, 6:8, 7:6, 8:4, 9:2, 10:1 };
const FAIL_STATES     = ['DNF', 'DNS', 'DSQ'];

function calculateDriverScore(result) {
  const { finish, gridStart, pole, fastestLap } = result;
  if (FAIL_STATES.includes(finish)) return -5;

  let score = POSITION_POINTS[finish] || 0;
  if (pole)       score += 5;
  if (fastestLap) score += 5;

  const delta = gridStart - finish;
  score += delta > 0 ? delta : delta < 0 ? delta : 0;

  return score;
}

function calculateConstructorScore(d1Result, d2Result, drivers) {
  const d1Score  = calculateDriverScore(d1Result);
  const d2Score  = calculateDriverScore(d2Result);
  let score      = d1Score + d2Score;
  const d1Podium = !FAIL_STATES.includes(d1Result.finish) && d1Result.finish <= 3;
  const d2Podium = !FAIL_STATES.includes(d2Result.finish) && d2Result.finish <= 3;
  if (d1Podium && d2Podium) score += 10;
  return score;
}

// --- SAVE RACE RESULTS & CALCULATE SCORES ---
router.post('/results', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, round, date, grid, finish, status, pole, fastestLap, drivers: driversData, constructors: constructorsData } = req.body;

    // Save race
    const race = new Race({
      name, round, date,
      results: { grid, finish, status, pole, fastestLap }
    });
    await race.save();

    // Get all teams
    const teams = await Team.find().populate('user');
    const TRANSFER_PENALTY = -10;

    // Save previous ranks
    const allUsers = await User.find().sort({ points: -1 });
    for (let i = 0; i < allUsers.length; i++) {
      allUsers[i].previousRank = i + 1;
      await allUsers[i].save();
    }

    // Calculate scores for each team
    for (const team of teams) {
      if (!team.user) continue;
      let totalScore = 0;

      // Driver scores
      for (const driverId of team.drivers) {
        const driverFinish = status[driverId] || finish[driverId];
        const driverGrid   = grid[driverId]   || finish[driverId];
        if (!driverFinish) continue;

        const result = {
          finish:     FAIL_STATES.includes(driverFinish) ? driverFinish : parseInt(driverFinish),
          gridStart:  parseInt(driverGrid),
          pole:       pole === driverId,
          fastestLap: fastestLap === driverId
        };

        let score = calculateDriverScore(result);
        if (driverId === team.turbo) score *= 2;
        totalScore += score;
      }

      // Constructor scores
      for (const constructorId of team.constructors) {
        const constructor     = constructorsData.find(c => c.id === constructorId);
        if (!constructor) continue;

        const constructorDrivers = driversData.filter(d => d.team === constructor.name);
        if (constructorDrivers.length < 2) continue;

        const d1 = constructorDrivers[0];
        const d2 = constructorDrivers[1];

        const d1Finish = status[d1.id] || finish[d1.id];
        const d2Finish = status[d2.id] || finish[d2.id];

        if (!d1Finish || !d2Finish) continue;

        const d1Result = {
          finish:     FAIL_STATES.includes(d1Finish) ? d1Finish : parseInt(d1Finish),
          gridStart:  parseInt(grid[d1.id] || d1Finish),
          pole:       pole === d1.id,
          fastestLap: fastestLap === d1.id
        };

        const d2Result = {
          finish:     FAIL_STATES.includes(d2Finish) ? d2Finish : parseInt(d2Finish),
          gridStart:  parseInt(grid[d2.id] || d2Finish),
          pole:       pole === d2.id,
          fastestLap: fastestLap === d2.id
        };

        totalScore += calculateConstructorScore(d1Result, d2Result);
      }

      // Transfer penalty
      const extraTransfers = Math.max(0, team.transfersUsed - 1);
      totalScore += extraTransfers * TRANSFER_PENALTY;

      // Update user points
      await User.findByIdAndUpdate(team.user._id, {
        $inc: { points: totalScore }
      });

      // Reset transfers for next race
      team.transfersUsed = 0;
      await team.save();
    }

    race.processed = true;
    await race.save();

    res.json({ message: 'Race results saved and scores calculated.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- GET ALL RACES ---
router.get('/races', authMiddleware, adminOnly, async (req, res) => {
  try {
    const races = await Race.find().sort({ round: -1 });
    res.json(races);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
