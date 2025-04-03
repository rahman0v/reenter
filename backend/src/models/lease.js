const pool = require('../config/db');
const crypto = require('crypto');

class Lease {
  static generateRefCode() {
    // Generate a 8-character unique reference code
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  static async create({ 
    landlord_id, 
    property_name,
    property_address, 
    monthly_rent,
    currency,
    start_date, 
    end_date 
  }) {
    try {
      console.log('Creating lease with data:', { 
        landlord_id, 
        property_name,
        property_address, 
        monthly_rent,
        currency,
        start_date, 
        end_date 
      });
      
      const premium = monthly_rent * 0.085; // 8.5% premium
      const ref_code = this.generateRefCode();
      
      const query = `
        INSERT INTO leases (
          landlord_id, property_name, property_address, 
          monthly_rent, currency, premium, start_date, end_date, 
          status, ref_code, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, NOW())
        RETURNING *
      `;
      
      const values = [
        landlord_id, property_name, property_address,
        monthly_rent, currency, premium, start_date, end_date, ref_code
      ];
      
      console.log('Executing query:', query);
      console.log('With values:', values);
      
      const { rows } = await pool.query(query, values);
      console.log('Query result:', rows[0]);
      return rows[0];
    } catch (err) {
      console.error('Error in Lease.create:', err);
      console.error('Error details:', {
        code: err.code,
        detail: err.detail,
        constraint: err.constraint,
        table: err.table,
        column: err.column
      });
      throw err;
    }
  }

  static async findByRefCode(refCode) {
    const query = `
      SELECT l.*, 
             u1.name as landlord_name,
             COALESCE(u2.name, 'No tenant assigned') as tenant_name
      FROM leases l
      JOIN users u1 ON l.landlord_id = u1.id
      LEFT JOIN users u2 ON l.tenant_id = u2.id
      WHERE l.ref_code = $1 AND l.status = 'pending'
    `;
    const { rows } = await pool.query(query, [refCode]);
    return rows[0];
  }

  static async joinLease(leaseId, tenantId) {
    const query = `
      UPDATE leases 
      SET tenant_id = $1, 
          status = 'active',
          updated_at = NOW()
      WHERE id = $2 AND status = 'pending'
      RETURNING *
    `;
    const { rows } = await pool.query(query, [tenantId, leaseId]);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT l.*, 
             u1.name as landlord_name, 
             COALESCE(u2.name, 'No tenant assigned') as tenant_name
      FROM leases l
      JOIN users u1 ON l.landlord_id = u1.id
      LEFT JOIN users u2 ON l.tenant_id = u2.id
      WHERE l.id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT l.*, 
             u1.name as landlord_name, 
             COALESCE(u2.name, 'No tenant assigned') as tenant_name
      FROM leases l
      JOIN users u1 ON l.landlord_id = u1.id
      LEFT JOIN users u2 ON l.tenant_id = u2.id
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