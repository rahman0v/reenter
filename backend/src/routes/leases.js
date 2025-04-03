const express = require('express');
const { check, validationResult } = require('express-validator');
const Lease = require('../models/lease');
const Payment = require('../models/payment');
const Notification = require('../models/notification');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST api/leases
// @desc    Create a new lease as a landlord
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('property_name', 'Property name is required').not().isEmpty(),
      check('property_address', 'Property address is required').not().isEmpty(),
      check('monthly_rent', 'Monthly rent is required').isNumeric(),
      check('currency', 'Currency must be USD, EUR, or TRY').isIn(['USD', 'EUR', 'TRY']),
      check('start_date', 'Start date is required').isISO8601(),
      check('end_date', 'End date is required').isISO8601()
    ]
  ],
  async (req, res) => {
    console.log('Received lease creation request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { property_name, property_address, monthly_rent, currency, start_date, end_date } = req.body;

    try {
      // Create lease with current user as landlord
      const lease = await Lease.create({
        landlord_id: req.user.id,
        property_name,
        property_address,
        monthly_rent,
        currency,
        start_date,
        end_date
      });

      res.json(lease);
    } catch (err) {
      console.error('Error creating lease:', err);
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMessages = err.response.data.errors.map((e) => e.msg).join(', ');
        res.status(400).json({ errors: [{ msg: errorMessages }] });
      } else if (err.message) {
        res.status(400).json({ errors: [{ msg: err.message }] });
      } else {
        res.status(500).send('Server error');
      }
    }
  }
);

// @route   POST api/leases/join
// @desc    Join an existing lease as a tenant using reference code
// @access  Private
router.post(
  '/join',
  [
    auth,
    [
      check('ref_code', 'Reference code is required').not().isEmpty(),
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { ref_code } = req.body;

    try {
      // Find the lease by reference code
      const lease = await Lease.findByRefCode(ref_code);
      
      if (!lease) {
        return res.status(404).json({ msg: 'Lease not found or already taken' });
      }

      if (lease.landlord_id === req.user.id) {
        return res.status(400).json({ msg: 'Cannot join your own lease' });
      }

      // Join the lease
      const updatedLease = await Lease.joinLease(lease.id, req.user.id);

      // Create notifications
      await Notification.create({
        user_id: lease.landlord_id,
        type: 'lease_joined',
        message: `A tenant has joined your lease for ${lease.property_address}`
      });

      res.json(updatedLease);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/leases
// @desc    Get all leases for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const leases = await Lease.findByUserId(req.user.id);
    res.json(leases);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/leases/:id
// @desc    Get lease by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id);
    
    if (!lease) {
      return res.status(404).json({ msg: 'Lease not found' });
    }

    // Check if user has access to this lease
    if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    res.json(lease);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/leases/:id/status
// @desc    Update lease status
// @access  Private
router.put(
  '/:id/status',
  [
    auth,
    [
      check('status', 'Status is required').isIn(['pending', 'active', 'completed', 'cancelled'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    try {
      let lease = await Lease.findById(req.params.id);
      
      if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
      }

      // Only allow landlord or tenant to update status
      if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // If status is changing to active, generate initial payment
      if (status === 'active' && lease.status !== 'active') {
        // Get current date
        const currentDate = new Date();
        
        // Generate payment for first month
        await Payment.create({
          lease_id: lease.id,
          amount: parseFloat(lease.monthly_rent) + parseFloat(lease.premium),
          due_date: currentDate,
          status: 'pending'
        });

        // Create notifications for both parties
        await Notification.create({
          user_id: lease.landlord_id,
          type: 'lease_activated',
          message: `Lease for ${lease.property_address} has been activated`
        });
        
        await Notification.create({
          user_id: lease.tenant_id,
          type: 'lease_activated',
          message: `Lease for ${lease.property_address} has been activated`
        });
      }

      // Update lease status
      lease = await Lease.updateStatus(req.params.id, status);

      res.json(lease);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router; 