import axios from 'axios';

// Create axios instance with base URL
const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// User services
export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
};

// Lease services
export const leaseService = {
  createLease: async (leaseData) => {
    const response = await api.post('/leases', leaseData);
    return response.data;
  },
  joinLease: async (refCode) => {
    const response = await api.post('/leases/join', { ref_code: refCode });
    return response.data;
  },
  getAllLeases: async () => {
    const response = await api.get('/leases');
    return response.data;
  },
  getLeaseById: async (id) => {
    const response = await api.get(`/leases/${id}`);
    return response.data;
  },
  updateLeaseStatus: async (id, status) => {
    const response = await api.put(`/leases/${id}/status`, { status });
    return response.data;
  },
};

// Payment services
export const paymentService = {
  getAllPayments: async () => {
    const response = await api.get('/payments');
    return response.data;
  },
  getLeasePayments: async (leaseId) => {
    const response = await api.get(`/payments/lease/${leaseId}`);
    return response.data;
  },
  createPayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },
  updatePaymentStatus: async (id, status) => {
    const response = await api.put(`/payments/${id}/status`, { status });
    return response.data;
  },
};

// Notification services
export const notificationService = {
  getAllNotifications: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },
};

export default api; 