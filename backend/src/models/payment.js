const pool = require('../config/db');

class Payment {
  static async create({ lease_id, amount, due_date, status = 'pending' }) {
    const query = `
      INSERT INTO payments (lease_id, amount, due_date, status, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const values = [lease_id, amount, due_date, status];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByLeaseId(lease_id) {
    const query = `
      SELECT p.*, l.property_address
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      WHERE p.lease_id = $1
      ORDER BY p.due_date DESC
    `;
    const { rows } = await pool.query(query, [lease_id]);
    return rows;
  }

  static async findByUserId(userId) {
    const query = `
      SELECT p.*, l.property_address,
             u1.name as landlord_name,
             u2.name as tenant_name
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      JOIN users u1 ON l.landlord_id = u1.id
      JOIN users u2 ON l.tenant_id = u2.id
      WHERE l.landlord_id = $1 OR l.tenant_id = $1
      ORDER BY p.due_date DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE payments 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, id]);
    return rows[0];
  }
}

module.exports = Payment; 