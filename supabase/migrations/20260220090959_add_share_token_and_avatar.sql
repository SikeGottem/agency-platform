-- Add share_token column to projects for public brief sharing
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS share_token text UNIQUE;

-- Add avatar_url column to profiles if not exists
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage bucket for avatars if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy for avatars bucket: users can upload/update their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'avatars');
