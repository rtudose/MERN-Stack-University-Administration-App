// backend/models/ScheduleEntry.js
const mongoose = require('mongoose');

const scheduleEntrySchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Course model
    ref: 'Course', // Name of the model being referenced
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Room model
    ref: 'Room',
    required: true
  },
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: { // Store as string for simplicity (e.g., "09:00") or Date for full flexibility
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format (e.g., 09:00, 14:30)']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format (e.g., 10:30, 16:00)']
  },
  type: { // e.g., "Lecture", "Lab", "Seminar"
    type: String,
    enum: ['Lecture', 'Lab', 'Seminar', 'Practice'],
    default: 'Lecture'
  },
  group: { // For different student groups (split the series in 3/4 equal groups, in order to be able to schedule the "Lab" and the "Seminar" for all students in the same week)
    type: String,
    required: false,
    trim: true
  },
  academicYear: { // e.g., "2024-2025"
    type: String,
    required: true,
    trim: true
  },
  semester: { // e.g., "Fall", "Spring"
    type: Number,
    required: true,
    enum: [1, 2] //Maybe use ['Fall', 'Spring'] notation?
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a custom validator or pre-save hook for startTime < endTime
scheduleEntrySchema.pre('save', function(next) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);

    if (start[0] > end[0] || (start[0] === end[0] && start[1] >= end[1])) {
        return next(new Error('End time must be after start time.'));
    }
    next();
});

const ScheduleEntry = mongoose.model('ScheduleEntry', scheduleEntrySchema);

module.exports = ScheduleEntry;