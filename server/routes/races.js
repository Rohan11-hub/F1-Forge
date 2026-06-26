/* ============================================================
   F1 FORGE — routes/races.js
   ============================================================ */

const express = require('express');
const Race    = require('../models/Race');

const router = express.Router();

// --- GET LAST RACE ---
router.get('/last', async (req, res) => {
  try {
    const race = await Race.findOne({ processed: true }).sort({ round: -1 });
    if (!race) return res.status(404).json({ message: 'No races yet.' });
    res.json(race);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- GET NEXT RACE ---
router.get('/next', async (req, res) => {
  try {
    const race = await Race.findOne({ processed: false }).sort({ round: 1 });
    if (!race) return res.status(404).json({ message: 'No upcoming races.' });
    res.json(race);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- GET ALL RACES ---
router.get('/', async (req, res) => {
  try {
    const races = await Race.find().sort({ round: -1 });
    res.json(races);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;