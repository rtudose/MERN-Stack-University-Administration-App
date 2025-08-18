// backend/controllers/scheduleController.js

const ScheduleEntry = require('../models/ScheduleEntry');
const Course = require('../models/Course');
const Room = require('../models/Room');
const User = require('../models/User');

const checkOverlap = (existingEntry, newEntry) => {
    if (existingEntry.dayOfWeek !== newEntry.dayOfWeek) { return false; }
    const parseTime = (timeStr) => { const [hours, minutes] = timeStr.split(':').map(Number); return hours * 60 + minutes; };
    const existingStart = parseTime(existingEntry.startTime);
    const existingEnd = parseTime(existingEntry.endTime);
    const newStart = parseTime(newEntry.startTime);
    const newEnd = parseTime(newEntry.endTime);
    return newStart < existingEnd && newEnd > existingStart;
  };

  const getTeacherSchedule = async (req, res) => {
    try {
        const teacher = await User.findById(req.user.id);
        if (!teacher) { return res.status(404).json({ msg: 'Teacher not found.' }); }
        
        const teacherCourses = await Course.find({
            $or: [
                { 'professors.lecture': teacher.username },
                { 'professors.seminar': teacher.username },
                { 'professors.lab': teacher.username }
            ]
        });
        const teacherCourseIds = teacherCourses.map(c => c._id);

        const schedule = await ScheduleEntry.find({ course: { $in: teacherCourseIds } })
            .populate('course', 'name code professors type')
            .populate('room', 'name');
            
        const personalSchedule = schedule.filter(entry => {
            const profs = entry.course.professors;
            const activityType = entry.type.toLowerCase();
            return profs && profs[activityType] === teacher.username;
        });

        res.json(personalSchedule);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
  };

  const getStudentSchedule = async (req, res) => {
    try {
            const student = await User.findById(req.user.id);
            if (!student || !student.studentDetails) { return res.status(400).json({ msg: 'Student details not found.' }); }
            const { yearOfStudy, specialization, group } = student.studentDetails;
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            let currentSemester;
            if (currentMonth >= 3 && currentMonth <= 9) { currentSemester = 2; } else { currentSemester = 1; }
            const studentCourses = await Course.find({ yearOfStudy: yearOfStudy, semester: currentSemester, specialization: { $in: [specialization, 'General'] } }).select('_id');
            const studentCourseIds = studentCourses.map(course => course._id);
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
  };

  const createScheduleEntry = async (req, res) => {
    try {
        const { course, room, dayOfWeek, startTime, endTime, type, group, academicYear, semester } = req.body;
        
        const newScheduleEntry = new ScheduleEntry(req.body);
        const validationError = newScheduleEntry.validateSync();
        if (validationError) { throw validationError; }
    
        const existingCourse = await Course.findById(course);
        if (!existingCourse) { return res.status(404).json({ msg: 'Course not found' }); }
        const existingRoom = await Room.findById(room);
        if (!existingRoom) { return res.status(404).json({ msg: 'Room not found' }); }
        
        const newEntryCandidate = { dayOfWeek, startTime, endTime };
        const commonQuery = { dayOfWeek, academicYear, semester };
    
        // 1. Room Overlap
        const roomEntries = await ScheduleEntry.find({ room, ...commonQuery });
        for (let entry of roomEntries) {
          if (checkOverlap(entry, newEntryCandidate)) {
            const oCourse = await Course.findById(entry.course);
            return res.status(400).json({ msg: 'ROOM_OVERLAP', details: { roomName: existingRoom.name, courseName: oCourse.name, startTime: entry.startTime, endTime: entry.endTime, dayOfWeek: entry.dayOfWeek }});
          }
        }
        
        // 2. Professor Overlap
        if (existingCourse.professors && type) {
            const professorName = existingCourse.professors[type.toLowerCase()];
            if(professorName) {
                const professorCourses = await Course.find({ 
                    $or: [ { 'professors.lecture': professorName }, { 'professors.seminar': professorName }, { 'professors.lab': professorName }] 
                }).distinct('_id');
                const professorOverlaps = await ScheduleEntry.find({ 'course': { $in: professorCourses }, ...commonQuery });
                for (let entry of professorOverlaps) {
                    if (checkOverlap(entry, newEntryCandidate)) {
                        return res.status(400).json({ msg: 'PROFESSOR_OVERLAP', details: { professorName: professorName, startTime: entry.startTime, endTime: entry.endTime, dayOfWeek: entry.dayOfWeek }});
                    }
                }
            }
        }
        
        // 3. Course Overlap
        const courseEntries = await ScheduleEntry.find({ course, ...commonQuery });
        for (let entry of courseEntries) {
            if (checkOverlap(entry, newEntryCandidate)) {
                const oRoom = await Room.findById(entry.room);
                return res.status(400).json({ msg: 'COURSE_OVERLAP', details: { courseName: existingCourse.name, roomName: oRoom.name, startTime: entry.startTime, endTime: entry.endTime, dayOfWeek: entry.dayOfWeek }});
            }
        }
        
        // 4. Student Group Overlap
        const { yearOfStudy, specialization } = existingCourse;
        const cohortCourses = await Course.find({ yearOfStudy, specialization }).select('_id');
        const cohortScheduleEntries = await ScheduleEntry.find({ course: { $in: cohortCourses }, ...commonQuery });
    
        for (let entry of cohortScheduleEntries) {
            if (checkOverlap(entry, newEntryCandidate)) {
                if (!group) {
                    const oCourse = await Course.findById(entry.course);
                    return res.status(400).json({ msg: 'STUDENT_GROUP_OVERLAP', details: { group: `Year ${yearOfStudy} ${specialization}`, courseName: oCourse.name, type: entry.type, startTime: entry.startTime, endTime: entry.endTime }});
                }
                if (group && (entry.group === group || !entry.group)) {
                    const oCourse = await Course.findById(entry.course);
                    return res.status(400).json({ msg: 'STUDENT_GROUP_OVERLAP', details: { group: `Year ${yearOfStudy} ${specialization} Group ${group}`, courseName: oCourse.name, type: entry.type, startTime: entry.startTime, endTime: entry.endTime }});
                }
            }
        }
    
        await newScheduleEntry.save();
        res.status(201).json(newScheduleEntry);
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
          const message = err.name === 'CastError' 
              ? `Invalid data for field ${err.path}. Please check your selections.`
              : Object.values(err.errors).map(val => val.message).join(', ');
          return res.status(400).json({ msg: message });
        }
        if (err.message === 'End time must be after start time.') { return res.status(400).json({ msg: err.message }); }
        if (err.code === 11000) { return res.status(400).json({ msg: 'This room is already booked at this time on this day.' }); }
        
        console.error(err);
        res.status(500).send('Server Error');
    }
  };

  const updateScheduleEntry = async (req, res) => {
    try {
        const scheduleEntry = await ScheduleEntry.findById(req.params.id);
        if (!scheduleEntry) { return res.status(404).json({ msg: 'Schedule entry not found' }); }
        
        const { course, room, dayOfWeek, startTime, endTime, type, academicYear, semester, group } = req.body;

        const finalState = {
            courseId: course || scheduleEntry.course,
            roomId: room || scheduleEntry.room,
            dayOfWeek: dayOfWeek || scheduleEntry.dayOfWeek,
            startTime: startTime || scheduleEntry.startTime,
            endTime: endTime || scheduleEntry.endTime,
            academicYear: academicYear || scheduleEntry.academicYear,
            semester: semester || scheduleEntry.semester,
            type: type || scheduleEntry.type,
            group: group !== undefined ? group : scheduleEntry.group
        };
        const newEntryCandidate = { dayOfWeek: finalState.dayOfWeek, startTime: finalState.startTime, endTime: finalState.endTime };
        const commonQuery = { dayOfWeek: finalState.dayOfWeek, academicYear: finalState.academicYear, semester: finalState.semester, _id: { $ne: req.params.id } };

        const finalCourseDoc = await Course.findById(finalState.courseId);
        if (!finalCourseDoc) return res.status(404).json({ msg: 'Course not found' });
        
        // 1. Room Overlap
        const roomOverlaps = await ScheduleEntry.find({ room: finalState.roomId, ...commonQuery });
        for (let entry of roomOverlaps) {
            if (checkOverlap(entry, newEntryCandidate)) {
                const oCourse = await Course.findById(entry.course); const oRoom = await Room.findById(entry.room);
                return res.status(400).json({ msg: 'ROOM_OVERLAP', details: { roomName: oRoom.name, courseName: oCourse.name, startTime: entry.startTime, endTime: entry.endTime, dayOfWeek: entry.dayOfWeek } });
            }
        }
        
        // 2. Professor Overlap
        if (finalCourseDoc.professors && finalState.type) {
            const professorName = finalCourseDoc.professors[finalState.type.toLowerCase()];
            if (professorName) {
                const professorCourses = await Course.find({ $or: [ { 'professors.lecture': professorName }, { 'professors.seminar': professorName }, { 'professors.lab': professorName }] }).distinct('_id');
                const professorOverlaps = await ScheduleEntry.find({ course: { $in: professorCourses }, ...commonQuery });
                for (let entry of professorOverlaps) {
                    if (checkOverlap(entry, newEntryCandidate)) {
                        return res.status(400).json({ msg: 'PROFESSOR_OVERLAP', details: { professorName, startTime: entry.startTime, endTime: entry.endTime, dayOfWeek: entry.dayOfWeek } });
                    }
                }
            }
        }

        // 3. Course Overlap
        const courseOverlaps = await ScheduleEntry.find({ course: finalState.courseId, ...commonQuery });
        for (let entry of courseOverlaps) {
            if (checkOverlap(entry, newEntryCandidate)) {
                const oRoom = await Room.findById(entry.room);
                return res.status(400).json({ msg: 'COURSE_OVERLAP', details: { courseName: finalCourseDoc.name, roomName: oRoom.name, startTime: entry.startTime, endTime: entry.endTime, dayOfWeek: entry.dayOfWeek } });
            }
        }
        
        // 4. Student Group Overlap
        const { yearOfStudy, specialization } = finalCourseDoc;
        const cohortCourses = await Course.find({ yearOfStudy, specialization }).select('_id');
        const cohortScheduleEntries = await ScheduleEntry.find({ course: { $in: cohortCourses }, ...commonQuery });

        for (let entry of cohortScheduleEntries) {
            if (checkOverlap(entry, newEntryCandidate)) {
                if (!group) {
                    const oCourse = await Course.findById(entry.course);
                    return res.status(400).json({ msg: 'STUDENT_GROUP_OVERLAP', details: { group: `Year ${yearOfStudy} ${specialization}`, courseName: oCourse.name, type: entry.type, startTime: entry.startTime, endTime: entry.endTime }});
                }
                if (group && (entry.group === group || !entry.group)) {
                    const oCourse = await Course.findById(entry.course);
                    return res.status(400).json({ msg: 'STUDENT_GROUP_OVERLAP', details: { group: `Year ${yearOfStudy} ${specialization} Group ${group}`, courseName: oCourse.name, type: entry.type, startTime: entry.startTime, endTime: entry.endTime }});
                }
            }
        }

        scheduleEntry.set(req.body);
        await scheduleEntry.save();
        res.json(scheduleEntry);

    } catch (err) {
        if (err.name === 'Error' && err.message.includes('End time must be after start time')) { return res.status(400).json({ msg: err.message }); }
        console.error(err);
        res.status(500).send('Server Error');
    }
  };

  const getScheduleEntryById = async (req, res) => {
    try {
        const scheduleEntry = await ScheduleEntry.findById(req.params.id)
          .populate('course', ['name', 'code', 'professors', 'yearOfStudy', 'semester', 'specialization'])
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
  };

  const getPaginatedSchedule = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'dayOfWeek', order = 'asc', ...filters } = req.query;
        const limitNum = parseInt(limit, 10);
        const pageNum = parseInt(page, 10);
        const sortOrder = order === 'asc' ? 1 : -1;

        const filterQuery = {};
        if (filters.academicYear) filterQuery.academicYear = filters.academicYear;
        if (filters.semester) filterQuery.semester = parseInt(filters.semester, 10);
        if (filters.dayOfWeek) filterQuery.dayOfWeek = filters.dayOfWeek;
        if (filters.group) filterQuery.group = filters.group;

        let pipeline = [
            { $match: filterQuery },
            { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'course' } },
            { $lookup: { from: 'rooms', localField: 'room', foreignField: '_id', as: 'room' } },
            { $unwind: { path: '$course', preserveNullAndEmptyArrays: true } },
            { $unwind: { path: '$room', preserveNullAndEmptyArrays: true } },
        ];
        
        let sortStage = {};

        switch (sortBy) {
            case 'dayOfWeek':
                pipeline.push({
                    $addFields: {
                        dayOrder: { $switch: { branches: [
                            { case: { $eq: ['$dayOfWeek', 'Monday'] }, then: 1 }, { case: { $eq: ['$dayOfWeek', 'Tuesday'] }, then: 2 },
                            { case: { $eq: ['$dayOfWeek', 'Wednesday'] }, then: 3 }, { case: { $eq: ['$dayOfWeek', 'Thursday'] }, then: 4 },
                            { case: { $eq: ['$dayOfWeek', 'Friday'] }, then: 5 },
                        ], default: 99 } }
                    }
                });
                sortStage = { $sort: { dayOrder: sortOrder, startTime: 1 } };
                break;
            case 'type':
                pipeline.push({
                    $addFields: {
                        typeOrder: { $switch: { branches: [
                            { case: { $eq: ['$type', 'Lecture'] }, then: 1 }, { case: { $eq: ['$type', 'Seminar'] }, then: 2 },
                            { case: { $eq: ['$type', 'Lab'] }, then: 3 }, { case: { $eq: ['$type', 'Practice'] }, then: 4 },
                        ], default: 99 } }
                    }
                });
                sortStage = { $sort: { typeOrder: sortOrder, startTime: 1 } };
                break;
            case 'startTime':
                sortStage = { $sort: { startTime: sortOrder } };
                break;
                
            default:
                sortStage = { $sort: { [sortBy]: sortOrder, startTime: 1 } };
        }

        pipeline.push(sortStage);

        const results = await ScheduleEntry.aggregate([
            ...pipeline,
            {
                $facet: {
                    data: [
                        { $skip: (pageNum - 1) * limitNum },
                        { $limit: limitNum },
                        { $project: { dayOrder: 0, typeOrder: 0 } } // Clean up temporary fields
                    ],
                    pagination: [{ $count: 'totalItems' }]
                }
            }
        ]);

        const scheduleEntries = results[0].data;
        const totalItems = results[0].pagination[0]?.totalItems || 0;

        res.json({
            data: scheduleEntries,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalItems / limitNum),
                totalItems,
                limit: limitNum
            }
        });
    } catch (err) {
        console.error("Aggregation Error in getPaginatedSchedule:", err);
        res.status(500).send('Server Error');
    }
};

const getProfessorWorkloadStats = async (req, res) => {
    try {
        const stats = await ScheduleEntry.aggregate([
            { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'course' } },
            { $unwind: '$course' },

            {
                $addFields: {
                    durationHours: {
                        $divide: [
                            { 
                                $subtract: [
                                    { $dateFromString: { dateString: { $concat: ["2025-01-01T", "$endTime", ":00Z"] } } },
                                    { $dateFromString: { dateString: { $concat: ["2025-01-01T", "$startTime", ":00Z"] } } }
                                ] 
                            },
                            3600000
                        ]
                    }
                }
            },
            
            {
                $addFields: {
                    professorName: {
                        $switch: {
                            branches: [
                                { case: { $eq: ['$type', 'Lecture'] }, then: '$course.professors.lecture' },
                                { case: { $eq: ['$type', 'Seminar'] }, then: '$course.professors.seminar' },
                                { case: { $eq: ['$type', 'Lab'] }, then: '$course.professors.lab' },
                            ],
                            default: null
                        }
                    }
                }
            },
            
            { $match: { professorName: { $ne: null } } },

            {
                $group: {
                    _id: '$professorName',
                    totalHours: { $sum: '$durationHours' }
                }
            },

            { $sort: { totalHours: -1 } },

            { $limit: 10 },

            {
                $project: {
                    _id: 0,
                    professor: '$_id',
                    hours: '$totalHours'
                }
            }
        ]);
        res.json(stats);
    } catch (err) {
        console.error("Error fetching professor workload stats:", err);
        res.status(500).send('Server Error');
    }
};

const deleteScheduleEntry = async (req, res) => {
    try {
        const scheduleEntry = await ScheduleEntry.findByIdAndDelete(req.params.id);
        if (!scheduleEntry) { return res.status(404).json({ msg: 'Schedule entry not found' }); }
        res.json({ msg: 'Course removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    getPaginatedSchedule,
    getTeacherSchedule,
    getStudentSchedule,
    createScheduleEntry,
    updateScheduleEntry,
    getScheduleEntryById,
    getProfessorWorkloadStats,
    deleteScheduleEntry
};