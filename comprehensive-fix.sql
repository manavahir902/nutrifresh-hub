-- Comprehensive fix for the profile creation issue
-- This script will fix the foreign key constraint and create the missing profile

-- 1. First, let's see the current state
SELECT 
  'CURRENT STATE ANALYSIS' as info,
  '=====================' as separator;

-- Check current foreign key constraints
SELECT 
  'Current foreign key constraints on profiles:' as info,
  conname as constraint_name,
  confrelid::regclass as referenced_table,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'f';

-- Check if user exists in auth.users
SELECT 
  'User rilica8426@ekuali.com in auth.users:' as info,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'rilica8426@ekuali.com';

-- Check if profile exists
SELECT 
  'Profile rilica8426@ekuali.com in profiles:' as info,
  user_id,
  first_name,
  last_name,
  email,
  role,
  created_at
FROM public.profiles
WHERE email = 'rilica8426@ekuali.com';

-- 2. Fix the foreign key constraint
SELECT 
  'FIXING FOREIGN KEY CONSTRAINT' as info,
  '============================' as separator;

-- Drop the incorrect foreign key constraint
DO $$ 
DECLARE
    constraint_name text;
BEGIN
    -- Get all foreign key constraint names
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.profiles'::regclass 
        AND contype = 'f'
    LOOP
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || constraint_name;
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    END LOOP;
END $$;

-- Create the correct foreign key constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Verify the new constraint
SELECT 
  'New foreign key constraint:' as info,
  conname as constraint_name,
  confrelid::regclass as referenced_table,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'f';

-- 3. Create the missing profile
SELECT 
  'CREATING MISSING PROFILE' as info,
  '=======================' as separator;

-- Create the profile for rilica8426@ekuali.com
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
  au.id,
  'student',
  'realtest',
  'rilica8426@ekuali.com',
  '16-20',
  'student',
  now(),
  now()
FROM auth.users au
WHERE au.email = 'rilica8426@ekuali.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.email = 'rilica8426@ekuali.com'
);

-- 4. Verify the fix
SELECT 
  'VERIFICATION' as info,
  '============' as separator;

-- Check if profile was created
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

-- Show all students
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

-- Count students
SELECT 
  'Total students count:' as info,
  COUNT(*) as total_students
FROM public.profiles
WHERE role = 'student';
