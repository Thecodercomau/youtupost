-- Drop the broken trigger so Supabase auth signup works
-- Profile creation is handled by the app after signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
