-- Add new columns to leases table
ALTER TABLE leases
ADD COLUMN property_name VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN currency VARCHAR(3) NOT NULL DEFAULT 'USD',
ADD COLUMN ref_code VARCHAR(8) NOT NULL DEFAULT '';

-- Update existing rows to have property_name same as property_address
UPDATE leases SET property_name = property_address WHERE property_name = '';

-- Add unique constraint to ref_code
ALTER TABLE leases ADD CONSTRAINT leases_ref_code_unique UNIQUE (ref_code); 