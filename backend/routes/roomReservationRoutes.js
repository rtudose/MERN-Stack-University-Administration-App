// routes/roomReservationRoutes.js
const express = require('express');
const router = express.Router();
const RoomReservation = require('../models/RoomReservation');
const Room = require('../models/Room');
const ScheduleEntry = require('../models/ScheduleEntry');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Helper function for time overlap (can be reused from scheduleRoutes or put in a common utility)
const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};
const checkTimeOverlap = (start1, end1, start2, end2) => {
    const s1 = parseTime(start1);
    const e1 = parseTime(end1);
    const s2 = parseTime(start2);
    const e2 = parseTime(end2);
    return s2 < e1 && e2 > s1;
};


// @route   POST /api/room-reservations
// @desc    Request a new room reservation (External Reps)
// @access  Public (or could be Private for 'external_representative' role)
router.post('/', async (req, res) => {
  const { room, reservedBy, contactEmail, date, startTime, endTime, purpose, attendees } = req.body;

  try {
    // 1. Validate Room exists and is available for external booking
    const existingRoom = await Room.findById(room);
    if (!existingRoom) {
      return res.status(404).json({ msg: 'Room not found' });
    }
    if (!existingRoom.isAvailableForExternal) {
      return res.status(400).json({ msg: `Room ${existingRoom.name} is not available for external reservations.` });
    }

    // 2. Convert date string to Date object for query
    const reservationDate = new Date(date);
    reservationDate.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

    // 3. Overlap Detection with existing Room Reservations
    const existingReservations = await RoomReservation.find({
      room,
      date: reservationDate,
      status: { $in: ['pending', 'approved'] } // Consider pending and approved as booked
    });

    for (let resv of existingReservations) {
      if (checkTimeOverlap(resv.startTime, resv.endTime, startTime, endTime)) {
        return res.status(400).json({
          msg: `Room ${existingRoom.name} is already reserved by ${resv.reservedBy} from ${resv.startTime} to ${resv.endTime} on this date.`
        });
      }
    }

    // 4. Overlap Detection with existing Academic Schedule Entries
    // Need to convert reservation date to day of week string
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[reservationDate.getDay()];

    const academicScheduleEntries = await ScheduleEntry.find({
        room,
        dayOfWeek,
        // You might need to check if the current date falls within an academic year/semester defined in schedule entries.
        // For simplicity, let's assume if it's on the schedule, it's blocked.
        // More robust: Add academicYear/semester to RoomReservation if needed
    });

    for (let entry of academicScheduleEntries) {
        if (checkTimeOverlap(entry.startTime, entry.endTime, startTime, endTime)) {
            const course = await Course.findById(entry.course);
            return res.status(400).json({
                msg: `Room ${existingRoom.name} is blocked by an academic schedule entry ('${course ? course.name : 'Unknown Course'}') from ${entry.startTime} to ${entry.endTime} on ${dayOfWeek}.`
            });
        }
    }

    // 5. If no overlaps, create and save the reservation request
    const newReservation = new RoomReservation({
      room,
      reservedBy,
      contactEmail,
      date: reservationDate,
      startTime,
      endTime,
      purpose,
      attendees,
      status: 'pending' // Default status
    });

    await newReservation.save();
    // TODO: Send automatic confirmation email here (future enhancement)

    res.status(201).json({ msg: 'Room reservation request submitted successfully. Awaiting administrator approval.', reservation: newReservation });

  } catch (err) {
    console.error(err.message);
    if (err.name === 'Error' && err.message.includes('End time must be after start time')) {
        return res.status(400).json({ msg: err.message });
    }
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ msg: 'Invalid Room ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/room-reservations
// @desc    Get all room reservations (filterable)
// @access  Private (Admin only)
router.get('/', auth, authorize(['admin']), async (req, res) => {
  try {
    const { status, room, date } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (room) filter.room = room;
    if (date) {
        const queryDate = new Date(date);
        queryDate.setHours(0,0,0,0);
        filter.date = {
            $gte: queryDate,
            $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000) // Next day
        };
    }

    const reservations = await RoomReservation.find(filter)
                                              .populate('room', ['name', 'location'])
                                              .sort({ date: 1, startTime: 1 });
    res.json(reservations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/room-reservations/:id
// @desc    Get a single room reservation by ID
// @access  Private (Admin only)
router.get('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const reservation = await RoomReservation.findById(req.params.id)
                                                .populate('room', ['name', 'location']);
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    res.json(reservation);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Reservation ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/room-reservations/:id/status
// @desc    Update status of a room reservation (Admin Action)
// @access  Private (Admin only)
router.put('/:id/status', auth, authorize(['admin']), async (req, res) => {
  const { status, adminNotes } = req.body;

  try {
    let reservation = await RoomReservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }

    if (!['approved', 'rejected', 'cancelled'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status provided.' });
    }

    reservation.status = status;
    if (adminNotes) reservation.adminNotes = adminNotes;

    await reservation.save();
    // TODO: Send notification email to the contactEmail based on status change (future)
    res.json({ msg: `Reservation status updated to ${status}`, reservation });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Reservation ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/room-reservations/:id
// @desc    Delete a room reservation
// @access  Private (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const reservation = await RoomReservation.findByIdAndDelete(req.params.id);
    if (!reservation) {
      return res.status(404).json({ msg: 'Reservation not found' });
    }
    res.json({ msg: 'Room reservation removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Reservation ID' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;