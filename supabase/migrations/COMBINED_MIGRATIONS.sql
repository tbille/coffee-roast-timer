-- COMBINED MIGRATIONS FOR CUPPING NOTES FEATURE
-- Run this entire file in Supabase SQL Editor
-- https://supabase.com/dashboard/project/iimoeootixsvkkhqfrhi/sql/new

-- ============================================================================
-- MIGRATION 1: Add cupping notes columns and photo storage
-- ============================================================================

BEGIN;

-- Add cupping-related columns to roast_profiles
ALTER TABLE roast_profiles 
ADD COLUMN IF NOT EXISTS cupping_score INTEGER CHECK (cupping_score >= 0 AND cupping_score <= 100),
ADD COLUMN IF NOT EXISTS cupping_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rest_days INTEGER CHECK (rest_days >= 0),
ADD COLUMN IF NOT EXISTS flavor_notes TEXT,
ADD COLUMN IF NOT EXISTS flavor_tags TEXT[],
ADD COLUMN IF NOT EXISTS brew_method TEXT,
ADD COLUMN IF NOT EXISTS roasted_bean_photo_url TEXT;

-- Create index on flavor_tags for efficient searching
CREATE INDEX IF NOT EXISTS idx_roast_profiles_flavor_tags 
ON roast_profiles USING GIN (flavor_tags);

-- Create storage bucket for roast photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'roast-photos', 
  'roast-photos', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

-- RLS: Anyone can view photos
DROP POLICY IF EXISTS "Anyone can view roast photos" ON storage.objects;
CREATE POLICY "Anyone can view roast photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'roast-photos');

-- RLS: Users can upload photos to their own folder
DROP POLICY IF EXISTS "Users can upload roast photos" ON storage.objects;
CREATE POLICY "Users can upload roast photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'roast-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Users can update their own photos
DROP POLICY IF EXISTS "Users can update roast photos" ON storage.objects;
CREATE POLICY "Users can update roast photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'roast-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS: Users can delete their own photos
DROP POLICY IF EXISTS "Users can delete roast photos" ON storage.objects;
CREATE POLICY "Users can delete roast photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'roast-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

COMMIT;

-- ============================================================================
-- MIGRATION 2: Add environmental data columns
-- ============================================================================

BEGIN;

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

COMMIT;

-- ============================================================================
-- MIGRATION 3: Simplify environmental data (remove structured fields)
-- ============================================================================

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

-- ============================================================================
-- MIGRATION 4: Fix RLS policy for updates (add WITH CHECK clause)
-- ============================================================================

BEGIN;

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own roast profiles" ON public.roast_profiles;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "Users can update their own roast profiles" 
ON public.roast_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES (optional - run these to verify)
-- ============================================================================

-- Check that new columns exist
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'roast_profiles' 
-- AND column_name IN ('cupping_score', 'cupping_date', 'flavor_tags', 'brew_method', 'roasted_bean_photo_url', 'environmental_notes')
-- ORDER BY column_name;

-- Check that storage bucket exists
-- SELECT * FROM storage.buckets WHERE id = 'roast-photos';

-- Check RLS policies
-- SELECT * FROM pg_policies WHERE tablename = 'roast_profiles' AND policyname LIKE '%update%';

-- ============================================================================
-- MIGRATIONS COMPLETE! 
-- ============================================================================
-- You can now test the cupping notes feature in your app
