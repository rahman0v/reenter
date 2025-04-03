const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get list of migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    // Get list of executed migrations
    const { rows: executedMigrations } = await pool.query(
      'SELECT name FROM migrations'
    );
    const executedMigrationNames = executedMigrations.map(row => row.name);

    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedMigrationNames.includes(file)) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf8'
        );

        await pool.query('BEGIN');
        try {
          // For 002_add_lease_fields.sql, skip if columns already exist
          if (file === '002_add_lease_fields.sql') {
            const { rows } = await pool.query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = 'leases' AND column_name = 'property_name'
            `);
            if (rows.length > 0) {
              console.log('Skipping 002_add_lease_fields.sql as columns already exist');
              await pool.query(
                'INSERT INTO migrations (name) VALUES ($1)',
                [file]
              );
              await pool.query('COMMIT');
              continue;
            }
          }

          await pool.query(sql);
          await pool.query(
            'INSERT INTO migrations (name) VALUES ($1)',
            [file]
          );
          await pool.query('COMMIT');
          console.log(`Migration ${file} completed successfully`);
        } catch (err) {
          await pool.query('ROLLBACK');
          console.error(`Error running migration ${file}:`, err);
          throw err;
        }
      } else {
        console.log(`Skipping already executed migration: ${file}`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (err) {
    console.error('Error running migrations:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations(); 