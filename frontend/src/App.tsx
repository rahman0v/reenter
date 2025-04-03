import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Features from './components/Features';
import Plans from './components/Plans';
import HowItWorks from './components/HowItWorks';
import Partners from './components/Partners';
import Contact from './components/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Company from './pages/Company';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Leases from './pages/Leases';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const [isReady, setIsReady] = useState(false);
  
  // Wait for authentication to be checked before rendering
  useEffect(() => {
    console.log('Protected route - Auth check in progress...');
    const checkAuth = setTimeout(() => {
      console.log('Protected route final check - Auth state:', { 
        isAuthenticated, 
        currentUser: currentUser?.email
      });
      setIsReady(true);
    }, 100);
    
    return () => clearTimeout(checkAuth);
  }, [isAuthenticated, currentUser]);
  
  if (!isReady) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // User is authenticated and has correct permissions
  console.log('Route access granted for:', currentUser?.email);
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/company" element={<Company />} />
              <Route path="/features" element={<Features />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/leases" element={<ProtectedRoute><Leases /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
