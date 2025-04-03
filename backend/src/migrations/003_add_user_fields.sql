DO $$
BEGIN
    -- Add preferred_name column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='preferred_name') THEN
        ALTER TABLE users ADD COLUMN preferred_name VARCHAR(255);
    END IF;

    -- Add address column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='address') THEN
        ALTER TABLE users ADD COLUMN address TEXT;
    END IF;

    -- Add emergency_contact column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='emergency_contact') THEN
        ALTER TABLE users ADD COLUMN emergency_contact TEXT;
    END IF;

    -- Add education_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='education_status') THEN
        ALTER TABLE users ADD COLUMN education_status VARCHAR(50);
    END IF;

    -- Add employment_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='employment_status') THEN
        ALTER TABLE users ADD COLUMN employment_status VARCHAR(50);
    END IF;

    -- Add date_of_birth column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='users' AND column_name='date_of_birth') THEN
        ALTER TABLE users ADD COLUMN date_of_birth DATE;
    END IF;
END $$; 