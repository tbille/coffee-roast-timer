-- Migration: Add environmental data tracking to roast profiles
-- Created: 2026-02-15

-- Add environmental data columns to roast_profiles
ALTER TABLE roast_profiles 
ADD COLUMN IF NOT EXISTS ambient_temperature DECIMAL,
ADD COLUMN IF NOT EXISTS ambient_temp_unit TEXT CHECK (ambient_temp_unit IN ('C', 'F')),
ADD COLUMN IF NOT EXISTS ambient_humidity INTEGER CHECK (ambient_humidity >= 0 AND ambient_humidity <= 100),
ADD COLUMN IF NOT EXISTS environmental_notes TEXT;

-- Set default ambient_temp_unit to match temperature_unit for existing records
UPDATE roast_profiles 
SET ambient_temp_unit = temperature_unit 
WHERE ambient_temp_unit IS NULL;
