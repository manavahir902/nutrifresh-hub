-- Fix teacher profile for manavahir902@gmail.com
-- Run this in Supabase SQL Editor

-- 1. Check if the user exists in auth.users
SELECT 
  'Checking auth.users for manavahir902@gmail.com' as info,
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'manavahir902@gmail.com';

-- 2. Create profile for manavahir902@gmail.com if it doesn't exist
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get the user ID from auth.users
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'manavahir902@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    -- Check if profile already exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = target_user_id) THEN
      -- Create profile
      INSERT INTO public.profiles (user_id, first_name, last_name, email, age_group, role, created_at, updated_at)
      VALUES (target_user_id, 'Manav', 'Ahir', 'manavahir902@gmail.com', '21+', 'teacher', now(), now());
      
      RAISE NOTICE 'Profile created for manavahir902@gmail.com';
    ELSE
      RAISE NOTICE 'Profile already exists for manavahir902@gmail.com';
    END IF;
  ELSE
    RAISE NOTICE 'User manavahir902@gmail.com not found in auth.users';
  END IF;
END $$;

-- 3. Verify the profile was created
SELECT 
  'Profile verification' as info,
  user_id,
  first_name,
  last_name,
  email,
  role,
  created_at
FROM public.profiles 
WHERE email = 'manavahir902@gmail.com';

-- 4. Test RLS policies by checking if teacher can see students
SELECT 
  'RLS Test - Students visible to teacher' as info,
  COUNT(*) as student_count
FROM public.profiles 
WHERE role = 'student';

-- 5. Test RLS policies by checking if teacher can see meals
SELECT 
  'RLS Test - Meals visible to teacher' as info,
  COUNT(*) as meal_count
FROM public.student_meals;
