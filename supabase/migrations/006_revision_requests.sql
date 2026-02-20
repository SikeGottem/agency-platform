-- ================================================
-- 006: Revision requests
-- ================================================

CREATE TABLE IF NOT EXISTS public.revision_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects NOT NULL,
  designer_id UUID REFERENCES public.profiles NOT NULL,
  step_key TEXT NOT NULL,
  field_key TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded')),
  response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.revision_requests ENABLE ROW LEVEL SECURITY;

-- Designers can view/insert their own revision requests
DROP POLICY IF EXISTS "Designers can view own revision requests" ON public.revision_requests;
CREATE POLICY "Designers can view own revision requests"
  ON public.revision_requests FOR SELECT
  USING (auth.uid() = designer_id);

DROP POLICY IF EXISTS "Designers can create revision requests" ON public.revision_requests;
CREATE POLICY "Designers can create revision requests"
  ON public.revision_requests FOR INSERT
  WITH CHECK (auth.uid() = designer_id);

-- Public read for token-based client access (validated at API layer)
DROP POLICY IF EXISTS "Public can view revision requests" ON public.revision_requests;
CREATE POLICY "Public can view revision requests"
  ON public.revision_requests FOR SELECT
  USING (true);

-- Public update for client responses (validated at API layer)
DROP POLICY IF EXISTS "Public can respond to revision requests" ON public.revision_requests;
CREATE POLICY "Public can respond to revision requests"
  ON public.revision_requests FOR UPDATE
  USING (true);
