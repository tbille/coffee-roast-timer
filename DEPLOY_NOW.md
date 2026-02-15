# 🚀 Deploy Cupping Notes Feature - Quick Guide

## Step 1: Run Database Migrations

1. **Open Supabase SQL Editor:**
   👉 https://supabase.com/dashboard/project/iimoeootixsvkkhqfrhi/sql/new

2. **Copy the combined migrations file:**
   - Open: `supabase/migrations/COMBINED_MIGRATIONS.sql`
   - Select all (Cmd+A / Ctrl+A)
   - Copy (Cmd+C / Ctrl+C)

3. **Run in SQL Editor:**
   - Paste into Supabase SQL Editor
   - Click "Run" button
   - Wait for "Success" message

## Step 2: Verify Migrations

Check that everything was created:

### A. Verify Columns
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'roast_profiles' 
AND column_name IN ('cupping_score', 'cupping_date', 'flavor_tags', 'brew_method', 'roasted_bean_photo_url', 'environmental_notes')
ORDER BY column_name;
```

You should see 6 columns.

### B. Verify Storage Bucket
Go to: https://supabase.com/dashboard/project/iimoeootixsvkkhqfrhi/storage/buckets

You should see `roast-photos` bucket listed.

### C. Verify RLS Policy
```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'roast_profiles' 
AND policyname LIKE '%update%';
```

Should show the updated policy with both USING and WITH CHECK.

## Step 3: Test the Feature

1. **Refresh your app** (hard refresh: Cmd+Shift+R or Ctrl+Shift+R)

2. **Navigate to any roast profile details page**

3. **Click "Add Notes" button**

4. **Test the features:**
   - ✅ Adjust cupping score slider (0-100)
   - ✅ Upload a photo (try `roasttest.jpg`)
   - ✅ Select flavor tags (max 8)
   - ✅ Choose brew method
   - ✅ Add tasting notes
   - ✅ Click "Save Notes"

5. **Verify display:**
   - Photo should appear
   - Score should show as "85/100"
   - Flavor tags as amber badges
   - Notes should display correctly

## 🎉 Success!

If everything works, you've successfully deployed the cupping notes feature!

## 🐛 Troubleshooting

### Photo upload fails
- Check browser console for errors
- Verify `roast-photos` bucket exists in Supabase Storage
- Check that you're logged in

### "Column not found" error
- Migrations didn't run successfully
- Re-run the COMBINED_MIGRATIONS.sql file
- Check for any error messages in SQL Editor

### RLS error when saving
- Verify you're logged in as the profile owner
- Check that the RLS policy was updated (Step 2C)

---

**Need help?** Check the browser console (F12) for detailed error messages.
