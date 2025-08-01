// src/services/scheduleService.js
import api from './api';

// --- ADMIN FUNCTIONS ---
const getAllScheduleEntries = () => {
  return api.get('/api/schedule');
};

const createScheduleEntry = (data) => {
  return api.post('/api/schedule', data);
};

const deleteScheduleEntry = (id) => {
  return api.delete(`/api/schedule/${id}`);
};

// --- STUDENT FUNCTIONS ---
const getMySchedule = () => {
  return api.get('/api/schedule/my-schedule');
};

export {
  getAllScheduleEntries,
  createScheduleEntry,
  deleteScheduleEntry,
  getMySchedule,
};