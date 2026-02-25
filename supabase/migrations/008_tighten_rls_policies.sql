-- Tighten revision_requests RLS policies (SEC-5)
-- Remove overly permissive public access

DROP POLICY IF EXISTS "Public can view revision requests" ON public.revision_requests;
DROP POLICY IF EXISTS "Public can respond to revision requests" ON public.revision_requests;

-- Designers can view revision requests they created
DROP POLICY IF EXISTS "Designers can view own revision requests" ON public.revision_requests;
CREATE POLICY "Designers can view own revision requests"
  ON public.revision_requests FOR SELECT
  USING (auth.uid() = designer_id);

-- Designers can insert revision requests for their projects
-- (Keep existing policy if it exists, this is for defense-in-depth)

-- Clients can respond to revision requests on their linked projects
CREATE POLICY "Clients can respond to revision requests"
  ON public.revision_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = revision_requests.project_id
      AND projects.client_id = auth.uid()
    )
  );

-- Tighten notifications INSERT policy (SEC-6)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;

-- Only allow inserting notifications for yourself
-- System/API notifications use the admin client which bypasses RLS
CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);
