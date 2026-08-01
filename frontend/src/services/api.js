import axios from 'axios';
import { getToken } from './auth';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Interceptor to inject JWT token in every request header
API.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth endpoints
export const loginAPI = (credential) =>
  API.post('/users/login', { credential });

export const fetchProfileAPI = () => API.get('/users/profile');

export const fetchUsersAPI = () => API.get('/users');

// Token endpoints
export const fetchTokensAPI = (params = {}) => {
  return API.get('/tokens', { params });
};

export const fetchTokenByIdAPI = (id) => API.get(`/tokens/${id}`);

export const createTokenAPI = (tokenData) => API.post('/tokens', tokenData);

export const updateTokenAPI = (id, tokenData) => API.put(`/tokens/${id}`, tokenData);

export const deleteTokenAPI = (id) => API.delete(`/tokens/${id}`);

export const fetchAnalyticsAPI = () => API.get('/tokens/analytics');

export default API;
