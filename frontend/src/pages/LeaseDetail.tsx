import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DocumentIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ClockIcon,
  PencilSquareIcon,
  ChatBubbleLeftRightIcon,
  DocumentCheckIcon,
  ArrowPathIcon,
  UserIcon,
  PrinterIcon,
  CheckIcon,
  XMarkIcon,
  ShareIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { leaseService, userService } from '../services/api';
import type { Lease, LeaseEvent, LeaseChangeRequest, LeaseStatus } from '../services/api';
import LeaseEvents from '../components/LeaseEvents';
import LeaseSignatureModal from '../components/LeaseSignatureModal';
import LeaseChangeRequestModal from '../components/LeaseChangeRequestModal';
import LeaseResponseModal from '../components/LeaseResponseModal';
import LeasePrintModal from '../components/LeasePrintModal';

// Status Badge component
const StatusBadge = ({ status }: { status: LeaseStatus }) => {
  let color;
  let label;

  switch (status) {
    case 'draft':
      color = 'bg-gray-100 text-gray-800';
      label = 'Draft';
      break;
    case 'pending':
      color = 'bg-blue-100 text-blue-800';
      label = 'Pending Review';
      break;
    case 'awaiting_landlord_signature':
      color = 'bg-purple-100 text-purple-800';
      label = 'Awaiting Landlord Signature';
      break;
    case 'awaiting_tenant_signature':
      color = 'bg-indigo-100 text-indigo-800';
      label = 'Awaiting Tenant Signature';
      break;
    case 'changes_requested':
      color = 'bg-yellow-100 text-yellow-800';
      label = 'Changes Requested';
      break;
    case 'active':
      color = 'bg-green-100 text-green-800';
      label = 'Active';
      break;
    case 'completed':
      color = 'bg-teal-100 text-teal-800';
      label = 'Completed';
      break;
    case 'terminated':
      color = 'bg-red-100 text-red-800';
      label = 'Terminated';
      break;
    case 'cancelled':
      color = 'bg-gray-100 text-gray-800';
      label = 'Cancelled';
      break;
    default:
      color = 'bg-gray-100 text-gray-800';
      label = status;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};

// Main component
const LeaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lease, setLease] = useState<Lease | null>(null);
  const [events, setEvents] = useState<LeaseEvent[]>([]);
  const [changeRequests, setChangeRequests] = useState<LeaseChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [userRole, setUserRole] = useState<'landlord' | 'tenant'>('landlord');
  
  // Modals state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [isChangeRequestModalOpen, setIsChangeRequestModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedChangeRequest, setSelectedChangeRequest] = useState<LeaseChangeRequest | null>(null);
  
  // Action states
  const [isSigning, setIsSigning] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Add print modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [leaseSignatures, setLeaseSignatures] = useState<{
    landlord?: { name: string; signature: string; date: string };
    tenant?: { name: string; signature: string; date: string };
  }>({});

  // Add tenant info editing state
  const [tenantInfo, setTenantInfo] = useState({
    fullName: '',
    tcId: '',
    email: '',
    phone: ''
  });
  const [isEditingTenantInfo, setIsEditingTenantInfo] = useState(false);
  const [isSavingTenantInfo, setIsSavingTenantInfo] = useState(false);
  
  // Add a new modal state for invite tenant
  const [isInviteTenantModalOpen, setIsInviteTenantModalOpen] = useState(false);

  // Add currentUser state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Determine if user is the landlord or tenant
  useEffect(() => {
    // Get the actual user ID from auth context/state
    if (lease && currentUser) {
      console.log('Current user ID:', currentUser.id, 'Landlord ID:', lease.landlord_id, 'Tenant ID:', lease.tenant_id);
      
      if (lease.landlord_id === currentUser.id) {
        setUserRole('landlord');
        console.log('User role set to: landlord');
      } else if (lease.tenant_id === currentUser.id) {
        setUserRole('tenant');
        console.log('User role set to: tenant');
      } else {
        console.log('User does not match either role');
      }
    }
  }, [lease, currentUser]);

  // Fetch lease data and events
  useEffect(() => {
    const fetchLeaseData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const leaseId = parseInt(id);
        console.log('Fetching lease data for ID:', leaseId);
        
        // First fetch just the lease for faster display
        const leaseData = await leaseService.getLeaseById(leaseId);
        console.log('Lease data received:', leaseData);
        
        // Ensure template_data exists and has all required properties
        const normalizedLeaseData = {
          ...leaseData,
          template_data: {
            utilities_included: [],
            pets_allowed: false,
            smoking_allowed: false,
            notice_period_days: 30,
            additional_terms: '',
            ...(leaseData.template_data || {})
          }
        };
        
        console.log('Normalized lease data:', normalizedLeaseData);
        setLease(normalizedLeaseData);
        
        // After setting the lease, fetch the events and requests
        try {
          const [eventsData, requestsData] = await Promise.all([
            leaseService.getLeaseEvents(leaseId),
            leaseService.getChangeRequests(leaseId)
          ]);
          
          setEvents(eventsData);
          setChangeRequests(requestsData);
        } catch (secondaryError) {
          console.error('Error fetching secondary data:', secondaryError);
          // Don't set error state for secondary data - we still have the main lease data
        }
      } catch (err: any) {
        console.error('Error fetching lease data:', err);
        setError(err.response?.data?.msg || 'Failed to load lease data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaseData();
  }, [id]);

  // Fetch signatures - example implementation
  useEffect(() => {
    const fetchSignatures = async () => {
      if (!lease || !id) return;
      
      try {
        // In a real implementation, you would fetch the signatures from the backend
        // For now, we'll use mock data based on the lease status
        if (lease.status === 'active' || lease.status === 'completed') {
          setLeaseSignatures({
            landlord: {
              name: lease.landlord_name || 'Landlord',
              signature: 'data:image/png;base64,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',
              date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            },
            tenant: {
              name: lease.tenant_name || 'Tenant',
              signature: 'data:image/png;base64,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',
              date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            }
          });
        } else if (lease.status === 'awaiting_tenant_signature') {
          setLeaseSignatures({
            landlord: {
              name: lease.landlord_name || 'Landlord',
              signature: 'data:image/png;base64,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',
              date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })
            }
          });
        }
      } catch (err) {
        console.error('Error fetching signatures:', err);
      }
    };
    
    fetchSignatures();
  }, [lease, id]);

  const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
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

  // Handle lease signing
  const handleSignLease = async (signatureData: string) => {
    if (!lease || !id) return;
    
    setIsSigning(true);
    
    try {
      const leaseId = parseInt(id);
      const updatedLease = await leaseService.signLease(leaseId, signatureData);
      
      // Refresh data
      setLease(updatedLease);
      const [eventsData, requestsData] = await Promise.all([
        leaseService.getLeaseEvents(leaseId),
        leaseService.getChangeRequests(leaseId)
      ]);
      
      setEvents(eventsData);
      setChangeRequests(requestsData);
      
      setIsSignatureModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to sign lease');
    } finally {
      setIsSigning(false);
    }
  };
  
  // Handle change request
  const handleChangeRequest = async (changes: string, message: string) => {
    if (!lease || !id) return;
    
    setIsSubmittingRequest(true);
    
    try {
      const leaseId = parseInt(id);
      await leaseService.requestChanges(leaseId, { changes }, message);
      
      // Refresh data
      const [leaseData, eventsData, requestsData] = await Promise.all([
        leaseService.getLeaseById(leaseId),
        leaseService.getLeaseEvents(leaseId),
        leaseService.getChangeRequests(leaseId)
      ]);
      
      setLease(leaseData);
      setEvents(eventsData);
      setChangeRequests(requestsData);
      
      setIsChangeRequestModalOpen(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit change request');
    } finally {
      setIsSubmittingRequest(false);
    }
  };
  
  // Handle response to change request
  const handleResponseToChangeRequest = async (accepted: boolean, message: string) => {
    if (!lease || !id || !selectedChangeRequest) return;
    
    setIsSubmittingResponse(true);
    
    try {
      const leaseId = parseInt(id);
      await leaseService.respondToChangeRequest(
        selectedChangeRequest.id, 
        accepted, 
        message
      );
      
      // Refresh data
      const [leaseData, eventsData, requestsData] = await Promise.all([
        leaseService.getLeaseById(leaseId),
        leaseService.getLeaseEvents(leaseId),
        leaseService.getChangeRequests(leaseId)
      ]);
      
      setLease(leaseData);
      setEvents(eventsData);
      setChangeRequests(requestsData);
      
      setIsResponseModalOpen(false);
      setSelectedChangeRequest(null);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to respond to change request');
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  // Add function to handle tenant info submission
  const handleTenantInfoSubmit = async () => {
    if (!lease || !id) return;
    
    setIsSavingTenantInfo(true);
    
    try {
      const leaseId = parseInt(id);
      // Call the updateTenantInfo API method
      const updatedLease = await leaseService.updateTenantInfo(leaseId, {
        fullName: tenantInfo.fullName,
        tcId: tenantInfo.tcId,
        email: tenantInfo.email,
        phone: tenantInfo.phone
      });
      
      setLease(updatedLease);
      setIsEditingTenantInfo(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to update tenant information');
    } finally {
      setIsSavingTenantInfo(false);
    }
  };

  // Add function to handle accept lease with fixed status string
  const handleAcceptLease = async () => {
    if (!lease || !id) return;
    
    try {
      const leaseId = parseInt(id);
      // Use the correct status from the valid status transitions
      const updatedLease = await leaseService.updateLeaseStatus(leaseId, 'awaiting_landlord_signature');
      
      // Refresh data
      setLease(updatedLease);
      const eventsData = await leaseService.getLeaseEvents(leaseId);
      setEvents(eventsData);
      
      alert('Lease accepted. Waiting for landlord confirmation.');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to accept lease. The server may be experiencing issues.');
    }
  };

  // Add function to reject the lease (for tenant)
  const handleRejectLease = async () => {
    if (!lease || !id) return;
    
    if (!confirm('Are you sure you want to reject this lease? This action cannot be undone.')) {
      return;
    }
    
    try {
      const leaseId = parseInt(id);
      // Update status to "cancelled"
      const updatedLease = await leaseService.updateLeaseStatus(leaseId, 'cancelled');
      
      // Refresh data
      setLease(updatedLease);
      const eventsData = await leaseService.getLeaseEvents(leaseId);
      setEvents(eventsData);
      
      alert('Lease has been rejected.');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to reject lease');
    }
  };

  // Add function for landlord to confirm the lease
  const handleConfirmLease = async () => {
    if (!lease || !id) return;
    
    try {
      const leaseId = parseInt(id);
      // Update status to "active"
      const updatedLease = await leaseService.updateLeaseStatus(leaseId, 'active');
      
      // Refresh data
      setLease(updatedLease);
      const eventsData = await leaseService.getLeaseEvents(leaseId);
      setEvents(eventsData);
      
      alert('Lease has been activated successfully.');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to activate lease');
    }
  };

  // Add InviteTenantModal component before the return statement
  const InviteTenantModal = ({ isOpen, onClose, refCode }: { isOpen: boolean; onClose: () => void; refCode: string }) => {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(refCode);
      alert('Reference code copied to clipboard!');
    };

    const shareByEmail = () => {
      const subject = encodeURIComponent('Join my lease on Reenter');
      const body = encodeURIComponent(`Hello,\n\nI've created a lease on Reenter and would like to invite you to join. Please use the following reference code: ${refCode}\n\nYou can join by visiting https://reenter.app/leases and clicking "Join a Lease".\n\nThank you!`);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    };

    const shareByWhatsApp = () => {
      const text = encodeURIComponent(`Hello! I've created a lease on Reenter and would like to invite you to join. Please use the following reference code: ${refCode}. You can join by visiting https://reenter.app/leases and clicking "Join a Lease".`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Invite Tenant</h3>
          </div>
          <div className="px-6 py-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Share this reference code with your tenant to join the lease:</p>
              <div className="flex items-center">
                <div className="bg-gray-100 py-2 px-4 rounded-md text-lg font-mono font-bold text-center flex-grow">
                  {refCode}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                  title="Copy to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-3">Share via:</p>
              <div className="flex space-x-3">
                <button
                  onClick={shareByEmail}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <EnvelopeIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Email
                </button>
                <button
                  onClick={shareByWhatsApp}
                  className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <svg className="h-5 w-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await userService.getProfile();
        console.log('Current user data:', userData);
        setCurrentUser(userData);
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };
    
    fetchCurrentUser();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-8 flex items-center justify-center">
        <ClockIcon className="h-8 w-8 text-blue-500 animate-pulse mr-2" />
        <p className="text-lg text-gray-700">Loading lease details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 shadow rounded-lg p-8">
        <div className="flex items-center mb-4">
          <ExclamationCircleIcon className="h-8 w-8 text-red-500 mr-2" />
          <h2 className="text-xl font-semibold text-red-700">Error Loading Lease</h2>
        </div>
        <p className="text-gray-700">{error}</p>
        <p className="text-gray-700 mt-2">Lease ID: {id}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Try Again
        </button>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
        Lease not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lease Details</h1>
          <p className="text-sm text-gray-500">Reference: {lease.ref_code}</p>
        </div>
        <div className="flex items-center">
          <StatusBadge status={lease.status} />
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'details'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <DocumentIcon className="h-5 w-5 mr-2" />
              Lease Details
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('history')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 mr-2" />
              History & Events
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('changes')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'changes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              Change Requests
              {changeRequests.filter(req => req.status === 'pending').length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                  {changeRequests.filter(req => req.status === 'pending').length}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Lease Actions */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Available Actions</h2>
        <div className="flex flex-wrap gap-2">
          {lease?.status === 'draft' && (
            <>
              <button 
                onClick={() => navigate(`/leases/create?edit=${lease.id}`)} 
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                Edit Draft
              </button>
              {userRole === 'landlord' && (
                <button 
                  onClick={() => setIsInviteTenantModalOpen(true)} 
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <UserIcon className="h-4 w-4 mr-1" />
                  Invite Tenant
                </button>
              )}
              {userRole === 'landlord' && lease.tenant_id && (
                <button className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
                  <ArrowPathIcon className="h-4 w-4 mr-1" />
                  Submit for Review
                </button>
              )}
            </>
          )}

          {/* Tenant Actions - Accept, Request Changes, Reject */}
          {userRole === 'tenant' && lease?.status === 'pending' && (
            <>
              <button 
                onClick={handleAcceptLease}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Accept Lease
              </button>
              <button 
                onClick={() => setIsChangeRequestModalOpen(true)}
                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                Request Changes
              </button>
              <button 
                onClick={handleRejectLease}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Reject Lease
              </button>
            </>
          )}

          {/* Landlord Confirmation Action */}
          {userRole === 'landlord' && lease?.status === 'awaiting_landlord_signature' && (
            <button 
              onClick={handleConfirmLease}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckIcon className="h-4 w-4 mr-1" />
              Confirm Lease
            </button>
          )}

          {(lease?.status === 'awaiting_landlord_signature' && userRole === 'landlord') || 
           (lease?.status === 'awaiting_tenant_signature' && userRole === 'tenant') && (
            <button 
              onClick={() => setIsSignatureModalOpen(true)}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <DocumentCheckIcon className="h-4 w-4 mr-1" />
              Sign Lease
            </button>
          )}

          {lease && (
            <button 
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PrinterIcon className="h-4 w-4 mr-1" />
              Print Lease
            </button>
          )}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'details' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* 1. PARTIES section */}
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">1. PARTIES</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-y-6">
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Landlord:</div>
              <div className="text-sm text-gray-900 col-span-4">{lease.landlord_name}</div>
              
              {/* Tenant information section with editing capability */}
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2 flex justify-end items-start">
                <span>Tenant:</span>
                {userRole === 'tenant' && lease.status === 'pending' && (
                  <button
                    onClick={() => setIsEditingTenantInfo(!isEditingTenantInfo)}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {isEditingTenantInfo ? 'Cancel' : 'Edit'}
                  </button>
                )}
              </div>
              
              <div className="col-span-4">
                {isEditingTenantInfo ? (
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="fullName" className="block text-xs font-medium text-gray-500">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={tenantInfo.fullName}
                        onChange={(e) => setTenantInfo({...tenantInfo, fullName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="tcId" className="block text-xs font-medium text-gray-500">
                        TC ID
                      </label>
                      <input
                        type="text"
                        id="tcId"
                        value={tenantInfo.tcId}
                        onChange={(e) => setTenantInfo({...tenantInfo, tcId: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-500">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={tenantInfo.email}
                        onChange={(e) => setTenantInfo({...tenantInfo, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-xs font-medium text-gray-500">
                        Phone
                      </label>
                      <input
                        type="text"
                        id="phone"
                        value={tenantInfo.phone}
                        onChange={(e) => setTenantInfo({...tenantInfo, phone: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={handleTenantInfoSubmit}
                        disabled={isSavingTenantInfo}
                        className="inline-flex justify-center items-center px-2 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {isSavingTenantInfo ? 'Saving...' : 'Save Information'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-900">{lease.tenant_name || 'No tenant assigned'}</p>
                )}
              </div>
              
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Agreement Date:</div>
              <div className="text-sm text-gray-900 col-span-4">{formatDate(lease.created_at)}</div>
            </div>
          </div>

          {/* 2. PROPERTY section */}
          <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">2. PROPERTY</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-y-6">
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Property Name:</div>
              <div className="text-sm text-gray-900 col-span-4">{lease.property_name}</div>
              
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Property Address:</div>
              <div className="text-sm text-gray-900 col-span-4">{lease.property_address}</div>
            </div>
          </div>

          {/* 3. TERM section */}
          <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">3. TERM</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-y-6">
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Start Date:</div>
              <div className="text-sm text-gray-900 col-span-4">{formatDate(lease.start_date)}</div>
              
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">End Date:</div>
              <div className="text-sm text-gray-900 col-span-4">{formatDate(lease.end_date)}</div>
              
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Lease Duration:</div>
              <div className="text-sm text-gray-900 col-span-4">
                {Math.round((new Date(lease.end_date).getTime() - new Date(lease.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months
              </div>
            </div>
          </div>

          {/* 4. RENT section */}
          <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">4. RENT</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-6 gap-y-6">
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Monthly Rent:</div>
              <div className="text-sm text-gray-900 col-span-4 font-medium">{formatCurrency(lease.monthly_rent, lease.currency)}</div>
              
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Payment Day:</div>
              <div className="text-sm text-gray-900 col-span-4">
                {lease.payment_day ? 
                 `${lease.payment_day}${lease.payment_day === 1 ? 'st' : lease.payment_day === 2 ? 'nd' : lease.payment_day === 3 ? 'rd' : 'th'} day of each month` : 
                 '1st day of each month'}
              </div>
              
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Currency:</div>
              <div className="text-sm text-gray-900 col-span-4">{lease.currency}</div>
              
              <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">ReEnter Premium Fee:</div>
              <div className="text-sm text-gray-900 col-span-4">
                8.5% of rent ({formatCurrency(lease.monthly_rent * 0.085, lease.currency)} per month)
              </div>
            </div>
          </div>

          {/* 5. UTILITIES section - if applicable */}
          {lease.template_data && (
            <>
              <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">5. UTILITIES</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-6 gap-y-6">
                  <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Utilities Included in Rent:</div>
                  <div className="text-sm text-gray-900 col-span-4">
                    {lease.template_data.utilities_included && lease.template_data.utilities_included.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {lease.template_data.utilities_included.map((utility: string) => (
                          <span 
                            key={utility} 
                            className="inline-block bg-gray-100 text-gray-800 text-xs px-2.5 py-0.5 rounded"
                          >
                            {utility}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500">No utilities included in rent</span>
                    )}
                    <p className="mt-3 text-xs text-gray-500">
                      All utilities not explicitly included shall be the responsibility of the Tenant.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 6. POLICIES section */}
          {lease.template_data && (
            <>
              <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">6. POLICIES</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-6 gap-y-6">
                  <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Pets Allowed:</div>
                  <div className="text-sm text-gray-900 col-span-4">
                    {lease.template_data.pets_allowed ? 'Yes' : 'No'}
                  </div>
                  
                  <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2">Smoking Allowed:</div>
                  <div className="text-sm text-gray-900 col-span-4">
                    {lease.template_data.smoking_allowed ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 7. ADDITIONAL TERMS section */}
          {lease.template_data && (
            <>
              <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg leading-6 font-medium text-gray-900">7. ADDITIONAL TERMS</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-6 gap-y-6">
                  <div className="text-sm font-medium text-right text-gray-500 pr-4 col-span-2 self-start">Additional Terms & Conditions:</div>
                  <div className="text-sm text-gray-900 col-span-4 whitespace-pre-wrap">
                    {lease.template_data.additional_terms ? 
                      lease.template_data.additional_terms : 
                      <span className="text-gray-500">No additional terms specified</span>
                    }
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 8. STANDARD TERMS section */}
          <div className="px-4 py-5 sm:px-6 border-t border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">8. STANDARD TERMS</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700 leading-relaxed">
                The Reenter <a href="/legal?section=lease-agreements" target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline">Digital Lease Agreement</a> and Reenter <a href="/legal?section=terms-of-service" target="_blank" className="text-blue-600 hover:text-blue-800 hover:underline">Terms of Service</a> are automatically incorporated 
                into this lease and shall have full legal force and effect as if fully stated herein.
              </p>
              <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                This lease is subject to the laws and regulations of the Republic of Turkey, including the Turkish Code of Obligations (Türk Borçlar Kanunu).
              </p>
            </div>
          </div>
          
          {/* Lease actions at bottom-right */}
          <div className="border-t border-gray-200 px-4 py-4 sm:px-6 flex justify-end">
            <div className="flex gap-3">
              {lease && (
                <button 
                  onClick={() => setIsPrintModalOpen(true)}
                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PrinterIcon className="h-4 w-4 mr-1" />
                  Print Lease
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'history' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Lease History & Events</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <LeaseEvents events={events} isLoading={isLoading} />
          </div>
        </div>
      )}
      
      {activeTab === 'changes' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Change Requests</h3>
            {/* Only show New Request button to tenants, not to landlords who created the lease */}
            {userRole === 'tenant' && (
              <button 
                onClick={() => setIsChangeRequestModalOpen(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                New Request
              </button>
            )}
          </div>
          <div className="px-4 py-5 sm:p-6">
            {changeRequests.length === 0 ? (
              <p className="text-sm text-gray-500">No change requests have been made yet.</p>
            ) : (
              <div className="space-y-6">
                {changeRequests.map((request) => (
                  <div 
                    key={request.id}
                    className={`border rounded-lg overflow-hidden ${
                      request.status === 'pending' 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : request.status === 'accepted'
                          ? 'border-green-300 bg-green-50'
                          : 'border-red-300 bg-red-50'
                    }`}
                  >
                    <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                            request.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : request.status === 'accepted'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <span className="text-sm font-medium">
                          Request from {request.requested_by_name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Message:</h4>
                      <p className="text-sm text-gray-600 mb-4">{request.message || 'No message provided'}</p>
                      
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Requested Changes:</h4>
                      <div className="bg-white p-3 rounded border border-gray-200 mb-4 whitespace-pre-wrap">
                        <p className="text-sm text-gray-600">
                          {typeof request.requested_changes === 'string' 
                            ? request.requested_changes 
                            : JSON.stringify(request.requested_changes, null, 2)}
                        </p>
                      </div>
                      
                      {request.status === 'pending' && request.requested_by !== 1 && (
                        <div className="mt-4 flex justify-end space-x-3">
                          <button 
                            onClick={() => {
                              setSelectedChangeRequest(request);
                              setIsResponseModalOpen(true);
                            }}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Respond
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Modals */}
      {lease && (
        <>
          <LeaseSignatureModal
            isOpen={isSignatureModalOpen}
            onClose={() => setIsSignatureModalOpen(false)}
            onSign={handleSignLease}
            propertyName={lease.property_name}
            userRole={userRole}
          />
          
          <LeaseChangeRequestModal
            isOpen={isChangeRequestModalOpen}
            onClose={() => setIsChangeRequestModalOpen(false)}
            onSubmit={handleChangeRequest}
            propertyName={lease.property_name}
          />
          
          <InviteTenantModal
            isOpen={isInviteTenantModalOpen}
            onClose={() => setIsInviteTenantModalOpen(false)}
            refCode={lease.ref_code}
          />
          
          {selectedChangeRequest && (
            <LeaseResponseModal
              isOpen={isResponseModalOpen}
              onClose={() => {
                setIsResponseModalOpen(false);
                setSelectedChangeRequest(null);
              }}
              onRespond={handleResponseToChangeRequest}
              requestDetails={{
                requesterName: selectedChangeRequest.requested_by_name,
                changes: typeof selectedChangeRequest.requested_changes === 'string' 
                  ? selectedChangeRequest.requested_changes 
                  : JSON.stringify(selectedChangeRequest.requested_changes, null, 2),
                message: selectedChangeRequest.message || ''
              }}
              propertyName={lease.property_name}
            />
          )}
          
          <LeasePrintModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            lease={lease}
            signatures={leaseSignatures}
          />
        </>
      )}
    </div>
  );
};

export default LeaseDetail; 