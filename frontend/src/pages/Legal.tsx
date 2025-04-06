import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

// Tab types
type TabType = 'terms' | 'privacy' | 'lease' | 'user';
type TermsSubSection = 'general' | 'landlords' | 'tenants';
type LeaseTabType = 'agreement' | 'insurance';
type PrivacyTabType = 'privacy' | 'cookie';

export default function Legal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('terms');
  const [termsSection, setTermsSection] = useState<TermsSubSection>('general');
  const [leaseTab, setLeaseTab] = useState<LeaseTabType>('agreement');
  const [privacyTab, setPrivacyTab] = useState<PrivacyTabType>('privacy');
  
  useEffect(() => {
    // Check if we need to show the cookie policy
    if (location.state && 'cookiePolicy' in location.state && location.state.cookiePolicy) {
      setActiveTab('privacy');
      setPrivacyTab('cookie');
      window.scrollTo(0, 0);
      // Clear the state to avoid persisting the cookiePolicy flag
      navigate('/legal#privacy', { replace: true, state: {} });
      return;
    }
    
    // Handle hash navigation when the page loads
    if (location.hash) {
      const id = location.hash.substring(1); // remove the # character
      if (id === 'terms' || id === 'privacy' || id === 'lease' || id === 'user') {
        setActiveTab(id as TabType);
      } else if (id === 'terms-landlords') {
        setActiveTab('terms');
        setTermsSection('landlords');
      } else if (id === 'terms-tenants') {
        setActiveTab('terms');
        setTermsSection('tenants');
      }
      // Scroll to top
      window.scrollTo(0, 0);
    } else {
      // Default to terms if no hash
      setActiveTab('terms');
      window.scrollTo(0, 0);
    }
  }, [location, navigate]);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    navigate(`/legal#${tab}`, { replace: true });
  };

  // Handle terms section change
  const handleTermsSectionChange = (section: TermsSubSection) => {
    setTermsSection(section);
    if (section !== 'general') {
      navigate(`/legal#terms-${section}`, { replace: true });
    } else {
      navigate('/legal#terms', { replace: true });
    }
  };

  // Handle lease tab change
  const handleLeaseTabChange = (tab: LeaseTabType) => {
    setLeaseTab(tab);
  };

  // Handle privacy tab change
  const handlePrivacyTabChange = (tab: PrivacyTabType) => {
    setPrivacyTab(tab);
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          className="mx-auto max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl text-center mb-12">
            Legal Information
          </h1>
          
          {/* Tabbed Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex -mb-px space-x-8">
              <button
                onClick={() => handleTabChange('terms')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'terms'
                    ? 'border-primary-600 text-primary-600 font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Terms of Service
              </button>
              <button
                onClick={() => handleTabChange('privacy')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'privacy'
                    ? 'border-primary-600 text-primary-600 font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => handleTabChange('lease')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'lease'
                    ? 'border-primary-600 text-primary-600 font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lease Agreements
              </button>
              <button
                onClick={() => handleTabChange('user')}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'user'
                    ? 'border-primary-600 text-primary-600 font-bold'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                FAQ
              </button>
            </nav>
          </div>
          
          {/* Terms of Service Content */}
          {activeTab === 'terms' && (
            <motion.section
              key="terms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-md"
            >
              <div className="flex items-center mb-8">
                <div className="rounded-full bg-primary-100 p-3 mr-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-6 h-6 text-primary-600"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Terms of Service</h2>
              </div>
              
              {/* Breadcrumb Navigation for Terms */}
              <div className="flex text-sm font-medium mb-8 bg-gray-50 p-3 rounded-md">
                <button 
                  onClick={() => handleTermsSectionChange('general')}
                  className={`${termsSection === 'general' ? 'text-primary-600 font-bold' : 'text-gray-600 hover:text-primary-600'}`}
                >
                  General Terms
                </button>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 mx-2" />
                <button 
                  onClick={() => handleTermsSectionChange('landlords')}
                  className={`${termsSection === 'landlords' ? 'text-primary-600 font-bold' : 'text-gray-600 hover:text-primary-600'}`}
                >
                  Terms for Landlords
                </button>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 mx-2" />
                <button 
                  onClick={() => handleTermsSectionChange('tenants')}
                  className={`${termsSection === 'tenants' ? 'text-primary-600 font-bold' : 'text-gray-600 hover:text-primary-600'}`}
                >
                  Terms for Tenants
                </button>
              </div>
              
              {/* General Terms */}
              {termsSection === 'general' && (
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">General Terms of Service</h3>
                  <div className="space-y-4 text-gray-700">
                    <h4 className="text-lg font-bold mt-6">1. Introduction</h4>
                    <p>
                      Welcome to Reenter Dijital Kiralama ve Hizmetleri A.Ş.
                    </p>
                    <p>
                      These Terms of Service ("Terms") govern your use of Reenter's platform, services, websites, and mobile applications (collectively, the "Platform").
                    </p>
                    <p>
                      By accessing or using the Platform, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy.
                    </p>

                    <h4 className="text-lg font-bold mt-6">2. Services Provided</h4>
                    <p>
                      Reenter provides an integrated platform for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Lease facilitation and management</li>
                      <li>Payment processing</li>
                      <li>Property damage protection and rent payment delay facilitation via third-party insurance providers</li>
                      <li>Risk assessment through AI technologies</li>
                      <li>Value-added services such as property management, marketing, maintenance, legal support, and SaaS tools</li>
                    </ul>
                    <p className="mt-2">
                      Reenter does not act as a real estate agent, insurer, or escrow agent.
                    </p>

                    <h4 className="text-lg font-bold mt-6">3. Eligibility</h4>
                    <p>
                      To use the Platform, you must:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Be at least 18 years old</li>
                      <li>Have the legal capacity to enter into binding agreements</li>
                      <li>Not be barred under applicable laws</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6">4. User Account</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>You must provide accurate and complete information during registration.</li>
                      <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                      <li>You are responsible for all activities under your account.</li>
                      <li>We reserve the right to suspend or terminate your account for breach of these Terms.</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6">5. Payments and Premium Fees</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Rent and related fees are processed through Reenter's payment infrastructure.</li>
                      <li>A Premium Fee is collected monthly along with rent, calculated based on property, tenant, and lease-specific factors.</li>
                      <li>The Premium Fee covers services such as risk mitigation, insurance facilitation, payment processing, and platform usage.</li>
                      <li>Premium Fees are non-refundable.</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6">6. Risk Mitigation Services</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Property damage protection and delayed rent payment protection are facilitated through third-party insurance providers.</li>
                      <li>Reenter coordinates claim submissions and communications but does not guarantee insurance coverage decisions.</li>
                      <li>Detailed terms are available in our Insurance Terms and Conditions.</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6">7. Data Privacy</h4>
                    <p>
                      Your use of the Platform is subject to our Privacy Policy.
                    </p>
                    <p>
                      We collect, process, and share personal data in compliance with Turkish Personal Data Protection Law (KVKK) and the European Union General Data Protection Regulation (GDPR).
                    </p>

                    <h4 className="text-lg font-bold mt-6">8. Acceptable Use</h4>
                    <p>
                      You agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Use the Platform only for lawful purposes</li>
                      <li>Not misuse the Platform, including attempting unauthorized access, interfering with operations, or submitting fraudulent information</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6">9. Intellectual Property</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>All intellectual property rights in the Platform belong to Reenter or its licensors.</li>
                      <li>You may not copy, modify, distribute, sell, or lease any part of our Platform without prior written consent.</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6">10. Limitation of Liability</h4>
                    <p>
                      To the fullest extent permitted by law:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Reenter shall not be liable for indirect, incidental, punitive, or consequential damages.</li>
                      <li>Reenter disclaims liability arising from user actions, third-party decisions (such as insurers), or service interruptions.</li>
                      <li>Use of the Platform is at your sole risk.</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6">11. Amendments</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>We may update these Terms from time to time.</li>
                      <li>We will provide notice of material changes.</li>
                      <li>Continued use of the Platform constitutes acceptance of the updated Terms.</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6">12. Governing Law and Dispute Resolution</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>These Terms are governed by the laws of the Republic of Turkey.</li>
                      <li>All disputes must first be attempted to be resolved through good-faith negotiation and mediation.</li>
                      <li>If unresolved, disputes shall be submitted to the exclusive jurisdiction of Istanbul Courts and Execution Offices (İstanbul Mahkemeleri ve İcra Daireleri).</li>
                    </ul>
                  </div>
                </div>
              )}
              
              {/* Terms for Landlords */}
              {termsSection === 'landlords' && (
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">SPECIAL TERMS FOR LANDLORDS</h3>
                  <div className="space-y-4 text-gray-700">
                    <h4 className="text-lg font-bold mt-6">1. Property Ownership and Lease Authority</h4>
                    <p>
                      By listing a property on Reenter, the Landlord guarantees that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>They are the lawful owner or have full authority (through Power of Attorney) to lease the property.</li>
                      <li>No third-party rights (e.g., mortgages, foreclosures) restrict the lease.</li>
                      <li>The property is free from encumbrances that would affect the Tenant's right of use.</li>
                    </ul>
                    <p className="font-medium">
                      Breach: Misrepresentation will make the Landlord personally liable for all resulting damages or disputes.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">2. Property Standards</h4>
                    <p>
                      The Landlord must:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Deliver the property in habitable, safe, and clean condition per TBK Articles 301–302.</li>
                      <li>Ensure all essential systems (water, electricity, heating, internet) are operational.</li>
                      <li>Maintain structural integrity and major systems throughout the lease.</li>
                    </ul>
                    <p>
                      Failure to do so entitles the Tenant to demand repair, seek rent reduction, or terminate the lease.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">3. Repairs and Maintenance Obligations</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 mt-2">
                        <thead>
                          <tr className="border-b border-gray-300 bg-gray-50">
                            <th className="py-2 px-4 border-r border-gray-300 text-left">Landlord's Responsibility</th>
                            <th className="py-2 px-4 text-left">Tenant's Responsibility</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300">Structural repairs</td>
                            <td className="py-2 px-4">Regular cleaning</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300">Plumbing, heating, electrical, gas system failures</td>
                            <td className="py-2 px-4">Replacing light bulbs, batteries</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300">Roof leaks</td>
                            <td className="py-2 px-4">Minor maintenance (e.g., door handles)</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300">Wall cracks or major damage</td>
                            <td className="py-2 px-4">Avoid causing deliberate damage</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="font-medium mt-2">
                      Notice Period:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Tenant must notify the Landlord of required repairs within 3 business days of discovery.</li>
                      <li>Landlord must perform necessary repairs within a reasonable time (generally 7–10 business days).</li>
                    </ul>
                    
                    <h4 className="text-lg font-bold mt-6">4. Insurance and Claims</h4>
                    <p>
                      The Landlord agrees to participate fully in any insurance claim process, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Submitting photos, documents, or inspection reports</li>
                      <li>Granting access for assessments</li>
                    </ul>
                    <p>
                      Claims are processed through Reenter with third-party insurers.
                    </p>
                    <p>
                      Reenter is not responsible for insurer decisions.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">5. Payment and Payouts</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Landlords must provide accurate banking details (IBAN).</li>
                      <li>Payouts are processed after successful rent collection from Tenants.</li>
                      <li>Reenter is not liable for failed payouts due to inaccurate IBANs or bank-related delays.</li>
                    </ul>
                    
                    <h4 className="text-lg font-bold mt-6">6. Early Termination by Landlord</h4>
                    <p>
                      Landlord may only terminate early under specific conditions (per TBK Articles 350–351):
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Personal need (e.g., the Landlord or close family member needs the property)</li>
                      <li>Rebuilding, major renovation, or demolition</li>
                      <li>Serious tenant default (e.g., unpaid rent, property destruction)</li>
                    </ul>
                    <p className="font-medium mt-2">
                      Notice Period: Minimum 30 days' notice, and subject to legal validation.
                    </p>
                    <p>
                      Unauthorized termination gives Tenant right to claim damages.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">7. Subleasing, Pets, and Guest Rules</h4>
                    <p>
                      Landlord must clearly specify before lease signing:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Whether pets are allowed</li>
                      <li>Any restrictions on guest stays</li>
                      <li>Subleasing permissions</li>
                    </ul>
                    <p>
                      Unauthorized subleasing entitles Landlord to terminate the lease immediately under TBK.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">8. Entry to Property</h4>
                    <p>
                      The Landlord may only enter the property:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>With at least 24 hours' written notice</li>
                      <li>For necessary inspections, repairs, or emergencies</li>
                    </ul>
                    <p>
                      Tenant may refuse non-emergency entry.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">9. Eviction Process</h4>
                    <p>
                      In case of breach (e.g., repeated non-payment, unauthorized use), Landlord must:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Issue a formal warning (İhtarname) through a Notary or Registered Email (KEP).</li>
                      <li>If unresolved, initiate eviction via Execution Courts (İcra Mahkemeleri).</li>
                    </ul>
                    <p>
                      Reenter may assist by facilitating communication but is not responsible for legal proceedings.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Terms for Tenants */}
              {termsSection === 'tenants' && (
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">SPECIAL TERMS FOR TENANTS</h3>
                  <div className="space-y-4 text-gray-700">
                    <h4 className="text-lg font-bold mt-6">1. Lease Obligations</h4>
                    <p>
                      By entering into a lease through Reenter, the Tenant agrees to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Pay rent and Premium Fees punctually.</li>
                      <li>Use the property only for residential purposes unless otherwise agreed.</li>
                      <li>Maintain the property in good condition.</li>
                    </ul>
                    
                    <h4 className="text-lg font-bold mt-6">2. Rent Payment</h4>
                    <p>
                      Rent is due on the 1st of each month.
                    </p>
                    <p>
                      If unpaid:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Automatic reminders will be sent.</li>
                      <li>Rent Delay Protection claims may be initiated after 30 days.</li>
                    </ul>
                    <p>
                      Repeated late payments may result in lease termination and impact future rental eligibility.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">3. Use and Care of Property</h4>
                    <p>
                      Tenant must:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Prevent damages beyond normal wear and tear.</li>
                      <li>Avoid illegal activities on premises.</li>
                      <li>Not remove, damage, or alter fixtures or structural elements.</li>
                      <li>Use appliances and utilities properly.</li>
                    </ul>
                    <p>
                      Failure to comply may result in insurance claim denial and lease termination.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">4. Repairs and Notification</h4>
                    <p>
                      Tenants must promptly report any:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Structural failures</li>
                      <li>Plumbing issues</li>
                      <li>Safety hazards (e.g., gas leaks)</li>
                    </ul>
                    <p>
                      Failure to report may lead to personal liability for resulting damages.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">5. Insurance and Claims Cooperation</h4>
                    <p>
                      Tenants must cooperate in the event of property damage or rent default claims by:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Providing necessary information</li>
                      <li>Allowing inspections</li>
                      <li>Submitting supporting documents</li>
                    </ul>
                    
                    <h4 className="text-lg font-bold mt-6">6. Pets, Guests, and Subleasing</h4>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Pets allowed only with written approval from the Landlord.</li>
                      <li>Guests staying longer than 15 consecutive days require Landlord approval.</li>
                      <li>Subleasing is prohibited unless expressly permitted.</li>
                    </ul>
                    <p>
                      Violation of these rules is a material breach allowing immediate lease termination.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">7. Early Termination by Tenant</h4>
                    <p>
                      Tenants may terminate the lease early with 30 days' written notice.
                    </p>
                    <p>
                      A penalty equal to one (1) month's gross rent applies unless otherwise waived by the Landlord.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">8. Evacuation Obligations</h4>
                    <p>
                      At the end of the lease or upon termination:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Tenant must vacate the premises fully.</li>
                      <li>Property must be cleaned and returned in similar condition.</li>
                      <li>All keys and access devices must be returned.</li>
                    </ul>
                    <p>
                      Failure to vacate entitles the Landlord to initiate eviction proceedings.
                    </p>
                    
                    <h4 className="text-lg font-bold mt-6">9. Dispute Resolution</h4>
                    <p>
                      In case of disputes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-2">
                      <li>Tenants must participate in mandatory mediation.</li>
                      <li>If unresolved, disputes will be handled under the exclusive jurisdiction of Istanbul Courts and Execution Offices.</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.section>
          )}
          
          {/* Privacy Policy Content */}
          {activeTab === 'privacy' && (
            <motion.section
              key="privacy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-md"
            >
              <div className="flex items-center mb-8">
                <div className="rounded-full bg-primary-100 p-3 mr-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-6 h-6 text-primary-600"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" 
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Privacy Policy (KVKK Compliant)</h2>
              </div>
              
              {/* Inner Tab Navigation for Privacy Policy */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="flex -mb-px space-x-8">
                  <button
                    onClick={() => handlePrivacyTabChange('privacy')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      privacyTab === 'privacy'
                        ? 'border-primary-600 text-primary-600 font-bold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Privacy Policy
                  </button>
                  <button
                    onClick={() => handlePrivacyTabChange('cookie')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      privacyTab === 'cookie'
                        ? 'border-primary-600 text-primary-600 font-bold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Cookie Policy
                  </button>
                </nav>
              </div>
              
              {/* Privacy Policy Section */}
              {privacyTab === 'privacy' && (
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="prose max-w-none bg-white p-8 border border-gray-200 rounded-md">
                    <h3 className="text-center font-bold text-xl mb-4">REENTER PRIVACY POLICY</h3>
                    <p className="text-sm italic">Effective Date: [Insert Date]</p>

                    <h4 className="font-semibold mt-6">1. Introduction</h4>
                    <p>Reenter Dijital Kiralama ve Hizmetleri A.Ş. We respects your privacy.</p>
                    <p>This Privacy Policy explains how we collect, use, disclose, and protect your personal data in accordance with:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Turkish Personal Data Protection Law (6698 sayılı Kişisel Verilerin Korunması Kanunu, "KVKK")</li>
                      <li>European Union General Data Protection Regulation (GDPR)</li>
                    </ul>
                    <p className="mt-2">By using our platform, you agree to the terms outlined in this Privacy Policy.</p>

                    <h4 className="font-semibold mt-6">2. Data Controller Information</h4>
                    <p><strong>Data Controller:</strong></p>
                    <p>Reenter Dijital Kiralama ve Hizmetleri A.Ş.</p>
                    <p>Address: [Insert Company Address]</p>
                    <p>Email: [Insert Contact Email]</p>
                    <p>Phone: [Insert Contact Phone]</p>

                    <h4 className="font-semibold mt-6">3. What Data We Collect</h4>
                    <p>We collect the following types of personal data:</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 mt-2">
                        <thead>
                          <tr className="border-b border-gray-300 bg-gray-50">
                            <th className="py-2 px-4 border-r border-gray-300 text-left">Category</th>
                            <th className="py-2 px-4 text-left">Examples</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Identification Data</td>
                            <td className="py-2 px-4">Full name, date of birth, TC ID, passport number</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Contact Data</td>
                            <td className="py-2 px-4">Address, email address, phone number</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Financial Data</td>
                            <td className="py-2 px-4">IBAN, banking details, transaction history</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Lease Data</td>
                            <td className="py-2 px-4">Property addresses, lease contracts, rental history</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Verification Data</td>
                            <td className="py-2 px-4">Government ID, selfies, utility bills (for verification)</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Usage Data</td>
                            <td className="py-2 px-4">Platform interactions, login records, activity logs</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Device Data</td>
                            <td className="py-2 px-4">IP address, browser type, operating system, device identifiers</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Marketing Data</td>
                            <td className="py-2 px-4">Communication preferences, survey responses</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h4 className="font-semibold mt-6">4. How We Collect Your Data</h4>
                    <p>We collect your data when:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>You create an account</li>
                      <li>You list or rent a property</li>
                      <li>You upload documents</li>
                      <li>You make or receive payments</li>
                      <li>You communicate with us or use our services</li>
                      <li>You use our website or mobile applications (cookies, tracking)</li>
                    </ul>

                    <h4 className="font-semibold mt-6">5. Legal Basis for Processing Personal Data</h4>
                    <p>Under KVKK and GDPR, we process your data based on:</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 mt-2">
                        <thead>
                          <tr className="border-b border-gray-300 bg-gray-50">
                            <th className="py-2 px-4 border-r border-gray-300 text-left">Legal Basis</th>
                            <th className="py-2 px-4 text-left">Purpose</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Contract Performance</td>
                            <td className="py-2 px-4">Lease facilitation, rent processing, claims support</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Legal Obligations</td>
                            <td className="py-2 px-4">Taxation, anti-money laundering compliance</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Legitimate Interests</td>
                            <td className="py-2 px-4">Platform security, fraud prevention, service improvement</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Consent</td>
                            <td className="py-2 px-4">Direct marketing communications, optional surveys</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2">You may withdraw your consent at any time.</p>

                    <h4 className="font-semibold mt-6">6. How We Use Your Data</h4>
                    <p>We use your personal data to:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Create and manage your Reenter account</li>
                      <li>Facilitate leases between landlords and tenants</li>
                      <li>Process rent payments and payouts</li>
                      <li>Facilitate insurance claims</li>
                      <li>Provide customer support</li>
                      <li>Improve and personalize our services</li>
                      <li>Analyze platform usage and performance</li>
                      <li>Comply with legal and regulatory obligations</li>
                      <li>Send service-related or marketing communications (where permitted)</li>
                    </ul>

                    <h4 className="font-semibold mt-6">7. Data Sharing and Disclosure</h4>
                    <p>We may share your data with:</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 mt-2">
                        <thead>
                          <tr className="border-b border-gray-300 bg-gray-50">
                            <th className="py-2 px-4 border-r border-gray-300 text-left">Recipient</th>
                            <th className="py-2 px-4 text-left">Purpose</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Insurance Providers</td>
                            <td className="py-2 px-4">Risk assessments and claims processing</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Payment Processors</td>
                            <td className="py-2 px-4">Transaction execution and verification</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Cloud Hosting Services</td>
                            <td className="py-2 px-4">Data storage and security</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Legal Advisors</td>
                            <td className="py-2 px-4">Legal compliance and dispute resolution</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Regulatory Authorities</td>
                            <td className="py-2 px-4">Compliance with Turkish and international laws</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Analytics Providers</td>
                            <td className="py-2 px-4">Service improvement and performance monitoring</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2">We ensure that third parties only access your data under strict confidentiality obligations and solely for authorized purposes.</p>

                    <h4 className="font-semibold mt-6">8. International Data Transfers</h4>
                    <p>Your personal data may be transferred and stored outside Turkey, including in countries that may not have the same data protection laws.</p>
                    <p>Whenever data is transferred outside of Turkey or the European Economic Area (EEA), we implement safeguards such as Standard Contractual Clauses or rely on adequacy decisions.</p>

                    <h4 className="font-semibold mt-6">9. Data Retention</h4>
                    <p>We retain your personal data:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>As long as you maintain an active account</li>
                      <li>As needed to fulfill the purposes outlined in this Policy</li>
                      <li>To comply with legal, accounting, and tax obligations</li>
                    </ul>
                    <p className="mt-2">Upon account deletion, we will retain only the minimum necessary data for statutory periods (e.g., 10 years for financial records under Turkish law).</p>

                    <h4 className="font-semibold mt-6">10. Your Rights</h4>
                    <p>Under KVKK and GDPR, you have the right to:</p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 mt-2">
                        <thead>
                          <tr className="border-b border-gray-300 bg-gray-50">
                            <th className="py-2 px-4 border-r border-gray-300 text-left">Right</th>
                            <th className="py-2 px-4 text-left">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Access</td>
                            <td className="py-2 px-4">Request a copy of your personal data</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Rectification</td>
                            <td className="py-2 px-4">Request correction of inaccurate data</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Erasure ("Right to be Forgotten")</td>
                            <td className="py-2 px-4">Request deletion of your personal data</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Restriction</td>
                            <td className="py-2 px-4">Request restriction of data processing</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Data Portability</td>
                            <td className="py-2 px-4">Request data transfer to another controller</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Objection</td>
                            <td className="py-2 px-4">Object to data processing based on legitimate interests</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Withdraw Consent</td>
                            <td className="py-2 px-4">Withdraw consent at any time</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Lodge Complaint</td>
                            <td className="py-2 px-4">File a complaint with the Turkish Personal Data Protection Authority (KVKK Kurumu) or the relevant GDPR supervisory authority</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2">To exercise any of these rights, contact us at [Insert Contact Email].</p>

                    <h4 className="font-semibold mt-6">11. How We Protect Your Data</h4>
                    <p>We implement appropriate technical and organizational measures to protect your data, including:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>End-to-end encryption</li>
                      <li>Secure cloud storage</li>
                      <li>Regular security audits</li>
                      <li>Access controls and authentication systems</li>
                      <li>Staff confidentiality training</li>
                    </ul>
                    <p className="mt-2">However, no system is completely secure, and we cannot guarantee absolute security.</p>

                    <h4 className="font-semibold mt-6">12. Cookies and Tracking Technologies</h4>
                    <p>We use cookies and similar tracking technologies to:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Enable essential platform functions</li>
                      <li>Analyze usage and improve services</li>
                      <li>Personalize your experience</li>
                      <li>Serve targeted advertising (where permitted)</li>
                    </ul>
                    <p className="mt-2">You can manage your cookie preferences through your browser settings.</p>
                    <p>For more information, see our Cookie Policy.</p>

                    <h4 className="font-semibold mt-6">13. Changes to This Privacy Policy</h4>
                    <p>We may update this Privacy Policy periodically.</p>
                    <p>Material changes will be communicated through our Platform or by email.</p>
                    <p>Your continued use of Reenter after any changes constitutes acceptance of the updated Policy.</p>

                    <h4 className="font-semibold mt-6">14. Contact Us</h4>
                    <p>For any questions, concerns, or complaints about this Privacy Policy or your personal data, you can contact:</p>
                    <p>Reenter Dijital Kiralama ve Hizmetleri A.Ş.</p>
                    <p>Email: [Insert Contact Email]</p>
                    <p>Address: [Insert Company Address]</p>
                    <p>Phone: [Insert Company Phone]</p>
                    
                    <p className="text-center font-medium mt-8">End of Privacy Policy</p>
                  </div>
                </div>
              )}
              
              {/* Cookie Policy Section */}
              {privacyTab === 'cookie' && (
                <div className="p-6 bg-gray-50 rounded-lg">
                  <div className="prose max-w-none bg-white p-8 border border-gray-200 rounded-md">
                    <h3 className="text-center font-bold text-xl mb-4">REENTER COOKIE POLICY</h3>
                    <p className="text-sm italic">Effective Date: [Insert Date]</p>

                    <h4 className="font-semibold mt-6">1. Introduction</h4>
                    <p>This Cookie Policy explains how Reenter Dijital Kiralama ve Hizmetleri A.Ş. We uses cookies and similar tracking technologies on our website and platform.</p>
                    <p>By using our platform, you consent to the use of cookies as described in this Policy.</p>

                    <h4 className="font-semibold mt-6">2. What Are Cookies?</h4>
                    <p>Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work, enhance user experiences, and provide information to website owners.</p>

                    <h4 className="font-semibold mt-6">3. Types of Cookies We Use</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 mt-2">
                        <thead>
                          <tr className="border-b border-gray-300 bg-gray-50">
                            <th className="py-2 px-4 border-r border-gray-300 text-left">Type of Cookie</th>
                            <th className="py-2 px-4 border-r border-gray-300 text-left">Purpose</th>
                            <th className="py-2 px-4 text-left">Examples</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Essential Cookies</td>
                            <td className="py-2 px-4 border-r border-gray-300">Enable core platform functionality such as security, account login, session management.</td>
                            <td className="py-2 px-4">Session cookie, CSRF token</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Analytics Cookies</td>
                            <td className="py-2 px-4 border-r border-gray-300">Collect information about how users interact with the platform to improve performance.</td>
                            <td className="py-2 px-4">Google Analytics</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Functionality Cookies</td>
                            <td className="py-2 px-4 border-r border-gray-300">Remember user preferences to personalize your experience.</td>
                            <td className="py-2 px-4">Language settings, login status</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Advertising Cookies</td>
                            <td className="py-2 px-4 border-r border-gray-300">Deliver relevant advertisements based on browsing behavior. (used if remarketing is enabled)</td>
                            <td className="py-2 px-4">Facebook Pixel, Google Ads</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Third-party Cookies</td>
                            <td className="py-2 px-4 border-r border-gray-300">Cookies placed by third-party service providers integrated into our platform.</td>
                            <td className="py-2 px-4">Payment gateways, verification partners</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h4 className="font-semibold mt-6">4. How We Use Cookies</h4>
                    <p>We use cookies to:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Maintain platform security and prevent fraud</li>
                      <li>Enable user authentication and sessions</li>
                      <li>Analyze platform usage and improve services</li>
                      <li>Personalize user experience</li>
                      <li>Display targeted advertising (only where permitted)</li>
                    </ul>

                    <h4 className="font-semibold mt-6">5. Managing Cookies</h4>
                    <p>You can control and manage cookies in various ways:</p>
                    <p><strong>Browser Settings:</strong><br />Most browsers allow you to refuse cookies or delete existing cookies through settings.</p>
                    <p><strong>Consent Manager:</strong><br />When you first visit our platform, you will see a cookie consent banner that allows you to accept or reject non-essential cookies.</p>
                    <p>If you block cookies, some features of the Platform may not function properly.</p>
                    <p>For more information on managing cookies:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Chrome</li>
                      <li>Firefox</li>
                      <li>Safari</li>
                    </ul>

                    <h4 className="font-semibold mt-6">6. Third-party Cookies</h4>
                    <p>Some third-party services integrated into our platform may place cookies on your device. We do not control the use of these cookies.</p>
                    <p>We recommend reviewing the privacy and cookie policies of these third-party providers.</p>
                    <p>Examples of third-party services:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Google Analytics</li>
                      <li>Facebook Pixel</li>
                      <li>Payment Processors (e.g., Iyzico, PayU)</li>
                    </ul>

                    <h4 className="font-semibold mt-6">7. Changes to This Cookie Policy</h4>
                    <p>We may update this Cookie Policy to reflect changes in our practices or legal requirements.</p>
                    <p>We will notify users of material changes through the Platform.</p>

                    <h4 className="font-semibold mt-6">8. Contact Us</h4>
                    <p>If you have any questions about our use of cookies or this Cookie Policy, please contact us:</p>
                    <p>Reenter Dijital Kiralama ve Hizmetleri A.Ş.</p>
                    <p>Email: [Insert Contact Email]</p>
                    <p>Address: [Insert Company Address]</p>
                    
                    <p className="text-center font-medium mt-8">End of Cookie Policy</p>
                  </div>
                </div>
              )}
            </motion.section>
          )}
          
          {/* Lease Agreements Content */}
          {activeTab === 'lease' && (
            <motion.section
              key="lease"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-md"
            >
              <div className="flex items-center mb-8">
                <div className="rounded-full bg-primary-100 p-3 mr-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-6 h-6 text-primary-600"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" 
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Lease Agreements</h2>
              </div>
              
              {/* Inner Tab Navigation for Lease Agreements */}
              <div className="border-b border-gray-200 mb-8">
                <nav className="flex -mb-px space-x-8">
                  <button
                    onClick={() => handleLeaseTabChange('agreement')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      leaseTab === 'agreement'
                        ? 'border-primary-600 text-primary-600 font-bold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Digital Lease Agreement
                  </button>
                  <button
                    onClick={() => handleLeaseTabChange('insurance')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      leaseTab === 'insurance'
                        ? 'border-primary-600 text-primary-600 font-bold'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Insurance Terms & Conditions
                  </button>
                </nav>
              </div>
              
              {/* Lease Agreement Template Section */}
              {leaseTab === 'agreement' && (
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Digital Lease Agreement Template</h3>
                  <p className="mb-6">
                    This template establishes the legal relationship between Landlord and Tenant for each individual property on our platform.
                    The following template is used during lease creation and requires e-signature before activation.
                  </p>

                  <div className="prose max-w-none bg-white p-8 border border-gray-200 rounded-md">
                    <h3 className="text-center font-bold text-xl mb-4">REENTER DIGITAL LEASE AGREEMENT</h3>
                    <p className="text-sm italic">Effective Date: [Insert Lease Start Date]</p>

                    <h4 className="font-semibold mt-6">1. Parties to the Agreement</h4>
                    <p>This Lease Agreement ("Agreement") is entered into between:</p>
                    
                    <p className="mt-2"><strong>Landlord (Kiraya Veren):</strong> [Full Name, TC ID, Email, Phone]</p>
                    
                    <p className="mt-2"><strong>Tenant (Kiracı):</strong> [Full Name, TC ID, Email, Phone]</p>
                    
                    <p className="mt-2"><strong>Facilitator (Platform):</strong> Reenter Dijital Kiralama ve Hizmetleri A.Ş.</p>
                    <p className="text-sm italic">(Reenter provides digital facilitation services for leasing, payment processing, and risk mitigation support.)</p>

                    <h4 className="font-semibold mt-6">2. Property Details</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 mt-2">
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium bg-gray-50">Property Address</td>
                            <td className="py-2 px-4">[Property Address]</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium bg-gray-50">Type</td>
                            <td className="py-2 px-4">[Residential / Commercial]</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium bg-gray-50">Apartment No</td>
                            <td className="py-2 px-4">[Daire No]</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300 font-medium bg-gray-50">Usage</td>
                            <td className="py-2 px-4">Housing Only</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-r border-gray-300 font-medium">Size</td>
                            <td className="py-2 px-4">[Area in m²]</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h4 className="font-semibold mt-6">3. Lease Term</h4>
                    <p><strong>Start Date:</strong> [Start Date]</p>
                    <p><strong>End Date:</strong> [End Date]</p>
                    <p><strong>Renewal:</strong> Unless terminated in accordance with this Agreement, the lease will renew automatically on an annual basis as per Turkish Code of Obligations (Türk Borçlar Kanunu) Article 347.</p>

                    <h4 className="font-semibold mt-6">4. Rent and Premium Payment Terms</h4>
                    <p><strong>Monthly Rent Amount:</strong> [₺ Rent Amount]</p>
                    <p><strong>Monthly Platform Premium:</strong> Calculated separately based on property, tenant, duration, and risk assessment for each lease.</p>
                    <p><strong>Payment Due Date:</strong> 1st of each month.</p>
                    <p><strong>Payment Method:</strong> Via Reenter's secure online payment system.</p>
                    <p className="text-sm italic">Premium Fee covers risk mitigation services including post-lease property damage protection and delayed rent protection.</p>

                    <h4 className="font-semibold mt-6">5. Rent and Premium Adjustment</h4>
                    <p><strong>Rent:</strong> Subject to annual adjustment based on the Turkish Consumer Price Index (TÜFE) as per TBK Article 344.</p>
                    <p><strong>Premium:</strong> Subject to adjustment based on property and tenant risk profile reassessments, service expansions, or coverage changes.</p>

                    <h4 className="font-semibold mt-6">6. Property Condition</h4>
                    <p>The Landlord shall deliver the Property in a clean, habitable, and fully functional condition with operational fixtures.</p>
                    <p>The Tenant shall maintain the property and return it in a similar condition, subject to normal wear and tear.</p>

                    <h4 className="font-semibold mt-6">7. Responsibilities and Expenses During Lease</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-300 mt-2">
                        <thead>
                          <tr className="border-b border-gray-300 bg-gray-50">
                            <th className="py-2 px-4 border-r border-gray-300 text-left">Tenant</th>
                            <th className="py-2 px-4 text-left">Landlord</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300">Pay rent and premium fees on time</td>
                            <td className="py-2 px-4">Maintain essential fixtures and structure</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300">Pay utilities (electricity, water, gas, internet)</td>
                            <td className="py-2 px-4">Pay taxes associated with ownership</td>
                          </tr>
                          <tr className="border-b border-gray-300">
                            <td className="py-2 px-4 border-r border-gray-300">Report damages promptly</td>
                            <td className="py-2 px-4">Perform major repairs due to wear/aging</td>
                          </tr>
                          <tr>
                            <td className="py-2 px-4 border-r border-gray-300">Maintain cleanliness and handle minor repairs</td>
                            <td className="py-2 px-4">Maintain habitability of property</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h4 className="font-semibold mt-6">8. Property Damage Protection</h4>
                    <p>Reenter coordinates property damage protection coverage through third-party insurers.</p>
                    <p><strong>Scope:</strong> Accidental physical damage during the lease period, excluding normal wear and tear or intentional damage.</p>
                    <p><strong>Claims:</strong> Landlords must report and submit claims within [10 days] of discovery through Reenter's system.</p>
                    <p>Reenter supports users through the claims process, coordinating documentation, communications, and insurer engagement.</p>

                    <h4 className="font-semibold mt-6">9. Delayed Rent Payment Protection</h4>
                    <p>Rent must be paid by the due date.</p>
                    <p>In case of non-payment:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Day 1: Rent due</li>
                      <li>Day 7: Reminder sent</li>
                      <li>Day 15: Optional late fee</li>
                      <li>Day 30: Claims process initiated by Reenter</li>
                    </ul>
                    <p className="mt-2">Coverage of unpaid rent extends up to three (3) months, subject to insurer terms.</p>
                    <p>Repeated rent delays (two times in six months) may result in account reassessment, premium increases, or lease termination recommendations.</p>

                    <h4 className="font-semibold mt-6">10. Pets, Guests, and Restrictions</h4>
                    <p><strong>Pets:</strong></p>
                    <p>Permitted only with Landlord's prior written consent.</p>
                    
                    <p className="mt-2"><strong>Guests:</strong></p>
                    <p>Tenants may host guests for up to fifteen (15) consecutive days without Landlord's approval.</p>
                    <p>Longer guest stays require written consent.</p>
                    
                    <p className="mt-2"><strong>Sublease:</strong></p>
                    <p>Strictly prohibited unless Landlord provides prior written approval via Reenter Platform.</p>
                    <p>Unauthorized subleasing or pet ownership constitutes a material breach of lease terms.</p>

                    <h4 className="font-semibold mt-6">11. Insurance and Claims Facilitation</h4>
                    <p>Reenter actively supports insurance and claims processes by:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Coordinating claims submissions</li>
                      <li>Managing necessary documentation</li>
                      <li>Liaising directly with insurance providers</li>
                      <li>Assisting users throughout the evaluation</li>
                    </ul>
                    <p className="mt-2">Final coverage decisions are made by the respective insurance providers according to their independent terms and conditions.</p>

                    <h4 className="font-semibold mt-6">12. Termination and Evacuation</h4>
                    <p><strong>Tenant Early Termination:</strong></p>
                    <p>30 days' written notice + early termination penalty equal to one (1) month's gross rent.</p>
                    
                    <p className="mt-2"><strong>Landlord Early Termination:</strong></p>
                    <p>Only for reasons under TBK Article 350 (personal need, building reconstruction, just cause).</p>
                    
                    <p className="mt-2"><strong>Material Breach:</strong></p>
                    <p>Immediate termination rights apply for serious violations, including non-payment and unauthorized subleasing.</p>
                    
                    <p className="mt-2"><strong>Evacuation:</strong></p>
                    <p>Tenant must vacate, remove belongings, and return keys within the notice period or face legal eviction processes under Turkish law.</p>

                    <h4 className="font-semibold mt-6">13. Dispute Resolution and Mediation</h4>
                    <p>Any dispute shall first be submitted to good-faith negotiation and mediation.</p>
                    <p>Reenter may offer internal mediation services.</p>
                    <p>If unresolved within thirty (30) days, parties may initiate proceedings at Istanbul Courts and Execution Offices.</p>
                    <p>Mediation is a mandatory precondition to legal action under Turkish law.</p>

                    <h4 className="font-semibold mt-6">14. Digital Execution</h4>
                    <p>This Agreement is digitally executed and legally binding without a handwritten signature under Turkish Electronic Signature Law No. 5070.</p>
                    
                    <p className="text-center font-medium mt-8">End of Lease Agreement Template</p>
                  </div>
                  
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-md mt-6">
                    <p>
                      <strong>Note:</strong> This template is used for all leases created through the Reenter platform. Both parties must digitally sign this agreement before the lease is activated. The signed agreement is stored securely in our database.
                    </p>
                  </div>
                </div>
              )}
              
              {/* Insurance Terms and Conditions Section */}
              {leaseTab === 'insurance' && (
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">Insurance Terms and Conditions</h3>
                  <p className="mb-6">
                    These terms and conditions govern the insurance facilitation services provided through the Reenter platform.
                  </p>

                  <div className="prose max-w-none bg-white p-8 border border-gray-200 rounded-md">
                    <h3 className="text-center font-bold text-xl mb-4">INSURANCE TERMS AND CONDITIONS</h3>
                    <p className="text-sm italic">Effective Date: [Insert Effective Date]</p>

                    <h4 className="font-semibold mt-6">1. Nature of Insurance Facilitation</h4>
                    <p>Reenter facilitates property protection and rent guarantee coverage through licensed third-party insurance providers on behalf of users. Reenter is not an insurer and does not underwrite insurance risks.</p>

                    <h4 className="font-semibold mt-6">2. Property Damage Protection</h4>
                    <p>Covers accidental physical damage to the leased property during the lease period.</p>
                    <p>Normal wear and tear, intentional damages, and structural failures unrelated to tenant actions are excluded.</p>
                    
                    <p className="mt-2"><strong>Claims Process:</strong></p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Users must promptly report any damage.</li>
                      <li>Reenter coordinates all claim submissions, documentation, and communications with insurance partners.</li>
                      <li>Approval and payouts are at the sole discretion of the insurance provider.</li>
                    </ul>

                    <h4 className="font-semibold mt-6">3. Rent Payment Protection</h4>
                    <p>Covers unpaid rent amounts up to three (3) months following a validated payment default.</p>
                    <p>Claims are initiated after rent remains unpaid for at least thirty (30) days past due date.</p>
                    
                    <p className="mt-2"><strong>Conditions:</strong></p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Timely notification by Landlord</li>
                      <li>Cooperation in legal recovery actions if required</li>
                    </ul>

                    <h4 className="font-semibold mt-6">4. Limitations and Exclusions</h4>
                    <p>Insurance coverage is subject to specific policy limits and insurer terms.</p>
                    <p>Reenter is not responsible for claim rejection or processing delays caused by the insurance provider.</p>
                    <p>Premium Fees are non-refundable.</p>

                    <h4 className="font-semibold mt-6">5. User Responsibilities</h4>
                    <p>Users agree to:</p>
                    <ul className="list-disc pl-6 mt-2">
                      <li>Provide accurate and complete information</li>
                      <li>Promptly notify Reenter of any claimable event</li>
                      <li>Cooperate fully in claim investigations</li>
                    </ul>

                    <h4 className="font-semibold mt-6">6. Changes to Coverage</h4>
                    <p>Reenter reserves the right to amend coverage terms, insurer partners, and premium calculations as needed. Material changes will be communicated to users.</p>

                    <h4 className="font-semibold mt-6">7. Governing Law</h4>
                    <p>These Insurance Terms are governed by the laws of the Republic of Turkey.</p>
                    
                    <p className="text-center font-medium mt-8">End of Insurance Terms and Conditions</p>
                  </div>
                  
                  <div className="bg-blue-50 text-blue-800 p-4 rounded-md mt-6">
                    <p>
                      <strong>Note:</strong> These terms apply to all insurance protections facilitated through the Reenter platform. By paying the premium fee for lease protection, users agree to these terms.
                    </p>
                  </div>
                </div>
              )}
            </motion.section>
          )}
          
          {/* User Agreement Content */}
          {activeTab === 'user' && (
            <motion.section
              key="user"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-md"
            >
              <div className="flex items-center mb-8">
                <div className="rounded-full bg-primary-100 p-3 mr-4">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={1.5} 
                    stroke="currentColor" 
                    className="w-6 h-6 text-primary-600"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" 
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">FAQ</h2>
              </div>
              
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="prose max-w-none">
                  <h3 className="text-center text-xl font-bold mb-4">Welcome to Reenter's FAQ section!</h3>
                  <p className="text-center mb-6">Here you'll find answers to the most common questions about using our platform.</p>

                  <h4 className="text-lg font-bold mt-8 text-primary-600 border-b border-gray-200 pb-2">GENERAL</h4>
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="font-bold">What is Reenter?</h5>
                      <p className="text-gray-700">
                        Reenter is an all-in-one digital platform for real estate leasing, rent management, payment processing, and risk mitigation. We connect Landlords and Tenants after they agree externally and help them manage their lease legally and securely through our platform.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Who can use Reenter?</h5>
                      <p className="text-gray-700">
                        Anyone over 18 years old who is legally capable of entering into a lease agreement under Turkish law.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Is Reenter a real estate agency or insurance company?</h5>
                      <p className="text-gray-700">
                        No. Reenter acts as a digital facilitator. We help users create leases, process payments, and manage risk through third-party insurance partners. We are not a real estate agent or insurance company.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Do I need to list my property on Reenter to use it?</h5>
                      <p className="text-gray-700">
                        No. Reenter starts after the Landlord and Tenant meet externally and agree to lease. We take over from lease creation onwards.
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mt-8 text-primary-600 border-b border-gray-200 pb-2">FOR LANDLORDS</h4>
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="font-bold">How do I list my property?</h5>
                      <p className="text-gray-700">
                        You create a Landlord account, input property details, and invite your Tenant to join and sign the lease.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">What responsibilities do I have as a Landlord?</h5>
                      <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-700">
                        <li>Ensure the property is habitable and safe</li>
                        <li>Handle structural and major repairs</li>
                        <li>Respect Tenant rights (e.g., no unauthorized entry)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">How do I receive rent payouts?</h5>
                      <p className="text-gray-700">
                        Rent payments are collected through Reenter and automatically transferred to your registered IBAN after processing.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">What happens if the Tenant damages my property?</h5>
                      <p className="text-gray-700">
                        You can initiate a claim for damages through Reenter. We coordinate the claim submission to our insurance partners.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">What happens if the Tenant doesn't pay rent?</h5>
                      <p className="text-gray-700">
                        If rent remains unpaid for over 30 days, Reenter initiates a delayed rent claim on your behalf, subject to insurance terms.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Can I evict a Tenant?</h5>
                      <p className="text-gray-700">
                        You must follow Turkish law (Türk Borçlar Kanunu). Typically, eviction requires a court process if the Tenant refuses to vacate voluntarily. Reenter can assist with coordination but does not conduct legal evictions.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Can I terminate the lease early?</h5>
                      <p className="text-gray-700">
                        Only under specific conditions allowed by Turkish law, such as personal need or major renovations.
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mt-8 text-primary-600 border-b border-gray-200 pb-2">FOR TENANTS</h4>
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="font-bold">How do I rent a property using Reenter?</h5>
                      <p className="text-gray-700">
                        After you and the Landlord agree externally, you will receive an invitation to join Reenter, create an account, and digitally sign the lease.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">What responsibilities do I have as a Tenant?</h5>
                      <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-700">
                        <li>Pay rent and Premium Fees on time</li>
                        <li>Maintain the property in good condition</li>
                        <li>Report any damages or maintenance needs promptly</li>
                        <li>Respect property rules (no unauthorized pets, subleasing, or long-term guests)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">What happens if I pay rent late?</h5>
                      <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-700">
                        <li>Reminder notices are sent automatically.</li>
                        <li>If payment is more than 30 days late, a rent delay claim may be filed.</li>
                        <li>Repeated late payments can lead to higher Premium Fees or lease termination.</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Can I have pets?</h5>
                      <p className="text-gray-700">
                        Only if the Landlord has given explicit written permission in the lease.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Can I have long-term guests?</h5>
                      <p className="text-gray-700">
                        Guests can stay up to 15 consecutive days without Landlord approval. Longer stays require consent.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Can I sublease the property?</h5>
                      <p className="text-gray-700">
                        Subleasing is prohibited unless you have explicit written approval from the Landlord through Reenter.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Can I terminate my lease early?</h5>
                      <p className="text-gray-700">
                        Yes. You must give 30 days' written notice and pay an early termination penalty equal to one (1) month's rent.
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mt-8 text-primary-600 border-b border-gray-200 pb-2">PAYMENTS & PREMIUM FEES</h4>
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="font-bold">What is the Premium Fee?</h5>
                      <p className="text-gray-700">
                        The Premium Fee is an additional monthly fee calculated individually for each lease. It covers services such as risk mitigation, insurance facilitation, payment processing, and platform support.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">How are payments processed?</h5>
                      <p className="text-gray-700">
                        Payments are securely processed through our authorized payment partners. You can pay by credit or debit card.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Is the Premium Fee refundable?</h5>
                      <p className="text-gray-700">
                        No. Premium Fees are non-refundable once collected.
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mt-8 text-primary-600 border-b border-gray-200 pb-2">INSURANCE & CLAIMS</h4>
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="font-bold">What does the insurance cover?</h5>
                      <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-700">
                        <li><strong>Property Damage Protection:</strong> Covers accidental damages caused by the Tenant during the lease.</li>
                        <li><strong>Delayed Rent Protection:</strong> Covers unpaid rent up to three (3) months after missed payments.</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">How do I file a claim for property damage?</h5>
                      <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-700">
                        <li>Landlords must submit a claim through Reenter with photos and documents.</li>
                        <li>We coordinate with our insurance partners to manage the claim process.</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">How do I file a claim for unpaid rent?</h5>
                      <p className="text-gray-700">
                        If rent is unpaid for over 30 days, Reenter automatically initiates the delayed rent protection claim process.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Is insurance coverage guaranteed?</h5>
                      <p className="text-gray-700">
                        No. Final decisions are made by the third-party insurance providers based on their independent assessment.
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mt-8 text-primary-600 border-b border-gray-200 pb-2">LEASE TERMS</h4>
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="font-bold">What happens at the end of the lease?</h5>
                      <p className="text-gray-700">Both parties must either:</p>
                      <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-700">
                        <li>Renew the lease, or</li>
                        <li>Terminate it according to the terms, ensuring proper notice is given and the property is returned in good condition.</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">What happens if there's damage when the Tenant moves out?</h5>
                      <p className="text-gray-700">
                        Landlords can initiate a property damage claim to recover repair costs.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Can the rent increase every year?</h5>
                      <p className="text-gray-700">
                        Yes. Rent may be increased annually based on the Turkish Consumer Price Index (TÜFE) or another lawful method specified in the lease.
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mt-8 text-primary-600 border-b border-gray-200 pb-2">LEGAL & DISPUTES</h4>
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="font-bold">What happens if there's a dispute?</h5>
                      <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-700">
                        <li>All disputes must first go through mandatory mediation.</li>
                        <li>If mediation fails, disputes are handled by the Istanbul Courts and Execution Offices.</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Can Reenter help resolve disputes?</h5>
                      <p className="text-gray-700">
                        Yes. Reenter offers internal mediation support services before formal mediation.
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mt-8 text-primary-600 border-b border-gray-200 pb-2">ACCOUNT & DATA</h4>
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="font-bold">How is my personal data protected?</h5>
                      <p className="text-gray-700">
                        We protect your data in compliance with KVKK (Turkey) and GDPR (Europe).
                        See our Privacy Policy for full details.
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="font-bold">Can I delete my account?</h5>
                      <p className="text-gray-700">
                        Yes. However, we may retain certain data for legal obligations (e.g., financial record-keeping).
                      </p>
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-bold mt-8 text-primary-600 border-b border-gray-200 pb-2">CONTACT US</h4>
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="font-bold">How can I contact Reenter?</h5>
                      <p className="text-gray-700">You can reach us via:</p>
                      <ul className="list-disc pl-6 space-y-2 mt-2 text-gray-700">
                        <li>Email: [Insert Support Email]</li>
                        <li>Phone: [Insert Support Number]</li>
                        <li>Address: [Insert Office Address]</li>
                      </ul>
                      <p className="mt-4 text-gray-700 font-medium">We're here to help you!</p>
                    </div>
                  </div>
                  
                  <p className="text-center font-medium mt-12">End of FAQ</p>
                </div>
              </div>
            </motion.section>
          )}
        </motion.div>
      </div>
    </div>
  );
} 