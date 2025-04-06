import React, { createContext, useContext, useState, useEffect } from 'react';

// Feature flags from environment
const isDemoMode = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true';

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  photo_url?: string;
  bio?: string;
  preferred_name?: string;
  address?: string;
  emergency_contact?: string;
  education_status?: string;
  employment_status?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at?: string;
}

// Registration data interface
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

// Login credentials interface
export interface LoginCredentials {
  email: string;
  password: string;
}

// Auth context interface
interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

// Create the context with undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Determine API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 
                (window.location.hostname === 'localhost' 
                 ? 'http://localhost:5000/api'
                 : '/api');

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize auth state from local storage on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Get user data from storage first for immediate UI update
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          try {
            const userData = JSON.parse(storedUserData);
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } catch (err) {
            localStorage.removeItem('userData');
          }
        }

        // Then validate token with server
        await fetchUserProfile(token);
      } catch (error) {
        // Clear invalid auth data
        handleAuthError(error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle authentication errors consistently
  const handleAuthError = (error: any) => {
    // Clear stored auth data
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Set error message
    const errorMessage = 
      error?.response?.data?.message || 
      error?.message || 
      'An authentication error occurred';
    
    setAuthError(errorMessage);
    
    // Log in development only
    if (import.meta.env.DEV) {
      console.error('Auth error:', error);
    }
  };

  // Fetch user profile from the server
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await response.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        // Update stored user data
        localStorage.setItem('userData', JSON.stringify(data.user));
      } else {
        throw new Error(data.message || 'Invalid user data');
      }
    } catch (error) {
      handleAuthError(error);
      throw error;
    }
  };

  // Register new user
  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: responseData.message || 'Registration failed'
        };
      }

      // Save token and user data
      localStorage.setItem('token', responseData.token);
      localStorage.setItem('userData', JSON.stringify(responseData.user));
      
      // Update state
      setCurrentUser(responseData.user);
      setIsAuthenticated(true);
      
      return {
        success: true,
        message: 'Registration successful'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Login user
  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      
      // Special handling for demo mode
      if (isDemoMode && credentials.email === 'demo@reenter.com') {
        // In demo mode, allow special login without server call
        const demoLoginResponse = await fetch(`${API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(credentials)
        });
        
        const demoData = await demoLoginResponse.json();
        
        if (demoData.success) {
          localStorage.setItem('token', demoData.token);
          localStorage.setItem('userData', JSON.stringify(demoData.user));
          setCurrentUser(demoData.user);
          setIsAuthenticated(true);
          return { success: true, message: 'Demo login successful' };
        }
      }
      
      // Normal login flow
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }

      if (!data.token) {
        return {
          success: false,
          message: 'Authentication error: No token received'
        };
      }

      if (!data.user) {
        return {
          success: false,
          message: 'Authentication error: No user data received'
        };
      }

      // Save token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      // Update state
      setCurrentUser(data.user);
      setIsAuthenticated(true);
      
      return {
        success: true,
        message: 'Login successful'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Provide the auth context
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};