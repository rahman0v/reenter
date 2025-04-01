const express = require('express');
const Admin = require('../models/admin');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin middleware - For simplicity, we're using a hardcoded admin ID
// In a real app, you'd have a role system
const isAdmin = async (req, res, next) => {
  // For demo purposes, consider user with ID 1 as admin
  // In a production app, you'd check a role field
  if (req.user.id !== 1) {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', [auth, isAdmin], async (req, res) => {
  try {
    const users = await Admin.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/leases
// @desc    Get all leases
// @access  Admin
router.get('/leases', [auth, isAdmin], async (req, res) => {
  try {
    const leases = await Admin.getAllLeases();
    res.json(leases);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/payments
// @desc    Get all payments
// @access  Admin
router.get('/payments', [auth, isAdmin], async (req, res) => {
  try {
    const payments = await Admin.getAllPayments();
    res.json(payments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/stats
// @desc    Get platform statistics
// @access  Admin
router.get('/stats', [auth, isAdmin], async (req, res) => {
  try {
    const stats = await Admin.getStats();
    res.json(stats);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router; 