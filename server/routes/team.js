/* ============================================================
   F1 FORGE — routes/team.js
   ============================================================ */

const express       = require('express');
const Team          = require('../models/Team');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const BUDGET        = 150;
const FREE_TRANSFERS = 1;
const TRANSFER_PENALTY = -10;

// --- GET TEAM ---
router.get('/', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findOne({ user: req.user._id });
    if (!team) return res.status(404).json({ message: 'No team found.' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- SAVE TEAM ---
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { drivers, constructors, turbo, totalCost, currentRace } = req.body;

    // Validate
    if (!drivers || drivers.length !== 5) {
      return res.status(400).json({ message: 'Select exactly 5 drivers.' });
    }
    if (!constructors || constructors.length !== 2) {
      return res.status(400).json({ message: 'Select exactly 2 constructors.' });
    }
    if (!turbo) {
      return res.status(400).json({ message: 'Select a turbo driver.' });
    }
    if (totalCost > BUDGET) {
      return res.status(400).json({ message: 'Team exceeds budget.' });
    }

    // Check existing team for transfers
    const existingTeam = await Team.findOne({ user: req.user._id });

    if (existingTeam) {
      // Count transfers
      const oldDrivers = new Set(existingTeam.drivers);
      const newDrivers = new Set(drivers);
      let transfers = 0;

      newDrivers.forEach(d => { if (!oldDrivers.has(d)) transfers++; });

      // Check if new race
      const isNewRace = currentRace !== existingTeam.lastTransferRace;
      const freeTransfersLeft = isNewRace ? FREE_TRANSFERS : Math.max(0, FREE_TRANSFERS - existingTeam.transfersUsed);
      const extraTransfers = Math.max(0, transfers - freeTransfersLeft);

      existingTeam.drivers      = drivers;
      existingTeam.constructors = constructors;
      existingTeam.turbo        = turbo;
      existingTeam.transfersUsed = isNewRace ? transfers : existingTeam.transfersUsed + transfers;
      existingTeam.lastTransferRace = currentRace || existingTeam.lastTransferRace;
      existingTeam.savedAt      = Date.now();

      await existingTeam.save();

      return res.json({
        message: 'Team updated.',
        team: existingTeam,
        extraTransfers,
        penaltyPoints: extraTransfers * TRANSFER_PENALTY
      });
    }

    // New team
    const team = new Team({
      user:         req.user._id,
      drivers,
      constructors,
      turbo,
      lastTransferRace: currentRace || null
    });

    await team.save();
    res.status(201).json({ message: 'Team saved.', team });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
