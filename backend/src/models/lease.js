const pool = require('../config/db');

class Lease {
  static async create({ 
    landlord_id, 
    tenant_id, 
    property_address, 
    monthly_rent, 
    start_date, 
    end_date 
  }) {
    const premium = monthly_rent * 0.085; // 8.5% premium
    const query = `
      INSERT INTO leases (
        landlord_id, tenant_id, property_address, 
        monthly_rent, premium, start_date, end_date, 
        status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', NOW())
      RETURNING *
    `;
    const values = [
      landlord_id, tenant_id, property_address,
      monthly_rent, premium, start_date, end_date
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT l.*, 
             u1.name as landlord_name, 
             u2.name as tenant_name
      FROM leases l
      JOIN users u1 ON l.landlord_id = u1.id
      JOIN users u2 ON l.tenant_id = u2.id
      WHERE l.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT l.*, 
             u1.name as landlord_name, 
             u2.name as tenant_name
      FROM leases l
      JOIN users u1 ON l.landlord_id = u1.id
      JOIN users u2 ON l.tenant_id = u2.id
      WHERE l.landlord_id = $1 OR l.tenant_id = $1
      ORDER BY l.created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE leases 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [status, id]);
    return rows[0];
  }
}

module.exports = Lease; 