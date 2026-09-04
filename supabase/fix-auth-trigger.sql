-- ==========================================
-- FIX: Auth Signup Trigger
-- Run this if signup gives "Database error saving new user"
-- ==========================================

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile (skip if username already exists)
  BEGIN
    INSERT INTO profiles (id, username, display_name, email, avatar, badges)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
      COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'avatar', ''),
      '{}'
    );
  EXCEPTION WHEN unique_violation THEN
    -- Username taken, try with suffix
    INSERT INTO profiles (id, username, display_name, email, avatar, badges)
    VALUES (
      NEW.id,
      SPLIT_PART(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 6),
      COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'avatar', ''),
      '{}'
    );
  END;

  -- Insert default settings
  BEGIN
    INSERT INTO user_settings (user_id) VALUES (NEW.id);
  EXCEPTION WHEN OTHERS THEN
    -- Settings might already exist, ignore
    NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
