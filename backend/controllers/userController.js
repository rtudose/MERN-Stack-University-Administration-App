// backend/controllers/userController.js
const User = require('../models/User');

const getAllUsers = async (req, res) => {
    try {   
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const createUser = async (req, res) => {
    const { username, email, password, role, studentDetails } = req.body;
    try {
        const userPayload = { username, email, password, role };
        if (role === 'student' && studentDetails) {
            userPayload.studentDetails = studentDetails;
        }
        const user = new User(userPayload);
        await user.save();
        const userResponse = user.toObject();
        delete userResponse.password;
        res.status(201).json(userResponse);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json({ msg: `User with this ${field} already exists` });
        }
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            return res.status(400).json({ msg: message });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const updateUser = async (req, res) => {
    const { username, email, role, studentDetails } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) { return res.status(404).json({ msg: 'User not found' }); }

        // Prevent changing the last admin's role
        if (user.role === 'admin' && role && role !== 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ msg: 'Cannot remove the last administrator' });
            }
        }
        
        const updateFields = {};
        if (username) updateFields.username = username;
        if (email) updateFields.email = email;
        if (role) updateFields.role = role;

        // The update operation object
        const updateOperation = { $set: updateFields };

        if (role === 'student' && studentDetails) {
            updateOperation.$set.studentDetails = studentDetails;
        } else if (role && role !== 'student') {
            // If the role is changing TO something other than student, remove the studentDetails
            updateOperation.$unset = { studentDetails: 1 };
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateOperation,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json(updatedUser);
    } catch (err) {
        if (err.code === 11000) {
            const field = Object.keys(err.keyValue)[0];
            return res.status(400).json({ msg: `User with this ${field} already exists` });
        }
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors).map(val => val.message).join(', ');
            return res.status(400).json({ msg: message });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) { return res.status(404).json({ msg: 'User not found' }); }
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ msg: 'You cannot delete your own account' });
        }
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ msg: 'Cannot delete the last administrator' });
            }
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getPaginatedUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'username', order = 'asc' } = req.query;

        // Ensure limit is a number to prevent issues
        const limitNum = parseInt(limit, 10);
        const pageNum = parseInt(page, 10);
        const sortOrder = order === 'asc' ? 1 : -1;

        let aggregationPipeline = [];

        // If sorting by a student-specific field, filter for students first.
        if (sortBy.startsWith('studentDetails')) {
            aggregationPipeline.push({ $match: { role: 'student' } });
        }

        let sortStage = {};

        // If sorting by role, use a custom order.
        if (sortBy === 'role') {
            aggregationPipeline.push({
                $addFields: {
                    roleOrder: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$role', 'admin'] }, then: 1 },
                                { case: { $eq: ['$role', 'teacher'] }, then: 2 },
                                { case: { $eq: ['$role', 'external_representative'] }, then: 3 },
                                { case: { $eq: ['$role', 'student'] }, then: 4 }
                            ],
                            default: 99
                        }
                    }
                }
            });
            sortStage = { $sort: { roleOrder: sortOrder } };
        } else {
            // Otherwise, use a standard sort.
            sortStage = { $sort: { [sortBy]: sortOrder } };
        }

        aggregationPipeline.push(sortStage);
        
        // This $facet stage gets both the paginated data and the total count in one query.
        const results = await User.aggregate([
            ...aggregationPipeline,
            {
                $facet: {
                    data: [
                        { $skip: (pageNum - 1) * limitNum },
                        { $limit: limitNum },
                        { $project: { password: 0, roleOrder: 0 } } // Exclude password and temporary sort field
                    ],
                    pagination: [
                        { $count: 'totalItems' }
                    ]
                }
            }
        ]);
        
        const users = results[0].data;
        const totalItems = results[0].pagination[0]?.totalItems || 0;

        res.json({
            data: users,
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

const getStudentRegistrationStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            { $match: { role: 'student' } },
            {
                $group: {
                    _id: { $year: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } },
            { 
                $project: {
                    _id: 0,
                    year: "$_id",
                    count: "$count"
                }
            }
        ]);
        res.json(stats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getPaginatedUsers,
    getStudentRegistrationStats
};
