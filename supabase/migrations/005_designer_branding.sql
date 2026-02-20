-- ================================================
-- 005: Designer branding fields
-- ================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#18181B',
  ADD COLUMN IF NOT EXISTS brand_logo_url TEXT;
