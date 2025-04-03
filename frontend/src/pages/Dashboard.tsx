import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  UserCircleIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  LinkIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  CalendarIcon,
  BellIcon,
  Cog6ToothIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  PhotoIcon,
  ChartBarSquareIcon,
  BanknotesIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { leaseService, paymentService, notificationService, userService } from '../services/api';
import { Lease, Payment, Notification, User } from '../services/api';

interface ProfileCompleteness {
  email: boolean;
  phone: boolean;
  bio: boolean;
  socialLinks: boolean;
  documents: boolean;
  profilePhoto: boolean;
  bankInfo: boolean;
}

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [profileCompleteness, setProfileCompleteness] = useState<ProfileCompleteness>({
    email: true, // Set to true by default since email is required for registration
    phone: false,
    bio: false,
    socialLinks: false,
    documents: false,
    profilePhoto: false,
    bankInfo: false
  });

  const [leases, setLeases] = useState<Lease[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);

  const location = useLocation();
  const currentPath = location.pathname;

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch user profile
        const userData = await userService.getProfile();
        setUserProfile(userData);
        
        // Update profile completeness based on user data
        setProfileCompleteness({
          email: !!userData.email,
          phone: !!userData.phone,
          bio: !!userData.bio,
          socialLinks: false, // This would need to be determined based on social connections
          documents: false, // This would need to be determined based on uploaded documents
          profilePhoto: !!userData.photo_url,
          bankInfo: false // This would need to be determined based on payment methods
        });
        
        // Fetch leases
        const leasesData = await leaseService.getAllLeases();
        setLeases(leasesData);
        
        // Fetch payments
        const paymentsData = await paymentService.getAllPayments();
        setPayments(paymentsData);
        
        // Fetch notifications
        const notificationsData = await notificationService.getAllNotifications();
        setNotifications(notificationsData);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        if (err.response) {
          // Handle specific API error responses
          switch (err.response.status) {
            case 401:
              setError('Your session has expired. Please log in again.');
              break;
            case 403:
              setError('You do not have permission to access this data.');
              break;
            case 404:
              setError('Some data could not be found. Please try again later.');
              break;
            case 500:
              setError('Server error. Please try again later.');
              break;
            default:
              setError(err.response.data?.message || 'Failed to load dashboard data. Please try again later.');
          }
        } else if (err.request) {
          // Handle network errors
          setError('Network error. Please check your internet connection.');
        } else {
          // Handle other errors
          setError('An unexpected error occurred. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate profile completeness percentage
  const completenessItems = Object.values(profileCompleteness);
  const completedItems = completenessItems.filter(Boolean).length;
  const completenessPercentage = Math.round((completedItems / completenessItems.length) * 100);
  const isProfileComplete = completenessPercentage === 100;

  // Get trust score based on completeness
  const getTrustScore = () => {
    if (completenessPercentage < 25) return 'Incomplete';
    if (completenessPercentage < 50) return 'Basic';
    if (completenessPercentage < 75) return 'Verified';
    return 'Trusted';
  };

  // Get trust score color
  const getTrustScoreColor = () => {
    switch (getTrustScore()) {
      case 'Incomplete':
        return 'bg-red-100 text-red-800';
      case 'Basic':
        return 'bg-yellow-100 text-yellow-800';
      case 'Verified':
        return 'bg-blue-100 text-blue-800';
      case 'Trusted':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format currency for display
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  // Get next payment due
  const getNextPaymentDue = () => {
    const pendingPayments = payments.filter(payment => payment.status === 'pending');
    if (pendingPayments.length === 0) return 'No payments due';
    
    // Sort by due date (ascending)
    pendingPayments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    return formatDate(pendingPayments[0].due_date);
  };

  // Calculate total monthly rent
  const calculateTotalMonthlyRent = () => {
    return leases
      .filter(lease => lease.status === 'active')
      .reduce((sum, lease) => sum + lease.monthly_rent, 0);
  };

  // Calculate outstanding payments
  const calculateOutstandingPayments = () => {
    return payments
      .filter(payment => payment.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  // Refresh data
  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch leases
      const leasesData = await leaseService.getAllLeases();
      setLeases(leasesData);
      
      // Fetch payments
      const paymentsData = await paymentService.getAllPayments();
      setPayments(paymentsData);
      
      // Fetch notifications
      const notificationsData = await notificationService.getAllNotifications();
      setNotifications(notificationsData);
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
      setError('Failed to refresh data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading component for consistent loading states
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-4">
      <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  // Error component for consistent error display
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
      <XCircleIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );

  // Empty state component for consistent empty state display
  const EmptyState = ({ message }: { message: string }) => (
    <div className="p-6 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {userProfile?.name || currentUser?.name || 'User'}!</h1>
                <p className="mt-1 text-sm text-gray-500">Here's what's happening with your account today.</p>
              </div>
              <button 
                onClick={refreshData}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                disabled={isLoading}
              >
                <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} />}

        {/* Overview Cards */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Active Leases */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Active Leases</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {isLoading ? (
                          <LoadingSpinner />
                        ) : (
                          leases.filter(lease => lease.status === 'active').length || 0
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Monthly Rent */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Monthly Rent</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {isLoading ? (
                          <LoadingSpinner />
                        ) : (
                          formatCurrency(calculateTotalMonthlyRent())
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Outstanding Payments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CreditCardIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Outstanding Payments</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {isLoading ? (
                          <LoadingSpinner />
                        ) : (
                          formatCurrency(calculateOutstandingPayments())
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>

            {/* Next Payment Due */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-600 truncate">Next Payment Due</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {isLoading ? (
                          <LoadingSpinner />
                        ) : (
                          getNextPaymentDue()
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Strength Card */}
        {!isProfileComplete && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Account Strength</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Complete your profile to increase credibility with tenants and landlords.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-sm text-gray-900">{completenessPercentage}%</span>
                    <div className="ml-3 h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out" 
                        style={{ width: `${completenessPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-start">
                    {profileCompleteness.email ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-300 mt-0.5" />
                    )}
                    <span className="ml-2 text-sm text-gray-700">Email Verified</span>
                  </div>
                  <div className="flex items-start">
                    {profileCompleteness.phone ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-300 mt-0.5" />
                    )}
                    <span className="ml-2 text-sm text-gray-700">Phone Number Added</span>
                  </div>
                  <div className="flex items-start">
                    {profileCompleteness.bio ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-300 mt-0.5" />
                    )}
                    <span className="ml-2 text-sm text-gray-700">Add a Profile Bio</span>
                  </div>
                  <div className="flex items-start">
                    {profileCompleteness.socialLinks ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-300 mt-0.5" />
                    )}
                    <span className="ml-2 text-sm text-gray-700">Link a Social Account</span>
                  </div>
                  <div className="flex items-start">
                    {profileCompleteness.profilePhoto ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-300 mt-0.5" />
                    )}
                    <span className="ml-2 text-sm text-gray-700">Profile Photo Uploaded</span>
                  </div>
                  <div className="flex items-start">
                    {profileCompleteness.bankInfo ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-300 mt-0.5" />
                    )}
                    <span className="ml-2 text-sm text-gray-700">Confirm IBAN / Register Credit Card</span>
                  </div>
                </div>
                <p className="mt-5 text-sm text-gray-500">
                  Improve your trust score to unlock more features.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50">
                <Link
                  to="/profile"
                  className="flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                >
                  Complete Now <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Leases */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Recent Leases</h3>
              <Link to="/leases" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <LoadingSpinner />
              ) : leases.length > 0 ? (
                leases.slice(0, 3).map((lease) => (
                  <div key={lease.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="ml-3 text-sm font-medium text-gray-900">{lease.property_name}</p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          lease.status === 'active' ? 'bg-green-100 text-green-800' :
                          lease.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                        </span>
                        <ChevronRightIcon className="ml-2 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-4 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <UserGroupIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {lease.tenant_name || 'No tenant assigned'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <p>
                          {formatDate(lease.start_date)} - {formatDate(lease.end_date)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No leases found" />
              )}
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Recent Payments</h3>
              <Link to="/payments" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <LoadingSpinner />
              ) : payments.length > 0 ? (
                payments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <CreditCardIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="ml-3 text-sm font-medium text-gray-900">
                          {payment.property_address || 'Property Payment'}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          Due: {formatDate(payment.due_date)}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <CurrencyDollarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <p>
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No payments found" />
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {isLoading ? (
                <LoadingSpinner />
              ) : notifications.length > 0 ? (
                notifications.slice(0, 3).map((notification) => (
                  <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <BellIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="ml-3 text-sm text-gray-900">{notification.message}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500">{formatDate(notification.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="No notifications" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 