import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

export const areaAPI = {
  getAll: () => API.get('/areas'),
  getById: (id) => API.get(`/areas/${id}`),
  create: (data) => API.post('/areas', data),
  update: (id, data) => API.put(`/areas/${id}`, data),
  delete: (id) => API.delete(`/areas/${id}`),
};

export const issueAPI = {
  getAll: (params) => API.get('/issues', { params }),
  getById: (id) => API.get(`/issues/${id}`),
  create: (data) => API.post('/issues', data),
  updateStatus: (id, data) => API.put(`/issues/${id}/status`, data),
  assign: (id, data) => API.put(`/issues/${id}/assign`, data),
  delete: (id) => API.delete(`/issues/${id}`),
  getStats: () => API.get('/issues/stats'),
};

export const fundAPI = {
  getAll: (params) => API.get('/funds', { params }),
  getById: (id) => API.get(`/funds/${id}`),
  allocate: (data) => API.post('/funds', data),
  update: (id, data) => API.put(`/funds/${id}`, data),
  addTransaction: (id, data) => API.post(`/funds/${id}/transaction`, data),
  getStats: () => API.get('/funds/stats'),
};

export const feedbackAPI = {
  submit: (data) => API.post('/feedback', data),
  getByIssue: (issueId) => API.get(`/feedback/issue/${issueId}`),
  getByOfficer: (officerId) => API.get(`/feedback/officer/${officerId}`),
};

export const rankingAPI = {
  getAll: (params) => API.get('/rankings', { params }),
  getOfficer: (id) => API.get(`/rankings/officer/${id}`),
  getAnalytics: (params) => API.get('/rankings/analytics', { params }),
};

export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  getById: (id) => API.get(`/users/${id}`),
  approve: (id) => API.put(`/users/${id}/approve`),
  changeRole: (id, role) => API.put(`/users/${id}/role`, { role }),
  deactivate: (id) => API.put(`/users/${id}/deactivate`),
  getStats: () => API.get('/users/stats'),
};

export default API;
