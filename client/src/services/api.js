import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// User API
export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

// Visitor API
export const visitorAPI = {
  createVisitor: (formData) => api.post('/visitors', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getVisitors: (params) => api.get('/visitors', { params }),
  getVisitor: (id) => api.get(`/visitors/${id}`),
  updateVisitor: (id, formData) => api.put(`/visitors/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteVisitor: (id) => api.delete(`/visitors/${id}`),
  blacklistVisitor: (id, reason) => api.patch(`/visitors/${id}/blacklist`, { reason }),
};

// Appointment API
export const appointmentAPI = {
  createAppointment: (data) => api.post('/appointments', data),
  getAppointments: (params) => api.get('/appointments', { params }),
  getAppointment: (id) => api.get(`/appointments/${id}`),
  approveAppointment: (id) => api.patch(`/appointments/${id}/approve`),
  rejectAppointment: (id, reason) => api.patch(`/appointments/${id}/reject`, { reason }),
  updateAppointment: (id, data) => api.put(`/appointments/${id}`, data),
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
};

// Pass API
export const passAPI = {
  generatePass: (appointmentId) => api.post(`/passes/generate/${appointmentId}`),
  getPasses: (params) => api.get('/passes', { params }),
  getPass: (id) => api.get(`/passes/${id}`),
  getPassByPassId: (passId) => api.get(`/passes/by-pass-id/${passId}`),
  downloadPDF: (id) => api.get(`/passes/${id}/pdf`),
  revokePass: (id, reason) => api.patch(`/passes/${id}/revoke`, { reason }),
};

// Security API
export const securityAPI = {
  verifyPass: (data) => api.post('/security/verify', data),
  checkIn: (data) => api.post('/security/check-in', data),
  checkOut: (data) => api.post('/security/check-out', data),
  getActiveVisitors: () => api.get('/security/active-visitors'),
  getExpectedVisitors: () => api.get('/security/expected-visitors'),
  getVisitorHistory: (params) => api.get('/security/visitor-history', { params }),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAnalytics: () => api.get('/dashboard/analytics'),
  getRecentVisitors: (limit) => api.get('/dashboard/recent-visitors', { params: { limit } }),
};

export default api;
