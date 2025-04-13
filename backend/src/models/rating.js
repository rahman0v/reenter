const db = require('../config/db');
const { Pool } = require('pg');

// Create a safety mechanism for ensuring a working database connection
let dbPool = db.pool;

// Check if the imported pool is valid
if (!dbPool || typeof dbPool.query !== 'function') {
  console.error('WARNING: Main database pool not properly initialized in rating.js');
  
  // Create a fallback pool
  try {
    console.log('Creating fallback database pool for rating operations');
    
    const poolConfig = {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'rahmanov02',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'reenter_db'
    };
    
    dbPool = new Pool(poolConfig);
    
    if (typeof dbPool.query === 'function') {
      console.log('Successfully created fallback database pool');
    } else {
      console.error('CRITICAL: Failed to create valid fallback pool');
    }
  } catch (err) {
    console.error('Error creating fallback pool:', err);
  }
}

/**
 * Execute database query safely with error handling
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Database result
 */
async function safeQuery(queryText, params = []) {
  try {
    if (!dbPool || typeof dbPool.query !== 'function') {
      throw new Error('Database pool not properly initialized');
    }
    const result = await dbPool.query(queryText, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Rating model handles all rating-related operations
 */
class Rating {
  /**
   * Create a new rating
   * @param {Object} ratingData - Rating data to insert
   * @returns {Object} Created rating
   */
  static async create(ratingData) {
    try {
      const { reviewer_id, reviewed_id, lease_id, rating, comment, role } = ratingData;
      
      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      
      // Validate role
      if (role !== 'landlord' && role !== 'tenant') {
        throw new Error('Role must be either landlord or tenant');
      }
      
      const query = `
        INSERT INTO ratings (reviewer_id, reviewed_id, lease_id, rating, comment, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [reviewer_id, reviewed_id, lease_id, rating, comment, role];
      const { rows } = await safeQuery(query, values);
      
      console.log('Rating created successfully');
      return rows[0];
    } catch (error) {
      console.error('Error creating rating:', error);
      throw error;
    }
  }

  /**
   * Find ratings by user ID (reviews they've received)
   * @param {number} userId - User ID to get ratings for
   * @returns {Object} Object containing both landlord and tenant ratings
   */
  static async findByUserId(userId) {
    try {
      // Get landlord ratings (ratings where the user was a landlord)
      const landlordQuery = `
        SELECT r.*, u.name as reviewer_name, u.photo_url as reviewer_photo
        FROM ratings r
        JOIN users u ON r.reviewer_id = u.id
        WHERE r.reviewed_id = $1 AND r.role = 'landlord'
        ORDER BY r.created_at DESC
      `;
      
      // Get tenant ratings (ratings where the user was a tenant)
      const tenantQuery = `
        SELECT r.*, u.name as reviewer_name, u.photo_url as reviewer_photo
        FROM ratings r
        JOIN users u ON r.reviewer_id = u.id
        WHERE r.reviewed_id = $1 AND r.role = 'tenant'
        ORDER BY r.created_at DESC
      `;
      
      const [landlordResult, tenantResult] = await Promise.all([
        safeQuery(landlordQuery, [userId]),
        safeQuery(tenantQuery, [userId])
      ]);
      
      // Calculate average ratings
      const calcAverage = (ratings) => {
        if (ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
        return sum / ratings.length;
      };
      
      return {
        as_landlord: {
          ratings: landlordResult.rows,
          average: calcAverage(landlordResult.rows),
          count: landlordResult.rows.length
        },
        as_tenant: {
          ratings: tenantResult.rows,
          average: calcAverage(tenantResult.rows),
          count: tenantResult.rows.length
        },
        total_reviews: landlordResult.rows.length + tenantResult.rows.length
      };
    } catch (error) {
      console.error('Error finding ratings by user ID:', error);
      throw error;
    }
  }

  /**
   * Get a specific rating by ID
   * @param {number} id - Rating ID
   * @returns {Object|null} Rating or null if not found
   */
  static async findById(id) {
    try {
      const query = `
        SELECT r.*, 
               u_reviewer.name as reviewer_name, 
               u_reviewer.photo_url as reviewer_photo,
               u_reviewed.name as reviewed_name,
               u_reviewed.photo_url as reviewed_photo
        FROM ratings r
        JOIN users u_reviewer ON r.reviewer_id = u_reviewer.id
        JOIN users u_reviewed ON r.reviewed_id = u_reviewed.id
        WHERE r.id = $1
      `;
      
      const { rows } = await safeQuery(query, [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      console.error('Error finding rating by ID:', error);
      throw error;
    }
  }

  /**
   * Check if a user has already rated another user for a specific lease
   * @param {number} reviewerId - Reviewer user ID
   * @param {number} reviewedId - Reviewed user ID
   * @param {number} leaseId - Lease ID
   * @param {string} role - Role ('landlord' or 'tenant')
   * @returns {boolean} True if the user has already rated
   */
  static async hasRated(reviewerId, reviewedId, leaseId, role) {
    try {
      const query = `
        SELECT id FROM ratings
        WHERE reviewer_id = $1 AND reviewed_id = $2 AND lease_id = $3 AND role = $4
      `;
      
      const { rows } = await safeQuery(query, [reviewerId, reviewedId, leaseId, role]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking if user has rated:', error);
      throw error;
    }
  }

  /**
   * Update an existing rating
   * @param {number} id - Rating ID
   * @param {Object} updateData - Rating data to update
   * @param {number} reviewerId - Reviewer user ID for security check
   * @returns {Object|null} Updated rating or null if not found
   */
  static async update(id, updateData, reviewerId) {
    try {
      // Verify the rating belongs to the reviewer
      const existingRating = await this.findById(id);
      
      if (!existingRating) {
        return null;
      }
      
      if (existingRating.reviewer_id !== reviewerId) {
        throw new Error('Not authorized to update this rating');
      }
      
      // Build dynamic query based on provided fields
      const allowedFields = ['rating', 'comment'];
      
      // Filter out undefined values and non-allowed fields
      const updates = Object.entries(updateData)
        .filter(([key, value]) => allowedFields.includes(key) && value !== undefined);
      
      if (updates.length === 0) {
        return existingRating; // No updates, return current rating
      }
      
      // Build query parts
      const setClause = updates
        .map(([key], index) => `${key} = $${index + 1}`)
        .join(', ');
      
      const values = updates.map(([, value]) => value);
      values.push(id); // Add ID as the last parameter
      
      const query = `
        UPDATE ratings 
        SET ${setClause}
        WHERE id = $${values.length}
        RETURNING *
      `;
      
      const { rows } = await safeQuery(query, values);
      
      if (rows.length === 0) {
        return null;
      }
      
      return rows[0];
    } catch (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
  }

  /**
   * Delete a rating
   * @param {number} id - Rating ID
   * @param {number} reviewerId - Reviewer user ID for security check
   * @returns {boolean} True if deleted successfully
   */
  static async delete(id, reviewerId) {
    try {
      // Verify the rating belongs to the reviewer
      const existingRating = await this.findById(id);
      
      if (!existingRating) {
        return false;
      }
      
      if (existingRating.reviewer_id !== reviewerId) {
        throw new Error('Not authorized to delete this rating');
      }
      
      const query = 'DELETE FROM ratings WHERE id = $1';
      const { rowCount } = await safeQuery(query, [id]);
      
      return rowCount > 0;
    } catch (error) {
      console.error('Error deleting rating:', error);
      throw error;
    }
  }

  /**
   * Get ratings for a lease (from both parties)
   * @param {number} leaseId - Lease ID
   * @returns {Object} Lease ratings
   */
  static async findByLeaseId(leaseId) {
    try {
      const query = `
        SELECT r.*, 
               u_reviewer.name as reviewer_name, 
               u_reviewer.photo_url as reviewer_photo
        FROM ratings r
        JOIN users u_reviewer ON r.reviewer_id = u_reviewer.id
        WHERE r.lease_id = $1
        ORDER BY r.created_at DESC
      `;
      
      const { rows } = await safeQuery(query, [leaseId]);
      return rows;
    } catch (error) {
      console.error('Error finding ratings by lease ID:', error);
      throw error;
    }
  }
}

module.exports = Rating; 