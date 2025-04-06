import React from 'react';
import { LeaseEvent } from '../services/api';
import { format } from 'date-fns';
import { 
  DocumentIcon, 
  PencilIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';

interface LeaseEventsProps {
  events: LeaseEvent[];
  isLoading: boolean;
}

const getEventIcon = (eventType: string) => {
  switch (eventType) {
    case 'created':
      return <DocumentIcon className="h-5 w-5 text-blue-500" />;
    case 'status_updated':
      return <ClockIcon className="h-5 w-5 text-yellow-500" />;
    case 'changes_requested':
      return <PencilIcon className="h-5 w-5 text-orange-500" />;
    case 'changes_accepted':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    case 'changes_rejected':
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    case 'signed':
      return <DocumentCheckIcon className="h-5 w-5 text-green-600" />;
    case 'cancelled':
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
    default:
      return <UserIcon className="h-5 w-5 text-gray-500" />;
  }
};

const getEventTitle = (event: LeaseEvent) => {
  const details = event.details;
  
  switch (event.event_type) {
    case 'created':
      return 'Lease was created';
    case 'status_updated':
      return `Status changed to "${details.status || 'unknown'}"`;
    case 'changes_requested':
      return 'Changes were requested';
    case 'changes_accepted':
      return 'Changes were accepted';
    case 'changes_rejected':
      return 'Changes were rejected';
    case 'signed':
      return `Signed by ${details.role === 'landlord' ? 'landlord' : 'tenant'}`;
    case 'cancelled':
      return 'Lease was cancelled';
    default:
      return event.event_type.replace(/_/g, ' ');
  }
};

const getEventDescription = (event: LeaseEvent) => {
  if (!event.details) return null;
  
  const details = event.details;
  
  switch (event.event_type) {
    case 'changes_requested':
      return (
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-medium">Requested Changes:</p>
          <p className="whitespace-pre-wrap">{details.changes}</p>
          {details.message && (
            <>
              <p className="font-medium mt-2">Explanation:</p>
              <p>{details.message}</p>
            </>
          )}
        </div>
      );
    case 'changes_accepted':
    case 'changes_rejected':
      return details.message ? (
        <div className="mt-2 text-sm text-gray-600">
          <p className="font-medium">Response:</p>
          <p>{details.message}</p>
        </div>
      ) : null;
    default:
      return null;
  }
};

const LeaseEvents: React.FC<LeaseEventsProps> = ({ events, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-4 px-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-4 px-6 text-center text-gray-500">
        No lease events to display
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-0 bottom-0 left-6 w-0.5 bg-gray-200 z-0"></div>
      
      <ul className="relative z-10">
        {events.map((event) => (
          <li key={event.id} className="relative pb-6">
            <div className="relative flex items-start space-x-3">
              <div className="relative px-1">
                <div className="h-8 w-8 bg-white rounded-full ring-8 ring-white flex items-center justify-center">
                  {getEventIcon(event.event_type)}
                </div>
              </div>
              <div className="min-w-0 flex-1 bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {getEventTitle(event)}
                    </div>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {format(new Date(event.created_at), 'MMM d, yyyy h:mm a')}
                    {event.user_name && ` • By ${event.user_name}`}
                  </p>
                  {getEventDescription(event)}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LeaseEvents; 