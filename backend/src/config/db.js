const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Determine environment
const isProduction = process.env.NODE_ENV === 'production';

// Configure connection pool based on environment
const poolConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rahmanov02',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'reenter_db',
  // Production optimizations
  ...(isProduction && {
    max: parseInt(process.env.DB_POOL_MAX || '20'), // Max number of clients in the pool
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // How long a client is allowed to remain idle (ms)
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000'), // How long to wait for a connection (ms)
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  })
};

// Create connection pool
const pool = new Pool(poolConfig);

// Add debugging to verify pool is correctly created
console.log('Pool initialized with query method:', typeof pool.query === 'function');

// Configure connection behavior
pool.on('connect', () => {
  if (!isProduction) {
    console.log('Connected to the PostgreSQL database');
  }
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  
  // Only exit in production for critical errors
  if (isProduction && err.code === 'ECONNREFUSED') {
    console.error('Fatal database connection error. Exiting application.');
    process.exit(-1);
  }
});

// Simple query function for testing connection
const testConnection = async () => {
  try {
    // Verify pool has query method before using it
    if (typeof pool.query !== 'function') {
      console.error('ERROR: pool.query is not a function!');
      console.error('Pool object:', pool);
      return false;
    }
    
    const res = await pool.query('SELECT NOW()');
    if (!isProduction) {
      console.log('Database connection test successful:', res.rows[0]);
    }
    return true;
  } catch (err) {
    console.error('Database connection test failed:', err.message);
    return false;
  }
};

// Explicitly check if pool is properly initialized before exporting
if (!pool || typeof pool.query !== 'function') {
  console.error('WARNING: Pool object is not properly initialized');
  console.error('Pool:', pool);
  
  // Create a new pool as fallback
  const fallbackPool = new Pool(poolConfig);
  if (typeof fallbackPool.query === 'function') {
    console.log('Created fallback pool');
    module.exports = { 
      pool: fallbackPool, 
      testConnection 
    };
  } else {
    console.error('CRITICAL: Could not create a valid database pool');
  }
} else {
  module.exports = { pool, testConnection };
}