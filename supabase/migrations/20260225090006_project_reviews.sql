-- Project reviews table for client feedback after delivery
CREATE TABLE IF NOT EXISTS project_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE UNIQUE INDEX idx_project_reviews_project ON project_reviews(project_id);
CREATE INDEX idx_project_reviews_client ON project_reviews(client_id);

-- RLS
ALTER TABLE project_reviews ENABLE ROW LEVEL SECURITY;

-- Designers can read reviews on their projects
CREATE POLICY "Designers can view reviews on their projects"
  ON project_reviews FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE designer_id = auth.uid()
    )
  );

-- Clients can insert reviews (via magic link / client_id match)
CREATE POLICY "Clients can insert reviews"
  ON project_reviews FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Clients can read their own reviews
CREATE POLICY "Clients can view own reviews"
  ON project_reviews FOR SELECT
  USING (client_id = auth.uid());

-- Add delivery_notes and delivered_at to projects if not present
ALTER TABLE projects ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
