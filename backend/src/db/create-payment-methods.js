// Script to create the payment_methods table
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rahmanov02',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'reenter_db'
});

async function createPaymentMethodsTable() {
  try {
    console.log('Connecting to the database...');
    const client = await pool.connect();
    
    console.log('Reading migration SQL...');
    const sqlPath = path.resolve(__dirname, 'migrations/create_payment_methods.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Creating payment_methods table...');
    await client.query(sql);
    
    console.log('Payment methods table created or verified successfully!');
    client.release();
  } catch (err) {
    console.error('Error creating payment_methods table:', err);
  } finally {
    await pool.end();
  }
}

createPaymentMethodsTable(); 