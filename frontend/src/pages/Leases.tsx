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
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import { LeaseData, LeaseStatus, Currency } from '../services/api';

// Types and Interfaces
type UserRole = 'all' | 'landlord' | 'tenant';

interface NewLeaseForm {
  property_name: string;
  property_address: string;
  monthly_rent: number;
  currency: Currency;
  start_date: string;
  end_date: string;
  template_data?: {
    additional_terms?: string;
    utilities_included?: string[];
    pets_allowed?: boolean;
    smoking_allowed?: boolean;
    notice_period_days?: number;
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
      bgColor = 'bg-green-100';
      color = 'text-green-800';
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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${bgColor} ${color} shadow-sm`}>
      {label}
    </span>
  );
};

const EmptyState = ({ role, onAction }: { role: UserRole, onAction: () => void }) => {
  return (
    <div className="text-center bg-white shadow-sm rounded-lg border border-gray-200 px-6 py-12">
      <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-lg font-medium text-gray-900">No leases found</h3>
      <p className="mt-1 text-sm text-gray-500">
        {role === 'all'
          ? "You don't have any leases yet."
          : role === 'landlord'
          ? "You haven't created any leases as a landlord yet."
          : "You don't have any active leases as a tenant."}
      </p>
      {role !== 'all' && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            {role === 'tenant' ? 'Join a Lease' : 'New Lease'}
          </button>
        </div>
      )}
    </div>
  );
};

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
    <div className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg border border-gray-200">
      {/* Card Header with Property Name and Status Badge */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-medium text-gray-900 flex items-center truncate">
            <BuildingOfficeIcon className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0" />
            <span className="truncate">{lease.property_name}</span>
          </h3>
          <StatusBadge status={lease.status} />
        </div>
        <p className="text-sm text-gray-500 mb-3">{lease.property_address}</p>
        
        {/* Reference Code - Small and subtle */}
        <div className="mb-4">
          <span className="text-xs text-gray-400">{lease.ref_code}</span>
        </div>
        
        {/* Key Information Section */}
        <div className="space-y-3 mb-5">
          {/* Lease Period */}
          <div className="flex items-center text-sm">
            <CalendarIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-600">{formatDate(lease.start_date)} - {formatDate(lease.end_date)}</span>
          </div>
          
          {/* Person Info (Tenant or Landlord) */}
          <div className="flex items-center text-sm">
            <UserIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="text-gray-600">
              {userRole === 'landlord' 
                ? <>Tenant: <span className="font-medium">{lease.tenant_name || 'No tenant yet'}</span></>
                : <>Landlord: <span className="font-medium">{lease.landlord_name}</span></>
              }
            </span>
          </div>
          
          {/* Rent Amount */}
          <div className="flex items-center text-sm">
            <BanknotesIcon className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <span className="font-medium text-gray-800">
              {formatCurrency(lease.monthly_rent, lease.currency)}/month
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          {/* Only show delete button if user is the creator (landlord) and we're in the landlord section */}
          {isCreator && userRole === 'landlord' && (
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-red-500"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          <button
            type="button"
            onClick={viewDetails}
            className="inline-flex items-center px-4 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            View Details
          </button>
        </div>
      </div>
      
      {deleteError && (
        <div className="px-4 py-2 bg-red-50 text-sm text-red-700 border-t border-red-200">
          {deleteError}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      <Transition.Root show={showDeleteConfirm} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={handleDeleteCancel}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                        Delete Lease
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete this lease? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleDeleteCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

// Tabs component
const LeaseTabs = ({ activeTab, setActiveTab, leaseCount }: { activeTab: UserRole, setActiveTab: (tab: UserRole) => void, leaseCount: { all: number, landlord: number, tenant: number } }) => {
  return (
    <div className="flex justify-start mb-6">
      <div className="inline-flex bg-blue-50 rounded-full p-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center px-4 py-2 rounded-full text-sm ${
            activeTab === 'all'
              ? 'bg-blue-600 text-white font-medium'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          All Leases
          <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${activeTab === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {leaseCount.all}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('landlord')}
          className={`flex items-center px-4 py-2 rounded-full text-sm ${
            activeTab === 'landlord'
              ? 'bg-blue-600 text-white font-medium'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          As Landlord
          <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${activeTab === 'landlord' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {leaseCount.landlord}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab('tenant')}
          className={`flex items-center px-4 py-2 rounded-full text-sm ${
            activeTab === 'tenant'
              ? 'bg-blue-600 text-white font-medium'
              : 'text-gray-700 hover:text-gray-900'
          }`}
        >
          As Tenant
          <span className={`ml-2 py-0.5 px-2 text-xs rounded-full ${activeTab === 'tenant' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
            {leaseCount.tenant}
          </span>
        </button>
      </div>
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

  const handleCreateLease = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsCreating(true);
      
      // Validate dates
      const startDate = new Date(newLeaseForm.start_date);
      const endDate = new Date(newLeaseForm.end_date);
      
      if (endDate <= startDate) {
        setError('End date must be after start date');
        setIsCreating(false);
        return;
      }
      
      // Ensure dates are in ISO8601 format and monthly_rent is a number
      const formattedData: LeaseData = {
        ...newLeaseForm,
        monthly_rent: Number(newLeaseForm.monthly_rent),
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        template_data: newLeaseForm.template_data || {
          additional_terms: '',
          utilities_included: [],
          pets_allowed: false,
          smoking_allowed: false,
          notice_period_days: 30
        }
      };
      
      console.log('Submitting lease data:', formattedData);
      const newLease = await leaseService.createLease(formattedData);
      setLeases(prev => [newLease, ...prev]);
      setShowNewLeaseModal(false);
      setNewLeaseForm({
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
    } catch (err: any) {
      console.error('Error creating lease:', err);
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ');
        setError(`Failed to create lease: ${errorMessages}`);
      } else if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to create lease: ${err.response.data.message}`);
      } else {
        setError('Failed to create lease. Please try again.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinLease = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setJoinError(null);
      setIsJoining(true);
      
      if (!joinLeaseForm.lease_id.trim()) {
        setJoinError('Please enter a valid lease ID');
        setIsJoining(false);
        return;
      }
      
      const joinedLease = await leaseService.joinLease(joinLeaseForm.lease_id);
      
      // Update local state
      setLeases(prev => [joinedLease, ...prev]);
      setShowJoinLeaseModal(false);
      setJoinLeaseForm({
        lease_id: '',
        template_data: {
          additional_terms: '',
          utilities_included: [],
          pets_allowed: false,
          smoking_allowed: false,
          notice_period_days: 30
        }
      });
      
      // Refresh leases data from server to ensure complete sync
      fetchLeases();
    } catch (err: any) {
      console.error('Error joining lease:', err);
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ');
        setJoinError(`Failed to join lease: ${errorMessages}`);
      } else if (err.response && err.response.data && err.response.data.message) {
        setJoinError(`Failed to join lease: ${err.response.data.message}`);
      } else {
        setJoinError('Failed to join lease. Please check the lease ID and try again.');
      }
    } finally {
      setIsJoining(false);
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-6xl">
        {/* Page header with description */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Leases & Rentals</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your rental agreements and lease contracts</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab navigation */}
        <LeaseTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          leaseCount={leaseCount}
        />

        {/* Search and filter row with action buttons */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <div className="relative w-full sm:w-auto flex-grow max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search leases by property, tenant, or landlord..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeaseStatus | 'all')}
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Review</option>
              <option value="awaiting_landlord_signature">Awaiting Landlord Signature</option>
              <option value="awaiting_tenant_signature">Awaiting Tenant Signature</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="terminated">Terminated</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="block pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
            
            {/* Action buttons - integrated with dropdowns */}
            {activeTab === 'landlord' && (
              <button
                onClick={() => navigate('/leases/create')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Lease
              </button>
            )}
            
            {activeTab === 'tenant' && (
              <button
                onClick={() => setShowJoinLeaseModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Join a Lease
              </button>
            )}
          </div>
        </div>

        {/* Leases grid */}
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredLeases.length === 0 ? (
            <EmptyState role={activeTab} onAction={handleAction} />
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLeases.map((lease) => (
                <LeaseCard
                  key={lease.id}
                  lease={lease}
                  userRole={activeTab === 'all' ? (lease.landlord_id === currentUser?.id ? 'landlord' : 'tenant') : activeTab === 'landlord' ? 'landlord' : 'tenant'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create New Lease Modal */}
        <Modal
          isOpen={showNewLeaseModal}
          onClose={() => setShowNewLeaseModal(false)}
          title="Create New Lease"
          size="md"
        >
          <form onSubmit={handleCreateLease} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Property Details</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="property_name" className="block text-sm font-medium text-gray-700">
                    Property Name
                  </label>
                  <input
                    type="text"
                    id="property_name"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newLeaseForm.property_name}
                    onChange={(e) => setNewLeaseForm({ ...newLeaseForm, property_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="property_address" className="block text-sm font-medium text-gray-700">
                    Property Address
                  </label>
                  <input
                    type="text"
                    id="property_address"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={newLeaseForm.property_address}
                    onChange={(e) => setNewLeaseForm({ ...newLeaseForm, property_address: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Lease Terms</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700">
                      Monthly Rent
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        id="monthly_rent"
                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={newLeaseForm.monthly_rent}
                        onChange={(e) => setNewLeaseForm({ ...newLeaseForm, monthly_rent: e.target.value ? Number(e.target.value) : 0 })}
                        required
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                      Currency
                    </label>
                    <select
                      id="currency"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={newLeaseForm.currency}
                      onChange={(e) => setNewLeaseForm({ ...newLeaseForm, currency: e.target.value as Currency })}
                      required
                    >
                      {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
                        <option key={code} value={code}>
                          {CURRENCY_SYMBOLS[code as Currency]} {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="start_date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={newLeaseForm.start_date}
                      onChange={(e) => setNewLeaseForm({ ...newLeaseForm, start_date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="end_date"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      value={newLeaseForm.end_date}
                      onChange={(e) => setNewLeaseForm({ ...newLeaseForm, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowNewLeaseModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Lease'}
              </button>
            </div>
          </form>
        </Modal>

        {/* Join Existing Lease Modal */}
        <Modal
          isOpen={showJoinLeaseModal}
          onClose={() => setShowJoinLeaseModal(false)}
          title="Join Existing Lease"
          size="md"
        >
          <form onSubmit={handleJoinLease} className="space-y-6">
            {joinError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{joinError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-4">
                Enter the lease ID provided by your landlord to join an existing lease.
              </p>
              <div>
                <label htmlFor="lease_id" className="block text-sm font-medium text-gray-700">
                  Lease ID
                </label>
                <input
                  type="text"
                  id="lease_id"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={joinLeaseForm.lease_id}
                  onChange={(e) => setJoinLeaseForm({ ...joinLeaseForm, lease_id: e.target.value })}
                  required
                  placeholder="Enter the lease ID"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowJoinLeaseModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Lease'}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default Leases; 