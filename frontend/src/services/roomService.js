// src/services/roomService.js
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/rooms`;

// Helper function to get the auth token and create headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  // In your original Rooms.jsx, you used 'Authorization': `Bearer ${token}`
  // However, in the project description, you mentioned 'x-auth-token'.
  // We will use 'x-auth-token' to match the backend 'auth.js' middleware expectation.
  // Please ensure your backend middleware (backend/middleware/auth.js) looks for 'x-auth-token'.
  return token ? { 'x-auth-token': token } : {};
};

const getAllRooms = () => {
  return axios.get(API_URL, { headers: getAuthHeaders() });
};

const createRoom = (roomData) => {
  return axios.post(API_URL, roomData, { headers: getAuthHeaders() });
};

const updateRoom = (id, roomData) => {
  return axios.put(`${API_URL}/${id}`, roomData, { headers: getAuthHeaders() });
};

const deleteRoom = (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
};

export { getAllRooms, createRoom, updateRoom, deleteRoom };