-- First, create missing profile records for any users that have roast profiles but no profile entry
INSERT INTO profiles (id, username, created_at, updated_at)
SELECT DISTINCT user_id, NULL, now(), now()
FROM roast_profiles 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Now add the proper foreign key constraint (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'roast_profiles_user_id_fkey'
  ) THEN
    ALTER TABLE roast_profiles 
    ADD CONSTRAINT roast_profiles_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;