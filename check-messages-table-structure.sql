-- Check the actual structure of the messages table
-- This will show us the correct column names

-- 1. Get messages table structure
SELECT 
  'Messages table structure:' as info,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'messages'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Get sample data from messages table
SELECT 
  'Sample messages data:' as info,
  *
FROM public.messages
LIMIT 5;

-- 3. Check if there are any messages
SELECT 
  'Messages count:' as info,
  COUNT(*) as total_messages
FROM public.messages;
