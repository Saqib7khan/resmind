-- ============================================================================
-- CREDITS DIAGNOSTIC SCRIPT
-- ============================================================================
-- Run this script to diagnose credit initialization issues
-- Copy the output and review to identify problems
-- ============================================================================

\echo '============================================'
\echo 'CREDITS SYSTEM DIAGNOSTIC REPORT'
\echo '============================================'
\echo ''

-- SECTION 1: Table Structure
\echo '1. TABLE STRUCTURE CHECK'
\echo '------------------------'
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable,
  CASE 
    WHEN column_default IS NULL THEN '❌ No default'
    WHEN column_default LIKE '%5%' THEN '✅ Default = 5'
    ELSE '⚠️  Check default: ' || column_default
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name IN ('credits', 'role');
\echo ''

-- SECTION 2: RLS Status
\echo '2. ROW LEVEL SECURITY STATUS'
\echo '----------------------------'
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'profiles';
\echo ''

-- SECTION 3: Policies Check
\echo '3. RLS POLICIES CHECK'
\echo '---------------------'
SELECT 
  policyname,
  cmd as command,
  CASE 
    WHEN cmd = 'SELECT' THEN '✅'
    WHEN cmd = 'INSERT' THEN '✅ CRITICAL'
    WHEN cmd = 'UPDATE' THEN '✅'
    WHEN cmd = 'DELETE' THEN '✅'
    ELSE '⚠️'
  END as importance,
  roles
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY 
  CASE cmd 
    WHEN 'INSERT' THEN 1
    WHEN 'SELECT' THEN 2
    WHEN 'UPDATE' THEN 3
    WHEN 'DELETE' THEN 4
  END;

-- Check for INSERT policy specifically
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND cmd = 'INSERT'
    ) THEN '✅ INSERT policy exists (REQUIRED)'
    ELSE '❌ INSERT policy MISSING - THIS IS THE PROBLEM!'
  END as insert_policy_status;
\echo ''

-- SECTION 4: Trigger Status
\echo '4. TRIGGER CHECK'
\echo '----------------'
SELECT 
  tgname as trigger_name,
  CASE 
    WHEN tgenabled = 'O' THEN '✅ Enabled'
    WHEN tgenabled = 'D' THEN '❌ Disabled'
    ELSE '⚠️  Status: ' || tgenabled
  END as status,
  pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Check if trigger uses FUNCTION vs PROCEDURE
SELECT 
  CASE 
    WHEN pg_get_triggerdef(oid) LIKE '%EXECUTE FUNCTION%' THEN '✅ Uses FUNCTION (correct)'
    WHEN pg_get_triggerdef(oid) LIKE '%EXECUTE PROCEDURE%' THEN '⚠️  Uses PROCEDURE (deprecated)'
    ELSE '❌ Trigger format unknown'
  END as trigger_syntax
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';
\echo ''

-- SECTION 5: Function Status
\echo '5. TRIGGER FUNCTION CHECK'
\echo '-------------------------'
SELECT 
  routine_name,
  routine_type,
  security_type,
  CASE 
    WHEN security_type = 'DEFINER' THEN '✅ SECURITY DEFINER (correct)'
    ELSE '⚠️  Security type: ' || security_type
  END as security_status
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_name = 'handle_new_user';

-- Check function definition
SELECT 
  CASE 
    WHEN prosrc LIKE '%credits%5%' THEN '✅ Function sets credits to 5'
    ELSE '❌ Function may not set credits properly'
  END as credits_check,
  CASE 
    WHEN prosrc LIKE '%role%' THEN '✅ Function sets role'
    ELSE '⚠️  Function may not set role'
  END as role_check
FROM pg_proc
WHERE proname = 'handle_new_user';
\echo ''

-- SECTION 6: User Credit Status
\echo '6. USER CREDITS ANALYSIS'
\echo '------------------------'
SELECT 
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE credits >= 5) as users_with_credits,
  COUNT(*) FILTER (WHERE credits < 5) as users_with_low_credits,
  COUNT(*) FILTER (WHERE credits IS NULL) as users_with_null_credits,
  ROUND(AVG(credits)::numeric, 2) as average_credits
FROM public.profiles;

-- Credit distribution
SELECT 
  COALESCE(credits::text, 'NULL') as credit_amount,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM public.profiles
GROUP BY credits
ORDER BY credits DESC NULLS LAST;
\echo ''

-- SECTION 7: Recent Signups Check
\echo '7. RECENT SIGNUPS (Last 10)'
\echo '----------------------------'
SELECT 
  p.email,
  p.credits,
  p.role,
  p.created_at,
  CASE 
    WHEN p.credits >= 5 THEN '✅'
    WHEN p.credits IS NULL THEN '❌ NULL'
    ELSE '⚠️  ' || p.credits::text
  END as status
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 10;
\echo ''

-- SECTION 8: Orphaned Users Check
\echo '8. ORPHANED USERS CHECK'
\echo '-----------------------'
SELECT 
  COUNT(*) as orphaned_count,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ No orphaned users'
    ELSE '⚠️  Found ' || COUNT(*) || ' users in auth.users without profiles'
  END as status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Show orphaned users if any
SELECT 
  au.email,
  au.created_at,
  '❌ Has no profile' as issue
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC
LIMIT 5;
\echo ''

-- SECTION 9: Recommendations
\echo '9. RECOMMENDATIONS'
\echo '------------------'
SELECT 
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'profiles' AND cmd = 'INSERT'
    ) THEN '🔴 CRITICAL: Run COMPLETE-CREDITS-FIX.sql immediately - Missing INSERT policy'
    WHEN EXISTS (
      SELECT 1 FROM public.profiles WHERE credits IS NULL OR credits = 0
    ) THEN '🟡 WARNING: Some users have no credits - Run UPDATE statement'
    WHEN EXISTS (
      SELECT 1 FROM auth.users au
      LEFT JOIN public.profiles p ON au.id = p.id
      WHERE p.id IS NULL
    ) THEN '🟡 WARNING: Orphaned users detected - Run profile creation script'
    ELSE '✅ HEALTHY: All checks passed!'
  END as system_status;

\echo ''
\echo '============================================'
\echo 'END OF DIAGNOSTIC REPORT'
\echo '============================================'
\echo ''
\echo 'NEXT STEPS:'
\echo '1. Review the output above'
\echo '2. Check for any ❌ or ⚠️  markers'
\echo '3. If INSERT policy is missing, run COMPLETE-CREDITS-FIX.sql'
\echo '4. If orphaned users exist, run the manual profile creation query'
\echo '5. Test with a new signup to verify the fix'
\echo ''
