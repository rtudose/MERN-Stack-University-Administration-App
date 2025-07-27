// src/services/userService.js
import api from './api'; // Import the new centralized api client

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

export { getAllUsers, createUser, updateUser, deleteUser };