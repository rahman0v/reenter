/**
 * WARNING: This script is for DEVELOPMENT purposes only.
 * It populates the database with sample data for testing.
 * DO NOT run this in production as it may affect real user data.
 */

const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// Check if running in production mode
const isProduction = process.env.NODE_ENV === 'production';

async function seedDatabase() {
  try {
    if (isProduction) {
      console.error('\n⚠️ WARNING: This script should not be run in production!');
      console.error('This script is intended for development and testing only.');
      console.error('Running it in production could affect real user data.\n');
      
      // Safety prompt
      console.error('If you still want to proceed, set FORCE_SEED=true in your environment variables.');
      
      if (process.env.FORCE_SEED !== 'true') {
        console.error('Aborting seed operation for safety reasons.');
        process.exit(1);
      }
      
      console.error('⚠️ Proceeding with seed operation in PRODUCTION. This is not recommended!\n');
    }
    
    console.log('Seeding database with initial development data...');

    // Start a transaction
    await pool.query('BEGIN');

    // Check if users already exist
    const userCheck = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCheck.rows[0].count) > 0) {
      console.log('Users already exist in the database, skipping user seed');
    } else {
      // Create test users
      const hashedPassword = await bcrypt.hash('password123', 10);
      const demoPassword = await bcrypt.hash('demo123', 10);
      
      // Create admin user
      await pool.query(`
        INSERT INTO users (email, password, name, phone, role) 
        VALUES ($1, $2, $3, $4, $5)
      `, ['admin@reenter.com', hashedPassword, 'Admin User', '5551234567', 'admin']);
      
      // Create landlord user
      await pool.query(`
        INSERT INTO users (email, password, name, phone, role, address) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['landlord@reenter.com', hashedPassword, 'John Landlord', '5552345678', 'landlord', '123 Owner St, Propertyville']);
      
      // Create tenant users
      await pool.query(`
        INSERT INTO users (email, password, name, phone, role, address) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['tenant@reenter.com', hashedPassword, 'Jane Tenant', '5553456789', 'tenant', '456 Renter Ave, Leasetown']);
      
      // Create demo user
      await pool.query(`
        INSERT INTO users (email, password, name, phone, role, address) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['demo@reenter.com', demoPassword, 'Demo User', '5554567890', 'tenant', '789 Demo Blvd, Testcity']);
      
      console.log('Development test users created successfully');
    }

    // Check if leases already exist
    const leaseCheck = await pool.query('SELECT COUNT(*) FROM leases');
    if (parseInt(leaseCheck.rows[0].count) > 0) {
      console.log('Leases already exist in the database, skipping lease seed');
    } else {
      // Get user IDs
      const landlordResult = await pool.query("SELECT id FROM users WHERE email = 'landlord@reenter.com'");
      const tenantResult = await pool.query("SELECT id FROM users WHERE email = 'tenant@reenter.com'");
      const demoResult = await pool.query("SELECT id FROM users WHERE email = 'demo@reenter.com'");
      
      if (landlordResult.rows.length > 0 && tenantResult.rows.length > 0) {
        const landlordId = landlordResult.rows[0].id;
        const tenantId = tenantResult.rows[0].id;
        const demoId = demoResult.rows[0]?.id;
        
        // Create a lease between landlord and tenant
        await pool.query(`
          INSERT INTO leases (
            landlord_id, tenant_id, property_name, property_address, 
            monthly_rent, premium, start_date, end_date, status, ref_code
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          landlordId, tenantId, 'City Apartment', '123 Main St, Apt 4B, Cityville',
          1200.00, 100.00, '2023-01-01', '2023-12-31', 'active', 'LEASE001'
        ]);
        
        if (demoId) {
          // Create a lease for demo user
          await pool.query(`
            INSERT INTO leases (
              landlord_id, tenant_id, property_name, property_address, 
              monthly_rent, premium, start_date, end_date, status, ref_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          `, [
            landlordId, demoId, 'Demo Condo', '456 Demo St, Unit 7, Testville',
            1000.00, 80.00, '2023-02-01', '2024-01-31', 'active', 'DEMO001'
          ]);
        }
        
        console.log('Test leases created successfully');
      }
    }

    // Check if payments already exist
    const paymentCheck = await pool.query('SELECT COUNT(*) FROM payments');
    if (parseInt(paymentCheck.rows[0].count) > 0) {
      console.log('Payments already exist in the database, skipping payment seed');
    } else {
      // Get lease IDs
      const leaseResult = await pool.query("SELECT id FROM leases WHERE ref_code = 'LEASE001'");
      const demoLeaseResult = await pool.query("SELECT id FROM leases WHERE ref_code = 'DEMO001'");
      
      if (leaseResult.rows.length > 0) {
        const leaseId = leaseResult.rows[0].id;
        
        // Create payments for the lease
        await pool.query(`
          INSERT INTO payments (lease_id, amount, due_date, status)
          VALUES ($1, $2, $3, $4)
        `, [leaseId, 1200.00, '2023-01-01', 'paid']);
        
        await pool.query(`
          INSERT INTO payments (lease_id, amount, due_date, status)
          VALUES ($1, $2, $3, $4)
        `, [leaseId, 1200.00, '2023-02-01', 'paid']);
        
        await pool.query(`
          INSERT INTO payments (lease_id, amount, due_date, status)
          VALUES ($1, $2, $3, $4)
        `, [leaseId, 1200.00, '2023-03-01', 'pending']);
        
        console.log('Test payments created successfully');
      }
      
      if (demoLeaseResult.rows.length > 0) {
        const demoLeaseId = demoLeaseResult.rows[0].id;
        
        // Create payments for the demo lease
        await pool.query(`
          INSERT INTO payments (lease_id, amount, due_date, status)
          VALUES ($1, $2, $3, $4)
        `, [demoLeaseId, 1000.00, '2023-02-01', 'paid']);
        
        await pool.query(`
          INSERT INTO payments (lease_id, amount, due_date, status)
          VALUES ($1, $2, $3, $4)
        `, [demoLeaseId, 1000.00, '2023-03-01', 'pending']);
      }
    }

    // Check if notifications already exist
    const notificationCheck = await pool.query('SELECT COUNT(*) FROM notifications');
    if (parseInt(notificationCheck.rows[0].count) > 0) {
      console.log('Notifications already exist in the database, skipping notification seed');
    } else {
      // Get user IDs
      const tenantResult = await pool.query("SELECT id FROM users WHERE email = 'tenant@reenter.com'");
      const demoResult = await pool.query("SELECT id FROM users WHERE email = 'demo@reenter.com'");
      
      if (tenantResult.rows.length > 0) {
        const tenantId = tenantResult.rows[0].id;
        
        // Create notifications for tenant
        await pool.query(`
          INSERT INTO notifications (user_id, type, message, read)
          VALUES ($1, $2, $3, $4)
        `, [tenantId, 'payment', 'Your rent payment was received successfully.', true]);
        
        await pool.query(`
          INSERT INTO notifications (user_id, type, message, read)
          VALUES ($1, $2, $3, $4)
        `, [tenantId, 'lease', 'Your lease is up for renewal next month.', false]);
      }
      
      if (demoResult.rows.length > 0) {
        const demoId = demoResult.rows[0].id;
        
        // Create notifications for demo user
        await pool.query(`
          INSERT INTO notifications (user_id, type, message, read)
          VALUES ($1, $2, $3, $4)
        `, [demoId, 'welcome', 'Welcome to Reenter! Complete your profile to get started.', false]);
        
        await pool.query(`
          INSERT INTO notifications (user_id, type, message, read)
          VALUES ($1, $2, $3, $4)
        `, [demoId, 'payment', 'Your March rent payment is due in 3 days.', false]);
      }
      
      console.log('Test notifications created successfully');
    }

    // Commit the transaction
    await pool.query('COMMIT');
    console.log('Development database seeding completed successfully');
    console.log('\n⚠️ REMINDER: This data is for development and testing only.');
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK');
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

seedDatabase(); 