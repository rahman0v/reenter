const { pool } = require('../config/db');
const { Pool } = require('pg');

// Create a safety mechanism for ensuring a working database connection
let dbPool = pool;

// Check if the imported pool is valid
if (!dbPool || typeof dbPool.query !== 'function') {
  console.error('WARNING: Main database pool not properly initialized in payment.js');
  
  // Create a fallback pool
  try {
    console.log('Creating fallback database pool for payment operations');
    
    const poolConfig = {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'rahmanov02',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'reenter_db'
    };
    
    dbPool = new Pool(poolConfig);
    
    if (typeof dbPool.query === 'function') {
      console.log('Successfully created fallback database pool in payment.js');
    } else {
      console.error('CRITICAL: Failed to create valid fallback pool in payment.js');
    }
  } catch (err) {
    console.error('Error creating fallback pool in payment.js:', err);
  }
}

// Helper function to safely perform database operations
const safeQuery = async (query, params = []) => {
  if (!dbPool || typeof dbPool.query !== 'function') {
    throw new Error('Database pool not properly initialized');
  }
  
  try {
    return await dbPool.query(query, params);
  } catch (err) {
    console.error(`Error executing query: ${query.slice(0, 100)}...`);
    console.error('Error details:', err);
    throw err;
  }
};

class Payment {
  static async create({ lease_id, amount, due_date, status = 'pending' }) {
    console.log(`Creating payment for lease ${lease_id}, amount: ${amount}, due: ${due_date}, status: ${status}`);
    const query = `
      INSERT INTO payments (lease_id, amount, due_date, status, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const values = [lease_id, amount, due_date, status];
    try {
      const { rows } = await safeQuery(query, values);
      console.log(`Payment created successfully for lease ${lease_id}`);
      return rows[0];
    } catch (err) {
      console.error(`Failed to create payment for lease ${lease_id}:`, err);
      throw err;
    }
  }

  static async findByLeaseId(lease_id) {
    const query = `
      SELECT p.*, l.property_name, l.property_address, l.currency
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      WHERE p.lease_id = $1
      ORDER BY p.due_date DESC
    `;
    const { rows } = await safeQuery(query, [lease_id]);
    return rows;
  }

  static async findByUserId(userId) {
    const query = `
      SELECT p.*, l.property_name, l.property_address, l.currency,
             u1.name as landlord_name,
             u2.name as tenant_name
      FROM payments p
      JOIN leases l ON p.lease_id = l.id
      JOIN users u1 ON l.landlord_id = u1.id
      LEFT JOIN users u2 ON l.tenant_id = u2.id
      WHERE l.landlord_id = $1 OR l.tenant_id = $1
      ORDER BY p.due_date DESC
    `;
    const { rows } = await safeQuery(query, [userId]);
    return rows;
  }

  static async updateStatus(id, status) {
    const query = `
      UPDATE payments 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const { rows } = await safeQuery(query, [status, id]);
    return rows[0];
  }
}

module.exports = Payment;