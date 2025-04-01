const express = require('express');
const { check, validationResult } = require('express-validator');
const Lease = require('../models/lease');
const Payment = require('../models/payment');
const Notification = require('../models/notification');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST api/leases
// @desc    Create a new lease
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('tenant_id', 'Tenant ID is required').not().isEmpty(),
      check('property_address', 'Property address is required').not().isEmpty(),
      check('monthly_rent', 'Monthly rent is required').isNumeric(),
      check('start_date', 'Start date is required').isISO8601(),
      check('end_date', 'End date is required').isISO8601()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tenant_id, property_address, monthly_rent, start_date, end_date } = req.body;

    try {
      // Create lease with current user as landlord
      const lease = await Lease.create({
        landlord_id: req.user.id,
        tenant_id,
        property_address,
        monthly_rent,
        start_date,
        end_date
      });

      // Create notification for tenant
      await Notification.create({
        user_id: tenant_id,
        type: 'lease_created',
        message: `A new lease has been created for ${property_address}`
      });

      res.json(lease);
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
      return res.status(404).json({ message: 'Lease not found' });
    }

    // Check if user is authorized to view this lease
    if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
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