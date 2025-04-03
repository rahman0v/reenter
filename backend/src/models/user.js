const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ email, password, name, phone, preferred_name, address, emergency_contact, education_status, employment_status, date_of_birth }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (email, password, name, phone, preferred_name, address, emergency_contact, education_status, employment_status, date_of_birth, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      RETURNING id, email, name, phone, preferred_name, address, emergency_contact, education_status, employment_status, date_of_birth, created_at
    `;
    const values = [email, hashedPassword, name, phone, preferred_name, address, emergency_contact, education_status, employment_status, date_of_birth];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT id, email, password, name, phone, role, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    const { rows } = await pool.query(query, [email]);
    return rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT id, email, name, phone, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }

  static async updateProfile(id, { 
    name, phone, bio, photo_url, preferred_name, address, 
    emergency_contact, education_status, employment_status, date_of_birth 
  }) {
    const query = `
      UPDATE users 
      SET name = COALESCE($1, name),
          phone = COALESCE($2, phone),
          bio = COALESCE($3, bio),
          photo_url = COALESCE($4, photo_url),
          preferred_name = COALESCE($5, preferred_name),
          address = COALESCE($6, address),
          emergency_contact = COALESCE($7, emergency_contact),
          education_status = COALESCE($8, education_status),
          employment_status = COALESCE($9, employment_status),
          date_of_birth = COALESCE($10, date_of_birth),
          updated_at = NOW()
      WHERE id = $11
      RETURNING id, email, name, phone, preferred_name, address, emergency_contact, 
                education_status, employment_status, date_of_birth, bio, photo_url, 
                created_at, updated_at
    `;
    const values = [
      name, phone, bio, photo_url, preferred_name, address, 
      emergency_contact, education_status, employment_status, date_of_birth, id
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
}

module.exports = User; 