-- Simple Database Fix - No Column Name Issues
-- This script fixes the database without causing column errors

-- 1. Ensure messages table exists with correct structure
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('feedback', 'announcement', 'suggestion', 'reminder')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_broadcast BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- 2. Ensure ai_suggestions table exists
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('tip', 'fact', 'reminder', 'motivation')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'students', 'teachers')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

-- 4. Create helper functions if they don't exist
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_student()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'student'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create RLS policies for messages
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages
FOR SELECT USING (
  auth.uid() = sender_id OR 
  auth.uid() = recipient_id OR 
  (is_broadcast = true AND public.is_student())
);

DROP POLICY IF EXISTS "Teachers can send messages" ON public.messages;
CREATE POLICY "Teachers can send messages" ON public.messages
FOR INSERT WITH CHECK (public.is_teacher());

DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;
CREATE POLICY "Users can update their own messages" ON public.messages
FOR UPDATE USING (auth.uid() = recipient_id);

-- 6. Create RLS policies for ai_suggestions
DROP POLICY IF EXISTS "Everyone can view active AI suggestions" ON public.ai_suggestions;
CREATE POLICY "Everyone can view active AI suggestions" ON public.ai_suggestions
FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Teachers and admins can create AI suggestions" ON public.ai_suggestions;
CREATE POLICY "Teachers and admins can create AI suggestions" ON public.ai_suggestions
FOR INSERT WITH CHECK (public.is_teacher() OR public.is_admin());

-- 7. Insert sample AI suggestions
INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, is_active, created_by)
SELECT 
  'Daily Hydration Tip',
  'Drink at least 8 glasses of water daily to stay hydrated and support your metabolism.',
  'tip',
  'students',
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Daily Hydration Tip');

INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, is_active, created_by)
SELECT 
  'Healthy Breakfast',
  'Start your day with a balanced breakfast containing protein, complex carbs, and healthy fats.',
  'tip',
  'students',
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Healthy Breakfast');

INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, is_active, created_by)
SELECT 
  'Portion Control',
  'Use your hand as a guide: palm for protein, fist for vegetables, cupped hand for carbs.',
  'tip',
  'students',
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Portion Control');

INSERT INTO public.ai_suggestions (title, content, suggestion_type, target_audience, is_active, created_by)
SELECT 
  'Meal Timing',
  'Eat every 3-4 hours to maintain stable blood sugar and energy levels throughout the day.',
  'tip',
  'students',
  true,
  (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.ai_suggestions WHERE title = 'Meal Timing');

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);
CREATE INDEX IF NOT EXISTS idx_messages_is_broadcast ON public.messages(is_broadcast);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_target_audience ON public.ai_suggestions(target_audience);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_is_active ON public.ai_suggestions(is_active);

-- 9. Grant permissions
GRANT SELECT ON public.messages TO authenticated;
GRANT INSERT ON public.messages TO authenticated;
GRANT UPDATE ON public.messages TO authenticated;

GRANT SELECT ON public.ai_suggestions TO authenticated;
GRANT INSERT ON public.ai_suggestions TO authenticated;

-- 10. Success message
SELECT 'Database setup completed successfully!' as status;
