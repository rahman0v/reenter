import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StarIcon, UserIcon, HomeIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { userService, ratingService, leaseService } from '../services/api.js';
import LoadingSpinner from '../components/LoadingSpinner';

// Define interface for profile data to help with TypeScript typing
interface PublicProfileData {
  id: number;
  name: string;
  preferred_name?: string;
  photo_url?: string;
  bio?: string;
  role: string;
  created_at: string;
  ratings: {
    as_landlord: {
      average: number;
      count: number;
      ratings?: any[];
    };
    as_tenant: {
      average: number;
      count: number;
      ratings?: any[];
    };
    total_reviews: number;
  };
}

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [leases, setLeases] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Rating form state
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [selectedLease, setSelectedLease] = useState<any>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingRole, setRatingRole] = useState<'landlord' | 'tenant'>('landlord');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!userId) {
          setError('Invalid user ID');
          setLoading(false);
          return;
        }
        
        // Load user profile data using fetch instead of userService
        const API_URL = import.meta.env.VITE_API_URL || 
                       (window.location.hostname === 'localhost' 
                        ? 'http://localhost:5000/api' 
                        : '/api');
        
        const token = localStorage.getItem('token');
        
        console.log(`Fetching public profile for userId: ${userId} from ${API_URL}/users/${userId}/public`);
        
        const profileResponse = await fetch(`${API_URL}/users/${userId}/public`, {
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token || ''
          }
        });
        
        console.log('Profile response status:', profileResponse.status);
        
        if (!profileResponse.ok) {
          let errorData;
          try {
            errorData = await profileResponse.json();
            console.error('Profile fetch error details:', errorData);
          } catch (e) {
            console.error('Could not parse error response:', e);
          }
          
          throw new Error(`Failed to fetch public profile: ${profileResponse.status} ${errorData?.message || ''}`);
        }
        
        const userData = await profileResponse.json();
        console.log('Public profile data received:', userData);
        setProfileData(userData);
        
        // Load ratings
        console.log(`Fetching ratings for userId: ${userId}`);
        const ratingsData = await ratingService.getUserRatings(parseInt(userId));
        console.log('Ratings data received:', ratingsData);
        setRatings(ratingsData);
        
        // Load leases between current user and viewed user
        console.log('Fetching all leases');
        const allLeases = await leaseService.getAllLeases();
        console.log('Leases data received:', allLeases);
        
        const sharedLeases = allLeases.filter((lease: any) => {
          if (!currentUser) return false;
          const isShared = (
            (lease.landlord_id === parseInt(userId) && lease.tenant_id === currentUser.id) || 
            (lease.tenant_id === parseInt(userId) && lease.landlord_id === currentUser.id)
          );
          console.log(`Lease ID ${lease.id} is shared: ${isShared}`);
          return isShared;
        });
        
        console.log('Filtered shared leases:', sharedLeases);
        setLeases(sharedLeases);
        
        // Set default rating role based on relationship
        if (sharedLeases.length > 0 && userId) {
          const isLandlord = sharedLeases[0].landlord_id === parseInt(userId);
          const role = isLandlord ? 'landlord' : 'tenant';
          console.log(`Setting role to ${role} for user ${userId}`);
          setRatingRole(role);
        }
        
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(`Failed to load profile: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      loadProfile();
    }
  }, [userId, currentUser]);

  const handleSubmitRating = async () => {
    if (!selectedLease) {
      setError('Please select a lease for this rating');
      return;
    }
    
    if (!userId) {
      setError('Invalid user ID');
      return;
    }
    
    try {
      setSubmitLoading(true);
      setError(null);
      
      await ratingService.createRating({
        reviewed_id: parseInt(userId),
        lease_id: selectedLease.id,
        rating: ratingValue,
        comment: ratingComment,
        role: ratingRole
      });
      
      // Refresh ratings
      const updatedRatings = await ratingService.getUserRatings(parseInt(userId));
      setRatings(updatedRatings);
      
      // Reset form
      setShowRatingForm(false);
      setRatingValue(5);
      setRatingComment('');
      setSelectedLease(null);
      
      setSuccess('Rating submitted successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error submitting rating:', err);
      setError('Failed to submit rating. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <UserIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h1>
            <p className="text-gray-500 mb-4">
              The user profile you're looking for doesn't exist or is not available.
            </p>
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasSharedLease = leases.length > 0;
  
  // Determine if user has already rated this person in the selected role
  const canRate = (leaseId: number, role: 'landlord' | 'tenant'): boolean => {
    if (!ratings || !currentUser) return false;
    
    const roleProperty = role === 'landlord' ? 'as_landlord' : 'as_tenant';
    const existingRating = ratings[roleProperty].ratings.find(
      (r: any) => r.lease_id === leaseId && r.reviewer_id === currentUser.id
    );
    
    return !existingRating;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-6"
        >
          <ChevronRightIcon className="h-5 w-5 rotate-180 mr-1" />
          <span>Back</span>
        </button>
        
        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}
        
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-700 h-32"></div>
          <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center">
            <div className="-mt-16 mb-4 sm:mb-0 sm:mr-6">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
                {profileData.photo_url ? (
                  <img 
                    src={profileData.photo_url} 
                    alt={profileData.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-emerald-700">
                      {profileData.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                  <p className="text-gray-500">
                    {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                  </p>
                </div>
                
                {ratings && (
                  <div className="mt-2 sm:mt-0 flex flex-col items-end">
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <StarIcon 
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round((ratings.as_landlord.average + ratings.as_tenant.average) / 2) 
                                ? 'text-yellow-400' 
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold">
                        {((ratings.as_landlord.average + ratings.as_tenant.average) / 2).toFixed(1)}
                      </span>
                    </div>
                    <Link 
                      to={`/profile/reviews/${userId}`}
                      className="text-sm text-emerald-600 hover:text-emerald-700"
                    >
                      View {ratings.total_reviews} Reviews
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Rating Summary Cards */}
        {ratings && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Landlord Rating Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-emerald-100">
                <div className="flex items-center">
                  <HomeIcon className="h-5 w-5 text-emerald-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">As Landlord</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon 
                        key={star}
                        className={`h-6 w-6 ${
                          star <= Math.round(ratings.as_landlord.average) 
                            ? 'text-yellow-400' 
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold">{ratings.as_landlord.average.toFixed(1)}</span>
                  <span className="ml-2 text-sm text-gray-500">({ratings.as_landlord.count} reviews)</span>
                </div>
              </div>
            </div>
            
            {/* Tenant Rating Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-amber-100">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-amber-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">As Tenant</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon 
                        key={star}
                        className={`h-6 w-6 ${
                          star <= Math.round(ratings.as_tenant.average) 
                            ? 'text-yellow-400' 
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold">{ratings.as_tenant.average.toFixed(1)}</span>
                  <span className="ml-2 text-sm text-gray-500">({ratings.as_tenant.count} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* About Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">About</h2>
          </div>
          <div className="p-6">
            {profileData.bio ? (
              <p className="text-gray-700">{profileData.bio}</p>
            ) : (
              <p className="text-gray-500 italic">No bio provided</p>
            )}
          </div>
        </div>
        
        {/* Rating Button/Form Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Rate this {ratingRole}</h2>
          </div>
          
          <div className="p-6">
            {!hasSharedLease ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">You can only rate users you have a lease with.</p>
              </div>
            ) : showRatingForm ? (
              <div className="space-y-6">
                {/* Lease Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Lease
                  </label>
                  <select 
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    value={selectedLease ? selectedLease.id : ''}
                    onChange={(e) => {
                      const lease = leases.find(l => l.id === parseInt(e.target.value));
                      if (lease && userId) {
                        setSelectedLease(lease);
                        // Set role based on the selected lease
                        setRatingRole(lease.landlord_id === parseInt(userId) ? 'landlord' : 'tenant');
                      } else {
                        setSelectedLease(null);
                      }
                    }}
                  >
                    <option value="">Select a lease</option>
                    {leases.map(lease => {
                      if (!userId) return null;
                      
                      const propertyName = lease.property_name;
                      const leaseRole = lease.landlord_id === parseInt(userId) ? 'landlord' : 'tenant';
                      
                      // Only show leases where the user can still rate
                      if (canRate(lease.id, leaseRole)) {
                        return (
                          <option key={lease.id} value={lease.id}>
                            {propertyName} (as {leaseRole})
                          </option>
                        );
                      }
                      return null;
                    }).filter(Boolean)}
                  </select>
                  {leases.length > 0 && userId && !leases.some(lease => {
                    const leaseRole = lease.landlord_id === parseInt(userId) ? 'landlord' : 'tenant';
                    return canRate(lease.id, leaseRole);
                  }) && (
                    <p className="mt-2 text-sm text-orange-600">
                      You have already rated this user for all eligible leases.
                    </p>
                  )}
                </div>
                
                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingValue(star)}
                        className="focus:outline-none"
                      >
                        <StarIcon
                          className={`h-10 w-10 ${
                            star <= ratingValue ? 'text-yellow-400' : 'text-gray-200'
                          } hover:text-yellow-500 transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Comment */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                    Comments (optional)
                  </label>
                  <textarea
                    id="comment"
                    rows={4}
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder={`Write your review about this ${ratingRole}...`}
                  ></textarea>
                </div>
                
                {/* Submit Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleSubmitRating}
                    disabled={submitLoading || !selectedLease}
                    className={`px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg transition-colors ${
                      submitLoading || !selectedLease 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:bg-emerald-700'
                    }`}
                  >
                    {submitLoading ? 'Submitting...' : 'Submit Rating'}
                  </button>
                  <button
                    onClick={() => setShowRatingForm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <button
                  onClick={() => setShowRatingForm(true)}
                  className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  Write a Review
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile; 