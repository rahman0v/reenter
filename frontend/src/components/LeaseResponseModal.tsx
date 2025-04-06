import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface LeaseResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRespond: (accepted: boolean, message: string) => Promise<void>;
  requestDetails: {
    requesterName: string;
    changes: string;
    message: string;
  };
  propertyName: string;
}

const LeaseResponseModal: React.FC<LeaseResponseModalProps> = ({
  isOpen,
  onClose,
  onRespond,
  requestDetails,
  propertyName
}) => {
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseType, setResponseType] = useState<'accept' | 'reject' | null>(null);
  
  const handleSubmit = async (accepted: boolean) => {
    if (!responseMessage.trim()) {
      setError('Please provide a response message');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      await onRespond(accepted, responseMessage.trim());
      // Reset form on success
      setResponseMessage('');
      setResponseType(null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={onClose}>
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
              <div className="absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Respond to Change Request
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {requestDetails.requesterName} has requested changes to the lease agreement for <strong>{propertyName}</strong>.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Requested Changes:</h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{requestDetails.changes}</p>
                    
                    <h4 className="text-sm font-medium text-gray-700 mt-4 mb-2">Explanation:</h4>
                    <p className="text-sm text-gray-600">{requestDetails.message}</p>
                  </div>
                  
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-700">Your Response:</span>
                    <div className="mt-2 flex space-x-4">
                      <button
                        type="button"
                        onClick={() => setResponseType('accept')}
                        className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                          responseType === 'accept'
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <CheckIcon className="h-5 w-5 mr-2" />
                        Accept Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setResponseType('reject')}
                        className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                          responseType === 'reject'
                            ? 'bg-red-50 border-red-500 text-red-700'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        Reject Changes
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label htmlFor="response-message" className="block text-sm font-medium text-gray-700">
                      Response Message
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="response-message"
                        name="response-message"
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Please provide your response to the requested changes"
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mt-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center text-sm">
                      <XCircleIcon className="h-5 w-5 mr-2 text-red-400" />
                      {error}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {responseType === 'accept' && (
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting || !responseMessage.trim()}
                  >
                    {isSubmitting ? 'Submitting...' : 'Accept Changes'}
                  </button>
                )}
                
                {responseType === 'reject' && (
                  <button
                    type="button"
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting || !responseMessage.trim()}
                  >
                    {isSubmitting ? 'Submitting...' : 'Reject Changes'}
                  </button>
                )}
                
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default LeaseResponseModal; 