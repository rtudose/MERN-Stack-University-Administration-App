// routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// Middleware for admin-only access
const adminOnly = [auth, authorize(['admin'])];

// @route   POST /api/courses
// @desc    Create a new course
// @access  Admin
router.post('/', adminOnly, async (req, res) => {
  const { name, code, description, credits, professor, department, yearOfStudy, semester, specialization } = req.body;
  try {
    const newCourse = new Course({
      name, code, description, credits, professor, department,
      yearOfStudy, semester, specialization
    });
    const course = await newCourse.save();
    res.status(201).json(course);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ msg: `A course with this ${field} already exists` });
    }
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      return res.status(400).json({ msg: message });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/courses
// @desc    Get all courses
// @access  Admin (UPDATED from Public)
router.get('/', adminOnly, async (req, res) => {
  try {
    const courses = await Course.find().sort({ code: 1 });
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Admin (UPDATED from Public)
router.get('/:id', adminOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Course ID' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/courses/:id
// @desc    Update a course by ID
// @access  Admin
router.put('/:id', adminOnly, async (req, res) => {
  const { name, code, description, credits, professor, department, yearOfStudy, semester, specialization } = req.body;
  const courseFields = {};
  if (name) courseFields.name = name;
  if (code) courseFields.code = code;
  if (description) courseFields.description = description;
  if (credits) courseFields.credits = credits;
  if (professor) courseFields.professor = professor;
  if (department) courseFields.department = department;
  if (yearOfStudy) courseFields.yearOfStudy = yearOfStudy;
  if (semester) courseFields.semester = semester;
  if (specialization) courseFields.specialization = specialization;

  try {
    let course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: courseFields },
      { new: true, runValidators: true }
    );
    res.json(course);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({ msg: `A course with this ${field} already exists` });
    }
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map(val => val.message).join(', ');
      return res.status(400).json({ msg: message });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete a course by ID
// @access  Admin
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ msg: 'Course not found' });
    }
    res.json({ msg: 'Course removed' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(400).json({ msg: 'Invalid Course ID' });
    }
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;