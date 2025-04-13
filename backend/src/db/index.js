const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Primary database configuration
const primaryConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'reenter_db',
  password: process.env.DB_PASSWORD || 'rahmanov02',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // Connection pool settings
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // how long to wait for a connection
};

// Fallback database configuration
const fallbackConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'reenter_db',
  password: process.env.DB_PASSWORD || 'rahmanov02',
  port: process.env.DB_PORT || 5432,
  ssl: false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create primary pool
const pool = new Pool(primaryConfig);

// Create fallback pool
const fallbackPool = new Pool(fallbackConfig);

// Function to test database connection
const testConnection = async (pool) => {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Function to get a working database pool
const getWorkingPool = async () => {
  try {
    const isPrimaryWorking = await testConnection(pool);
    if (isPrimaryWorking) {
      console.log('Using primary database connection');
      return pool;
    }
    
    const isFallbackWorking = await testConnection(fallbackPool);
    if (isFallbackWorking) {
      console.log('Using fallback database connection');
      return fallbackPool;
    }
    
    throw new Error('No working database connection available');
  } catch (error) {
    console.error('Error getting working pool:', error);
    throw error;
  }
};

// Safe query function with automatic pool selection
const safeQuery = async (text, params) => {
  let currentPool = pool;
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const result = await currentPool.query(text, params);
      return result;
    } catch (error) {
      console.error(`Query attempt ${retryCount + 1} failed:`, error);
      
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        try {
          currentPool = await getWorkingPool();
          retryCount++;
          continue;
        } catch (poolError) {
          console.error('Failed to get working pool:', poolError);
          throw poolError;
        }
      }
      
      throw error;
    }
  }

  throw new Error('Maximum retry attempts reached');
};

// Event listeners for pool errors
pool.on('error', (err) => {
  console.error('Primary pool error:', err);
});

fallbackPool.on('error', (err) => {
  console.error('Fallback pool error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down database connections...');
  await pool.end();
  await fallbackPool.end();
  process.exit(0);
});

module.exports = {
  pool,
  fallbackPool,
  safeQuery,
  testConnection,
  getWorkingPool
}; 