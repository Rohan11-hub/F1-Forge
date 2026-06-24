/* ============================================================
   F1 FORGE — routes/auth.js
   ============================================================ */

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// --- SIGNUP ---
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, adminCode } = req.body;

    // Validate
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check existing
    const existingEmail    = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail)    return res.status(400).json({ message: 'Email already in use.' });
    if (existingUsername) return res.status(400).json({ message: 'Username already taken.' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check admin code
    const isAdmin = adminCode === process.env.ADMIN_CODE;

    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      isAdmin
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.status(201).json({
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        points:   user.points,
        isAdmin:  user.isAdmin,
        joined:   user.joined
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Incorrect email or password.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect email or password.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: {
        id:       user._id,
        username: user.username,
        email:    user.email,
        points:   user.points,
        isAdmin:  user.isAdmin,
        joined:   user.joined
      }
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// --- GET CURRENT USER ---
router.get('/me', authMiddleware, async (req, res) => {
  res.json(req.user);
});

// --- CHANGE PASSWORD ---
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user    = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully.' });

  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
