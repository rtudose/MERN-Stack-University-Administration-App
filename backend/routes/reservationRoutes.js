// backend/routes/reservationRoutes.js (Corrected)
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const adminOnly = [auth, authorize(['admin'])];

// --- PUBLIC ROUTES ---

router.post('/', auth, reservationController.createReservation);

router.get('/my-reservations', auth, reservationController.getMyReservations);

// --- ADMIN ROUTES ---

router.get('/paginated', adminOnly, reservationController.getPaginatedReservations);

router.put('/:id/status', adminOnly, reservationController.updateReservationStatus);

router.get('/stats/status', adminOnly, reservationController.getReservationStatsByStatus);

router.get('/available-slots', auth, reservationController.getAvailableReservationSlots);

module.exports = router;