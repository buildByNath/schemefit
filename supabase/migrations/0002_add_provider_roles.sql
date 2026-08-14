-- Add roles and organization details to public.users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS organization_name TEXT,
  ADD COLUMN IF NOT EXISTS registration_no TEXT,
  ADD COLUMN IF NOT EXISTS official_email TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_documents TEXT[];

-- Add provider details to public.schemes table
ALTER TABLE public.schemes
  ADD COLUMN IF NOT EXISTS provider_type TEXT,
  ADD COLUMN IF NOT EXISTS provider_name TEXT,
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add encryption fields to documents table
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT,
  ADD COLUMN IF NOT EXISTS encrypted_data TEXT,
  ADD COLUMN IF NOT EXISTS iv TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
