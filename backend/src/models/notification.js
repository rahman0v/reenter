const { pool } = require('../config/db');
const { Pool } = require('pg');

// Create a safety mechanism for ensuring a working database connection
let dbPool = pool;

// Check if the imported pool is valid
if (!dbPool || typeof dbPool.query !== 'function') {
  console.error('WARNING: Main database pool not properly initialized in notification.js');
  
  // Create a fallback pool
  try {
    console.log('Creating fallback database pool for notification operations');
    
    const poolConfig = {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'rahmanov02',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'reenter_db'
    };
    
    dbPool = new Pool(poolConfig);
    
    if (typeof dbPool.query === 'function') {
      console.log('Successfully created fallback database pool in notification.js');
    } else {
      console.error('CRITICAL: Failed to create valid fallback pool in notification.js');
    }
  } catch (err) {
    console.error('Error creating fallback pool in notification.js:', err);
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

class Notification {
  static async create({ user_id, type, message, read = false }) {
    console.log(`Creating notification for user ${user_id}, type: ${type}`);
    const query = `
      INSERT INTO notifications (user_id, type, message, read, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const values = [user_id, type, message, read];
    try {
      const { rows } = await safeQuery(query, values);
      console.log(`Notification created successfully for user ${user_id}`);
      return rows[0];
    } catch (err) {
      console.error(`Failed to create notification for user ${user_id}:`, err);
      throw err;
    }
  }

  static async findByUserId(userId) {
    const query = `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await safeQuery(query, [userId]);
    return rows;
  }

  static async markAsRead(id, userId) {
    const query = `
      UPDATE notifications 
      SET read = true, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await safeQuery(query, [id, userId]);
    return rows[0];
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET read = true, updated_at = NOW()
      WHERE user_id = $1 AND read = false
      RETURNING *
    `;
    const { rows } = await safeQuery(query, [userId]);
    return rows;
  }
}

module.exports = Notification;