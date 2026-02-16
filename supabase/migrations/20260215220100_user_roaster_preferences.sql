-- Migration: Create user_roaster_preferences table
-- Date: 2026-02-15
-- Purpose: Track user's roaster equipment and usage patterns

-- Create user_roaster_preferences table
CREATE TABLE IF NOT EXISTS user_roaster_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  roaster_type TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  last_used_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Ensure user can only have one preference entry per roaster type
  UNIQUE(user_id, roaster_type)
);

-- Create indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_roaster_prefs_user_id 
ON user_roaster_preferences(user_id);

-- Create index for primary roaster queries
CREATE INDEX IF NOT EXISTS idx_user_roaster_prefs_primary 
ON user_roaster_preferences(user_id, is_primary) 
WHERE is_primary = true;

-- Enable Row Level Security
ALTER TABLE user_roaster_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences

-- Policy: Users can view their own roaster preferences
CREATE POLICY "Users can view own roaster preferences"
ON user_roaster_preferences
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own roaster preferences
CREATE POLICY "Users can insert own roaster preferences"
ON user_roaster_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own roaster preferences
CREATE POLICY "Users can update own roaster preferences"
ON user_roaster_preferences
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own roaster preferences
CREATE POLICY "Users can delete own roaster preferences"
ON user_roaster_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_roaster_preferences IS 'Tracks which roasters each user owns/uses and their usage patterns';
COMMENT ON COLUMN user_roaster_preferences.is_primary IS 'User''s primary/default roaster for new roasts';
COMMENT ON COLUMN user_roaster_preferences.usage_count IS 'Number of roasts completed with this roaster';
COMMENT ON COLUMN user_roaster_preferences.last_used_at IS 'Timestamp of most recent roast with this roaster';
