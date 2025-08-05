-- Add a coffee_roaster column to the roast_profiles table
ALTER TABLE public.roast_profiles 
ADD COLUMN coffee_roaster text;