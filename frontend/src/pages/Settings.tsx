import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import { 
  UserCircleIcon, 
  ShieldCheckIcon, 
  CreditCardIcon, 
  EyeIcon, 
  BellIcon, 
  Cog6ToothIcon,
  KeyIcon,
  ArrowPathIcon,
  TrashIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon,
  PencilIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  photo_url?: string;
  preferred_name?: string;
  address?: string;
  emergency_contact?: string;
  education_status?: string;
  employment_status?: string;
  date_of_birth?: string;
  created_at: string;
  updated_at?: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  socialLogins: {
    google: boolean;
    facebook: boolean;
    apple: boolean;
  };
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  name: string;
  last4: string;
  expiry?: string;
  isDefault: boolean;
}

interface NotificationSettings {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  paymentReminders: boolean;
  leaseExpiring: boolean;
  profileAlerts: boolean;
  marketing: boolean;
}

interface Preferences {
  language: string;
  timezone: string;
  currency: string;
}

type SettingsSection = 'account' | 'security' | 'payments' | 'privacy' | 'notifications' | 'preferences';

export default function AccountSettings() {
  const { currentUser } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('account');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    socialLogins: {
      google: false,
      facebook: false,
      apple: false
    }
  });
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    sms: true,
    inApp: true,
    paymentReminders: true,
    leaseExpiring: true,
    profileAlerts: true,
    marketing: false
  });
  
  // Preferences
  const [preferences, setPreferences] = useState<Preferences>({
    language: 'en',
    timezone: 'UTC',
    currency: 'USD'
  });
  
  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', name: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: '2', type: 'bank', name: 'Chase Bank', last4: '1234', isDefault: false }
  ]);
  
  // Payout methods
  const [payoutMethods, setPayoutMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'bank', name: 'Chase Bank', last4: '1234', isDefault: true }
  ]);
  
  // Password reset
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Fetch settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch these settings from your backend
        // For now, we'll use mock data
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load settings');
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Handle section change
  const handleSectionChange = (section: SettingsSection) => {
    setActiveSection(section);
    setError(null);
    setSuccess(null);
  };
  
  // Handle notification toggle
  const handleNotificationToggle = (setting: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  // Handle security toggle
  const handleSecurityToggle = (setting: 'twoFactorEnabled' | keyof SecuritySettings['socialLogins']) => {
    if (setting === 'twoFactorEnabled') {
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: !prev.twoFactorEnabled
      }));
    } else {
      setSecuritySettings(prev => ({
        ...prev,
        socialLogins: {
          ...prev.socialLogins,
          [setting]: !prev.socialLogins[setting]
        }
      }));
    }
  };
  
  // Handle preference change
  const handlePreferenceChange = (setting: keyof Preferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [setting]: value
    }));
  };
  
  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Validate password requirements
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(passwordForm.newPassword)) {
        throw new Error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      }

      // Validate password confirmation
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      // Call API to change password
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      // Reset form and show success message
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setSuccess('Password changed successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle password reset
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    try {
      setIsLoading(true);
      // In a real app, you would call your API to reset the password
      // await userService.resetPassword(passwordForm);
      
      // Mock success
      setSuccess('Password updated successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setIsLoading(false);
    } catch (err) {
      setError('Failed to update password');
      setIsLoading(false);
    }
  };
  
  // Handle payment method actions
  const handlePaymentMethodAction = async (action: 'add' | 'edit' | 'remove' | 'setDefault', id?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      switch (action) {
        case 'add':
          // Open payment method form modal
          // This would be implemented with a modal component
          break;
        case 'edit':
          if (!id) throw new Error('Payment method ID is required');
          // Open edit form for the specific payment method
          break;
        case 'remove':
          if (!id) throw new Error('Payment method ID is required');
          if (!window.confirm('Are you sure you want to remove this payment method?')) {
            return;
          }
          // Call API to remove payment method
          await userService.removePaymentMethod(id);
          setPaymentMethods(prev => prev.filter(method => method.id !== id));
          setSuccess('Payment method removed successfully');
          break;
        case 'setDefault':
          if (!id) throw new Error('Payment method ID is required');
          // Call API to set default payment method
          await userService.setDefaultPaymentMethod(id);
          setPaymentMethods(prev => prev.map(method => ({
            ...method,
            isDefault: method.id === id
          })));
          setSuccess('Default payment method updated successfully');
          break;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payment method';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle payout method actions
  const handlePayoutMethodAction = async (action: 'add' | 'edit' | 'remove' | 'setDefault', id?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      switch (action) {
        case 'add':
          // Open payout method form modal
          // This would be implemented with a modal component
          break;
        case 'edit':
          if (!id) throw new Error('Payout method ID is required');
          // Open edit form for the specific payout method
          break;
        case 'remove':
          if (!id) throw new Error('Payout method ID is required');
          if (!window.confirm('Are you sure you want to remove this payout method?')) {
            return;
          }
          // Call API to remove payout method
          await userService.removePayoutMethod(id);
          setPayoutMethods(prev => prev.filter(method => method.id !== id));
          setSuccess('Payout method removed successfully');
          break;
        case 'setDefault':
          if (!id) throw new Error('Payout method ID is required');
          // Call API to set default payout method
          await userService.setDefaultPayoutMethod(id);
          setPayoutMethods(prev => prev.map(method => ({
            ...method,
            isDefault: method.id === id
          })));
          setSuccess('Default payout method updated successfully');
          break;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update payout method';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle data request
  const handleDataRequest = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Validate user authentication
      if (!currentUser) {
        throw new Error('You must be logged in to request your data');
      }

      // Call API to request personal data
      await userService.requestPersonalData();
      
      setSuccess('Your personal data request has been submitted. We will send it to your email address within 48 hours.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request personal data';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle account deletion
  const handleAccountDeletion = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Validate user authentication
      if (!currentUser) {
        throw new Error('You must be logged in to delete your account');
      }

      // Confirm deletion
      if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
      }

      // Call API to delete account
      await userService.deleteAccount();
      
      // Redirect to home page
      window.location.href = '/';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete account';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Save settings
  const saveSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Validate user authentication
      if (!currentUser) {
        throw new Error('You must be logged in to save settings');
      }

      // Prepare settings data based on active section
      let settingsData;
      switch (activeSection) {
        case 'security':
          settingsData = { security: securitySettings };
          break;
        case 'notifications':
          settingsData = { notifications: notificationSettings };
          break;
        case 'preferences':
          settingsData = { preferences };
          break;
        default:
          throw new Error('Invalid section selected');
      }

      // Call API to save settings
      await userService.updateSettings(settingsData);
      
      setSuccess('Settings saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save settings';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Navigation tiles
  const navigationTiles: Array<{
    id: SettingsSection;
    name: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  }> = [
    { id: 'account', name: 'Account Info', icon: UserCircleIcon },
    { id: 'security', name: 'Login & Security', icon: ShieldCheckIcon },
    { id: 'payments', name: 'Payments & Payouts', icon: CreditCardIcon },
    { id: 'privacy', name: 'Privacy & Sharing', icon: EyeIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'preferences', name: 'Preferences', icon: Cog6ToothIcon }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your account settings and preferences
          </p>
        </div>
        
        {/* Navigation Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {navigationTiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => handleSectionChange(tile.id)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-xl
                ${activeSection === tile.id
                  ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }
                transition-all duration-200
              `}
            >
              <tile.icon className={`h-6 w-6 mb-2 ${activeSection === tile.id ? 'text-blue-500' : 'text-gray-500'}`} />
              <span className="text-sm font-medium">{tile.name}</span>
            </button>
          ))}
        </div>
        
        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <XMarkIcon className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
        
        {/* Account Section */}
        {activeSection === 'account' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-500">This section will be implemented later.</p>
            </div>
          </div>
        )}
        
        {/* Login & Security Section */}
        {activeSection === 'security' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Login & Security</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Password Reset */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Password</h3>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <CheckIcon className="h-4 w-4 mr-2" />
                      )}
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
              
              {/* Two-Factor Authentication */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <button
                    onClick={() => handleSecurityToggle('twoFactorEnabled')}
                    className={`
                      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${securitySettings.twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  >
                    <span
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${securitySettings.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>
              </div>
              
              {/* Social Logins */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">Social Logins</h3>
                <div className="space-y-4">
                  {Object.entries(securitySettings.socialLogins).map(([provider, isConnected]) => (
                    <div key={provider} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                          <span className="text-lg font-medium text-gray-700 capitalize">{provider[0]}</span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 capitalize">{provider}</h4>
                          <p className="text-xs text-gray-500">
                            {isConnected ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSecurityToggle(provider as keyof SecuritySettings['socialLogins'])}
                        className={`
                          inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium
                          ${isConnected
                            ? 'border-red-300 text-red-700 hover:bg-red-50'
                            : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                          }
                        `}
                      >
                        {isConnected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Payments & Payouts Section */}
        {activeSection === 'payments' && (
          <div className="space-y-6">
            {/* Payments Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Payment Methods</h2>
                <button
                  onClick={() => handlePaymentMethodAction('add')}
                  className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Payment Method
                </button>
              </div>
              <div className="p-6">
                {paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            {method.type === 'card' ? (
                              <CreditCardIcon className="h-5 w-5 text-gray-500" />
                            ) : (
                              <BanknotesIcon className="h-5 w-5 text-gray-500" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{method.name}</h4>
                            <p className="text-xs text-gray-500">
                              {method.type === 'card' ? `•••• ${method.last4}` : `Account ending in ${method.last4}`}
                              {method.expiry && ` • Expires ${method.expiry}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!method.isDefault && (
                            <button
                              onClick={() => handlePaymentMethodAction('setDefault', method.id)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handlePaymentMethodAction('edit', method.id)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <PencilIcon className="h-3 w-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handlePaymentMethodAction('remove', method.id)}
                            className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 hover:bg-red-50 transition-colors duration-200"
                          >
                            <TrashIcon className="h-3 w-3 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No payment methods added yet.</p>
                )}
              </div>
            </div>
            
            {/* Payouts Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Payout Methods</h2>
                <button
                  onClick={() => handlePayoutMethodAction('add')}
                  className="inline-flex items-center px-3 py-1.5 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50 transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Payout Method
                </button>
              </div>
              <div className="p-6">
                {payoutMethods.length > 0 ? (
                  <div className="space-y-4">
                    {payoutMethods.map((method) => (
                      <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            <BanknotesIcon className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{method.name}</h4>
                            <p className="text-xs text-gray-500">
                              Account ending in {method.last4}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!method.isDefault && (
                            <button
                              onClick={() => handlePayoutMethodAction('setDefault', method.id)}
                              className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => handlePayoutMethodAction('edit', method.id)}
                            className="inline-flex items-center px-2 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                          >
                            <PencilIcon className="h-3 w-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handlePayoutMethodAction('remove', method.id)}
                            className="inline-flex items-center px-2 py-1 border border-red-300 rounded text-xs font-medium text-red-700 hover:bg-red-50 transition-colors duration-200"
                          >
                            <TrashIcon className="h-3 w-3 mr-1" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No payout methods added yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Privacy & Sharing Section */}
        {activeSection === 'privacy' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Privacy & Sharing</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Request Personal Data */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-gray-900">Request Your Personal Data</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      You can request a copy of all the personal data we hold about you. We'll prepare a file with your data and send it to your email address.
                    </p>
                    <button
                      onClick={handleDataRequest}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      Request Data
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Delete Account */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-red-50 rounded-lg">
                      <TrashIcon className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-md font-medium text-gray-900">Delete Your Account</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Once you delete your account, there is no going back. Please be certain. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleAccountDeletion}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Notifications Section */}
        {activeSection === 'notifications' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Notification Channels */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900">Notification Channels</h3>
                <div className="space-y-4">
                  {[
                    { id: 'email', label: 'Email Notifications' },
                    { id: 'sms', label: 'SMS Notifications' },
                    { id: 'inApp', label: 'In-App Alerts' }
                  ].map((channel) => (
                    <div key={channel.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-sm text-gray-700">{channel.label}</span>
                      <button
                        onClick={() => handleNotificationToggle(channel.id as keyof NotificationSettings)}
                        className={`
                          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          ${notificationSettings[channel.id as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-200'}
                        `}
                      >
                        <span
                          className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${notificationSettings[channel.id as keyof NotificationSettings] ? 'translate-x-5' : 'translate-x-0'}
                          `}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Notification Categories */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-4">Notification Categories</h3>
                <div className="space-y-4">
                  {[
                    { id: 'paymentReminders', label: 'Payment Reminders' },
                    { id: 'leaseExpiring', label: 'Lease Expiring Alerts' },
                    { id: 'profileAlerts', label: 'Profile Updates' }
                  ].map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-sm text-gray-700">{category.label}</span>
                      <button
                        onClick={() => handleNotificationToggle(category.id as keyof NotificationSettings)}
                        className={`
                          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          ${notificationSettings[category.id as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-200'}
                        `}
                      >
                        <span
                          className={`
                            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                            ${notificationSettings[category.id as keyof NotificationSettings] ? 'translate-x-5' : 'translate-x-0'}
                          `}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Marketing Communications */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div>
                    <h3 className="text-md font-medium text-gray-900">Marketing Communications</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Receive updates about new features, promotions, and other marketing content
                    </p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('marketing')}
                    className={`
                      relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      ${notificationSettings.marketing ? 'bg-blue-600' : 'bg-gray-200'}
                    `}
                  >
                    <span
                      className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${notificationSettings.marketing ? 'translate-x-5' : 'translate-x-0'}
                      `}
                    />
                  </button>
                </div>
              </div>
              
              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={saveSettings}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  Save Notification Settings
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Preferences Section */}
        {activeSection === 'preferences' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">Preferences</h2>
            </div>
            <div className="p-6 space-y-6">
              {/* Language */}
              <div className="space-y-2">
                <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                  Language
                </label>
                <select
                  id="language"
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="it">Italian</option>
                  <option value="pt">Portuguese</option>
                  <option value="ru">Russian</option>
                  <option value="zh">Chinese</option>
                  <option value="ja">Japanese</option>
                  <option value="ko">Korean</option>
                </select>
              </div>
              
              {/* Timezone */}
              <div className="space-y-2">
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={preferences.timezone}
                  onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">Eastern Time (ET)</option>
                  <option value="CST">Central Time (CT)</option>
                  <option value="MST">Mountain Time (MT)</option>
                  <option value="PST">Pacific Time (PT)</option>
                  <option value="GMT">Greenwich Mean Time (GMT)</option>
                </select>
              </div>
              
              {/* Currency */}
              <div className="space-y-2">
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                  Currency
                </label>
                <select
                  id="currency"
                  value={preferences.currency}
                  onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                  <option value="CAD">Canadian Dollar (C$)</option>
                  <option value="AUD">Australian Dollar (A$)</option>
                  <option value="JPY">Japanese Yen (¥)</option>
                  <option value="CNY">Chinese Yuan (¥)</option>
                  <option value="INR">Indian Rupee (₹)</option>
                </select>
              </div>
              
              {/* Save Button */}
              <div className="pt-4 border-t border-gray-200 flex justify-end">
                <button
                  onClick={saveSettings}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckIcon className="h-4 w-4 mr-2" />
                  )}
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 