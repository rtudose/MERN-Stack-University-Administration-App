// src/services/courseService.js
import api from './api';

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

const getPaginatedCourses = ({ page, limit, sortBy, order }) => {
  return api.get(`/api/courses/paginated?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`);
};

const getCourseStatsByYear = () => {
  return api.get('/api/courses/stats/by-year');
};

const searchCourses = (query) => {
  return api.get(`/api/courses/search?q=${query}`);
};

export {
  getAllCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getPaginatedCourses,
  getCourseStatsByYear,
  searchCourses
};