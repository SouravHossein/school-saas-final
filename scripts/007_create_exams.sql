-- Create subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(school_id, code)
);

-- Create exams table
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  exam_date DATE NOT NULL,
  exam_type TEXT NOT NULL DEFAULT 'midterm',
  max_marks INT NOT NULL DEFAULT 100,
  passing_marks INT NOT NULL DEFAULT 40,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT valid_exam_type CHECK (exam_type IN ('midterm', 'final', 'semester', 'unit-test', 'other')),
  CONSTRAINT valid_marks CHECK (max_marks > 0 AND passing_marks >= 0 AND passing_marks <= max_marks)
);

-- Create marks table (junction table between students, exams, and subjects)
CREATE TABLE IF NOT EXISTS public.marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  marks_obtained INT NOT NULL,
  grade TEXT,
  is_passed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, exam_id, subject_id),
  CONSTRAINT valid_marks CHECK (marks_obtained >= 0)
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subjects
CREATE POLICY "Users can view subjects from their school"
  ON public.subjects FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage subjects"
  ON public.subjects FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "Admins can update subjects"
  ON public.subjects FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "Admins can delete subjects"
  ON public.subjects FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- RLS Policies for exams
CREATE POLICY "Users can view exams from their school"
  ON public.exams FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and teachers can create exams"
  ON public.exams FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

CREATE POLICY "Admins and teachers can update exams"
  ON public.exams FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

CREATE POLICY "Admins can delete exams"
  ON public.exams FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- RLS Policies for marks
CREATE POLICY "Users can view marks from their school"
  ON public.marks FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Teachers and admins can record marks"
  ON public.marks FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

CREATE POLICY "Teachers and admins can update marks"
  ON public.marks FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

CREATE POLICY "Admins can delete marks"
  ON public.marks FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Create indexes for performance
CREATE INDEX idx_subjects_school_id ON public.subjects(school_id);
CREATE INDEX idx_subjects_active ON public.subjects(school_id, is_active);
CREATE INDEX idx_exams_school_id ON public.exams(school_id);
CREATE INDEX idx_exams_class_id ON public.exams(class_id);
CREATE INDEX idx_exams_school_class ON public.exams(school_id, class_id);
CREATE INDEX idx_marks_school_id ON public.marks(school_id);
CREATE INDEX idx_marks_student_id ON public.marks(student_id);
CREATE INDEX idx_marks_exam_id ON public.marks(exam_id);
CREATE INDEX idx_marks_student_exam ON public.marks(student_id, exam_id);
