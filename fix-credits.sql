-- Fix for credit initialization issue
-- This script will:
-- 1. Update existing users with NULL or 0 credits to have 5 credits
-- 2. Fix the profile creation trigger to explicitly set credits

-- Update existing users who have NULL or 0 credits
UPDATE public.profiles
SET credits = 5
WHERE credits IS NULL OR credits = 0;

-- Drop and recreate the trigger function to explicitly set credits
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreated function with explicit credits default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    5  -- Explicitly set credits to 5
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
