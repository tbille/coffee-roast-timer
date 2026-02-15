# 🚀 Run Database Migrations - Step by Step

## Quick Steps

1. Open Supabase SQL Editor
2. Copy the SQL below
3. Paste and click "Run"
4. Done!

---

## Step 1: Open Supabase SQL Editor

Click this link (opens in new tab):
👉 https://supabase.com/dashboard/project/iimoeootixsvkkhqfrhi/sql/new

---

## Step 2: Copy This SQL

Select all the SQL below (click in the box, then Cmd+A or Ctrl+A, then Cmd+C or Ctrl+C):

```sql
-- COMBINED MIGRATIONS FOR CUPPING NOTES FEATURE
-- This adds all the columns needed for the cupping/tasting notes feature

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

-- Create storage bucket for roast photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'roast-photos', 
  'roast-photos', 
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO NOTHING;

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
```

---

## Step 3: Paste in SQL Editor

1. In the Supabase SQL Editor
2. Paste (Cmd+V or Ctrl+V)
3. Click the green "Run" button (or press Cmd+Enter / Ctrl+Enter)

---

## Step 4: Verify Success

You should see:
✅ "Success. No rows returned"

This means all columns and policies were created!

---

## Verify It Worked

Run this query to check the new columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'roast_profiles' 
AND column_name IN (
  'cupping_score', 
  'cupping_date', 
  'flavor_tags', 
  'brew_method', 
  'roasted_bean_photo_url', 
  'environmental_notes'
)
ORDER BY column_name;
```

You should see 6 rows returned.

---

## Check Storage Bucket

Go to: https://supabase.com/dashboard/project/iimoeootixsvkkhqfrhi/storage/buckets

You should see `roast-photos` in the list.

---

## 🎉 Done!

Now refresh your app and the cupping notes feature will work!

---

## Troubleshooting

**Error: "column already exists"**
- That's OK! It means some migrations already ran
- The migration uses `IF NOT EXISTS` so it's safe to run multiple times

**Error: "permission denied"**
- Make sure you're logged into Supabase with the correct account
- You need to be the project owner

**Error: "bucket already exists"**
- That's OK! The `ON CONFLICT DO NOTHING` handles this
- Your bucket is already created
