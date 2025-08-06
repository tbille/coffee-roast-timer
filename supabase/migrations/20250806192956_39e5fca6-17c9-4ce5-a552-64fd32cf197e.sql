-- Add temperature unit field to roast_profiles table
ALTER TABLE public.roast_profiles 
ADD COLUMN temperature_unit text NOT NULL DEFAULT 'C' CHECK (temperature_unit IN ('C', 'F'));

-- Add default temperature unit preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN default_temperature_unit text NOT NULL DEFAULT 'C' CHECK (default_temperature_unit IN ('C', 'F'));