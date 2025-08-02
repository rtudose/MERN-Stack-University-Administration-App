// backend/seed/seeder.js
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
    await User.deleteMany();
    await Room.deleteMany();
    await Course.deleteMany();
    await RoomReservation.deleteMany();
    await ScheduleEntry.deleteMany();

    const createdUsers = await User.create(users);
    const createdRooms = await Room.create(rooms);
    const createdCourses = await Course.create(courses);

    console.log('Users, Rooms, and Courses Imported...');

    // --- Create sample reservation ---
    const externalRep = createdUsers.find(u => u.role === 'external_representative');
    const availableRoomForBooking = createdRooms.find(r => r.name === 'Sala B201');
    if (externalRep && availableRoomForBooking) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const sampleReservation = {
        room: availableRoomForBooking._id, reservedBy: externalRep.username, contactEmail: externalRep.email,
        date: tomorrow, startTime: '10:00', endTime: '12:00',
        purpose: 'Client Meeting', attendees: 5, status: 'pending'
      };
      await RoomReservation.create(sampleReservation);
      console.log('Sample Reservation Imported...');
    }

    // --- Create Full Sample Schedule for Current Semester (Semester 2) ---
    console.log('Creating full sample schedule...');
    // Get a semester 2 course
    const courseAI = createdCourses.find(c => c.code === 'CS304');
    
    const roomB201 = createdRooms.find(r => r.name === 'Sala B201');
    const roomA105 = createdRooms.find(r => r.name === 'Laborator A105');

    const scheduleEntries = [
      // Monday
      { course: courseAI._id, room: roomB201._id, dayOfWeek: 'Monday', startTime: '10:00', endTime: '12:00', type: 'Lecture', group: '', academicYear: '2024-2025', semester: 2 },
      
      // Tuesday
      { course: courseAI._id, room: roomA105._id, dayOfWeek: 'Tuesday', startTime: '14:00', endTime: '16:00', type: 'Lab', group: 'A', academicYear: '2024-2025', semester: 2 },
      
      // Wednesday
      { course: courseAI._id, room: roomB201._id, dayOfWeek: 'Wednesday', startTime: '11:00', endTime: '13:00', type: 'Seminar', group: 'A', academicYear: '2024-2025', semester: 2 },
    ];

    await ScheduleEntry.create(scheduleEntries);
    console.log('Full Sample Schedule Imported...');
    
    console.log('Data Import Complete!');
    process.exit();
  } catch (err) {
    console.error(err);
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