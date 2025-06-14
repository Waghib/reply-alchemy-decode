
-- Create a table to track free usage per user
CREATE TABLE public.free_usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.free_usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own usage
CREATE POLICY "Users can view their own free usage" 
  ON public.free_usage_tracking 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to insert their own usage
CREATE POLICY "Users can create their own free usage" 
  ON public.free_usage_tracking 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to update their own usage
CREATE POLICY "Users can update their own free usage" 
  ON public.free_usage_tracking 
  FOR UPDATE 
  USING (auth.uid() = user_id);
