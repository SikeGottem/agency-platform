-- ============================================
-- 003_storage_buckets.sql
-- Briefed — Supabase Storage Buckets
-- ============================================

-- Create the project-assets bucket for client-uploaded images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-assets',
  'project-assets',
  false,
  10485760,  -- 10MB max file size
  ARRAY['image/png', 'image/jpeg', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
