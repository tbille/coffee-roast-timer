-- Create a table for roast profile likes
CREATE TABLE public.roast_profile_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  roast_profile_id uuid NOT NULL REFERENCES roast_profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Ensure a user can only like a profile once
  UNIQUE(user_id, roast_profile_id)
);

-- Enable RLS
ALTER TABLE public.roast_profile_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for likes
CREATE POLICY "Anyone can view likes" 
ON public.roast_profile_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own likes" 
ON public.roast_profile_likes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
ON public.roast_profile_likes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create an index for better performance when querying likes
CREATE INDEX idx_roast_profile_likes_profile_id ON public.roast_profile_likes(roast_profile_id);
CREATE INDEX idx_roast_profile_likes_user_id ON public.roast_profile_likes(user_id);