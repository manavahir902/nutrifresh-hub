-- Fix user roles and ensure proper student data
-- Run this in Supabase SQL Editor

-- 1. Check current user roles
SELECT 
  'Current user roles:' as info,
  role,
  COUNT(*) as count
FROM public.profiles 
GROUP BY role
ORDER BY role;

-- 2. Update any users that should be students (you can modify this based on your needs)
-- For now, let's create some additional test students with proper data

-- Create additional test students
DO $$
DECLARE
  student4_id UUID;
  student5_id UUID;
BEGIN
  -- Create student 4
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student4@test.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
      'student4@test.com', crypt('student123', gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"]}', '{}', now(), now()
    ) RETURNING id INTO student4_id;
  ELSE
    SELECT id INTO student4_id FROM auth.users WHERE email = 'student4@test.com';
  END IF;

  -- Create student 5
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student5@test.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
      'student5@test.com', crypt('student123', gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"]}', '{}', now(), now()
    ) RETURNING id INTO student5_id;
  ELSE
    SELECT id INTO student5_id FROM auth.users WHERE email = 'student5@test.com';
  END IF;

  -- Create profiles
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = student4_id) THEN
    INSERT INTO public.profiles (user_id, first_name, last_name, email, age_group, role, created_at, updated_at)
    VALUES (student4_id, 'Sarah', 'Wilson', 'student4@test.com', '16-20', 'student', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = student5_id) THEN
    INSERT INTO public.profiles (user_id, first_name, last_name, email, age_group, role, created_at, updated_at)
    VALUES (student5_id, 'Alex', 'Brown', 'student5@test.com', '21+', 'student', now(), now());
  END IF;

  -- Create student details
  IF NOT EXISTS (SELECT 1 FROM public.student_details WHERE user_id = student4_id) THEN
    INSERT INTO public.student_details (user_id, weight, height_cm, height_feet, body_type, goal, gender, created_at, updated_at)
    VALUES (student4_id, 55.0, 160.0, '5''3"', 'skinny', 'weight_gain', 'female', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.student_details WHERE user_id = student5_id) THEN
    INSERT INTO public.student_details (user_id, weight, height_cm, height_feet, body_type, goal, gender, created_at, updated_at)
    VALUES (student5_id, 75.0, 185.0, '6''1"', 'skinny_fat', 'balance_weight', 'male', now(), now());
  END IF;

  -- Create sample meals
  IF NOT EXISTS (SELECT 1 FROM public.student_meals WHERE user_id = student4_id AND meal_name = 'Breakfast') THEN
    INSERT INTO public.student_meals (user_id, meal_name, meal_type, student_class, description, estimated_calories, created_at)
    VALUES (student4_id, 'Breakfast', 'breakfast', '11-12', 'Oatmeal with fruits', 350, now() - interval '3 hours');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.student_meals WHERE user_id = student4_id AND meal_name = 'Lunch') THEN
    INSERT INTO public.student_meals (user_id, meal_name, meal_type, student_class, description, estimated_calories, created_at)
    VALUES (student4_id, 'Lunch', 'lunch', '11-12', 'Chicken salad', 500, now() - interval '1 hour');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.student_meals WHERE user_id = student5_id AND meal_name = 'Dinner') THEN
    INSERT INTO public.student_meals (user_id, meal_name, meal_type, student_class, description, estimated_calories, created_at)
    VALUES (student5_id, 'Dinner', 'dinner', 'college', 'Grilled fish with vegetables', 600, now() - interval '30 minutes');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.student_meals WHERE user_id = student5_id AND meal_name = 'Snack') THEN
    INSERT INTO public.student_meals (user_id, meal_name, meal_type, student_class, description, estimated_calories, created_at)
    VALUES (student5_id, 'Snack', 'snack', 'college', 'Protein shake', 250, now() - interval '15 minutes');
  END IF;

END $$;

-- 3. Verify the setup
SELECT 
  'Setup complete!' as status,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as students,
  (SELECT COUNT(*) FROM public.student_details) as student_details,
  (SELECT COUNT(*) FROM public.student_meals) as meals,
  (SELECT COUNT(*) FROM public.messages) as messages;

-- 4. Show all students
SELECT 
  'All students:' as info,
  first_name,
  last_name,
  email,
  age_group
FROM public.profiles 
WHERE role = 'student'
ORDER BY first_name;
