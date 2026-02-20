-- ============================================
-- 002_user_role_on_signup.sql
-- Route new users to profiles or client_profiles
-- based on the "role" field in user metadata
-- ============================================

-- Replace the handle_new_user function to check user role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'designer');

  IF user_role = 'client' THEN
    INSERT INTO public.client_profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
    );
  ELSE
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
