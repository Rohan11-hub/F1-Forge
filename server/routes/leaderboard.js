/* ============================================================
   F1 FORGE — routes/leaderboard.js
   ============================================================ */

const express = require('express');
const User    = require('../models/User');

const router = express.Router();

// --- GET LEADERBOARD ---
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'username points previousRank joined')
      .sort({ points: -1 });

    const leaderboard = users.map((user, index) => ({
      rank:         index + 1,
      username:     user.username,
      points:       user.points,
      previousRank: user.previousRank,
      movement:     user.previousRank ? user.previousRank - (index + 1) : 0,
      joined:       user.joined
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
