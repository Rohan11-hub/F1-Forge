/* ============================================================
   F1 FORGE — models/Prediction.js
   ============================================================ */

const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  user: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true
  },
  race: {
    type:     Number,
    required: true  // round number
  },
  predictions: {
    podium:          [Number],  // [driverId P1, driverId P2, driverId P3]
    pole:            Number,    // driverId
    fastestLap:      Number,    // driverId
    safetyCar:       Boolean,   // true/false
    dnfDriver:       Number,    // driverId
    fastestPit:      Number,    // constructorId
    retirements:     Number,    // number
    topTeam:         Number,    // constructorId
    mostPositions:   Number,    // driverId
    driverOfTheDay:  Number,    // driverId
  },
  points: {
    type:    Number,
    default: null   // null = not calculated yet
  },
  breakdown: {
    type:    Object,
    default: {}
  },
  locked: {
    type:    Boolean,
    default: false
  },
  submittedAt: {
    type:    Date,
    default: Date.now
  }
});

// One prediction per user per race
predictionSchema.index({ user: 1, race: 1 }, { unique: true });

module.exports = mongoose.model('Prediction', predictionSchema);