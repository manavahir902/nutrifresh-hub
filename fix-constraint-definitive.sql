-- Definitive fix for foreign key constraint issue
-- This will completely remove and recreate the constraint correctly

-- 1. First, let's see what constraints exist
SELECT 
  'Current constraints on profiles table:' as info,
  conname as constraint_name,
  confrelid::regclass as referenced_table,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'f';

-- 2. Drop ALL foreign key constraints on profiles table
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

-- 3. Verify all constraints are dropped
SELECT 
  'Constraints after dropping:' as info,
  COUNT(*) as remaining_constraints
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'f';

-- 4. Create the correct foreign key constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Verify the new constraint
SELECT 
  'New constraint created:' as info,
  conname as constraint_name,
  confrelid::regclass as referenced_table,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'f';

-- 6. Now try to create the profile
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

-- 7. Verify the profile was created
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

-- 8. Show all students
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
