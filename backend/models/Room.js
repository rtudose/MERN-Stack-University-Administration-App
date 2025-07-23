// models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  equipment: { // e.g., ['Projector', 'Whiteboard', 'Computers']
    type: [String], // Array of strings
    default: []
  },
  location: { // e.g., "Building A, Floor 3"
    type: String,
    required: true,
    trim: true
  },
  isAvailableForExternal: { // Can external reps book this room?
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;