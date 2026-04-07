-- Seed default permissions for RBAC system
-- This populates the permissions table with granular permissions grouped by module

INSERT INTO public.permissions (id, module, action, description)
VALUES
  -- Students Module
  ('10000000-0000-0000-0000-000000000001', 'students', 'view', 'View students list'),
  ('10000000-0000-0000-0000-000000000002', 'students', 'create', 'Create new student'),
  ('10000000-0000-0000-0000-000000000003', 'students', 'edit', 'Edit student information'),
  ('10000000-0000-0000-0000-000000000004', 'students', 'delete', 'Delete student record'),
  ('10000000-0000-0000-0000-000000000005', 'students', 'export', 'Export student data'),

  -- Attendance Module
  ('20000000-0000-0000-0000-000000000001', 'attendance', 'view', 'View attendance records'),
  ('20000000-0000-0000-0000-000000000002', 'attendance', 'mark', 'Mark attendance'),
  ('20000000-0000-0000-0000-000000000003', 'attendance', 'edit', 'Edit attendance records'),
  ('20000000-0000-0000-0000-000000000004', 'attendance', 'delete', 'Delete attendance records'),
  ('20000000-0000-0000-0000-000000000005', 'attendance', 'report', 'View attendance reports'),

  -- Marks Module
  ('30000000-0000-0000-0000-000000000001', 'marks', 'view', 'View marks'),
  ('30000000-0000-0000-0000-000000000002', 'marks', 'enter', 'Enter student marks'),
  ('30000000-0000-0000-0000-000000000003', 'marks', 'edit', 'Edit entered marks'),
  ('30000000-0000-0000-0000-000000000004', 'marks', 'delete', 'Delete marks'),
  ('30000000-0000-0000-0000-000000000005', 'marks', 'publish', 'Publish results'),

  -- Exams Module
  ('40000000-0000-0000-0000-000000000001', 'exams', 'view', 'View exams'),
  ('40000000-0000-0000-0000-000000000002', 'exams', 'create', 'Create exams'),
  ('40000000-0000-0000-0000-000000000003', 'exams', 'edit', 'Edit exams'),
  ('40000000-0000-0000-0000-000000000004', 'exams', 'delete', 'Delete exams'),
  ('40000000-0000-0000-0000-000000000005', 'exams', 'schedule', 'Manage exam schedule'),

  -- Fees Module
  ('50000000-0000-0000-0000-000000000001', 'fees', 'view', 'View fee structures'),
  ('50000000-0000-0000-0000-000000000002', 'fees', 'create', 'Create fee structures'),
  ('50000000-0000-0000-0000-000000000003', 'fees', 'edit', 'Edit fee structures'),
  ('50000000-0000-0000-0000-000000000004', 'fees', 'delete', 'Delete fee structures'),
  ('50000000-0000-0000-0000-000000000005', 'fees', 'assign', 'Assign fees to students'),

  -- Payments Module
  ('60000000-0000-0000-0000-000000000001', 'payments', 'view', 'View payments'),
  ('60000000-0000-0000-0000-000000000002', 'payments', 'record', 'Record payments'),
  ('60000000-0000-0000-0000-000000000003', 'payments', 'edit', 'Edit payment records'),
  ('60000000-0000-0000-0000-000000000004', 'payments', 'delete', 'Delete payment records'),
  ('60000000-0000-0000-0000-000000000005', 'payments', 'report', 'View payment reports'),

  -- HR Module
  ('70000000-0000-0000-0000-000000000001', 'hr', 'view', 'View HR information'),
  ('70000000-0000-0000-0000-000000000002', 'hr', 'manage_staff', 'Manage staff records'),
  ('70000000-0000-0000-0000-000000000003', 'hr', 'manage_leaves', 'Manage leave applications'),
  ('70000000-0000-0000-0000-000000000004', 'hr', 'manage_payroll', 'Manage payroll'),
  ('70000000-0000-0000-0000-000000000005', 'hr', 'manage_salary', 'Manage salary structures'),

  -- Announcements Module
  ('80000000-0000-0000-0000-000000000001', 'announcements', 'view', 'View announcements'),
  ('80000000-0000-0000-0000-000000000002', 'announcements', 'create', 'Create announcements'),
  ('80000000-0000-0000-0000-000000000003', 'announcements', 'edit', 'Edit announcements'),
  ('80000000-0000-0000-0000-000000000004', 'announcements', 'delete', 'Delete announcements'),
  ('80000000-0000-0000-0000-000000000005', 'announcements', 'publish', 'Publish announcements'),

  -- Website Module
  ('90000000-0000-0000-0000-000000000001', 'website', 'view', 'View website'),
  ('90000000-0000-0000-0000-000000000002', 'website', 'manage_pages', 'Manage website pages'),
  ('90000000-0000-0000-0000-000000000003', 'website', 'manage_theme', 'Manage website theme'),
  ('90000000-0000-0000-0000-000000000004', 'website', 'manage_events', 'Manage website events'),
  ('90000000-0000-0000-0000-000000000005', 'website', 'manage_content', 'Manage website content'),

  -- Reports Module
  ('a0000000-0000-0000-0000-000000000001', 'reports', 'view', 'View reports'),
  ('a0000000-0000-0000-0000-000000000002', 'reports', 'generate', 'Generate reports'),
  ('a0000000-0000-0000-0000-000000000003', 'reports', 'export', 'Export reports'),
  ('a0000000-0000-0000-0000-000000000004', 'reports', 'analytics', 'View analytics'),

  -- Settings Module
  ('b0000000-0000-0000-0000-000000000001', 'settings', 'view', 'View settings'),
  ('b0000000-0000-0000-0000-000000000002', 'settings', 'manage_roles', 'Manage roles and permissions'),
  ('b0000000-0000-0000-0000-000000000003', 'settings', 'manage_users', 'Manage users'),
  ('b0000000-0000-0000-0000-000000000004', 'settings', 'manage_school', 'Manage school settings'),
  ('b0000000-0000-0000-0000-000000000005', 'settings', 'audit_log', 'View audit logs')
ON CONFLICT (id) DO NOTHING;

