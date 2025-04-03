const pool = require('../config/db');

async function checkSchema() {
  try {
    // Check users table
    console.log('\nUsers table schema:');
    const usersResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    usersResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
    });

    // Check leases table
    console.log('\nLeases table schema:');
    const leasesResult = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'leases'
      ORDER BY ordinal_position;
    `);
    leasesResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
    });

    // Check constraints
    console.log('\nConstraints:');
    const constraintsResult = await pool.query(`
      SELECT tc.constraint_name, tc.table_name, kcu.column_name, tc.constraint_type
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.table_name IN ('users', 'leases')
      ORDER BY tc.table_name, tc.constraint_name;
    `);
    constraintsResult.rows.forEach(row => {
      console.log(`${row.table_name}.${row.column_name}: ${row.constraint_type} (${row.constraint_name})`);
    });

  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    await pool.end();
  }
}

checkSchema(); 