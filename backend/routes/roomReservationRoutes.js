// routes/roomReservationRoutes.js
const express = require('express');
const router = express.Router();
const roomReservationController = require('../controllers/roomReservationController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const adminOnly = [auth, authorize(['admin'])];

router.post('/', auth, roomReservationController.createRoomReservation);

router.get('/', adminOnly, roomReservationController.getRoomReservations);
router.get('/:id', adminOnly, roomReservationController.getRoomReservationById);

router.put('/:id/status', adminOnly, roomReservationController.updateRoomReservationStatus);

router.delete('/:id', adminOnly, roomReservationController.deleteRoomReservation);

module.exports = router;