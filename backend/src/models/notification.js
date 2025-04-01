const pool = require('../config/db');

class Notification {
  static async create({ user_id, type, message, read = false }) {
    const query = `
      INSERT INTO notifications (user_id, type, message, read, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    `;
    const values = [user_id, type, message, read];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT *
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async markAsRead(id, userId) {
    const query = `
      UPDATE notifications 
      SET read = true, updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    const { rows } = await pool.query(query, [id, userId]);
    return rows[0];
  }

  static async markAllAsRead(userId) {
    const query = `
      UPDATE notifications 
      SET read = true, updated_at = NOW()
      WHERE user_id = $1 AND read = false
      RETURNING *
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }
}

module.exports = Notification; 