const { safeQuery, pool } = require('../db');
const crypto = require('crypto');
const { Pool } = require('pg');

// Create a safety mechanism for ensuring a working database connection
let dbPool = pool;

// Check if the imported pool is valid
if (!dbPool || typeof dbPool.query !== 'function') {
  console.error('WARNING: Main database pool not properly initialized in lease.js');
  
  // Create a fallback pool
  try {
    console.log('Creating fallback database pool for lease operations');
    
    const poolConfig = {
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'rahmanov02',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'reenter_db'
    };
    
    dbPool = new Pool(poolConfig);
    
    if (typeof dbPool.query === 'function') {
      console.log('Successfully created fallback database pool');
    } else {
      console.error('CRITICAL: Failed to create valid fallback pool');
    }
  } catch (err) {
    console.error('Error creating fallback pool:', err);
  }
}

class Lease {
  static generateRefCode() {
    // Generate a 8-character unique reference code
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  static async create(data) {
    try {
      const result = await safeQuery(
        `INSERT INTO leases (
          title, description, monthly_rent, security_deposit,
          start_date, end_date, status, created_by,
          template_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [
          data.title,
          data.description,
          data.monthly_rent,
          data.security_deposit,
          data.start_date,
          data.end_date,
          data.status || 'draft',
          data.created_by,
          JSON.stringify(data.template_data || {})
        ]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error creating lease:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const query = `
        SELECT l.*, 
               u1.name as landlord_name,
               COALESCE(u2.name, 'No tenant assigned') as tenant_name
        FROM leases l
        JOIN users u1 ON l.landlord_id = u1.id
        LEFT JOIN users u2 ON l.tenant_id = u2.id
        WHERE l.id = $1
      `;
      const result = await safeQuery(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error finding lease by ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const result = await safeQuery(
        'SELECT * FROM leases WHERE created_by = $1 ORDER BY created_at DESC',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error finding leases by user ID:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const updates = [];
      const values = [];
      let valueCount = 1;

      // Build dynamic update query
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && key !== 'id') {
          updates.push(`${key} = $${valueCount}`);
          values.push(key === 'template_data' ? JSON.stringify(value) : value);
          valueCount++;
        }
      });

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(id);
      const result = await safeQuery(
        `UPDATE leases 
         SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${valueCount}
         RETURNING *`,
        values
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating lease:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await safeQuery(
        'DELETE FROM leases WHERE id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error deleting lease:', error);
      throw error;
    }
  }

  static async updateStatus(id, newStatus) {
    try {
      const validTransitions = {
        draft: ['pending'],
        pending: ['awaiting_tenant_signature', 'cancelled'],
        awaiting_tenant_signature: ['awaiting_landlord_signature', 'cancelled'],
        awaiting_landlord_signature: ['active', 'cancelled'],
        active: ['ended', 'cancelled'],
        ended: [],
        cancelled: []
      };

      // Get current lease status
      const lease = await this.findById(id);
      if (!lease) {
        throw new Error('Lease not found');
      }

      // Check if transition is valid
      const currentStatus = lease.status;
      if (!validTransitions[currentStatus]?.includes(newStatus)) {
        // Special case: allow direct transition to active from awaiting_landlord_signature
        if (currentStatus === 'awaiting_landlord_signature' && newStatus === 'active') {
          console.log('Allowing special transition from awaiting_landlord_signature to active');
        } else {
          throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
      }

      const result = await safeQuery(
        `UPDATE leases 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [newStatus, id]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error updating lease status:', error);
      throw error;
    }
  }

  static async join(leaseId, userId) {
    try {
      const result = await safeQuery(
        `INSERT INTO lease_tenants (lease_id, user_id)
         VALUES ($1, $2)
         RETURNING *`,
        [leaseId, userId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error joining lease:', error);
      throw error;
    }
  }

  static async getTenants(leaseId) {
    try {
      const result = await safeQuery(
        `SELECT u.* FROM users u
         JOIN lease_tenants lt ON u.id = lt.user_id
         WHERE lt.lease_id = $1`,
        [leaseId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting lease tenants:', error);
      throw error;
    }
  }

  static async findByRefCode(refCode) {
    const query = `
      SELECT l.*, 
             u1.name as landlord_name,
             COALESCE(u2.name, 'No tenant assigned') as tenant_name
      FROM leases l
      JOIN users u1 ON l.landlord_id = u1.id
      LEFT JOIN users u2 ON l.tenant_id = u2.id
      WHERE l.ref_code = $1 AND (l.status = 'draft' OR l.status = 'pending')
    `;
    const { rows } = await safeQuery(query, [refCode]);
    return rows[0];
  }

  static async joinLease(leaseId, tenantId) {
    // First check if the lease is available to join
    const checkQuery = `
      SELECT * FROM leases WHERE id = $1 AND (status = 'draft' OR status = 'pending')
    `;
    const checkResult = await safeQuery(checkQuery, [leaseId]);
    if (checkResult.rows.length === 0) {
      throw new Error('Lease not available for joining');
    }

    // Update the lease with tenant info
    const query = `
      UPDATE leases 
      SET tenant_id = $1, 
          status = 'pending',
          updated_at = NOW()
      WHERE id = $2 AND (status = 'draft' OR status = 'pending')
      RETURNING *
    `;
    const { rows } = await safeQuery(query, [tenantId, leaseId]);
    
    // Create lease event
    if (rows[0]) {
      await this.createEvent(leaseId, tenantId, 'tenant_joined', {});
    }
    
    return rows[0];
  }

  static async findByUserId(userId) {
    const query = `
      SELECT l.*, 
             u1.name as landlord_name, 
             COALESCE(u2.name, 'No tenant assigned') as tenant_name
      FROM leases l
      JOIN users u1 ON l.landlord_id = u1.id
      LEFT JOIN users u2 ON l.tenant_id = u2.id
      WHERE l.landlord_id = $1 OR l.tenant_id = $1
      ORDER BY l.created_at DESC
    `;
    const { rows } = await safeQuery(query, [userId]);
    return rows;
  }

  static async update(id, {
    property_name,
    property_address,
    monthly_rent,
    currency,
    start_date,
    end_date,
    template_data = {}
  }) {
    try {
      // Update the lease record
      const query = `
        UPDATE leases 
        SET property_name = $1,
            property_address = $2,
            monthly_rent = $3,
            currency = $4,
            start_date = $5,
            end_date = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `;
      
      const values = [
        property_name, 
        property_address,
        monthly_rent,
        currency,
        start_date,
        end_date,
        id
      ];
      
      const { rows } = await safeQuery(query, values);
      
      // Store template_data in lease_events table
      if (rows[0]) {
        try {
          await this.createEvent(id, rows[0].landlord_id, 'updated', {
            template_data: template_data
          });
        } catch (eventError) {
          console.error('Warning: Could not create lease update event:', eventError);
        }
      }
      
      // Add the template_data to the returned object for consistency with other methods
      const updatedLease = rows[0];
      if (updatedLease) {
        updatedLease.template_data = template_data;
      }
      
      return updatedLease;
    } catch (err) {
      console.error('Error in Lease.update:', err);
      throw err;
    }
  }

  static async findByUserId(userId) {
    const query = `
      SELECT l.*, 
             u1.name as landlord_name, 
             COALESCE(u2.name, 'No tenant assigned') as tenant_name
      FROM leases l
      JOIN users u1 ON l.landlord_id = u1.id
      LEFT JOIN users u2 ON l.tenant_id = u2.id
      WHERE l.landlord_id = $1 OR l.tenant_id = $1
      ORDER BY l.created_at DESC
    `;
    const { rows } = await safeQuery(query, [userId]);
    return rows;
  }

  static async updateStatus(id, status, userId) {
    // Valid lease status progression
    const validStatusTransitions = {
      'draft': ['pending', 'cancelled'],
      'pending': ['awaiting_landlord_signature', 'changes_requested', 'cancelled'],
      'awaiting_landlord_signature': ['awaiting_tenant_signature', 'active', 'cancelled'],
      'awaiting_tenant_signature': ['active', 'cancelled'],
      'changes_requested': ['pending', 'cancelled'],
      'active': ['completed', 'terminated'],
      'completed': [],
      'terminated': [],
      'cancelled': []
    };
    
    // Get current lease
    const currentLease = await this.findById(id);
    if (!currentLease) {
      throw new Error('Lease not found');
    }
    
    // Check if status transition is valid
    const currentStatus = currentLease.status;
    if (!validStatusTransitions[currentStatus]?.includes(status)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${status}`);
    }
    
    console.log(`Updating lease ${id} status from ${currentStatus} to ${status}`);
    
    try {
      // Update the lease status using our safe query helper
    const query = `
      UPDATE leases 
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
      
      const { rows } = await safeQuery(query, [status, id]);
      
      // Log the event
      if (rows[0]) {
        await this.createEvent(id, userId, 'status_changed', {
          from_status: currentStatus,
          to_status: status
        });
      }
      
      return rows[0];
    } catch (err) {
      console.error(`Failed to update lease ${id} status:`, err);
      throw err;
    }
  }
  
  // Add a method to create the lease_events table if it doesn't exist
  static async ensureLeaseEventsTable() {
    try {
      const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'lease_events'
        );
      `;
      
      const { rows } = await safeQuery(checkTableQuery);
      if (!rows[0].exists) {
        console.log('Creating lease_events table...');
        const createTableQuery = `
          CREATE TABLE lease_events (
            id SERIAL PRIMARY KEY,
            lease_id INTEGER NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
            user_id INTEGER NOT NULL REFERENCES users(id),
            event_type VARCHAR(50) NOT NULL,
            details JSONB,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
          );
        `;
        await safeQuery(createTableQuery);
        console.log('lease_events table created successfully');
      }
    } catch (err) {
      console.error('Error ensuring lease_events table exists:', err);
    }
  }

  // Call the method in the createEvent function to ensure the table exists
  static async createEvent(leaseId, userId, eventType, details = {}) {
    try {
      // Ensure the lease_events table exists
      await this.ensureLeaseEventsTable();
      
      const query = `
        INSERT INTO lease_events (lease_id, user_id, event_type, details, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING *
      `;
      const { rows } = await safeQuery(query, [leaseId, userId, eventType, JSON.stringify(details)]);
      return rows[0];
    } catch (err) {
      console.error('Error creating lease event:', err);
      throw err;
    }
  }
  
  // Get all events for a lease
  static async getLeaseEvents(leaseId) {
    const query = `
      SELECT le.*, u.name as user_name
      FROM lease_events le
      JOIN users u ON le.user_id = u.id
      WHERE le.lease_id = $1
      ORDER BY le.created_at ASC
    `;
    const { rows } = await safeQuery(query, [leaseId]);
    return rows;
  }
  
  // Request changes to a lease
  static async requestChanges(leaseId, userId, requestedChanges, message) {
    // Create change request
    const query = `
      INSERT INTO lease_change_requests (
        lease_id, requested_by, status, requested_changes, response_message, created_at
      )
      VALUES ($1, $2, 'pending', $3, $4, NOW())
      RETURNING *
    `;
    const { rows } = await safeQuery(query, [
      leaseId, userId, JSON.stringify(requestedChanges), message
    ]);
    
    // Create lease event
    if (rows[0]) {
      await this.createEvent(leaseId, userId, 'changes_requested', {
        change_request_id: rows[0].id,
        message
      });
      
      // Update lease status
      await this.updateStatus(leaseId, 'changes_requested', userId);
    }
    
    return rows[0];
  }
  
  // Respond to change request
  static async respondToChangeRequest(requestId, userId, accepted, responseMessage) {
    // Get the change request
    const getQuery = `
      SELECT * FROM lease_change_requests WHERE id = $1
    `;
    const requestResult = await safeQuery(getQuery, [requestId]);
    if (requestResult.rows.length === 0) {
      throw new Error('Change request not found');
    }
    
    const changeRequest = requestResult.rows[0];
    const leaseId = changeRequest.lease_id;
    
    // Update the change request
    const updateQuery = `
      UPDATE lease_change_requests
      SET status = $1, response_message = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const status = accepted ? 'accepted' : 'rejected';
    const { rows } = await safeQuery(updateQuery, [status, responseMessage, requestId]);
    
    // Create lease event
    if (rows[0]) {
      await this.createEvent(leaseId, userId, 'change_request_' + status, {
        change_request_id: requestId,
        message: responseMessage
      });
      
      // If accepted, update lease status back to pending
      if (accepted) {
        // Update the lease with the requested changes
        // This would need to be implemented based on what changes can be made
        // For now, we'll just update the lease status
        await this.updateStatus(leaseId, 'pending', userId);
      }
    }
    
    return rows[0];
  }
  
  // Sign a lease
  static async signLease(leaseId, userId, signatureData, ipAddress, userAgent) {
    // Create signature record
    const query = `
      INSERT INTO lease_signatures (lease_id, user_id, signature_data, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const { rows } = await safeQuery(query, [leaseId, userId, signatureData, ipAddress, userAgent]);
    
    // Get lease to check current status and roles
    const lease = await this.findById(leaseId);
    if (!lease) {
      throw new Error('Lease not found');
    }
    
    // Create lease event
    await this.createEvent(leaseId, userId, 'lease_signed', {
      signature_id: rows[0].id
    });
    
    // Update lease status based on who signed
    if (userId === lease.landlord_id) {
      // If landlord signed, move to awaiting tenant signature
      if (lease.status === 'awaiting_landlord_signature') {
        await this.updateStatus(leaseId, 'awaiting_tenant_signature', userId);
      }
    } else if (userId === lease.tenant_id) {
      // If tenant signed, move to awaiting landlord signature
      if (lease.status === 'pending') {
        await this.updateStatus(leaseId, 'awaiting_landlord_signature', userId);
      } 
      // If tenant is the last to sign, activate the lease
      else if (lease.status === 'awaiting_tenant_signature') {
        await this.updateStatus(leaseId, 'active', userId);
      }
    }
    
    return rows[0];
  }
  
  // Get all change requests for a lease
  static async getChangeRequests(leaseId) {
    const query = `
      SELECT cr.*, u.name as requested_by_name
      FROM lease_change_requests cr
      JOIN users u ON cr.requested_by = u.id
      WHERE cr.lease_id = $1
      ORDER BY cr.created_at DESC
    `;
    const { rows } = await safeQuery(query, [leaseId]);
    return rows;
  }
  
  // Check if a lease has been signed by a user
  static async checkSignature(leaseId, userId) {
    const query = `
      SELECT * FROM lease_signatures
      WHERE lease_id = $1 AND user_id = $2
    `;
    const { rows } = await safeQuery(query, [leaseId, userId]);
    return rows.length > 0;
  }
}

module.exports = Lease;