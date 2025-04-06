const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

// Create a safety mechanism for ensuring a working database connection
let dbPool = pool;

// Check if the imported pool is valid
if (!dbPool || typeof dbPool.query !== 'function') {
  console.error('WARNING: Main database pool not properly initialized in user.js');
  
  // Create a fallback pool
  try {
    console.log('Creating fallback database pool for user operations');
    
    const poolConfig = {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'rahmanov02',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'reenter_db'
    };
    
    dbPool = new Pool(poolConfig);
    
    if (typeof dbPool.query === 'function') {
      console.log('Successfully created fallback database pool in user.js');
    } else {
      console.error('CRITICAL: Failed to create valid fallback pool in user.js');
    }
  } catch (err) {
    console.error('Error creating fallback pool in user.js:', err);
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

class User {
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
   * Create a new user
   * @param {Object} userData - User data object
   * @returns {Object} Created user without password
   */
  static async create(userData) {
    const { 
      email, 
      password, 
      name, 
      phone = null, 
      preferred_name = null, 
      address = null, 
      emergency_contact = null, 
      education_status = null, 
      employment_status = null, 
      date_of_birth = null,
      role = 'user'
    } = userData;

    try {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert the new user
      const query = `
        INSERT INTO users (
          email, 
          password, 
          name, 
          phone, 
          preferred_name, 
          address, 
          emergency_contact, 
          education_status, 
          employment_status, 
          date_of_birth,
          role,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING 
          id, 
          email, 
          name, 
          phone, 
          preferred_name, 
          address, 
          emergency_contact, 
          education_status, 
          employment_status, 
          date_of_birth,
          role,
          created_at
      `;
      
      const values = [
        email, 
        hashedPassword, 
        name, 
        phone, 
        preferred_name, 
        address, 
        emergency_contact, 
        education_status, 
        employment_status, 
        date_of_birth,
        role
      ];
      
      const { rows } = await safeQuery(query, values);
      return rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Object|null} User object or null if not found
   */
  static async findByEmail(email) {
    try {
      const query = `
        SELECT 
          id, 
          email, 
          password, 
          name, 
          phone, 
          role, 
          photo_url, 
          bio, 
          preferred_name,
          address,
          emergency_contact,
          education_status,
          employment_status,
          date_of_birth,
          created_at, 
          updated_at
        FROM users 
        WHERE email = $1
      `;
      
      const { rows } = await safeQuery(query, [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Object|null} User object or null if not found
   */
  static async findById(id) {
    try {
      const query = `
        SELECT 
          id, 
          email, 
          password, 
          name, 
          phone, 
          role, 
          photo_url, 
          bio, 
          preferred_name,
          address,
          emergency_contact,
          education_status,
          employment_status,
          date_of_birth,
          created_at, 
          updated_at
        FROM users 
        WHERE id = $1
      `;
      
      const { rows } = await safeQuery(query, [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {number} id - User ID
   * @param {Object} updateData - User data to update
   * @returns {Object|null} Updated user or null if not found
   */
  static async update(id, updateData) {
    try {
      // Build dynamic query based on provided fields
      const allowedFields = [
        'name', 
        'email', 
        'phone', 
        'preferred_name', 
        'address', 
        'emergency_contact', 
        'education_status', 
        'employment_status', 
        'date_of_birth',
        'photo_url',
        'bio',
        'tc_id'
      ];
      
      console.log('Updating user profile, user ID:', id, 'Data:', updateData);
      
      // Filter out undefined values and non-allowed fields
      const updates = Object.entries(updateData)
        .filter(([key, value]) => allowedFields.includes(key) && value !== undefined);
      
      if (updates.length === 0) {
        console.log('No valid fields to update');
        return await this.findById(id); // No updates, return current user
      }
      
      // Build query parts
      const setClause = updates
        .map(([key], index) => `${key} = $${index + 1}`)
        .join(', ');
      
      const values = updates.map(([, value]) => value);
      values.push(id); // Add ID as the last parameter
      
      const query = `
        UPDATE users 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $${values.length}
        RETURNING 
          id, 
          email, 
          name, 
          phone, 
          role, 
          photo_url, 
          bio, 
          preferred_name,
          address,
          emergency_contact,
          education_status,
          employment_status,
          date_of_birth,
          created_at, 
          updated_at
      `;
      
      console.log('Executing update query:', query.replace(/\s+/g, ' '));
      
      const { rows } = await safeQuery(query, values);
      
      if (rows.length === 0) {
        console.log('User not found for update, ID:', id);
        return null;
      }
      
      console.log('User updated successfully, ID:', id);
      return rows[0];
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Compare provided password with stored hash
   * @param {string} candidatePassword - Password to check
   * @param {string} hashedPassword - Stored hashed password
   * @returns {boolean} True if passwords match
   */
  static async comparePassword(candidatePassword, hashedPassword) {
    try {
      return await bcrypt.compare(candidatePassword, hashedPassword);
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw error;
    }
  }
}

module.exports = User;