-- ============================================
-- 001_initial_schema.sql
-- Briefed — Initial Database Schema
-- ============================================

-- =========================
-- Profiles (Designers)
-- Extends Supabase auth.users
-- =========================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  business_name TEXT,
  plan_tier TEXT DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'team')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- =========================
-- Client Profiles
-- Extends Supabase auth.users
-- =========================
CREATE TABLE IF NOT EXISTS public.client_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can view their own profile" ON public.client_profiles;
CREATE POLICY "Clients can view their own profile"
  ON public.client_profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Clients can update their own profile" ON public.client_profiles;
CREATE POLICY "Clients can update their own profile"
  ON public.client_profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Clients can insert their own profile" ON public.client_profiles;
CREATE POLICY "Clients can insert their own profile"
  ON public.client_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);


-- =========================
-- Questionnaire Templates
-- Designer-customizable
-- =========================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID REFERENCES public.profiles NOT NULL,
  name TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('branding', 'web_design', 'social_media')),
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Designers can view their own templates" ON public.templates;
CREATE POLICY "Designers can view their own templates"
  ON public.templates FOR SELECT
  USING (auth.uid() = designer_id);

DROP POLICY IF EXISTS "Designers can create templates" ON public.templates;
CREATE POLICY "Designers can create templates"
  ON public.templates FOR INSERT
  WITH CHECK (auth.uid() = designer_id);

DROP POLICY IF EXISTS "Designers can update their own templates" ON public.templates;
CREATE POLICY "Designers can update their own templates"
  ON public.templates FOR UPDATE
  USING (auth.uid() = designer_id);

DROP POLICY IF EXISTS "Designers can delete their own templates" ON public.templates;
CREATE POLICY "Designers can delete their own templates"
  ON public.templates FOR DELETE
  USING (auth.uid() = designer_id);


-- =========================
-- Projects (Onboarding Sessions)
-- =========================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designer_id UUID REFERENCES public.profiles NOT NULL,
  client_id UUID REFERENCES public.client_profiles,
  client_email TEXT NOT NULL,
  client_name TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('branding', 'web_design', 'social_media')),
  template_id UUID REFERENCES public.templates,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'in_progress', 'completed', 'reviewed')),
  magic_link_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Designers see their own projects
DROP POLICY IF EXISTS "Designers can view their own projects" ON public.projects;
CREATE POLICY "Designers can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = designer_id);

DROP POLICY IF EXISTS "Designers can create projects" ON public.projects;
CREATE POLICY "Designers can create projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = designer_id);

DROP POLICY IF EXISTS "Designers can update their own projects" ON public.projects;
CREATE POLICY "Designers can update their own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = designer_id);

-- Clients see projects they're linked to
DROP POLICY IF EXISTS "Clients can view their own projects" ON public.projects;
CREATE POLICY "Clients can view their own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = client_id);

-- Clients can update project status (in_progress, completed)
DROP POLICY IF EXISTS "Clients can update their project status" ON public.projects;
CREATE POLICY "Clients can update their project status"
  ON public.projects FOR UPDATE
  USING (auth.uid() = client_id)
  WITH CHECK (auth.uid() = client_id);


-- =========================
-- Responses (Client answers, per-step auto-save)
-- =========================
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects ON DELETE CASCADE NOT NULL,
  step_key TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, step_key)
);

ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Clients can read/write their own project's responses
DROP POLICY IF EXISTS "Clients can view project responses" ON public.responses;
CREATE POLICY "Clients can view project responses"
  ON public.responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = responses.project_id
      AND (projects.client_id = auth.uid() OR projects.designer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients can insert project responses" ON public.responses;
CREATE POLICY "Clients can insert project responses"
  ON public.responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = responses.project_id
      AND projects.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clients can update project responses" ON public.responses;
CREATE POLICY "Clients can update project responses"
  ON public.responses FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = responses.project_id
      AND projects.client_id = auth.uid()
    )
  );


-- =========================
-- Assets (Uploaded files)
-- =========================
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  category TEXT DEFAULT 'inspiration' CHECK (category IN ('inspiration', 'reference', 'existing_brand')),
  metadata JSONB,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project members can view assets" ON public.assets;
CREATE POLICY "Project members can view assets"
  ON public.assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = assets.project_id
      AND (projects.client_id = auth.uid() OR projects.designer_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Clients can upload assets" ON public.assets;
CREATE POLICY "Clients can upload assets"
  ON public.assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = assets.project_id
      AND projects.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Clients can delete their assets" ON public.assets;
CREATE POLICY "Clients can delete their assets"
  ON public.assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = assets.project_id
      AND projects.client_id = auth.uid()
    )
  );


-- =========================
-- Briefs (Generated creative briefs)
-- =========================
CREATE TABLE IF NOT EXISTS public.briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects ON DELETE CASCADE NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_storage_path TEXT,
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.briefs ENABLE ROW LEVEL SECURITY;

-- Designers can read briefs for their projects
DROP POLICY IF EXISTS "Designers can view briefs" ON public.briefs;
CREATE POLICY "Designers can view briefs"
  ON public.briefs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = briefs.project_id
      AND projects.designer_id = auth.uid()
    )
  );

-- Clients can also view their own project's briefs
DROP POLICY IF EXISTS "Clients can view their briefs" ON public.briefs;
CREATE POLICY "Clients can view their briefs"
  ON public.briefs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = briefs.project_id
      AND projects.client_id = auth.uid()
    )
  );


-- =========================
-- Functions & Triggers
-- =========================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_profiles_updated_at') THEN
    CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_client_profiles_updated_at') THEN
    CREATE TRIGGER set_client_profiles_updated_at BEFORE UPDATE ON public.client_profiles
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_templates_updated_at') THEN
    CREATE TRIGGER set_templates_updated_at BEFORE UPDATE ON public.templates
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_projects_updated_at') THEN
    CREATE TRIGGER set_projects_updated_at BEFORE UPDATE ON public.projects
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_responses_updated_at') THEN
    CREATE TRIGGER set_responses_updated_at BEFORE UPDATE ON public.responses
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_briefs_updated_at') THEN
    CREATE TRIGGER set_briefs_updated_at BEFORE UPDATE ON public.briefs
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create profile after auth signup
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
    CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
