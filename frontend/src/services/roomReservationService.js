// src/services/roomReservationService.js
import api from './api';

const createRoomReservation = (reservationData) => {
  return api.post('/api/room-reservations', reservationData);
};

const getRoomReservations = (filters = '') => {
  return api.get(`/api/room-reservations${filters}`);
};

const getRoomReservationById = (id) => {
  return api.get(`/api/room-reservations/${id}`);
};

const updateRoomReservationStatus = (id, statusData) => {
  return api.put(`/api/room-reservations/${id}/status`, statusData);
};

const deleteRoomReservation = (id) => {
  return api.delete(`/api/room-reservations/${id}`);
};

export {
  createRoomReservation,
  getRoomReservations,
  getRoomReservationById,
  updateRoomReservationStatus,
  deleteRoomReservation
};