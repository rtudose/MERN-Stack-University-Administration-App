// backend/routes/publicRoutes.js - MAKE CUSTOM CONTROLLER FILE!!
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');

// @route   GET /api/public/rooms
// @desc    Get rooms available for booking
// @access  Private (any authenticated user)
router.get('/rooms', auth, async (req, res) => {
  try {
    // UPDATED: Only find rooms that are 'available' AND 'isAvailableForExternal'
    const rooms = await Room.find({ 
      status: 'available', 
      isAvailableForExternal: true 
    }).sort({ name: 1 });
    
    res.json(rooms);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;