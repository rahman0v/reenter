const { pool } = require('../config/db');

/**
 * Script to clear data from all tables without dropping the tables
 * This preserves the database structure while removing all data
 */
async function clearDatabase() {
  try {
    console.log('Clearing database tables...');
    
    // Use TRUNCATE with CASCADE to handle foreign key constraints
    // This is more efficient than DELETE and handles dependencies
    try {
      console.log('Performing TRUNCATE CASCADE on all related tables...');
      const truncateQuery = `
        TRUNCATE TABLE 
          lease_signatures, 
          lease_events, 
          lease_change_requests, 
          payments, 
          notifications, 
          ratings, 
          leases
        CASCADE;
      `;
      await pool.query(truncateQuery);
      console.log('All tables cleared successfully with TRUNCATE CASCADE!');
    } catch (truncateErr) {
      console.error('Error with TRUNCATE CASCADE, falling back to manual deletion:', truncateErr.message);
      
      // If TRUNCATE CASCADE fails, try individual DELETE with proper order
      // Order matters due to foreign key constraints
      // Clear child tables before parent tables
      const tables = [
        'lease_signatures', 
        'lease_events', 
        'lease_change_requests', 
        'payments', 
        'notifications', 
        'ratings', 
        'leases'
      ];
      
      for (const table of tables) {
        try {
          console.log(`Clearing ${table} table...`);
          await pool.query(`DELETE FROM ${table}`);
          console.log(`${table} table cleared.`);
        } catch (err) {
          if (err.code === '42P01') {
            // Table doesn't exist, which is fine
            console.log(`Table ${table} doesn't exist, skipping.`);
          } else {
            console.error(`Error clearing ${table}:`, err.message);
          }
        }
      }
    }
    
    // Verify that leases were cleared
    const checkResult = await pool.query('SELECT COUNT(*) FROM leases');
    console.log(`Verification: ${checkResult.rows[0].count} leases remaining in database.`);
    
    if (parseInt(checkResult.rows[0].count) > 0) {
      console.warn('WARNING: Some leases still remain in the database!');
      console.log('Attempting direct forced deletion...');
      
      // Force deletion with a more aggressive approach
      await pool.query('DELETE FROM leases CASCADE');
      
      // Check again
      const finalCheck = await pool.query('SELECT COUNT(*) FROM leases');
      console.log(`Final verification: ${finalCheck.rows[0].count} leases remaining.`);
    }
    
    console.log('Database cleaning completed!');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    await pool.end();
  }
}

// Execute the function
clearDatabase(); 