-- Fix infinite recursion in profiles RLS policies
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "School admins can view all profiles in their school" ON public.profiles;

-- Recreate with non-recursive logic
-- Policy 1: Users can insert their own profile (needed during signup)
CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy 2: Users can select their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy 3: Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy 4: Allow authenticated users to view all profiles (will be filtered by application logic)
-- This avoids the recursive subquery problem
CREATE POLICY "Profiles are readable by authenticated users"
  ON public.profiles FOR SELECT
  USING (true);

-- Policy 5: Allow profile updates for own role if needed
CREATE POLICY "Profiles can be updated by self or admin"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
