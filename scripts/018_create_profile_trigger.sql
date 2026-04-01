-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  school_id UUID;
  school_name TEXT;
  school_subdomain TEXT;
BEGIN
  -- Extract school info from user metadata
  school_name := COALESCE(new.raw_user_meta_data->>'school_name', 'New School');
  school_subdomain := COALESCE(new.raw_user_meta_data->>'school_subdomain', 'school-' || SUBSTRING(new.id::text, 1, 8));

  -- Create school if it doesn't exist
  INSERT INTO public.schools (name, subdomain)
  VALUES (school_name, school_subdomain)
  ON CONFLICT (subdomain) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO school_id;

  -- Create profile for new user
  INSERT INTO public.profiles (id, full_name, school_id, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    school_id,
    'school_admin'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
