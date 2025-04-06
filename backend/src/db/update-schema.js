// Script to update the leases.status column length
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rahmanov02', // Use the correct password
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'reenter_db'
});

async function updateStatusColumnLength() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    
    console.log('Updating leases.status column length...');
    const result = await client.query(`
      ALTER TABLE leases ALTER COLUMN status TYPE VARCHAR(30);
    `);
    
    console.log('Column updated successfully!');
    client.release();
  } catch (err) {
    console.error('Error updating schema:', err);
  } finally {
    await pool.end();
  }
}

updateStatusColumnLength(); 