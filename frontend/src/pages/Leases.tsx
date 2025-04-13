import React, { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { leaseService } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';
import {
  CalendarIcon,
  CreditCardIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  BuildingOfficeIcon,
  UserIcon,
  ClockIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  HomeIcon,
  ArrowPathIcon,
  DocumentIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import { useNavigate, Link } from 'react-router-dom';
import Modal from '../components/Modal';
import { LeaseData, LeaseStatus, Currency } from '../services/api';
import Container from '../components/Container';

// Types and Interfaces
type UserRole = 'all' | 'landlord' | 'tenant';

interface NewLeaseForm {
  property_name: string;
  property_address: string;
  monthly_rent: number;
  currency: string;
  start_date: string;
  end_date: string;
  template_data: {
    additional_terms: string;
    utilities_included: string[];
    pets_allowed: boolean;
    smoking_allowed: boolean;
    notice_period_days: number;
    [key: string]: any;
  };
}

interface JoinLeaseForm {
  lease_id: string;
  template_data: {
    additional_terms: string;
    utilities_included: string[];
    pets_allowed: boolean;
    smoking_allowed: boolean;
    notice_period_days: number;
    [key: string]: any;
  };
}

interface Property {
  id: string;
  name: string;
  address: string;
  type: string;
  photos: string[];
}

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo_url?: string;
}

interface Payment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  date: string;
  method: 'online' | 'bank_transfer';
}

interface LeaseEvent {
  id: string;
  type: 'created' | 'signed' | 'payment' | 'reminder' | 'renewal' | 'termination';
  date: string;
  description: string;
}

interface Lease {
  id: number;
  ref_code: string;
  landlord_id: number;
  tenant_id?: number;
  property_name: string;
  property_address: string;
  monthly_rent: number;
  currency: Currency;
  premium: number;
  start_date: string;
  end_date: string;
  status: LeaseStatus;
  created_at: string;
  updated_at?: string;
  landlord_name?: string;
  tenant_name?: string;
}

const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  EUR: '€',
  TRY: '₺'
};

const CURRENCY_NAMES: Record<Currency, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  TRY: 'Turkish Lira'
};

// Helper Components
const StatusBadge = ({ status }: { status: LeaseStatus }) => {
  let color;
  let bgColor;
  let label;

  switch (status) {
    case 'draft':
      bgColor = 'bg-gray-100';
      color = 'text-gray-800';
      label = 'Draft';
      break;
    case 'pending':
      bgColor = 'bg-blue-100';
      color = 'text-blue-800';
      label = 'Pending Review';
      break;
    case 'awaiting_landlord_signature':
      bgColor = 'bg-purple-100';
      color = 'text-purple-800';
      label = 'Awaiting Landlord';
      break;
    case 'awaiting_tenant_signature':
      bgColor = 'bg-indigo-100';
      color = 'text-indigo-800';
      label = 'Awaiting Tenant';
      break;
    case 'changes_requested':
      bgColor = 'bg-yellow-100';
      color = 'text-yellow-800';
      label = 'Changes Requested';
      break;
    case 'active':
      bgColor = 'bg-emerald-100';
      color = 'text-emerald-800';
      label = 'Active';
      break;
    case 'completed':
      bgColor = 'bg-teal-100';
      color = 'text-teal-800';
      label = 'Completed';
      break;
    case 'terminated':
      bgColor = 'bg-red-100';
      color = 'text-red-800';
      label = 'Terminated';
      break;
    case 'cancelled':
      bgColor = 'bg-gray-100';
      color = 'text-gray-800';
      label = 'Cancelled';
      break;
    default:
      bgColor = 'bg-gray-100';
      color = 'text-gray-800';
      label = status;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bgColor} ${color} shadow-sm`}>
      {label}
    </span>
  );
};

const EmptyState = ({ onCreateLease, onJoinLease, isFiltered }: { onCreateLease: () => void, onJoinLease: () => void, isFiltered: boolean }) => (
  <div className="flex flex-col items-center justify-center p-10 bg-white rounded-xl shadow-sm border border-gray-100">
    <div className="text-center mb-6">
      <DocumentIcon className="mx-auto h-16 w-16 text-gray-300" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        {isFiltered ? 'No matching leases found' : 'No leases yet'}
      </h3>
    <p className="mt-1 text-sm text-gray-500">
        {isFiltered 
          ? 'Try adjusting your search or filters to find what you\'re looking for.' 
          : 'Get started by creating a new lease or joining an existing one.'}
      </p>
    </div>
    
    {!isFiltered && (
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={onCreateLease}
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create New Lease
        </button>
        <button
          onClick={onJoinLease}
          type="button"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Join Existing Lease
        </button>
      </div>
    )}
    
    {isFiltered && (
      <button
        onClick={() => {
          // Reset all filters
          window.location.reload();
        }}
        type="button"
        className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
      >
        <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        Reset Filters
      </button>
    )}
  </div>
);

interface LeaseCardProps {
  lease: Lease;
  userRole: 'landlord' | 'tenant';
}

const LeaseCard = ({ lease, userRole }: LeaseCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDetailId, setViewDetailId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Get border color based on status for visual indication
  const getBorderColor = (status: LeaseStatus) => {
    switch (status) {
      case 'active':
        return 'border-emerald-400';
      case 'draft':
        return 'border-gray-300';
      case 'pending':
        return 'border-blue-400';
      case 'awaiting_landlord_signature':
        return 'border-purple-400';
      case 'awaiting_tenant_signature':
        return 'border-indigo-400';
      case 'changes_requested':
        return 'border-yellow-400';
      case 'terminated':
        return 'border-red-400';
      case 'completed':
        return 'border-teal-400';
      case 'cancelled':
        return 'border-gray-400';
      default:
        return 'border-gray-200';
    }
  };
  
  const formatCurrency = (amount: number, currency: Currency) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(amount);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const viewDetails = () => {
    // Navigate to the lease detail page with the ID
    navigate(`/leases/${lease.id}`);
  };
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };
  
  const handleDeleteConfirm = async () => {
    try {
      setIsDeleting(true);
      setDeleteError('');
      
      const result = await leaseService.deleteLease(lease.ref_code);
      
      // Show success message before refreshing
      alert(`Lease successfully deleted: ${lease.property_name}`);
      
      // Refresh the page to show updated leases list
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to delete lease:', error);
      setDeleteError(
        error.response?.data?.msg || 
        error.response?.data?.message || 
        'Failed to delete lease. Please try again.'
      );
      setShowDeleteConfirm(false); // Close the modal to show the error
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };
  
  // Check if the current user is the landlord who created this lease
  const isCreator = currentUser?.id === lease.landlord_id;

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border ${getBorderColor(lease.status)}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {lease.property_name}
            </h3>
            <p className="text-sm text-gray-500">
              {lease.property_address.slice(0, 30) + (lease.property_address.length > 30 ? '...' : '')}
            </p>
          </div>
          <StatusBadge status={lease.status} />
        </div>

        <div className="flex flex-col space-y-2 mb-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Landlord</p>
              <p className="text-sm font-medium truncate">{lease.landlord_name}</p>
              {userRole === 'tenant' && lease.landlord_id !== currentUser?.id && (
                <Link 
                  to={`/users/${lease.landlord_id}`}
                  className="mt-2 inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition-all"
                >
                  <UserIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                  View Profile
                </Link>
              )}
          </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 uppercase font-medium mb-1">Tenant</p>
              <p className="text-sm font-medium truncate">{lease.tenant_name}</p>
              {userRole === 'landlord' && lease.tenant_id !== currentUser?.id && (
                <Link 
                  to={`/users/${lease.tenant_id}`}
                  className="mt-2 inline-flex items-center text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition-all"
                >
                  <UserIcon className="mr-1 h-3 w-3" aria-hidden="true" />
                  View Profile
                </Link>
              )}
          </div>
          </div>
          </div>

        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Monthly Rent:</span>
            <span className="font-medium">{formatCurrency(lease.monthly_rent, lease.currency)}</span>
              </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Lease Period:</span>
            <span className="font-medium">{formatDate(lease.start_date)} - {formatDate(lease.end_date)}</span>
              </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={viewDetails}
            className="w-full px-4 py-2 bg-emerald-50 text-emerald-700 font-medium text-sm rounded-lg hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Tabs component
const LeaseTabs = ({ activeTab, setActiveTab, leaseCount }: { activeTab: UserRole, setActiveTab: (tab: UserRole) => void, leaseCount: { all: number, landlord: number, tenant: number } }) => {
  return (
    <div className="flex space-x-4">
      <button
        onClick={() => setActiveTab('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
          activeTab === 'all'
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <HomeIcon className="h-5 w-5 inline-block mr-2" />
        All Leases ({leaseCount.all})
      </button>
      <button
        onClick={() => setActiveTab('landlord')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
          activeTab === 'landlord'
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <BuildingOfficeIcon className="h-5 w-5 inline-block mr-2" />
        As Landlord ({leaseCount.landlord})
      </button>
                    <button
        onClick={() => setActiveTab('tenant')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
          activeTab === 'tenant'
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <UserIcon className="h-5 w-5 inline-block mr-2" />
        As Tenant ({leaseCount.tenant})
                    </button>
    </div>
  );
};

// Main Leases page component
const Leases = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaseStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaseCount, setLeaseCount] = useState({ all: 0, landlord: 0, tenant: 0 });
  const navigate = useNavigate();

  // Modals
  const [showNewLeaseModal, setShowNewLeaseModal] = useState(false);
  const [showJoinLeaseModal, setShowJoinLeaseModal] = useState(false);
  const [newLeaseForm, setNewLeaseForm] = useState<NewLeaseForm>({
    property_name: '',
    property_address: '',
    monthly_rent: 0,
    currency: 'USD',
    start_date: '',
    end_date: '',
    template_data: {
      additional_terms: '',
      utilities_included: [],
      pets_allowed: false,
      smoking_allowed: false,
      notice_period_days: 30
    }
  });
  const [joinLeaseForm, setJoinLeaseForm] = useState<JoinLeaseForm>({
    lease_id: '',
    template_data: {
      additional_terms: '',
      utilities_included: [],
      pets_allowed: false,
      smoking_allowed: false,
      notice_period_days: 30
    }
  });
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await leaseService.getAllLeases();
      setLeases(data);
      setLeaseCount({
        all: data.length,
        landlord: data.filter(lease => lease.landlord_id === currentUser?.id).length,
        tenant: data.filter(lease => lease.tenant_id === currentUser?.id).length,
      });
    } catch (err) {
      setError('Failed to fetch leases. Please try again.');
      console.error('Error fetching leases:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLease = async (formData: NewLeaseForm) => {
    try {
      setIsLoading(true);
      const leaseData: LeaseData = {
        ...formData,
        monthly_rent: Number(formData.monthly_rent),
        currency: formData.currency as Currency,
        template_data: formData.template_data
      };
      await leaseService.createLease(leaseData);
      setShowNewLeaseModal(false);
      fetchLeases();
    } catch (error) {
        setError('Failed to create lease. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinLease = async (formData: JoinLeaseForm) => {
    try {
      setIsLoading(true);
      await leaseService.joinLease(formData.lease_id);
      setShowJoinLeaseModal(false);
      fetchLeases();
    } catch (error) {
      setError('Failed to join lease. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLeases = leases
    .filter(lease => {
      if (activeTab !== 'all') {
        if (activeTab === 'landlord' && lease.landlord_id !== currentUser?.id) return false;
        if (activeTab === 'tenant' && lease.tenant_id !== currentUser?.id) return false;
      }
      
      if (statusFilter !== 'all' && lease.status !== statusFilter) return false;
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          lease.property_address.toLowerCase().includes(query) ||
          lease.ref_code?.toLowerCase().includes(query) ||
          lease.landlord_name?.toLowerCase().includes(query) ||
          lease.tenant_name?.toLowerCase().includes(query)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

  const handleAction = () => {
    if (activeTab === 'landlord') {
      navigate('/leases/create');
    } else {
      setShowJoinLeaseModal(true);
    }
  };

  // Add search and filter controls
  const searchAndFilterSection = (
        <div className="mb-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input - left side */}
        <div className="w-full md:w-auto md:flex-1">
          <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              aria-label="Search leases"
              />
            </div>
          </div>
        
        {/* Filter and Sort - right side */}
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
          {/* Status filter */}
            <select
            id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeaseStatus | 'all')}
            className="block w-full md:w-52 px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending Review</option>
            <option value="awaiting_landlord_signature">Awaiting Landlord</option>
            <option value="awaiting_tenant_signature">Awaiting Tenant</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
              <option value="cancelled">Cancelled</option>
            </select>
          
          {/* Sort order */}
            <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center justify-between w-full md:w-40 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            aria-label={sortOrder === 'asc' ? 'Sort newest first' : 'Sort oldest first'}
            >
            <span>{sortOrder === 'asc' ? 'Oldest' : 'Newest'}</span>
            <ArrowPathIcon className={`h-5 w-5 text-gray-500 ${sortOrder === 'asc' ? 'rotate-0' : 'rotate-180'} transition-transform`} />
            </button>
        </div>
      </div>
    </div>
  );

  // Add navigation to comprehensive form
  const navigateToComprehensiveForm = () => {
    navigate('/leases/create');
  };

  return (
    <Container>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Leases & Rentals</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your leases and rental agreements
        </p>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="mb-4 md:mb-0">
          <LeaseTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            leaseCount={leaseCount}
          />
        </div>
        
        <div className="flex space-x-4">
                <button
            onClick={navigateToComprehensiveForm}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-105 transition-all duration-200"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Create New Lease
                </button>
                <button
            onClick={() => setShowJoinLeaseModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-105 transition-all duration-200"
                >
            <UserIcon className="-ml-1 mr-2 h-5 w-5" />
            Join Lease
                </button>
          </div>
        </div>

      {/* Add search and filter section */}
      {searchAndFilterSection}

      {/* Show loading state, error state, or lease list */}
        {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        ) : filteredLeases.length === 0 ? (
        <EmptyState
          onCreateLease={() => setShowNewLeaseModal(true)}
          onJoinLease={() => setShowJoinLeaseModal(true)}
          isFiltered={searchQuery !== '' || statusFilter !== 'all'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeases.map((lease) => (
              <LeaseCard
                key={lease.id}
                lease={lease}
                userRole={lease.landlord_id === currentUser?.id ? 'landlord' : 'tenant'}
              />
            ))}
          </div>
        )}

      {/* Modals */}
      <Modal
        isOpen={showNewLeaseModal}
        onClose={() => setShowNewLeaseModal(false)}
        title="Create New Lease"
      >
        <NewLeaseForm
          onSubmit={handleCreateLease}
          onCancel={() => setShowNewLeaseModal(false)}
        />
      </Modal>

      <Modal
        isOpen={showJoinLeaseModal}
        onClose={() => setShowJoinLeaseModal(false)}
        title="Join a Lease"
      >
        <JoinLeaseForm
          onSubmit={handleJoinLease}
          onCancel={() => setShowJoinLeaseModal(false)}
        />
      </Modal>
    </Container>
  );
};

interface FormErrors {
  property_name?: string;
  property_address?: string;
  monthly_rent?: string;
  currency?: string;
  start_date?: string;
  end_date?: string;
  lease_id?: string;
}

const NewLeaseForm: React.FC<{ onSubmit: (formData: NewLeaseForm) => void, onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<NewLeaseForm>({
    property_name: '',
    property_address: '',
    monthly_rent: 0,
    currency: 'USD',
    start_date: '',
    end_date: '',
    template_data: {
      additional_terms: '',
      utilities_included: [],
      pets_allowed: false,
      smoking_allowed: false,
      notice_period_days: 30
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.property_name.trim()) {
      newErrors.property_name = 'Property name is required';
    }
    
    if (!formData.property_address.trim()) {
      newErrors.property_address = 'Property address is required';
    }
    
    if (!formData.monthly_rent || formData.monthly_rent <= 0) {
      newErrors.monthly_rent = 'Monthly rent must be greater than 0';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    } else if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric fields
    if (name === 'monthly_rent' || name === 'notice_period_days' || name === 'template_data.notice_period_days') {
      const numValue = type === 'number' ? Number(value) : parseInt(value, 10);
      
      if (name === 'template_data.notice_period_days') {
        setFormData(prev => ({
          ...prev,
          template_data: {
            ...prev.template_data,
            notice_period_days: isNaN(numValue) ? 30 : numValue
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: isNaN(numValue) ? 0 : numValue
        }));
      }
      return;
    }

    // Handle other template_data fields
    if (name.startsWith('template_data.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        template_data: {
          ...prev.template_data,
          [field]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
      return;
    }

    // Handle other fields
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Lease</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Property Name
                              </label>
                              <input
                                type="text"
              value={formData.property_name}
              onChange={handleChange}
              name="property_name"
              className={`w-full px-3 py-2 border rounded-md ${errors.property_name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter property name"
            />
            {errors.property_name && <p className="mt-1 text-sm text-red-600">{errors.property_name}</p>}
                            </div>

                            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Property Address
                              </label>
                              <input
                                type="text"
              value={formData.property_address}
              onChange={handleChange}
              name="property_address"
              className={`w-full px-3 py-2 border rounded-md ${errors.property_address ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter property address"
            />
            {errors.property_address && <p className="mt-1 text-sm text-red-600">{errors.property_address}</p>}
                          </div>

                              <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Rent ($)
                                </label>
                                  <input
                                    type="number"
              value={formData.monthly_rent}
              onChange={handleChange}
              name="monthly_rent"
              className={`w-full px-3 py-2 border rounded-md ${errors.monthly_rent ? 'border-red-500' : 'border-gray-300'}`}
                                    min="0"
              step="0.01"
                                  />
            {errors.monthly_rent && <p className="mt-1 text-sm text-red-600">{errors.monthly_rent}</p>}
                                </div>

                              <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Currency
                                </label>
                                <select
              value={formData.currency}
              onChange={handleChange}
              name="currency"
              className={`w-full px-3 py-2 border rounded-md ${errors.currency ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                  {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
                                    <option key={code} value={code}>
                                      {CURRENCY_SYMBOLS[code as Currency]} {name}
                                    </option>
                                  ))}
                                </select>
                          </div>

                              <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Start Date
                                </label>
                                <input
                                  type="date"
              value={formData.start_date}
              onChange={handleChange}
              name="start_date"
              className={`w-full px-3 py-2 border rounded-md ${errors.start_date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                              </div>

                              <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                                  End Date
                                </label>
                                <input
                                  type="date"
              value={formData.end_date}
              onChange={handleChange}
              name="end_date"
              className={`w-full px-3 py-2 border rounded-md ${errors.end_date ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                              </div>
                            </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Terms
              </label>
              <textarea
                value={formData.template_data.additional_terms}
                onChange={handleChange}
                name="template_data.additional_terms"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Enter any additional terms"
              />
                          </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utilities Included
              </label>
              <div className="space-y-2">
                {['Electricity', 'Water', 'Gas', 'Internet', 'Trash'].map((utility) => (
                  <label key={utility} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.template_data.utilities_included.includes(utility)}
                      onChange={handleChange}
                      name={`template_data.utilities_included.${utility}`}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{utility}</span>
                  </label>
                ))}
                        </div>
                      </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pets Allowed
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.template_data.pets_allowed}
                  onChange={handleChange}
                  name="template_data.pets_allowed"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Allow pets in the property</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Smoking Allowed
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.template_data.smoking_allowed}
                  onChange={handleChange}
                  name="template_data.smoking_allowed"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Allow smoking in the property</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notice Period (days)
              </label>
              <input
                type="number"
                value={formData.template_data.notice_period_days}
                onChange={handleChange}
                name="template_data.notice_period_days"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
                        <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Cancel
                        </button>
                        <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-105 transition-all duration-200"
          >
            Create Lease
                        </button>
                      </div>
                    </form>
              </div>
  );
};

const JoinLeaseForm: React.FC<{ onSubmit: (formData: JoinLeaseForm) => void, onCancel: () => void }> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<JoinLeaseForm>({
    lease_id: '',
    template_data: {
      additional_terms: '',
      utilities_included: [],
      pets_allowed: false,
      smoking_allowed: false,
      notice_period_days: 30
    }
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    if (!formData.lease_id.trim()) {
      newErrors.lease_id = 'Lease ID is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle numeric fields
    if (name === 'monthly_rent' || name === 'notice_period_days' || name === 'template_data.notice_period_days') {
      const numValue = type === 'number' ? Number(value) : parseInt(value, 10);
      
      if (name === 'template_data.notice_period_days') {
        setFormData(prev => ({
          ...prev,
          template_data: {
            ...prev.template_data,
            notice_period_days: isNaN(numValue) ? 30 : numValue
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: isNaN(numValue) ? 0 : numValue
        }));
      }
      return;
    }

    // Handle other template_data fields
    if (name.startsWith('template_data.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        template_data: {
          ...prev.template_data,
          [field]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
      return;
    }

    // Handle other fields
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Join a Lease</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lease ID
                          </label>
                          <input
                            type="text"
            value={formData.lease_id}
            onChange={handleChange}
            name="lease_id"
            className={`w-full px-3 py-2 border rounded-md ${errors.lease_id ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter the lease ID"
          />
          {errors.lease_id && <p className="mt-1 text-sm text-red-600">{errors.lease_id}</p>}
                        </div>

        <div className="flex justify-end space-x-3">
                        <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Cancel
                        </button>
                        <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transform hover:scale-105 transition-all duration-200"
          >
            Join Lease
                        </button>
                      </div>
                    </form>
    </div>
  );
};

export default Leases; 