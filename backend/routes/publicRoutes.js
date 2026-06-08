// backend/routes/publicRoutes.js - MAKE CUSTOM CONTROLLER FILE!!
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const publicController = require('../controllers/publicController');

router.get('/rooms', auth, publicController.getAvailableRooms);

module.exports = router;