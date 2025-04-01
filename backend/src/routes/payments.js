const express = require('express');
const { check, validationResult } = require('express-validator');
const Payment = require('../models/payment');
const Lease = require('../models/lease');
const Notification = require('../models/notification');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET api/payments
// @desc    Get all payments for current user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const payments = await Payment.findByUserId(req.user.id);
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/payments/lease/:leaseId
// @desc    Get all payments for a specific lease
// @access  Private
router.get('/lease/:leaseId', auth, async (req, res) => {
  try {
    // Check if user is authorized to view this lease's payments
    const lease = await Lease.findById(req.params.leaseId);
    
    if (!lease) {
      return res.status(404).json({ message: 'Lease not found' });
    }

    if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const payments = await Payment.findByLeaseId(req.params.leaseId);
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/payments
// @desc    Create a new payment
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('lease_id', 'Lease ID is required').not().isEmpty(),
      check('amount', 'Amount is required').isNumeric(),
      check('due_date', 'Due date is required').isISO8601()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { lease_id, amount, due_date } = req.body;

    try {
      // Check if user is authorized to create payments for this lease
      const lease = await Lease.findById(lease_id);
      
      if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
      }

      // Only allow landlord to create payments
      if (lease.landlord_id !== req.user.id) {
        return res.status(401).json({ message: 'Only landlords can create payments' });
      }

      const payment = await Payment.create({
        lease_id,
        amount,
        due_date
      });

      // Create notification for tenant
      await Notification.create({
        user_id: lease.tenant_id,
        type: 'payment_due',
        message: `A new payment of ${amount} is due for ${lease.property_address}`
      });

      res.json(payment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   PUT api/payments/:id/status
// @desc    Update payment status
// @access  Private
router.put(
  '/:id/status',
  [
    auth,
    [
      check('status', 'Status is required').isIn(['pending', 'paid', 'late', 'cancelled'])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;

    try {
      // First, get the payment to check lease info
      const payment = await Payment.findByLeaseId(req.params.id);
      if (!payment || !payment.length) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      
      // Check if user is authorized to modify this payment
      const lease = await Lease.findById(payment[0].lease_id);
      
      if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
      }

      // Only allow landlord or tenant to update status
      if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // If status is changing to paid, create notifications
      if (status === 'paid') {
        // Create notification for landlord
        await Notification.create({
          user_id: lease.landlord_id,
          type: 'payment_received',
          message: `Payment for ${lease.property_address} has been marked as paid`
        });
        
        // Create notification for tenant
        await Notification.create({
          user_id: lease.tenant_id,
          type: 'payment_confirmed',
          message: `Your payment for ${lease.property_address} has been confirmed`
        });
      }

      const updatedPayment = await Payment.updateStatus(req.params.id, status);
      res.json(updatedPayment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router; 