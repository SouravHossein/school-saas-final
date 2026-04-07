-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  roll_number TEXT,
  blood_group TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated', 'transferred')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(school_id, roll_number)
);

-- Enable RLS on students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS Policies for students
-- Users in the school can view students in their school
CREATE POLICY "Users can view students in their school"
  ON public.students FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- School admins can create students
CREATE POLICY "School admins can create students"
  ON public.students FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- School admins can update students
CREATE POLICY "School admins can update students"
  ON public.students FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

-- School admins can delete students
CREATE POLICY "School admins can delete students"
  ON public.students FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Create guardians table
CREATE TABLE IF NOT EXISTS public.guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  occupation TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on guardians
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guardians
CREATE POLICY "Users can view guardians in their school"
  ON public.guardians FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "School admins can create guardians"
  ON public.guardians FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "School admins can update guardians"
  ON public.guardians FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "School admins can delete guardians"
  ON public.guardians FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Create student_guardians junction table
CREATE TABLE IF NOT EXISTS public.student_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  guardian_id UUID NOT NULL REFERENCES public.guardians(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, guardian_id)
);

-- Enable RLS on student_guardians
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_guardians
CREATE POLICY "Users can view student_guardians in their school"
  ON public.student_guardians FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE school_id IN (
        SELECT school_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "School admins can create student_guardians"
  ON public.student_guardians FOR INSERT
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.students WHERE school_id IN (
        SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
      )
    )
  );

CREATE POLICY "School admins can update student_guardians"
  ON public.student_guardians FOR UPDATE
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE school_id IN (
        SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
      )
    )
  );

CREATE POLICY "School admins can delete student_guardians"
  ON public.student_guardians FOR DELETE
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE school_id IN (
        SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
      )
    )
  );
