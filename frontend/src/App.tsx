import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Features from './components/Features';
import Plans from './components/Plans';
import Partners from './components/Partners';
import Contact from './components/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Company from './pages/Company';
import ScrollToTop from './components/ScrollToTop';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Leases from './pages/Leases';
import LeaseDetail from './pages/LeaseDetail';
import CreateLease from './pages/CreateLease';
import Payments from './pages/Payments';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
// Import pages
import Blog from './pages/Blog';
import Career from './pages/Career';
import Legal from './pages/Legal';
import HowItWorks from './components/HowItWorks';
import CookieConsent from './components/CookieConsent';
import ReviewsPage from './pages/ReviewsPage';
import PublicProfile from './pages/PublicProfile';
import Support from './pages/Support';
import { updateSunriseApartmentPaymentDay } from './data/updateLeaseData';

export default function App() {
  // Call the function to update Sunrise Apartment payment day
  // This will run once when the app initializes
  useEffect(() => {
    // Fix the Sunrise Apartment payment day
    updateSunriseApartmentPaymentDay()
      .then(() => console.log('Sunrise Apartment payment day update attempt completed'))
      .catch(error => console.error('Failed to update Sunrise Apartment payment day:', error));
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="pt-16">
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
              
              {/* Content pages */}
              <Route path="/blog" element={<Blog />} />
              <Route path="/career" element={<Career />} />
              <Route path="/legal" element={<Legal />} />
              
              {/* Protected routes - require authentication */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/leases" element={<ProtectedRoute><Leases /></ProtectedRoute>} />
              <Route path="/leases/create" element={<ProtectedRoute><CreateLease /></ProtectedRoute>} />
              <Route path="/leases/:id" element={<ProtectedRoute><LeaseDetail /></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/profile/reviews" element={<ReviewsPage />} />
              <Route path="/profile/reviews/:userId" element={<ReviewsPage />} />
              <Route path="/users/:userId" element={<ProtectedRoute><PublicProfile /></ProtectedRoute>} />
              
              {/* Support routes */}
              <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              <Route path="/support/new" element={<ProtectedRoute><Support isNewTicket={true} /></ProtectedRoute>} />
              <Route path="/support/:id" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
          <Footer />
          <CookieConsent />
        </div>
      </Router>
    </AuthProvider>
  );
}
