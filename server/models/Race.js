/* ============================================================
   F1 FORGE — models/Race.js
   ============================================================ */

const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  round:  { type: Number, required: true },
  date:   { type: String },
  results: {
    grid:       { type: Map, of: Number },
    finish:     { type: Map, of: mongoose.Schema.Types.Mixed },
    status:     { type: Map, of: String },
    pole:       { type: Number },
    fastestLap: { type: Number }
  },
  processed: {
    type:    Boolean,
    default: false
  },
  savedAt: {
    type:    Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Race', raceSchema);
