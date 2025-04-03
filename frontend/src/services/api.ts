import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  bio: string;
  photo_url: string;
  created_at: string;
  updated_at: string;
  preferred_name?: string;
  address?: string;
  emergency_contact?: string;
  education_status?: string;
  employment_status?: string;
  date_of_birth?: string;
  trust_score: number;
  verifications: {
    email: boolean;
    phone: boolean;
    id: boolean;
    bank: boolean;
  };
  social_connections: {
    google: boolean;
    instagram: boolean;
    linkedin: boolean;
    twitter: boolean;
    facebook: boolean;
  };
  ratings: {
    as_landlord: {
      average: number;
      count: number;
    };
    as_tenant: {
      average: number;
      count: number;
    };
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
}

export interface LeaseData {
  property_name: string;
  property_address: string;
  monthly_rent: number;
  currency: Currency;
  start_date: string;
  end_date: string;
}

export type Currency = 'USD' | 'EUR' | 'TRY';

export interface Lease {
  id: number;
  ref_code: string;
  landlord_id: number;
  tenant_id?: number;
  property_name: string;
  property_address: string;
  monthly_rent: number;
  currency: Currency;
  premium: number;
  start_date: string;
  end_date: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  landlord_name?: string;
  tenant_name?: string;
}

export interface Payment {
  id: number;
  lease_id: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'late' | 'cancelled';
  created_at: string;
  updated_at?: string;
  property_address?: string;
  landlord_name?: string;
  tenant_name?: string;
}

export interface PaymentData {
  lease_id: number;
  amount: number;
  due_date: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at?: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  socialLogins: {
    google: boolean;
    facebook: boolean;
    apple: boolean;
  };
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  paymentReminders: boolean;
  leaseExpiring: boolean;
  profileAlerts: boolean;
  marketing: boolean;
}

interface Preferences {
  language: string;
  timezone: string;
  currency: string;
}

// Create axios instance with base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
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
  register: async (userData: RegisterData): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/register', userData);
    return response.data;
  },
  login: async (credentials: LoginCredentials): Promise<{token: string; user?: User}> => {
    try {
      console.log('Regular login attempt for:', credentials.email);
      const response = await api.post<TokenResponse>('/auth/login', credentials);
      
      console.log('Login response status:', response.status);
      
      if (!response.data || !response.data.token) {
        throw new Error('Invalid response format: missing token');
      }
      
      // For regular users, we'll need to fetch the user data after login
      try {
        const userResponse = await api.get('/users/profile');
        console.log('User profile fetched successfully');
        
        // Return both the token and user data
        return {
          token: response.data.token,
          user: userResponse.data
        };
      } catch (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Still return the token even if profile fetch fails
        return {
          token: response.data.token
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// User services
export const userService = {
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get('/users/profile');
      
      // Ensure the response has all required fields
      const data = response.data;
      return {
        id: data.id || 0,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        photo_url: data.photo_url || '',
        created_at: data.created_at || '',
        updated_at: data.updated_at || '',
        preferred_name: data.preferred_name || '',
        address: data.address || '',
        emergency_contact: data.emergency_contact || '',
        education_status: data.education_status || '',
        employment_status: data.employment_status || '',
        date_of_birth: data.date_of_birth || '',
        trust_score: data.trust_score || 0,
        verifications: data.verifications || {
          email: false,
          phone: false,
          id: false,
          bank: false
        },
        social_connections: data.social_connections || {
          google: false,
          instagram: false,
          linkedin: false,
          twitter: false,
          facebook: false
        },
        ratings: data.ratings || {
          as_landlord: { average: 0, count: 0 },
          as_tenant: { average: 0, count: 0 }
        }
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  uploadProfilePhoto: async (formData: FormData): Promise<User> => {
    const response = await api.post('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  updateSettings: async (settingsData: {
    security?: SecuritySettings;
    notifications?: NotificationSettings;
    preferences?: Preferences;
  }): Promise<void> => {
    const response = await api.patch('/users/settings', settingsData);
    return response.data;
  },
  removePaymentMethod: async (id: string): Promise<void> => {
    const response = await api.delete(`/users/payment-methods/${id}`);
    return response.data;
  },
  setDefaultPaymentMethod: async (id: string): Promise<void> => {
    const response = await api.patch(`/users/payment-methods/${id}/default`);
    return response.data;
  },
  removePayoutMethod: async (id: string): Promise<void> => {
    const response = await api.delete(`/users/payout-methods/${id}`);
    return response.data;
  },
  setDefaultPayoutMethod: async (id: string): Promise<void> => {
    const response = await api.patch(`/users/payout-methods/${id}/default`);
    return response.data;
  },
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    const response = await api.post('/users/change-password', data);
    return response.data;
  },
  requestPersonalData: async (): Promise<void> => {
    const response = await api.post('/users/request-data');
    return response.data;
  },
  deleteAccount: async (): Promise<void> => {
    const response = await api.delete('/users/account');
    return response.data;
  },
  connectSocialAccount: async (platform: string): Promise<void> => {
    await api.post(`/users/social/${platform}`);
  },
};

// Lease services
export const leaseService = {
  createLease: async (leaseData: LeaseData): Promise<Lease> => {
    console.log('API: Creating lease with data:', leaseData);
    try {
      const response = await api.post<Lease>('/leases', leaseData);
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error);
      throw error;
    }
  },

  joinLease: async (refCode: string): Promise<Lease> => {
    const response = await api.post<Lease>('/leases/join', { ref_code: refCode });
    return response.data;
  },

  getAllLeases: async (): Promise<Lease[]> => {
    const response = await api.get<Lease[]>('/leases');
    return response.data;
  },

  getLeaseById: async (id: number): Promise<Lease> => {
    const response = await api.get<Lease>(`/leases/${id}`);
    return response.data;
  },

  updateLeaseStatus: async (id: number, status: Lease['status']): Promise<Lease> => {
    const response = await api.put<Lease>(`/leases/${id}/status`, { status });
    return response.data;
  },
};

// Payment services
export const paymentService = {
  getAllPayments: async (): Promise<Payment[]> => {
    const response = await api.get<Payment[]>('/payments');
    return response.data;
  },
  getLeasePayments: async (leaseId: number): Promise<Payment[]> => {
    const response = await api.get<Payment[]>(`/payments/lease/${leaseId}`);
    return response.data;
  },
  createPayment: async (paymentData: PaymentData): Promise<Payment> => {
    const response = await api.post<Payment>('/payments', paymentData);
    return response.data;
  },
  updatePaymentStatus: async (id: number, status: Payment['status']): Promise<Payment> => {
    const response = await api.put<Payment>(`/payments/${id}/status`, { status });
    return response.data;
  },
};

// Notification services
export const notificationService = {
  getAllNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications');
    return response.data;
  },
  markAsRead: async (id: number): Promise<Notification> => {
    const response = await api.put<Notification>(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (): Promise<Notification[]> => {
    const response = await api.put<Notification[]>('/notifications/read-all');
    return response.data;
  },
};

export default api; 