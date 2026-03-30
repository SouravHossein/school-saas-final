-- Create roles table
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(school_id, name)
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(module, action)
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(role_id, permission_id)
);

-- Create user_roles junction table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  UNIQUE(user_id, role_id, school_id)
);

-- Enable RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles
CREATE POLICY "School admins can manage roles" ON public.roles FOR ALL
  USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')))
  WITH CHECK (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')));

CREATE POLICY "Users can view roles in their school" ON public.roles FOR SELECT
  USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid()));

-- RLS Policies for role_permissions
CREATE POLICY "School admins can manage role_permissions" ON public.role_permissions FOR ALL
  USING (role_id IN (SELECT id FROM public.roles WHERE school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin'))));

CREATE POLICY "Users can view role_permissions" ON public.role_permissions FOR SELECT
  USING (role_id IN (SELECT id FROM public.roles WHERE school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid())));

-- RLS Policies for user_roles
CREATE POLICY "School admins can manage user_roles" ON public.user_roles FOR ALL
  USING (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')))
  WITH CHECK (school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')));

CREATE POLICY "Users can view their own user_roles" ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR school_id IN (SELECT school_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'school_admin')));

-- Create indexes for performance
CREATE INDEX idx_roles_school_id ON public.roles(school_id);
CREATE INDEX idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX idx_user_roles_school_id ON public.user_roles(school_id);

-- Insert default permissions
INSERT INTO public.permissions (module, action, description) VALUES
('students', 'view', 'View student records'),
('students', 'create', 'Create new students'),
('students', 'edit', 'Edit student information'),
('students', 'delete', 'Delete student records'),
('classes', 'view', 'View classes'),
('classes', 'create', 'Create new classes'),
('classes', 'edit', 'Edit class information'),
('classes', 'delete', 'Delete classes'),
('attendance', 'view', 'View attendance records'),
('attendance', 'mark', 'Mark attendance'),
('exams', 'view', 'View exam information'),
('exams', 'create', 'Create exams'),
('exams', 'edit', 'Edit exam details'),
('exams', 'mark', 'Enter exam marks'),
('fees', 'view', 'View fee information'),
('fees', 'assign', 'Assign fees'),
('fees', 'collect', 'Record fee payments'),
('announcements', 'view', 'View announcements'),
('announcements', 'create', 'Create announcements'),
('announcements', 'delete', 'Delete announcements'),
('messages', 'send', 'Send messages'),
('reports', 'view', 'View reports'),
('settings', 'manage', 'Manage school settings'),
('staff', 'view', 'View staff information'),
('staff', 'manage', 'Manage staff')
ON CONFLICT DO NOTHING;
