// backend/routes/reservationRoutes.js (Corrected)
const express = require('express');
const router = express.Router();
const RoomReservation = require('../models/RoomReservation');
const Room = require('../models/Room');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Middleware for admin-only access
const adminOnly = [auth, authorize(['admin'])];

// --- PUBLIC ROUTE ---

// @route   POST /api/reservations
// @desc    Create a new room reservation (for any authenticated user)
// @access  Private
router.post('/', auth, async (req, res) => {
  const { room, date, startTime, endTime, purpose, attendees } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) { return res.status(404).json({ msg: 'User not found' }); }

    const roomDoc = await Room.findById(room);
    if (attendees && roomDoc.capacity < attendees) {
      return res.status(400).json({ msg: 'Number of attendees exceeds room capacity' });
    }

    const newReservation = new RoomReservation({
      room, date, startTime, endTime, purpose, attendees,
      reservedBy: user.username,
      contactEmail: user.email,
      status: 'pending'
    });

    const reservation = await newReservation.save();
    res.status(201).json(reservation);

  } catch (err) {
    if (err.message === 'End time must be after start time.') {
      return res.status(400).json({ msg: err.message });
    }
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      return res.status(400).json({ msg: message });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/reservations/my-reservations
// @desc    Get all reservations for the currently logged-in user
// @access  Private
router.get('/my-reservations', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        const reservations = await RoomReservation.find({ contactEmail: user.email })
            .populate('room', 'name location') // Get room name and location
            .sort({ date: -1 });

        res.json(reservations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- ADMIN ROUTES ---

// @route   GET /api/reservations
// @desc    Get all room reservations (for admins)
// @access  Admin
router.get('/', adminOnly, async (req, res) => {
    try {
        const reservations = await RoomReservation.find()
            .populate('room', 'name') // Replace the room ID with the room's name
            .sort({ date: -1 }); // Show the most recent requests first
        res.json(reservations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT /api/reservations/:id/status
// @desc    Update the status of a reservation (approve/reject)
// @access  Admin
router.put('/:id/status', adminOnly, async (req, res) => {
    const { status } = req.body;

    const allowedStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ msg: 'Invalid status value' });
    }

    try {
        const reservation = await RoomReservation.findById(req.params.id);
        if (!reservation) {
            return res.status(404).json({ msg: 'Reservation not found' });
        }

        reservation.status = status;
        await reservation.save();

        res.json(reservation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;