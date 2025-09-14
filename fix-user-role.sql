-- Fix user role - convert teacher to student
-- Run this in Supabase SQL Editor

-- 1. Check current role
SELECT 
  'Current role check' as info,
  user_id,
  first_name,
  last_name,
  email,
  role,
  created_at
FROM public.profiles 
WHERE email = 'manavahir902@gmail.com';

-- 2. Update role from teacher to student
UPDATE public.profiles 
SET 
  role = 'student',
  updated_at = now()
WHERE email = 'manavahir902@gmail.com';

-- 3. Verify the change
SELECT 
  'Role updated!' as info,
  user_id,
  first_name,
  last_name,
  email,
  role,
  updated_at
FROM public.profiles 
WHERE email = 'manavahir902@gmail.com';

-- 4. Check total students count
SELECT 
  'Students count after update' as info,
  COUNT(*) as total_students
FROM public.profiles 
WHERE role = 'student';

-- 5. Show all students
SELECT 
  'All students:' as info,
  first_name,
  last_name,
  email,
  age_group,
  created_at
FROM public.profiles 
WHERE role = 'student'
ORDER BY created_at DESC;
