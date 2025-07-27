// src/services/courseService.js
import api from './api'; // Import the new centralized api client

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

export { getAllCourses, createCourse, updateCourse, deleteCourse };