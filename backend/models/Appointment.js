// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  typeOfRequest: {
    type: String,
    required: true,
    enum: ['Adeverinte', 'Cereri de bursa', 'Reinmatriculare', 'Alte solicitari']
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'expired'],
    default: 'pending'
  },
  isReadByUser: {
    type: Boolean,
    default: true
  },
  secretariatNotes: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

appointmentSchema.pre('save', function(next) {
    const start = this.startTime.split(':').map(Number);
    const end = this.endTime.split(':').map(Number);

    if (start[0] > end[0] || (start[0] === end[0] && start[1] >= end[1])) {
        return next(new Error('End time must be after start time.'));
    }
    next();
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;