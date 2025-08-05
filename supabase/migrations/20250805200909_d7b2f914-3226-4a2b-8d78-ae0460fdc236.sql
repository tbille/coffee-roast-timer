-- First, let's check if there are any existing foreign key constraints and drop them if needed
ALTER TABLE roast_profiles DROP CONSTRAINT IF EXISTS roast_profiles_user_id_fkey;

-- Now add the proper foreign key constraint
ALTER TABLE roast_profiles 
ADD CONSTRAINT roast_profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;