-- Performance Optimization Indexes

-- Attendance query optimization
CREATE INDEX IF NOT EXISTS idx_attendance_school_date ON public.attendance(school_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance(student_id, attendance_date);

-- Student fees query optimization
CREATE INDEX IF NOT EXISTS idx_student_fees_school_status ON public.student_fees(school_id, status);
CREATE INDEX IF NOT EXISTS idx_student_fees_student_school ON public.student_fees(student_id, school_id);

-- Marks query optimization
CREATE INDEX IF NOT EXISTS idx_marks_school_exam ON public.marks(school_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_marks_student_school ON public.marks(student_id, school_id);
CREATE INDEX IF NOT EXISTS idx_marks_student_exam ON public.marks(student_id, exam_id);
CREATE INDEX IF NOT EXISTS idx_marks_exam_subject ON public.marks(exam_id, subject_id);

-- Announcements query optimization
CREATE INDEX IF NOT EXISTS idx_announcements_school_date ON public.announcements(school_id, published_at DESC);

-- Messages and Conversations optimization
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_school ON public.conversations(school_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);

-- Notifications optimization
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- Payment intents optimization
CREATE INDEX IF NOT EXISTS idx_payment_intents_created ON public.payment_intents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_intents_gateway ON public.payment_intents(payment_gateway, status);

-- Exams and subjects optimization
CREATE INDEX IF NOT EXISTS idx_exams_class_school ON public.exams(class_id, school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school ON public.subjects(school_id);

-- Students optimization
CREATE INDEX IF NOT EXISTS idx_students_section_school ON public.students(section_id, school_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(school_id, status);

-- Classes and sections optimization
CREATE INDEX IF NOT EXISTS idx_classes_school ON public.classes(school_id);
CREATE INDEX IF NOT EXISTS idx_sections_class_school ON public.sections(class_id, school_id);

-- Profiles optimization
CREATE INDEX IF NOT EXISTS idx_profiles_school ON public.profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_school_role ON public.profiles(school_id, role);

-- Analyze tables for query planner optimization (optional, depending on database provider)
-- ANALYZE public.attendance;
-- ANALYZE public.student_fees;
-- ANALYZE public.marks;
-- ANALYZE public.payments;
-- ANALYZE public.payment_intents;
