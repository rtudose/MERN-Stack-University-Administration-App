const Course = require('../models/Course');

const createCourse = async (req, res) => {
    const { name, code, description, credits, professors, department, yearOfStudy, semester, specialization } = req.body;
  try {
    const newCourse = new Course({ name, code, description, credits, professors, department, yearOfStudy, semester, specialization });
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
};

const getPaginatedCourses = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'name', order = 'asc' } = req.query;
        const limitNum = parseInt(limit, 10);
        const pageNum = parseInt(page, 10);

        const courses = await Course.find()
            .sort({ [sortBy]: order })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum);
        
        const totalItems = await Course.countDocuments();

        res.json({
            data: courses,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalItems / limitNum),
                totalItems,
                limit: limitNum
            }
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

const updateCourse = async (req, res) => {
    const { name, code, description, credits, professors, department, yearOfStudy, semester, specialization } = req.body;
    const courseFields = {};
    if (name) courseFields.name = name;
    if (code) courseFields.code = code;
    if (description) courseFields.description = description;
    if (credits) courseFields.credits = credits;
    if (professors) courseFields.professors = professors;
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
};

const deleteCourse = async (req, res) => {
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
};

const getCourseStatsByYear = async (req, res) => {
    try {
        const stats = await Course.aggregate([
            { $group: { _id: '$yearOfStudy', count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, year: '$_id', value: '$count' } }
        ]);
        res.json(stats);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

const searchCourses = async (req, res) => {
    try {
        const query = req.query.q || ''; // 'q' for query
        if (query.length < 2) {
            return res.json([]); // Don't search for less than 2 characters
        }
        const courses = await Course.find({
            $or: [
                { name: { $regex: query, $options: 'i' } }, // Case-insensitive search on name
                { code: { $regex: query, $options: 'i' } }  // Case-insensitive search on code
            ]
        }).limit(15); // Return a limited number of matches
        res.json(courses);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

module.exports = {
    createCourse,
    getPaginatedCourses,
    updateCourse,
    deleteCourse,
    getCourseStatsByYear,
    searchCourses
};