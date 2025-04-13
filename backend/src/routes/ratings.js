const express = require('express');
const { check, validationResult } = require('express-validator');
const Rating = require('../models/rating');
const Lease = require('../models/lease');
const Notification = require('../models/notification');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST api/ratings
// @desc    Create a new rating
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('reviewed_id', 'Reviewed user ID is required').isInt(),
      check('lease_id', 'Lease ID is required').isInt(),
      check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 }),
      check('role', 'Role must be landlord or tenant').isIn(['landlord', 'tenant'])
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { reviewed_id, lease_id, rating, comment, role } = req.body;
      const reviewer_id = req.user.id;

      // Verify the lease exists and the reviewer is part of it
      const lease = await Lease.findById(lease_id);
      if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
      }

      // Make sure user is part of the lease
      if (lease.landlord_id !== reviewer_id && lease.tenant_id !== reviewer_id) {
        return res.status(403).json({ message: 'Not authorized to rate for this lease' });
      }

      // Make sure reviewed user is the other party in the lease
      if (role === 'landlord' && lease.landlord_id !== reviewed_id) {
        return res.status(400).json({ message: 'Reviewed user is not the landlord of this lease' });
      }
      if (role === 'tenant' && lease.tenant_id !== reviewed_id) {
        return res.status(400).json({ message: 'Reviewed user is not the tenant of this lease' });
      }

      // Check if user has already rated for this lease in this role
      const hasRated = await Rating.hasRated(reviewer_id, reviewed_id, lease_id, role);
      if (hasRated) {
        return res.status(400).json({ message: 'You have already rated this user for this lease' });
      }

      // Create rating
      const ratingData = {
        reviewer_id,
        reviewed_id,
        lease_id,
        rating,
        comment,
        role
      };

      const newRating = await Rating.create(ratingData);

      // Create notification for the reviewed user
      await Notification.create({
        user_id: reviewed_id,
        type: 'new_rating',
        message: `You have received a new ${rating}-star rating as a ${role}`
      });

      res.json(newRating);
    } catch (err) {
      console.error('Error creating rating:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// @route   GET api/ratings/user/:userId
// @desc    Get all ratings for a user
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const ratings = await Rating.findByUserId(userId);
    res.json(ratings);
  } catch (err) {
    console.error('Error getting user ratings:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET api/ratings/lease/:leaseId
// @desc    Get all ratings for a lease
// @access  Private
router.get('/lease/:leaseId', auth, async (req, res) => {
  try {
    const leaseId = parseInt(req.params.leaseId);
    if (isNaN(leaseId)) {
      return res.status(400).json({ message: 'Invalid lease ID' });
    }

    // Verify the lease exists and the user is part of it
    const lease = await Lease.findById(leaseId);
    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }

    // Make sure user is part of the lease
    if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view ratings for this lease' });
    }

    const ratings = await Rating.findByLeaseId(leaseId);
    res.json(ratings);
  } catch (err) {
    console.error('Error getting lease ratings:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET api/ratings/:id
// @desc    Get a specific rating
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ratingId = parseInt(req.params.id);
    if (isNaN(ratingId)) {
      return res.status(400).json({ message: 'Invalid rating ID' });
    }

    const rating = await Rating.findById(ratingId);
    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json(rating);
  } catch (err) {
    console.error('Error getting rating:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   PUT api/ratings/:id
// @desc    Update a rating
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('rating', 'Rating must be between 1 and 5').optional().isInt({ min: 1, max: 5 }),
      check('comment', 'Comment is required').optional().not().isEmpty()
    ]
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const ratingId = parseInt(req.params.id);
      if (isNaN(ratingId)) {
        return res.status(400).json({ message: 'Invalid rating ID' });
      }

      const { rating, comment } = req.body;
      const updateData = {};
      
      if (rating !== undefined) updateData.rating = rating;
      if (comment !== undefined) updateData.comment = comment;

      // Update the rating
      const updatedRating = await Rating.update(ratingId, updateData, req.user.id);
      
      if (!updatedRating) {
        return res.status(404).json({ message: 'Rating not found or not authorized to update' });
      }

      res.json(updatedRating);
    } catch (err) {
      console.error('Error updating rating:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// @route   DELETE api/ratings/:id
// @desc    Delete a rating
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const ratingId = parseInt(req.params.id);
    if (isNaN(ratingId)) {
      return res.status(400).json({ message: 'Invalid rating ID' });
    }

    const deleted = await Rating.delete(ratingId, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Rating not found or not authorized to delete' });
    }

    res.json({ message: 'Rating deleted successfully' });
  } catch (err) {
    console.error('Error deleting rating:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 