/* ============================================================
   F1 FORGE — routes/predictions.js
   ============================================================ */

const express        = require('express');
const Prediction     = require('../models/Prediction');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// --- SAVE / UPDATE PREDICTION ---
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { race, predictions } = req.body;

    if (!race || !predictions) {
      return res.status(400).json({ message: 'Race and predictions are required.' });
    }

    if (!predictions.podium || predictions.podium.length !== 3) {
      return res.status(400).json({ message: 'Podium must have exactly 3 drivers.' });
    }

    // Check if already locked
    const existing = await Prediction.findOne({ user: req.user._id, race });
    if (existing && existing.locked) {
      return res.status(400).json({ message: 'Predictions are locked for this race.' });
    }

    const prediction = await Prediction.findOneAndUpdate(
      { user: req.user._id, race },
      { predictions, submittedAt: Date.now() },
      { upsert: true, new: true }
    );

    res.json({ message: 'Predictions saved!', prediction });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- GET MY PREDICTION FOR A RACE ---
router.get('/my/:race', authMiddleware, async (req, res) => {
  try {
    const prediction = await Prediction.findOne({
      user: req.user._id,
      race: parseInt(req.params.race)
    });
    if (!prediction) return res.status(404).json({ message: 'No prediction found.' });
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- GET ALL MY PREDICTIONS ---
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const predictions = await Prediction.find({ user: req.user._id }).sort({ race: -1 });
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- GET PREDICTION POPULARITY (how many picked each driver) ---
router.get('/popularity/:race', async (req, res) => {
  try {
    const predictions = await Prediction.find({ race: parseInt(req.params.race) });

    const popularity = {
      podium:         {},
      pole:           {},
      fastestLap:     {},
      dnfDriver:      {},
      fastestPit:     {},
      topTeam:        {},
      mostPositions:  {},
      driverOfTheDay: {},
      safetyCar:      { yes: 0, no: 0 },
      retirements:    {}
    };

    predictions.forEach(p => {
      const pred = p.predictions;

      // Podium
      if (pred.podium) {
        pred.podium.forEach(id => {
          popularity.podium[id] = (popularity.podium[id] || 0) + 1;
        });
      }

      // Single driver/team picks
      ['pole', 'fastestLap', 'dnfDriver', 'fastestPit', 'topTeam', 'mostPositions', 'driverOfTheDay'].forEach(key => {
        if (pred[key]) {
          popularity[key][pred[key]] = (popularity[key][pred[key]] || 0) + 1;
        }
      });

      // Safety car
      if (pred.safetyCar !== undefined) {
        pred.safetyCar ? popularity.safetyCar.yes++ : popularity.safetyCar.no++;
      }

      // Retirements
      if (pred.retirements !== undefined) {
        popularity.retirements[pred.retirements] = (popularity.retirements[pred.retirements] || 0) + 1;
      }
    });

    res.json({ total: predictions.length, popularity });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- CALCULATE PREDICTION SCORES (called by admin route) ---
async function calculatePredictionScores(round, results) {
  try {
    const predictions = await Prediction.find({ race: round });

    for (const pred of predictions) {
      let points    = 0;
      const breakdown = {};

      const p = pred.predictions;

      // 1. PODIUM
      if (p.podium && results.podium) {
        const predicted = p.podium;
        const actual    = results.podium;

        const exactMatches = predicted.filter((id, i) => id === actual[i]).length;
        const anyMatches   = predicted.filter(id => actual.includes(id)).length;

        if (exactMatches === 3) {
          breakdown.podium = 15;
        } else if (anyMatches === 3) {
          breakdown.podium = 10;
        } else if (anyMatches === 2) {
          breakdown.podium = 10;
        } else if (anyMatches === 1) {
          breakdown.podium = 5;
        } else {
          breakdown.podium = 0;
        }
        points += breakdown.podium;
      }

      // 2. POLE
      if (p.pole && results.pole) {
        breakdown.pole = p.pole === results.pole ? 10 : 0;
        points += breakdown.pole;
      }

      // 3. FASTEST LAP
      if (p.fastestLap && results.fastestLap) {
        breakdown.fastestLap = p.fastestLap === results.fastestLap ? 10 : 0;
        points += breakdown.fastestLap;
      }

      // 4. SAFETY CAR
      if (p.safetyCar !== undefined && results.safetyCar !== undefined) {
        breakdown.safetyCar = p.safetyCar === results.safetyCar ? 5 : 0;
        points += breakdown.safetyCar;
      }

      // 5. DNF DRIVER
      if (p.dnfDriver && results.dnfDrivers) {
        breakdown.dnfDriver = results.dnfDrivers.includes(p.dnfDriver) ? 10 : 0;
        points += breakdown.dnfDriver;
      }

      // 6. FASTEST PIT STOP TEAM
      if (p.fastestPit && results.fastestPit) {
        breakdown.fastestPit = p.fastestPit === results.fastestPit ? 10 : 0;
        points += breakdown.fastestPit;
      }

      // 7. RETIREMENTS
      if (p.retirements !== undefined && results.retirements !== undefined) {
        const diff = Math.abs(p.retirements - results.retirements);
        if (diff === 0) {
          breakdown.retirements = 10;
        } else if (diff === 1) {
          breakdown.retirements = 5;
        } else {
          breakdown.retirements = 0;
        }
        points += breakdown.retirements;
      }

      // 8. TOP TEAM
      if (p.topTeam && results.topTeam) {
        breakdown.topTeam = p.topTeam === results.topTeam ? 10 : 0;
        points += breakdown.topTeam;
      }

      // 9. MOST POSITIONS GAINED
      if (p.mostPositions && results.mostPositions) {
        breakdown.mostPositions = p.mostPositions === results.mostPositions ? 10 : 0;
        points += breakdown.mostPositions;
      }

      // 10. DRIVER OF THE DAY
      if (p.driverOfTheDay && results.driverOfTheDay) {
        breakdown.driverOfTheDay = p.driverOfTheDay === results.driverOfTheDay ? 10 : 0;
        points += breakdown.driverOfTheDay;
      }

      pred.points    = points;
      pred.breakdown = breakdown;
      pred.locked    = true;
      await pred.save();

      // Add prediction points to user total
      const User = require('../models/User');
      await User.findByIdAndUpdate(pred.user, { $inc: { points } });
    }

    return true;
  } catch (err) {
    console.error('Prediction scoring error:', err);
    return false;
  }
}

module.exports = router;
module.exports.calculatePredictionScores = calculatePredictionScores;