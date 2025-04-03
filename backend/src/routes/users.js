const express = require('express');
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const auth = require('../middleware/auth');

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
    res.json(user);
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
      const updatedUser = await User.updateProfile(req.user.id, {
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
      });
      res.json(updatedUser);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router; 