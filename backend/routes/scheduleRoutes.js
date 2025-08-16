// backend/routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const scheduleController = require ('../controllers/scheduleController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const studentOnly = [auth, authorize(['student'])];
const teacherOnly = [auth, authorize(['teacher'])];
const adminOnly = [auth, authorize(['admin'])];

router.get('/my-teacher-schedule', teacherOnly, scheduleController.getTeacherSchedule);

router.get('/my-schedule', studentOnly, scheduleController.getStudentSchedule);

router.get('/paginated', adminOnly, scheduleController.getPaginatedSchedule);

router.post('/', adminOnly, scheduleController.createScheduleEntry);

router.get('/:id', auth, scheduleController.getScheduleEntryById);

router.put('/:id', adminOnly, scheduleController.updateScheduleEntry);

router.delete('/:id', adminOnly, scheduleController.deleteScheduleEntry);

module.exports = router;