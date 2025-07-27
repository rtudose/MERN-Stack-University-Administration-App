// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Middleware array for admin-only access
const adminOnly = [auth, authorize(['admin'])];

// @route   POST /api/rooms
// @desc    Create a new room
// @access  Admin
router.post('/', adminOnly, async (req, res) => {
  // Add new fields to destructuring
  const { name, capacity, location, equipment, isAvailableForExternal, status } = req.body;

  try {
    const newRoom = new Room({
      name,
      capacity,
      location,
      equipment,
      isAvailableForExternal,
      status
    });

    const room = await newRoom.save();
    res.status(201).json(room);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: 'Room with this name already exists' });
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json({ msg: message });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/rooms
// @desc    Get all rooms
// @access  Public
router.get('/', adminOnly, async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/rooms/:id
// @desc    Get room by ID
// @access  Public
router.get('/:id', adminOnly, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    res.json(room);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Room ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/rooms/:id
// @desc    Update a room
// @access  Admin
router.put('/:id', adminOnly, async (req, res) => {
  // Add new fields to destructuring
  const { name, capacity, location, equipment, isAvailableForExternal, status } = req.body;

  const roomFields = {};
  if (name) roomFields.name = name;
  if (capacity) roomFields.capacity = capacity;
  if (location) roomFields.location = location;
  if (equipment) roomFields.equipment = equipment;
  if (isAvailableForExternal !== undefined) roomFields.isAvailableForExternal = isAvailableForExternal;
  if (status) roomFields.status = status;

  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: roomFields },
      { new: true, runValidators: true }
    );

    res.json(room);
  } catch (err) {
    if (err.code === 11000) {
        return res.status(400).json({ msg: 'Room with this name already exists' });
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json({ msg: message });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete a room by ID
// @access  Private (Admin only)
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    res.json({ msg: 'Room removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Room ID' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;