// backend/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const adminOnly = [auth, authorize(['admin'])];


router.post('/', auth, reservationController.createReservation);

router.get('/my-reservations', auth, reservationController.getMyReservations);


router.get('/paginated', adminOnly, reservationController.getPaginatedReservations);

router.put('/:id/status', adminOnly, reservationController.updateReservationStatus);

router.get('/stats/status', adminOnly, reservationController.getReservationStatsByStatus);

router.get('/available-slots', auth, reservationController.getAvailableReservationSlots);

module.exports = router;