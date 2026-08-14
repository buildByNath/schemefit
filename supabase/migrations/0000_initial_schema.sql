-- 1. Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    voice_raw_text TEXT,
    annual_income NUMERIC,
    caste_category TEXT,
    state TEXT,
    district TEXT,
    occupation TEXT,
    education TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Family Members
CREATE TABLE public.family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    age INTEGER,
    occupation TEXT,
    annual_income NUMERIC,
    education TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Schemes
CREATE TABLE public.schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    min_benefit_amount NUMERIC,
    max_benefit_amount NUMERIC,
    eligibility_json JSONB DEFAULT '{}'::JSONB,
    required_documents JSONB DEFAULT '[]'::JSONB,
    prerequisites JSONB DEFAULT '[]'::JSONB,
    application_url TEXT,
    deadline TIMESTAMP WITH TIME ZONE,
    category TEXT,
    state TEXT,
    ministry TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Applications
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Draft', -- Draft, Ready, Submitted, Pending, Approved, Rejected
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Documents
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'Uploaded',
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Saved Deadlines
CREATE TABLE public.saved_deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Turn on RLS for all tables (can configure policies later)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_deadlines ENABLE ROW LEVEL SECURITY;

-- Disable RLS for Hackathon Demo MVP initially, or provide permissive policies.
-- Let's provide permissive policies for rapid iteration during hackathon.
CREATE POLICY "Allow all operations for now" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.family_members FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.schemes FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.applications FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.documents FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations for now" ON public.saved_deadlines FOR ALL USING (true);
