// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const adminOnly = [auth, authorize(['admin'])];


router.post('/', adminOnly, courseController.createCourse);

router.get('/paginated', adminOnly, courseController.getPaginatedCourses);

router.put('/:id', adminOnly, courseController.updateCourse);

router.delete('/:id', adminOnly, courseController.deleteCourse);

router.get('/stats/by-year', adminOnly, courseController.getCourseStatsByYear);

router.get('/search', auth, courseController.searchCourses);

module.exports = router;