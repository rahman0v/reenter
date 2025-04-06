import React, { useState, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CheckIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface SignatureCanvasProps {
  onSignatureCapture: (signatureData: string) => void;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({ onSignatureCapture }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    setHasSignature(true);
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    
    // Get coordinates based on event type
    let x, y;
    if ('touches' in e) {
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get coordinates based on event type
    let x, y;
    if ('touches' in e) {
      e.preventDefault(); // Prevent scrolling while drawing
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasSignature) {
      // Capture signature as data URL
      const signatureData = canvas.toDataURL('image/png');
      onSignatureCapture(signatureData);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureCapture('');
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Set drawing style
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#111827';
    }
    
    // Handle window resize
    const handleResize = () => {
      if (canvas) {
        const tempImg = document.createElement('img');
        tempImg.src = canvas.toDataURL('image/png');
        
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        
        if (ctx) {
          ctx.lineWidth = 2;
          ctx.lineCap = 'round';
          ctx.strokeStyle = '#111827';
          
          // Redraw signature if it exists
          if (hasSignature) {
            tempImg.onload = () => {
              ctx.drawImage(tempImg, 0, 0, canvas.width, canvas.height);
            };
          }
        }
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hasSignature]);

  return (
    <div className="signature-container">
      <div className="relative border-2 border-gray-300 border-dashed rounded-lg p-1 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full h-40 touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            <PencilIcon className="h-5 w-5 mr-2" />
            <span>Sign here</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={clearCanvas}
          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowPathIcon className="h-4 w-4 mr-1" />
          Clear
        </button>
      </div>
    </div>
  );
};

interface LeaseSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (signatureData: string) => Promise<void>;
  userRole: 'landlord' | 'tenant';
  propertyName: string;
}

const LeaseSignatureModal: React.FC<LeaseSignatureModalProps> = ({
  isOpen,
  onClose,
  onSign,
  userRole,
  propertyName
}) => {
  const [signatureData, setSignatureData] = useState('');
  const [error, setError] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  
  const handleSignatureCapture = (data: string) => {
    setSignatureData(data);
    setError('');
  };
  
  const handleSubmit = async () => {
    if (!signatureData) {
      setError('Please provide your signature before continuing');
      return;
    }
    
    setIsSigning(true);
    setError('');
    
    try {
      await onSign(signatureData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign the lease');
    } finally {
      setIsSigning(false);
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
                      Sign Lease Agreement
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        By signing this lease agreement for <strong>{propertyName}</strong>, you confirm that you have read
                        and agree to all terms and conditions as a {userRole}.
                      </p>
                      
                      <div className="mt-4">
                        <SignatureCanvas onSignatureCapture={handleSignatureCapture} />
                      </div>
                      
                      {error && (
                        <div className="mt-2 text-sm text-red-600">{error}</div>
                      )}
                      
                      <p className="mt-4 text-xs text-gray-500">
                        This digital signature will be legally binding. Your IP address and device information
                        will be recorded with this signature for verification purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isSigning ? 'opacity-75 cursor-not-allowed' : ''}`}
                  onClick={handleSubmit}
                  disabled={isSigning}
                >
                  {isSigning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5 mr-1" />
                      Sign Agreement
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                  disabled={isSigning}
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

export default LeaseSignatureModal; 