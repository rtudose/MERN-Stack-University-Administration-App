// src/services/roomService.js
import api from './api';

const getPublicRooms = () => {
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

const getPaginatedRooms = ({ page, limit, sortBy, order }) => {
  return api.get(`/api/rooms/paginated?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`);
};

const getRoomStatsByStatus = () => {
  return api.get('/api/rooms/stats/stats');
};

export { getAllRooms, createRoom, updateRoom, deleteRoom, getPublicRooms, getPaginatedRooms, getRoomStatsByStatus };