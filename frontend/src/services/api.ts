import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Define API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  photo_url?: string;
  profile_photo?: string;
  role: 'tenant' | 'landlord' | 'admin';
  preferred_name?: string;
  address?: string;
  emergency_contact?: string;
  education_status?: string;
  employment_status?: string;
  date_of_birth?: string;
  trust_score?: number;
  created_at: string;
  updated_at: string;
  verifications?: {
    email: boolean;
    phone: boolean;
    id: boolean;
    bank: boolean;
  };
  social_connections?: {
    google: boolean;
    instagram: boolean;
    linkedin: boolean;
    twitter: boolean;
    facebook: boolean;
  };
  ratings?: {
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
  premium?: number;
  template_data: {
    additional_terms?: string;
    utilities_included?: string[];
    pets_allowed?: boolean;
    smoking_allowed?: boolean;
    notice_period_days?: number;
    [key: string]: any;
  };
  tenant_id?: string;
}

export type Currency = 'USD' | 'EUR' | 'TRY';

export type LeaseStatus = 
  | 'draft' 
  | 'pending' 
  | 'awaiting_landlord_signature' 
  | 'awaiting_tenant_signature' 
  | 'changes_requested' 
  | 'active' 
  | 'completed' 
  | 'terminated' 
  | 'cancelled';

export interface Lease {
  id: number;
  ref_code: string;
  landlord_id: number;
  tenant_id?: number;
  property_name: string;
  property_address: string;
  monthly_rent: number;
  payment_day?: number;
  currency: Currency;
  premium: number;
  start_date: string;
  end_date: string;
  status: LeaseStatus;
  created_at: string;
  updated_at?: string;
  landlord_name?: string;
  tenant_name?: string;
  template_data?: {
    utilities_included?: string[];
    pets_allowed?: boolean;
    smoking_allowed?: boolean;
    notice_period_days?: number;
    additional_terms?: string;
  };
}

export interface LeaseEvent {
  id: number;
  lease_id: number;
  user_id: number;
  user_name: string;
  event_type: string;
  details: Record<string, any>;
  created_at: string;
}

export interface LeaseChangeRequest {
  id: number;
  lease_id: number;
  requested_by: number;
  requested_by_name: string;
  status: 'pending' | 'accepted' | 'rejected';
  requested_changes: Record<string, any>;
  message?: string;
  response_message?: string;
  created_at: string;
  updated_at?: string;
}

export interface LeaseSignature {
  id: number;
  lease_id: number;
  user_id: number;
  signature_data: string;
  signed_at: string;
  ip_address?: string;
  user_agent?: string;
}

export interface Payment {
  id: number;
  lease_id: number;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'late' | 'cancelled';
  created_at: string;
  updated_at?: string;
  property_name?: string;
  property_address?: string;
  currency?: Currency;
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

// Add Property types
interface Property {
  id: number;
  user_id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  size: number;
  is_furnished: boolean;
  amenities: string[];
  description: string;
  status: 'available' | 'rented' | 'maintenance' | 'archived';
  monthly_rent: number;
  currency: Currency;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  last4: string;
  expiry?: string;
  isDefault: boolean;
}

interface PaymentMethodCreateData {
  type: 'card' | 'bank';
  name: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

interface PaymentMethodUpdateData {
  name?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
}

// Create axios instance with base URL
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
  (response: AxiosResponse) => {
    return response;
  },
  (error: unknown) => {
    console.error('API Error:', error);
    if (axios.isAxiosError(error) && error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
    } else if (axios.isAxiosError(error) && error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error instanceof Error ? error.message : String(error));
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
  login: async (_credentials: LoginCredentials): Promise<{token: string; user?: User}> => {
    // We're now handling login directly in the Login component
    // This is just a stub to avoid breaking any code that might still call this
    console.log('Warning: authService.login is deprecated, use the Login component instead');
    throw new Error('Use direct fetch in Login component instead');
  },
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },
};

// User services
export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('/users/profile');
    return response.data;
  },
  
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await api.put<User>('/users/profile', profileData);
    return response.data;
  },
  
  uploadProfilePhoto: async (formData: FormData): Promise<User> => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    const response = await api.post<User>('/users/profile/photo', formData, config);
    return response.data;
  },
  
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    const response = await api.post('/users/change-password', data);
    return response.data;
  },
  
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get<PaymentMethod[]>('/users/payment-methods');
    return response.data;
  },
  
  addPaymentMethod: async (data: PaymentMethodCreateData): Promise<PaymentMethod> => {
    const response = await api.post<PaymentMethod>('/users/payment-methods', data);
    return response.data;
  },
  
  updatePaymentMethod: async (id: string, data: PaymentMethodUpdateData): Promise<PaymentMethod> => {
    const response = await api.put<PaymentMethod>(`/users/payment-methods/${id}`, data);
    return response.data;
  },
  
  removePaymentMethod: async (id: string): Promise<void> => {
    const response = await api.delete(`/users/payment-methods/${id}`);
    return response.data;
  },
  
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    const response = await api.patch<PaymentMethod>(`/users/payment-methods/${id}/default`);
    return response.data;
  },
  
  deleteAccount: async (): Promise<void> => {
    const response = await api.delete('/users/account');
    return response.data;
  },
  
  requestPersonalData: async (): Promise<void> => {
    const response = await api.post('/users/data/request');
    return response.data;
  },
  
  updateSettings: async (settingsData: any): Promise<void> => {
    const response = await api.put('/users/settings', settingsData);
    return response.data;
  },
  
  getPotentialTenants: async (): Promise<User[]> => {
    const response = await api.get('/api/users/potential-tenants');
    return response.data;
  }
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

  updateLease: async (id: number, leaseData: LeaseData): Promise<Lease> => {
    console.log('API: Updating lease with data:', leaseData);
    try {
      const response = await api.put<Lease>(`/leases/${id}`, leaseData);
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error.response?.data || error);
      throw error;
    }
  },

  updateLeaseStatus: async (id: number, status: LeaseStatus): Promise<Lease> => {
    const response = await api.put<Lease>(`/leases/${id}/status`, { status });
    return response.data;
  },
  
  // New methods for enhanced lease flow
  getLeaseEvents: async (id: number): Promise<LeaseEvent[]> => {
    const response = await api.get<LeaseEvent[]>(`/leases/${id}/events`);
    return response.data;
  },
  
  signLease: async (id: number, signatureData: string): Promise<Lease> => {
    const response = await api.post<Lease>(`/leases/${id}/sign`, { signature_data: signatureData });
    return response.data;
  },
  
  requestChanges: async (id: number, changes: Record<string, any>, message: string): Promise<LeaseChangeRequest> => {
    const response = await api.post<LeaseChangeRequest>(`/leases/${id}/request-changes`, { changes, message });
    return response.data;
  },
  
  getChangeRequests: async (id: number): Promise<LeaseChangeRequest[]> => {
    const response = await api.get<LeaseChangeRequest[]>(`/leases/${id}/change-requests`);
    return response.data;
  },
  
  respondToChangeRequest: async (
    id: number, 
    accepted: boolean, 
    message: string
  ): Promise<LeaseChangeRequest> => {
    const response = await api.put<LeaseChangeRequest>(`/leases/change-request/${id}`, { 
      accepted, 
      message 
    });
    return response.data;
  },

  // Add the updateTenantInfo method
  updateTenantInfo: async (
    id: number,
    tenantInfo: {
      fullName: string;
      tcId: string;
      email: string;
      phone: string;
    }
  ): Promise<Lease> => {
    const response = await api.post<Lease>(`/leases/${id}/tenant-info`, tenantInfo);
    return response.data;
  },

  // Delete a lease by reference code
  deleteLease: async (refCode: string) => {
    try {
      const response = await api.delete(`/leases/ref/${refCode}`);
      return response.data;
    } catch (error) {
      console.error('API Error when deleting lease:', error);
      throw error;
    }
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

// Add property service
export const propertyService = {
  getUserProperties: async (): Promise<Property[]> => {
    const response = await api.get('/api/properties');
    return response.data;
  },
  
  getProperty: async (id: number): Promise<Property> => {
    const response = await api.get(`/api/properties/${id}`);
    return response.data;
  },
  
  createProperty: async (propertyData: Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Property> => {
    const response = await api.post('/api/properties', propertyData);
    return response.data;
  },
  
  updateProperty: async (id: number, propertyData: Partial<Property>): Promise<Property> => {
    const response = await api.put(`/api/properties/${id}`, propertyData);
    return response.data;
  },
  
  deleteProperty: async (id: number): Promise<void> => {
    await api.delete(`/api/properties/${id}`);
  }
};

export default api; 