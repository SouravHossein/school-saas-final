-- Create schools table (tenants)
CREATE TABLE IF NOT EXISTS public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subdomain TEXT UNIQUE NOT NULL,
  custom_domain TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schools (users can see the school they belong to)
CREATE POLICY "Users can view their school"
  ON public.schools FOR SELECT
  USING (
    id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'student',
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT valid_role CHECK (role IN ('super_admin', 'school_admin', 'teacher', 'student', 'parent'))
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "School admins can view all profiles in their school"
  ON public.profiles FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Create classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Users can view classes from their school"
  ON public.classes FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "School admins and teachers can create classes"
  ON public.classes FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

CREATE POLICY "School admins and class creator can update classes"
  ON public.classes FOR UPDATE
  USING (
    created_by = auth.uid() OR
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "School admins and class creator can delete classes"
  ON public.classes FOR DELETE
  USING (
    created_by = auth.uid() OR
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Create sections table
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sections
CREATE POLICY "Users can view sections from their school"
  ON public.sections FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "School admins and teachers can create sections"
  ON public.sections FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

CREATE POLICY "School admins and section creator can update sections"
  ON public.sections FOR UPDATE
  USING (
    created_by = auth.uid() OR
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "School admins and section creator can delete sections"
  ON public.sections FOR DELETE
  USING (
    created_by = auth.uid() OR
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Create indexes for better query performance
CREATE INDEX idx_profiles_school_id ON public.profiles(school_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_classes_school_id ON public.classes(school_id);
CREATE INDEX idx_classes_created_by ON public.classes(created_by);
CREATE INDEX idx_sections_class_id ON public.sections(class_id);
CREATE INDEX idx_sections_school_id ON public.sections(school_id);
CREATE INDEX idx_sections_created_by ON public.sections(created_by);
CREATE INDEX idx_schools_subdomain ON public.schools(subdomain);
