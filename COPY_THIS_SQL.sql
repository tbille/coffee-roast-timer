-- COMBINED MIGRATIONS FOR CUPPING NOTES FEATURE
-- Copy this entire file and paste in Supabase SQL Editor

BEGIN;

-- Add cupping-related columns to roast_profiles
ALTER TABLE roast_profiles 
ADD COLUMN IF NOT EXISTS cupping_score INTEGER CHECK (cupping_score >= 0 AND cupping_score <= 100),
ADD COLUMN IF NOT EXISTS cupping_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rest_days INTEGER CHECK (rest_days >= 0),
ADD COLUMN IF NOT EXISTS flavor_notes TEXT,
ADD COLUMN IF NOT EXISTS flavor_tags TEXT[],
ADD COLUMN IF NOT EXISTS brew_method TEXT,
ADD COLUMN IF NOT EXISTS roasted_bean_photo_url TEXT,
ADD COLUMN IF NOT EXISTS environmental_notes TEXT;

-- Create index on flavor_tags for efficient searching
CREATE INDEX IF NOT EXISTS idx_roast_profiles_flavor_tags 
ON roast_profiles USING GIN (flavor_tags);

-- Create storage bucket for roast photos (PUBLIC access)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'roast-photos', 
  'roast-photos', 
  true,  -- IMPORTANT: Must be true for public read access
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- RLS Policies for storage bucket
DROP POLICY IF EXISTS "Anyone can view roast photos" ON storage.objects;
CREATE POLICY "Anyone can view roast photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'roast-photos');

DROP POLICY IF EXISTS "Users can upload roast photos" ON storage.objects;
CREATE POLICY "Users can upload roast photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'roast-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete roast photos" ON storage.objects;
CREATE POLICY "Users can delete roast photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'roast-photos' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Fix RLS UPDATE policy
DROP POLICY IF EXISTS "Users can update their own roast profiles" ON public.roast_profiles;
CREATE POLICY "Users can update their own roast profiles" 
ON public.roast_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMIT;
