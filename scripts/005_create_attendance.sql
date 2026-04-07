-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'present',
  remarks TEXT,
  marked_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('present', 'absent', 'late', 'leave')),
  CONSTRAINT unique_attendance_per_day UNIQUE (student_id, attendance_date)
);

-- Create indexes for better query performance
CREATE INDEX idx_attendance_school_id ON public.attendance(school_id);
CREATE INDEX idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX idx_attendance_section_id ON public.attendance(section_id);
CREATE INDEX idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX idx_attendance_school_date ON public.attendance(school_id, attendance_date);
CREATE INDEX idx_attendance_student_date ON public.attendance(student_id, attendance_date);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attendance
-- Users can view attendance for their school
CREATE POLICY "Users can view attendance for their school"
  ON public.attendance FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Only school admins and teachers can insert attendance
CREATE POLICY "School admins and teachers can insert attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

-- Only school admins and the marking teacher can update attendance
CREATE POLICY "School admins and marking teacher can update attendance"
  ON public.attendance FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

-- Only school admins can delete attendance
CREATE POLICY "Only school admins can delete attendance"
  ON public.attendance FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );
