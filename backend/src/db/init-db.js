const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const initializeDatabase = async () => {
  try {
    console.log('Initializing database...');
    
    // Read SQL schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute SQL schema
    await pool.query(schema);
    
    console.log('Database initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

initializeDatabase(); 