-- Add user_id column to students table for direct student account linking
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for fast user lookups in student portal
CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
