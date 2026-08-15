-- Add new profile fields to public.users table required for automated form filling
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS aadhar TEXT,
  ADD COLUMN IF NOT EXISTS bank_account TEXT,
  ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS exchange_reg TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_documents JSONB DEFAULT '[]'::JSONB;
