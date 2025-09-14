-- Simple fix for teacher dashboard issues
-- Run this in Supabase SQL Editor

-- 1. Clean orphaned data
DELETE FROM public.student_details WHERE user_id NOT IN (SELECT user_id FROM public.profiles WHERE role = 'student');
DELETE FROM public.student_meals WHERE user_id NOT IN (SELECT user_id FROM public.profiles);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'feedback',
  is_broadcast BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can create messages" ON public.messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Users can view their own messages" ON public.messages 
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can create messages" ON public.messages 
FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their own messages" ON public.messages 
FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- 5. Create sample students (using DO blocks to avoid conflicts)
DO $$
DECLARE
  student1_id UUID;
  student2_id UUID;
  student3_id UUID;
BEGIN
  -- Create student 1
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student1@test.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
      'student1@test.com', crypt('student123', gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"]}', '{}', now(), now()
    ) RETURNING id INTO student1_id;
  ELSE
    SELECT id INTO student1_id FROM auth.users WHERE email = 'student1@test.com';
  END IF;

  -- Create student 2
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student2@test.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
      'student2@test.com', crypt('student123', gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"]}', '{}', now(), now()
    ) RETURNING id INTO student2_id;
  ELSE
    SELECT id INTO student2_id FROM auth.users WHERE email = 'student2@test.com';
  END IF;

  -- Create student 3
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student3@test.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 
      'student3@test.com', crypt('student123', gen_salt('bf')), now(),
      '{"provider": "email", "providers": ["email"]}', '{}', now(), now()
    ) RETURNING id INTO student3_id;
  ELSE
    SELECT id INTO student3_id FROM auth.users WHERE email = 'student3@test.com';
  END IF;

  -- Create profiles
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = student1_id) THEN
    INSERT INTO public.profiles (user_id, first_name, last_name, email, age_group, role, created_at, updated_at)
    VALUES (student1_id, 'John', 'Doe', 'student1@test.com', '16-20', 'student', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = student2_id) THEN
    INSERT INTO public.profiles (user_id, first_name, last_name, email, age_group, role, created_at, updated_at)
    VALUES (student2_id, 'Jane', 'Smith', 'student2@test.com', '21+', 'student', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = student3_id) THEN
    INSERT INTO public.profiles (user_id, first_name, last_name, email, age_group, role, created_at, updated_at)
    VALUES (student3_id, 'Mike', 'Johnson', 'student3@test.com', '16-20', 'student', now(), now());
  END IF;

  -- Create student details
  IF NOT EXISTS (SELECT 1 FROM public.student_details WHERE user_id = student1_id) THEN
    INSERT INTO public.student_details (user_id, weight, height_cm, height_feet, body_type, goal, gender, created_at, updated_at)
    VALUES (student1_id, 70.0, 175.0, '5''9"', 'skinny', 'weight_gain', 'male', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.student_details WHERE user_id = student2_id) THEN
    INSERT INTO public.student_details (user_id, weight, height_cm, height_feet, body_type, goal, gender, created_at, updated_at)
    VALUES (student2_id, 65.0, 165.0, '5''5"', 'skinny_fat', 'balance_weight', 'female', now(), now());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.student_details WHERE user_id = student3_id) THEN
    INSERT INTO public.student_details (user_id, weight, height_cm, height_feet, body_type, goal, gender, created_at, updated_at)
    VALUES (student3_id, 80.0, 180.0, '5''11"', 'fat', 'weight_loss', 'male', now(), now());
  END IF;

  -- Create sample meals
  IF NOT EXISTS (SELECT 1 FROM public.student_meals WHERE user_id = student1_id AND meal_name = 'Breakfast') THEN
    INSERT INTO public.student_meals (user_id, meal_name, meal_type, student_class, description, estimated_calories, created_at)
    VALUES (student1_id, 'Breakfast', 'breakfast', '11-12', 'Healthy breakfast with eggs and toast', 450, now() - interval '1 hour');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.student_meals WHERE user_id = student2_id AND meal_name = 'Lunch') THEN
    INSERT INTO public.student_meals (user_id, meal_name, meal_type, student_class, description, estimated_calories, created_at)
    VALUES (student2_id, 'Lunch', 'lunch', 'college', 'Balanced lunch with salad and protein', 650, now() - interval '2 hours');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.student_meals WHERE user_id = student3_id AND meal_name = 'Dinner') THEN
    INSERT INTO public.student_meals (user_id, meal_name, meal_type, student_class, description, estimated_calories, created_at)
    VALUES (student3_id, 'Dinner', 'dinner', '11-12', 'Nutritious dinner with vegetables and lean meat', 750, now() - interval '30 minutes');
  END IF;

END $$;

-- 6. Verify setup
SELECT 
  'Setup complete!' as status,
  (SELECT COUNT(*) FROM public.profiles WHERE role = 'student') as students,
  (SELECT COUNT(*) FROM public.student_details) as student_details,
  (SELECT COUNT(*) FROM public.student_meals) as meals,
  (SELECT COUNT(*) FROM public.messages) as messages;
