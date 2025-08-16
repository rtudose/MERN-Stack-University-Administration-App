// src/services/scheduleService.js
import api from './api';

// --- ADMIN FUNCTIONS ---
const getAllScheduleEntries = () => {
  return api.get('/api/schedule');
};

const createScheduleEntry = (data) => {
  return api.post('/api/schedule', data);
};

const updateScheduleEntry = (id, data) => {
  return api.put(`/api/schedule/${id}`, data);
};

const deleteScheduleEntry = (id) => {
  return api.delete(`/api/schedule/${id}`);
};

const getPaginatedSchedule = ({ page, limit, sortBy, order }) => {
  return api.get(`/api/schedule/paginated?page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`);
};
const getStudentSchedule = () => {
  return api.get('/api/schedule/my-schedule');
};

const getTeacherSchedule = () => {
  return api.get('/api/schedule/my-teacher-schedule');
};

export {
  getAllScheduleEntries,
  createScheduleEntry,
  deleteScheduleEntry,
  getStudentSchedule,
  getTeacherSchedule,
  updateScheduleEntry,
  getPaginatedSchedule,
};