// backend/seed/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env vars from the root .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Load models
const User = require('../models/User');
const Room = require('../models/Room');
const Course = require('../models/Course');
const RoomReservation = require('../models/RoomReservation');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {});

// Read JSON files
const users = JSON.parse(fs.readFileSync(path.join(__dirname, 'users.json'), 'utf-8'));
const rooms = JSON.parse(fs.readFileSync(path.join(__dirname, 'rooms.json'), 'utf-8'));
const courses = JSON.parse(fs.readFileSync(path.join(__dirname, 'courses.json'), 'utf-8'));

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Room.deleteMany();
    await Course.deleteMany();
    await RoomReservation.deleteMany();

    // Insert primary data
    const createdUsers = await User.create(users);
    const createdRooms = await Room.create(rooms);
    await Course.create(courses);

    console.log('Users, Rooms, and Courses Imported...');

    // --- Create sample dependent data programmatically ---
    const externalRep = createdUsers.find(u => u.role === 'external_representative');
    const availableRoom = createdRooms.find(r => r.name === 'Sala B201');

    if (externalRep && availableRoom) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const sampleReservation = {
        room: availableRoom._id,
        reservedBy: externalRep.username,
        contactEmail: externalRep.email,
        date: tomorrow,
        startTime: '10:00',
        endTime: '12:00',
        purpose: 'Client Meeting',
        attendees: 5,
        status: 'pending'
      };
      await RoomReservation.create(sampleReservation);
      console.log('Sample Reservation Imported...');
    }

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