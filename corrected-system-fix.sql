-- Corrected System Fix
-- This fixes the column name issue in the messages table

-- 1. ANALYSIS - Show current state
SELECT 
  'SYSTEM ANALYSIS' as section,
  '===============' as separator;

-- Count users vs profiles
SELECT 
  'User vs Profile counts:' as info,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.profiles p ON au.id = p.user_id WHERE p.user_id IS NULL) as missing_profiles;

-- Show missing profiles
SELECT 
  'Missing profiles (users without profiles):' as info,
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY au.created_at DESC;

-- 2. FIX FOREIGN KEY CONSTRAINT
SELECT 
  'FIXING FOREIGN KEY CONSTRAINT' as section,
  '=============================' as separator;

-- Drop existing foreign key constraints
DO $$ 
DECLARE
    constraint_name text;
BEGIN
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

-- Create correct foreign key constraint
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. CREATE MISSING PROFILES
SELECT 
  'CREATING MISSING PROFILES' as section,
  '========================' as separator;

-- Create profiles for all users who don't have them
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
  COALESCE(au.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(au.raw_user_meta_data->>'last_name', 'Name'),
  au.email,
  COALESCE(au.raw_user_meta_data->>'age_group', '21+'),
  COALESCE(au.raw_user_meta_data->>'role', 'student'),
  au.created_at,
  now()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL;

-- 4. FIX MESSAGES TABLE RLS POLICIES
SELECT 
  'FIXING MESSAGES RLS POLICIES' as section,
  '============================' as separator;

-- Drop existing RLS policies on messages
DROP POLICY IF EXISTS "Teachers can send messages" ON public.messages;
DROP POLICY IF EXISTS "Students can view their messages" ON public.messages;
DROP POLICY IF EXISTS "Teachers can view their sent messages" ON public.messages;
DROP POLICY IF EXISTS "Teachers can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;

-- Create proper RLS policies for messages
CREATE POLICY "Teachers can send messages" ON public.messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'teacher'
  )
);

CREATE POLICY "Students can view their messages" ON public.messages
FOR SELECT USING (
  recipient_id = auth.uid() OR
  (is_broadcast = true AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'student'
  ))
);

CREATE POLICY "Teachers can view their sent messages" ON public.messages
FOR SELECT USING (
  sender_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'teacher'
  )
);

-- 5. VERIFICATION
SELECT 
  'VERIFICATION' as section,
  '============' as separator;

-- Check final counts
SELECT 
  'Final counts after fix:' as info,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.profiles p ON au.id = p.user_id WHERE p.user_id IS NULL) as missing_profiles;

-- Show all profiles by role
SELECT 
  'Profiles by role:' as info,
  role,
  COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY role;

-- Show all students
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

-- Check RLS policies on messages
SELECT 
  'RLS policies on messages table:' as info,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'messages'
AND schemaname = 'public';
