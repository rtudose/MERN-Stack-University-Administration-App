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
// @access  Private (Admin only)
router.post('/', adminOnly, async (req, res) => {
  const { name, capacity, equipment, location, isAvailableForExternal } = req.body;

  try {
    // Check if room name already exists
    let room = await Room.findOne({ name });
    if (room) {
      return res.status(400).json({ msg: 'Room with this name already exists' });
    }

    room = new Room({
      name,
      capacity,
      equipment,
      location,
      isAvailableForExternal
    });

    await room.save();
    res.status(201).json(room);
  } catch (err) {
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
// @desc    Update a room by ID
// @access  Private (Admin only)
router.put('/:id', adminOnly, async (req, res) => {
  const { name, capacity, equipment, location, isAvailableForExternal } = req.body;

  // Build room object
  const roomFields = {};
  if (name) roomFields.name = name;
  if (capacity) roomFields.capacity = capacity;
  if (equipment) roomFields.equipment = equipment;
  if (location) roomFields.location = location;
  if (typeof isAvailableForExternal === 'boolean') roomFields.isAvailableForExternal = isAvailableForExternal;


  try {
    let room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    // Check for duplicate name if it's being updated to an existing value
    if (name && name !== room.name) {
        const existingRoom = await Room.findOne({ name });
        if (existingRoom) return res.status(400).json({ msg: 'Room with this name already exists' });
    }

    room = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: roomFields },
      { new: true }
    );

    res.json(room);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Room ID' });
    }
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