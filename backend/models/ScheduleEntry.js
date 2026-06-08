// backend/models/ScheduleEntry.js
const mongoose = require('mongoose');

const scheduleEntrySchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  dayOfWeek: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format (e.g., 09:00, 14:30)']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format (e.g., 10:30, 16:00)']
  },
  type: {
    type: String,
    enum: ['Lecture', 'Lab', 'Seminar', 'Practice'],
    default: 'Lecture'
  },
  group: { // For different student groups (split the series in 3/4 equal groups, in order to be able to schedule the "Lab" and the "Seminar" for all students in the same week)
    type: String,
    required: false,
    trim: true
  },
  academicYear: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    enum: [1, 2]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

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