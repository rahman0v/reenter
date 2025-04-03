import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LockClosedIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { authService } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formTouched, setFormTouched] = useState({
    email: false,
    password: false
  });
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email === '';

  const handleBlur = (field: 'email' | 'password') => {
    setFormTouched({ ...formTouched, [field]: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setFormTouched({
      email: true,
      password: true
    });
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      
      // Log the attempt with credentials (but not password)
      console.log('Login attempt:', { email, timestamp: new Date().toISOString() });
      
      // Try a direct fetch call to test connectivity
      try {
        console.log('Attempting direct fetch to http://localhost:5000/api/auth/login...');
        const testResponse = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        console.log('Raw fetch response:', { 
          status: testResponse.status, 
          statusText: testResponse.statusText,
          headers: Object.fromEntries([...testResponse.headers])
        });
        
        if (!testResponse.ok) {
          let errorText = '';
          try {
            errorText = await testResponse.text();
          } catch (readError) {
            errorText = 'Could not read error response';
          }
          console.error('Fetch error response:', errorText);
          throw new Error(`Server responded with ${testResponse.status}: ${errorText}`);
        }
        
        let data;
        try {
          data = await testResponse.json();
          console.log('Fetch login successful, creating user object');
          
          // Create a user object from the token data
          // Since we don't have user details from regular login, we'll create minimal data
          const user = {
            id: 0, // We don't know the ID
            email: email,
            name: email.split('@')[0], // Use part of email as display name
            role: 'user',
            is_active: true,
            created_at: new Date().toISOString(),
            verifications: {
              email: true,
              phone: false,
              identity: false
            },
            bio: '',
            photo_url: '',
            phone: '',
            updated_at: ''
          };
          
          // Use context login to update global auth state
          login(data.token, user);
          
          console.log('Login successful, redirecting');
          setTimeout(() => {
            navigate('/dashboard');
          }, 100);
          
          return;
        } catch (jsonError) {
          console.error('Error parsing JSON response:', jsonError);
          throw new Error('Invalid JSON response from server');
        }
      } catch (fetchError: any) {
        console.error('Direct fetch login failed:', fetchError);
        setError(fetchError.message || 'Login failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formTouched.email && (!email || !isEmailValid) ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="you@example.com"
              />
              {formTouched.email && !email && (
                <p className="mt-1 text-xs text-red-600">Email address is required</p>
              )}
              {formTouched.email && email && !isEmailValid && (
                <p className="mt-1 text-xs text-red-600">Please enter a valid email address</p>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark underline">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    formTouched.password && !password ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formTouched.password && !password && (
                <p className="mt-1 text-xs text-red-600">Password is required</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-2" />
            <p className="text-xs text-gray-600">
              Secure login. Your information is protected with industry-standard encryption.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              ) : (
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  <LockClosedIcon className="h-5 w-5 text-primary-dark group-hover:text-primary-light" />
                </span>
              )}
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 