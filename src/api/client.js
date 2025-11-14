import axios from 'axios';
import { API_BASE_URL } from '../config/constants.js';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error', error?.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const fetchFixtures = () => apiClient.get('/fixtures');
export const fetchResults = () => apiClient.get('/results');
export const fetchReports = () => apiClient.get('/reports');
export const fetchAnnouncements = () => apiClient.get('/announcements');
export const fetchUsers = (params) => apiClient.get('/users', { params });
export const fetchLeagues = () => apiClient.get('/meta/leagues');
export const fetchLeaders = () => apiClient.get('/meta/leaders');
export const sendNotificationToken = (tokenPayload) =>
  apiClient.post('/users/notification-token', tokenPayload);

