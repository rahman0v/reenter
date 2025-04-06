import React from 'react';
import { useAuth } from '../context/AuthContext';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Messages() {
  const { currentUser } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">
          View and manage your messages
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="p-10 text-center text-gray-500">
          <EnvelopeIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Under Development</h3>
          <p>This feature is currently under development. Please check back later.</p>
        </div>
      </div>
    </div>
  );
} 