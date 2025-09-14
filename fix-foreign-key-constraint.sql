-- Fix foreign key constraint for profiles table
-- The constraint is pointing to the wrong table

-- 1. First, let's check the current foreign key constraint
SELECT 
  'Current foreign key constraints:' as info,
  conname as constraint_name,
  confrelid::regclass as referenced_table,
  conkey as local_columns,
  confkey as foreign_columns
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'f';

-- 2. Drop the incorrect foreign key constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- 3. Create the correct foreign key constraint pointing to auth.users
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Verify the constraint was created correctly
SELECT 
  'New foreign key constraint:' as info,
  conname as constraint_name,
  confrelid::regclass as referenced_table,
  conkey as local_columns,
  confkey as foreign_columns
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'f';

-- 5. Test profile creation (without ON CONFLICT since email might not be unique)
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
  'e58613bb-0a39-4924-b64d-8f5f0d0233e9',
  'student',
  'realtest',
  'rilica8426@ekuali.com',
  '16-20',
  'student',
  now(),
  now()
);

-- 6. Verify the profile was created
SELECT 
  'Profile created successfully!' as info,
  user_id,
  first_name,
  last_name,
  email,
  role,
  created_at
FROM public.profiles 
WHERE email = 'rilica8426@ekuali.com';

-- 7. Show all students
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
