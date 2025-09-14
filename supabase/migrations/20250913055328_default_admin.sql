-- Create default admin account
-- This migration creates a default admin user with username: admin, password: admin123

-- Insert the admin user into auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@nutrifresh.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  null,
  null,
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Get the admin user ID
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@nutrifresh.com';
  
  -- Insert admin profile
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
    admin_user_id,
    'Admin',
    'User',
    'admin@nutrifresh.com',
    '21+',
    'admin',
    now(),
    now()
  );
END $$;
