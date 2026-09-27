-- =========================================================
-- Teacher's Toolkit - Supabase Database Schema & Storage Setup
-- Project ID: jirxxsajsrjwjbdfrwlr
-- Storage Bucket: Teachers ToolKit
-- =========================================================

-- 1. Create Storage Bucket for 'Teachers ToolKit' if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('Teachers ToolKit', 'Teachers ToolKit', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies (Allow public read/write or authenticated)
CREATE POLICY "Public Read Access on Teachers ToolKit"
ON storage.objects FOR SELECT
USING (bucket_id = 'Teachers ToolKit');

CREATE POLICY "Public Insert Access on Teachers ToolKit"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'Teachers ToolKit');

CREATE POLICY "Public Update Access on Teachers ToolKit"
ON storage.objects FOR UPDATE
USING (bucket_id = 'Teachers ToolKit');

CREATE POLICY "Public Delete Access on Teachers ToolKit"
ON storage.objects FOR DELETE
USING (bucket_id = 'Teachers ToolKit');

-- 3. Teacher / User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone_number TEXT,
    role TEXT DEFAULT 'teacher',
    school_id TEXT,
    school_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Lesson Plans Table
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id TEXT PRIMARY KEY,
    teacher_id TEXT,
    subject TEXT NOT NULL,
    class_name TEXT NOT NULL,
    week_number INT,
    topic TEXT NOT NULL,
    sub_topic TEXT,
    objectives JSONB,
    content JSONB,
    activities JSONB,
    assessment JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Terminal Reports Table
CREATE TABLE IF NOT EXISTS public.terminal_reports (
    id TEXT PRIMARY KEY,
    school_id TEXT,
    class_name TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    term TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    scores JSONB NOT NULL,
    teacher_remarks TEXT,
    headteacher_remarks TEXT,
    attendance_days INT,
    conduct TEXT,
    attitude TEXT,
    interest TEXT,
    status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'approved'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Attendance Records Table
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id TEXT PRIMARY KEY,
    class_name TEXT NOT NULL,
    date DATE NOT NULL,
    teacher_id TEXT,
    records JSONB NOT NULL, -- Array of { studentId, studentName, status: 'P' | 'A' | 'L' }
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Exam Papers & Question Bank
CREATE TABLE IF NOT EXISTS public.exam_papers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_name TEXT NOT NULL,
    term TEXT,
    total_marks INT DEFAULT 100,
    sections JSONB NOT NULL,
    instructions TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. School Collections / Fee Tracking
CREATE TABLE IF NOT EXISTS public.school_collections (
    id TEXT PRIMARY KEY,
    school_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    class_name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'School Fees', 'PTA Levy', 'Canteen', etc.
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT,
    receipt_number TEXT,
    paid_by TEXT,
    collected_by TEXT,
    date TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Paystack Payment Transactions & Subscriptions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    plan_title TEXT NOT NULL,
    amount_ghs NUMERIC(10, 2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    provider TEXT DEFAULT 'Paystack',
    gateway TEXT DEFAULT 'paystack',
    status TEXT DEFAULT 'completed',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) with open policies for dev / anon client
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terminal_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all actions for anon users on user_profiles" ON public.user_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for anon users on lesson_plans" ON public.lesson_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for anon users on terminal_reports" ON public.terminal_reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for anon users on attendance_records" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for anon users on exam_papers" ON public.exam_papers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for anon users on school_collections" ON public.school_collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all actions for anon users on payment_transactions" ON public.payment_transactions FOR ALL USING (true) WITH CHECK (true);
