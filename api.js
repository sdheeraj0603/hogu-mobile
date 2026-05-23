// API service for communicating with backend

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000'; // Change for production

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      AsyncStorage.removeItem('userToken');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  register: (email, password, name) =>
    api.post('/auth/register', { email, password, name }),
  
  logout: () =>
    api.post('/auth/logout'),
};

export const activitiesService = {
  getActivities: (limit = 10) =>
    api.get('/api/activities', { params: { limit } }),
  
  getActivityDetail: (id) =>
    api.get(`/api/activities/${id}`),
  
  syncActivities: () =>
    api.post('/api/refresh'),
  
  exportData: () =>
    api.get('/api/export'),
};

export const trackersService = {
  getConnectedTrackers: () =>
    api.get('/user/trackers'),
  
  connectTracker: (trackerType) =>
    api.post(`/trackers/${trackerType}/auth`),
  
  disconnectTracker: (trackerId) =>
    api.post(`/trackers/${trackerId}/disconnect`),
};

export const userService = {
  getProfile: () =>
    api.get('/user/profile'),
  
  updateProfile: (data) =>
    api.put('/user/profile', data),
  
  changePassword: (oldPassword, newPassword) =>
    api.post('/user/password', { oldPassword, newPassword }),
};

export default api;
