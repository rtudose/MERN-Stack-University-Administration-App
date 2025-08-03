// src/services/appointmentService.js
import api from './api';

// --- STUDENT FUNCTIONS ---
const getAvailableSlots = (date) => {
  return api.get(`/api/appointments/available-slots?date=${date}`);
};

const createAppointment = (appointmentData) => {
  return api.post('/api/appointments', appointmentData);
};

const getMyAppointments = () => {
   return api.get('/api/appointments');
};

// --- ADMIN FUNCTIONS ---
const getAllAppointments = () => {
    return api.get('/api/appointments');
};

const updateAppointmentStatus = (id, statusData) => {
    return api.put(`/api/appointments/${id}/status`, statusData);
};

export {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus,
};