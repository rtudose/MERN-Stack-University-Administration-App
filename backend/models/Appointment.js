// models/Appointment.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  student: { // Reference to the User model, assuming students also have accounts
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
  endTime: { // Assuming fixed length appointments (e.g., 15 mins)
    type: String,
    required: true,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please use HH:MM format']
  },
  typeOfRequest: { // e.g., "Adeverinte", "Cereri de bursa", "Reinmatriculare"
    type: String,
    required: true,
    enum: ['Adeverinte', 'Cereri de bursa', 'Reinmatriculare', 'Alte solicitari']
  },
  description: { // Optional longer description for the request
    type: String,
    required: false,
    trim: true
  },
  status: { // e.g., 'pending', 'confirmed', 'completed', 'cancelled'
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  secretariatNotes: { // For secretariat personnel to add notes
    type: String,
    required: false
  },
  // You might add a field for the secretariat user who confirmed/handled it:
  // handledBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: false
  // },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a custom validator or pre-save hook for startTime < endTime
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