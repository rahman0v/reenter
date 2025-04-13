import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { 
  UserIcon, 
  StarIcon, 
  ShieldCheckIcon,
  SparklesIcon, 
  CreditCardIcon,
  BuildingOfficeIcon,
  BellIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ClockIcon,
  ExclamationCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { userService, leaseService, paymentService, notificationService } from '../services/api';
import type { User, Lease, Payment, Notification } from '../services/api';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Helper functions
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getRelativeTime = (timestamp: string) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHour < 24) return `${diffHour} hours ago`;
  if (diffDay < 7) return `${diffDay} days ago`;
  
  return formatDate(timestamp);
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [role, setRole] = useState<'landlord' | 'tenant'>('landlord');
  const [isLoading, setIsLoading] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'TRY' | 'USD' | 'EUR'>('TRY');
  const [diagnosticsMode, setDiagnosticsMode] = useState(false);
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const navigate = useNavigate();

  // Currency conversion rates (simplified example rates)
  const currencyRates = {
    TRY: 1,
    USD: 0.031, // 1 TRY = 0.031 USD
    EUR: 0.029  // 1 TRY = 0.029 EUR
  };

  // Currency symbols
  const currencySymbols = {
    TRY: '₺',
    USD: '$',
    EUR: '€'
  };

  // Updated formatCurrency to handle different currencies
  const formatCurrency = (amount: number) => {
    const convertedAmount = amount * currencyRates[selectedCurrency];
    return `${currencySymbols[selectedCurrency]}${convertedAmount.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userData, leasesData, paymentsData, notificationsData] = await Promise.all([
          userService.getProfile(),
          leaseService.getAllLeases(),
          paymentService.getAllPayments(),
          notificationService.getAllNotifications()
        ]);
        
        setUserProfile(userData);
        setLeases(leasesData);
        setPayments(paymentsData);
        setNotifications(notificationsData);
        
        // Simple diagnostic logging
        console.log("🔧 Simple Diagnostics Report 🔧");
        console.log("User data loaded:", userData ? "Yes" : "No");
        console.log("Leases loaded:", leasesData.length);
        console.log("Payments loaded:", paymentsData.length);
        console.log("Notifications loaded:", notificationsData.length);
        
        // Check for premium calculation - log premium vs rent amount
        leasesData.forEach(lease => {
          console.log(`Lease ${lease.id}: Rent ${lease.monthly_rent}, Premium ${lease.premium}, Premium/Rent ratio: ${(lease.premium / lease.monthly_rent * 100).toFixed(2)}%`);
        });
        
        // Investigate future payments
        const futurePayments = paymentsData.filter(p => {
          try {
            const dueDate = new Date(p.due_date);
            const now = new Date();
            return dueDate > now && p.status === 'pending';
          } catch (e) {
            return false;
          }
        });
        
        console.log("Future payments count:", futurePayments.length);
        futurePayments.forEach(p => {
          console.log(`Future payment: ID ${p.id}, Due ${p.due_date}, Amount ${p.amount}`);
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!userProfile) return 0;
    
    // Basic profile fields (60% of score)
    const requiredFields = [
      'name', 'email', 'phone', 'bio', 'address',
      'photo_url', 'preferred_name', 'emergency_contact'
    ];
    
    const completedFields = requiredFields.filter(field => 
      userProfile[field as keyof User] !== undefined && 
      userProfile[field as keyof User] !== null &&
      userProfile[field as keyof User] !== ''
    );
    
    const fieldsPercentage = (completedFields.length / requiredFields.length) * 60;
    
    // Verifications (40% of score)
    let verificationsPercentage = 0;
    if (userProfile.verifications) {
      const verificationCount = [
        userProfile.verifications.email,
        userProfile.verifications.phone,
        userProfile.verifications.id,
        userProfile.verifications.bank
      ].filter(Boolean).length;
      
      verificationsPercentage = (verificationCount / 4) * 40;
    }
    
    return Math.round(fieldsPercentage + verificationsPercentage);
  };

  // Get profile strength rating
  const getProfileStrength = (percentage: number) => {
    if (percentage >= 80) return { label: 'Strong', color: 'text-green-600' };
    if (percentage >= 50) return { label: 'Moderate', color: 'text-yellow-600' };
    return { label: 'Weak', color: 'text-red-600' };
  };

  // Get active leases for current role
  const getActiveLeases = () => {
    return leases.filter(lease => {
      if (lease.status !== 'active') return false;
      return role === 'landlord' 
        ? lease.landlord_id === currentUser?.id
        : lease.tenant_id === currentUser?.id;
    });
  };

  // Get ALL active leases (both as landlord and tenant)
  const getAllActiveLeases = () => {
    return leases.filter(lease => {
      if (lease.status !== 'active') return false;
      return lease.landlord_id === currentUser?.id || lease.tenant_id === currentUser?.id;
    });
  };

  // Get payments stats for current role
  const getPaymentsStats = () => {
    const rolePayments = payments.filter(payment => {
      const lease = leases.find(l => l.id === payment.lease_id);
      if (!lease) return false;
      return role === 'landlord'
        ? lease.landlord_id === currentUser?.id
        : lease.tenant_id === currentUser?.id;
    });

    // Get current date for calculations
    const currentDate = new Date();

    // Calculate outstanding payments
    const outstanding = rolePayments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    // Calculate received payments
    const received = rolePayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);

    // Find the next due payment, properly handling future dates
    const pendingPayments = rolePayments.filter(p => p.status === 'pending');
    
    // Sort by date - this ensures we get the earliest date first
    pendingPayments.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
    
    const nextDue = pendingPayments.length > 0 ? pendingPayments[0].due_date : null;
    
    // Calculate days until next payment, handling future dates correctly
    let daysUntilNextPayment = null;
    if (nextDue) {
      const nextDueDate = new Date(nextDue);
      const timeDiff = nextDueDate.getTime() - currentDate.getTime();
      daysUntilNextPayment = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }

    return {
      outstanding,
      received,
      nextDue,
      daysUntilNextPayment
    };
  };

  // Get filtered transactions
  const getFilteredTransactions = () => {
    let filtered = payments.filter(payment => {
      const lease = leases.find(l => l.id === payment.lease_id);
      if (!lease) return false;
      
      return role === 'landlord'
        ? lease.landlord_id === currentUser?.id
        : lease.tenant_id === currentUser?.id;
    });

    // Apply status filter
    if (transactionFilter !== 'all') {
      filtered = filtered.filter(p => p.status === transactionFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const lease = leases.find(l => l.id === p.lease_id);
        if (!lease) return false;
        
        return lease.property_name.toLowerCase().includes(query) ||
               formatCurrency(p.amount).toLowerCase().includes(query) ||
               p.status.toLowerCase().includes(query);
      });
    }

    return filtered;
  };

  // Inside Dashboard component
  useEffect(() => {
    // Log payments data for debugging
    console.log("All payments:", payments);
    
    // Log the current filters
    console.log("Current role:", role);
    console.log("Current user ID:", currentUser?.id);
    
    // Check if any payments are for future months
    const now = new Date();
    const futurePayments = payments.filter(p => {
      const dueDate = new Date(p.due_date);
      return dueDate > now && p.status === 'pending';
    });
    
    console.log("Future payments:", futurePayments);
  }, [payments, role, currentUser]);

  // Enhanced to fix premium calculation and ensure hollow columns work
  const getChartData = () => {
    console.log("Generating chart data with enhanced diagnostics");
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Create arrays to hold monthly values
    const pastPayments = Array(12).fill(0);
    const futurePayments = Array(12).fill(0);
    
    // Process each payment
    payments.forEach(payment => {
      // Find the associated lease
      const lease = leases.find(l => l.id === payment.lease_id);
      if (!lease) return;
      
      // Check if this payment is relevant to the current role
      const isRelevant = role === 'landlord' 
        ? lease.landlord_id === currentUser?.id 
        : lease.tenant_id === currentUser?.id;
      
      if (!isRelevant) return;
      
      // Parse and validate the payment date
      let paymentDate;
      try {
        paymentDate = new Date(payment.due_date);
        if (isNaN(paymentDate.getTime())) return;
      } catch (error) {
        console.error("Date parsing error:", error);
        return;
      }
      
      // Get payment amount as a number
      const amount = typeof payment.amount === 'number' 
        ? payment.amount 
        : typeof payment.amount === 'string'
          ? parseFloat(payment.amount)
          : 0;
      
      const month = paymentDate.getMonth();
      
      // Future payments: Due date is in the future AND status is pending
      if (paymentDate > currentDate && payment.status === 'pending') {
        futurePayments[month] += amount;
        console.log(`Added future payment for month ${month+1}: ${amount} due on ${paymentDate.toISOString().split('T')[0]}`);
      } 
      // Current/past payments - only include current year payments
      else if (paymentDate.getFullYear() === currentYear) {
        pastPayments[month] += amount;
      }
    });

    console.log("CHART DATA DIAGNOSTICS:");
    console.log("- Past payments:", pastPayments);
    console.log("- Future payments:", futurePayments);
    
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Current/Past',
          data: pastPayments,
          backgroundColor: role === 'landlord' 
            ? 'rgba(16, 185, 129, 0.3)' 
            : 'rgba(79, 70, 229, 0.3)',
          borderColor: role === 'landlord' 
            ? 'rgb(16, 185, 129)' 
            : 'rgb(79, 70, 229)',
          borderWidth: 2,
          borderRadius: 6,
          hoverBackgroundColor: role === 'landlord' 
            ? 'rgba(16, 185, 129, 0.5)' 
            : 'rgba(79, 70, 229, 0.5)',
          order: 1
        },
        {
          label: 'Upcoming',
          data: futurePayments,
          backgroundColor: 'transparent', // Fully transparent for hollow effect
          borderColor: role === 'landlord' 
            ? 'rgb(16, 185, 129)' 
            : 'rgb(79, 70, 229)',
          borderWidth: 2,
          borderRadius: 6,
          order: 0,
          barPercentage: 0.9,
          borderSkipped: false
        }
      ]
    };
  };

  const chartData = getChartData();

  // Include all datasets when calculating max value
  const maxValue = Math.max(
    ...chartData.datasets[0].data,
    ...chartData.datasets[1].data,
    1 // Ensure at least 1 for empty data
  );

  // Set a sensible Y-axis max that's a bit higher than the max value or a reasonable default
  const yAxisMax = maxValue > 0 
    ? Math.ceil(maxValue * 1.2 / 10000) * 10000 // Round up to nearest 10,000 and add 20% headroom
    : 10000; // Default to 10,000 if no data

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animations: {
      tension: {
        duration: 1000,
        easing: 'linear',
        from: 0.8,
        to: 0.2,
        loop: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: yAxisMax, // Set the max value for appropriate scaling
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
        ticks: {
          callback: (value: number) => formatCurrency(value),
          font: {
            size: 11
          },
          color: '#6B7280',
          // Ensure we have enough ticks to show meaningful values
          count: 6
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: 11
          },
          color: '#6B7280'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#111827',
        bodyColor: '#6B7280',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return formatCurrency(context.parsed.y);
          },
          title: function(tooltipItems: any[]) {
            const monthIndex = tooltipItems[0].dataIndex;
            const month = chartData.labels[monthIndex];
            return `${month} ${new Date().getFullYear()}`;
          }
        }
      }
    }
  };

  // Toggle diagnostics mode with keyboard shortcut Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDiagnosticsMode(prev => !prev);
        console.log(`Diagnostics mode ${!diagnosticsMode ? 'enabled' : 'disabled'}`);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [diagnosticsMode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-7xl px-4">
          {/* Skeleton for welcome message */}
          <div className="h-24 bg-white rounded-xl w-full"></div>
          
          {/* Skeleton for KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-64 bg-white rounded-xl"></div>
            <div className="h-64 bg-white rounded-xl"></div>
            <div className="h-64 bg-white rounded-xl"></div>
    </div>
          
          {/* Skeleton for payments section */}
          <div className="h-80 bg-white rounded-xl w-full"></div>
          
          {/* Skeleton for transactions */}
          <div className="h-96 bg-white rounded-xl w-full"></div>
        </div>
    </div>
  );
  }

  const profileCompletion = calculateProfileCompletion();
  const profileStrength = getProfileStrength(profileCompletion);
  const activeLeases = getActiveLeases();
  const allActiveLeases = getAllActiveLeases();
  const paymentStats = getPaymentsStats();
  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-center">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {userProfile?.name || 'User'}!
              </h1>
              <p className="mt-1 text-gray-500">
                Here's an overview of your leasing activities.
              </p>
              </div>
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              {userProfile?.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt={userProfile.name || 'User'} 
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <UserIcon className="h-6 w-6 text-emerald-600" />
              )}
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-8">
            {/* Active Leases Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">Active Leases</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                {allActiveLeases.length > 0 ? (
                  <div className="flow-root">
                    <ul className="divide-y divide-gray-100">
                      {allActiveLeases.map((lease) => {
                        const isLandlord = lease.landlord_id === currentUser?.id;
                        return (
                          <li key={lease.id} className="py-4">
                            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                                <div className="flex-shrink-0 mr-3">
                                  <div className="h-10 w-10 rounded-md bg-emerald-100 flex items-center justify-center">
                                    <BuildingOfficeIcon className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {lease.property_name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {formatCurrency(lease.monthly_rent)}/month
                                  </p>
                                  <div className="mt-1">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                      isLandlord ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                    }`}>
                                      {isLandlord ? 'As Landlord' : 'As Tenant'}
                                    </span>
                      </div>
                </div>
              </div>
            </div>

                            <div className="mt-2 flex items-center space-x-2">
                              <Link
                                to={isLandlord ? `/users/${lease.tenant_id}` : `/users/${lease.landlord_id}`}
                                className="inline-flex items-center px-3 py-1.5 text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                              >
                                <UserIcon className="h-4 w-4 mr-1.5" />
                                {isLandlord ? 'View Tenant' : 'View Landlord'}
                              </Link>
                              
                              <Link
                                to={`/leases/${lease.id}`}
                                className="inline-flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 shadow-sm hover:bg-gray-50 rounded-md transition-colors"
                              >
                                Details
                              </Link>
                  </div>
                          </li>
                        );
                      })}
                    </ul>
                </div>
                ) : (
                  <div className="text-center py-8">
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No active leases</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new lease.
                    </p>
                    <div className="mt-6">
                      <Link
                        to="/leases/new"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        Create Lease
                      </Link>
                      </div>
                </div>
                )}
              </div>
              {allActiveLeases.length > 0 && (
                <div className="px-4 py-4 sm:px-6 border-t border-gray-100 bg-gray-50">
                  <Link
                    to="/leases"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-500 flex justify-center items-center"
                  >
                    View all leases
                    <ChevronRightIcon className="ml-1 h-5 w-5" />
                  </Link>
                </div>
              )}
            </div>

            {/* Notifications Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
                    onClick={() => {
                      // Handle mark all as read functionality
                      console.log('Marking all notifications as read');
                    }}
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="px-4 py-5 sm:p-6">
                {notifications.length > 0 ? (
                  <div className="flow-root max-h-96 overflow-auto">
                    <ul className="-my-5 divide-y divide-gray-100">
                      {notifications.slice(0, 5).map((notification) => (
                        <li key={notification.id} className="py-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 pt-0.5">
                              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                                <BellIcon className="h-5 w-5 text-emerald-600" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {notification.message}
                              </p>
                              <div className="mt-1 flex items-center">
                                <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                                <p className="text-xs text-gray-500">
                                  {getRelativeTime(notification.created_at)}
                                </p>
                              </div>
                            </div>
                            {!notification.read && (
                <div className="flex-shrink-0">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  </div>
                            )}
                </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BellIcon className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You're all caught up!
                    </p>
                  </div>
                        )}
                      </div>
              {notifications.length > 0 && (
                <div className="px-4 py-4 sm:px-6 border-t border-gray-100 bg-gray-50">
                  <Link
                    to="/notifications"
                    className="text-sm font-medium text-emerald-600 hover:text-emerald-500 flex justify-center items-center"
                  >
                    View all notifications
                    <ChevronRightIcon className="ml-1 h-5 w-5" />
                  </Link>
                </div>
              )}
              </div>

            {/* Support Ticket Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-100">
                <h3 className="text-lg font-medium text-gray-900">Help & Support</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <Link
                    to="/support/new"
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                    Open New Ticket
                  </Link>
            </div>

                {/* Simulated Support Tickets */}
                <div className="flow-root">
                  <div className="border-b border-gray-100 pb-2 mb-4">
                    <h4 className="text-sm font-medium text-gray-900">Recent Tickets</h4>
                  </div>
                  
                  {/* For demo purposes, create mock tickets */}
                  {[
                    { 
                      id: '1', 
                      title: 'Payment issue with apartment',
                      status: 'open',
                      created_at: new Date(Date.now() - 86400000).toISOString()
                    },
                    { 
                      id: '2', 
                      title: 'How to extend my lease?',
                      status: 'closed',
                      created_at: new Date(Date.now() - 172800000).toISOString()
                    }
                  ].length > 0 ? (
                    <ul className="-my-2 divide-y divide-gray-100">
                      {[
                        { 
                          id: '1', 
                          title: 'Payment issue with apartment',
                          status: 'open',
                          created_at: new Date(Date.now() - 86400000).toISOString()
                        },
                        { 
                          id: '2', 
                          title: 'How to extend my lease?',
                          status: 'closed',
                          created_at: new Date(Date.now() - 172800000).toISOString()
                        }
                      ].map((ticket) => (
                        <li key={ticket.id} className="py-2">
                          <div className="flex items-center justify-between">
              <div className="flex items-center">
                              <div className={`h-2 w-2 rounded-full mr-2 ${
                                ticket.status === 'open' ? 'bg-emerald-500' : 'bg-gray-300'
                              }`}></div>
                              <Link to={`/support/${ticket.id}`} className="text-sm text-gray-900 hover:text-emerald-600">
                                {ticket.title}
                              </Link>
                  </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              ticket.status === 'open' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                            </span>
                </div>
                          <p className="text-xs text-gray-500 mt-1 ml-4">
                            {getRelativeTime(ticket.created_at)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No open tickets</p>
                    </div>
                        )}
                      </div>
                </div>
              <div className="px-4 py-4 sm:px-6 border-t border-gray-100 bg-gray-50">
                <Link
                  to="/support"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-500 flex justify-center items-center"
                >
                  View all tickets
                  <ChevronRightIcon className="ml-1 h-5 w-5" />
                </Link>
            </div>
          </div>
        </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {/* Profile KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Status Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Profile Status</h3>
                    <p className="text-sm text-gray-500">Completion status</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <ShieldCheckIcon className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{profileCompletion}% Complete</span>
                    <span className={`text-sm font-medium ${profileStrength.color}`}>{profileStrength.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="h-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" 
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                </div>
              </div>
              
                {userProfile?.trust_badge && (
                  <div className="mb-4 flex items-center">
                    <div className="bg-blue-100 rounded-full p-1 mr-2">
                      <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                  </div>
                    <span className="text-sm text-blue-600 font-medium">Trusted User Badge</span>
                  </div>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email Verification</span>
                    {userProfile?.verifications?.email ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Phone Verification</span>
                    {userProfile?.verifications?.phone ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">ID Verification</span>
                    {userProfile?.verifications?.id ? (
                      <CheckCircleIcon className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                </div>
                
                <div className="mt-auto pt-4">
                <Link
                  to="/profile"
                    className="block w-full text-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                    Complete Profile
                </Link>
              </div>
            </div>

              {/* User Rating Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 bg-gradient-to-r from-amber-500 to-yellow-400 bg-clip-text text-transparent">User Rating</h3>
                    <p className="text-sm text-gray-500">Based on {userProfile?.ratings?.total_reviews || 0} reviews</p>
            </div>
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <StarIcon className="h-6 w-6 text-amber-600" />
                        </div>
                      </div>
                
                <div className="space-y-4 mb-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">As Landlord</span>
                      <span className="text-sm font-medium text-gray-700">
                        {(userProfile?.ratings?.as_landlord?.average || 0).toFixed(1)}/5.0
                        </span>
                      </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon 
                          key={`landlord-${star}`}
                          className={`h-5 w-5 ${
                            star <= Math.round(userProfile?.ratings?.as_landlord?.average || 0) 
                              ? 'text-yellow-400' 
                              : 'text-gray-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {userProfile?.ratings?.as_landlord?.count || 0} reviews as landlord
                        </p>
                      </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">As Tenant</span>
                      <span className="text-sm font-medium text-gray-700">
                        {(userProfile?.ratings?.as_tenant?.average || 0).toFixed(1)}/5.0
                      </span>
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon 
                          key={`tenant-${star}`}
                          className={`h-5 w-5 ${
                            star <= Math.round(userProfile?.ratings?.as_tenant?.average || 0) 
                              ? 'text-yellow-400' 
                              : 'text-gray-200'
                          }`} 
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {userProfile?.ratings?.as_tenant?.count || 0} reviews as tenant
                        </p>
                      </div>
                    </div>
                
                <div className="mt-auto pt-4">
                  <Link 
                    to="/profile/reviews" 
                    className="block w-full text-center px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    View All Reviews
                  </Link>
                  </div>
              </div>

              {/* Subscription Plan Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">Subscription Plan</h3>
                    <p className="text-sm text-gray-500">Your current subscription</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <SparklesIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">
                        {userProfile?.subscription?.plan || 'Free Plan'}
                      </h4>
                      {userProfile?.subscription?.features ? (
                        <ul className="mt-2 space-y-1">
                          {userProfile.subscription.features.map((feature, index) => (
                            <li key={index} className="flex items-center text-sm text-gray-600">
                              <CheckCircleIcon className="h-4 w-4 text-emerald-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        // Display Free plan features when subscription features are not available
                        <ul className="mt-2 space-y-1">
                          <li className="flex items-center text-sm text-gray-600">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500 mr-2" />
                            Digital Leasing
                          </li>
                          <li className="flex items-center text-sm text-gray-600">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500 mr-2" />
                            Rent Collection
                          </li>
                          <li className="flex items-center text-sm text-gray-600">
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500 mr-2" />
                            Basic Features
                          </li>
                        </ul>
              )}
            </div>
          </div>
                  
                  {userProfile?.subscription?.next_billing_date && (
                    <div className="flex items-center mb-4 text-sm text-gray-600">
                      <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                      Next billing: {formatDate(userProfile.subscription.next_billing_date)}
                    </div>
                  )}
        </div>

                <div className="mt-auto pt-4">
                  <Link 
                    to="/plans" 
                    className="block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-medium rounded-lg transition-colors shadow-sm"
                  >
                    <RocketLaunchIcon className="inline-block h-4 w-4 mr-1" />
                    Upgrade Plan
              </Link>
            </div>
                        </div>
            </div>

            {/* Payments & Payouts Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Payments & Payouts</h2>
              </div>
              
              {/* Role Toggle Switch */}
              <div className="px-6 py-4">
                <div className="inline-flex items-center p-1 bg-gray-100 rounded-full">
                  <button
                    onClick={() => setRole('landlord')}
                    className={`py-2 px-4 text-sm font-medium rounded-full transition-all duration-200 ${
                      role === 'landlord'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    As Landlord
                  </button>
                  <button
                    onClick={() => setRole('tenant')}
                    className={`py-2 px-4 text-sm font-medium rounded-full transition-all duration-200 ${
                      role === 'tenant'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    As Tenant
                  </button>
                </div>
              </div>
              
              {/* KPI Cards */}
              <div className="px-6 py-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Outstanding Payments */}
                  <div className={`p-5 rounded-lg ${paymentStats.outstanding > 0 ? 'bg-amber-50' : 'bg-gray-50'} transition-all duration-200 hover:shadow-md`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Outstanding Payments</p>
                        <h3 className={`mt-1.5 text-2xl font-bold ${paymentStats.outstanding > 0 ? 'text-amber-600' : 'text-gray-700'}`}>
                          {formatCurrency(paymentStats.outstanding)}
                        </h3>
                        <p className="mt-1.5 text-xs text-gray-500">
                          {Math.floor(paymentStats.outstanding)} pending payment{paymentStats.outstanding !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-full ${paymentStats.outstanding > 0 ? 'bg-amber-100' : 'bg-gray-200'}`}>
                        <ClockIcon className={`h-6 w-6 ${paymentStats.outstanding > 0 ? 'text-amber-600' : 'text-gray-500'}`} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Next Payment Due */}
                  <div className="p-5 rounded-lg bg-blue-50 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Next Payment Due</p>
                        <h3 className="mt-1.5 text-2xl font-bold text-blue-700">
                          {paymentStats.nextDue ? formatDate(paymentStats.nextDue) : 'No upcoming'}
                        </h3>
                        <p className="mt-1.5 text-xs text-gray-500">
                          {paymentStats.nextDue && paymentStats.daysUntilNextPayment !== null ? 
                            `Due in ${paymentStats.daysUntilNextPayment} days` : 
                            ''}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-full bg-blue-100">
                        <CalendarIcon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Received Amount */}
                  <div className={`p-5 rounded-lg ${paymentStats.received > 0 ? 'bg-emerald-50' : 'bg-gray-50'} transition-all duration-200 hover:shadow-md`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Received Amount</p>
                        <h3 className={`mt-1.5 text-2xl font-bold ${paymentStats.received > 0 ? 'text-emerald-600' : 'text-gray-700'}`}>
                          {formatCurrency(paymentStats.received)}
                        </h3>
                        <p className="mt-1.5 text-xs text-gray-500">
                          {Math.floor(paymentStats.received)} completed payment{paymentStats.received !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className={`p-2.5 rounded-full ${paymentStats.received > 0 ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                        <CheckCircleIcon className={`h-6 w-6 ${paymentStats.received > 0 ? 'text-emerald-600' : 'text-gray-500'}`} />
                    </div>
                  </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Chart */}
              <div className="px-6 py-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="flex flex-col space-y-4">
                    {/* Chart Title and Currency Toggle Row */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-700">
                        {role === 'landlord' ? 'Monthly Income' : 'Monthly Payments'}
                      </h3>
                      
                      {/* Currency Toggle - Improved styling */}
                      <div className="flex items-center rounded-full p-0.5 border border-gray-200">
                        <button
                          onClick={() => setSelectedCurrency('TRY')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                            selectedCurrency === 'TRY' 
                              ? 'bg-emerald-500 text-white shadow-sm' 
                              : 'bg-transparent text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          ₺ TRY
                        </button>
                        <button
                          onClick={() => setSelectedCurrency('USD')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                            selectedCurrency === 'USD' 
                              ? 'bg-emerald-500 text-white shadow-sm' 
                              : 'bg-transparent text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          $ USD
                        </button>
                        <button
                          onClick={() => setSelectedCurrency('EUR')}
                          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                            selectedCurrency === 'EUR' 
                              ? 'bg-emerald-500 text-white shadow-sm' 
                              : 'bg-transparent text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          € EUR
                        </button>
                      </div>
                    </div>
                    
                    {/* Chart Legend */}
                    <div className="flex items-center space-x-6 text-xs text-gray-500">
                      <div className="flex items-center">
                        <span className="inline-block w-4 h-4 mr-1.5 rounded-sm" 
                              style={{ backgroundColor: role === 'landlord' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(79, 70, 229, 0.3)' }}></span>
                        <span>Past/Current</span>
                      </div>
                      <div className="flex items-center">
                        <span className="inline-block w-4 h-4 mr-1.5 rounded-sm border-2" 
                              style={{ 
                                backgroundColor: 'transparent',
                                borderColor: role === 'landlord' ? 'rgb(16, 185, 129)' : 'rgb(79, 70, 229)' 
                              }}></span>
                        <span>Upcoming</span>
                      </div>
                    </div>
                    
                    {/* Debug information - Only show in development and when diagnostics is enabled */}
                    {process.env.NODE_ENV === 'development' && diagnosticsMode && (
                      <div className="bg-gray-100 p-4 rounded-md text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">Diagnostics</h4>
                          <button
                            onClick={() => setDiagnosticsMode(false)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Hide
                          </button>
                        </div>
                        
                        <p className="mb-2">
                          Has future data: {chartData.datasets[1].data.some(d => d > 0) ? 
                            <span className="text-green-600 font-bold">Yes</span> : 
                            <span className="text-red-600 font-bold">No</span>}
                        </p>
                        
                        <details>
                          <summary className="cursor-pointer mt-2">Chart data</summary>
                          <pre className="mt-2 bg-gray-800 text-green-400 p-2 rounded overflow-auto max-h-64">{JSON.stringify({
                            currentData: chartData.datasets[0].data,
                            futureData: chartData.datasets[1].data
                          }, null, 2)}</pre>
                        </details>
                      </div>
              )}
            </div>
                  
                  <div className="relative h-64 mt-4">
                    <Bar 
                      data={chartData} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            min: 0,
                            max: yAxisMax,
                            grid: {
                              color: 'rgba(0, 0, 0, 0.05)',
                              drawBorder: false,
                            },
                            ticks: {
                              callback: (value: number) => formatCurrency(value),
                              font: { size: 11 },
                              color: '#6B7280',
                              count: 6
                            }
                          },
                          x: {
                            grid: {
                              display: false
                            },
                            ticks: {
                              font: { size: 11 },
                              color: '#6B7280'
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            display: false
                          },
                          tooltip: {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: '#111827',
                            bodyColor: '#6B7280',
                            borderColor: 'rgba(0, 0, 0, 0.1)',
                            borderWidth: 1,
                            padding: 10,
                            cornerRadius: 6,
                            displayColors: false,
                            callbacks: {
                              label: function(context: any) {
                                return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                              },
                              title: function(tooltipItems: any[]) {
                                const monthIndex = tooltipItems[0].dataIndex;
                                const month = chartData.labels[monthIndex];
                                return `${month} ${new Date().getFullYear()}`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
          </div>
        </div>

              {/* CTA Button */}
              <div className="px-6 py-5 bg-gray-50 flex justify-center border-t border-gray-100">
                <Link 
                  to={`/payments?role=${role}`}
                  className="inline-flex items-center px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors shadow-sm hover:shadow"
                >
                  View Full Payment History
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Link>
            </div>
              
              {/* Optional: Payment Reminder */}
              {paymentStats.outstanding > 0 && role === 'tenant' && (
                <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
                  <div className="flex justify-between items-center">
                      <div className="flex items-center">
                      <ExclamationCircleIcon className="h-5 w-5 text-amber-500 mr-2" />
                      <p className="text-sm text-amber-800">You have pending payments that require attention.</p>
                        </div>
                    <Link 
                      to="/payments/pending"
                      className="text-sm font-medium text-amber-600 hover:text-amber-700 underline"
                    >
                      Review Now
                    </Link>
                      </div>
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              </div>
              
              <div className="px-6 py-3">
                <div className="flex items-center justify-between">
                  {/* Search - Simplified with no visible icon */}
                  <div className="w-full max-w-xs">
                    <input
                      type="text"
                      className="w-full py-2 px-3 border-b border-gray-300 focus:border-emerald-500 focus:outline-none bg-transparent text-sm"
                      placeholder="Search transactions"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Filter & View All */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <select
                        value={transactionFilter}
                        onChange={(e) => setTransactionFilter(e.target.value)}
                        className="appearance-none bg-transparent py-2 pl-3 pr-8 border-none text-sm text-gray-900 focus:outline-none focus:ring-0"
                      >
                        <option value="all">All Transactions</option>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    
                    <Link 
                      to="/payments" 
                      className="inline-block px-4 py-2 text-xs font-medium rounded text-white bg-emerald-500"
                    >
                      <div className="flex items-center">
                        <span>View</span>
                        <span className="ml-1">All</span>
                      </div>
                    </Link>
                    </div>
                  </div>
                
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">View</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTransactions.slice(0, 5).map((transaction) => {
                        const lease = leases.find(l => l.id === transaction.lease_id);
                        return (
                          <tr key={transaction.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{lease?.property_name || 'Unknown Property'}</div>
                              <div className="text-sm text-gray-500">{lease?.property_address || ''}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
                              <div className="text-sm text-gray-500">
                                {role === 'landlord' ? 'Income' : 'Payment'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(transaction.due_date)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                transaction.status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : transaction.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link to={`/payments/${transaction.id}`} className="text-emerald-600 hover:text-emerald-900">
                                View
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {filteredTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No transactions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 