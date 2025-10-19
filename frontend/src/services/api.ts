import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const { tokens } = useAuthStore.getState();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const { tokens, logout } = useAuthStore.getState();
      
      if (tokens?.refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });
          
          const { accessToken, refreshToken } = response.data.data;
          useAuthStore.getState().setAuth(
            useAuthStore.getState().user!,
            { accessToken, refreshToken }
          );
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        logout();
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email: string, password: string, name: string, role: 'ADMIN' | 'USER' = 'USER') => {
    const response = await api.post('/auth/register', { email, password, name, role });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};

// Vehicle API
export const vehicleAPI = {
  getVehicles: async (page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (sortBy) params.append('sortBy', sortBy);
    if (sortOrder) params.append('sortOrder', sortOrder);
    
    const response = await api.get(`/vehicles?${params.toString()}`);
    return response.data;
  },
  
  getVehicleById: async (id: string) => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },
  
  getVehicleStatus: async (vehicleId: string, date: string) => {
    const response = await api.get(`/vehicles/${vehicleId}/status?date=${date}`);
    return response.data;
  },
};

// Report API
export const reportAPI = {
  downloadReport: async (vehicleId: string, startDate: string, endDate: string) => {
    const response = await api.get(`/reports/vehicle/${vehicleId}`, {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return response.data;
  },
};
