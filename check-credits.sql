-- Check current credits status for all users
SELECT 
  id,
  email,
  full_name,
  credits,
  role,
  created_at
FROM public.profiles
ORDER BY created_at DESC;
