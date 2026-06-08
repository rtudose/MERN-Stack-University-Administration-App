// backend/controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { parseTime, checkTimeOverlap } = require('../utils/timeUtils');


const getAvailableSlots = async (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ msg: 'Date parameter is required.' });
    }

    try {
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        const appointmentsForDay = await Appointment.find({
            date: queryDate,
            status: { $in: ['pending', 'confirmed'] }
        }).select('startTime endTime');

        const allSlots = [];
        const startMinutes = parseTime(process.env.SECRETARITAT_START_HOUR || "09:00");
        const endMinutes = parseTime(process.env.SECRETARITAT_END_HOUR || "17:00");

        for (let current = startMinutes; current < endMinutes; current += 15) {
            const h = Math.floor(current / 60);
            const m = current % 60;
            const slotStart = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

            const next = current + 15;
            const nextH = Math.floor(next / 60);
            const nextM = next % 60;
            const slotEnd = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;

            allSlots.push({ startTime: slotStart, endTime: slotEnd });
        }

        const availableSlots = allSlots.filter(slot => {
            for (let existingAppt of appointmentsForDay) {
                if (checkTimeOverlap(existingAppt.startTime, existingAppt.endTime, slot.startTime, slot.endTime)) {
                    return false;
                }
            }
            return true;
        });

        res.json(availableSlots);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const createAppointment = async (req, res) => {
    const { date, startTime, endTime, typeOfRequest, description } = req.body;
    const studentId = req.user.id;

    try {
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found.' });
        }
        if (student.role !== 'student' && student.role !== 'admin') {
            return res.status(403).json({ msg: 'Only students or admins can book appointments.' });
        }
        const appointmentDate = new Date(date);
        appointmentDate.setHours(0, 0, 0, 0);

        const officeStart = parseTime(process.env.SECRETARITAT_START_HOUR || "09:00");
        const officeEnd = parseTime(process.env.SECRETARITAT_END_HOUR || "17:00");

        const requestedStart = parseTime(startTime);
        const requestedEnd = parseTime(endTime);

        if (requestedStart < officeStart || requestedEnd > officeEnd) {
        return res.status(400).json({
            msg: `Appointment times must be between ${process.env.SECRETARITAT_START_HOUR || "09:00"} and ${process.env.SECRETARITAT_END_HOUR || "17:00"}.`
        });
        }

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

        const newAppointment = new Appointment({
        student: studentId,
        date: appointmentDate,
        startTime,
        endTime,
        typeOfRequest,
        description,
        status: 'pending'
        });

        await newAppointment.save();

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
};

const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
                                                .populate('student', ['username', 'email']);
        if (!appointment) {
          return res.status(404).json({ msg: 'Appointment not found' });
        }
    
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
};

const updateAppointmentStatus = async (req, res) => {
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
    appointment.isReadByUser = false;
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
};

const deleteAppointment = async (req, res) => {
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
};

const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({ student: req.user.id })
            .populate('student', ['username', 'email'])
            .sort({ date: 1, startTime: 1 });
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getPaginatedAppointments = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'status', order = 'asc' } = req.query;
        const limitNum = parseInt(limit, 10);
        const pageNum = parseInt(page, 10);
        const sortOrder = order === 'asc' ? 1 : -1;

        const pipeline = [
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: { path: '$student', preserveNullAndEmptyArrays: true } },
        ];

        let sortStage = {};

        switch (sortBy) {
            case 'status':
                pipeline.push({
                    $addFields: {
                        statusOrder: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ['$status', 'pending'] }, then: 1 },
                                    { case: { $eq: ['$status', 'confirmed'] }, then: 2 },
                                    { case: { $eq: ['$status', 'completed'] }, then: 3 },
                                    { case: { $eq: ['$status', 'cancelled'] }, then: 4 },
                                    { case: { $eq: ['$status', 'expired'] }, then: 5 },
                                ],
                                default: 99
                            }
                        }
                    }
                });
                sortStage = { $sort: { statusOrder: sortOrder, date: 1, startTime: 1 } };
                break;

            case 'startTime':
                sortStage = { $sort: { startTime: sortOrder, date: 1 } };
                break;

            default:
                sortStage = { $sort: { [sortBy]: sortOrder, startTime: 1 } };
        }

        pipeline.push(sortStage);
        
        const results = await Appointment.aggregate([
            ...pipeline,
            {
                $facet: {
                    data: [
                        { $skip: (pageNum - 1) * limitNum },
                        { $limit: limitNum },
                        { $project: { statusOrder: 0 } }
                    ],
                    pagination: [{ $count: 'totalItems' }]
                }
            }
        ]);

        const appointments = results[0].data;
        const totalItems = results[0].pagination[0]?.totalItems || 0;

        res.json({
            data: appointments,
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

const getAppointmentStatsByStatus = async (req, res) => {
    try {
        const stats = await Appointment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { _id: 0, label: '$_id', value: '$count' } }
        ]);
        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const cancelMyAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findOne({ _id: req.params.id, student: req.user.id });
        if (!appointment) {
            return res.status(404).json({ msg: 'Appointment not found or you do not have permission to cancel it.' });
        }
        if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
            return res.status(400).json({ msg: 'Only pending or confirmed appointments can be cancelled.' });
        }
        appointment.status = 'cancelled';
        await appointment.save();
        res.json(appointment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const markMyAppointmentsAsRead = async (req, res) => {
    try {
        await Appointment.updateMany(
            { student: req.user.id, isReadByUser: false },
            { $set: { isReadByUser: true } }
        );
        res.json({ msg: 'Appointments marked as read.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    createAppointment,
    getAvailableSlots,
    getAppointmentById,
    updateAppointmentStatus,
    deleteAppointment,
    getMyAppointments,
    getPaginatedAppointments,
    getAppointmentStatsByStatus,
    cancelMyAppointment,
    markMyAppointmentsAsRead
};