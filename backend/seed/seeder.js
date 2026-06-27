// backend/seed/seeder.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

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
    await ScheduleEntry.create(scheduleEntries);
    console.log(`${scheduleEntries.length} schedule entries generated`);

    console.log('Seeding completed successfully!');
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
