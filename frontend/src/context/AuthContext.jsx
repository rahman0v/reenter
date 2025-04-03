import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

// Create a context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to register a new user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      await fetchCurrentUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // Function to log in a user
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await authService.login(credentials);
      localStorage.setItem('token', response.token);
      await fetchCurrentUser();
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  // Function to log out a user
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Function to fetch the current user's information
  const fetchCurrentUser = async () => {
    if (!localStorage.getItem('token')) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getCurrentUser();
      setCurrentUser(userData);
    } catch (err) {
      console.error('Error fetching user:', err);
      localStorage.removeItem('token');
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch user on mount or token change
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Value object to be provided to consumers
  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    fetchCurrentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 