-- Add TC ID column to users table
ALTER TABLE users ADD COLUMN tc_id VARCHAR(50);

-- Create index for tc_id
CREATE INDEX idx_users_tc_id ON users(tc_id); 