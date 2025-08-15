// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const adminOnly = [auth, authorize(['admin'])];


router.get('/', adminOnly, userController.getAllUsers);

router.get('/paginated', adminOnly, userController.getPaginatedUsers);

router.get('/stats/student-registrations', adminOnly, userController.getStudentRegistrationStats);

router.post('/', adminOnly, userController.createUser);

router.put('/:id', adminOnly, userController.updateUser);

router.delete('/:id', adminOnly, userController.deleteUser);

module.exports = router;