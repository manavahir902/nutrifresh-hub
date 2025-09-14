-- Fix profile creation issue during signup
-- The issue is that profile creation happens immediately after signup
-- but there's a timing issue with the foreign key constraint

-- 1. First, let's check if the user exists in auth.users
-- (This is a diagnostic query - we can't directly query auth.users from here)
SELECT 'Checking for missing profiles...' as info;

-- 2. Let's create a function to handle profile creation with proper error handling
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id UUID,
  p_first_name TEXT,
  p_last_name TEXT,
  p_email TEXT,
  p_age_group TEXT,
  p_role TEXT
) RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Try to insert the profile
  INSERT INTO public.profiles (
    user_id,
    first_name,
    last_name,
    email,
    age_group,
    role,
    created_at,
    updated_at
  ) VALUES (
    p_user_id,
    p_first_name,
    p_last_name,
    p_email,
    p_age_group,
    p_role,
    now(),
    now()
  );
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'Profile created successfully'
  );
  
  RETURN result;
  
EXCEPTION
  WHEN foreign_key_violation THEN
    -- User doesn't exist in auth.users yet
    result := json_build_object(
      'success', false,
      'error', 'User not found in auth system',
      'message', 'Please wait a moment and try again'
    );
    RETURN result;
    
  WHEN unique_violation THEN
    -- Profile already exists
    result := json_build_object(
      'success', false,
      'error', 'Profile already exists',
      'message', 'User already has a profile'
    );
    RETURN result;
    
  WHEN OTHERS THEN
    -- Other error
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'message', 'Profile creation failed'
    );
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_user_profile TO authenticated;

-- 4. Let's also check if we can manually create the missing profile
-- First, let's see if we can find the user ID by checking recent profiles
SELECT 
  'Recent profile creation attempts:' as info,
  COUNT(*) as total_attempts
FROM public.profiles 
WHERE created_at > now() - interval '1 hour';

-- 5. Show current profiles count by role
SELECT 
  'Current profiles by role:' as info,
  role,
  COUNT(*) as count
FROM public.profiles 
GROUP BY role
ORDER BY role;
