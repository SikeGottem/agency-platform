-- Expand project types beyond the hardcoded 3
-- 1. Remove CHECK constraints on project_type columns
-- 2. Create project_types reference table
-- 3. Seed default types

-- Remove CHECK constraints from projects and templates tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT conname, conrelid::regclass AS tablename
    FROM pg_constraint
    WHERE contype = 'c'
      AND conrelid IN ('projects'::regclass, 'templates'::regclass)
      AND pg_get_constraintdef(oid) ILIKE '%project_type%'
  LOOP
    EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tablename, r.conname);
  END LOOP;
END $$;

-- Create project_types reference table
CREATE TABLE IF NOT EXISTS project_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  designer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon text,
  questionnaire_config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- designer_id NULL = system default types
CREATE UNIQUE INDEX project_types_slug_designer_idx
  ON project_types (slug, COALESCE(designer_id, '00000000-0000-0000-0000-000000000000'));

-- Enable RLS
ALTER TABLE project_types ENABLE ROW LEVEL SECURITY;

-- Everyone can read system defaults; designers can read their own custom types
CREATE POLICY "Anyone can read default project types"
  ON project_types FOR SELECT
  USING (designer_id IS NULL);

CREATE POLICY "Designers can read own project types"
  ON project_types FOR SELECT
  USING (designer_id = auth.uid());

CREATE POLICY "Designers can manage own project types"
  ON project_types FOR ALL
  USING (designer_id = auth.uid());

-- Seed default types (designer_id = NULL for system defaults)
INSERT INTO project_types (designer_id, name, slug, description, icon) VALUES
  (NULL, 'Branding', 'branding', 'Logo design, brand identity, and brand guidelines', 'Palette'),
  (NULL, 'Web Design', 'web_design', 'Website design, landing pages, and web applications', 'Globe'),
  (NULL, 'Social Media', 'social_media', 'Social media templates, content, and campaign assets', 'Share2'),
  (NULL, 'Packaging', 'packaging', 'Product packaging, labels, and unboxing experiences', 'Package'),
  (NULL, 'Illustration', 'illustration', 'Custom illustrations, icons, and graphic art', 'PenTool'),
  (NULL, 'UI/UX Design', 'ui_ux', 'User interface and experience design for digital products', 'Layout'),
  (NULL, 'Print Design', 'print', 'Brochures, flyers, posters, and print collateral', 'Printer'),
  (NULL, 'Motion Design', 'motion', 'Animation, motion graphics, and video content', 'Play'),
  (NULL, 'App Design', 'app_design', 'Mobile and desktop application design', 'Smartphone');
