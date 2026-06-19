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

// --- Configuration ---
const SPECIALIZATIONS = ['ELA', 'MON', 'TST'];
const GROUPS = ['A', 'B', 'C', 'D'];
const NUM_STUDENTS_PER_YEAR = 40; // Total ~160 students
const NUM_TEACHERS = 30;
const NUM_EXTERNAL_REPS = 10;

// Helper to get random specialization based on year
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

    // 1. Create Admin
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });
    console.log('Admin created');

    // 2. Create Rooms (from rooms.json if exists, else generate)
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

    // 3. Create Teachers
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
        role: 'teacher'
      });
    }
    const createdTeachers = await User.create(teachers);
    console.log(`${createdTeachers.length} teachers created`);

    // 4. Create External Representatives
    const externalReps = [];
    for (let i = 0; i < NUM_EXTERNAL_REPS; i++) {
      externalReps.push({
        username: faker.internet.userName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        role: 'external_representative'
      });
    }
    await User.create(externalReps);
    console.log(`${NUM_EXTERNAL_REPS} external representatives created`);

    // 5. Create Courses (using anonymized teachers)
    // We'll read courses.json and replace professor names with our newly created ones
    const originalCourses = JSON.parse(fs.readFileSync(path.join(__dirname, 'courses.json'), 'utf-8'));

    // Map of original professor name to new anonymized teacher object
    const professorMap = {};
    const getAnonymizedTeacher = (originalName) => {
      if (!originalName) return null;
      if (!professorMap[originalName]) {
        professorMap[originalName] = faker.helpers.arrayElement(createdTeachers);
      }
      return professorMap[originalName].username;
    };

    const courseData = originalCourses.map(course => {
      // Ensure specialization logic matches (General for Year 1-2, Specific for 3-4)
      let spec = course.specialization;
      if (course.yearOfStudy <= 2) spec = 'General';
      else if (spec === 'Informatica') spec = 'ELA'; // Mapping old names to new ones if needed

      return {
        ...course,
        specialization: spec,
        professors: {
          lecture: getAnonymizedTeacher(course.professors.lecture),
          seminar: course.professors.seminar ? getAnonymizedTeacher(course.professors.seminar) : undefined,
          lab: course.professors.lab ? getAnonymizedTeacher(course.professors.lab) : undefined
        }
      };
    });
    const createdCourses = await Course.create(courseData);
    console.log(`${createdCourses.length} courses created with anonymized professors`);

    // 6. Create Students
    const students = [];
    for (let year = 1; year <= 4; year++) {
      for (let i = 0; i < NUM_STUDENTS_PER_YEAR; i++) {
        const gender = faker.person.sexType();
        const firstName = faker.person.firstName(gender);
        const lastName = faker.person.lastName();
        const specialization = getSpecializationForYear(year);

        students.push({
          username: faker.internet.userName({ firstName, lastName }),
          email: faker.internet.email({ firstName, lastName }).toLowerCase(),
          password: 'password123',
          role: 'student',
          studentDetails: {
            yearOfStudy: year,
            specialization: specialization,
            group: faker.helpers.arrayElement(GROUPS)
          }
        });
      }
    }
    await User.create(students);
    console.log(`${students.length} students created (Years 1-4)`);

    // 7. Generate Schedule Entries (Simplified logic)
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

    // For each course, create a few schedule entries
    for (const course of createdCourses) {
      const numEntries = faker.number.int({ min: 1, max: 2 });
      for (let i = 0; i < numEntries; i++) {
        const slot = faker.helpers.arrayElement(timeSlots);
        scheduleEntries.push({
          course: course._id,
          room: faker.helpers.arrayElement(createdRooms)._id,
          dayOfWeek: faker.helpers.arrayElement(days),
          startTime: slot[0],
          endTime: slot[1],
          type: faker.helpers.arrayElement(['Lecture', 'Lab', 'Seminar']),
          group: course.specialization === 'General' ? faker.helpers.arrayElement(GROUPS) : faker.helpers.arrayElement(GROUPS),
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
