// backend/seed/seeder.js (Advanced Version)
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Room = require('../models/Room');
const Course = require('../models/Course');
const RoomReservation = require('../models/RoomReservation');
const ScheduleEntry = require('../models/ScheduleEntry');

mongoose.connect(process.env.MONGO_URI, {});

const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8'));
const rooms = JSON.parse(fs.readFileSync(path.join(__dirname, 'rooms.json'), 'utf-8'));
const courses = JSON.parse(fs.readFileSync(path.join(__dirname, 'courses.json'), 'utf-8'));

const importData = async () => {
  try {
    console.log('Destroying existing data...');
    await User.deleteMany();
    await Room.deleteMany();
    await Course.deleteMany();
    await RoomReservation.deleteMany();
    await ScheduleEntry.deleteMany();

    console.log('Importing primary data...');
    const createdUsers = await User.create(users);
    const createdRooms = await Room.create(rooms);
    const createdCourses = await Course.create(courses);

    console.log('Primary data imported.');

    // --- Programmatically build a realistic schedule ---
    console.log('Building schedule from blueprint...');

    const scheduleBlueprint = [
        // Year 3, Informatica, Semester 1
        { courseCode: 'CS301', roomName: 'Sala B201', day: 'Monday', time: ['10:00', '12:00'], type: 'Lecture', group: '' },
        { courseCode: 'CS301', roomName: 'Laborator A105', day: 'Tuesday', time: ['10:00', '12:00'], type: 'Lab', group: 'A' },
        { courseCode: 'CS301', roomName: 'Laborator A105', day: 'Tuesday', time: ['12:00', '14:00'], type: 'Lab', group: 'B' },
        { courseCode: 'CS302', roomName: 'Sala B201', day: 'Wednesday', time: ['14:00', '16:00'], type: 'Lecture', group: '' },
        { courseCode: 'CS302', roomName: 'Laborator A105', day: 'Wednesday', time: ['16:00', '18:00'], type: 'Lab', group: 'A' },
        { courseCode: 'CS303', roomName: 'Sala B201', day: 'Friday', time: ['08:00', '10:00'], type: 'Lecture', group: '' },
        
        // Year 3, Informatica, Semester 2
        { courseCode: 'CS304', roomName: 'Amfiteatru C3', day: 'Tuesday', time: ['12:00', '14:00'], type: 'Lecture', group: '' },
        { courseCode: 'CS304', roomName: 'Laborator A105', day: 'Tuesday', time: ['14:00', '17:00'], type: 'Lab', group: 'A' },
        { courseCode: 'CS304', roomName: 'Laborator A105', day: 'Tuesday', time: ['12:00', '14:00'], type: 'Lab', group: 'B' },

        // Year 3, MON, Semester 2
        { courseCode: 'SCCS', roomName: 'Laborator A105', day: 'Monday', time: ['14:00', '16:00'], type: 'Lab', group: 'A' },
        { courseCode: 'DEPI', roomName: 'Sala B201', day: 'Tuesday', time: ['16:00', '18:00'], type: 'Lecture', group: '' },
        { courseCode: 'PDS', roomName: 'Laborator A105', day: 'Thursday', time: ['10:00', '12:00'], type: 'Lab', group: 'B' },
        { courseCode: 'TV', roomName: 'Amfiteatru C3', day: 'Wednesday', time: ['09:00', '11:00'], type: 'Lecture', group: '' },
        { courseCode: 'SCCS', roomName: 'Amfiteatru C3', day: 'Wednesday', time: ['11:00', '13:00'], type: 'Lecture', group: '' },
        { courseCode: 'DEPI', roomName: 'Sala B201', day: 'Wednesday', time: ['15:00', '17:00'], type: 'Lab', group: 'A' },
        { courseCode: 'DEPI', roomName: 'Sala Senatului', day: 'Thursday', time: ['10:00', '12:00'], type: 'Seminar', group: 'B' },
        { courseCode: 'CAF', roomName: 'Laborator A105', day: 'Thursday', time: ['11:00', '13:00'], type: 'Lab', group: 'B' },
        { courseCode: 'PDS', roomName: 'Amfiteatru C3', day: 'Friday', time: ['12:00', '16:00'], type: 'Lecture', group: '' },

        // Year 2, General, Semester 2
        { courseCode: 'CEF', roomName: 'Sala B201', day: 'Monday', time: ['08:00', '10:00'], type: 'Lecture', group: '' },
        { courseCode: 'CEF', roomName: 'Laborator A105', day: 'Monday', time: ['10:00', '12:00'], type: 'Lab', group: 'A' },
        { courseCode: 'CEF', roomName: 'Laborator A105', day: 'Friday', time: ['10:00', '12:00'], type: 'Lab', group: 'B' },
        { courseCode: 'SS2', roomName: 'Sala B201', day: 'Thursday', time: ['14:00', '16:00'], type: 'Lecture', group: '' },
        { courseCode: 'SS2', roomName: 'Sala B201', day: 'Thursday', time: ['16:00', '18:00'], type: 'Seminar', group: 'A' },
    ];

    const finalScheduleEntries = scheduleBlueprint.map(entry => {
        const course = createdCourses.find(c => c.code === entry.courseCode);
        const room = createdRooms.find(r => r.name === entry.roomName);
        
        if (!course || !room) {
            console.warn(`Could not create schedule entry for ${entry.courseCode} in ${entry.roomName}. Course or Room not found.`);
            return null;
        }

        return {
            course: course._id,
            room: room._id,
            dayOfWeek: entry.day,
            startTime: entry.time[0],
            endTime: entry.time[1],
            type: entry.type,
            group: entry.group,
            academicYear: '2024-2025',
            semester: course.semester,
        };
    }).filter(entry => entry !== null); // Filter out any null entries

    await ScheduleEntry.create(finalScheduleEntries);
    console.log(`${finalScheduleEntries.length} schedule entries created.`);

    console.log('Data Import Complete!');
    process.exit();
  } catch (err) {
    console.error('Seeder script failed:', err);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    await Room.deleteMany();
    await Course.deleteMany();
    await RoomReservation.deleteMany();
    await ScheduleEntry.deleteMany();
    console.log('Data Destroyed...');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}