-- Database diagnostic script
-- This will help us understand the current database structure

-- Check all tables in the public schema
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check all columns in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check all policies on profiles table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND schemaname = 'public';

-- Check all policies on messages table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'messages' 
AND schemaname = 'public';

-- Check all policies on ai_suggestions table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'ai_suggestions' 
AND schemaname = 'public';

-- Check all policies on personalized_meal_plan_items table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'personalized_meal_plan_items' 
AND schemaname = 'public';

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Count records in each table
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM public.profiles
UNION ALL
SELECT 'messages' as table_name, COUNT(*) as record_count FROM public.messages
UNION ALL
SELECT 'ai_suggestions' as table_name, COUNT(*) as record_count FROM public.ai_suggestions
UNION ALL
SELECT 'personalized_meal_plan_items' as table_name, COUNT(*) as record_count FROM public.personalized_meal_plan_items
UNION ALL
SELECT 'food_items' as table_name, COUNT(*) as record_count FROM public.food_items
UNION ALL
SELECT 'user_meals' as table_name, COUNT(*) as record_count FROM public.user_meals
UNION ALL
SELECT 'student_meals' as table_name, COUNT(*) as record_count FROM public.student_meals
UNION ALL
SELECT 'student_details' as table_name, COUNT(*) as record_count FROM public.student_details;
