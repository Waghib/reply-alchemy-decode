
-- Create a table to store analyzed messages and their AI responses
CREATE TABLE public.analyzed_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_message TEXT NOT NULL,
  detected_intent TEXT,
  suggested_reply TEXT,
  selected_tone TEXT DEFAULT 'friendly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.analyzed_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own analyzed messages
CREATE POLICY "select_own_analyzed_messages" ON public.analyzed_messages
FOR SELECT
USING (user_id = auth.uid());

-- Create policy for users to insert their own analyzed messages
CREATE POLICY "insert_own_analyzed_messages" ON public.analyzed_messages
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Create policy for users to update their own analyzed messages
CREATE POLICY "update_own_analyzed_messages" ON public.analyzed_messages
FOR UPDATE
USING (user_id = auth.uid());

-- Create policy for users to delete their own analyzed messages
CREATE POLICY "delete_own_analyzed_messages" ON public.analyzed_messages
FOR DELETE
USING (user_id = auth.uid());
