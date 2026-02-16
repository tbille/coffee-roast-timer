-- Migration: Add roaster settings, milestones, and development stats
-- Date: 2026-02-16
-- Purpose: Enable detailed roast replication guidance

-- Add new columns to roast_profiles table
ALTER TABLE roast_profiles
ADD COLUMN IF NOT EXISTS roaster_settings JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS milestones JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS development_stats JSONB DEFAULT '{}'::jsonb;

-- Create GIN indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_roast_profiles_roaster_settings 
ON roast_profiles USING GIN (roaster_settings);

CREATE INDEX IF NOT EXISTS idx_roast_profiles_milestones 
ON roast_profiles USING GIN (milestones);

-- Add comments for documentation
COMMENT ON COLUMN roast_profiles.roaster_settings IS 'Structured roaster-specific settings (temperature schedules, profile configs, control schedules, starting conditions)';
COMMENT ON COLUMN roast_profiles.milestones IS 'Array of time-stamped roast milestones with sensory cues (yellowing, first crack, second crack, etc.)';
COMMENT ON COLUMN roast_profiles.development_stats IS 'Development phase statistics (first crack time, development time, development ratio)';
