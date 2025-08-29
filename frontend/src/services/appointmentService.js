// src/services/appointmentService.js
import api from './api';


const getAvailableSlots = (date) => {
  return api.get(`/api/appointments/available-slots?date=${date}`);
};

const createAppointment = (appointmentData) => {
  return api.post('/api/appointments', appointmentData);
};

const getMyAppointments = () => {
  return api.get(`/api/appointments/my-appointments`);
};


const updateAppointmentStatus = (id, statusData) => {
  return api.put(`/api/appointments/${id}/status`, statusData);
};

const getPaginatedAppointments = ({ page, limit, sortBy, order }) => {
  return api.get(`/api/appointments/paginated?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`);
};

const cancelMyAppointment = (id) => {
  return api.put(`/api/appointments/${id}/cancel-by-user`);
};

const getAppointmentStatsByStatus = () => {
  return api.get('/api/appointments/stats/status');
};

const deleteAppointment = (id) => {
  return api.delete(`/api/appointments/${id}`);
};

export {
  getAvailableSlots,
  createAppointment,
  getMyAppointments,
  getPaginatedAppointments,
  updateAppointmentStatus,
  getAppointmentStatsByStatus,
  cancelMyAppointment,
  deleteAppointment,
};