-- Briefed AI Moodboard Schema

-- Interaction type enum
CREATE TYPE interaction_type AS ENUM ('like', 'skip', 'save', 'remove');

-- Users (extends auth.users)
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Boards
CREATE TABLE public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  thumbnail_url text,
  is_public boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Images (global image catalog)
CREATE TABLE public.images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  thumbnail_url text,
  source text,
  source_id text,
  width integer NOT NULL,
  height integer NOT NULL,
  dominant_colors jsonb,
  clip_embedding_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Board images (images placed on a board)
CREATE TABLE public.board_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  thumbnail_url text,
  source text,
  source_id text,
  position_x float DEFAULT 0 NOT NULL,
  position_y float DEFAULT 0 NOT NULL,
  scale float DEFAULT 1 NOT NULL,
  width integer NOT NULL,
  height integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Design DNA (user taste profile)
CREATE TABLE public.design_dna (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  color_preferences jsonb,
  style_tags text[],
  taste_vector text,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- User interactions (for taste learning)
CREATE TABLE public.user_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  image_id uuid NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
  interaction_type interaction_type NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_boards_user_id ON public.boards(user_id);
CREATE INDEX idx_board_images_board_id ON public.board_images(board_id);
CREATE INDEX idx_user_interactions_user_id ON public.user_interactions(user_id);
CREATE INDEX idx_user_interactions_image_id ON public.user_interactions(image_id);

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER design_dna_updated_at
  BEFORE UPDATE ON public.design_dna
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.design_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- Users: own data only
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Boards: own data + public readable
CREATE POLICY "Users can CRUD own boards" ON public.boards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public boards are viewable" ON public.boards FOR SELECT USING (is_public = true);

-- Board images: via board ownership
CREATE POLICY "Users can manage own board images" ON public.board_images FOR ALL
  USING (EXISTS (SELECT 1 FROM public.boards WHERE boards.id = board_images.board_id AND boards.user_id = auth.uid()));
CREATE POLICY "Public board images are viewable" ON public.board_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.boards WHERE boards.id = board_images.board_id AND boards.is_public = true));

-- Images: readable by all authenticated users
CREATE POLICY "Authenticated users can view images" ON public.images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage images" ON public.images FOR ALL TO service_role USING (true);

-- Design DNA: own data only
CREATE POLICY "Users can manage own design DNA" ON public.design_dna FOR ALL USING (auth.uid() = user_id);

-- User interactions: own data only
CREATE POLICY "Users can manage own interactions" ON public.user_interactions FOR ALL USING (auth.uid() = user_id);
