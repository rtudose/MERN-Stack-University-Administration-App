// src/services/reservationService.js
import api from './api';

// For users to create a reservation
const createReservation = (reservationData) => {
  return api.post('/api/reservations', reservationData);
};

// For a user to get their own reservations
const getMyReservations = () => {
  return api.get('/api/reservations/my-reservations');
};

// --- ADMIN FUNCTIONS ---

// For admins to get all reservations
const getAllReservations = () => {
  return api.get('/api/reservations');
};

// For admins to update a reservation's status
const updateReservationStatus = (id, status) => {
  return api.put(`/api/reservations/${id}/status`, { status });
};

export { createReservation, getAllReservations, updateReservationStatus, getMyReservations };