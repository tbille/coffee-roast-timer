-- Add roast process field to roast profiles table
ALTER TABLE public.roast_profiles 
ADD COLUMN roast_process TEXT;