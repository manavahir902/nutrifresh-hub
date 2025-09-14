-- Fix profiles table issues
-- This migration addresses the 406 errors on profiles table

-- Step 1: Check if gender column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'gender'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN gender TEXT;
    END IF;
END $$;

-- Step 2: Update age_group constraint to match what the app expects
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_age_group_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_age_group_check 
  CHECK (age_group IN ('5-10', '11-15', '16-20', '21+', '18-20', '21-25'));

-- Step 3: Ensure all required columns exist
DO $$ 
BEGIN
    -- Add any missing columns that might be causing 406 errors
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'first_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_name'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN last_name TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

-- Step 4: Update RLS policies for profiles to be more permissive for testing
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 5: Add a policy for teachers and admins to view all profiles
CREATE POLICY "Teachers can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('teacher', 'admin')
    )
  );
