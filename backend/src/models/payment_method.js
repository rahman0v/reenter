const { pool } = require('../config/db');
const { Pool } = require('pg');

// Create a safety mechanism for ensuring a working database connection
let dbPool = pool;

// Check if the imported pool is valid
if (!dbPool || typeof dbPool.query !== 'function') {
  console.error('WARNING: Main database pool not properly initialized in payment_method.js');
  
  // Create a fallback pool
  try {
    console.log('Creating fallback database pool for payment method operations');
    
    const poolConfig = {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'rahmanov02',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'reenter_db'
    };
    
    dbPool = new Pool(poolConfig);
    
    if (typeof dbPool.query === 'function') {
      console.log('Successfully created fallback database pool in payment_method.js');
    } else {
      console.error('CRITICAL: Failed to create valid fallback pool in payment_method.js');
    }
  } catch (err) {
    console.error('Error creating fallback pool in payment_method.js:', err);
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

class PaymentMethod {
  /**
   * Helper function to safely perform database operations
   * @param {string} query - SQL query to execute
   * @param {Array} params - Parameters for query
   * @returns {Promise<Object>} Query result
   */
  static async safeQuery(query, params = []) {
    return safeQuery(query, params);
  }

  /**
   * Get all payment methods for a user
   * @param {number} userId - User ID
   * @returns {Array} Array of payment methods
   */
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT 
          id, 
          user_id,
          type,
          name,
          last4,
          expiry_month,
          expiry_year,
          is_default,
          created_at,
          updated_at
        FROM payment_methods 
        WHERE user_id = $1
        ORDER BY is_default DESC, created_at DESC
      `;
      
      const { rows } = await safeQuery(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Error finding payment methods:', error);
      throw error;
    }
  }

  /**
   * Get a specific payment method
   * @param {string} id - Payment method ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Object|null} Payment method or null if not found
   */
  static async findById(id, userId) {
    try {
      const query = `
        SELECT 
          id, 
          user_id,
          type,
          name,
          last4,
          expiry_month,
          expiry_year,
          is_default,
          created_at,
          updated_at
        FROM payment_methods 
        WHERE id = $1 AND user_id = $2
      `;
      
      const { rows } = await safeQuery(query, [id, userId]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding payment method:', error);
      throw error;
    }
  }

  /**
   * Create a new payment method
   * @param {Object} data - Payment method data
   * @returns {Object} Created payment method
   */
  static async create(data) {
    const { 
      user_id, 
      type, 
      name, 
      last4, 
      expiry_month = null, 
      expiry_year = null, 
      is_default = false 
    } = data;

    try {
      // If this is set as default, unset any existing default
      if (is_default) {
        await this.unsetDefaultForUser(user_id);
      }
      
      const query = `
        INSERT INTO payment_methods (
          user_id,
          type,
          name,
          last4,
          expiry_month,
          expiry_year,
          is_default,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING 
          id, 
          user_id,
          type,
          name,
          last4,
          expiry_month,
          expiry_year,
          is_default,
          created_at
      `;
      
      const values = [
        user_id,
        type,
        name,
        last4,
        expiry_month,
        expiry_year,
        is_default
      ];
      
      const { rows } = await safeQuery(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error creating payment method:', error);
      throw error;
    }
  }

  /**
   * Update a payment method
   * @param {string} id - Payment method ID
   * @param {number} userId - User ID (for authorization)
   * @param {Object} updateData - Data to update
   * @returns {Object|null} Updated payment method or null if not found
   */
  static async update(id, userId, updateData) {
    try {
      // Build dynamic query based on provided fields
      const allowedFields = [
        'name', 
        'last4', 
        'expiry_month', 
        'expiry_year',
        'is_default'
      ];
      
      // Filter out undefined values and non-allowed fields
      const updates = Object.entries(updateData)
        .filter(([key, value]) => allowedFields.includes(key) && value !== undefined);
      
      if (updates.length === 0) {
        // No valid updates, return current payment method
        return await this.findById(id, userId);
      }
      
      // If setting as default, unset any existing default
      if (updateData.is_default) {
        await this.unsetDefaultForUser(userId);
      }
      
      // Build query parts
      const setClause = updates
        .map(([key], index) => `${key} = $${index + 1}`)
        .join(', ');
      
      const values = updates.map(([, value]) => value);
      values.push(id); // Add ID as the second-to-last parameter
      values.push(userId); // Add userId as the last parameter
      
      const query = `
        UPDATE payment_methods
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${values.length - 1} AND user_id = $${values.length}
        RETURNING 
          id, 
          user_id,
          type,
          name,
          last4,
          expiry_month,
          expiry_year,
          is_default,
          created_at,
          updated_at
      `;
      
      const { rows } = await safeQuery(query, values);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }
  
  /**
   * Set a payment method as default and unset all others
   * @param {string} id - Payment method ID
   * @param {number} userId - User ID (for authorization)
   * @returns {Object|null} Updated payment method or null if not found
   */
  static async setDefault(id, userId) {
    try {
      // First unset all default payment methods for this user
      await this.unsetDefaultForUser(userId);
      
      // Then set this one as default
      const query = `
        UPDATE payment_methods
        SET is_default = true, updated_at = NOW()
        WHERE id = $1 AND user_id = $2
        RETURNING 
          id, 
          user_id,
          type,
          name,
          last4,
          expiry_month,
          expiry_year,
          is_default,
          created_at,
          updated_at
      `;
      
      const { rows } = await safeQuery(query, [id, userId]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  }
  
  /**
   * Unset any default payment methods for a user
   * @param {number} userId - User ID
   */
  static async unsetDefaultForUser(userId) {
    try {
      const query = `
        UPDATE payment_methods
        SET is_default = false, updated_at = NOW()
        WHERE user_id = $1 AND is_default = true
      `;
      
      await safeQuery(query, [userId]);
    } catch (error) {
      console.error('Error unsetting default payment methods:', error);
      throw error;
    }
  }
  
  /**
   * Delete a payment method
   * @param {string} id - Payment method ID
   * @param {number} userId - User ID (for authorization)
   * @returns {boolean} True if deleted successfully
   */
  static async delete(id, userId) {
    try {
      // Check if this is the default payment method
      const paymentMethod = await this.findById(id, userId);
      if (!paymentMethod) {
        return false;
      }
      
      const query = `
        DELETE FROM payment_methods
        WHERE id = $1 AND user_id = $2
        RETURNING id
      `;
      
      const { rows } = await safeQuery(query, [id, userId]);
      
      // If this was the default, set a new default if there are other payment methods
      if (paymentMethod.is_default) {
        const remainingMethods = await this.findByUserId(userId);
        if (remainingMethods.length > 0) {
          await this.setDefault(remainingMethods[0].id, userId);
        }
      }
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error deleting payment method:', error);
      throw error;
    }
  }
}

module.exports = PaymentMethod; 