const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, name, phone }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (email, password, name, phone, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, email, name, phone, created_at
    `;
    const values = [email, hashedPassword, name, phone];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, name, phone, created_at FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async updateProfile(id, { name, phone, bio, photo_url }) {
    const query = `
      UPDATE users 
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          bio = COALESCE($3, bio),
          photo_url = COALESCE($4, photo_url),
          updated_at = NOW()
      WHERE id = $5
      RETURNING id, email, name, phone, bio, photo_url, created_at, updated_at
    `;
    const values = [name, phone, bio, photo_url, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

module.exports = User; 