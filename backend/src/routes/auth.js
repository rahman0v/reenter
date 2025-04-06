const express = require('express');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    check('phone', 'Phone number is required').notEmpty()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { name, email, password, phone, ...otherFields } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'User already exists with this email' 
        });
      }

      // Create new user
      const user = await User.create({
        name,
        email,
        password,
        phone,
        ...otherFields
      });

      // Generate JWT token
      const payload = {
        user: {
          id: user.id
        }
      };

      // Secret key from environment variable with fallback
      const secret = process.env.JWT_SECRET || 'reenterSecretKey2025';

      // Generate token with Promise approach
      const token = jwt.sign(
        payload,
        secret,
        { expiresIn: '7d' }
      );
      
      // Remove password from user object before sending response
      delete user.password;
      
      // Return success with token and user data
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user
      });
      
    } catch (err) {
      console.error('Registration error:', err);
      res.status(500).json({ 
        success: false,
        message: 'Server error during registration' 
      });
    }
  }
);

/**
 * @route   POST api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      // Verify password
      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ 
          success: false,
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const payload = {
        user: {
          id: user.id
        }
      };

      // Secret key from environment variable with fallback
      const secret = process.env.JWT_SECRET || 'reenterSecretKey2025';

      // Generate token with Promise approach
      const token = jwt.sign(
        payload,
        secret,
        { expiresIn: '7d' }
      );
      
      // Remove password from user object before sending response
      delete user.password;
      
      // Return success with token and user data
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user
      });
      
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ 
        success: false,
        message: 'Server error during login' 
      });
    }
  }
);

/**
 * @route   GET api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
  try {
    // Get user by ID (from auth middleware)
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    // Remove password from response
    delete user.password;
    
    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Error getting user profile:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
});

module.exports = router;