-- Initialize database for Vehicle Tracker
-- This file is executed when PostgreSQL container starts for the first time

-- Create database if not exists (already created by POSTGRES_DB env var)
-- But we can add any additional setup here

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Vehicle Tracker database initialized successfully!';
END $$;
