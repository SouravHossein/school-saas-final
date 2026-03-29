-- Staff table
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT,
  hire_date DATE NOT NULL,
  employment_type TEXT NOT NULL CHECK (employment_type IN ('permanent', 'contract', 'temporary')),
  salary_type TEXT NOT NULL DEFAULT 'monthly' CHECK (salary_type IN ('monthly', 'hourly', 'daily')),
  is_active BOOLEAN DEFAULT true,
  photo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  bank_account TEXT,
  bank_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(school_id, email)
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view staff" ON public.staff
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage staff" ON public.staff
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Salary components table
CREATE TABLE IF NOT EXISTS public.salary_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  component_type TEXT NOT NULL CHECK (component_type IN ('earning', 'deduction')),
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(school_id, name)
);

ALTER TABLE public.salary_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view components" ON public.salary_components
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage components" ON public.salary_components
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Salary structures table
CREATE TABLE IF NOT EXISTS public.salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  base_salary DECIMAL(12, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(school_id, name)
);

ALTER TABLE public.salary_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view structures" ON public.salary_structures
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage structures" ON public.salary_structures
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Staff salary assignments
CREATE TABLE IF NOT EXISTS public.staff_salary_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  salary_structure_id UUID NOT NULL REFERENCES public.salary_structures(id) ON DELETE RESTRICT,
  component_id UUID NOT NULL REFERENCES public.salary_components(id) ON DELETE RESTRICT,
  amount DECIMAL(12, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  assigned_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(staff_id, component_id)
);

ALTER TABLE public.staff_salary_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view assignments" ON public.staff_salary_assignments
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage assignments" ON public.staff_salary_assignments
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Leaves table
CREATE TABLE IF NOT EXISTS public.leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  leave_date DATE NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  approved_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own leaves" ON public.leaves
  FOR SELECT USING (
    staff_id IN (
      SELECT id FROM public.staff WHERE school_id IN (
        SELECT school_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "School admins can manage leaves" ON public.leaves
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Leave balances
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL,
  total_days INT NOT NULL DEFAULT 0,
  used_days INT NOT NULL DEFAULT 0,
  year INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(staff_id, leave_type, year)
);

ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view own balances" ON public.leave_balances
  FOR SELECT USING (
    staff_id IN (
      SELECT id FROM public.staff WHERE school_id IN (
        SELECT school_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "School admins can manage balances" ON public.leave_balances
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Payrolls table
CREATE TABLE IF NOT EXISTS public.payrolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  payroll_month INT NOT NULL,
  payroll_year INT NOT NULL,
  gross_salary DECIMAL(12, 2) NOT NULL,
  total_deductions DECIMAL(12, 2) DEFAULT 0,
  net_salary DECIMAL(12, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processed', 'paid')),
  payment_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(school_id, staff_id, payroll_month, payroll_year)
);

ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view payrolls" ON public.payrolls
  FOR SELECT USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "School admins can manage payrolls" ON public.payrolls
  FOR ALL USING (
    school_id IN (
      SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')
    )
  );

-- Payroll items (breakdown of earnings/deductions)
CREATE TABLE IF NOT EXISTS public.payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_id UUID NOT NULL REFERENCES public.payrolls(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES public.salary_components(id) ON DELETE RESTRICT,
  component_name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  component_type TEXT NOT NULL CHECK (component_type IN ('earning', 'deduction')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

ALTER TABLE public.payroll_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "School members can view items" ON public.payroll_items
  FOR SELECT USING (
    payroll_id IN (
      SELECT id FROM public.payrolls WHERE school_id IN (
        SELECT school_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

-- Create indexes for performance
CREATE INDEX idx_staff_school_id ON public.staff(school_id);
CREATE INDEX idx_staff_is_active ON public.staff(is_active);
CREATE INDEX idx_salary_structures_school_id ON public.salary_structures(school_id);
CREATE INDEX idx_salary_components_school_id ON public.salary_components(school_id);
CREATE INDEX idx_staff_salary_assignments_staff_id ON public.staff_salary_assignments(staff_id);
CREATE INDEX idx_leaves_staff_id ON public.leaves(staff_id);
CREATE INDEX idx_leaves_leave_date ON public.leaves(leave_date);
CREATE INDEX idx_leave_balances_staff_id ON public.leave_balances(staff_id);
CREATE INDEX idx_payrolls_staff_id ON public.payrolls(staff_id);
CREATE INDEX idx_payrolls_month_year ON public.payrolls(payroll_month, payroll_year);
CREATE INDEX idx_payroll_items_payroll_id ON public.payroll_items(payroll_id);
