/* ============================================================
   F1 FORGE — server.js
   Main entry point
   ============================================================ */

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- SERVE STATIC FILES (client folder) ---
app.use(express.static(path.join(__dirname, '../client')));

// --- ROUTES ---
app.use('/api/auth',        require('./routes/auth'));
app.use('/api/team',        require('./routes/team'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/races',       require('./routes/races'));
app.use('/api/predictions', require('./routes/predictions'));

// --- CATCH ALL — serve index.html ---
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// --- CONNECT TO MONGODB ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));
