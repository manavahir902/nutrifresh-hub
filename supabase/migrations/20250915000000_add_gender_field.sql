-- Add gender field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other'));

-- Update the age_group constraint to include the new age groups
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_age_group_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_age_group_check 
CHECK (age_group IN ('5-10', '11-15', '16-20', '18-20', '21-25', '26-30', '31+', '21+'));
