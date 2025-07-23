// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const adminOnly = [auth, authorize(['admin'])];

// @route   GET /api/users
// @desc    Get all users
// @access  Admin
router.get('/', adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// @route   POST /api/users
// @desc    Create a new user (by an admin)
// @access  Admin
router.post('/', adminOnly, async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const user = new User({
      username,
      email,
      password,
      role: role || 'student',
    });

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (err) {
    // UPDATED: Smart catch block
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ msg: `User with this ${field} already exists` });
    }
    // NEW: Handle Mongoose validation errors specifically
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      return res.status(400).json({ msg: message });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/users/:id
// @desc    Update a user's role or info
// @access  Admin
router.put('/:id', adminOnly, async (req, res) => {
  const { username, email, role } = req.body;
  const userFields = {};
  if (username) userFields.username = username;
  if (email) userFields.email = email;
  if (role) userFields.role = role;

  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.role === 'admin' && role && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ msg: 'Cannot remove the last administrator' });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: userFields },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    // UPDATED: Smart catch block
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ msg: `User with this ${field} already exists` });
    }
    // NEW: Handle Mongoose validation errors specifically
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      return res.status(400).json({ msg: message });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (user._id.toString() === req.user.id) {
        return res.status(400).json({ msg: 'You cannot delete your own account' });
    }
    
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ msg: 'Cannot delete the last administrator' });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


module.exports = router;