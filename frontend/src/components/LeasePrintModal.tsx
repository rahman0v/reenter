import React, { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { Lease } from '../services/api';

interface LeasePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

const LeasePrintModal: React.FC<LeasePrintModalProps> = ({
  isOpen,
  onClose,
  lease,
  signatures
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  
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
  
  const handlePrint = () => {
    // We don't use printRef.current?.innerHTML because we want to use our custom enhanced layout
    // rather than the simplified LeaseSummary component
    const originalContents = document.body.innerHTML;
    
    // Define variables for landlord details with fallbacks
    const landlordName = lease.landlord_name || '______________________';
    const landlordTcId = ((lease.template_data as any)?.landlord?.tc_id) || ((lease.template_data as any)?.landlord_tc_id) || '______________________';
    const landlordEmail = ((lease.template_data as any)?.landlord?.email) || ((lease.template_data as any)?.landlord_email) || '______________________';
    const landlordPhone = ((lease.template_data as any)?.landlord?.phone) || ((lease.template_data as any)?.landlord_phone) || '______________________';
    
    // Define variables for tenant details with fallbacks
    const tenantName = lease.tenant_name || '______________________';
    const tenantTcId = ((lease.template_data as any)?.tenant?.tc_id) || ((lease.template_data as any)?.tenant_tc_id) || '______________________';
    const tenantEmail = ((lease.template_data as any)?.tenant?.email) || ((lease.template_data as any)?.tenant_email) || '______________________';
    const tenantPhone = ((lease.template_data as any)?.tenant?.phone) || ((lease.template_data as any)?.tenant_phone) || '______________________';
    
    // Define property description with fallback
    const propertyDescription = (lease.template_data as any)?.property_description || 'Residential property as specified above';
    
    // Use fixed section numbering
    const policiesSectionNumber = '6';
    const additionalTermsSectionNumber = '7';
    const legalProvisionsSectionNumber = '8';
    
    // Utility function to safely format utilities
    const formatUtilities = () => {
      if (!lease.template_data || !lease.template_data.utilities_included || lease.template_data.utilities_included.length === 0) {
        return '<span class="text-gray-500">No utilities included in rent</span>';
      }
      
      const utilities = (lease.template_data as any).utilities_included;
      return utilities.map((utility: string) => `<span class="tag">${utility}</span>`).join('');
    };
    
    // Override the entire document with our enhanced professional layout
    document.body.innerHTML = `
      <html>
        <head>
          <title>Residential Lease Agreement - ${lease.property_name}</title>
          <style>
            @page { 
              margin: 2cm; 
              size: A4;
            }
            body { 
              font-family: "Times New Roman", Times, serif; 
              line-height: 1.5; 
              font-size: 12pt;
              color: #000;
              background-color: #fff;
            }
            .container {
              padding: 0.8cm;
              border: 2px solid #000;
              position: relative;
            }
            .ref-code {
              position: absolute;
              top: 0.5cm;
              right: 0.5cm;
              font-size: 9pt;
              font-family: monospace;
              border: 1px solid #000;
              padding: 0.2cm;
              background: #f9f9f9;
              text-align: center;
            }
            .ref-code-label {
              font-weight: bold;
              display: block;
              border-bottom: 1px solid #ddd;
              margin-bottom: 0.1cm;
              font-size: 8pt;
            }
            .header {
              text-align: center;
              margin-bottom: 1cm;
              border-bottom: 2px solid #000;
              padding-bottom: 0.5cm;
            }
            .header h1 {
              font-size: 18pt;
              font-weight: bold;
              margin: 0;
              padding: 0;
              text-transform: uppercase;
            }
            .header p {
              font-size: 10pt;
              margin: 0.2cm 0 0 0;
            }
            .section {
              margin-bottom: 1cm;
              page-break-inside: avoid;
            }
            .section h2 {
              font-size: 14pt;
              font-weight: bold;
              margin: 0 0 0.3cm 0;
              padding: 0 0 0.2cm 0;
              border-bottom: 1px solid #555;
            }
            .section-content {
              padding-left: 0.5cm;
            }
            .party-details {
              border: 1px solid #aaa;
              padding: 0.3cm;
              margin-bottom: 0.5cm;
              background-color: #f9f9f9;
            }
            .row {
              display: flex;
              margin-bottom: 0.2cm;
            }
            .label {
              flex: 0 0 30%;
              font-weight: bold;
            }
            .value {
              flex: 0 0 70%;
            }
            .signatures {
              display: flex;
              justify-content: space-between;
              margin-top: 1.5cm;
              page-break-inside: avoid;
              border-top: 1px solid #000;
              padding-top: 1cm;
            }
            .signature-box {
              flex: 0 0 45%;
            }
            .signature-title {
              font-weight: bold;
              margin-bottom: 0.3cm;
              border-bottom: 1px solid #555;
              padding-bottom: 0.1cm;
            }
            .signature-line {
              border-bottom: 1px solid #000;
              height: 1.5cm;
              margin-bottom: 0.2cm;
              position: relative;
            }
            .signature-image {
              position: absolute;
              bottom: 0;
              left: 0;
              max-height: 1.5cm;
              max-width: 100%;
            }
            .signature-meta {
              font-size: 10pt;
              display: flex;
            }
            .signature-meta-label {
              flex: 0 0 25%;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 9pt;
              margin-top: 1cm;
              padding-top: 0.3cm;
              border-top: 1px solid #555;
              page-break-inside: avoid;
            }
            .tag {
              display: inline-block;
              background: #eee;
              border: 1px solid #ddd;
              border-radius: 3px;
              padding: 0 0.2cm;
              margin-right: 0.2cm;
              margin-bottom: 0.2cm;
              font-size: 10pt;
            }
            .legal-clause {
              margin-bottom: 0.5cm;
            }
            .legal-clause-title {
              font-weight: bold;
              margin-bottom: 0.2cm;
            }
            .white-space-pre {
              white-space: pre-wrap;
            }
            .lease-seal {
              position: absolute;
              bottom: 3cm;
              right: 2cm;
              opacity: 0.2;
              z-index: 0;
            }
            .seal-image {
              width: 5cm;
              height: 5cm;
              border: 3px double #000;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              transform: rotate(-15deg);
              font-family: "Arial", sans-serif;
            }
            .seal-text {
              font-weight: bold;
              font-size: 14pt;
              text-align: center;
              line-height: 1.2;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="ref-code">
              <span class="ref-code-label">REFERENCE CODE</span>
              ${lease.ref_code || 'N/A'}
            </div>
            
            <div class="header">
              <h1>Residential Lease Agreement</h1>
              <p>Date of Agreement: ${formatDate(lease.created_at)}</p>
            </div>
            
            <div class="section">
              <h2>1. PARTIES</h2>
              <div class="section-content">
                <div class="party-details">
                  <div class="row">
                    <div class="label">Landlord Full Name:</div>
                    <div class="value">${landlordName}</div>
                  </div>
                  <div class="row">
                    <div class="label">TC ID:</div>
                    <div class="value">${landlordTcId}</div>
                  </div>
                  <div class="row">
                    <div class="label">Email:</div>
                    <div class="value">${landlordEmail}</div>
                  </div>
                  <div class="row">
                    <div class="label">Phone:</div>
                    <div class="value">${landlordPhone}</div>
                  </div>
                </div>
                
                <div class="party-details">
                  <div class="row">
                    <div class="label">Tenant Full Name:</div>
                    <div class="value">${tenantName}</div>
                  </div>
                  <div class="row">
                    <div class="label">TC ID:</div>
                    <div class="value">${tenantTcId}</div>
                  </div>
                  <div class="row">
                    <div class="label">Email:</div>
                    <div class="value">${tenantEmail}</div>
                  </div>
                  <div class="row">
                    <div class="label">Phone:</div>
                    <div class="value">${tenantPhone}</div>
                  </div>
                </div>
                
                <p>Landlord agrees to rent to Tenant and Tenant agrees to rent from Landlord the real property under the terms described in this agreement.</p>
              </div>
            </div>
            
            <div class="section">
              <h2>2. PROPERTY</h2>
              <div class="section-content">
                <div class="row">
                  <div class="label">Property Name:</div>
                  <div class="value">${lease.property_name}</div>
                </div>
                <div class="row">
                  <div class="label">Property Address:</div>
                  <div class="value">${lease.property_address}</div>
                </div>
                <div class="row">
                  <div class="label">Property Description:</div>
                  <div class="value">${propertyDescription}</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>3. TERM</h2>
              <div class="section-content">
                <div class="row">
                  <div class="label">Start Date:</div>
                  <div class="value">${formatDate(lease.start_date)}</div>
                </div>
                <div class="row">
                  <div class="label">End Date:</div>
                  <div class="value">${formatDate(lease.end_date)}</div>
                </div>
                <div class="row">
                  <div class="label">Lease Duration:</div>
                  <div class="value">${Math.round((new Date(lease.end_date).getTime() - new Date(lease.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>4. RENT</h2>
              <div class="section-content">
                <div class="row">
                  <div class="label">Monthly Rent:</div>
                  <div class="value">${formatCurrency(lease.monthly_rent, lease.currency)}</div>
                </div>
                <div class="row">
                  <div class="label">Payment Day:</div>
                  <div class="value">${lease.payment_day || '1'}${lease.payment_day === 1 ? 'st' : lease.payment_day === 2 ? 'nd' : lease.payment_day === 3 ? 'rd' : 'th'} day of each month</div>
                </div>
                <div class="row">
                  <div class="label">Currency:</div>
                  <div class="value">${lease.currency}</div>
                </div>
                <div class="row">
                  <div class="label">ReEnter Premium Fee:</div>
                  <div class="value">8.5% of rent (${formatCurrency(lease.monthly_rent * 0.085, lease.currency)} per month)</div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>5. UTILITIES</h2>
              <div class="section-content">
                <div class="row">
                  <div class="label">Utilities Included in Rent:</div>
                  <div class="value">
                    ${formatUtilities()}
                    <p>All utilities not explicitly included shall be the responsibility of the Tenant.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>${policiesSectionNumber}. POLICIES</h2>
              <div class="section-content">
                <div class="row">
                  <div class="label">Pets Allowed:</div>
                  <div class="value">${(lease.template_data as any)?.pets_allowed ? 'Yes' : 'No'}</div>
                </div>
                <div class="row">
                  <div class="label">Smoking Allowed:</div>
                  <div class="value">${(lease.template_data as any)?.smoking_allowed ? 'Yes' : 'No'}</div>
                </div>
                ${(lease.template_data as any)?.sublease_allowed !== undefined ? `
                <div class="row">
                  <div class="label">Sublease Allowed:</div>
                  <div class="value">${(lease.template_data as any)?.sublease_allowed ? 'Yes' : 'No'}</div>
                </div>
                ` : ''}
              </div>
            </div>
            
            <div class="section">
              <h2>${additionalTermsSectionNumber}. ADDITIONAL TERMS</h2>
              <div class="section-content">
                <div class="row">
                  <div class="label">Additional Terms & Conditions:</div>
                  <div class="value white-space-pre">
                    ${(lease.template_data as any)?.additional_terms ? 
                      (lease.template_data as any).additional_terms : 
                      '<span class="text-gray-500">No additional terms specified</span>'}
                  </div>
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>${legalProvisionsSectionNumber}. LEGAL PROVISIONS</h2>
              <div class="section-content">
                <div class="legal-clause">
                  <div class="legal-clause-title">Standard Terms</div>
                  <p>The Reenter Digital Lease Agreement and Reenter Terms of Service are automatically incorporated into this lease and shall have full legal force and effect as if fully stated herein.</p>
                  <p>This lease is subject to the laws and regulations of the Republic of Turkey, including the Turkish Code of Obligations (Türk Borçlar Kanunu).</p>
                </div>
                
                <div class="legal-clause">
                  <div class="legal-clause-title">Electronic Signature Clause</div>
                  <p>Both parties acknowledge and agree that this Lease Agreement may be executed electronically, and such signatures shall be deemed to have the same legal effect as original signatures.</p>
                </div>
                
                <div class="legal-clause">
                  <div class="legal-clause-title">Additional Legal Disclaimers</div>
                  <p>This agreement is subject to Turkish property law (Türk Borçlar Kanunu) and is legally enforceable. The parties agree to fulfill all obligations in good faith and in accordance with the principles of Turkish law.</p>
                </div>
              </div>
            </div>
            
            <div class="lease-seal">
              <div class="seal-image">
                <div class="seal-text">OFFICIAL</div>
                <div class="seal-text">REENTER</div>
                <div class="seal-text">LEASE AGREEMENT</div>
                <div class="seal-text">${new Date().getFullYear()}</div>
              </div>
            </div>
            
            <div class="signatures">
              <div class="signature-box">
                <div class="signature-title">LANDLORD SIGNATURE</div>
                <div class="signature-line">
                  ${signatures?.landlord ? `<img class="signature-image" src="${signatures.landlord.signature}" alt="Landlord Signature" />` : ''}
                </div>
                <div class="signature-meta">
                  <div class="signature-meta-label">Name:</div>
                  ${landlordName}
                </div>
                <div class="signature-meta">
                  <div class="signature-meta-label">Date:</div>
                  ${signatures?.landlord ? formatDate(signatures.landlord.date) : '_______________'}
                </div>
              </div>
              
              <div class="signature-box">
                <div class="signature-title">TENANT SIGNATURE</div>
                <div class="signature-line">
                  ${signatures?.tenant ? `<img class="signature-image" src="${signatures.tenant.signature}" alt="Tenant Signature" />` : ''}
                </div>
                <div class="signature-meta">
                  <div class="signature-meta-label">Name:</div>
                  ${tenantName}
                </div>
                <div class="signature-meta">
                  <div class="signature-meta-label">Date:</div>
                  ${signatures?.tenant ? formatDate(signatures.tenant.date) : '_______________'}
                </div>
              </div>
            </div>
            
            <div class="footer">
              <p>This document is an official lease agreement generated by Reenter.co | Reference: ${lease.ref_code}</p>
              <p>Page 1 of 1</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContents;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
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
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Lease Preview
                  </Dialog.Title>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                      onClick={handlePrint}
                    >
                      <PrinterIcon className="h-5 w-5 mr-2" />
                      Print Lease
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                
                <div 
                  ref={printRef}
                  className="mt-4 bg-white border border-gray-200 p-6 rounded-md overflow-auto max-h-[70vh]"
                >
                  <div className="text-right text-xs text-gray-500 mb-4">
                    Reference Code: {lease.ref_code}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-center mb-4">Residential Lease Agreement</h2>
                  <p className="text-center mb-6">Date of Agreement: {formatDate(lease.created_at)}</p>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">1. PARTIES</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-3 rounded border">
                        <p><strong>Landlord:</strong> {lease.landlord_name}</p>
                        <p><strong>TC ID:</strong> {((lease.template_data as any)?.landlord?.tc_id) || ((lease.template_data as any)?.landlord_tc_id) || '______________________'}</p>
                        <p><strong>Email:</strong> {((lease.template_data as any)?.landlord?.email) || ((lease.template_data as any)?.landlord_email) || '______________________'}</p>
                        <p><strong>Phone:</strong> {((lease.template_data as any)?.landlord?.phone) || ((lease.template_data as any)?.landlord_phone) || '______________________'}</p>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded border">
                        <p><strong>Tenant:</strong> {lease.tenant_name || '______________________'}</p>
                        <p><strong>TC ID:</strong> {((lease.template_data as any)?.tenant?.tc_id) || ((lease.template_data as any)?.tenant_tc_id) || '______________________'}</p>
                        <p><strong>Email:</strong> {((lease.template_data as any)?.tenant?.email) || ((lease.template_data as any)?.tenant_email) || '______________________'}</p>
                        <p><strong>Phone:</strong> {((lease.template_data as any)?.tenant?.phone) || ((lease.template_data as any)?.tenant_phone) || '______________________'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">2. PROPERTY</h3>
                    <p><strong>Property Name:</strong> {lease.property_name}</p>
                    <p><strong>Address:</strong> {lease.property_address}</p>
                    <p><strong>Description:</strong> {(lease.template_data as any)?.property_description || 'Residential property as specified above'}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">3. TERM</h3>
                    <p><strong>Start Date:</strong> {formatDate(lease.start_date)}</p>
                    <p><strong>End Date:</strong> {formatDate(lease.end_date)}</p>
                    <p><strong>Duration:</strong> {Math.round((new Date(lease.end_date).getTime() - new Date(lease.start_date).getTime()) / (1000 * 60 * 60 * 24 * 30))} months</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">4. RENT</h3>
                    <p><strong>Monthly Rent:</strong> {formatCurrency(lease.monthly_rent, lease.currency)}</p>
                    <p><strong>Due Date:</strong> {lease.payment_day || '1'}{lease.payment_day === 1 ? 'st' : lease.payment_day === 2 ? 'nd' : lease.payment_day === 3 ? 'rd' : 'th'} day of each month</p>
                    <p><strong>Security Deposit:</strong> {formatCurrency(lease.monthly_rent, lease.currency)}</p>
                    <p><strong>ReEnter Fee:</strong> 8.5% of monthly rent ({formatCurrency(lease.monthly_rent * 0.085, lease.currency)})</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">5. UTILITIES</h3>
                    <div className="flex flex-wrap gap-2">
                      {(lease.template_data as any)?.utilities_included && (lease.template_data as any).utilities_included.length > 0 ? (
                        (lease.template_data as any).utilities_included.map((utility: string, idx: number) => (
                          <span key={idx} className="bg-gray-100 px-2 py-1 rounded text-sm">{utility}</span>
                        ))
                      ) : (
                        <span className="text-gray-500">No utilities included in rent</span>
                      )}
                    </div>
                    <p className="text-sm mt-2">All utilities not explicitly included shall be the responsibility of the Tenant.</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">6. POLICIES</h3>
                    <p><strong>Pets Allowed:</strong> {(lease.template_data as any)?.pets_allowed ? 'Yes' : 'No'}</p>
                    <p><strong>Smoking Allowed:</strong> {(lease.template_data as any)?.smoking_allowed ? 'Yes' : 'No'}</p>
                    {(lease.template_data as any)?.sublease_allowed !== undefined && (
                      <p><strong>Sublease Allowed:</strong> {(lease.template_data as any)?.sublease_allowed ? 'Yes' : 'No'}</p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">7. ADDITIONAL TERMS</h3>
                    <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded border">
                      {(lease.template_data as any)?.additional_terms ? (lease.template_data as any).additional_terms : (
                        <span className="text-gray-500">No additional terms specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold border-b pb-2 mb-3">8. LEGAL PROVISIONS</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold">Standard Terms:</p>
                        <p className="text-sm">The Reenter Digital Lease Agreement and Reenter Terms of Service are automatically incorporated into this lease.</p>
                      </div>
                      <div>
                        <p className="font-semibold">Electronic Signature Clause:</p>
                        <p className="text-sm">Both parties acknowledge and agree that this Lease Agreement may be executed electronically.</p>
                      </div>
                      <div>
                        <p className="font-semibold">Additional Legal Disclaimers:</p>
                        <p className="text-sm">This agreement is subject to Turkish property law (Türk Borçlar Kanunu) and is legally enforceable.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6 mt-6">
                    <div>
                      <h4 className="font-semibold mb-2">LANDLORD SIGNATURE</h4>
                      <div className="h-16 border-b mb-2 relative">
                        {signatures?.landlord && (
                          <img 
                            src={signatures.landlord.signature} 
                            alt="Landlord signature" 
                            className="h-16 absolute bottom-0" 
                          />
                        )}
                      </div>
                      <p><strong>Name:</strong> {lease.landlord_name}</p>
                      <p><strong>Date:</strong> {signatures?.landlord ? formatDate(signatures.landlord.date) : '_______________'}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">TENANT SIGNATURE</h4>
                      <div className="h-16 border-b mb-2 relative">
                        {signatures?.tenant && (
                          <img 
                            src={signatures.tenant.signature} 
                            alt="Tenant signature" 
                            className="h-16 absolute bottom-0" 
                          />
                        )}
                      </div>
                      <p><strong>Name:</strong> {lease.tenant_name || '______________________'}</p>
                      <p><strong>Date:</strong> {signatures?.tenant ? formatDate(signatures.tenant.date) : '_______________'}</p>
                    </div>
                  </div>
                  
                  <div className="border-t mt-6 pt-4 text-center text-xs text-gray-500">
                    <p>This document is an official lease agreement generated by Reenter.co</p>
                    <p>Reference: {lease.ref_code}</p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LeasePrintModal; 