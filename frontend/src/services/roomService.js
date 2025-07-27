// src/services/roomService.js
import api from './api'; // 1. Import the new api client

const getPublicRooms = () => {
  // The token is now added automatically by the interceptor
  return api.get('/api/public/rooms'); 
};

const getAllRooms = () => {
  return api.get('/api/rooms');
};

const createRoom = (roomData) => {
  return api.post('/api/rooms', roomData);
};

const updateRoom = (id, roomData) => {
  return api.put(`/api/rooms/${id}`, roomData);
};

const deleteRoom = (id) => {
  return api.delete(`/api/rooms/${id}`);
};

// 2. Export all functions as before
export { getAllRooms, createRoom, updateRoom, deleteRoom, getPublicRooms };