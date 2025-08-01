// routes/scheduleRoutes.js
const express = require('express');
const router = express.Router();
const ScheduleEntry = require('../models/ScheduleEntry');
const Course = require('../models/Course');
const Room = require('../models/Room');
const User = require('../models/User');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

const studentOnly = [auth, authorize(['student'])]; // Middleware for students

// Helper function to check for overlaps (can be extracted to a utility file)
const checkOverlap = (existingEntry, newEntry) => {
  // Check for same day
  if (existingEntry.dayOfWeek !== newEntry.dayOfWeek) {
    return false;
  }

  // Convert times to comparable format (e.g., minutes from midnight)
  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const existingStart = parseTime(existingEntry.startTime);
  const existingEnd = parseTime(existingEntry.endTime);
  const newStart = parseTime(newEntry.startTime);
  const newEnd = parseTime(newEntry.endTime);

  // Check for overlap conditions:
  // (newStart < existingEnd AND newEnd > existingStart)
  // This covers all forms of overlap (new starts within old, old starts within new, new encompasses old, old encompasses new)
  return newStart < existingEnd && newEnd > existingStart;
};

// --- STUDENT-SPECIFIC ROUTE ---

// @route   GET /api/schedule/my-schedule
// @desc    Get the personal weekly schedule for the logged-in student
// @access  Student
router.get('/my-schedule', studentOnly, async (req, res) => {
    try {
        const student = await User.findById(req.user.id);
        if (!student || !student.studentDetails) {
            return res.status(400).json({ msg: 'Student details not found.' });
        }

        const { yearOfStudy, specialization, group } = student.studentDetails;

        // 1. Find all courses relevant to the student
        const studentCourses = await Course.find({
            yearOfStudy: yearOfStudy,
            specialization: { $in: [specialization, 'General'] }
        }).select('_id');

        const studentCourseIds = studentCourses.map(course => course._id);

        // 2. Find all schedule entries for those courses that match the student's group or are general lectures
        const schedule = await ScheduleEntry.find({
            course: { $in: studentCourseIds },
            group: { $in: [group, null, ''] }
        })
        .populate('course', 'name code professor type')
        .populate('room', 'name location');

        res.json(schedule);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- ADMIN AND PUBLIC ROUTES ---

// @route   POST /api/schedule
// @desc    Create a new schedule entry with overlap detection
// @access  Private (Admin only)
router.post('/', auth, authorize(['admin']), async (req, res) => {
  const { course, room, dayOfWeek, startTime, endTime, type, group, academicYear, semester } = req.body;

  try {
    // 1. Validate Course and Room exist and are valid ObjectIds
    const existingCourse = await Course.findById(course);
    if (!existingCourse) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    const existingRoom = await Room.findById(room);
    if (!existingRoom) {
      return res.status(404).json({ msg: 'Room not found' });
    }

    // 2. Overlap Detection Logic
    // Find existing schedule entries for the same room on the same day
    const existingEntries = await ScheduleEntry.find({
      room,
      dayOfWeek,
      academicYear, // Consider academic year and semester for schedules
      semester
    });

    const newEntryCandidate = { dayOfWeek, startTime, endTime }; // Object to pass to overlap checker

    for (let entry of existingEntries) {
      if (checkOverlap(entry, newEntryCandidate)) {
        // Found an overlap!
        const overlappingCourse = await Course.findById(entry.course); // Get course details for clearer error
        return res.status(400).json({
          msg: `Overlap detected! Room ${existingRoom.name} is already booked for '${overlappingCourse ? overlappingCourse.name : 'Unknown Course'}' from ${entry.startTime} to ${entry.endTime} on ${entry.dayOfWeek}.`
        });
      }
    }

    // Also check if the professor is double booked (optional, but good for a "smart" algorithm)
    // This requires knowing the professor's ID or name consistently across courses.
    // For now, we only check room overlaps.
    const professorOverlaps = await ScheduleEntry.find({
        professor: existingCourse.professor, // Assuming professor name is stored consistently
        dayOfWeek,
        academicYear,
        semester
    });

    for (let entry of professorOverlaps) {
        if (checkOverlap(entry, newEntryCandidate)) {
            // To avoid self-overlap when updating
            if (entry.id.toString() === req.params.id) continue;
            return res.status(400).json({
                msg: `Professor ${existingCourse.professor} is already booked for another class from ${entry.startTime} to ${entry.endTime} on ${entry.dayOfWeek}.`
            });
        }
    }


    // 3. If no overlaps, create and save the new schedule entry
    const newScheduleEntry = new ScheduleEntry({
      course,
      room,
      dayOfWeek,
      startTime,
      endTime,
      type,
      group,
      academicYear,
      semester
    });

    await newScheduleEntry.save();
    res.status(201).json(newScheduleEntry);

  } catch (err) {
    console.error(err.message);
    // Handle validation errors (e.g., endTime before startTime from schema pre-save hook)
    if (err.name === 'Error' && err.message.includes('End time must be after start time')) {
        return res.status(400).json({ msg: err.message });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/schedule
// @desc    Get all schedule entries (or filter by academicYear/semester/day)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { academicYear, semester, dayOfWeek, group } = req.query;
    let filter = {};

    if (academicYear) filter.academicYear = academicYear;
    if (semester) filter.semester = semester;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;
    if (group) filter.group = group;

    // Use .populate() to get full Course and Room details
    const scheduleEntries = await ScheduleEntry.find(filter)
      .populate('course', ['name', 'code', 'professor']) // Only get name, code, professor from Course
      .populate('room', ['name', 'capacity', 'location']) // Only get name, capacity, location from Room
      .sort({ dayOfWeek: 1, startTime: 1 }); // Sort for better readability

    res.json(scheduleEntries);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/schedule/:id
// @desc    Get a single schedule entry by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const scheduleEntry = await ScheduleEntry.findById(req.params.id)
      .populate('course', ['name', 'code', 'professor'])
      .populate('room', ['name', 'capacity', 'location']);

    if (!scheduleEntry) {
      return res.status(404).json({ msg: 'Schedule entry not found' });
    }
    res.json(scheduleEntry);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Schedule Entry ID' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/schedule/:id
// @desc    Update a schedule entry (with overlap detection)
// @access  Private (Admin only)
router.put('/:id', auth, authorize(['admin']), async (req, res) => {
    const { course, room, dayOfWeek, startTime, endTime, type, group, academicYear, semester } = req.body;

    try {
        let scheduleEntry = await ScheduleEntry.findById(req.params.id);
        if (!scheduleEntry) {
            return res.status(404).json({ msg: 'Schedule entry not found' });
        }

        // Validate Course and Room if they are being updated
        let updatedCourse = course ? await Course.findById(course) : null;
        if (course && !updatedCourse) return res.status(404).json({ msg: 'Course not found' });

        let updatedRoom = room ? await Room.findById(room) : null;
        if (room && !updatedRoom) return res.status(404).json({ msg: 'Room not found' });

        // Prepare potential new values for overlap check
        const currentRoomId = room || scheduleEntry.room; // Use new room if provided, else old
        const currentDayOfWeek = dayOfWeek || scheduleEntry.dayOfWeek;
        const currentStartTime = startTime || scheduleEntry.startTime;
        const currentEndTime = endTime || scheduleEntry.endTime;
        const currentAcademicYear = academicYear || scheduleEntry.academicYear;
        const currentSemester = semester || scheduleEntry.semester;
        const currentProfessor = updatedCourse ? updatedCourse.professor : (await Course.findById(scheduleEntry.course)).professor; // Get prof from new/old course

        // Overlap Detection Logic (similar to POST, but exclude self)
        const existingEntries = await ScheduleEntry.find({
            room: currentRoomId,
            dayOfWeek: currentDayOfWeek,
            academicYear: currentAcademicYear,
            semester: currentSemester,
            _id: { $ne: req.params.id } // Exclude the current entry being updated
        });

        const newEntryCandidate = {
            dayOfWeek: currentDayOfWeek,
            startTime: currentStartTime,
            endTime: currentEndTime
        };

        for (let entry of existingEntries) {
            if (checkOverlap(entry, newEntryCandidate)) {
                const overlappingCourse = await Course.findById(entry.course);
                const overlappingRoom = await Room.findById(entry.room);
                return res.status(400).json({
                    msg: `Overlap detected! Room ${overlappingRoom ? overlappingRoom.name : 'Unknown Room'} is already booked for '${overlappingCourse ? overlappingCourse.name : 'Unknown Course'}' from ${entry.startTime} to ${entry.endTime} on ${entry.dayOfWeek}.`
                });
            }
        }

        // Check for professor overlaps (excluding self)
        const professorOverlaps = await ScheduleEntry.find({
            'course': { $in: await Course.find({ professor: currentProfessor }).distinct('_id') }, // Find all courses by this professor
            dayOfWeek: currentDayOfWeek,
            academicYear: currentAcademicYear,
            semester: currentSemester,
            _id: { $ne: req.params.id } // Exclude the current entry
        });

        for (let entry of professorOverlaps) {
            if (checkOverlap(entry, newEntryCandidate)) {
                return res.status(400).json({
                    msg: `Professor ${currentProfessor} is already booked for another class from ${entry.startTime} to ${entry.endTime} on ${entry.dayOfWeek}.`
                });
            }
        }


        // Update the schedule entry fields
        scheduleEntry.course = course || scheduleEntry.course;
        scheduleEntry.room = room || scheduleEntry.room;
        scheduleEntry.dayOfWeek = dayOfWeek || scheduleEntry.dayOfWeek;
        scheduleEntry.startTime = startTime || scheduleEntry.startTime;
        scheduleEntry.endTime = endTime || scheduleEntry.endTime;
        scheduleEntry.type = type || scheduleEntry.type;
        scheduleEntry.group = group || scheduleEntry.group;
        scheduleEntry.academicYear = academicYear || scheduleEntry.academicYear;
        scheduleEntry.semester = semester || scheduleEntry.semester;

        await scheduleEntry.save(); // save() will trigger the pre-save hook for time validation
        res.json(scheduleEntry);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Schedule Entry ID' });
        }
        if (err.name === 'Error' && err.message.includes('End time must be after start time')) {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
});


// @route   DELETE /api/schedule/:id
// @desc    Delete a schedule entry by ID
// @access  Private (Admin only)
router.delete('/:id', auth, authorize(['admin']), async (req, res) => {
  try {
    const scheduleEntry = await ScheduleEntry.findByIdAndDelete(req.params.id);
    if (!scheduleEntry) {
      return res.status(404).json({ msg: 'Schedule entry not found' });
    }
    res.json({ msg: 'Schedule entry removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Schedule Entry ID' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;