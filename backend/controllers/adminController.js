// backend/controllers/adminController.js
const User = require('../models/User');
const Room = require('../models/Room');
const RoomReservation = require('../models/RoomReservation');
const Appointment = require('../models/Appointment');

const getDashboardStats = async (req, res) => {
    try {
        const [userCount, roomCount, pendingReservations, pendingAppointments] = await Promise.all([
            User.countDocuments(),
            Room.countDocuments(),
            RoomReservation.countDocuments({ status: 'pending' }),
            Appointment.countDocuments({ status: 'pending' })
        ]);

        res.json({
            userCount,
            roomCount,
            pendingReservations,
            pendingAppointments
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getDashboardStats };