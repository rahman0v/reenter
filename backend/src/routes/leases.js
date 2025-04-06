const express = require('express');
const { check, validationResult } = require('express-validator');
const Lease = require('../models/lease');
const Payment = require('../models/payment');
const Notification = require('../models/notification');
const auth = require('../middleware/auth');
const pool = require('../config/db');

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

    const { 
      property_name, 
      property_address, 
      monthly_rent, 
      currency, 
      start_date, 
      end_date, 
      template_data 
    } = req.body;

    try {
      // Create lease with current user as landlord
      const lease = await Lease.create({
        landlord_id: req.user.id,
        property_name,
        property_address,
        monthly_rent,
        currency,
        start_date,
        end_date,
        template_data
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

// @route   PUT api/leases/:id
// @desc    Update an existing lease
// @access  Private
router.put(
  '/:id',
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
    console.log('Received lease update request:', req.body);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      property_name, 
      property_address, 
      monthly_rent, 
      currency, 
      start_date, 
      end_date, 
      template_data 
    } = req.body;

    try {
      // First verify lease exists and user has permissions
      let lease = await Lease.findById(req.params.id);
      
      if (!lease) {
        return res.status(404).json({ msg: 'Lease not found' });
      }

      // Only the landlord can update a lease
      if (lease.landlord_id !== req.user.id) {
        return res.status(403).json({ msg: 'Only the landlord can update this lease' });
      }

      // Only allow updates for leases in draft status
      if (lease.status !== 'draft') {
        return res.status(400).json({ msg: 'Only leases in draft status can be updated' });
      }

      // Update the lease
      const updatedLease = await Lease.update(req.params.id, {
        property_name,
        property_address,
        monthly_rent,
        currency,
        start_date,
        end_date,
        template_data
      });

      res.json(updatedLease);
    } catch (err) {
      console.error('Error updating lease:', err);
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

// @route   PUT api/leases/:id/status
// @desc    Update lease status
// @access  Private
router.put(
  '/:id/status',
  [
    auth,
    [
      check('status', 'Status is required').isIn([
        'draft', 'pending', 'awaiting_landlord_signature', 
        'awaiting_tenant_signature', 'changes_requested',
        'active', 'completed', 'terminated', 'cancelled'
      ])
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    console.log(`Handling status update request: Lease ID ${req.params.id}, Status: ${status}, User ID: ${req.user.id}`);

    try {
      let lease = await Lease.findById(req.params.id);
      
      if (!lease) {
        return res.status(404).json({ message: 'Lease not found' });
      }

      // Only allow landlord or tenant to update status
      if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      // Special handling for landlord confirmation (direct to active)
      const isLandlordConfirmation = req.user.id === lease.landlord_id && 
                                    lease.status === 'awaiting_landlord_signature' &&
                                    status === 'active';
      
      // If status is changing to active, generate initial payment
      if ((status === 'active' && lease.status !== 'active') || isLandlordConfirmation) {
        console.log(`Activating lease ${req.params.id}, generating payment and notifications`);
        
        try {
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
        } catch (innerErr) {
          console.error('Error during lease activation process:', innerErr);
          // Continue with status update even if payment/notification creation fails
        }
      }

      // Update lease status
      try {
        lease = await Lease.updateStatus(req.params.id, status, req.user.id);
        console.log(`Successfully updated lease ${req.params.id} status to ${status}`);
        res.json(lease);
      } catch (updateErr) {
        console.error('Error updating lease status:', updateErr);
        return res.status(500).json({ message: `Failed to update status: ${updateErr.message}` });
      }
    } catch (err) {
      console.error('Error in lease status update route:', err);
      if (err.message.includes('pool.query is not a function')) {
        return res.status(500).json({ 
          message: 'Database connection error. The system is temporarily unavailable.',
          details: 'Database pool initialization issue' 
        });
      }
      res.status(500).json({ message: 'Server error', details: err.message });
    }
  }
);

// @route   GET api/leases/:id/events
// @desc    Get all events for a lease
// @access  Private
router.get('/:id/events', auth, async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id);
    
    if (!lease) {
      return res.status(404).json({ msg: 'Lease not found' });
    }

    // Check if user has access to this lease
    if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const events = await Lease.getLeaseEvents(req.params.id);
    res.json(events);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/leases/:id/sign
// @desc    Sign a lease agreement
// @access  Private
router.post(
  '/:id/sign',
  [
    auth,
    [
      check('signature_data', 'Signature data is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { signature_data } = req.body;
    const leaseId = req.params.id;

    try {
      // Get the lease
      const lease = await Lease.findById(leaseId);
      
      if (!lease) {
        return res.status(404).json({ msg: 'Lease not found' });
      }

      // Check if user has access to this lease
      if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
        return res.status(403).json({ msg: 'Access denied' });
      }

      // Check if user already signed
      const alreadySigned = await Lease.checkSignature(leaseId, req.user.id);
      if (alreadySigned) {
        return res.status(400).json({ msg: 'You have already signed this lease' });
      }

      // Get IP address and user agent
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Sign the lease
      await Lease.signLease(leaseId, req.user.id, signature_data, ipAddress, userAgent);

      // Get updated lease
      const updatedLease = await Lease.findById(leaseId);

      // Create notification for the other party
      const notifyUserId = req.user.id === lease.landlord_id ? lease.tenant_id : lease.landlord_id;
      const signerRole = req.user.id === lease.landlord_id ? 'Landlord' : 'Tenant';
      
      await Notification.create({
        user_id: notifyUserId,
        type: 'lease_signed',
        message: `${signerRole} has signed the lease for ${lease.property_address}`
      });

      res.json(updatedLease);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/leases/:id/request-changes
// @desc    Request changes to a lease
// @access  Private
router.post(
  '/:id/request-changes',
  [
    auth,
    [
      check('changes', 'Changes are required').not().isEmpty(),
      check('message', 'Message is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { changes, message } = req.body;
    const leaseId = req.params.id;

    try {
      // Get the lease
      const lease = await Lease.findById(leaseId);
      
      if (!lease) {
        return res.status(404).json({ msg: 'Lease not found' });
      }

      // Check if user has access to this lease
      if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
        return res.status(403).json({ msg: 'Access denied' });
      }

      // Request changes
      const changeRequest = await Lease.requestChanges(leaseId, req.user.id, changes, message);

      // Create notification for the other party
      const notifyUserId = req.user.id === lease.landlord_id ? lease.tenant_id : lease.landlord_id;
      const requesterRole = req.user.id === lease.landlord_id ? 'Landlord' : 'Tenant';
      
      await Notification.create({
        user_id: notifyUserId,
        type: 'lease_changes_requested',
        message: `${requesterRole} has requested changes to the lease for ${lease.property_address}`
      });

      res.json(changeRequest);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/leases/:id/change-requests
// @desc    Get all change requests for a lease
// @access  Private
router.get('/:id/change-requests', auth, async (req, res) => {
  try {
    const lease = await Lease.findById(req.params.id);
    
    if (!lease) {
      return res.status(404).json({ msg: 'Lease not found' });
    }

    // Check if user has access to this lease
    if (lease.landlord_id !== req.user.id && lease.tenant_id !== req.user.id) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    const changeRequests = await Lease.getChangeRequests(req.params.id);
    res.json(changeRequests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/leases/change-request/:id
// @desc    Respond to a change request
// @access  Private
router.put(
  '/change-request/:id',
  [
    auth,
    [
      check('accepted', 'Accepted flag is required').isBoolean(),
      check('message', 'Response message is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { accepted, message } = req.body;
    const requestId = req.params.id;

    try {
      // Find the change request
      const getQuery = `
        SELECT cr.*, l.landlord_id, l.tenant_id, l.property_address
        FROM lease_change_requests cr
        JOIN leases l ON cr.lease_id = l.id
        WHERE cr.id = $1
      `;
      const { rows } = await pool.query(getQuery, [requestId]);
      
      if (rows.length === 0) {
        return res.status(404).json({ msg: 'Change request not found' });
      }
      
      const changeRequest = rows[0];
      
      // Check if user has access to this lease
      if (changeRequest.landlord_id !== req.user.id && changeRequest.tenant_id !== req.user.id) {
        return res.status(403).json({ msg: 'Access denied' });
      }
      
      // Check that responder is not the same as requester
      if (changeRequest.requested_by === req.user.id) {
        return res.status(400).json({ msg: 'Cannot respond to your own change request' });
      }

      // Respond to change request
      const updatedRequest = await Lease.respondToChangeRequest(requestId, req.user.id, accepted, message);

      // Create notification for the requester
      const responderRole = req.user.id === changeRequest.landlord_id ? 'Landlord' : 'Tenant';
      const status = accepted ? 'accepted' : 'rejected';
      
      await Notification.create({
        user_id: changeRequest.requested_by,
        type: `lease_changes_${status}`,
        message: `${responderRole} has ${status} your requested changes to the lease for ${changeRequest.property_address}`
      });

      res.json(updatedRequest);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/leases/ref/:refCode
// @desc    Delete a lease by reference code (admin or debug function)
// @access  Private
router.delete('/ref/:refCode', auth, async (req, res) => {
  try {
    const { refCode } = req.params;
    
    // Find the lease by reference code
    const findQuery = `
      SELECT * FROM leases WHERE ref_code = $1
    `;
    const findResult = await pool.query(findQuery, [refCode]);
    
    if (findResult.rows.length === 0) {
      return res.status(404).json({ msg: 'Lease not found' });
    }
    
    const lease = findResult.rows[0];
    
    // Make sure user is authorized (either the landlord or an admin)
    if (lease.landlord_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to delete this lease' });
    }
    
    // Delete the lease
    const deleteQuery = `
      DELETE FROM leases WHERE ref_code = $1 RETURNING *
    `;
    const deleteResult = await pool.query(deleteQuery, [refCode]);
    
    if (deleteResult.rows.length > 0) {
      res.json({ msg: 'Lease deleted successfully', lease: deleteResult.rows[0] });
    } else {
      res.status(500).json({ msg: 'Failed to delete lease' });
    }
    
  } catch (err) {
    console.error('Error deleting lease:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   POST api/leases/:id/tenant-info
// @desc    Update tenant information for a lease
// @access  Private
router.post(
  '/:id/tenant-info',
  [
    auth,
    [
      check('fullName', 'Full name is required').not().isEmpty(),
      check('tcId', 'TC ID is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('phone', 'Phone number is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, tcId, email, phone } = req.body;
    const leaseId = req.params.id;

    try {
      // Get the lease
      const lease = await Lease.findById(leaseId);
      
      if (!lease) {
        return res.status(404).json({ msg: 'Lease not found' });
      }

      // Only tenant can update tenant information
      if (lease.tenant_id !== req.user.id) {
        return res.status(403).json({ msg: 'Only the tenant can update tenant information' });
      }

      // Update tenant info in the user record first
      const updateUserQuery = `
        UPDATE users
        SET name = $1, tc_id = $2, email = $3, phone = $4
        WHERE id = $5
        RETURNING *
      `;
      await pool.query(updateUserQuery, [fullName, tcId, email, phone, req.user.id]);

      // Create a lease event for the tenant info update
      await Lease.createEvent(leaseId, req.user.id, 'tenant_info_updated', {
        fullName,
        tcId,
        email,
        phone
      });

      // Return the updated lease with tenant name
      const updatedLease = await Lease.findById(leaseId);
      res.json(updatedLease);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router; 