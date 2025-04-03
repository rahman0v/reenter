import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LockClosedIcon, ShieldCheckIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

interface FormTouched {
  name: boolean;
  email: boolean;
  phone: boolean;
  password: boolean;
  confirmPassword: boolean;
}

interface PasswordStrength {
  length: boolean;
  hasLowerCase: boolean;
  hasUpperCase: boolean;
  hasNumber: boolean;
}

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formTouched, setFormTouched] = useState<FormTouched>({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    length: false,
    hasLowerCase: false,
    hasUpperCase: false,
    hasNumber: false,
  });
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Check password strength
  useEffect(() => {
    setPasswordStrength({
      length: password.length >= 8,
      hasLowerCase: /[a-z]/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    });
  }, [password]);

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
  const isPhoneValid = /^\+?[0-9]{10,15}$/.test(phone) || phone === '';
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email === '';
  const doPasswordsMatch = password === confirmPassword;

  const handleBlur = (field: keyof FormTouched) => {
    setFormTouched({ ...formTouched, [field]: true });
  };

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0 && !value.startsWith('+')) {
      value = value.substring(0, 15);
    }
    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation
    const allTouched: FormTouched = {
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true
    };
    setFormTouched(allTouched);
    
    // Validate form
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!isPasswordStrong) {
      setError('Password does not meet security requirements');
      return;
    }

    if (!isPhoneValid) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!isEmailValid) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      
      const success = await register({
        name,
        email,
        password,
        phone
      });
      
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Create an account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-6">
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formTouched.name && !name ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="John Doe"
              />
              {formTouched.name && !name && (
                <p className="mt-1 text-xs text-red-600">Full name is required</p>
              )}
            </div>
            
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                onBlur={() => handleBlur('phone')}
                className={`appearance-none relative block w-full px-3 py-2 border ${
                  formTouched.phone && (!phone || !isPhoneValid) ? 'border-red-300' : 'border-gray-300'
                } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                placeholder="e.g., 5551234567"
              />
              {formTouched.phone && !phone && (
                <p className="mt-1 text-xs text-red-600">Phone number is required</p>
              )}
              {formTouched.phone && phone && !isPhoneValid && (
                <p className="mt-1 text-xs text-red-600">Please enter a valid phone number</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Format: 10-15 digits, numbers only</p>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    formTouched.password && (!password || !isPasswordStrong) ? 'border-red-300' : 'border-gray-300'
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
              
              {/* Password strength requirements */}
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-700">Password requirements:</p>
                <ul className="text-xs space-y-1 pl-4">
                  <li className={passwordStrength.length ? "text-green-600" : "text-gray-500"}>
                    {passwordStrength.length ? "✓" : "○"} At least 8 characters
                  </li>
                  <li className={passwordStrength.hasUpperCase ? "text-green-600" : "text-gray-500"}>
                    {passwordStrength.hasUpperCase ? "✓" : "○"} At least one uppercase letter
                  </li>
                  <li className={passwordStrength.hasLowerCase ? "text-green-600" : "text-gray-500"}>
                    {passwordStrength.hasLowerCase ? "✓" : "○"} At least one lowercase letter
                  </li>
                  <li className={passwordStrength.hasNumber ? "text-green-600" : "text-gray-500"}>
                    {passwordStrength.hasNumber ? "✓" : "○"} At least one number
                  </li>
                </ul>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`appearance-none relative block w-full px-3 py-2 border ${
                    formTouched.confirmPassword && (!confirmPassword || !doPasswordsMatch) ? 'border-red-300' : 'border-gray-300'
                  } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formTouched.confirmPassword && !confirmPassword && (
                <p className="mt-1 text-xs text-red-600">Please confirm your password</p>
              )}
              {formTouched.confirmPassword && confirmPassword && !doPasswordsMatch && (
                <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mt-6">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I agree to the 
                </label>
                <span className="text-gray-500">
                  {' '}
                  <a href="#" className="font-medium text-primary hover:text-primary-dark">
                    Terms of Service
                  </a>
                  {' and '}
                  <a href="#" className="font-medium text-primary hover:text-primary-dark">
                    Privacy Policy
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 text-green-500 mr-2" />
            <p className="text-xs text-gray-600">
              Your personal information is secure. We use industry-standard encryption to protect your data.
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
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 