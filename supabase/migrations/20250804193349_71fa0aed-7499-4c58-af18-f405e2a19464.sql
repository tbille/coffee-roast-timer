-- Create roast profiles table
CREATE TABLE public.roast_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  beans_name TEXT NOT NULL,
  origin TEXT,
  farm_name TEXT,
  initial_weight DECIMAL,
  final_weight DECIMAL,
  duration_seconds INTEGER NOT NULL,
  temperature_data JSONB NOT NULL DEFAULT '[]',
  crack_events JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.roast_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own roast profiles" 
ON public.roast_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own roast profiles" 
ON public.roast_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roast profiles" 
ON public.roast_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roast profiles" 
ON public.roast_profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_roast_profiles_updated_at
BEFORE UPDATE ON public.roast_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();