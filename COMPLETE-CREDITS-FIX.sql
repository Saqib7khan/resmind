-- ============================================================================
-- COMPLETE CREDITS FIX - Addresses ALL Root Causes
-- ============================================================================
-- This script fixes the credit initialization issue by:
-- 1. Adding missing INSERT policy for profiles (PRIMARY FIX)
-- 2. Fixing the trigger function with proper PostgreSQL syntax
-- 3. Updating existing users with NULL or 0 credits
-- 4. Ensuring the trigger is properly configured
-- ============================================================================

-- STEP 1: Drop existing policies and trigger (clean slate)
-- ============================================================================
DROP POLICY IF EXISTS "Users can insert own profile during signup" ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- STEP 2: Create the trigger function with proper syntax
-- ============================================================================
-- Note: Using FUNCTION (not PROCEDURE) and proper RETURNS TRIGGER syntax
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new profile with explicit credits value
  INSERT INTO public.profiles (id, email, full_name, credits, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    5,  -- Explicitly set 5 credits
    'user'::user_role  -- Explicitly set role to 'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- STEP 3: Create the trigger (NOTE: Using FUNCTION not PROCEDURE)
-- ============================================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 4: Add INSERT policy for profiles (THE CRITICAL MISSING PIECE!)
-- ============================================================================
-- This policy allows:
-- 1. The trigger function to insert profiles (via SECURITY DEFINER)
-- 2. Manual profile creation by authenticated users for their own ID
CREATE POLICY "Users can insert own profile during signup"
  ON public.profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (
    -- Allow if the user is inserting their own profile
    auth.uid() = id
    -- OR if it's being done by a service role/trigger (will have SECURITY DEFINER)
  );

-- STEP 5: Update existing users with NULL or 0 credits
-- ============================================================================
UPDATE public.profiles
SET credits = 5
WHERE credits IS NULL OR credits = 0;

-- STEP 6: Ensure default value is set at table level (belt and suspenders)
-- ============================================================================
ALTER TABLE public.profiles 
ALTER COLUMN credits SET DEFAULT 5;

ALTER TABLE public.profiles 
ALTER COLUMN credits SET NOT NULL;

-- STEP 7: Verify the fix
-- ============================================================================
-- Run this query to check all users have credits:
-- SELECT id, email, credits, created_at FROM public.profiles ORDER BY created_at DESC;

-- Check that the trigger exists:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check that the function exists:
-- SELECT routine_name FROM information_schema.routines WHERE routine_name = 'handle_new_user';

-- ============================================================================
-- TESTING INSTRUCTIONS
-- ============================================================================
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Create a new test user via the signup form
-- 3. Check that the user appears in profiles table with credits = 5
-- 4. If still failing, check the Supabase logs for trigger errors
-- ============================================================================
