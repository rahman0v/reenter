import { useState, useEffect, Fragment } from 'react';
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
} from '@heroicons/react/24/outline';

// Types and Interfaces
type LeaseStatus = 'pending' | 'active' | 'expiring' | 'completed' | 'cancelled';
type UserRole = 'all' | 'landlord' | 'tenant';
type Currency = 'USD' | 'EUR' | 'TRY';

interface NewLeaseForm {
  property_name: string;
  property_address: string;
  monthly_rent: number;
  currency: Currency;
  start_date: string;
  end_date: string;
}

interface JoinLeaseForm {
  ref_code: string;
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
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    expiring: 'bg-orange-100 text-orange-800 border-orange-200',
    completed: 'bg-gray-100 text-gray-800 border-gray-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const EmptyState = ({ role, onAction }: { role: UserRole; onAction: () => void }) => (
  <div className="text-center py-12">
    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">No {role === 'all' ? '' : role} leases</h3>
    <p className="mt-1 text-sm text-gray-500">
      {role === 'landlord'
        ? "You haven't created any leases yet."
        : role === 'tenant'
        ? "You haven't joined any leases yet."
        : "You haven't created or joined any leases yet."}
    </p>
    {role !== 'all' && (
      <div className="mt-6">
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          {role === 'landlord' ? 'Create New Lease' : 'Join Existing Lease'}
        </button>
      </div>
    )}
  </div>
);

const LeaseCard = ({ lease, userRole }: { lease: Lease; userRole: 'landlord' | 'tenant' }) => {
  const [showDetails, setShowDetails] = useState(false);

  const TAX_RATE = 0.21; // 21% tax rate
  const COMMISSION_RATE = 0.085; // 8.5% commission rate
  
  // For tenant view - ensure we're using integers for the calculations
  const monthlyRent = Math.round(lease.monthly_rent); // Ensure the base rent is rounded
  const commissionAmount = Math.round(monthlyRent * COMMISSION_RATE);
  const totalWithCommission = monthlyRent + commissionAmount;
  
  // For landlord view
  const taxAmount = Math.round(monthlyRent * TAX_RATE);
  const netIncome = monthlyRent - taxAmount;

  // Format number without decimals
  const formatNumber = (num: number) => Math.round(num).toLocaleString();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{lease.property_name}</h3>
            <p className="mt-1 text-sm text-gray-500">{lease.property_address}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            lease.status === 'active' ? 'bg-green-50 text-green-700' :
            lease.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
            lease.status === 'expiring' ? 'bg-orange-50 text-orange-700' :
            lease.status === 'completed' ? 'bg-blue-50 text-blue-700' :
            'bg-red-50 text-red-700'
          }`}>
            {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">Reference Code:</span>
            <span className="text-sm text-gray-900">{lease.ref_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">{userRole === 'landlord' ? 'Tenant:' : 'Landlord:'}</span>
            <span className="text-sm text-gray-900">{userRole === 'landlord' ? lease.tenant_name || 'No tenant assigned' : lease.landlord_name || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">Duration:</span>
            <span className="text-sm text-gray-900">
              {new Date(lease.start_date).toLocaleDateString()} - {new Date(lease.end_date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">Monthly Rent:</span>
            <span className="text-sm text-gray-900">
              {formatNumber(monthlyRent)} {lease.currency}
            </span>
          </div>
          {userRole === 'tenant' ? (
            <>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Commission (8.5%):</span>
                <span className="text-sm text-gray-900">
                  {formatNumber(commissionAmount)} {lease.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Total Amount:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(totalWithCommission)} {lease.currency}
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Taxable (21%):</span>
                <span className="text-sm text-gray-900">
                  {formatNumber(taxAmount)} {lease.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Net Income:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatNumber(netIncome)} {lease.currency}
                </span>
              </div>
            </>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowDetails(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Details Modal */}
      <Transition.Root show={showDetails} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowDetails}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-xl bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Lease Details
                      </Dialog.Title>
                      <div className="mt-4 text-left">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Property Name:</span>
                            <span className="text-sm text-gray-900">{lease.property_name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Property Address:</span>
                            <span className="text-sm text-gray-900">{lease.property_address}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Status:</span>
                            <span className="text-sm text-gray-900">
                              {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Reference Code:</span>
                            <span className="text-sm text-gray-900">{lease.ref_code}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Start Date:</span>
                            <span className="text-sm text-gray-900">
                              {new Date(lease.start_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">End Date:</span>
                            <span className="text-sm text-gray-900">
                              {new Date(lease.end_date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Monthly Rent:</span>
                            <span className="text-sm text-gray-900">
                              {formatNumber(monthlyRent)} {lease.currency}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">{userRole === 'landlord' ? 'Tenant:' : 'Landlord:'}</span>
                            <span className="text-sm text-gray-900">
                              {userRole === 'landlord' ? lease.tenant_name || 'No tenant assigned' : lease.landlord_name || 'Unknown'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:text-sm transition-colors duration-200"
                      onClick={() => setShowDetails(false)}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

// Main Component
export default function Leases() {
  const { currentUser } = useAuth();
  const [activeRole, setActiveRole] = useState<UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeaseStatus | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [leases, setLeases] = useState<Lease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  });
  const [joinLeaseForm, setJoinLeaseForm] = useState<JoinLeaseForm>({
    ref_code: '',
  });

  useEffect(() => {
    fetchLeases();
  }, []);

  const fetchLeases = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await leaseService.getAllLeases();
      setLeases(data);
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
      const formattedData = {
        ...newLeaseForm,
        monthly_rent: Number(newLeaseForm.monthly_rent),
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
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
      setError(null);
      setIsJoining(true);
      
      if (!joinLeaseForm.ref_code.trim()) {
        setError('Please enter a valid reference code');
        setIsJoining(false);
        return;
      }
      
      const joinedLease = await leaseService.joinLease(joinLeaseForm.ref_code);
      setLeases(prev => [joinedLease, ...prev]);
      setShowJoinLeaseModal(false);
      setJoinLeaseForm({ ref_code: '' });
    } catch (err: any) {
      console.error('Error joining lease:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(`Failed to join lease: ${err.response.data.message}`);
      } else {
        setError('Failed to join lease. Please check the reference code and try again.');
      }
    } finally {
      setIsJoining(false);
    }
  };

  const filteredLeases = leases
    .filter(lease => {
      if (activeRole !== 'all') {
        if (activeRole === 'landlord' && lease.landlord_id !== currentUser?.id) return false;
        if (activeRole === 'tenant' && lease.tenant_id !== currentUser?.id) return false;
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
    if (activeRole === 'landlord') {
      setShowNewLeaseModal(true);
    } else {
      setShowJoinLeaseModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Leases & Rentals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your rental agreements and lease contracts
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex">
              <XCircleIcon className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Role Tabs */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as UserRole)}
              className="block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Leases</option>
              <option value="landlord">As Landlord</option>
              <option value="tenant">As Tenant</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-4" aria-label="Tabs">
              {['all', 'landlord', 'tenant'].map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role as UserRole)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                    ${activeRole === role
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {role === 'all'
                    ? 'All Leases'
                    : `As ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-lg">
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-200"
                placeholder="Search leases by property, tenant, or landlord..."
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as LeaseStatus | 'all')}
              className="rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-200"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="expiring">Expiring</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
            </button>
            {activeRole !== 'all' && (
              activeRole === 'tenant' ? (
                <button
                  onClick={() => setShowJoinLeaseModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Apply Lease
                </button>
              ) : (
                <button
                  onClick={() => setShowNewLeaseModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  New Lease
                </button>
              )
            )}
          </div>
        </div>

        {/* Leases List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-blue-600 transition ease-in-out duration-150 cursor-not-allowed">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading leases...
            </div>
          </div>
        ) : filteredLeases.length === 0 ? (
          <EmptyState role={activeRole} onAction={handleAction} />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLeases.map((lease) => (
              <LeaseCard
                key={lease.id}
                lease={lease}
                userRole={lease.landlord_id === currentUser?.id ? 'landlord' : 'tenant'}
              />
            ))}
          </div>
        )}

        {/* New Lease Modal */}
        <Transition.Root show={showNewLeaseModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowNewLeaseModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <form onSubmit={handleCreateLease}>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-8">
                          Create New Lease
                        </Dialog.Title>
                        <div className="space-y-6">
                          {/* Property Details Section */}
                          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            <h4 className="text-sm font-medium text-gray-900">Property Information</h4>
                            <div>
                              <label htmlFor="property_name" className="block text-sm font-medium text-gray-700">
                                Property Name
                              </label>
                              <input
                                type="text"
                                id="property_name"
                                required
                                placeholder="e.g., Sunset Apartments 3B"
                                value={newLeaseForm.property_name}
                                onChange={(e) => setNewLeaseForm(prev => ({ ...prev, property_name: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="property_address" className="block text-sm font-medium text-gray-700">
                                Property Address
                              </label>
                              <input
                                type="text"
                                id="property_address"
                                required
                                placeholder="Full street address"
                                value={newLeaseForm.property_address}
                                onChange={(e) => setNewLeaseForm(prev => ({ ...prev, property_address: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>

                          {/* Financial Details Section */}
                          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            <h4 className="text-sm font-medium text-gray-900">Financial Details</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700">
                                  Monthly Rent
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">{CURRENCY_SYMBOLS[newLeaseForm.currency]}</span>
                                  </div>
                                  <input
                                    type="number"
                                    id="monthly_rent"
                                    required
                                    min="0"
                                    placeholder="0.00"
                                    value={newLeaseForm.monthly_rent}
                                    onChange={(e) => setNewLeaseForm(prev => ({ ...prev, monthly_rent: Number(e.target.value) }))}
                                    className="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                  />
                                </div>
                              </div>
                              <div>
                                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                                  Currency
                                </label>
                                <select
                                  id="currency"
                                  value={newLeaseForm.currency}
                                  onChange={(e) => setNewLeaseForm(prev => ({ ...prev, currency: e.target.value as Currency }))}
                                  className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                  {Object.entries(CURRENCY_NAMES).map(([code, name]) => (
                                    <option key={code} value={code}>
                                      {CURRENCY_SYMBOLS[code as Currency]} {name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Lease Duration Section */}
                          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            <h4 className="text-sm font-medium text-gray-900">Lease Duration</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                                  Start Date
                                </label>
                                <input
                                  type="date"
                                  id="start_date"
                                  required
                                  value={newLeaseForm.start_date}
                                  min={new Date().toISOString().split('T')[0]}
                                  onChange={(e) => setNewLeaseForm(prev => ({ ...prev, start_date: e.target.value }))}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                              </div>
                              <div>
                                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                                  End Date
                                </label>
                                <input
                                  type="date"
                                  id="end_date"
                                  required
                                  value={newLeaseForm.end_date}
                                  min={newLeaseForm.start_date || new Date().toISOString().split('T')[0]}
                                  onChange={(e) => setNewLeaseForm(prev => ({ ...prev, end_date: e.target.value }))}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isCreating}
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isCreating ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Creating...
                            </>
                          ) : (
                            'Create Lease'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewLeaseModal(false)}
                          disabled={isCreating}
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Join Lease Modal */}
        <Transition.Root show={showJoinLeaseModal} as={Fragment}>
          <Dialog as="div" className="relative z-10" onClose={setShowJoinLeaseModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 z-10 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                  enterTo="opacity-100 translate-y-0 sm:scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                  leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                >
                  <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                    <form onSubmit={handleJoinLease}>
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                          Join Existing Lease
                        </Dialog.Title>
                        <div className="mt-6">
                          <label htmlFor="ref_code" className="block text-sm font-medium text-gray-700">
                            Reference Code
                          </label>
                          <input
                            type="text"
                            id="ref_code"
                            required
                            value={joinLeaseForm.ref_code}
                            onChange={(e) => setJoinLeaseForm(prev => ({ ...prev, ref_code: e.target.value.toUpperCase() }))}
                            placeholder="Enter the lease reference code"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-6 sm:mt-8 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isJoining}
                          className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isJoining ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Joining...
                            </>
                          ) : (
                            'Join Lease'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowJoinLeaseModal(false)}
                          disabled={isJoining}
                          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition.Root>
      </div>
    </div>
  );
} 