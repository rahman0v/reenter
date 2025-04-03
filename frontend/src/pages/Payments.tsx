import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentService, leaseService } from '../services/api';
import { Dialog, Transition } from '@headlessui/react';
import {
  BanknotesIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  UserIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

// Types
type ViewMode = 'tenant' | 'landlord';
type Currency = string;
type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'upcoming';
type PaymentMethod = string;
type TransferMethod = string;

interface APILease {
  id: string;
  property_name: string;
  tenant_name?: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  currency: Currency;
  status: string;
}

interface Lease extends APILease {
  ref_code: string;
  landlord_id: string;
  property_address: string;
  premium: number;
  created_at: string;
}

interface Payment {
  id: string;
  property_name: string;
  counterparty_name: string;
  due_date: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  payment_method?: PaymentMethod;
  transfer_method?: TransferMethod;
  transfer_ref?: string;
  commission_amount?: number;
  tax_amount?: number;
  total_amount: number;
  receipt_url?: string;
  created_at?: string;
}

interface SummaryCardProps {
  title: string;
  amount: number;
  currency: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isNegative?: boolean;
}

interface PaymentDetailsModalProps {
  payment: Payment;
  isOpen: boolean;
  onClose: () => void;
  viewMode: ViewMode;
}

// Helper Components
const SummaryCard = ({ title, amount, currency, icon: Icon, trend, isNegative }: SummaryCardProps) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
        </div>
      </div>
      <div className="ml-4 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-600 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <div className={`text-2xl font-semibold ${isNegative ? 'text-red-600' : 'text-gray-900'}`}>
              {currency} {Math.abs(amount).toLocaleString()}
            </div>
            {trend && (
              <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '↑' : '↓'} {trend.value}%
              </div>
            )}
          </dd>
        </dl>
      </div>
    </div>
  </div>
);

const isLease = (data: any): data is Lease => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'property_name' in data &&
    'start_date' in data &&
    'end_date' in data &&
    'monthly_rent' in data &&
    'currency' in data &&
    'status' in data &&
    'ref_code' in data &&
    'landlord_id' in data &&
    'property_address' in data &&
    'premium' in data &&
    'created_at' in data
  );
};

const PaymentDetailsModal = ({ payment, isOpen, onClose, viewMode }: PaymentDetailsModalProps) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Payment Details
                </Dialog.Title>
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500">Property</p>
                    <p className="text-sm text-gray-900">{payment.property_name}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500">
                      {viewMode === 'tenant' ? 'Landlord' : 'Tenant'}
                    </p>
                    <p className="text-sm text-gray-900">{payment.counterparty_name}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500">Due Date</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(payment.due_date)}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500">Monthly Rent</p>
                    <p className="text-sm text-gray-900">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </p>
                  </div>
                  {viewMode === 'tenant' && payment.commission_amount && (
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-500">Platform Premium (8.5%)</p>
                      <p className="text-sm text-gray-900">
                        {payment.currency} {payment.commission_amount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {viewMode === 'landlord' && payment.tax_amount && (
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-500">Tax Deduction (21%)</p>
                      <p className="text-sm text-gray-900">
                        {payment.currency} {payment.tax_amount.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700">
                      {viewMode === 'tenant' ? 'Total to Pay' : 'Net Amount'}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {payment.currency} {payment.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900">
                      {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                    </p>
                  </div>
                  {payment.payment_method && (
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-500">Payment Method</p>
                      <p className="text-sm text-gray-900">
                        {payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1)} ••••
                      </p>
                    </div>
                  )}
                  {payment.transfer_method && (
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-500">Transfer Method</p>
                      <p className="text-sm text-gray-900">{payment.transfer_method}</p>
                    </div>
                  )}
                  {payment.transfer_ref && (
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-500">Reference</p>
                      <p className="text-sm text-gray-900">{payment.transfer_ref}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

const PaymentCard = ({ payment, viewMode }: { payment: Payment; viewMode: ViewMode }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{payment.property_name}</h3>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            payment.status === 'paid' ? 'bg-green-50 text-green-700' :
            payment.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
            payment.status === 'overdue' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-600">
              {viewMode === 'tenant' ? 'Landlord' : 'Tenant'}:
            </p>
            <p className="text-sm text-gray-900">{payment.counterparty_name}</p>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-600">Due Date:</p>
            <p className="text-sm text-gray-900">
              {new Date(payment.due_date).toLocaleDateString()}
            </p>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-600">Monthly Rent:</p>
            <p className="text-sm text-gray-900">
              {payment.currency} {Math.round(payment.amount).toLocaleString()}
            </p>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-600">
              {viewMode === 'tenant' ? 'Platform Premium' : 'Tax Deduction'}:
            </p>
            <p className="text-sm text-gray-900">
              {payment.currency} {Math.round(viewMode === 'tenant' ? payment.commission_amount || 0 : payment.tax_amount || 0).toLocaleString()}
            </p>
          </div>
          <div className="flex justify-between items-center py-2">
            <p className="text-sm font-medium text-gray-600">
              {viewMode === 'tenant' ? 'Total to Pay' : 'Net Amount'}:
            </p>
            <p className="text-sm font-semibold text-gray-900">
              {payment.currency} {Math.round(payment.total_amount).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          {viewMode === 'tenant' && payment.status !== 'paid' && (
            <button
              onClick={() => {/* Handle payment */}}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Pay Now
            </button>
          )}
          {payment.receipt_url && (
            <button
              onClick={() => window.open(payment.receipt_url, '_blank')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5" />
              Receipt
            </button>
          )}
          <button
            onClick={() => setShowDetails(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            View Details
          </button>
        </div>
      </div>
      <PaymentDetailsModal
        payment={payment}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        viewMode={viewMode}
      />
    </div>
  );
};

const EmptyState = ({ viewMode }: { viewMode: ViewMode }) => (
  <div className="text-center py-12">
    <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">No {viewMode === 'tenant' ? 'payments' : 'payouts'} yet</h3>
    <p className="mt-1 text-sm text-gray-500">
      {viewMode === 'tenant'
        ? "You haven't made any payments yet. Once your lease begins, payments will show here."
        : "You haven't received any payouts yet. Once your tenants make payments, they will show here."}
    </p>
  </div>
);

// Main Component
export default function Payments() {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('tenant');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentsFromLeases();
  }, [viewMode]);

  const fetchPaymentsFromLeases = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch leases based on view mode
      const apiLeases = await leaseService.getAllLeases();
      
      // Filter and validate leases
      const validLeases = apiLeases.filter((lease): lease is APILease => {
        return Boolean(
          lease.start_date &&
          lease.end_date &&
          lease.currency &&
          lease.landlord_name &&
          lease.tenant_name &&
          (viewMode === 'tenant'
            ? lease.tenant_name === currentUser?.name
            : lease.landlord_name === currentUser?.name)
        );
      });

      // Generate payments for each lease
      const allPayments = validLeases.flatMap(lease => {
        const startDate = new Date(lease.start_date);
        const endDate = new Date(lease.end_date);
        const today = new Date();
        const payments: Payment[] = [];
        
        let currentDate = new Date(startDate);
        let paymentId = 1;

        while (currentDate <= endDate) {
          const dueDate = new Date(currentDate);
          const isPaid = currentDate < today;
          const isOverdue = !isPaid && currentDate < today;
          const isUpcoming = currentDate > today && currentDate <= new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);

          const status: PaymentStatus = isPaid ? 'paid' 
            : isOverdue ? 'overdue'
            : isUpcoming ? 'upcoming'
            : 'pending';

          const baseAmount = Math.round(lease.monthly_rent);
          const commissionAmount = viewMode === 'tenant' ? Math.round(baseAmount * 0.085) : undefined;
          const taxAmount = viewMode === 'landlord' ? Math.round(baseAmount * 0.21) : undefined;
          const totalAmount = viewMode === 'tenant' 
            ? baseAmount + (commissionAmount || 0)
            : baseAmount - (taxAmount || 0);

          payments.push({
            id: `${lease.id}-${paymentId}`,
            lease_id: lease.id,
            property_name: lease.property_name,
            counterparty_name: viewMode === 'tenant' ? lease.landlord_name : lease.tenant_name,
            amount: baseAmount,
            commission_amount: commissionAmount,
            tax_amount: taxAmount,
            total_amount: totalAmount,
            currency: lease.currency,
            due_date: dueDate.toISOString(),
            status,
            payment_method: isPaid ? 'visa' as const : undefined,
            transfer_method: isPaid ? 'bank_transfer' as const : undefined,
            transfer_ref: isPaid ? `TR${lease.id}${paymentId}` : undefined,
            receipt_url: isPaid ? '#' : undefined,
            created_at: isPaid ? dueDate.toISOString() : undefined,
          });

          currentDate.setMonth(currentDate.getMonth() + 1);
          paymentId++;
        }

        return payments;
      });

      // Sort payments by due date (ascending order - oldest to newest)
      const sortedPayments = allPayments.sort((a, b) => 
        new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
      );

      setPayments(sortedPayments);
    } catch (err) {
      setError('Failed to fetch payments. Please try again.');
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const now = new Date();
    const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    return {
      totalAmount: payments.reduce((sum, p) => sum + (p.status === 'paid' ? p.total_amount : 0), 0),
      upcomingDue: payments
        .filter(p => {
          const dueDate = new Date(p.due_date);
          return p.status !== 'paid' && dueDate <= tenDaysFromNow;
        })
        .reduce((sum, p) => sum + p.total_amount, 0),
      overdue: payments
        .filter(p => p.status === 'overdue')
        .reduce((sum, p) => sum + p.total_amount, 0),
      lastPayment: payments
        .filter(p => p.status === 'paid')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.total_amount || 0
    };
  };

  const summary = calculateSummary();

  const filteredPayments = payments.filter(payment => {
    if (statusFilter !== 'all' && payment.status !== statusFilter) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        payment.property_name.toLowerCase().includes(query) ||
        payment.counterparty_name.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {viewMode === 'tenant' ? 'Payments' : 'Payouts'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {viewMode === 'tenant'
              ? 'Manage your rental payments and view payment history'
              : 'Track your rental income and payout history'}
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

        {/* View Mode Tabs */}
        <div className="mb-8">
          <div className="sm:hidden">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="tenant">As Tenant</option>
              <option value="landlord">As Landlord</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <nav className="flex space-x-4" aria-label="Tabs">
              <button
                onClick={() => setViewMode('tenant')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  viewMode === 'tenant'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                As Tenant
              </button>
              <button
                onClick={() => setViewMode('landlord')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  viewMode === 'landlord'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                As Landlord
              </button>
            </nav>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <SummaryCard
            title={viewMode === 'tenant' ? 'Total Paid' : 'Total Payouts'}
            amount={summary.totalAmount}
            currency="₺"
            icon={BanknotesIcon}
          />
          <SummaryCard
            title="Upcoming Due"
            amount={summary.upcomingDue}
            currency="₺"
            icon={ClockIcon}
          />
          {summary.overdue > 0 && (
            <SummaryCard
              title="Overdue"
              amount={summary.overdue}
              currency="₺"
              icon={ExclamationCircleIcon}
              isNegative
            />
          )}
          <SummaryCard
            title={viewMode === 'tenant' ? 'Last Payment' : 'Last Transfer'}
            amount={summary.lastPayment}
            currency="₺"
            icon={ArrowDownTrayIcon}
          />
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
                placeholder={`Search ${viewMode === 'tenant' ? 'payments' : 'payouts'}...`}
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
              className="block w-full rounded-lg border-gray-300 py-2 pl-3 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow duration-200"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>
        </div>

        {/* Payments/Payouts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm text-blue-600 transition ease-in-out duration-150 cursor-not-allowed">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <EmptyState viewMode={viewMode} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPayments.map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 