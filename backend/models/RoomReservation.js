// models/RoomReservation.js
const mongoose = require('mongoose');

const roomReservationSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  reservedBy: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address']
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  endTime: {
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  attendees: {
    type: Number,
    min: 1,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'expired', 'completed'],
    default: 'pending'
  },
  isReadByUser: {
    type: Boolean,
    default: true
  },
  adminNotes: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

roomReservationSchema.pre('save', function(next) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);

    if (start[0] > end[0] || (start[0] === end[0] && start[1] >= end[1])) {
        return next(new Error('End time must be after start time.'));
    }
    next();
});

const RoomReservation = mongoose.model('RoomReservation', roomReservationSchema);

module.exports = RoomReservation;