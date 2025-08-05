-- First, create missing profile records for any users that have roast profiles but no profile entry
INSERT INTO profiles (id, username, created_at, updated_at)
SELECT DISTINCT user_id, NULL, now(), now()
FROM roast_profiles 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Now add the proper foreign key constraint
ALTER TABLE roast_profiles 
ADD CONSTRAINT roast_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;