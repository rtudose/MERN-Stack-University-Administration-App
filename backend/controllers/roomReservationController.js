// controllers/roomReservationController.js
const RoomReservation = require('../models/RoomReservation');
const Room = require('../models/Room');
const ScheduleEntry = require('../models/ScheduleEntry');
const Course = require('../models/Course');
const User = require('../models/User');

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

const createRoomReservation = async (req, res) => {
    const { room, date, startTime, endTime, purpose, attendees } = req.body;

    try {

        // Fetch the user making the request (using the JWT token id)
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // 1. Validate Room exists and is available for external booking
        const existingRoom = await Room.findById(room);
        if (!existingRoom) {
            return res.status(404).json({ msg: 'Room not found' });
        }
        if (!existingRoom.isAvailableForExternal) {
            return res.status(400).json({ msg: `Room ${existingRoom.name} is not available for external reservations.` });
        }

        // 2. Convert date string to Date object for query
        // Establish absolute lower boundary (Start of Day)
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        // Establish absolute upper boundary (End of Day)
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Execute bounded range query against persistent storage
        const existingReservations = await RoomReservation.find({
            room,
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            },
            status: { $in: ['pending', 'approved'] } 
        });

        for (let resv of existingReservations) {
            if (checkTimeOverlap(resv.startTime, resv.endTime, startTime, endTime)) {
                return res.status(400).json({
                        msg: 'RESERVATION_ROOM_RESERVED',
                        details: {
                            roomName: existingRoom.name,
                            reservedBy: resv.reservedBy,
                            startTime: resv.startTime,
                            endTime: resv.endTime
                        }
                });
            }
        }

        // 4. Overlap Detection with existing Academic Schedule Entries
        // Need to convert reservation date to day of week string
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = days[startOfDay.getDay()];

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
                    msg: 'RESERVATION_BLOCKED_BY',
                    details: {
                        roomName: existingRoom.name,
                        courseName: course ? course.name : 'Unknown Course',
                        startTime: entry.startTime,
                        endTime: entry.endTime,
                        dayOfWeek: dayOfWeek
                    }
                });
            }
        }

        // 5. If no overlaps, create and save the reservation request
        const newReservation = new RoomReservation({
        room,
        reservedBy: user.username,
        contactEmail: user.email,
        date: startOfDay,
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
        console.error("🔥 MONGOOSE SAVE ERROR:", err); // This will print the exact issue
        
        // Catch Mongoose Validation Errors and send them to the frontend
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: messages.join(', ') });
        }
        
        if (err.name === 'Error' && err.message.includes('End time must be after start time')) {
            return res.status(400).json({ msg: err.message });
        }
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid ID format' });
        }
        res.status(500).send('Server Error');
    }
};

const getRoomReservations = async (req, res) => {
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
};

const getRoomReservationById = async (req, res) => {
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
};

const updateRoomReservationStatus = async (req, res) => {
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
};

const deleteRoomReservation = async (req, res) => {
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
};

module.exports = {
    createRoomReservation,
    getRoomReservations,
    getRoomReservationById,
    updateRoomReservationStatus,
    deleteRoomReservation
};