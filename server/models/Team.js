/* ============================================================
   F1 FORGE — models/Team.js
   ============================================================ */

const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
    unique:   true
  },
  drivers: [{
    type: Number
  }],
  constructors: [{
    type: Number
  }],
  turbo: {
    type: Number
  },
  transfersUsed: {
    type:    Number,
    default: 0
  },
  lastTransferRace: {
    type:    Number,
    default: null
  },
  savedAt: {
    type:    Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Team', teamSchema);
