-- Migration: Simplify environmental data tracking
-- Remove structured fields in favor of free-form text
-- Created: 2026-02-15

BEGIN;

-- Drop structured environmental columns
ALTER TABLE roast_profiles 
DROP COLUMN IF EXISTS ambient_temperature,
DROP COLUMN IF EXISTS ambient_temp_unit,
DROP COLUMN IF EXISTS ambient_humidity;

-- Keep environmental_notes (already added in previous migration)
-- Add constraint for reasonable length
ALTER TABLE roast_profiles 
DROP CONSTRAINT IF EXISTS environmental_notes_length;

ALTER TABLE roast_profiles 
ADD CONSTRAINT environmental_notes_length CHECK (
  char_length(environmental_notes) <= 200
);

COMMIT;
