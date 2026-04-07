-- Add user_id column to guardians table if it doesn't exist
ALTER TABLE public.guardians ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for guardians to support user_id access
CREATE POLICY "Guardians can view their own profile" ON public.guardians
  FOR SELECT USING (user_id = auth.uid());

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_guardians_user_id ON public.guardians(user_id);
