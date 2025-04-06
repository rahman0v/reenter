import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { XMarkIcon } from '@heroicons/react/24/solid';

// Cookie consent options
type ConsentOption = 'accepted' | 'rejected' | 'pending';

export default function CookieConsent() {
  const [consent, setConsent] = useState<ConsentOption>('pending');
  const [visible, setVisible] = useState(false);

  // Check for saved consent preference on mount
  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent === 'accepted' || savedConsent === 'rejected') {
      setConsent(savedConsent);
    } else {
      // Only show the banner if no consent has been given yet
      setVisible(true);
    }
  }, []);

  // Save consent to localStorage
  const saveConsent = (option: ConsentOption) => {
    localStorage.setItem('cookie-consent', option);
    setConsent(option);
    setVisible(false);
    
    // If accepted, you would typically initialize your analytics/tracking scripts here
    if (option === 'accepted') {
      // Example: initialize Google Analytics or other tracking tools
      console.log('Cookies accepted: initializing tracking scripts');
    }
  };

  // Handle when user accepts all cookies
  const handleAccept = () => {
    saveConsent('accepted');
  };

  // Handle when user rejects non-essential cookies
  const handleReject = () => {
    saveConsent('rejected');
  };

  // Don't render anything if banner shouldn't be visible
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="md:flex items-center justify-between">
          <div className="mb-4 md:mb-0 md:max-w-3xl">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Cookie Policy</h3>
            <p className="text-sm text-gray-600">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies as described in our{' '}
              <Link to="/legal#privacy" state={{ cookiePolicy: true }} className="text-primary-600 hover:text-primary-700 underline">
                Cookie Policy
              </Link>.
            </p>
          </div>
          
          <div className="flex flex-shrink-0 space-x-3">
            <button
              onClick={handleReject}
              className="flex-1 md:flex-none px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Reject Non-Essential
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 md:flex-none px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Accept All
            </button>
            <Link
              to="/legal#privacy"
              state={{ cookiePolicy: true }}
              className="hidden md:inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              More Information
            </Link>
          </div>
          
          <button
            onClick={() => setVisible(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 md:hidden"
          >
            <span className="sr-only">Close</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
} 