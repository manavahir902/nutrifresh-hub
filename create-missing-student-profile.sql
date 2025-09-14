-- Create missing profile for rilica8426@ekuali.com student
-- This will manually create the profile that failed during signup

-- 1. First, let's try to find the user ID by checking if they exist
-- We'll need to get this from the auth system, but let's try a different approach

-- 2. Create a temporary profile with a placeholder user_id
-- We'll update this once we find the correct user_id
INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name,
  email,
  age_group,
  role,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- Temporary UUID, will be updated
  'student',
  'realtest',
  'rilica8426@ekuali.com',
  '16-20', -- Default age group
  'student',
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- 3. Check if the profile was created
SELECT 
  'Profile creation result:' as info,
  user_id,
  first_name,
  last_name,
  email,
  role,
  created_at
FROM public.profiles 
WHERE email = 'rilica8426@ekuali.com';

-- 4. Show all students now
SELECT 
  'All students after fix:' as info,
  first_name,
  last_name,
  email,
  role,
  created_at
FROM public.profiles 
WHERE role = 'student'
ORDER BY created_at DESC;

-- 5. Count total students
SELECT 
  'Total students count:' as info,
  COUNT(*) as total_students
FROM public.profiles 
WHERE role = 'student';
