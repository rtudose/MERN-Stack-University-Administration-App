// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true, // Removes whitespace from both ends of a string
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true, // Converts email to lowercase before saving
    match: [/.+@.+\..+/, 'Please fill a valid email address'] // Basic email regex validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6 // Recommended minimum length for passwords
  },
  role: {
    type: String,
    enum: ['admin', 'student', 'external_representative'], // Enforces specific roles
    default: 'student' // Default role for new users if not specified
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// --- Mongoose Middleware for Password Hashing ---
// This pre-save hook will hash the password before saving a new user or updating a password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) { // Only hash if the password field is new or modified
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10); // Generate a salt
    this.password = await bcrypt.hash(this.password, salt); // Hash the password with the salt
    next();
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

// --- Method to compare passwords ---
// This method will be available on user documents to check if a provided password matches
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model('User', userSchema);

module.exports = User;