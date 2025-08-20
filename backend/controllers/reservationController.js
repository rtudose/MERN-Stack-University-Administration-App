// backend/controllers/reservationController.js
const RoomReservation = require('../models/RoomReservation');
const User = require('../models/User');
const Room = require('../models/Room');

const checkTimeOverlap = (existingStart, existingEnd, newStart, newEnd) => {
    const parseTime = (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };
    const es = parseTime(existingStart);
    const ee = parseTime(existingEnd);
    const ns = parseTime(newStart);
    const ne = parseTime(newEnd);
    return ns < ee && ne > es; // Returns true if they overlap
};

const createReservation = async (req, res) => {
    const { room, date, startTime, endTime, purpose, attendees } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) { return res.status(404).json({ msg: 'User not found' }); }

        const roomDoc = await Room.findById(room);
        if (!roomDoc) { return res.status(404).json({ msg: 'Room not found' }); }
        if (attendees && roomDoc.capacity < attendees) {
        return res.status(400).json({ msg: 'Number of attendees exceeds room capacity' });
        }

        const reservationDate = new Date(date);
        reservationDate.setHours(0, 0, 0, 0);

        const existingReservations = await RoomReservation.find({
            room: room,
            date: reservationDate,
            status: { $in: ['pending', 'approved'] }
        });

        for (const existing of existingReservations) {
            if (checkTimeOverlap(existing.startTime, existing.endTime, startTime, endTime)) {
                return res.status(400).json({ msg: `This time slot overlaps with an existing reservation from ${existing.startTime} to ${existing.endTime}.` });
            }
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
};

const getAvailableReservationSlots = async (req, res) => {
    const { date, roomId } = req.query;
    if (!date || !roomId) {
        return res.status(400).json({ msg: 'Date and Room ID parameters are required.' });
    }

    try {
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        const existingReservations = await RoomReservation.find({
            room: roomId,
            date: queryDate,
            status: { $in: ['pending', 'approved'] }
        }).select('startTime endTime');

        const allSlots = [];
        // Generate potential 1-hour slots from 8 AM to 8 PM (20:00)
        for (let h = 8; h < 20; h++) {
            const slotStart = `${h.toString().padStart(2, '0')}:00`;
            const slotEnd = `${(h + 1).toString().padStart(2, '0')}:00`;
            allSlots.push({ startTime: slotStart, endTime: slotEnd });
        }

        const availableSlots = allSlots.filter(slot => {
            return !existingReservations.some(existing => 
                checkTimeOverlap(existing.startTime, existing.endTime, slot.startTime, slot.endTime)
            );
        });

        res.json(availableSlots);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getMyReservations = async (req, res) => {
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
};

const getPaginatedReservations = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'date', order = 'desc', status } = req.query;
        const limitNum = parseInt(limit, 10);
        const pageNum = parseInt(page, 10);
        
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }

        const reservations = await RoomReservation.find(filter)
            .populate('room', 'name location')
            .sort({ [sortBy]: order })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
        
        const totalItems = await RoomReservation.countDocuments(filter);

        res.json({
            data: reservations,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalItems / limitNum),
                totalItems,
                limit: limitNum
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const updateReservationStatus = async (req, res) => {
    const { status, adminNotes } = req.body;

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
        if (adminNotes) {
            reservation.adminNotes = adminNotes;
        }
        await reservation.save();

        res.json(reservation);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getReservationStatsByStatus = async (req, res) => {
    try {
        const stats = await RoomReservation.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { _id: 0, label: '$_id', value: '$count' } }
        ]);
        res.json(stats);
    } catch (err) { res.status(500).send('Server Error'); }
};

module.exports = {
    createReservation,
    getAvailableReservationSlots,
    getMyReservations,
    getPaginatedReservations,
    updateReservationStatus,
    getReservationStatsByStatus
};