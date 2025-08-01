// src/services/courseService.js
import api from './api'; // Import the new centralized api client

// For a student to get their own courses
const getMyCourses = () => {
  return api.get('/api/courses/my-courses');
};

const getAllCourses = () => {
  return api.get('/api/courses');
};

const createCourse = (courseData) => {
  return api.post('/api/courses', courseData);
};

const updateCourse = (id, courseData) => {
  return api.put(`/api/courses/${id}`, courseData);
};

const deleteCourse = (id) => {
  return api.delete(`/api/courses/${id}`);
};

export { getMyCourses, getAllCourses, createCourse, updateCourse, deleteCourse };