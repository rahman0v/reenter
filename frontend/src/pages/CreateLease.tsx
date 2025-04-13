import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ChevronDownIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  ArrowLongRightIcon,
  ArrowLongLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { leaseService, propertyService, userService, Lease, LeaseData, Currency } from '../services/api';
import { Formik, Form, Field, ErrorMessage, FormikProps, FormikErrors } from 'formik';
import * as Yup from 'yup';
import LeaseSummary from '../components/LeaseSummary';
import { Dialog, Transition } from '@headlessui/react';
import '../styles/CreateLease.css';

interface Property {
  id: number;
  name: string;
  address: string;
  monthly_rent?: number;
  currency?: string;
}

interface Tenant {
  id: number;
  name: string;
  email: string;
}

interface LeaseFormValues {
  // Parties to the Agreement (Step 1)
  landlord: {
    full_name: string;
    tc_id: string;
    email: string;
    phone: string;
  };
  tenant: {
    full_name: string;
    tc_id: string;
    email: string;
    phone: string;
  };
  
  // Property Details (Step 2)
  property_name: string;
  property_address: string;
  property_type: string;
  apartment_no: string;
  property_usage: string;
  property_size: string;
  
  // Lease Terms (Step 3)
  monthly_rent: string;
  currency: Currency;
  payment_day: string;
  payment_method: string;
  start_date: string;
  end_date: string;
  
  // Standard Terms fields are from a template, not entered
  
  // Additional Terms (Step 5)
  additional_terms: {
    pets_allowed: boolean;
    smoking_allowed: boolean;
    sublease_allowed: boolean;
    custom_terms: string;
    utilities_included: string[];
    notice_period_days?: number;
  }
}

const CreateLeaseSchema = Yup.object().shape({
  // Parties to the Agreement
  landlord: Yup.object().shape({
    full_name: Yup.string().required('Full name is required'),
    tc_id: Yup.string().required('TC ID is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
  }),
  tenant: Yup.object().shape({
    full_name: Yup.string().required('Full name is required'),
    tc_id: Yup.string().required('TC ID is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
  }),
  
  // Property Details
  property_name: Yup.string().required('Property name is required'),
  property_address: Yup.string().required('Property address is required'),
  property_type: Yup.string().required('Property type is required'),
  apartment_no: Yup.string(),
  property_usage: Yup.string().required('Property usage is required'),
  property_size: Yup.string().required('Property size is required'),
  
  // Lease Terms
  monthly_rent: Yup.number().required('Monthly rent is required').positive('Must be a positive number'),
  currency: Yup.string().required('Currency is required'),
  payment_day: Yup.number().required('Payment day is required')
    .min(1, 'Payment day must be between 1 and 28')
    .max(28, 'Payment day must be between 1 and 28'),
  payment_method: Yup.string().required('Payment method is required'),
  start_date: Yup.date().required('Start date is required'),
  end_date: Yup.date().required('End date is required')
    .min(Yup.ref('start_date'), 'End date must be after start date'),
  
  // Additional Terms
  additional_terms: Yup.object().shape({
    pets_allowed: Yup.boolean(),
    smoking_allowed: Yup.boolean(),
    sublease_allowed: Yup.boolean(),
    custom_terms: Yup.string(),
    utilities_included: Yup.array().of(Yup.string()),
  })
});

const CreateLease = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [leaseReference, setLeaseReference] = useState('');
  const [leaseMode, setLeaseMode] = useState<'draft' | 'direct'>('draft');
  const [createdLease, setCreatedLease] = useState<Lease | null>(null);
  const [leaseDuration, setLeaseDuration] = useState(0);
  const [currentUserInfo, setCurrentUserInfo] = useState<{ name?: string, email?: string, phone?: string } | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editLeaseId, setEditLeaseId] = useState<number | null>(null);

  // Parse URL parameters for edit mode
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const editId = query.get('edit');
    
    if (editId) {
      const leaseId = parseInt(editId);
      if (!isNaN(leaseId)) {
        console.log("Setting edit mode for lease ID:", leaseId);
        setEditMode(true);
        setEditLeaseId(leaseId);
        // Set the step to 1 to ensure we're starting from the beginning when editing
        setStep(1);
      }
    }
  }, [location.search]);

  // Try to get current user info for pre-filling the form - do this first
  useEffect(() => {
    const getCurrentUser = async () => {
      if (!editMode) { // Only load user data if we're not in edit mode
        try {
          const userData = await userService.getProfile();
          setCurrentUserInfo(userData);
        } catch (err) {
          console.error("Could not fetch current user data", err);
          // No need to set error - this is optional data
        }
      }
    };
    
    getCurrentUser();
  }, [editMode]);

  // Initial form values
  const [initialValues, setInitialValues] = useState<LeaseFormValues>({
    landlord: {
      full_name: currentUserInfo?.name || '',
      tc_id: '',
      email: currentUserInfo?.email || '',
      phone: currentUserInfo?.phone || '',
    },
    tenant: {
      full_name: '',
      tc_id: '',
      email: '',
      phone: '',
    },
    property_name: '',
    property_address: '',
    property_type: 'apartment',
    apartment_no: '',
    property_usage: 'residential',
    property_size: '',
    monthly_rent: '',
    currency: 'TRY',
    payment_day: '1',
    payment_method: 'bank_transfer',
    start_date: '',
    end_date: '',
    additional_terms: {
      pets_allowed: false,
      smoking_allowed: false,
      sublease_allowed: false,
      custom_terms: '',
      utilities_included: [],
    }
  });

  // Fetch lease data when in edit mode - do this before other data fetching
  useEffect(() => {
    const fetchLeaseForEdit = async () => {
      if (editMode && editLeaseId) {
        try {
          console.log("Fetching lease data for editing, ID:", editLeaseId);
          const leaseData = await leaseService.getLeaseById(editLeaseId);
          // Pre-fill form data here
          if (leaseData) {
            console.log("Successfully loaded lease data:", leaseData);
            const templateData = leaseData.template_data as any || {};
            setInitialValues({
              landlord: {
                full_name: leaseData.landlord_name || '',
                tc_id: templateData.landlord_tc_id || '',
                email: templateData.landlord_email || '',
                phone: templateData.landlord_phone || '',
              },
              tenant: {
                full_name: leaseData.tenant_name || '',
                tc_id: templateData.tenant_tc_id || '',
                email: templateData.tenant_email || '',
                phone: templateData.tenant_phone || '',
              },
              property_name: leaseData.property_name || '',
              property_address: leaseData.property_address || '',
              property_type: templateData.property_type || 'apartment',
              apartment_no: templateData.apartment_no || '',
              property_usage: templateData.property_usage || 'residential',
              property_size: templateData.property_size || '',
              monthly_rent: leaseData.monthly_rent?.toString() || '',
              currency: leaseData.currency || 'TRY',
              payment_day: leaseData.payment_day?.toString() || '1',
              payment_method: templateData.payment_method || 'bank_transfer',
              start_date: leaseData.start_date || '',
              end_date: leaseData.end_date || '',
              additional_terms: {
                pets_allowed: templateData.pets_allowed || false,
                smoking_allowed: templateData.smoking_allowed || false,
                sublease_allowed: templateData.sublease_allowed || false,
                custom_terms: templateData.additional_terms || '',
                utilities_included: templateData.utilities_included || [],
                notice_period_days: templateData.notice_period_days,
              }
            });
            setCreatedLease(leaseData);
          }
        } catch (err) {
          console.error("Error fetching lease data:", err);
          setError('Failed to load lease data for editing');
        }
      }
    };
    
    fetchLeaseForEdit();
  }, [editMode, editLeaseId]);

  // Fetch properties and potential tenants after edit data is loaded
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [propertiesData, tenantsData] = await Promise.all([
          propertyService.getUserProperties(),
          userService.getPotentialTenants()
        ]);
        
        setProperties(propertiesData);
        setTenants(tenantsData);
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      }
    };
    
    fetchData();
  }, []);

  const navigateToLeaseDetails = () => {
    if (createdLease && createdLease.id) {
      console.log("Navigating to lease details, ID:", createdLease.id);
      navigate(`/leases/${createdLease.id}`);
    } else {
      console.log("Cannot navigate to lease details - no created lease");
    }
  };

  const handleCreateLease = async (values: LeaseFormValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    setIsSubmitting(true);
    setError('');
    
    try {
      console.log("Processing lease form submission", editMode ? "in edit mode" : "in create mode");
      
      // Calculate lease duration for display purposes
      const startDate = new Date(values.start_date);
      const endDate = new Date(values.end_date);
      const durationInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                               (endDate.getMonth() - startDate.getMonth());
      
      // Format data for API
      const leaseData: LeaseData = {
        property_name: values.property_name,
        property_address: values.property_address,
        monthly_rent: Number(values.monthly_rent),
        currency: values.currency,
        start_date: values.start_date,
        end_date: values.end_date,
        premium: 8.5,
        template_data: {
          // Parties information
          landlord_tc_id: values.landlord.tc_id,
          landlord_email: values.landlord.email,
          landlord_phone: values.landlord.phone,
          tenant_tc_id: values.tenant.tc_id,
          tenant_email: values.tenant.email,
          tenant_phone: values.tenant.phone,
          
          // Property details
          property_type: values.property_type,
          apartment_no: values.apartment_no, 
          property_usage: values.property_usage,
          property_size: values.property_size,
          
          // Lease terms
          payment_day: Number(values.payment_day),
          payment_method: values.payment_method,
          lease_duration_months: durationInMonths,
          
          // Additional terms
          pets_allowed: values.additional_terms.pets_allowed,
          smoking_allowed: values.additional_terms.smoking_allowed,
          sublease_allowed: values.additional_terms.sublease_allowed,
          additional_terms: values.additional_terms.custom_terms,
          utilities_included: values.additional_terms.utilities_included,
        }
      };
      
      // Optional tenant assignment
      if (values.tenant && values.tenant.email) {
        // Find tenant by email (we can enhance this later)
        const matchingTenant = tenants.find(t => t.email === values.tenant.email);
        if (matchingTenant) {
          (leaseData as any).tenant_id = matchingTenant.id;
        }
      }
      
      let response;
      
      if (editMode && editLeaseId) {
        // Update existing lease
        console.log("Updating existing lease, ID:", editLeaseId);
        response = await leaseService.updateLease(editLeaseId, leaseData);
        console.log("Lease updated successfully:", response);
      } else {
        // Create new lease
        console.log("Creating new lease");
        response = await leaseService.createLease(leaseData);
        console.log("Lease created successfully:", response);
      }
      
      setLeaseReference(response.ref_code);
      setCreatedLease(response);
      setSuccess(true);
      setStep(6); // Jump to the review/final step
      
    } catch (err: any) {
      console.error("Error creating/updating lease:", err);
      setError(err.message || 'Failed to process lease');
    } finally {
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  const stepBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const stepForward = (formikProps: FormikProps<LeaseFormValues>) => {
    const { errors, touched, validateForm, setTouched } = formikProps;
    
    // Manually validate fields based on current step
    validateForm().then((validationErrors: FormikErrors<LeaseFormValues>) => {
      let canProceed = true;
      
      // Check validation for each step
      if (step === 1) {
        // Parties to the Agreement validation
        const landlordFields = ['landlord.full_name', 'landlord.tc_id', 'landlord.email', 'landlord.phone'];
        const tenantFields = ['tenant.full_name', 'tenant.tc_id', 'tenant.email', 'tenant.phone'];
        
        // For landlord, check nested fields
        let hasLandlordErrors = false;
        if (validationErrors.landlord) {
          hasLandlordErrors = Object.keys(validationErrors.landlord).length > 0;
        }
        
        // For tenant, check nested fields
        let hasTenantErrors = false;
        if (validationErrors.tenant) {
          hasTenantErrors = Object.keys(validationErrors.tenant).length > 0;
        }
        
        if (hasLandlordErrors || hasTenantErrors) {
          canProceed = false;
          // Mark fields as touched to show validation errors
          const touchedFields: Record<string, boolean> = {};
          landlordFields.forEach(field => { 
            const path = field.split('.');
            if (!touched[path[0]]) {
              touchedFields[path[0]] = {};
            }
            touchedFields[path[0]][path[1]] = true;
          });
          tenantFields.forEach(field => { 
            const path = field.split('.');
            if (!touched[path[0]]) {
              touchedFields[path[0]] = {};
            }
            touchedFields[path[0]][path[1]] = true;
          });
          setTouched({ ...touched, ...touchedFields });
        }
      } else if (step === 2) {
        // Property Details validation
        const step2Fields = ['property_name', 'property_address', 'property_type', 'property_usage', 'property_size'];
        const step2Errors = Object.keys(validationErrors)
          .filter(key => step2Fields.includes(key))
          .reduce((obj: Record<string, any>, key) => {
            if (key in validationErrors) {
              obj[key] = (validationErrors as any)[key];
            }
            return obj;
          }, {});
        
        if (Object.keys(step2Errors).length > 0) {
          canProceed = false;
          // Mark fields as touched to show validation errors
          const touchedFields: Record<string, boolean> = {};
          step2Fields.forEach(field => { touchedFields[field] = true; });
          setTouched({ ...touched, ...touchedFields });
        }
      } else if (step === 3) {
        // Lease Terms validation
        const step3Fields = ['monthly_rent', 'currency', 'payment_day', 'payment_method', 'start_date', 'end_date'];
        const step3Errors = Object.keys(validationErrors)
          .filter(key => step3Fields.includes(key))
          .reduce((obj: Record<string, any>, key) => {
            if (key in validationErrors) {
              obj[key] = (validationErrors as any)[key];
            }
            return obj;
          }, {});
        
        if (Object.keys(step3Errors).length > 0) {
          canProceed = false;
          // Mark fields as touched to show validation errors
          const touchedFields: Record<string, boolean> = {};
          step3Fields.forEach(field => { touchedFields[field] = true; });
          setTouched({ ...touched, ...touchedFields });
        }
      }
      // Steps 4 (Standard Terms) and 5 (Additional Terms) don't need mandatory validation
      
      if (canProceed && step < 6) {
        setStep(step + 1);
      }
    });
  };

  const utilityOptions = [
    { id: 'electricity', label: 'Electricity' },
    { id: 'water', label: 'Water' },
    { id: 'gas', label: 'Gas' },
    { id: 'internet', label: 'Internet' },
    { id: 'heat', label: 'Heating' },
    { id: 'trash', label: 'Trash Removal' },
    { id: 'cable', label: 'Cable TV' },
  ];

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    navigate('/leases');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8 pt-24 max-w-4xl">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              {editMode ? 'Edit Lease' : 'Create New Lease'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Complete the form below to {editMode ? 'edit' : 'create'} a lease agreement
            </p>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
          >
            <XMarkIcon className="h-4 w-4 mr-1" />
            Cancel
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${step >= 3 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 4 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${step >= 4 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
              4
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 5 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${step >= 5 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
              5
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 6 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gray-200'}`}></div>
            <div className={`flex items-center justify-center h-10 w-10 rounded-full ${step >= 6 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600'}`}>
              6
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Parties</span>
            <span>Property</span>
            <span>Terms</span>
            <span>Standard</span>
            <span>Additional</span>
            <span>Review</span>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <ExclamationCircleIcon className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
        )}
        
        <Formik
          initialValues={initialValues}
          validationSchema={CreateLeaseSchema}
          onSubmit={handleCreateLease}
        >
          {(formikProps: FormikProps<LeaseFormValues>) => {
            const { values, errors, touched, isValid, setFieldValue } = formikProps;
            
            // Helper function to render utility options
            const renderUtilityList = () => {
              return values.additional_terms.utilities_included.map((utility: string) => (
                <li key={utility}>
                  {utilityOptions.find(opt => opt.id === utility)?.label}
                </li>
              ));
            };
            
            return (
              <Form className="form-container">
                {/* Step 1: Parties to the Agreement */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Landlord Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label htmlFor="landlord.full_name" className="form-label">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            name="landlord.full_name"
                            id="landlord.full_name"
                            className="form-input"
                          />
                          <ErrorMessage name="landlord.full_name" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="landlord.tc_id" className="form-label">
                            TC ID <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            name="landlord.tc_id"
                            id="landlord.tc_id"
                            className="form-input"
                          />
                          <ErrorMessage name="landlord.tc_id" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="landlord.email" className="form-label">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="email"
                            name="landlord.email"
                            id="landlord.email"
                            className="form-input"
                          />
                          <ErrorMessage name="landlord.email" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="landlord.phone" className="form-label">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="tel"
                            name="landlord.phone"
                            id="landlord.phone"
                            className="form-input"
                          />
                          <ErrorMessage name="landlord.phone" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label htmlFor="tenant.full_name" className="form-label">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            name="tenant.full_name"
                            id="tenant.full_name"
                            className="form-input"
                          />
                          <ErrorMessage name="tenant.full_name" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="tenant.tc_id" className="form-label">
                            TC ID <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="text"
                            name="tenant.tc_id"
                            id="tenant.tc_id"
                            className="form-input"
                          />
                          <ErrorMessage name="tenant.tc_id" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="tenant.email" className="form-label">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="email"
                            name="tenant.email"
                            id="tenant.email"
                            className="form-input"
                          />
                          <ErrorMessage name="tenant.email" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="tenant.phone" className="form-label">
                            Phone <span className="text-red-500">*</span>
                          </label>
                          <Field
                            type="tel"
                            name="tenant.phone"
                            id="tenant.phone"
                            className="form-input"
                          />
                          <ErrorMessage name="tenant.phone" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Property Details */}
                {step === 2 && (
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group md:col-span-2">
                        <label htmlFor="property_name" className="form-label">
                          Property Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="property_name"
                          id="property_name"
                          className="form-input"
                        />
                        <ErrorMessage name="property_name" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div className="form-group md:col-span-2">
                        <label htmlFor="property_address" className="form-label">
                          Property Address <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="property_address"
                          id="property_address"
                          className="form-input"
                        />
                        <ErrorMessage name="property_address" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="property_type" className="form-label">
                          Property Type <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="property_type"
                          id="property_type"
                          className="form-select"
                        >
                          <option value="">Select type</option>
                          <option value="apartment">Apartment</option>
                          <option value="house">House</option>
                          <option value="villa">Villa</option>
                          <option value="studio">Studio</option>
                          <option value="office">Office</option>
                          <option value="shop">Shop</option>
                          <option value="other">Other</option>
                        </Field>
                        <ErrorMessage name="property_type" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="apartment_no" className="form-label">
                          Apartment/Unit Number
                        </label>
                        <Field
                          type="text"
                          name="apartment_no"
                          id="apartment_no"
                          className="form-input"
                        />
                        <ErrorMessage name="apartment_no" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="property_usage" className="form-label">
                          Property Usage <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="property_usage"
                          id="property_usage"
                          className="form-select"
                        >
                          <option value="residential">Residential</option>
                          <option value="commercial">Commercial</option>
                          <option value="mixed">Mixed use</option>
                        </Field>
                        <ErrorMessage name="property_usage" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="property_size" className="form-label">
                          Property Size (m²) <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="property_size"
                          id="property_size"
                          className="form-input"
                        />
                        <ErrorMessage name="property_size" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Lease Terms */}
                {step === 3 && (
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Terms</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <label htmlFor="monthly_rent" className="form-label">
                          Monthly Rent <span className="text-red-500">*</span>
                        </label>
                        <div className="rent-input-wrapper">
                          <Field
                            type="number"
                            name="monthly_rent"
                            id="monthly_rent"
                            className="form-input"
                            placeholder="0.00"
                            step="0.01"
                          />
                          <span className="currency-indicator">
                            {values.currency}
                          </span>
                        </div>
                        <ErrorMessage name="monthly_rent" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="currency" className="form-label">
                          Currency <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="currency"
                          id="currency"
                          className="form-select"
                        >
                          <option value="TRY">Turkish Lira (TRY)</option>
                          <option value="USD">US Dollar (USD)</option>
                          <option value="EUR">Euro (EUR)</option>
                        </Field>
                        <ErrorMessage name="currency" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="payment_day" className="form-label">
                          Payment Day <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="number"
                          name="payment_day"
                          id="payment_day"
                          min="1"
                          max="28"
                          className="form-input"
                        />
                        <ErrorMessage name="payment_day" component="div" className="mt-1 text-sm text-red-600" />
                        <p className="mt-1 text-xs text-gray-500">Day of the month when rent is due (1-28)</p>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="payment_method" className="form-label">
                          Payment Method <span className="text-red-500">*</span>
                        </label>
                        <Field
                          as="select"
                          name="payment_method"
                          id="payment_method"
                          className="form-select"
                        >
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="cash">Cash</option>
                          <option value="online_payment">Online Payment</option>
                          <option value="other">Other</option>
                        </Field>
                        <ErrorMessage name="payment_method" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="start_date" className="form-label">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="date"
                          name="start_date"
                          id="start_date"
                          className="form-input"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFieldValue('start_date', e.target.value);
                            if (e.target.value && values.end_date) {
                              const startDate = new Date(e.target.value);
                              const endDate = new Date(values.end_date);
                              const durationInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                                    (endDate.getMonth() - startDate.getMonth());
                              setLeaseDuration(durationInMonths);
                            }
                          }}
                        />
                        <ErrorMessage name="start_date" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="end_date" className="form-label">
                          End Date <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="date"
                          name="end_date"
                          id="end_date"
                          className="form-input"
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFieldValue('end_date', e.target.value);
                            if (values.start_date && e.target.value) {
                              const startDate = new Date(values.start_date);
                              const endDate = new Date(e.target.value);
                              const durationInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                                                    (endDate.getMonth() - startDate.getMonth());
                              setLeaseDuration(durationInMonths);
                            }
                          }}
                        />
                        <ErrorMessage name="end_date" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      {/* Display lease duration */}
                      {values.start_date && values.end_date && (
                        <div className="md:col-span-2 mt-2 bg-blue-50 p-3 rounded-md">
                          <p className="text-sm text-blue-800">
                            <strong>Lease Duration:</strong> {leaseDuration} {leaseDuration === 1 ? 'month' : 'months'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Step 4: Standard Terms */}
                {step === 4 && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Standard Terms</h2>
                    
                    <div className="bg-gray-50 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold mb-4">Important Notice</h3>
                      
                      <p className="mb-4">
                        The Reenter Digital Lease Agreement and Reenter Terms of Service are automatically incorporated into every lease created through the platform and shall have full legal force and effect as if fully stated herein.
                      </p>
                      
                      <p className="mb-4">
                        By proceeding, you confirm that you have reviewed, understood, and accepted these documents.
                      </p>
                      
                      <p className="mb-4">
                        You can review the full texts of these documents at any time through the following links:
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div>
                          <a 
                            href="http://localhost:3000/legal#lease" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Reenter Digital Lease Agreement
                          </a>
                        </div>
                        <div>
                          <a 
                            href="http://localhost:3000/legal#terms" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            Reenter Terms of Service
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Field
                        type="checkbox"
                        name="standardTermsAcknowledged"
                        id="standardTermsAcknowledged"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="standardTermsAcknowledged" className="ml-2 block text-sm text-gray-900">
                        I acknowledge and accept these standard terms and conditions
                      </label>
                    </div>
                  </div>
                )}
                
                {/* Step 5: Additional Terms */}
                {step === 5 && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Additional Terms</h2>
                    
                    <div className="mb-6">
                      <fieldset>
                        <legend className="text-md font-medium text-gray-700 mb-2">Utilities Included in Rent</legend>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {utilityOptions.map((option) => (
                            <div key={option.id} className="flex items-start">
                              <div className="flex items-center h-5">
                                <Field
                                  type="checkbox"
                                  name="additional_terms.utilities_included"
                                  value={option.id}
                                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor={`utility-${option.id}`} className="font-medium text-gray-700">
                                  {option.label}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </fieldset>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                      <div>
                        <div className="flex items-center mb-2">
                          <Field
                            type="checkbox"
                            name="additional_terms.pets_allowed"
                            id="pets_allowed"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor="pets_allowed" className="ml-2 block text-sm text-gray-700">
                            Pets Allowed
                          </label>
                        </div>
                        <ErrorMessage name="additional_terms.pets_allowed" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-2">
                          <Field
                            type="checkbox"
                            name="additional_terms.smoking_allowed"
                            id="smoking_allowed"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor="smoking_allowed" className="ml-2 block text-sm text-gray-700">
                            Smoking Allowed
                          </label>
                        </div>
                        <ErrorMessage name="additional_terms.smoking_allowed" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-2">
                          <Field
                            type="checkbox"
                            name="additional_terms.sublease_allowed"
                            id="sublease_allowed"
                            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                          />
                          <label htmlFor="sublease_allowed" className="ml-2 block text-sm text-gray-700">
                            Sublease Allowed
                          </label>
                        </div>
                        <ErrorMessage name="additional_terms.sublease_allowed" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="additional_terms.custom_terms" className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Terms & Conditions
                      </label>
                      <Field
                        as="textarea"
                        name="additional_terms.custom_terms"
                        id="custom_terms"
                        rows={6}
                        className="form-textarea"
                        placeholder="Enter any additional terms, rules, or special conditions..."
                      />
                      <ErrorMessage name="additional_terms.custom_terms" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                )}
                
                {/* Step 6: Review */}
                {step === 6 && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Review & Create Lease</h2>
                    
                    {success ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-green-800">Lease Created Successfully!</h3>
                            <div className="mt-2 text-sm text-green-700">
                              <p>Your lease has been created and is ready for review.</p>
                              <p className="mt-1">Reference code: <span className="font-medium">{leaseReference}</span></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                          <p className="text-sm text-blue-700">
                            Please review all the information below before creating the lease. You'll be able to make changes later.
                          </p>
                        </div>
                        
                        <div className="border border-gray-200 rounded-lg p-4 mb-6">
                          {createdLease ? (
                            <LeaseSummary lease={createdLease} />
                          ) : (
                            <div className="space-y-6">
                              {/* Parties */}
                              <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Parties to the Agreement</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-gray-50 p-3 rounded">
                                    <h4 className="font-medium text-gray-800 mb-1">Landlord</h4>
                                    <p className="text-sm">Name: {values.landlord.full_name}</p>
                                    <p className="text-sm">TC ID: {values.landlord.tc_id}</p>
                                    <p className="text-sm">Email: {values.landlord.email}</p>
                                    <p className="text-sm">Phone: {values.landlord.phone}</p>
                                  </div>
                                  
                                  <div className="bg-gray-50 p-3 rounded">
                                    <h4 className="font-medium text-gray-800 mb-1">Tenant</h4>
                                    <p className="text-sm">Name: {values.tenant.full_name}</p>
                                    <p className="text-sm">TC ID: {values.tenant.tc_id}</p>
                                    <p className="text-sm">Email: {values.tenant.email}</p>
                                    <p className="text-sm">Phone: {values.tenant.phone}</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Property */}
                              <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Property Details</h3>
                                
                                <div className="bg-gray-50 p-3 rounded">
                                  <p className="text-sm">Name: {values.property_name}</p>
                                  <p className="text-sm">Address: {values.property_address}</p>
                                  <p className="text-sm">Type: {values.property_type}</p>
                                  {values.apartment_no && <p className="text-sm">Apartment No: {values.apartment_no}</p>}
                                  <p className="text-sm">Usage: {values.property_usage}</p>
                                  <p className="text-sm">Size: {values.property_size} m²</p>
                                </div>
                              </div>
                              
                              {/* Lease Terms */}
                              <div className="border-b border-gray-200 pb-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Lease Terms</h3>
                                
                                <div className="bg-gray-50 p-3 rounded">
                                  <p className="text-sm">Monthly Rent: {values.monthly_rent} {values.currency}</p>
                                  <p className="text-sm">Payment Day: {values.payment_day} of each month</p>
                                  <p className="text-sm">Payment Method: {values.payment_method}</p>
                                  <p className="text-sm">Start Date: {values.start_date}</p>
                                  <p className="text-sm">End Date: {values.end_date}</p>
                                  {leaseDuration > 0 && (
                                    <p className="text-sm">Duration: {leaseDuration} {leaseDuration === 1 ? 'month' : 'months'}</p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Additional Terms */}
                              <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Additional Terms</h3>
                                
                                <div className="bg-gray-50 p-3 rounded">
                                  <p className="text-sm">Pets Allowed: {values.additional_terms.pets_allowed ? 'Yes' : 'No'}</p>
                                  <p className="text-sm">Smoking Allowed: {values.additional_terms.smoking_allowed ? 'Yes' : 'No'}</p>
                                  <p className="text-sm">Sublease Allowed: {values.additional_terms.sublease_allowed ? 'Yes' : 'No'}</p>
                                  
                                  {values.additional_terms.utilities_included && values.additional_terms.utilities_included.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium">Utilities Included:</p>
                                      <ul className="list-disc list-inside text-sm ml-2">
                                        {renderUtilityList()}
                                      </ul>
                                    </div>
                                  )}
                                  
                                  {values.additional_terms.custom_terms && (
                                    <div className="mt-2">
                                      <p className="text-sm font-medium">Custom Terms:</p>
                                      <p className="text-sm whitespace-pre-wrap">{values.additional_terms.custom_terms}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md mb-6">
                          <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> By creating this lease, you agree to the terms and conditions outlined above. Once created, the lease will be sent to the tenant for review and signature.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Navigation buttons */}
                <div className="mt-8 flex justify-between">
                  {step > 1 && (
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200"
                      onClick={() => stepBack()}
                      disabled={isSubmitting}
                    >
                      <ArrowLongLeftIcon className="h-5 w-5 mr-2" />
                      Previous
                    </button>
                  )}
                  
                  {step === 1 && (
                    <div></div>
                  )}
                  
                  {step < 5 && (
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105"
                      onClick={() => stepForward(formikProps)}
                    >
                      Next
                      <ArrowLongRightIcon className="h-5 w-5 ml-2" />
                    </button>
                  )}
                  
                  {step === 5 && (
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105"
                      onClick={() => {
                        setStep(6);
                      }}
                    >
                      Review Lease
                      <ArrowLongRightIcon className="h-5 w-5 ml-2" />
                    </button>
                  )}
                  
                  {step === 6 && !success && (
                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Lease'}
                      <CheckCircleIcon className="h-5 w-5 ml-2" />
                    </button>
                  )}
                  
                  {step === 6 && success && (
                    <button
                      type="button"
                      className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 transform hover:scale-105"
                      onClick={navigateToLeaseDetails}
                    >
                      View Lease Details
                      <ArrowLongRightIcon className="h-5 w-5 ml-2" />
                    </button>
                  )}
                </div>
              </Form>
            );
          }}
        </Formik>
      </div>
      
      {/* Cancel Confirmation Dialog */}
      <Transition.Root show={showCancelConfirm} as={React.Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setShowCancelConfirm}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={React.Fragment}
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
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      Cancel Lease Creation?
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to cancel? All progress will be lost and you will be redirected to the Leases page.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                    onClick={confirmCancel}
                  >
                    Yes, Cancel
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    Continue Editing
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default CreateLease; 