-- Add extended demographic fields to public.users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  ADD COLUMN IF NOT EXISTS religion TEXT,
  ADD COLUMN IF NOT EXISTS is_differently_abled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS bpl_status BOOLEAN DEFAULT false;
