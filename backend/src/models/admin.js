const pool = require('../config/db');

class Admin {
  static async getAllUsers() {
    const query = `
      SELECT id, email, name, phone, bio, photo_url, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getAllLeases() {
    const query = `
      SELECT l.*, 
             u1.name as landlord_name, 
             u2.name as tenant_name
      FROM leases l
      JOIN users u1 ON l.landlord_id = u1.id
      JOIN users u2 ON l.tenant_id = u2.id
      ORDER BY l.created_at DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getAllPayments() {
    const query = `
      SELECT p.*, l.property_address,
             u1.name as landlord_name,
             u2.name as tenant_name
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      JOIN users u1 ON l.landlord_id = u1.id
      JOIN users u2 ON l.tenant_id = u2.id
      ORDER BY p.due_date DESC
    `;
    const { rows } = await pool.query(query);
    return rows;
  }

  static async getStats() {
    const userQuery = 'SELECT COUNT(*) as total_users FROM users';
    const leaseQuery = 'SELECT COUNT(*) as total_leases FROM leases';
    const activeLeaseQuery = 'SELECT COUNT(*) as active_leases FROM leases WHERE status = \'active\'';
    const paymentQuery = 'SELECT SUM(amount) as total_payments FROM payments WHERE status = \'paid\'';
    
    const { rows: userRows } = await pool.query(userQuery);
    const { rows: leaseRows } = await pool.query(leaseQuery);
    const { rows: activeLeaseRows } = await pool.query(activeLeaseQuery);
    const { rows: paymentRows } = await pool.query(paymentQuery);
    
    return {
      total_users: parseInt(userRows[0].total_users),
      total_leases: parseInt(leaseRows[0].total_leases),
      active_leases: parseInt(activeLeaseRows[0].active_leases),
      total_payments: parseFloat(paymentRows[0].total_payments || 0)
    };
  }
}

module.exports = Admin; 