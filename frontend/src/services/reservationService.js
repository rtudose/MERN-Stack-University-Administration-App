// src/services/reservationService.js
import api from './api';

const createReservation = (reservationData) => {
  return api.post('/api/reservations', reservationData);
};

const getMyReservations = () => {
  return api.get('/api/reservations/my-reservations');
};

const getPaginatedReservations = ({ page, limit, sortBy, order, status }) => {
  return api.get(`/api/reservations/paginated?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}&status=${status}`);
};

const updateReservationStatus = (id, status, adminNotes) => {
  return api.put(`/api/reservations/${id}/status`, { status, adminNotes });
};

const getReservationStatsByStatus = () => {
  return api.get('/api/reservations/stats/status');
};

const getAvailableReservationSlots = ({ date, roomId }) => {
  return api.get(`/api/reservations/available-slots?date=${date}&roomId=${roomId}`);
};

export { createReservation, getMyReservations, getPaginatedReservations, updateReservationStatus, getReservationStatsByStatus, getAvailableReservationSlots };