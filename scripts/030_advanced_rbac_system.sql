-- Advanced Role-Based Access Control (RBAC) System
-- Multi-tenant roles and permissions with RLS enforcement

-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, name),
  CONSTRAINT valid_role_name CHECK (length(trim(name)) > 0)
);

-- Create permissions table (global, not school-scoped)
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_module CHECK (module IN (
    'students', 'fees', 'exams', 'attendance', 'hr', 'communications', 'website', 'reports', 'settings'
  )),
  CONSTRAINT valid_action CHECK (action IN (
    'view', 'create', 'edit', 'delete', 'approve', 'export'
  ))
);

-- Create role-permission mapping (school-scoped)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, role_id, permission_id),
  CONSTRAINT role_school_match CHECK (
    (SELECT school_id FROM public.roles WHERE id = role_id) = school_id
  )
);

-- Create user-role mapping
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_id, user_id, role_id),
  CONSTRAINT role_school_match CHECK (
    (SELECT school_id FROM public.roles WHERE id = role_id) = school_id
  )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_roles_school_id ON public.roles(school_id);
CREATE INDEX IF NOT EXISTS idx_roles_is_system ON public.roles(is_system);
CREATE INDEX IF NOT EXISTS idx_role_permissions_school_id ON public.role_permissions(school_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_school_id ON public.user_roles(school_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- RLS Policies for roles table
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_select_own_school" ON public.roles
  FOR SELECT USING (auth.uid() IS NOT NULL AND school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "roles_insert_admin_only" ON public.roles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "roles_update_admin_only" ON public.roles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "roles_delete_admin_only" ON public.roles
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
    AND NOT is_system
  );

-- RLS Policies for role_permissions table
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_select_own_school" ON public.role_permissions
  FOR SELECT USING (auth.uid() IS NOT NULL AND school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "role_permissions_insert_admin_only" ON public.role_permissions
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "role_permissions_update_admin_only" ON public.role_permissions
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "role_permissions_delete_admin_only" ON public.role_permissions
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

-- RLS Policies for user_roles table
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select_own_school" ON public.user_roles
  FOR SELECT USING (auth.uid() IS NOT NULL AND school_id IN (
    SELECT school_id FROM public.profiles WHERE id = auth.uid()
  ));

CREATE POLICY "user_roles_insert_admin_only" ON public.user_roles
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "user_roles_update_admin_only" ON public.user_roles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

CREATE POLICY "user_roles_delete_admin_only" ON public.user_roles
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND school_id IN (
      SELECT school_id FROM public.profiles 
      WHERE id = auth.uid() AND role IN ('school_admin', 'super_admin')
    )
  );

-- Seed default permissions
INSERT INTO public.permissions (key, module, action, description) VALUES
-- Student Management
('students.view', 'students', 'view', 'View student records'),
('students.create', 'students', 'create', 'Create new students'),
('students.edit', 'students', 'edit', 'Edit student information'),
('students.delete', 'students', 'delete', 'Delete student records'),
-- Fee Management
('fees.view', 'fees', 'view', 'View fee records'),
('fees.create', 'fees', 'create', 'Create fee structures'),
('fees.edit', 'fees', 'edit', 'Edit fee records'),
('fees.delete', 'fees', 'delete', 'Delete fee records'),
('fees.approve', 'fees', 'approve', 'Approve payments'),
-- Exam Management
('exams.view', 'exams', 'view', 'View exam records'),
('exams.create', 'exams', 'create', 'Create exams'),
('exams.edit', 'exams', 'edit', 'Edit exam details'),
('exams.delete', 'exams', 'delete', 'Delete exams'),
('marks.view', 'exams', 'view', 'View marks'),
('marks.create', 'exams', 'create', 'Enter marks'),
('marks.edit', 'exams', 'edit', 'Edit marks'),
-- Attendance
('attendance.view', 'attendance', 'view', 'View attendance'),
('attendance.create', 'attendance', 'create', 'Mark attendance'),
('attendance.edit', 'attendance', 'edit', 'Edit attendance'),
-- HR Management
('hr.view', 'hr', 'view', 'View HR records'),
('hr.create', 'hr', 'create', 'Add staff members'),
('hr.edit', 'hr', 'edit', 'Edit staff records'),
('hr.delete', 'hr', 'delete', 'Delete staff records'),
-- Communications
('communications.view', 'communications', 'view', 'View announcements'),
('communications.create', 'communications', 'create', 'Create announcements'),
('communications.edit', 'communications', 'edit', 'Edit communications'),
('communications.approve', 'communications', 'approve', 'Approve announcements'),
-- Reports
('reports.view', 'reports', 'view', 'View reports'),
('reports.export', 'reports', 'export', 'Export reports'),
-- Settings
('settings.view', 'settings', 'view', 'View settings'),
('settings.edit', 'settings', 'edit', 'Edit school settings'),
('website.manage', 'website', 'edit', 'Manage website content')
ON CONFLICT (key) DO NOTHING;
