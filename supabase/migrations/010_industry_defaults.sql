-- ============================================
-- 010_industry_defaults.sql
-- Smart Defaults System - Industry aggregation
-- ============================================

-- =========================
-- Industry Defaults Table
-- Stores aggregated data from past projects
-- =========================
CREATE TABLE IF NOT EXISTS public.industry_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL UNIQUE CHECK (industry IN (
    'restaurant', 'tech_startup', 'fashion', 'healthcare', 'real_estate',
    'consulting', 'education', 'fitness', 'beauty', 'finance', 'nonprofit',
    'creative_agency', 'retail', 'manufacturing', 'legal', 'other'
  )),
  sample_size INTEGER DEFAULT 0,
  style_scores JSONB NOT NULL DEFAULT '{
    "modern_classic": 0,
    "bold_subtle": 0,
    "warm_cool": 0,
    "minimal_ornate": 0,
    "playful_serious": 0,
    "organic_geometric": 0,
    "light_heavy": 0
  }'::jsonb,
  common_styles JSONB DEFAULT '[]'::jsonb,
  preferred_colors JSONB DEFAULT '[]'::jsonb,
  common_typography JSONB DEFAULT '[]'::jsonb,
  average_budget TEXT,
  average_timeline TEXT,
  confidence_level DECIMAL(3,2) DEFAULT 0.00 CHECK (confidence_level >= 0 AND confidence_level <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.industry_defaults ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users (for smart defaults)
DROP POLICY IF EXISTS "Allow read access to industry defaults" ON public.industry_defaults;
CREATE POLICY "Allow read access to industry defaults"
  ON public.industry_defaults FOR SELECT
  TO authenticated
  USING (true);

-- Only allow service role to update (for background aggregation)
DROP POLICY IF EXISTS "Service role can update industry defaults" ON public.industry_defaults;
CREATE POLICY "Service role can update industry defaults"
  ON public.industry_defaults FOR ALL
  USING (auth.role() = 'service_role');

-- Add updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_industry_defaults_updated_at') THEN
    CREATE TRIGGER set_industry_defaults_updated_at BEFORE UPDATE ON public.industry_defaults
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- =========================
-- Project Analytics Table
-- Track project completion for smart defaults
-- =========================
CREATE TABLE IF NOT EXISTS public.project_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects ON DELETE CASCADE NOT NULL,
  industry TEXT NOT NULL,
  style_scores JSONB,
  color_preferences JSONB,
  budget_range TEXT,
  timeline TEXT,
  average_confidence DECIMAL(3,2),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  processed_for_defaults BOOLEAN DEFAULT FALSE
);

-- Enable RLS
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;

-- Designers can view analytics for their own projects
DROP POLICY IF EXISTS "Designers can view their project analytics" ON public.project_analytics;
CREATE POLICY "Designers can view their project analytics"
  ON public.project_analytics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_analytics.project_id
      AND projects.designer_id = auth.uid()
    )
  );

-- Service role can manage all analytics
DROP POLICY IF EXISTS "Service role can manage analytics" ON public.project_analytics;
CREATE POLICY "Service role can manage analytics"
  ON public.project_analytics FOR ALL
  USING (auth.role() = 'service_role');

-- =========================
-- Functions for Smart Defaults
-- =========================

-- Function to automatically create project analytics on project completion
CREATE OR REPLACE FUNCTION public.create_project_analytics()
RETURNS TRIGGER AS $$
DECLARE
  business_data JSONB;
  style_data JSONB;
  color_data JSONB;
  timeline_data JSONB;
  industry_value TEXT;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Extract industry from business_info responses
    SELECT answers->>'industry' INTO industry_value
    FROM public.responses 
    WHERE project_id = NEW.id AND step_key = 'business_info';
    
    -- Extract relevant response data
    SELECT answers INTO business_data FROM public.responses WHERE project_id = NEW.id AND step_key = 'business_info';
    SELECT answers INTO style_data FROM public.responses WHERE project_id = NEW.id AND step_key = 'style_direction';  
    SELECT answers INTO color_data FROM public.responses WHERE project_id = NEW.id AND step_key = 'color_preferences';
    SELECT answers INTO timeline_data FROM public.responses WHERE project_id = NEW.id AND step_key = 'timeline_budget';
    
    -- Insert analytics record
    INSERT INTO public.project_analytics (
      project_id,
      industry,
      style_scores,
      color_preferences,
      budget_range,
      timeline,
      average_confidence,
      completed_at
    ) VALUES (
      NEW.id,
      COALESCE(industry_value, 'other'),
      style_data->'scores',
      color_data,
      timeline_data->>'budget',
      timeline_data->>'timeline',
      COALESCE((style_data->>'averageConfidence')::DECIMAL, 0.8),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create analytics on project completion
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_project_completed') THEN
    CREATE TRIGGER on_project_completed 
      AFTER UPDATE ON public.projects
      FOR EACH ROW 
      EXECUTE FUNCTION public.create_project_analytics();
  END IF;
END $$;

-- =========================
-- Sample Data (Optional - can be removed in production)
-- =========================

-- Insert some initial industry defaults based on research
INSERT INTO public.industry_defaults (industry, sample_size, style_scores, common_styles, preferred_colors, common_typography, average_budget, average_timeline, confidence_level)
VALUES 
  ('restaurant', 0, '{"modern_classic": -5, "bold_subtle": -10, "warm_cool": 15, "minimal_ornate": -5, "playful_serious": 10, "organic_geometric": -8, "light_heavy": 5}'::jsonb, '["organic", "warm", "playful"]'::jsonb, '["warm earth tones", "inviting oranges", "natural greens"]'::jsonb, '["handwritten", "serif"]'::jsonb, '$5,000-$15,000', '4-6 weeks', 0.3),
  
  ('tech_startup', 0, '{"modern_classic": 20, "bold_subtle": 10, "warm_cool": -5, "minimal_ornate": 15, "playful_serious": 5, "organic_geometric": 10, "light_heavy": 10}'::jsonb, '["modern", "minimal", "bold"]'::jsonb, '["tech blues", "clean whites", "electric accents"]'::jsonb, '["sans-serif", "geometric"]'::jsonb, '$10,000-$25,000', '6-8 weeks', 0.3),
  
  ('fashion', 0, '{"modern_classic": 5, "bold_subtle": 15, "warm_cool": 10, "minimal_ornate": -10, "playful_serious": 8, "organic_geometric": -5, "light_heavy": -8}'::jsonb, '["bold", "elegant", "modern"]'::jsonb, '["black & white", "rich jewel tones", "soft pastels"]'::jsonb, '["elegant serif", "modern sans-serif"]'::jsonb, '$8,000-$20,000', '5-7 weeks', 0.3)
  
ON CONFLICT (industry) DO NOTHING;

-- =========================
-- Views for Analytics
-- =========================

-- View for industry insights
CREATE OR REPLACE VIEW public.industry_insights AS
SELECT 
  id.industry,
  id.sample_size,
  id.style_scores,
  id.common_styles,
  id.preferred_colors,
  id.confidence_level,
  id.last_updated,
  COUNT(pa.id) as recent_projects,
  AVG(pa.average_confidence) as avg_client_confidence
FROM public.industry_defaults id
LEFT JOIN public.project_analytics pa ON pa.industry = id.industry 
  AND pa.completed_at > NOW() - INTERVAL '6 months'
GROUP BY id.industry, id.sample_size, id.style_scores, id.common_styles, id.preferred_colors, id.confidence_level, id.last_updated, id.id;

-- Grant access to the view
GRANT SELECT ON public.industry_insights TO authenticated;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_project_analytics_industry_completed 
ON public.project_analytics (industry, completed_at);

CREATE INDEX IF NOT EXISTS idx_project_analytics_processed 
ON public.project_analytics (processed_for_defaults) 
WHERE processed_for_defaults = false;