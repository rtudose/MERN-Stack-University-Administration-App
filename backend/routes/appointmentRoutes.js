// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const studentOnly = [auth, authorize(['student'])];
const adminOnly = [auth, authorize(['admin'])];

router.get('/available-slots', auth, appointmentController.getAvailableSlots);

router.post('/', studentOnly, appointmentController.createAppointment);

router.get('/my-appointments', studentOnly, appointmentController.getMyAppointments);


router.get('/paginated', adminOnly, appointmentController.getPaginatedAppointments);

router.put('/:id/status', adminOnly, appointmentController.updateAppointmentStatus);

router.put('/:id/cancel-by-user', studentOnly, appointmentController.cancelMyAppointment);

router.get('/stats/status', adminOnly, appointmentController.getAppointmentStatsByStatus);

router.delete('/:id', adminOnly, appointmentController.deleteAppointment);

module.exports = router;