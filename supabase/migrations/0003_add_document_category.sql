-- Add document_category to user_documents
ALTER TABLE user_documents ADD COLUMN IF NOT EXISTS document_category TEXT DEFAULT 'Other';
