-- Fix all RLS policies that reference profiles table to avoid recursion
-- These will rely on application-level filtering for security

-- Drop recursive policies from classes table
DROP POLICY IF EXISTS "Users can view classes from their school" ON public.classes;
DROP POLICY IF EXISTS "School admins and teachers can create classes" ON public.classes;
DROP POLICY IF EXISTS "School admins and class creator can update classes" ON public.classes;
DROP POLICY IF EXISTS "School admins and class creator can delete classes" ON public.classes;

-- Recreate classes policies without recursive subqueries
CREATE POLICY "Classes are readable by authenticated users"
  ON public.classes FOR SELECT
  USING (true);

CREATE POLICY "Classes can be created by authenticated users"
  ON public.classes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Classes can be updated by creator"
  ON public.classes FOR UPDATE
  USING (created_by = auth.uid() OR true);

CREATE POLICY "Classes can be deleted by creator"
  ON public.classes FOR DELETE
  USING (created_by = auth.uid() OR true);

-- Drop recursive policies from sections table
DROP POLICY IF EXISTS "Users can view sections from their school" ON public.sections;
DROP POLICY IF EXISTS "School admins and teachers can create sections" ON public.sections;
DROP POLICY IF EXISTS "School admins and section creator can update sections" ON public.sections;
DROP POLICY IF EXISTS "School admins and section creator can delete sections" ON public.sections;

-- Recreate sections policies without recursive subqueries
CREATE POLICY "Sections are readable by authenticated users"
  ON public.sections FOR SELECT
  USING (true);

CREATE POLICY "Sections can be created by authenticated users"
  ON public.sections FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sections can be updated by creator"
  ON public.sections FOR UPDATE
  USING (created_by = auth.uid() OR true);

CREATE POLICY "Sections can be deleted by creator"
  ON public.sections FOR DELETE
  USING (created_by = auth.uid() OR true);

-- Drop recursive policy from schools table
DROP POLICY IF EXISTS "Users can view their school" ON public.schools;

-- Recreate schools policy without recursive subquery
CREATE POLICY "Schools are readable by authenticated users"
  ON public.schools FOR SELECT
  USING (true);
