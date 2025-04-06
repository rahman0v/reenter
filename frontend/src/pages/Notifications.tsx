import React from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { currentUser } = useAuth();
  
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">
          Stay updated with important information about your rental
        </p>
      </div>
      
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="p-10 text-center text-gray-500">
          <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Under Development</h3>
          <p>This feature is currently under development. Please check back later.</p>
        </div>
      </div>
    </div>
  );
} 