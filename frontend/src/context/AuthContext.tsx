import React, { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/api';

// Define User interface locally
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  verifications: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  created_at: string;
  updated_at: string;
  phone: string;
  photo_url: string;
  bio: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Effect to synchronize isAuthenticated with currentUser
  useEffect(() => {
    // If currentUser exists, ensure isAuthenticated is true
    if (currentUser) {
      console.log('User exists, setting isAuthenticated to true');
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  useEffect(() => {
    console.log('AuthContext initializing...');
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found, not authenticated');
      setCurrentUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    
    console.log('Token found, checking for stored user data');
    
    // If we already have user data in localStorage, use it first for immediate UI update
    try {
      const storedUser = localStorage.getItem('userData');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        console.log('Using stored user data:', userData.email);
        // Use type assertion to avoid TypeScript errors
        setCurrentUser(userData as User);
        setIsAuthenticated(true);
        setLoading(false);
        return; // Skip profile fetching if we have stored user data
      }
    } catch (e) {
      console.error('Error parsing stored user data:', e);
    }
    
    // Fetch the profile
    console.log('Fetching user profile...');
    userService.getProfile()
      .then(user => {
        console.log('Profile fetched successfully:', user.email);
        // Convert to User type
        const userData: User = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: 'user',
          is_active: true,
          verifications: {
            email: user.verifications?.email || false,
            phone: user.verifications?.phone || false,
            identity: user.verifications?.id || false
          },
          created_at: user.created_at,
          updated_at: user.updated_at || '',
          phone: user.phone || '',
          photo_url: user.photo_url || '',
          bio: user.bio || ''
        };
        
        // Save the user data to localStorage for future use
        localStorage.setItem('userData', JSON.stringify(userData));
        
        setCurrentUser(userData);
        setIsAuthenticated(true);
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setCurrentUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (token: string, user: User) => {
    console.log('Login called with token and user:', user.email);
    localStorage.setItem('token', token);
    localStorage.setItem('userData', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated }}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 