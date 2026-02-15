-- QUICK FIX: Make roast-photos bucket public
-- Run this in Supabase SQL Editor if images aren't loading

-- Ensure bucket is public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'roast-photos';

-- Verify it worked
SELECT id, name, public FROM storage.buckets WHERE id = 'roast-photos';
