// src/services/userService.js
import api from './api';

const getAllUsers = () => {
  return api.get('/api/users');
};

const createUser = (userData) => {
  return api.post('/api/users', userData);
};

const updateUser = (id, userData) => {
  return api.put(`/api/users/${id}`, userData);
};

const deleteUser = (id) => {
  return api.delete(`/api/users/${id}`);
};

const getPaginatedUsers = ({ page, limit, sortBy, order }) => {
  return api.get(`/api/users/paginated?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`);
};

const getStudentRegistrationStats = () => {
  return api.get('/api/users/stats/student-registrations');
};

export {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getPaginatedUsers,
  getStudentRegistrationStats
};