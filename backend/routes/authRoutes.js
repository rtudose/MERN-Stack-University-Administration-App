// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the User model
const jwt = require('jsonwebtoken'); // For creating JSON Web Tokens
const bcrypt = require('bcryptjs'); // Already installed, used by User model but good to know it's available

// Load environment variables for JWT secret
require('dotenv').config();

// @route   POST /api/auth/register
// @desc    Register a new admin user
// @access  Public (for initial admin setup, should be protected later)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    // 1. Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with that email already exists' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'User with that username already exists' });
    }

    // 2. Create new user instance (password hashing happens in pre-save hook)
    user = new User({
      username,
      email,
      password, // This password will be hashed by the pre-save hook in the User model
      role: role || 'student' // Allow specifying role, default to student
    });

    // For initial admin creation, it should be wise to force role to 'admin'
    // if (role === 'admin') {
    //   user.role = 'admin';
    // } else {
    //   user.role = 'student'; // Or any other default role
    // }
    // For this project, let's assume initial admin creation is done carefully
    // or a default admin is seeded. For now, let's allow role to be sent.

    // 3. Save user to database
    await user.save();

    // 4. Create and send JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role // Include role in token payload
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET, // The secret key from .env
      { expiresIn: '1h' }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ msg: 'User registered successfully', token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists by email
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Compare entered password with hashed password
    const isMatch = await user.matchPassword(password); // Using the method defined in User model
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Create and send JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          role: user.role, 
          username: user.username,
          email: user.email 
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;