# Database Migration Instructions

## ⚠️ IMPORTANT: You must run these migrations before testing the cupping features!

The photo upload feature requires the `roast-photos` storage bucket to exist in Supabase. Follow these steps:

---

## Option 1: Using Supabase Dashboard (Recommended)

### Step 1: Apply SQL Migrations

1. Go to: https://supabase.com/dashboard/project/iimoeootixsvkkhqfrhi/sql/new

2. **Run Migration 1** - Add cupping columns and create storage bucket:
   - Copy the entire contents of: `supabase/migrations/20260215204801_add_cupping_notes.sql`
   - Paste into the SQL Editor
   - Click "Run"

3. **Run Migration 2** - Add environmental data columns:
   - Copy the entire contents of: `supabase/migrations/20260215204802_add_environmental_data.sql`
   - Paste into the SQL Editor
   - Click "Run"

4. **Run Migration 3** - Simplify environmental data:
   - Copy the entire contents of: `supabase/migrations/20260215210000_simplify_environmental_data.sql`
   - Paste into the SQL Editor
   - Click "Run"

5. **Run Migration 4** - Fix RLS policy for updates:
   - Copy the entire contents of: `supabase/migrations/20260215211500_fix_roast_profiles_rls.sql`
   - Paste into the SQL Editor
   - Click "Run"

### Step 2: Verify Storage Bucket

1. Go to: https://supabase.com/dashboard/project/iimoeootixsvkkhqfrhi/storage/buckets

2. Verify that `roast-photos` bucket exists

3. If it doesn't exist, create it manually:
   - Click "New bucket"
   - Name: `roast-photos`
   - Public: ✅ (checked)
   - File size limit: 5MB (5242880 bytes)
   - Allowed MIME types: `image/jpeg, image/png, image/webp, image/heic`

### Step 3: Verify RLS Policies

1. Go to: https://supabase.com/dashboard/project/iimoeootixsvkkhqfrhi/storage/policies

2. Verify these policies exist for `roast-photos`:
   - ✅ "Anyone can view roast photos" (SELECT)
   - ✅ "Users can upload roast photos" (INSERT)
   - ✅ "Users can update roast photos" (UPDATE)
   - ✅ "Users can delete roast photos" (DELETE)

---

## Option 2: Using Supabase CLI

```bash
# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref iimoeootixsvkkhqfrhi

# Push migrations
npx supabase db push

# Regenerate types (optional but recommended)
npx supabase gen types typescript --project-id iimoeootixsvkkhqfrhi > src/integrations/supabase/types.ts
```

---

## Verification

After running migrations, test the photo upload:

1. Start dev server: `npm run dev`
2. Navigate to a roast profile details page
3. Click "Add Notes" 
4. Try uploading the test image: `roasttest.jpg`
5. You should see:
   - Upload progress indicator
   - Success toast: "Photo uploaded"
   - Image preview in the form

---

## Troubleshooting

### Error: "Please upload a photo" or upload fails

**Cause:** Storage bucket doesn't exist or RLS policies are incorrect

**Fix:** 
1. Verify bucket exists in Supabase Dashboard > Storage
2. Check RLS policies are configured correctly
3. Try manually creating the bucket if migration failed

### Error: "User not authenticated"

**Cause:** Not logged in or session expired

**Fix:**
1. Sign in to the app
2. Refresh the page

### Error: "Invalid photo URL"

**Cause:** Trying to delete a photo with malformed URL

**Fix:**
1. Clear the photo URL field
2. Try uploading again

---

## Migration SQL Files

All migration files are located in: `supabase/migrations/`

- `20260215204801_add_cupping_notes.sql` - Creates cupping columns + storage bucket
- `20260215204802_add_environmental_data.sql` - Adds environmental columns
- `20260215210000_simplify_environmental_data.sql` - Removes structured env fields
- `20260215211500_fix_roast_profiles_rls.sql` - Fixes RLS policy for cupping notes updates
