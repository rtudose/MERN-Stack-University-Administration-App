// src/services/adminService.js
import api from './api';

const getStats = () => {
    return api.get('/api/admin/stats');
};

export { getStats };
