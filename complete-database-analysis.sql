-- Complete Database Analysis
-- This will show us the full picture of users, profiles, and messages

-- 1. All users in auth.users
SELECT 
  'AUTH USERS ANALYSIS' as section,
  '==================' as separator;

SELECT 
  'All users in auth.users:' as info,
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. All profiles
SELECT 
  'PROFILES ANALYSIS' as section,
  '================' as separator;

SELECT 
  'All profiles:' as info,
  user_id,
  first_name,
  last_name,
  email,
  role,
  age_group,
  created_at
FROM public.profiles
ORDER BY created_at DESC;

-- 3. Users in auth.users but NOT in profiles (missing profiles)
SELECT 
  'MISSING PROFILES ANALYSIS' as section,
  '========================' as separator;

SELECT 
  'Users in auth.users but NOT in profiles:' as info,
  au.id,
  au.email,
  au.created_at,
  au.email_confirmed_at,
  CASE 
    WHEN au.email_confirmed_at IS NOT NULL THEN 'Confirmed'
    ELSE 'Not Confirmed'
  END as confirmation_status
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY au.created_at DESC;

-- 4. Messages table analysis
SELECT 
  'MESSAGES ANALYSIS' as section,
  '================' as separator;

-- Check if messages table exists and get its structure
SELECT 
  'Messages table structure:' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'messages'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Get all messages
SELECT 
  'All messages:' as info,
  id,
  sender_id,
  recipient_id,
  message,
  created_at
FROM public.messages
ORDER BY created_at DESC;

-- 5. RLS Policies analysis
SELECT 
  'RLS POLICIES ANALYSIS' as section,
  '====================' as separator;

-- Check RLS policies on messages table
SELECT 
  'RLS policies on messages table:' as info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'messages'
AND schemaname = 'public';

-- Check RLS policies on profiles table
SELECT 
  'RLS policies on profiles table:' as info,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
AND schemaname = 'public';

-- 6. Summary
SELECT 
  'SUMMARY' as section,
  '=======' as separator;

SELECT 
  'Summary counts:' as info,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  (SELECT COUNT(*) FROM public.messages) as total_messages,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN public.profiles p ON au.id = p.user_id WHERE p.user_id IS NULL) as missing_profiles;
