# Credits Issue - Complete Diagnosis and Fix Guide

## 🔍 Root Causes Identified

### 1. **PRIMARY ISSUE: Missing INSERT Policy** ❌
The `profiles` table had RLS enabled but **NO INSERT policy**, which meant:
- New user profiles couldn't be created automatically via the trigger
- Manual profile creation in `dashboard-actions.ts` was also blocked
- Users were created in `auth.users` but NOT in `public.profiles`

### 2. **SECONDARY ISSUES:**
- Trigger function used deprecated `PROCEDURE` syntax instead of `FUNCTION`
- No explicit `role` column initialization in trigger
- Missing `SET search_path` security setting in trigger function
- Admin UPDATE policy was missing (admins couldn't update user credits)

## 🔧 Complete Fix Applied

### Files Modified:
1. **COMPLETE-CREDITS-FIX.sql** (NEW) - Comprehensive fix script
2. **supabase-schema.sql** (UPDATED) - Added missing policies and fixed trigger

### Changes Made:

#### 1. Added INSERT Policy for Profiles
```sql
CREATE POLICY "Users can insert own profile during signup"
  ON public.profiles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (auth.uid() = id);
```

#### 2. Fixed Trigger Function
- Changed from `EXECUTE PROCEDURE` to `EXECUTE FUNCTION` (modern PostgreSQL)
- Added explicit `role` initialization
- Added `SET search_path = public` for security
- Ensured credits default is explicitly set to 5

#### 3. Added Admin UPDATE Policy
```sql
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

#### 4. Fixed Column Constraints
```sql
ALTER TABLE public.profiles 
ALTER COLUMN credits SET DEFAULT 5;

ALTER TABLE public.profiles 
ALTER COLUMN credits SET NOT NULL;
```

## 📋 Step-by-Step Fix Instructions

### Step 1: Run the Complete Fix Script
1. Open Supabase Dashboard: https://supabase.com/dashboard/project/wasaiiyebcfubwssxumr/sql
2. Copy the contents of `COMPLETE-CREDITS-FIX.sql`
3. Paste into the SQL Editor
4. Click "Run"
5. Wait for "Success" confirmation

### Step 2: Verify the Fix
Run these queries to confirm everything is working:

```sql
-- Check all users have credits
SELECT id, email, credits, role, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- Verify trigger exists
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Verify function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Check policies exist
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Step 3: Test with New Signup
1. Clear browser cookies/cache or use incognito mode
2. Go to the signup page
3. Create a new test user account
4. After signup, run this query:
   ```sql
   SELECT * FROM public.profiles 
   WHERE email = 'your-test-email@example.com';
   ```
5. Verify `credits = 5` and `role = 'user'`

## 🧪 Troubleshooting

### If new signups still don't get credits:

#### 1. Check Supabase Logs
- Go to: https://supabase.com/dashboard/project/wasaiiyebcfubwssxumr/logs/postgres-logs
- Look for errors related to `handle_new_user` or `profiles` table
- Common errors to look for:
  - "permission denied for table profiles"
  - "violates row-level security policy"
  - "null value in column credits"

#### 2. Verify RLS Policies
```sql
-- Should show at least 5 policies for profiles:
-- 1. Users can view own profile
-- 2. Users can insert own profile during signup
-- 3. Users can update own profile
-- 4. Admins can view all profiles
-- 5. Admins can update all profiles
SELECT policyname FROM pg_policies WHERE tablename = 'profiles';
```

#### 3. Check Auth User Creation
```sql
-- Verify user was created in auth.users
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if profile exists for these users
SELECT au.email AS auth_email, p.email AS profile_email, p.credits
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 5;
```

#### 4. Manual Profile Creation for Orphaned Users
If some users exist in `auth.users` but not `public.profiles`:
```sql
-- Find orphaned users
SELECT au.id, au.email, au.created_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Manually create profiles for orphaned users
INSERT INTO public.profiles (id, email, full_name, credits, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email) AS full_name,
  5 AS credits,
  'user'::user_role AS role
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```

#### 5. Test Trigger Manually
```sql
-- This should work without errors:
DO $$
DECLARE
  test_id uuid := gen_random_uuid();
BEGIN
  -- Temporarily create a test auth user
  INSERT INTO public.profiles (id, email, full_name, credits, role)
  VALUES (test_id, 'trigger-test@example.com', 'Test User', 5, 'user');
  
  -- Check if it worked
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = test_id AND credits = 5) THEN
    RAISE NOTICE 'Profile creation works!';
  ELSE
    RAISE EXCEPTION 'Profile creation failed!';
  END IF;
  
  -- Clean up
  DELETE FROM public.profiles WHERE id = test_id;
END $$;
```

### If admin can't update user credits:

Check the admin UPDATE policy exists:
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'profiles' 
AND policyname = 'Admins can update all profiles';
```

If missing, run:
```sql
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## 🎯 Expected Results After Fix

### For New Users:
- ✅ User created in `auth.users`
- ✅ Profile automatically created in `public.profiles`
- ✅ `credits = 5` set automatically
- ✅ `role = 'user'` set automatically
- ✅ Can immediately use the app with 5 credits

### For Existing Users:
- ✅ All users with 0 or NULL credits updated to 5
- ✅ Can access dashboard and see credit balance
- ✅ Can generate resumes (1 credit per generation)

### For Admins:
- ✅ Can view all user profiles
- ✅ Can update user credits
- ✅ Can change user roles

## 📊 Monitoring

After deploying the fix, monitor these metrics:

```sql
-- Daily new user registrations with credits
SELECT 
  DATE(created_at) AS signup_date,
  COUNT(*) AS new_users,
  COUNT(*) FILTER (WHERE credits >= 5) AS users_with_credits,
  COUNT(*) FILTER (WHERE credits < 5 OR credits IS NULL) AS users_without_credits
FROM public.profiles
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- Users by credit balance
SELECT 
  credits,
  COUNT(*) AS user_count
FROM public.profiles
GROUP BY credits
ORDER BY credits DESC;
```

## 🚀 Next Steps

1. **Deploy the fix** - Run `COMPLETE-CREDITS-FIX.sql` in production
2. **Test thoroughly** - Create multiple test accounts
3. **Monitor logs** - Watch for any trigger errors
4. **Update documentation** - Document the new INSERT policy requirement
5. **Consider automation** - Set up monitoring alerts for users without credits

## 📞 If Issues Persist

If you're still experiencing issues after applying all fixes:

1. **Check Supabase service status**: https://status.supabase.com/
2. **Review application logs** for client-side errors
3. **Verify environment variables** in `.env.local` are correct
4. **Check browser console** for any JavaScript errors during signup
5. **Test with Supabase SQL Editor** directly to isolate server vs client issues

## 🔐 Security Notes

The fixes maintain proper security:
- Users can only insert/update their own profiles
- Admins have elevated privileges via policy checks
- Trigger function uses `SECURITY DEFINER` with `search_path` restriction
- RLS policies prevent unauthorized data access

---

**Last Updated:** February 16, 2026
**Status:** ✅ Ready for deployment
