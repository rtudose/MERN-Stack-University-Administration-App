// backend/seed/seeder.js
const axios = require('axios');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Room = require('../models/Room');
const Course = require('../models/Course');
const RoomReservation = require('../models/RoomReservation');
const ScheduleEntry = require('../models/ScheduleEntry');
const Appointment = require('../models/Appointment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/faculty-admin');
    console.log('MongoDB Connected for seeding...');
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};

const SPECIALIZATIONS = ['ELA', 'MON', 'TST', 'CTI'];
const GROUPS = ['A', 'B', 'C', 'D'];
const NUM_STUDENTS_PER_YEAR = 40;
const NUM_TEACHERS = 30;
const NUM_EXTERNAL_REPS = 10;

const getSpecializationForYear = (year) => {
  if (year <= 2) return 'General';
  return faker.helpers.arrayElement(SPECIALIZATIONS);
};

const generateData = async () => {
  try {
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Room.deleteMany();
    await Course.deleteMany();
    await RoomReservation.deleteMany();
    await ScheduleEntry.deleteMany();
    await Appointment.deleteMany();

    const admin = await User.create({
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'password123',
      role: 'admin',
      createdAt: faker.date.past({ years: 10 })
    });
    console.log('Admin created');

    const adminToken = jwt.sign(
      { 
        user: { 
          id: admin._id,
          role: 'admin'
        } 
      }, 
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    let roomsData = [];
    const roomsFilePath = path.join(__dirname, 'rooms.json');
    if (fs.existsSync(roomsFilePath)) {
      roomsData = JSON.parse(fs.readFileSync(roomsFilePath, 'utf-8'));
    } else {
      roomsData = [
        { name: 'Amfiteatru AN010', capacity: 150, type: 'Amphitheater', equipment: ['Projector', 'Whiteboard'] },
        { name: 'Sala B201', capacity: 40, type: 'Classroom', equipment: ['Projector'] },
        { name: 'Laborator A105', capacity: 20, type: 'Laboratory', equipment: ['Video_Conferencing', 'Conference_Phone'] },
      ];
    }
    const createdRooms = await Room.create(roomsData);
    console.log(`${createdRooms.length} rooms created`);

    const teachers = [];
    for (let i = 0; i < NUM_TEACHERS; i++) {
      const gender = faker.person.sexType();
      const firstName = faker.person.firstName(gender);
      const lastName = faker.person.lastName();
      const prefix = faker.helpers.arrayElement(['Prof.', 'Dr.', 'Asist.']);

      teachers.push({
        username: `${prefix} ${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }).toLowerCase(),
        password: 'password123',
        role: 'teacher',
        createdAt: faker.date.past({ years: 10 })
      });
    }
    const createdTeachers = await User.create(teachers);
    console.log(`${createdTeachers.length} teachers created`);

    const externalReps = [];
    for (let i = 0; i < NUM_EXTERNAL_REPS; i++) {
      externalReps.push({
        username: faker.internet.username(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        role: 'external_representative',
        createdAt: faker.date.past({ years: 10 })
      });
    }
    await User.create(externalReps);
    console.log(`${NUM_EXTERNAL_REPS} external representatives created`);

    const originalCourses = JSON.parse(fs.readFileSync(path.join(__dirname, 'courses.json'), 'utf-8'));

    const courseData = originalCourses.map(course => {
      let spec = course.specialization;
      if (course.yearOfStudy <= 2) spec = 'General';
      else if (spec === 'Informatica') spec = 'CTI';
      const assignedTeachers = faker.helpers.arrayElements(createdTeachers, 3);

      return {
        ...course,
        specialization: spec,
        professors: {
          lecture: assignedTeachers[0].username,
          seminar: course.professors.seminar ? assignedTeachers[1].username : undefined,
          lab: course.professors.lab ? assignedTeachers[2].username : undefined
        }
      };
    });
    const createdCourses = await Course.create(courseData);
    console.log(`${createdCourses.length} courses created with anonymized professors`);

    const students = [];
    for (let year = 1; year <= 4; year++) {
      for (let i = 0; i < NUM_STUDENTS_PER_YEAR; i++) {
        const gender = faker.person.sexType();
        const firstName = faker.person.firstName(gender);
        const lastName = faker.person.lastName();
        const specialization = getSpecializationForYear(year);

        students.push({
          username: faker.internet.username({ firstName, lastName }),
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          password: 'password123',
          role: 'student',
          studentDetails: {
            yearOfStudy: year,
            specialization: specialization,
            group: faker.helpers.arrayElement(GROUPS)
          },
          createdAt: faker.date.past({ years: 10 })
        });
      }
    }
    await User.create(students);
    console.log(`${students.length} students created (Years 1-4)`);

    console.log('Generating schedule entries...');
    const scheduleEntries = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [
      ['08:00', '10:00'],
      ['10:00', '12:00'],
      ['12:00', '14:00'],
      ['14:00', '16:00'],
      ['16:00', '18:00']
    ];

    for (const course of createdCourses) {
      const lectureSlot = faker.helpers.arrayElement(timeSlots);
      scheduleEntries.push({
        course: course._id,
        room: faker.helpers.arrayElement(createdRooms)._id,
        dayOfWeek: faker.helpers.arrayElement(days),
        startTime: lectureSlot[0],
        endTime: lectureSlot[1],
        type: 'Lecture',
        group: '',
        academicYear: '2025-2026',
        semester: course.semester
      });

      const numPracticals = faker.number.int({ min: 1, max: 3 });
      for (let i = 0; i < numPracticals; i++) {
        const practicalSlot = faker.helpers.arrayElement(timeSlots);
        const practicalType = faker.helpers.arrayElement(['Lab', 'Seminar']);
        
        scheduleEntries.push({
          course: course._id,
          room: faker.helpers.arrayElement(createdRooms)._id,
          dayOfWeek: faker.helpers.arrayElement(days),
          startTime: practicalSlot[0],
          endTime: practicalSlot[1],
          type: practicalType,
          group: faker.helpers.arrayElement(GROUPS),
          academicYear: '2025-2026',
          semester: course.semester
        });
      }
    }
    console.log('Sending schedule entries to the backend API for overlap validation...');
    let successCount = 0;
    let overlapCount = 0;

    for (const entry of scheduleEntries) {
      try {
        await axios.post('http://localhost:5000/api/schedule', entry, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': adminToken
          }
        });
        
        successCount++;
      } catch (err) {
        if (err.response) {
          console.error(`\n Request failed! Status: ${err.response.status}`);
          console.error('Backend says:', err.response.data);
          overlapCount++;
        } else {
          console.error('\n Connection refused. Is your Node.js backend server running?', err.message);
          break; 
        }
      }
    }

    const dbStudents = await User.find({ role: 'student' });
    const dbTeachers = await User.find({ role: 'teacher' });
    const appointmenttimeSlots = [
      ['09:00', '09:15'],
      ['09:15', '09:30'],
      ['09:30', '09:45'],
      ['09:45', '10:00'],
      ['10:00', '10:15'],
      ['10:15', '10:30'],
      ['10:30', '10:45'],
      ['10:45', '11:00'],
      ['11:00', '11:15'],
      ['11:15', '11:30'],
      ['11:30', '11:45'],
      ['11:45', '12:00'],
      ['12:00', '12:15'],
      ['12:15', '12:30'],
      ['12:30', '12:45'],
      ['12:45', '13:00'],
      ['13:00', '13:15'],
      ['13:15', '13:30'],
      ['13:30', '13:45'],
      ['13:45', '14:00'],
      ['14:00', '14:15'],
      ['14:15', '14:30'],
      ['14:30', '14:45'],
      ['14:45', '15:00'],
      ['15:00', '15:15'],
      ['15:15', '15:30'],
      ['15:30', '15:45'],
      ['15:45', '16:00']
    ];

    console.log('Generating and validating Room Reservations...');
    let resSuccess = 0, resFail = 0;
    
    for (let i = 0; i < 30; i++) {
      const selectedTeacher = faker.helpers.arrayElement(dbTeachers);
      const teacherToken = jwt.sign(
        { user: { id: selectedTeacher._id, role: 'teacher' } }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      const reservationSlot = faker.helpers.arrayElement(timeSlots);
      const reservation = {
        room: faker.helpers.arrayElement(createdRooms)._id,
        reservedBy: selectedTeacher.username,
        contactEmail: faker.internet.email(),
        date: faker.date.soon({ days: 14 }),
        startTime: reservationSlot[0],
        endTime: reservationSlot[1],
        description: faker.lorem.sentence(),
        attendees: faker.number.int({ min: 10, max: 50 }),
        status: 'pending',
        isReadByUser: false
      };

      try {
        await axios.post('http://localhost:5000/api/room-reservations', reservation, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': teacherToken 
          }
        });
        resSuccess++;
      } catch (err) {
        if (err.response) {
          resFail++;
        }
        else break;
      }
    }
    console.log(`Reservations: ${resSuccess} saved, ${resFail} rejected by validation.`);

    console.log('Generating and validating Secretariat Appointments...');
    let apptSuccess = 0, apptFail = 0;
    
    for (let i = 0; i < 40; i++) {
      const selectedStudent = faker.helpers.arrayElement(dbStudents);
      const studentToken = jwt.sign(
        { user: { id: selectedStudent._id, role: 'student' } }, 
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      const appointmentSlot = faker.helpers.arrayElement(appointmenttimeSlots);
      const appointment = {
        student: selectedStudent._id,
        date: faker.date.soon({ days: 14 }),
        startTime: appointmentSlot[0],
        endTime: appointmentSlot[1],
        typeOfRequest: faker.helpers.arrayElement(['Adeverinte', 'Cereri de bursa', 'Reinmatriculare', 'Alte solicitari']),
        description: faker.lorem.sentence(),
        status: 'pending',
        isReadByUser: false
      };

      try {
        await axios.post('http://localhost:5000/api/appointments', appointment, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': studentToken 
          }
        });
        apptSuccess++;
      } catch (err) {
        if (err.response) {
          apptFail++;
          console.error(`\n Request failed! Status: ${err.response.status}`);
          console.error('Backend says:', err.response.data);
        }
        else break;
      }
    }
    console.log(`Appointments: ${apptSuccess} saved, ${apptFail} rejected by validation.`);

    console.log(`\n Seeding complete: ${successCount} valid entries saved, ${overlapCount} overlapping entries safely skipped.`);
    process.exit();
  } catch (err) {
    console.error(`Error generating data: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  connectDB().then(() => {
    console.log('Destroying data...');
    Promise.all([
      User.deleteMany(),
      Room.deleteMany(),
      Course.deleteMany(),
      RoomReservation.deleteMany(),
      ScheduleEntry.deleteMany(),
      Appointment.deleteMany()
    ]).then(() => {
      console.log('Data destroyed.');
      process.exit();
    });
  });
} else {
  connectDB().then(generateData);
}
