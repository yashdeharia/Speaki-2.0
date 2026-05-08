import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// User API calls
export const userAPI = {
  getMatches: () => api.get('/matches'),
  getProfile: (id: string) => api.get(`/users/${id}`),
  updateProfile: (id: string, data: any) => api.put(`/users/${id}`, data),
  searchUsers: (query: string) => api.get('/users/search', { params: { q: query } }),
};

// Chat API calls
export const chatAPI = {
  getMessages: (chatId: string) => api.get(`/chats/${chatId}/messages`),
  sendMessage: (chatId: string, message: string) => api.post(`/chats/${chatId}/messages`, { message }),
  getChats: () => api.get('/chats'),
  createChat: (userId: string) => api.post('/chats', { user_id: userId }),
};

// Circle API calls
export const circleAPI = {
  getCircles: () => api.get('/circles'),
  getCircle: (id: string) => api.get(`/circles/${id}`),
  createCircle: (name: string, description: string) => api.post('/circles', { name, description }),
  joinCircle: (id: string) => api.post(`/circles/${id}/join`),
  leaveCircle: (id: string) => api.post(`/circles/${id}/leave`),
};

// Auth API calls
export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (email: string, password: string, username: string) => api.post('/auth/register', { email, password, username }),
  logout: () => api.post('/auth/logout'),
};
