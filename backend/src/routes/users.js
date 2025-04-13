const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const PaymentMethod = require('../models/payment_method');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const router = express.Router();

// @route   GET api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch ratings data
    const ratingsQuery = `
      SELECT 
        AVG(CASE WHEN role = 'landlord' THEN rating ELSE NULL END) as landlord_avg,
        COUNT(CASE WHEN role = 'landlord' THEN 1 ELSE NULL END) as landlord_count,
        AVG(CASE WHEN role = 'tenant' THEN rating ELSE NULL END) as tenant_avg,
        COUNT(CASE WHEN role = 'tenant' THEN 1 ELSE NULL END) as tenant_count
      FROM ratings
      WHERE reviewed_id = $1
    `;
    
    // Fetch verification status for all verification types
    const verificationsQuery = `
      SELECT type, status
      FROM verifications
      WHERE user_id = $1 AND status = 'verified'
    `;
    
    // Execute both queries in parallel
    const [ratingsResult, verificationsResult] = await Promise.all([
      User.safeQuery(ratingsQuery, [req.user.id]),
      User.safeQuery(verificationsQuery, [req.user.id])
    ]);
    
    const ratingsData = ratingsResult.rows[0];
    const verificationsData = verificationsResult.rows;
    
    // Map verifications to a more usable format
    const verifications = {
      email: verificationsData.some(v => v.type === 'email' && v.status === 'verified'),
      phone: verificationsData.some(v => v.type === 'phone' && v.status === 'verified'),
      id: verificationsData.some(v => v.type === 'id' && v.status === 'verified'),
      bank: verificationsData.some(v => v.type === 'bank' && v.status === 'verified')
    };
    
    // Calculate trust score based on verifications and profile completeness
    let trustScore = 0;
    if (verifications.email) trustScore += 25;
    if (verifications.phone) trustScore += 25;
    if (verifications.id) trustScore += 25;
    if (verifications.bank) trustScore += 25;
    
    // Add ratings to user profile
    const userWithRatings = {
      ...user,
      ratings: {
        as_landlord: {
          average: parseFloat(ratingsData.landlord_avg) || 0,
          count: parseInt(ratingsData.landlord_count) || 0
        },
        as_tenant: {
          average: parseFloat(ratingsData.tenant_avg) || 0,
          count: parseInt(ratingsData.tenant_count) || 0
        },
        total_reviews: (parseInt(ratingsData.landlord_count) || 0) + (parseInt(ratingsData.tenant_count) || 0)
      },
      verifications: verifications,
      trust_score: trustScore
    };
    
    res.json(userWithRatings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile',
  [
    auth,
    [
      check('name', 'Name is required').optional(),
      check('phone', 'Phone is required').optional(),
      check('bio', 'Bio is optional').optional(),
      check('photo_url', 'Photo URL is optional').optional(),
      check('preferred_name', 'Preferred name is optional').optional(),
      check('address', 'Address is optional').optional(),
      check('emergency_contact', 'Emergency contact is optional').optional(),
      check('education_status', 'Education status is optional').optional(),
      check('employment_status', 'Employment status is optional').optional(),
      check('date_of_birth', 'Date of birth is optional').optional()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      name, phone, bio, photo_url, preferred_name, address, 
      emergency_contact, education_status, employment_status, date_of_birth 
    } = req.body;

    try {
      console.log(`Processing profile update for user ID ${req.user.id}`);
      
      // Filter out undefined values
      const updateData = {
        name,
        phone,
        bio,
        photo_url,
        preferred_name,
        address,
        emergency_contact,
        education_status,
        employment_status,
        date_of_birth
      };
      
      // Remove undefined properties
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      const updatedUser = await User.update(req.user.id, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Return the updated user data
      res.json(updatedUser);
    } catch (err) {
      console.error('Error updating user profile:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// @route   POST api/users/change-password
// @desc    Change user password
// @access  Private
router.post(
  '/change-password',
  [
    auth,
    [
      check('currentPassword', 'Current password is required').exists(),
      check('newPassword', 'New password must be at least 6 characters').isLength({ min: 6 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      // Get user with password
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isMatch = await User.comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Create SQL query to update password
      const query = `
        UPDATE users 
        SET password = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id
      `;
      
      // Execute query safely using the safe query function
      const { rows } = await User.safeQuery(query, [hashedPassword, req.user.id]);
      
      if (rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      console.error('Error changing password:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// @route   GET api/users/payment-methods
// @desc    Get all payment methods for the current user
// @access  Private
router.get('/payment-methods', auth, async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.findByUserId(req.user.id);
    
    // Format the payment methods to match the frontend expected format
    const formattedMethods = paymentMethods.map(method => ({
      id: method.id,
      type: method.type,
      name: method.name,
      last4: method.last4,
      expiry: method.expiry_month && method.expiry_year ? 
        `${method.expiry_month.toString().padStart(2, '0')}/${method.expiry_year.toString().substring(2)}` : 
        undefined,
      isDefault: method.is_default
    }));
    
    res.json(formattedMethods);
  } catch (err) {
    console.error('Error fetching payment methods:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   POST api/users/payment-methods
// @desc    Add a new payment method
// @access  Private
router.post(
  '/payment-methods',
  [
    auth,
    [
      check('type', 'Type is required').isIn(['card', 'bank']),
      check('name', 'Name is required').notEmpty(),
      check('last4', 'Last 4 digits are required').isLength({ min: 4, max: 4 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      type, 
      name, 
      last4, 
      expiryMonth, 
      expiryYear, 
      isDefault = false 
    } = req.body;

    try {
      const paymentMethod = await PaymentMethod.create({
        user_id: req.user.id,
        type,
        name,
        last4,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        is_default: isDefault
      });
      
      // Format response to match frontend expected format
      const formattedMethod = {
        id: paymentMethod.id,
        type: paymentMethod.type,
        name: paymentMethod.name,
        last4: paymentMethod.last4,
        expiry: paymentMethod.expiry_month && paymentMethod.expiry_year ? 
          `${paymentMethod.expiry_month.toString().padStart(2, '0')}/${paymentMethod.expiry_year.toString().substring(2)}` : 
          undefined,
        isDefault: paymentMethod.is_default
      };
      
      res.status(201).json(formattedMethod);
    } catch (err) {
      console.error('Error adding payment method:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// @route   PUT api/users/payment-methods/:id
// @desc    Update a payment method
// @access  Private
router.put(
  '/payment-methods/:id',
  [
    auth,
    [
      check('name', 'Name is required').optional().notEmpty(),
      check('expiryMonth', 'Expiry month must be valid').optional().isInt({ min: 1, max: 12 }),
      check('expiryYear', 'Expiry year must be valid').optional().isInt({ min: 2000 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, expiryMonth, expiryYear, isDefault } = req.body;

    try {
      // Check if payment method exists and belongs to user
      const existingMethod = await PaymentMethod.findById(req.params.id, req.user.id);
      if (!existingMethod) {
        return res.status(404).json({ message: 'Payment method not found' });
      }
      
      const updateData = {
        name,
        expiry_month: expiryMonth,
        expiry_year: expiryYear,
        is_default: isDefault
      };
      
      // Remove undefined properties
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      const updatedMethod = await PaymentMethod.update(
        req.params.id, 
        req.user.id, 
        updateData
      );
      
      if (!updatedMethod) {
        return res.status(404).json({ message: 'Payment method not found' });
      }
      
      // Format response to match frontend expected format
      const formattedMethod = {
        id: updatedMethod.id,
        type: updatedMethod.type,
        name: updatedMethod.name,
        last4: updatedMethod.last4,
        expiry: updatedMethod.expiry_month && updatedMethod.expiry_year ? 
          `${updatedMethod.expiry_month.toString().padStart(2, '0')}/${updatedMethod.expiry_year.toString().substring(2)}` : 
          undefined,
        isDefault: updatedMethod.is_default
      };
      
      res.json(formattedMethod);
    } catch (err) {
      console.error('Error updating payment method:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  }
);

// @route   PATCH api/users/payment-methods/:id/default
// @desc    Set a payment method as default
// @access  Private
router.patch('/payment-methods/:id/default', auth, async (req, res) => {
  try {
    // Check if payment method exists and belongs to user
    const existingMethod = await PaymentMethod.findById(req.params.id, req.user.id);
    if (!existingMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    const updatedMethod = await PaymentMethod.setDefault(req.params.id, req.user.id);
    
    if (!updatedMethod) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    // Format response to match frontend expected format
    const formattedMethod = {
      id: updatedMethod.id,
      type: updatedMethod.type,
      name: updatedMethod.name,
      last4: updatedMethod.last4,
      expiry: updatedMethod.expiry_month && updatedMethod.expiry_year ? 
        `${updatedMethod.expiry_month.toString().padStart(2, '0')}/${updatedMethod.expiry_year.toString().substring(2)}` : 
        undefined,
      isDefault: updatedMethod.is_default
    };
    
    res.json(formattedMethod);
  } catch (err) {
    console.error('Error setting default payment method:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   DELETE api/users/payment-methods/:id
// @desc    Delete a payment method
// @access  Private
router.delete('/payment-methods/:id', auth, async (req, res) => {
  try {
    const deleted = await PaymentMethod.delete(req.params.id, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    res.json({ message: 'Payment method deleted successfully' });
  } catch (err) {
    console.error('Error deleting payment method:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// @route   GET api/users/:id/public
// @desc    Get public profile of a user
// @access  Private
router.get('/:id/public', auth, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Fetch the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch ratings data
    const query = `
      SELECT 
        AVG(CASE WHEN role = 'landlord' THEN rating ELSE NULL END) as landlord_avg,
        COUNT(CASE WHEN role = 'landlord' THEN 1 ELSE NULL END) as landlord_count,
        AVG(CASE WHEN role = 'tenant' THEN rating ELSE NULL END) as tenant_avg,
        COUNT(CASE WHEN role = 'tenant' THEN 1 ELSE NULL END) as tenant_count
      FROM ratings
      WHERE reviewed_id = $1
    `;
    
    const { rows } = await User.safeQuery(query, [userId]);
    const ratingsData = rows[0];
    
    // Prepare public profile response
    const publicProfile = {
      id: user.id,
      name: user.name,
      preferred_name: user.preferred_name,
      photo_url: user.photo_url,
      bio: user.bio,
      role: user.role,
      created_at: user.created_at,
      ratings: {
        as_landlord: {
          average: parseFloat(ratingsData.landlord_avg) || 0,
          count: parseInt(ratingsData.landlord_count) || 0
        },
        as_tenant: {
          average: parseFloat(ratingsData.tenant_avg) || 0,
          count: parseInt(ratingsData.tenant_count) || 0
        },
        total_reviews: (parseInt(ratingsData.landlord_count) || 0) + (parseInt(ratingsData.tenant_count) || 0)
      }
    };
    
    res.json(publicProfile);
  } catch (err) {
    console.error('Error getting public profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/users/verify/email
// @desc    Verify user's email
// @access  Private
router.post('/verify/email', auth, async (req, res) => {
  try {
    // In a real implementation, you would send an email with verification code
    // For demo purposes, we'll mark it as verified immediately
    
    // Check if verification already exists
    const checkQuery = 'SELECT * FROM verifications WHERE user_id = $1 AND type = $2';
    const { rows: existing } = await User.safeQuery(checkQuery, [req.user.id, 'email']);
    
    let result;
    if (existing.length > 0) {
      // Update existing verification
      const updateQuery = `
        UPDATE verifications 
        SET status = 'verified', verified_at = NOW() 
        WHERE user_id = $1 AND type = $2
        RETURNING *
      `;
      result = await User.safeQuery(updateQuery, [req.user.id, 'email']);
    } else {
      // Create new verification
      const insertQuery = `
        INSERT INTO verifications (user_id, type, status, verified_at)
        VALUES ($1, $2, 'verified', NOW())
        RETURNING *
      `;
      result = await User.safeQuery(insertQuery, [req.user.id, 'email']);
    }
    
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Error verifying email:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/users/verify/phone
// @desc    Verify user's phone number
// @access  Private
router.post('/verify/phone', auth, async (req, res) => {
  try {
    const { code } = req.body;
    
    // In a real implementation, you would verify the code sent to the user's phone
    // For demo purposes, we'll accept any code and mark it as verified immediately
    
    // Check if verification already exists
    const checkQuery = 'SELECT * FROM verifications WHERE user_id = $1 AND type = $2';
    const { rows: existing } = await User.safeQuery(checkQuery, [req.user.id, 'phone']);
    
    let result;
    if (existing.length > 0) {
      // Update existing verification
      const updateQuery = `
        UPDATE verifications 
        SET status = 'verified', verified_at = NOW() 
        WHERE user_id = $1 AND type = $2
        RETURNING *
      `;
      result = await User.safeQuery(updateQuery, [req.user.id, 'phone']);
    } else {
      // Create new verification
      const insertQuery = `
        INSERT INTO verifications (user_id, type, status, verified_at)
        VALUES ($1, $2, 'verified', NOW())
        RETURNING *
      `;
      result = await User.safeQuery(insertQuery, [req.user.id, 'phone']);
    }
    
    res.status(200).json({ message: 'Phone verified successfully' });
  } catch (err) {
    console.error('Error verifying phone:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/users/verify/id
// @desc    Verify user's ID
// @access  Private
router.post('/verify/id', auth, async (req, res) => {
  try {
    // In a real implementation, you would store and verify ID documents
    // For demo purposes, we'll mark it as verified immediately
    
    // Check if verification already exists
    const checkQuery = 'SELECT * FROM verifications WHERE user_id = $1 AND type = $2';
    const { rows: existing } = await User.safeQuery(checkQuery, [req.user.id, 'id']);
    
    let result;
    if (existing.length > 0) {
      // Update existing verification
      const updateQuery = `
        UPDATE verifications 
        SET status = 'verified', verified_at = NOW() 
        WHERE user_id = $1 AND type = $2
        RETURNING *
      `;
      result = await User.safeQuery(updateQuery, [req.user.id, 'id']);
    } else {
      // Create new verification
      const insertQuery = `
        INSERT INTO verifications (user_id, type, status, verified_at)
        VALUES ($1, $2, 'verified', NOW())
        RETURNING *
      `;
      result = await User.safeQuery(insertQuery, [req.user.id, 'id']);
    }
    
    res.status(200).json({ message: 'ID verified successfully' });
  } catch (err) {
    console.error('Error verifying ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/users/verify/bank
// @desc    Verify user's bank account
// @access  Private
router.post('/verify/bank', auth, async (req, res) => {
  try {
    const { accountData } = req.body;
    
    // In a real implementation, you would verify the bank account details
    // For demo purposes, we'll mark it as verified immediately
    
    // Check if verification already exists
    const checkQuery = 'SELECT * FROM verifications WHERE user_id = $1 AND type = $2';
    const { rows: existing } = await User.safeQuery(checkQuery, [req.user.id, 'bank']);
    
    let result;
    if (existing.length > 0) {
      // Update existing verification
      const updateQuery = `
        UPDATE verifications 
        SET status = 'verified', verified_at = NOW() 
        WHERE user_id = $1 AND type = $2
        RETURNING *
      `;
      result = await User.safeQuery(updateQuery, [req.user.id, 'bank']);
    } else {
      // Create new verification
      const insertQuery = `
        INSERT INTO verifications (user_id, type, status, verified_at)
        VALUES ($1, $2, 'verified', NOW())
        RETURNING *
      `;
      result = await User.safeQuery(insertQuery, [req.user.id, 'bank']);
    }
    
    res.status(200).json({ message: 'Bank account verified successfully' });
  } catch (err) {
    console.error('Error verifying bank account:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 