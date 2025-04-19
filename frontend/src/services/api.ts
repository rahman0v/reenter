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
  avatar?: string;
  role: 'tenant' | 'landlord' | 'admin';
  preferred_name?: string;
  address?: string;
  emergency_contact?: string;
  education_status?: string;
  employment_status?: string;
  date_of_birth?: string;
  trust_score?: number;
  trust_badge?: boolean;
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
    total_reviews?: number;
    as_landlord: {
      average: number;
      count: number;
    };
    as_tenant: {
      average: number;
      count: number;
    };
  };
  subscription?: {
    plan: string;
    features?: string[];
    next_billing_date?: string;
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
  payment_day?: number;
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
    const response = await api.get('/users/profile');
    return response.data as User;
  },
  
  updateProfile: async (profileData: Partial<User>): Promise<User> => {
    const response = await api.put('/users/profile', profileData);
    return response.data as User;
  },
  
  getPublicProfile: async (userId: number): Promise<User> => {
    const response = await api.get(`/users/${userId}/public`);
    return response.data as User;
  },
  
  uploadProfilePhoto: async (formData: FormData): Promise<{ url: string }> => {
    const response = await api.post('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  verifyEmail: async (): Promise<{ message: string }> => {
    const response = await api.post('/users/verify/email');
    return response.data;
  },
  
  verifyPhone: async (code: string): Promise<{ message: string }> => {
    const response = await api.post('/users/verify/phone', { code });
    return response.data;
  },
  
  verifyID: async (formData: FormData): Promise<{ message: string }> => {
    const response = await api.post('/users/verify/id', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  verifyBankAccount: async (accountData: any): Promise<{ message: string }> => {
    const response = await api.post('/users/verify/bank', accountData);
    return response.data;
  },
  
  updatePassword: async (passwordData: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.post('/users/change-password', passwordData);
    return response.data;
  },
  
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get('/users/payment-methods');
    return response.data as PaymentMethod[];
  },
  
  addPaymentMethod: async (paymentMethodData: PaymentMethodCreateData): Promise<PaymentMethod> => {
    const response = await api.post('/users/payment-methods', paymentMethodData);
    return response.data as PaymentMethod;
  },
  
  updatePaymentMethod: async (id: string, updateData: PaymentMethodUpdateData): Promise<PaymentMethod> => {
    const response = await api.put(`/users/payment-methods/${id}`, updateData);
    return response.data as PaymentMethod;
  },
  
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    const response = await api.patch(`/users/payment-methods/${id}/default`);
    return response.data as PaymentMethod;
  },
  
  deletePaymentMethod: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/payment-methods/${id}`);
    return response.data;
  },
  
  connectSocialAccount: async (platform: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post(`/users/connect/${platform}`);
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
  },
};

// Lease services
export const leaseService = {
  createLease: async (leaseData: LeaseData): Promise<Lease> => {
    console.log('API: Creating lease with data:', leaseData);
    try {
      // Ensure payment_day is always set, defaulting to 10th if not provided
      const leaseDataWithPaymentDay = {
        ...leaseData,
        payment_day: leaseData.payment_day || 10
      };
      
      console.log('API: Creating lease with payment_day:', leaseDataWithPaymentDay.payment_day);
      const response = await api.post<Lease>('/leases', leaseDataWithPaymentDay);
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
    try {
      const response = await api.get<Lease[]>('/leases');
      
      // Debug lease payment_day fields
      response.data.forEach(lease => {
        console.log(`Lease API data: ${lease.id} - ${lease.property_name}, payment_day = ${lease.payment_day || 'not set - this should be explicitly defined'}`);
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching leases:', error);
      throw error;
    }
  },

  getLeaseById: async (id: number): Promise<Lease> => {
    const response = await api.get<Lease>(`/leases/${id}`);
    return response.data;
  },

  updateLease: async (id: number, leaseData: LeaseData): Promise<Lease> => {
    console.log('API: Updating lease with data:', leaseData);
    try {
      // Ensure payment_day is always set, defaulting to 10th if not provided
      const leaseDataWithPaymentDay = {
        ...leaseData,
        payment_day: leaseData.payment_day || 10
      };
      
      console.log('API: Updating lease with payment_day:', leaseDataWithPaymentDay.payment_day);
      const response = await api.put<Lease>(`/leases/${id}`, leaseDataWithPaymentDay);
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
    console.log("📊 Diagnostics: Fetching all payments...");
    try {
      const response = await api.get<Payment[]>('/payments');
      console.log("📊 Diagnostics: Payments received:", response.data);
      
      // Detailed logging of each payment
      response.data.forEach(payment => {
        console.log(`📊 Payment ID: ${payment.id}, Amount: ${payment.amount}, Type: ${typeof payment.amount}`);
        console.log(`   Due Date: ${payment.due_date}, Status: ${payment.status}`);
        
        // Calculate if this should be a future payment
        const dueDate = new Date(payment.due_date);
        const now = new Date();
        console.log(`   Is Future Payment: ${dueDate > now}, Due: ${dueDate.toISOString()}, Now: ${now.toISOString()}`);
      });
      
      return response.data;
    } catch (error) {
      console.error("📊 Diagnostics: Error fetching payments:", error);
      throw error;
    }
  },
  getLeasePayments: async (leaseId: number): Promise<Payment[]> => {
    console.log(`📊 Diagnostics: Fetching payments for lease ${leaseId}...`);
    try {
      const response = await api.get<Payment[]>(`/payments/lease/${leaseId}`);
      console.log(`📊 Diagnostics: Payments for lease ${leaseId} received:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`📊 Diagnostics: Error fetching payments for lease ${leaseId}:`, error);
      throw error;
    }
  },
  createPayment: async (paymentData: PaymentData): Promise<Payment> => {
    console.log("📊 Diagnostics: Creating payment:", paymentData);
    try {
      const response = await api.post<Payment>('/payments', paymentData);
      console.log("📊 Diagnostics: Payment created:", response.data);
      return response.data;
    } catch (error) {
      console.error("📊 Diagnostics: Error creating payment:", error);
      throw error;
    }
  },
  updatePaymentStatus: async (id: number, status: Payment['status']): Promise<Payment> => {
    console.log(`📊 Diagnostics: Updating payment ${id} status to ${status}...`);
    try {
      const response = await api.put<Payment>(`/payments/${id}/status`, { status });
      console.log(`📊 Diagnostics: Payment ${id} status updated:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`📊 Diagnostics: Error updating payment ${id} status:`, error);
      throw error;
    }
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

// Debug Utilities for Application Diagnostics
export const DiagnosticsUtil = {
  analyzePaymentData: (payment: Payment): void => {
    console.group(`🔍 Payment Analysis: ID ${payment.id}`);
    
    // Check payment data types
    console.log('Amount:', {
      value: payment.amount,
      type: typeof payment.amount,
      isNumeric: !isNaN(Number(payment.amount))
    });
    
    // Analyze dates
    try {
      const dueDate = new Date(payment.due_date);
      const now = new Date();
      console.log('Date Analysis:', {
        original: payment.due_date,
        parsed: dueDate.toISOString(),
        valid: !isNaN(dueDate.getTime()),
        isFuture: dueDate > now,
        timeDifference: dueDate.getTime() - now.getTime(),
        daysFromNow: Math.round((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      });
    } catch (error) {
      console.error('Date Parsing Error:', error);
    }
    
    // Analyze status
    console.log('Status:', {
      value: payment.status,
      isPending: payment.status === 'pending',
      isPaid: payment.status === 'paid'
    });
    
    // Lease relationship
    console.log('Lease:', {
      id: payment.lease_id,
      propertyName: payment.property_name || 'Not loaded',
      currency: payment.currency || 'Not specified'
    });
    
    console.groupEnd();
  },
  
  analyzeLeaseData: (lease: Lease): void => {
    console.group(`🔍 Lease Analysis: ID ${lease.id}`);
    
    // Basic lease info
    console.log('Basic Info:', {
      refCode: lease.ref_code,
      status: lease.status,
      property: lease.property_name
    });
    
    // Check payment structure
    const monthlyRent = typeof lease.monthly_rent === 'string'
      ? parseFloat(lease.monthly_rent)
      : lease.monthly_rent;
      
    const premium = typeof lease.premium === 'string'
      ? parseFloat(lease.premium)
      : lease.premium;
    
    const expectedPremium = monthlyRent * 0.085;
    
    console.log('Payment Structure:', {
      monthlyRent: {
        value: monthlyRent,
        type: typeof lease.monthly_rent
      },
      premium: {
        value: premium,
        type: typeof lease.premium
      },
      expectedPremium: expectedPremium,
      premiumDiscrepancy: premium - expectedPremium,
      totalPayment: monthlyRent + premium,
      expectedTotal: monthlyRent + expectedPremium,
      currency: lease.currency
    });
    
    // Date analysis
    try {
      const startDate = new Date(lease.start_date);
      const endDate = new Date(lease.end_date);
      const now = new Date();
      
      console.log('Date Analysis:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        durationMonths: Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)),
        isActive: startDate <= now && endDate >= now
      });
    } catch (error) {
      console.error('Date Parsing Error:', error);
    }
    
    console.groupEnd();
  },
  
  analyzeDashboardData: (payments: Payment[], leases: Lease[]): void => {
    console.group('🧪 Dashboard Data Analysis');
    
    // Payment statistics
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const futurePayments = payments.filter(p => {
      try {
        return new Date(p.due_date) > new Date();
      } catch (e) {
        return false;
      }
    });
    
    console.log('Payment Statistics:', {
      total: payments.length,
      pending: pendingPayments.length,
      future: futurePayments.length,
      futurePending: futurePayments.filter(p => p.status === 'pending').length
    });
    
    // Check for April 2025 payments specifically
    const april2025Payments = payments.filter(p => {
      try {
        const date = new Date(p.due_date);
        return date.getMonth() === 3 && date.getFullYear() === 2025;
      } catch (e) {
        return false;
      }
    });
    
    console.log('April 2025 Payments:', april2025Payments);
    
    // Monthly data distribution
    const paymentsByMonth = Array(12).fill(0).map(() => ({
      past: 0,
      future: 0,
      count: 0
    }));
    
    payments.forEach(payment => {
      try {
        const date = new Date(payment.due_date);
        const month = date.getMonth();
        const isFuture = date > new Date();
        
        paymentsByMonth[month].count++;
        
        if (isFuture && payment.status === 'pending') {
          paymentsByMonth[month].future += Number(payment.amount);
        } else {
          paymentsByMonth[month].past += Number(payment.amount);
        }
      } catch (e) {
        console.error('Error processing payment for monthly distribution:', e);
      }
    });
    
    console.log('Monthly Distribution:', paymentsByMonth);
    
    console.groupEnd();
  }
};

// Add rating service
export const ratingService = {
  getUserRatings: async (userId: number): Promise<any> => {
    const response = await api.get(`/api/ratings/user/${userId}`);
    return response.data;
  },
  
  getLeaseRatings: async (leaseId: number): Promise<any> => {
    const response = await api.get(`/api/ratings/lease/${leaseId}`);
    return response.data;
  },
  
  getRating: async (id: number): Promise<any> => {
    const response = await api.get(`/api/ratings/${id}`);
    return response.data;
  },
  
  createRating: async (ratingData: {
    reviewed_id: number;
    lease_id: number;
    rating: number;
    comment?: string;
    role: 'landlord' | 'tenant';
  }): Promise<any> => {
    const response = await api.post('/api/ratings', ratingData);
    return response.data;
  },
  
  updateRating: async (id: number, updateData: {
    rating?: number;
    comment?: string;
  }): Promise<any> => {
    const response = await api.put(`/api/ratings/${id}`, updateData);
    return response.data;
  },
  
  deleteRating: async (id: number): Promise<void> => {
    await api.delete(`/api/ratings/${id}`);
  }
};

export default api; 