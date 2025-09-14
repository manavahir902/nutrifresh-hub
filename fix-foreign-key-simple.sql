-- Simple fix for foreign key constraint and profile creation
-- Run this in Supabase SQL Editor

-- 1. Drop the incorrect foreign key constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- 2. Create the correct foreign key constraint pointing to auth.users
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Check if profile already exists
SELECT 
  'Checking if profile exists...' as info,
  COUNT(*) as profile_count
FROM public.profiles 
WHERE email = 'rilica8426@ekuali.com';

-- 4. Create the profile (only if it doesn't exist)
INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name,
  email,
  age_group,
  role,
  created_at,
  updated_at
)
SELECT 
  'e58613bb-0a39-4924-b64d-8f5f0d0233e9',
  'student',
  'realtest',
  'rilica8426@ekuali.com',
  '16-20',
  'student',
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE email = 'rilica8426@ekuali.com'
);

-- 5. Verify the profile was created
SELECT 
  'Profile status:' as info,
  user_id,
  first_name,
  last_name,
  email,
  role,
  created_at
FROM public.profiles 
WHERE email = 'rilica8426@ekuali.com';

-- 6. Show all students
SELECT 
  'All students:' as info,
  first_name,
  last_name,
  email,
  role,
  created_at
FROM public.profiles 
WHERE role = 'student'
ORDER BY created_at DESC;
