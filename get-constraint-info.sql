-- Get detailed constraint information
-- Run this in Supabase SQL Editor to understand the current state

-- 1. Get all foreign key constraints on profiles table
SELECT 
  'Foreign Key Constraints on profiles table:' as info,
  conname as constraint_name,
  confrelid::regclass as referenced_table,
  conkey as local_columns,
  confkey as foreign_columns,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'f';

-- 2. Check if auth.users table exists and is accessible
SELECT 
  'Checking auth.users table:' as info,
  COUNT(*) as user_count
FROM auth.users;

-- 3. Check if the specific user exists in auth.users
SELECT 
  'User rilica8426@ekuali.com in auth.users:' as info,
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'rilica8426@ekuali.com';

-- 4. Check if there's a 'users' table (which the constraint might be pointing to)
SELECT 
  'Checking if users table exists:' as info,
  table_name,
  table_schema
FROM information_schema.tables
WHERE table_name = 'users'
AND table_schema IN ('public', 'auth');

-- 5. Get all tables in public schema
SELECT 
  'All tables in public schema:' as info,
  table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 6. Get all tables in auth schema
SELECT 
  'All tables in auth schema:' as info,
  table_name
FROM information_schema.tables
WHERE table_schema = 'auth'
ORDER BY table_name;
