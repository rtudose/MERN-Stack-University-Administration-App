// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User'); // Assuming student is a 'User'
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Helper function for time overlap
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

    // @route   GET /api/appointments/available-slots
    // @desc    Get available appointment slots for a given date (Public/Student)
    // @access  Public (or Private for 'student' role)
    router.get('/available-slots', async (req, res) => {
        const { date } = req.query; // Date as 'YYYY-MM-DD'
        if (!date) {
            return res.status(400).json({ msg: 'Date parameter is required.' });
        }

        try {
            const queryDate = new Date(date);
            queryDate.setHours(0, 0, 0, 0); // Normalize to start of day

            const appointmentsForDay = await Appointment.find({
                date: queryDate,
                status: { $in: ['pending', 'confirmed'] } // Only confirmed/pending slots are unavailable
            }).select('startTime endTime'); // Select only the time fields

            const allSlots = [];
            for (let h = 9; h < 17; h++) { // Hours from 09 to 16 (for 09:00-17:00 appointments)
                for (let m = 0; m < 60; m += 15) {
                    const slotStart = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

                    let endHour = h;
                    let endMinute = m + 15;

                    if (endMinute === 60) {
                        endMinute = 0;
                        endHour += 1;
                    }

                    const slotEnd = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

                    allSlots.push({ startTime: slotStart, endTime: slotEnd });
                }
            }

            const availableSlots = allSlots.filter(slot => {
                for (let existingAppt of appointmentsForDay) {
                    // Reusing the checkTimeOverlap helper function
                    if (checkTimeOverlap(existingAppt.startTime, existingAppt.endTime, slot.startTime, slot.endTime)) {
                        return false; // This slot overlaps with an existing appointment
                    }
                }
                return true; // This slot is available
            });

            res.json(availableSlots);

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    });

// @route   POST /api/appointments
// @desc    Student requests a new appointment
// @access  Private (Student/Authenticated User)
router.post('/', auth, authorize(['student', 'admin']), async (req, res) => {
  const { date, startTime, endTime, typeOfRequest, description } = req.body;
  const studentId = req.user.id; // Get student ID from the authenticated token

  try {
    // 1. Validate student ID
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ msg: 'Student not found.' });
    }
    // Ensure the logged in user is actually a student or admin (auth/authorize already handles this, but defensive check)
    if (student.role !== 'student' && student.role !== 'admin') {
        return res.status(403).json({ msg: 'Only students or admins can book appointments.' });
    }

    // 2. Convert date string to Date object for query
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0); // Normalize to start of day

    const officeStart = parseTime("09:00"); // 9 AM
    const officeEnd = parseTime("17:00");   // 5 PM (end of last slot is 16:45, so 17:00 is correct boundary)

    const requestedStart = parseTime(startTime);
    const requestedEnd = parseTime(endTime);

    if (requestedStart < officeStart || requestedEnd > officeEnd) {
      return res.status(400).json({
        msg: `Appointment times must be between 09:00 and 17:00.`
      });
     }

    // 3. Overlap Detection for the student and secretariat (avoid double booking)
    const existingStudentAppointments = await Appointment.find({
        student: studentId,
        date: appointmentDate,
        status: { $in: ['pending', 'confirmed'] }
    });

    for (let appt of existingStudentAppointments) {
        if (checkTimeOverlap(appt.startTime, appt.endTime, startTime, endTime)) {
            return res.status(400).json({
                msg: `You already have an appointment from ${appt.startTime} to ${appt.endTime} on this date.`
            });
        }
    }

    // Also, check for secretariat side overlaps (if secretariat has fixed slots or limited availability)
    // For simplicity, we are assuming secretariat can handle concurrent appointments unless explicitly booked.
    // A more advanced system would check a 'secretariatSchedule' here.

    // 4. Create and save the new appointment request
    const newAppointment = new Appointment({
      student: studentId,
      date: appointmentDate,
      startTime,
      endTime,
      typeOfRequest,
      description,
      status: 'pending' // Default status
    });

    await newAppointment.save();
    // TODO: Send automatic confirmation email to student and notification to secretariat (future)

    res.status(201).json({ msg: 'Appointment request submitted successfully. Awaiting confirmation.', appointment: newAppointment });

  } catch (err) {
    console.error(err.message);
    if (err.name === 'Error' && err.message.includes('End time must be after start time')) {
        return res.status(400).json({ msg: err.message });
    }
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ msg: 'Invalid Student ID or data.' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/appointments
// @desc    Get all appointments (filterable by status, student, date)
// @access  Private (Admin only, or student can view their own)
router.get('/', auth, authorize(['admin', 'student']), async (req, res) => {
  try {
    const { status, studentId, date } = req.query;
    let filter = {};

    // If a student is requesting, they only see their own appointments
    if (req.user.role === 'student') {
        filter.student = req.user.id;
    } else if (studentId) { // Admin can filter by any studentId
        filter.student = studentId;
    }

    if (status) filter.status = status;
    if (date) {
        const queryDate = new Date(date);
        queryDate.setHours(0,0,0,0);
        filter.date = {
            $gte: queryDate,
            $lt: new Date(queryDate.getTime() + 24 * 60 * 60 * 1000)
        };
    }

    const appointments = await Appointment.find(filter)
                                          .populate('student', ['username', 'email']) // Get student info
                                          .sort({ date: 1, startTime: 1 });
    res.json(appointments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/appointments/:id
// @desc    Get a single appointment by ID
// @access  Private (Admin or owner student)
router.get('/:id', auth, authorize(['admin', 'student']), async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
                                            .populate('student', ['username', 'email']);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    // If student, ensure they are the owner of the appointment
    if (req.user.role === 'student' && appointment.student._id.toString() !== req.user.id) {
        return res.status(403).json({ msg: 'Access denied: You can only view your own appointments.' });
    }

    res.json(appointment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Appointment ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/appointments/:id/status
// @desc    Update status of an appointment (Admin action)
// @access  Private (Admin only)
router.put('/:id/status', auth, authorize(['admin']), async (req, res) => {
  const { status, secretariatNotes } = req.body;

  try {
    let appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }

    if (!['confirmed', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status provided.' });
    }

    appointment.status = status;
    if (secretariatNotes) appointment.secretariatNotes = secretariatNotes;

    await appointment.save();
    // TODO: Send notification emails for status change (future)
    res.json({ msg: `Appointment status updated to ${status}`, appointment });

  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Appointment ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete an appointment
// @access  Private (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ msg: 'Appointment not found' });
    }
    res.json({ msg: 'Appointment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Appointment ID' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;