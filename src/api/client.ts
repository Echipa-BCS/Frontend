import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5020';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: attach auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('campus_booking_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize backend error messages and handle expired tokens cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const backendMessage =
      error.response?.data?.error ||
      error.response?.data?.message;

    if (backendMessage) {
      error.message = backendMessage;
    }

    const reqUrl = error.config?.url ?? '';
    const isAuthEndpoint = reqUrl.includes('/api/auth/login') || reqUrl.includes('/api/auth/register');

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('campus_booking_token');
      localStorage.removeItem('campus_booking_refresh_token');
    }

    return Promise.reject(error);
  }
);

export { API_BASE_URL };
