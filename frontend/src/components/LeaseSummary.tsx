import React from 'react';
import { Lease } from '../services/api';

interface LeaseSummaryProps {
  lease: Lease;
  signatures?: {
    landlord?: {
      name: string;
      signature: string;
      date: string;
    };
    tenant?: {
      name: string;
      signature: string;
      date: string;
    };
  };
  isPrintable?: boolean;
}

const LeaseSummary: React.FC<LeaseSummaryProps> = ({ lease, signatures, isPrintable = false }) => {
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
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`bg-white ${isPrintable ? 'p-8 max-w-4xl mx-auto' : 'rounded-lg shadow-sm border border-gray-200'}`}>
      {isPrintable && (
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">RESIDENTIAL LEASE AGREEMENT</h1>
        </div>
      )}
      
      <div className={`${isPrintable ? 'mb-8' : 'p-6'}`}>
        <div className={`${isPrintable ? 'mb-6' : ''}`}>
          <h2 className="text-lg font-medium text-gray-900 mb-4">1. PARTIES</h2>
          <p className="text-gray-700">
            This Residential Lease Agreement ("Agreement") is entered into on {formatDate(lease.created_at)} between:
          </p>
          <div className="mt-3 ml-6">
            <p className="text-gray-700">
              <strong>LANDLORD:</strong> {lease.landlord_name}
            </p>
            <p className="text-gray-700 mt-2">
              <strong>TENANT:</strong> {lease.tenant_name || '______________________'}
            </p>
          </div>
        </div>

        <div className={`${isPrintable ? 'mb-6 mt-6' : 'mt-6'}`}>
          <h2 className="text-lg font-medium text-gray-900 mb-4">2. PROPERTY</h2>
          <p className="text-gray-700">
            Landlord agrees to rent to Tenant and Tenant agrees to rent from Landlord the real property located at:
          </p>
          <p className="text-gray-700 font-medium mt-3 ml-6">
            {lease.property_address}
          </p>
          <p className="text-gray-700 mt-3">
            The property is referred to as "<strong>{lease.property_name}</strong>" in this Agreement.
          </p>
        </div>

        <div className={`${isPrintable ? 'mb-6 mt-6' : 'mt-6'}`}>
          <h2 className="text-lg font-medium text-gray-900 mb-4">3. TERM</h2>
          <p className="text-gray-700">
            The term of this Agreement begins on <strong>{formatDate(lease.start_date)}</strong> and ends on <strong>{formatDate(lease.end_date)}</strong>, unless terminated earlier as provided in this Agreement.
          </p>
        </div>

        <div className={`${isPrintable ? 'mb-6 mt-6' : 'mt-6'}`}>
          <h2 className="text-lg font-medium text-gray-900 mb-4">4. RENT</h2>
          <p className="text-gray-700">
            Tenant agrees to pay <strong>{formatCurrency(lease.monthly_rent, lease.currency)}</strong> per month as rent, due on the {lease.payment_day || '1'}<sup>{lease.payment_day === 1 ? 'st' : lease.payment_day === 2 ? 'nd' : lease.payment_day === 3 ? 'rd' : 'th'}</sup> day of each month.
          </p>
        </div>

        {lease.template_data && (
          <>
            <div className={`${isPrintable ? 'mb-6 mt-6' : 'mt-6'}`}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">5. UTILITIES</h2>
              {lease.template_data.utilities_included && lease.template_data.utilities_included.length > 0 ? (
                <>
                  <p className="text-gray-700">
                    The following utilities are included in the rent:
                  </p>
                  <ul className="list-disc ml-10 mt-2 text-gray-700">
                    {lease.template_data.utilities_included.map((utility: string) => (
                      <li key={utility}>{utility}</li>
                    ))}
                  </ul>
                  <p className="text-gray-700 mt-3">
                    All other utilities shall be the responsibility of the Tenant.
                  </p>
                </>
              ) : (
                <p className="text-gray-700">
                  All utilities shall be the responsibility of the Tenant unless otherwise specified.
                </p>
              )}
            </div>

            <div className={`${isPrintable ? 'mb-6 mt-6' : 'mt-6'}`}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">6. POLICIES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-700">
                    <strong>Pets:</strong> {lease.template_data.pets_allowed ? 'Allowed' : 'Not allowed'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-700">
                    <strong>Smoking:</strong> {lease.template_data.smoking_allowed ? 'Allowed' : 'Not allowed'}
                  </p>
                </div>
              </div>
            </div>

            {lease.template_data.additional_terms && (
              <div className={`${isPrintable ? 'mb-6 mt-6' : 'mt-6'}`}>
                <h2 className="text-lg font-medium text-gray-900 mb-4">7. ADDITIONAL TERMS</h2>
                <div className="whitespace-pre-wrap text-gray-700">
                  {lease.template_data.additional_terms}
                </div>
              </div>
            )}
          </>
        )}

        {isPrintable && signatures && (
          <div className="mt-10">
            <h2 className="text-lg font-medium text-gray-900 mb-6">SIGNATURES</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-700 font-medium">LANDLORD:</p>
                {signatures.landlord ? (
                  <>
                    <p className="mt-2 text-gray-700">{signatures.landlord.name}</p>
                    <div className="mt-2 border-b border-gray-300">
                      <img 
                        src={signatures.landlord.signature} 
                        alt="Landlord Signature" 
                        className="h-20 object-contain"
                      />
                    </div>
                    <p className="mt-2 text-gray-700">Date: {signatures.landlord.date}</p>
                  </>
                ) : (
                  <>
                    <div className="mt-2 h-20 border-b border-gray-300"></div>
                    <p className="mt-2 text-gray-700">Date: _________________</p>
                  </>
                )}
              </div>
              
              <div>
                <p className="text-gray-700 font-medium">TENANT:</p>
                {signatures.tenant ? (
                  <>
                    <p className="mt-2 text-gray-700">{signatures.tenant.name}</p>
                    <div className="mt-2 border-b border-gray-300">
                      <img 
                        src={signatures.tenant.signature} 
                        alt="Tenant Signature" 
                        className="h-20 object-contain"
                      />
                    </div>
                    <p className="mt-2 text-gray-700">Date: {signatures.tenant.date}</p>
                  </>
                ) : (
                  <>
                    <div className="mt-2 h-20 border-b border-gray-300"></div>
                    <p className="mt-2 text-gray-700">Date: _________________</p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {isPrintable && (
        <div className="text-center text-xs text-gray-500 mt-10 pt-4 border-t border-gray-200">
          <p>This document was generated through the Reenter platform.</p>
          <p>Reference Code: {lease.ref_code}</p>
        </div>
      )}
    </div>
  );
};

export default LeaseSummary; 