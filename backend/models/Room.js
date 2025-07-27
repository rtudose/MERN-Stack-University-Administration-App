// backend/models/Room.js
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
  location: {
    type: String,
    required: true,
    trim: true
  },
  equipment: {
    type: [String],
    default: []
  },
  isAvailableForExternal: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['available', 'under_maintenance', 'unavailable'],
    default: 'available'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;