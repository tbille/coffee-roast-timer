-- Fix RLS policy for roast_profiles to ensure cupping notes can be updated
-- The UPDATE policy needs both USING and WITH CHECK clauses

BEGIN;

-- Drop the existing UPDATE policy
DROP POLICY IF EXISTS "Users can update their own roast profiles" ON public.roast_profiles;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "Users can update their own roast profiles" 
ON public.roast_profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMIT;
