// src/services/userService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/users`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { 'x-auth-token': token } : {};
};

const getAllUsers = () => {
  return axios.get(API_URL, { headers: getAuthHeaders() });
};

const createUser = (userData) => {
  return axios.post(API_URL, userData, { headers: getAuthHeaders() });
};

const updateUser = (id, userData) => {
  return axios.put(`${API_URL}/${id}`, userData, { headers: getAuthHeaders() });
};

const deleteUser = (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
};

export { getAllUsers, createUser, updateUser, deleteUser };