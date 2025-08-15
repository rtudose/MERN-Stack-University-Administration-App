// backend/controllers/roomController.js
const Room = require('../models/Room');

const createRoom = async (req, res) => {
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
};

const getPaginatedRooms = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'name', order = 'asc' } = req.query;
        const limitNum = parseInt(limit, 10);
        const pageNum = parseInt(page, 10);
        const sortOrder = order === 'asc' ? 1 : -1;

        const rooms = await Room.find()
            .sort({ [sortBy]: sortOrder })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
        
        const totalItems = await Room.countDocuments();

        res.json({
            data: rooms,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalItems / limitNum),
                totalItems,
                limit: limitNum
            }
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

const updateRoom = async (req, res) => {
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
}

const deleteRoom = async (req, res) => {
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
};

const getRoomStatsByStatus = async (req, res) => {
    try {
        const stats = await Room.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { _id: 0, label: '$_id', value: '$count' } }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

module.exports = { 
    createRoom,
    getPaginatedRooms,
    updateRoom,
    deleteRoom,
    getRoomStatsByStatus
};