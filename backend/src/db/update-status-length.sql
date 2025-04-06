-- Update leases table schema to fix the status field length
ALTER TABLE leases ALTER COLUMN status TYPE VARCHAR(30); 