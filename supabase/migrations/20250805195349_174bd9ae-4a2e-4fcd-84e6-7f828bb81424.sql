-- Update RLS policies to allow public read access to roast profiles
-- while keeping write operations restricted to owners

-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view their own roast profiles" ON public.roast_profiles;

-- Create new policy that allows public read access
CREATE POLICY "Anyone can view roast profiles" 
ON public.roast_profiles 
FOR SELECT 
USING (true);

-- Keep the existing write policies (INSERT, UPDATE, DELETE) unchanged
-- These will still require authentication and ownership