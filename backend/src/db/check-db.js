const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log('=======================================');
console.log('DATABASE CONNECTION DIAGNOSTIC UTILITY');
console.log('=======================================');
console.log('\nEnvironment variables:');
console.log('- DB_USER:', process.env.DB_USER || 'Not set (using default: postgres)');
console.log('- DB_PASSWORD:', process.env.DB_PASSWORD ? '******** (set)' : 'Not set');
console.log('- DB_HOST:', process.env.DB_HOST || 'Not set (using default: localhost)');
console.log('- DB_PORT:', process.env.DB_PORT || 'Not set (using default: 5432)');
console.log('- DB_NAME:', process.env.DB_NAME || 'Not set (using default: reenter_db)');

// Create pool with detailed configuration
const poolConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rahmanov02',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'reenter_db',
  // Short timeout for diagnosis
  connectionTimeoutMillis: 5000
};

// Check PostgreSQL version
try {
  const pgVersion = require('pg/package.json').version;
  console.log('\nPG Package version:', pgVersion);
} catch (err) {
  console.error('\nCould not determine PG package version:', err.message);
}

console.log('\nPool configuration:', {
  ...poolConfig,
  password: '********' // Hide password in logs
});

async function checkDatabaseConnection() {
  console.log('\nAttempting to connect to PostgreSQL...');
  
  const pool = new Pool(poolConfig);
  
  // Verify pool is properly created
  console.log('Pool object created successfully:', !!pool);
  console.log('Pool query method available:', typeof pool.query === 'function');
  
  if (!pool || typeof pool.query !== 'function') {
    console.error('\nERROR: Pool object is not properly initialized');
    process.exit(1);
  }
  
  try {
    console.log('\nRunning test query...');
    const result = await pool.query('SELECT version()');
    console.log('\n✅ SUCCESS: Connected to PostgreSQL server!');
    console.log('Server version:', result.rows[0].version);
    
    // Test query to check if users table exists
    try {
      console.log('\nChecking if users table exists...');
      await pool.query('SELECT COUNT(*) FROM users');
      console.log('✅ SUCCESS: users table exists and is accessible');
    } catch (error) {
      console.error('\n❌ ERROR: users table check failed:', error.message);
      console.log('\nYou may need to initialize the database:');
      console.log('npm run init-db');
    }
    
  } catch (error) {
    console.error('\n❌ CONNECTION ERROR:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\nThis error indicates that the PostgreSQL server is not running or not accepting connections on the specified host and port.');
      console.log('\nTroubleshooting steps:');
      console.log('1. Verify PostgreSQL is installed and running');
      console.log('2. Check the PostgreSQL service status');
      console.log('3. Verify the host and port settings in your .env file');
    } else if (error.code === '3D000') {
      console.log('\nThis error indicates that the database does not exist.');
      console.log('\nTroubleshooting steps:');
      console.log('1. Create the database using: CREATE DATABASE reenter_db;');
      console.log('2. Or update your .env file to use an existing database');
    } else if (error.code === '28P01') {
      console.log('\nThis error indicates authentication failed due to incorrect username or password.');
      console.log('\nTroubleshooting steps:');
      console.log('1. Verify the DB_USER and DB_PASSWORD in your .env file');
      console.log('2. Make sure the specified user has access to the database');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
  
  process.exit(0);
}

checkDatabaseConnection().catch(err => {
  console.error('Unexpected error during database check:', err);
  process.exit(1);
}); 