-- Create fee_structures table
CREATE TABLE IF NOT EXISTS public.fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'semi-annual', 'annual', 'one-time')),
  due_date INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_fee_structure UNIQUE(school_id, name)
);

-- Create student_fees table
CREATE TABLE IF NOT EXISTS public.student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  fee_structure_id UUID NOT NULL REFERENCES public.fee_structures(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('paid', 'unpaid', 'partial')),
  amount_paid DECIMAL(10, 2) DEFAULT 0 CHECK (amount_paid >= 0 AND amount_paid <= amount),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT unique_student_fee UNIQUE(student_id, fee_structure_id)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'cheque', 'bank_transfer', 'online')),
  transaction_id TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fee_structures
CREATE POLICY "fee_structures_view_own_school"
  ON public.fee_structures FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "fee_structures_insert_own_school"
  ON public.fee_structures FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "fee_structures_update_own_school"
  ON public.fee_structures FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "fee_structures_delete_own_school"
  ON public.fee_structures FOR DELETE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- RLS Policies for student_fees
CREATE POLICY "student_fees_view_own_school"
  ON public.student_fees FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "student_fees_insert_own_school"
  ON public.student_fees FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

CREATE POLICY "student_fees_update_own_school"
  ON public.student_fees FOR UPDATE
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- RLS Policies for payments
CREATE POLICY "payments_view_own_school"
  ON public.payments FOR SELECT
  USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "payments_insert_own_school"
  ON public.payments FOR INSERT
  WITH CHECK (
    school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin', 'teacher')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fee_structures_school_id ON public.fee_structures(school_id);
CREATE INDEX IF NOT EXISTS idx_fee_structures_is_active ON public.fee_structures(is_active);
CREATE INDEX IF NOT EXISTS idx_student_fees_school_id ON public.student_fees(school_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON public.student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_status ON public.student_fees(status);
CREATE INDEX IF NOT EXISTS idx_payments_school_id ON public.payments(school_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);
