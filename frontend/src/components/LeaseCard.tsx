import React from 'react';
import { Lease } from '../types';
import { formatDate } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

interface LeaseCardProps {
  lease: Lease;
  onDelete?: (id: number) => void;
  onJoin?: (id: number) => void;
  onConfirm?: (id: number) => void;
  onCancel?: (id: number) => void;
}

const LeaseCard: React.FC<LeaseCardProps> = ({ 
  lease, 
  onDelete, 
  onJoin, 
  onConfirm,
  onCancel 
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'awaiting_tenant_signature':
        return 'bg-blue-100 text-blue-800';
      case 'awaiting_landlord_signature':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'draft':
        return 'Draft';
      case 'pending':
        return 'Pending';
      case 'awaiting_tenant_signature':
        return 'Awaiting Tenant Signature';
      case 'awaiting_landlord_signature':
        return 'Awaiting Landlord Signature';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{lease.title}</h3>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(lease.status)}`}>
              {getStatusText(lease.status)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Lease ID: {lease.id}</p>
            <p className="text-sm text-gray-500">Created: {formatDate(lease.created_at)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Start Date</p>
            <p className="font-medium">{formatDate(lease.start_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">End Date</p>
            <p className="font-medium">{formatDate(lease.end_date)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Monthly Rent</p>
            <p className="font-medium">${lease.monthly_rent.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Security Deposit</p>
            <p className="font-medium">${lease.security_deposit.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {lease.status === 'draft' && (
            <>
              <button
                onClick={() => navigate(`/leases/create?edit=${lease.id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Draft
              </button>
              <button
                onClick={() => onDelete?.(lease.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Draft
              </button>
            </>
          )}
          
          {lease.status === 'pending' && onJoin && (
            <button
              onClick={() => onJoin(lease.id)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Join Lease
            </button>
          )}

          {lease.status === 'awaiting_landlord_signature' && onConfirm && (
            <button
              onClick={() => onConfirm(lease.id)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Confirm Lease
            </button>
          )}

          {['pending', 'awaiting_tenant_signature', 'awaiting_landlord_signature'].includes(lease.status) && onCancel && (
            <button
              onClick={() => onCancel(lease.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={() => navigate(`/leases/${lease.id}`)}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaseCard; 