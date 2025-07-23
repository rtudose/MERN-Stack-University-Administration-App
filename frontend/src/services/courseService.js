// src/services/courseService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/courses`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'x-auth-token': token } : {};
};

const getAllCourses = () => {
  return axios.get(API_URL, { headers: getAuthHeaders() });
};

const createCourse = (courseData) => {
  return axios.post(API_URL, courseData, { headers: getAuthHeaders() });
};

const updateCourse = (id, courseData) => {
  return axios.put(`${API_URL}/${id}`, courseData, { headers: getAuthHeaders() });
};

const deleteCourse = (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
};

export { getAllCourses, createCourse, updateCourse, deleteCourse };