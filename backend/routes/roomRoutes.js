// routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const adminOnly = [auth, authorize(['admin'])];


router.post('/', adminOnly, roomController.createRoom);

router.get('/paginated', adminOnly, roomController.getPaginatedRooms);

router.get('/stats/stats', adminOnly, roomController.getRoomStatsByStatus);

router.put('/:id', adminOnly, roomController.updateRoom);

router.delete('/:id', adminOnly, roomController.deleteRoom);

router.get('/search', auth, roomController.searchRooms);

module.exports = router;