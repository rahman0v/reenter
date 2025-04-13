import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { StarIcon, PencilSquareIcon, TrashIcon, ArrowLeftIcon, FaceFrownIcon } from '@heroicons/react/24/solid';
import { ratingService } from '../services/api.js';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

// Define TypeScript types for ratings
interface ReviewerInfo {
  reviewer_id: number;
  reviewer_name: string;
  reviewer_photo?: string;
}

interface DetailedRating extends ReviewerInfo {
  id: number;
  rating: number;
  comment?: string;
  role: 'landlord' | 'tenant';
  lease_id: number;
  created_at: string;
  updated_at: string;
}

interface RatingStats {
  ratings: DetailedRating[];
  average: number;
  count: number;
}

interface RatingData {
  as_landlord: RatingStats;
  as_tenant: RatingStats;
  total_reviews: number;
}

const ReviewsPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ratings, setRatings] = useState<RatingData | null>(null);
  const [activeTab, setActiveTab] = useState<'landlord' | 'tenant'>('landlord');
  const [editingRating, setEditingRating] = useState<DetailedRating | null>(null);
  const [newRating, setNewRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Determine if we're viewing our own reviews or someone else's
  const viewingOwnReviews = !userId || (currentUser && userId === currentUser.id.toString());
  const targetUserId = userId ? parseInt(userId) : (currentUser ? currentUser.id : 0);
  
  useEffect(() => {
    const loadRatings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (targetUserId) {
          const data = await ratingService.getUserRatings(targetUserId);
          setRatings(data);
        }
      } catch (err) {
        console.error('Error loading ratings:', err);
        setError('Failed to load ratings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadRatings();
  }, [targetUserId]);
  
  const handleEdit = (rating: DetailedRating) => {
    setEditingRating(rating);
    setNewRating(rating.rating);
    setNewComment(rating.comment || '');
  };
  
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await ratingService.deleteRating(id);
      
      // Update the local state to remove the deleted rating
      if (ratings) {
        const updated = { ...ratings };
        
        // Find and remove the rating from the appropriate category
        ['as_landlord', 'as_tenant'].forEach((role) => {
          const category = role as 'as_landlord' | 'as_tenant';
          const index = updated[category].ratings.findIndex(r => r.id === id);
          
          if (index !== -1) {
            updated[category].ratings.splice(index, 1);
            updated[category].count--;
            
            // Recalculate average
            const sum = updated[category].ratings.reduce((acc, r) => acc + r.rating, 0);
            updated[category].average = updated[category].ratings.length > 0 
              ? sum / updated[category].ratings.length 
              : 0;
          }
        });
        
        updated.total_reviews = updated.as_landlord.count + updated.as_tenant.count;
        
        setRatings(updated);
        setSuccess('Review deleted successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting rating:', err);
      setError('Failed to delete review. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!editingRating) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const updatedRating = await ratingService.updateRating(editingRating.id, {
        rating: newRating,
        comment: newComment
      });
      
      // Update the local state
      if (ratings) {
        const updated = { ...ratings };
        const role = editingRating.role === 'landlord' ? 'as_landlord' : 'as_tenant';
        
        const index = updated[role].ratings.findIndex(r => r.id === editingRating.id);
        if (index !== -1) {
          updated[role].ratings[index] = {
            ...updated[role].ratings[index],
            rating: newRating,
            comment: newComment,
            updated_at: new Date().toISOString()
          };
          
          // Recalculate average
          const sum = updated[role].ratings.reduce((acc, r) => acc + r.rating, 0);
          updated[role].average = sum / updated[role].ratings.length;
        }
        
        setRatings(updated);
        setSuccess('Review updated successfully');
        setTimeout(() => setSuccess(null), 3000);
      }
      
      setEditingRating(null);
    } catch (err) {
      console.error('Error updating rating:', err);
      setError('Failed to update review. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancel = () => {
    setEditingRating(null);
    setNewRating(0);
    setNewComment('');
  };
  
  if (isLoading && !ratings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (!ratings) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FaceFrownIcon className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">No Ratings Found</h1>
            <p className="text-gray-500 mb-4">
              There are no ratings available for this user yet.
            </p>
            <Link 
              to="/"
              className="inline-block px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const activeRatings = activeTab === 'landlord' ? ratings.as_landlord : ratings.as_tenant;
  
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center mb-2">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Back
              </button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                {viewingOwnReviews ? 'My Reviews' : 'User Reviews'}
              </h1>
            </div>
            <p className="text-gray-500">
              {ratings.total_reviews} reviews - {ratings.as_landlord.count} as landlord, {ratings.as_tenant.count} as tenant
            </p>
          </div>
          
          <div className="flex space-x-2">
            <div className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg shadow-sm">
              <span className="font-bold text-xl mr-2">
                {((ratings.as_landlord.average + ratings.as_tenant.average) / 2).toFixed(1)}
              </span>
              <span className="text-sm">Overall Rating</span>
            </div>
          </div>
        </div>
        
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
        
        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'landlord'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('landlord')}
            >
              As Landlord ({ratings.as_landlord.count})
            </button>
            <button
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'tenant'
                  ? 'border-b-2 border-emerald-500 text-emerald-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('tenant')}
            >
              As Tenant ({ratings.as_tenant.count})
            </button>
          </div>
          
          {/* Rating Summary */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-wrap items-center">
              <div className="w-full md:w-auto pr-8 mb-4 md:mb-0">
                <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                  {activeRatings.average.toFixed(1)}
                </div>
                <div className="flex mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(activeRatings.average)
                          ? 'text-yellow-400'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Based on {activeRatings.count} reviews
                </div>
              </div>
              
              <div className="flex-1">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = activeRatings.ratings.filter(r => Math.round(r.rating) === star).length;
                    const percentage = activeRatings.count > 0 ? (count / activeRatings.count) * 100 : 0;
                    
                    return (
                      <div key={star} className="flex items-center">
                        <div className="flex items-center w-16">
                          <span className="text-sm font-medium text-gray-700 mr-2">{star}</span>
                          <StarIcon className="h-4 w-4 text-yellow-400" />
                        </div>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-16 text-right text-sm text-gray-500">
                          {count} ({percentage.toFixed(0)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          {/* Reviews List */}
          <div className="divide-y divide-gray-100">
            {activeRatings.ratings.length === 0 ? (
              <div className="p-8 text-center">
                <FaceFrownIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Reviews Yet</h3>
                <p className="text-gray-500">
                  There are no reviews for this category yet.
                </p>
              </div>
            ) : (
              activeRatings.ratings.map((rating) => (
                <div key={rating.id} className="p-6">
                  {editingRating && editingRating.id === rating.id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              className="focus:outline-none"
                            >
                              <StarIcon
                                className={`h-8 w-8 ${
                                  star <= newRating ? 'text-yellow-400' : 'text-gray-200'
                                } hover:text-yellow-500 transition-colors`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                          Comment
                        </label>
                        <textarea
                          id="comment"
                          rows={4}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
                          placeholder="Write your review..."
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSave}
                          className="px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            {rating.reviewer_photo ? (
                              <img
                                src={rating.reviewer_photo}
                                alt={rating.reviewer_name}
                                className="h-12 w-12 rounded-full"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                                {rating.reviewer_name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900">{rating.reviewer_name}</h4>
                            <div className="flex items-center mt-1">
                              <div className="flex mr-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <StarIcon
                                    key={star}
                                    className={`h-5 w-5 ${
                                      star <= rating.rating ? 'text-yellow-400' : 'text-gray-200'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">
                                {formatDate(rating.created_at)}
                                {rating.created_at !== rating.updated_at && ' (edited)'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Show edit/delete buttons for own reviews */}
                        {currentUser && currentUser.id === rating.reviewer_id && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(rating)}
                              className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                              title="Edit review"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(rating.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                              title="Delete review"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {rating.comment && (
                        <div className="mt-4 text-gray-700">
                          {rating.comment}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage; 