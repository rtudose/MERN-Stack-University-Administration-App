// backend/models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: { // e.g., "CS101", "MA203"
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    required: false
  },
  credits: {
    type: Number,
    required: true,
    min: 1 // Minimum 1 credit
  },
  professor: {
    type: String, // Might later link this to a 'Professor' User ID
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: false,
    trim: true
  },
  yearOfStudy: {
    type: Number,
    required: true,
    min: 1,
    max: 4 // Assuming a 4-year program, adjust as needed
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 2
  },
  specialization: {
    type: String,
    required: true, 
    trim: true,
    default: 'General' // A default for courses in early years
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;