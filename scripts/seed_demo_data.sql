-- Seed Demo Data for School Management SaaS MVP
-- Comprehensive demo data focusing on tables without strict FK constraints

-- 1. Create Demo Schools
INSERT INTO public.schools (id, name, subdomain, is_website_public, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Demo Public School', 'demo-school', true, NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Elite Academy', 'elite-academy', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Create Demo Subjects
INSERT INTO public.subjects (id, school_id, name, code, is_active, created_at, updated_at)
VALUES 
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'Mathematics', 'MATH', true, NOW(), NOW()),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'English', 'ENG', true, NOW(), NOW()),
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'Science', 'SCI', true, NOW(), NOW()),
  ('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'Social Studies', 'SOC', true, NOW(), NOW()),
  ('99999999-9999-9999-9999-999999999999', '22222222-2222-2222-2222-222222222222', 'History', 'HIST', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 3. Create Demo Guardians
INSERT INTO public.guardians (id, school_id, first_name, last_name, email, phone, relationship, occupation, created_at, updated_at)
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-000000000001', '11111111-1111-1111-1111-111111111111', 'Rajesh', 'Kumar', 'rajesh.kumar@email.com', '9111111111', 'Father', 'Engineer', NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000002', '11111111-1111-1111-1111-111111111111', 'Anjali', 'Sharma', 'anjali.sharma@email.com', '9111111112', 'Mother', 'Teacher', NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000003', '11111111-1111-1111-1111-111111111111', 'Vikas', 'Singh', 'vikas.singh@email.com', '9111111113', 'Father', 'Doctor', NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000004', '11111111-1111-1111-1111-111111111111', 'Priya', 'Patel', 'priya.patel@email.com', '9111111114', 'Mother', 'Accountant', NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000005', '22222222-2222-2222-2222-222222222222', 'Suresh', 'Desai', 'suresh.desai@email.com', '8111111115', 'Father', 'Business Owner', NOW(), NOW()),
  ('eeeeeeee-eeee-eeee-eeee-000000000006', '22222222-2222-2222-2222-222222222222', 'Meera', 'Desai', 'meera.desai@email.com', '8111111116', 'Mother', 'Lawyer', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Create Demo Staff
INSERT INTO public.staff (id, school_id, first_name, last_name, email, phone, position, department, employment_type, salary_type, hire_date, is_active, created_at, updated_at)
VALUES 
  ('cccccccc-cccc-0001-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Mr', 'Sharma', 'mr.sharma@school.edu', '9911111111', 'Principal', 'Administration', 'permanent', 'monthly', '2018-01-15', true, NOW(), NOW()),
  ('cccccccc-cccc-0002-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Mrs', 'Verma', 'mrs.verma@school.edu', '9911111112', 'Mathematics Teacher', 'Academic', 'permanent', 'monthly', '2019-06-01', true, NOW(), NOW()),
  ('cccccccc-cccc-0003-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Mr', 'Patel', 'mr.patel@school.edu', '9911111113', 'English Teacher', 'Academic', 'permanent', 'monthly', '2019-06-01', true, NOW(), NOW()),
  ('cccccccc-cccc-0004-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Ms', 'Gupta', 'ms.gupta@school.edu', '9911111114', 'Science Teacher', 'Academic', 'permanent', 'monthly', '2020-06-01', true, NOW(), NOW()),
  ('cccccccc-cccc-0005-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Mr', 'Singh', 'mr.singh@school.edu', '9911111115', 'Accountant', 'Finance', 'permanent', 'monthly', '2019-09-01', true, NOW(), NOW()),
  ('cccccccc-cccc-0006-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'Dr', 'Chopra', 'dr.chopra@school.edu', '8911111116', 'Principal', 'Administration', 'permanent', 'monthly', '2017-07-20', true, NOW(), NOW()),
  ('cccccccc-cccc-0007-0000-000000000007', '22222222-2222-2222-2222-222222222222', 'Ms', 'Nair', 'ms.nair@school.edu', '8911111117', 'Physics Teacher', 'Academic', 'permanent', 'monthly', '2020-08-15', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Create Demo Fee Structures
INSERT INTO public.fee_structures (id, school_id, name, amount, frequency, due_date, is_active, created_at, updated_at)
VALUES 
  ('ffffffff-0000-0001-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Quarterly Fee', 10000, 'quarterly', 15, true, NOW(), NOW()),
  ('ffffffff-0000-0002-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Annual Fee', 40000, 'annual', 15, true, NOW(), NOW()),
  ('ffffffff-0000-0003-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Exam Fee', 2000, 'annual', 30, true, NOW(), NOW()),
  ('ffffffff-0000-0004-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Monthly Fee', 5000, 'monthly', 5, true, NOW(), NOW()),
  ('ffffffff-0000-0005-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'Development Fee', 1500, 'annual', 20, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 6. Create Demo Events
INSERT INTO public.events (id, school_id, title, description, event_date, location, is_published, created_at, updated_at)
VALUES 
  ('eeeeeeee-eeee-0001-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Annual Sports Day', 'A day of fun and competition for all students with various indoor and outdoor games', '2024-05-10 10:00:00+00', 'School Grounds', true, NOW(), NOW()),
  ('eeeeeeee-eeee-0002-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Science Exhibition', 'Students will showcase their innovative science projects and experiments', '2024-05-20 14:00:00+00', 'School Hall', true, NOW(), NOW()),
  ('eeeeeeee-eeee-0003-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Cultural Fest', 'Celebration of various cultures and traditions with performances and food stalls', '2024-06-05 16:00:00+00', 'School Campus', true, NOW(), NOW()),
  ('eeeeeeee-eeee-0004-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Founder Day Celebration', 'Annual celebration of the school foundation with special guest lectures and awards', '2024-06-15 09:00:00+00', 'School Auditorium', true, NOW(), NOW()),
  ('eeeeeeee-eeee-0005-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'Orientation Program', 'Welcome session for new students and parents to familiarize with school systems', '2024-06-25 11:00:00+00', 'Main Auditorium', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. Create Demo Salary Structures
INSERT INTO public.salary_structures (id, school_id, name, base_salary, is_active, description, created_at, updated_at)
VALUES 
  ('bbbbbbbb-0001-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Teacher Grade A', 50000, true, 'Salary structure for senior teachers with 10+ years experience', NOW(), NOW()),
  ('bbbbbbbb-0002-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Teacher Grade B', 40000, true, 'Salary structure for junior and mid-level teachers', NOW(), NOW()),
  ('bbbbbbbb-0003-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Admin Staff', 35000, true, 'Salary structure for administrative and clerical staff', NOW(), NOW()),
  ('bbbbbbbb-0004-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Senior Faculty', 65000, true, 'Salary structure for senior faculty and HODs', NOW(), NOW()),
  ('bbbbbbbb-0005-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'Support Staff', 28000, true, 'Salary structure for support staff and helpers', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. Create Demo Salary Components
INSERT INTO public.salary_components (id, school_id, name, component_type, is_active, is_default, description, created_at)
VALUES 
  ('cccccccc-0001-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Basic Salary', 'earning', true, true, 'Basic monthly salary component', NOW()),
  ('cccccccc-0002-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Dearness Allowance', 'earning', true, true, 'DA as per government norms', NOW()),
  ('cccccccc-0003-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'House Rent Allowance', 'earning', true, true, 'HRA based on location', NOW()),
  ('cccccccc-0004-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'Conveyance Allowance', 'earning', true, false, 'Monthly travel allowance', NOW()),
  ('cccccccc-0005-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111', 'Income Tax', 'deduction', true, true, 'Income tax deduction per slab', NOW()),
  ('cccccccc-0006-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111', 'PF Contribution', 'deduction', true, true, 'Provident fund monthly contribution', NOW()),
  ('cccccccc-0007-0000-0000-000000000007', '22222222-2222-2222-2222-222222222222', 'Performance Bonus', 'earning', true, false, 'Monthly performance incentive', NOW()),
  ('cccccccc-0008-0000-0000-000000000008', '22222222-2222-2222-2222-222222222222', 'Professional Tax', 'deduction', true, false, 'Monthly professional tax', NOW())
ON CONFLICT (id) DO NOTHING;

-- 9. Create Demo Payrolls
INSERT INTO public.payrolls (id, school_id, staff_id, payroll_month, payroll_year, gross_salary, total_deductions, net_salary, payment_status, created_at, updated_at)
VALUES 
  ('dddddddd-0001-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-0002-0000-000000000002', 4, 2024, 60000, 12000, 48000, 'paid', NOW(), NOW()),
  ('dddddddd-0002-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-0003-0000-000000000003', 4, 2024, 50000, 10000, 40000, 'paid', NOW(), NOW()),
  ('dddddddd-0003-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-0004-0000-000000000004', 4, 2024, 55000, 11000, 44000, 'paid', NOW(), NOW()),
  ('dddddddd-0004-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-0005-0000-000000000005', 4, 2024, 45000, 9000, 36000, 'processed', NOW(), NOW()),
  ('dddddddd-0005-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-0006-0000-000000000006', 4, 2024, 75000, 15000, 60000, 'paid', NOW(), NOW()),
  ('dddddddd-0006-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-0007-0000-000000000007', 4, 2024, 65000, 13000, 52000, 'paid', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 10. Summary View
SELECT 'DEMO DATA SEEDED SUCCESSFULLY!' as status,
  (SELECT COUNT(*) FROM public.schools) as schools_count,
  (SELECT COUNT(*) FROM public.subjects) as subjects_count,
  (SELECT COUNT(*) FROM public.guardians) as guardians_count,
  (SELECT COUNT(*) FROM public.staff) as staff_count,
  (SELECT COUNT(*) FROM public.fee_structures) as fee_structures_count,
  (SELECT COUNT(*) FROM public.events) as events_count,
  (SELECT COUNT(*) FROM public.salary_structures) as salary_structures_count,
  (SELECT COUNT(*) FROM public.salary_components) as salary_components_count,
  (SELECT COUNT(*) FROM public.payrolls) as payrolls_count;
