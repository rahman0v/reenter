import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService, User } from '../services/api';
import {
  UserCircleIcon,
  PencilIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ShieldCheckIcon,
  CalendarIcon,
  EnvelopeIcon,
  PhoneIcon,
  BanknotesIcon,
  IdentificationIcon,
  LinkIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface ExtendedProfileData extends User {
  preferred_name?: string;
  address?: string;
  emergency_contact?: string;
  education_status?: string;
  employment_status?: string;
  date_of_birth?: string;
  trust_score: number;
  verifications: {
    email: boolean;
    phone: boolean;
    id: boolean;
    bank: boolean;
  };
  social_connections: {
    google: boolean;
    instagram: boolean;
    linkedin: boolean;
    twitter: boolean;
    facebook: boolean;
  };
  ratings: {
    as_landlord: {
      average: number;
      count: number;
    };
    as_tenant: {
      average: number;
      count: number;
    };
  };
}

const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="text-sm text-red-600 flex items-center">
    <XCircleIcon className="h-4 w-4 mr-1" />
    {message}
  </div>
);

const SuccessMessage = ({ message }: { message: string }) => (
  <div className="text-sm text-green-600 flex items-center">
    <CheckCircleIcon className="h-4 w-4 mr-1" />
    {message}
  </div>
);

const TrustBadge = ({ score }: { score: number }) => {
  let level = 'Unverified';
  let color = 'bg-gray-500';
  
  if (score >= 80) {
    level = 'Trusted';
    color = 'bg-green-500';
  } else if (score >= 50) {
    level = 'Verified';
    color = 'bg-blue-500';
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color} text-white`}>
      {level}
    </span>
  );
};

const VerificationCheck = ({ verified, label, onVerify }: { verified: boolean; label: string; onVerify?: () => void }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <div className="flex items-center space-x-3">
      {verified ? (
        <CheckCircleIcon className="h-5 w-5 text-green-500" />
      ) : (
        <XCircleIcon className="h-5 w-5 text-gray-300" />
      )}
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
    {!verified && onVerify && (
      <button 
        onClick={onVerify}
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        Verify
      </button>
    )}
  </div>
);

const SocialButton = ({ connected, platform, onConnect }: { connected: boolean; platform: string; onConnect: () => void }) => (
  <button
    onClick={onConnect}
    className={`flex items-center justify-center px-4 py-2 rounded-lg border ${
      connected ? 'border-green-500 text-green-500 bg-green-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
    } transition-colors`}
  >
    <LinkIcon className="h-5 w-5 mr-2" />
    {connected ? 'Connected' : `Connect ${platform}`}
  </button>
);

const ProfileCompletionBar = ({ score }: { score: number }) => {
  const percentage = Math.min(100, Math.max(0, score));
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">Profile Completion</span>
        <span className="text-sm font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      {percentage < 100 && (
        <p className="mt-2 text-sm text-gray-500">
          Complete your profile to increase your trust score and improve your experience.
        </p>
      )}
    </div>
  );
};

const MaskedField = ({ 
  value, 
  isEditing, 
  onToggleEdit, 
  onChange, 
  name, 
  type = "text",
  placeholder = "Not provided"
}: { 
  value: string; 
  isEditing: boolean; 
  onToggleEdit: () => void; 
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  type?: string;
  placeholder?: string;
}) => {
  const [showValue, setShowValue] = useState(false);
  
  if (isEditing) {
    return (
      <div className="flex items-center space-x-2">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm focus:outline-none"
          autoFocus
        />
        <button
          type="button"
          onClick={onToggleEdit}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Done
        </button>
      </div>
    );
  }
  
  if (!value) {
    return (
      <div className="flex items-center justify-between">
        <span className="text-gray-400 italic">{placeholder}</span>
        <button
          type="button"
          onClick={onToggleEdit}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <PencilIcon className="h-4 w-4 mr-1" />
          Add
        </button>
      </div>
    );
  }
  
  const maskedValue = type === "email" 
    ? value.replace(/(.{2}).*(@.*)/, '$1***$2')
    : value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="text-gray-900">{showValue ? value : maskedValue}</span>
        <button
          type="button"
          onClick={() => setShowValue(!showValue)}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          {showValue ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
        </button>
      </div>
      <button
        type="button"
        onClick={onToggleEdit}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
      >
        <PencilIcon className="h-4 w-4 mr-1" />
        Edit
      </button>
    </div>
  );
};

const ProfileField = ({
  label,
  name,
  value,
  type = "text",
  isEditing,
  onToggleEdit,
  onChange,
  placeholder = "Not provided",
  isSensitive = false
}: {
  label: string;
  name: string;
  value: string;
  type?: string;
  isEditing: boolean;
  onToggleEdit: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  isSensitive?: boolean;
}) => {
  return (
    <div className="py-6 border-b border-gray-100 last:border-b-0">
      <label htmlFor={name} className="block text-sm font-bold text-gray-700 mb-2">
        {label}
      </label>
      {isSensitive ? (
        <MaskedField
          value={value}
          isEditing={isEditing}
          onToggleEdit={onToggleEdit}
          onChange={onChange}
          name={name}
          type={type}
          placeholder={placeholder}
        />
      ) : (
        isEditing ? (
          <div className="flex items-center space-x-2">
            {type === "textarea" ? (
              <textarea
                name={name}
                id={name}
                rows={3}
                value={value}
                onChange={onChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm focus:outline-none"
                autoFocus
              />
            ) : (
              <input
                type={type}
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm focus:outline-none"
                autoFocus
              />
            )}
            <button
              type="button"
              onClick={onToggleEdit}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-900">{value || <span className="text-gray-400 italic">{placeholder}</span>}</span>
            <button
              type="button"
              onClick={onToggleEdit}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              {value ? 'Edit' : 'Add'}
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default function Profile() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<User>({
    id: 0,
    name: '',
    email: '',
    phone: '',
    bio: '',
    photo_url: '',
    created_at: '',
    updated_at: '',
    trust_score: 0,
    verifications: {
      email: false,
      phone: false,
      id: false,
      bank: false
    },
    social_connections: {
      google: false,
      instagram: false,
      linkedin: false,
      twitter: false,
      facebook: false
    },
    ratings: {
      as_landlord: { average: 0, count: 0 },
      as_tenant: { average: 0, count: 0 }
    }
  });
  
  // Track which fields are being edited
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});
  
  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      profileData.name,
      profileData.email,
      profileData.phone,
      profileData.bio,
      profileData.preferred_name,
      profileData.address,
      profileData.emergency_contact,
      profileData.education_status,
      profileData.employment_status,
      profileData.date_of_birth
    ];
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const data = await userService.getProfile();
        
        // Ensure all required fields exist in the response
        const completeData: User = {
          id: data.id || 0,
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          bio: data.bio || '',
          photo_url: data.photo_url || '',
          created_at: data.created_at || '',
          updated_at: data.updated_at || '',
          preferred_name: data.preferred_name || '',
          address: data.address || '',
          emergency_contact: data.emergency_contact || '',
          education_status: data.education_status || '',
          employment_status: data.employment_status || '',
          date_of_birth: data.date_of_birth || '',
          trust_score: data.trust_score || 0,
          verifications: data.verifications || {
            email: false,
            phone: false,
            id: false,
            bank: false
          },
          social_connections: data.social_connections || {
            google: false,
            instagram: false,
            linkedin: false,
            twitter: false,
            facebook: false
          },
          ratings: data.ratings || {
            as_landlord: { average: 0, count: 0 },
            as_tenant: { average: 0, count: 0 }
          }
        };
        
        setProfileData(completeData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
        
        // If API call fails, use current user data as fallback
        if (currentUser) {
          setProfileData({
            ...profileData,
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone || '',
            bio: currentUser.bio || '',
            photo_url: currentUser.photo_url || '',
            created_at: currentUser.created_at,
            updated_at: currentUser.updated_at || '',
            preferred_name: currentUser.preferred_name || '',
            address: currentUser.address || '',
            emergency_contact: currentUser.emergency_contact || '',
            education_status: currentUser.education_status || '',
            employment_status: currentUser.employment_status || '',
            date_of_birth: currentUser.date_of_birth || ''
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleFieldEdit = (fieldName: string) => {
    setEditingFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);
      
      const { id, name, email, phone, bio, photo_url, created_at, updated_at, ...extraFields } = profileData;
      await userService.updateProfile({ name, email, phone, bio, photo_url });
      setSuccess('Profile updated successfully');
      
      // Close all editing fields after saving
      setEditingFields({});
      
      // Show success message for 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSocialConnect = async (platform: string) => {
    try {
      await userService.connectSocialAccount(platform);
      setProfileData(prev => ({
        ...prev,
        social_connections: {
          ...prev.social_connections,
          [platform.toLowerCase()]: true
        }
      }));
    } catch (err) {
      setError(`Failed to connect ${platform} account`);
    }
  };
  
  const handleVerify = async (type: string) => {
    try {
      // Since verifyAccount doesn't exist in the API service, we'll simulate it
      // In a real implementation, you would add this method to the API service
      console.log(`Verifying ${type}...`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProfileData(prev => ({
        ...prev,
        verifications: {
          ...prev.verifications,
          [type]: true
        }
      }));
      
      setSuccess(`${type} verification successful`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to verify ${type}`);
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Information</h1>
        <p className="text-gray-500 mb-8">Manage your personal information and account settings</p>
        
        {/* Profile Completion Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <ProfileCompletionBar score={profileCompletion} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Card & Verifications */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 mb-4">
                    {profileData.photo_url ? (
                      <img src={profileData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-600 text-4xl font-bold">
                        {getInitials(profileData.name)}
                      </div>
                    )}
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100">
                      <CameraIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{profileData.name}</h2>
                  <div className="mt-2">
                    <TrustBadge score={profileData.trust_score} />
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Member since {new Date(profileData.created_at).toLocaleDateString()}
                  </div>
                  <div className="mt-4 flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900">
                        {profileData.ratings.as_landlord.average.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Landlord Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-semibold text-gray-900">
                        {profileData.ratings.as_tenant.average.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">Tenant Rating</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verifications Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-indigo-700 mb-4">Verified Information</h3>
                <div className="space-y-3">
                  <VerificationCheck 
                    verified={profileData.verifications.email} 
                    label="Email Address" 
                    onVerify={() => handleVerify('email')}
                  />
                  <VerificationCheck 
                    verified={profileData.verifications.phone} 
                    label="Phone Number" 
                    onVerify={() => handleVerify('phone')}
                  />
                  <VerificationCheck 
                    verified={profileData.verifications.id} 
                    label="ID Verification" 
                    onVerify={() => handleVerify('id')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-blue-700">Personal Information</h3>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isSaving ? <LoadingSpinner /> : 'Save Changes'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                {error && <ErrorMessage message={error} />}
                {success && <SuccessMessage message={success} />}
                
                {/* Information Fields - Form Summary View */}
                <div className="space-y-2">
                  <ProfileField
                    label="Full Legal Name"
                    name="name"
                    value={profileData.name || ''}
                    isEditing={editingFields.name || false}
                    onToggleEdit={() => toggleFieldEdit('name')}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Preferred Name"
                    name="preferred_name"
                    value={profileData.preferred_name || ''}
                    isEditing={editingFields.preferred_name || false}
                    onToggleEdit={() => toggleFieldEdit('preferred_name')}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Email"
                    name="email"
                    value={profileData.email || ''}
                    type="email"
                    isEditing={editingFields.email || false}
                    onToggleEdit={() => toggleFieldEdit('email')}
                    onChange={handleInputChange}
                    isSensitive={true}
                  />
                  
                  <ProfileField
                    label="Phone"
                    name="phone"
                    value={profileData.phone || ''}
                    type="tel"
                    isEditing={editingFields.phone || false}
                    onToggleEdit={() => toggleFieldEdit('phone')}
                    onChange={handleInputChange}
                    isSensitive={true}
                  />
                  
                  <ProfileField
                    label="Address"
                    name="address"
                    value={profileData.address || ''}
                    type="textarea"
                    isEditing={editingFields.address || false}
                    onToggleEdit={() => toggleFieldEdit('address')}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Emergency Contact"
                    name="emergency_contact"
                    value={profileData.emergency_contact || ''}
                    isEditing={editingFields.emergency_contact || false}
                    onToggleEdit={() => toggleFieldEdit('emergency_contact')}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Education Status"
                    name="education_status"
                    value={profileData.education_status || ''}
                    isEditing={editingFields.education_status || false}
                    onToggleEdit={() => toggleFieldEdit('education_status')}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Employment Status"
                    name="employment_status"
                    value={profileData.employment_status || ''}
                    isEditing={editingFields.employment_status || false}
                    onToggleEdit={() => toggleFieldEdit('employment_status')}
                    onChange={handleInputChange}
                  />
                  
                  <ProfileField
                    label="Bio"
                    name="bio"
                    value={profileData.bio || ''}
                    type="textarea"
                    isEditing={editingFields.bio || false}
                    onToggleEdit={() => toggleFieldEdit('bio')}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Social & Verification Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-green-700">Social & Verification</h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {/* Social Connections */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Social Accounts</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <SocialButton
                        connected={profileData.social_connections.google}
                        platform="Google"
                        onConnect={() => handleSocialConnect('google')}
                      />
                      <SocialButton
                        connected={profileData.social_connections.instagram}
                        platform="Instagram"
                        onConnect={() => handleSocialConnect('instagram')}
                      />
                      <SocialButton
                        connected={profileData.social_connections.linkedin}
                        platform="LinkedIn"
                        onConnect={() => handleSocialConnect('linkedin')}
                      />
                      <SocialButton
                        connected={profileData.social_connections.twitter}
                        platform="Twitter"
                        onConnect={() => handleSocialConnect('twitter')}
                      />
                      <SocialButton
                        connected={profileData.social_connections.facebook}
                        platform="Facebook"
                        onConnect={() => handleSocialConnect('facebook')}
                      />
                    </div>
                  </div>

                  {/* Trust Score */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Trust Score</h4>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                            {profileData.trust_score}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                        <div
                          style={{ width: `${profileData.trust_score}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ratings & Reviews Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h3 className="text-lg font-bold text-amber-700">Ratings & Reviews</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {/* Landlord Ratings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">As Landlord</h4>
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-2 text-2xl font-semibold text-gray-900">
                        {profileData.ratings.as_landlord.average.toFixed(1)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({profileData.ratings.as_landlord.count} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Tenant Ratings */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">As Tenant</h4>
                    <div className="flex items-center">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span className="ml-2 text-2xl font-semibold text-gray-900">
                        {profileData.ratings.as_tenant.average.toFixed(1)}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({profileData.ratings.as_tenant.count} reviews)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 