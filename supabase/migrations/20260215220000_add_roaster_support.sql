-- Migration: Add roaster_type and roaster_data to roast_profiles
-- Date: 2026-02-15
-- Purpose: Enable multi-roaster support

-- Add new columns to roast_profiles table
ALTER TABLE roast_profiles
ADD COLUMN IF NOT EXISTS roaster_type TEXT DEFAULT 'gene-cbr-101',
ADD COLUMN IF NOT EXISTS roaster_data JSONB DEFAULT '{}'::jsonb;

-- Add check constraint for valid roaster types
ALTER TABLE roast_profiles
ADD CONSTRAINT valid_roaster_type 
CHECK (roaster_type IN (
  'gene-cbr-101',
  'behmor-2000ab',
  'freshroast-sr540',
  'freshroast-sr800',
  'kaldi-wide',
  'kaldi-fortis',
  'kaldi-mini',
  'hottop-kn8828',
  'popcorn-popper',
  'other-manual',
  'other-electric',
  'custom'
));

-- Create index for filtering by roaster type (common query pattern)
CREATE INDEX IF NOT EXISTS idx_roast_profiles_roaster_type 
ON roast_profiles(roaster_type);

-- Create GIN index for roaster_data JSONB queries
CREATE INDEX IF NOT EXISTS idx_roast_profiles_roaster_data 
ON roast_profiles USING GIN (roaster_data);

-- Add comment for documentation
COMMENT ON COLUMN roast_profiles.roaster_type IS 'Structured roaster type identifier for multi-roaster support';
COMMENT ON COLUMN roast_profiles.roaster_data IS 'Mode-specific roast data in JSONB format (e.g., Behmor profile/extensions, FreshRoast heat/fan settings)';
