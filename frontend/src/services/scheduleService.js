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

// --- STUDENT AND TEACHER FUNCTIONS ---

// For students to get their schedule
const getMySchedule = () => {
  return api.get('/api/schedule/my-schedule');
};

// For teachers to get their schedule
const getMyTeacherSchedule = () => {
  return api.get('/api/schedule/my-teacher-schedule');
};

export {
  getAllScheduleEntries,
  createScheduleEntry,
  deleteScheduleEntry,
  getMySchedule,
  getMyTeacherSchedule,
  updateScheduleEntry,
};