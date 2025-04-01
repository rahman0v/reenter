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
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
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
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Catch all route - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}
