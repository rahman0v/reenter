const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Read SQL schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    // Execute each statement separately
    for (const statement of statements) {
      try {
        await pool.query(statement + ';');
      } catch (err) {
        // If table already exists, continue with next statement
        if (err.code === '42P07') { // duplicate_table error code
          console.log(`Table already exists, skipping: ${statement.slice(0, 50)}...`);
        } else {
          console.warn(`Warning executing statement: ${err.message}`);
          console.warn(`Statement: ${statement.slice(0, 100)}...`);
        }
      }
    }
    
    console.log('Database initialized successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    await pool.end();
    process.exit(1);
  }
};

initializeDatabase(); 