-- Migration: Add cupping notes and photo storage for roast profiles
-- Created: 2026-02-15

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
