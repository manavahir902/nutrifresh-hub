-- Create teacher_credentials table for admin-managed teacher accounts
CREATE TABLE IF NOT EXISTS public.teacher_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_code TEXT NOT NULL UNIQUE, -- Admin-generated unique code
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id), -- Admin who created this
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for teacher-student communication
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for broadcast messages
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('feedback', 'announcement', 'suggestion', 'reminder')),
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_broadcast BOOLEAN NOT NULL DEFAULT false, -- For messages to all students
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create ai_suggestions table for daily tips and facts
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

-- Create personalized_meal_plans table
CREATE TABLE IF NOT EXISTS public.personalized_meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  description TEXT,
  target_calories INTEGER NOT NULL,
  target_protein INTEGER NOT NULL,
  target_carbs INTEGER NOT NULL,
  target_fat INTEGER NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personalized_meal_plan_items table
CREATE TABLE IF NOT EXISTS public.personalized_meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.personalized_meal_plans(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items(id),
  quantity_grams INTEGER NOT NULL DEFAULT 100,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_analytics table
CREATE TABLE IF NOT EXISTS public.student_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metric_unit TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.teacher_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for teacher_credentials (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can view all teacher credentials') THEN
    CREATE POLICY "Admins can view all teacher credentials" ON public.teacher_credentials FOR SELECT USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can create teacher credentials') THEN
    CREATE POLICY "Admins can create teacher credentials" ON public.teacher_credentials FOR INSERT WITH CHECK (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can update teacher credentials') THEN
    CREATE POLICY "Admins can update teacher credentials" ON public.teacher_credentials FOR UPDATE USING (public.is_admin());
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teacher_credentials' AND policyname = 'Admins can delete teacher credentials') THEN
    CREATE POLICY "Admins can delete teacher credentials" ON public.teacher_credentials FOR DELETE USING (public.is_admin());
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teacher_credentials_teacher_id ON public.teacher_credentials(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_credentials_code ON public.teacher_credentials(teacher_code);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON public.ai_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_personalized_meal_plans_student_id ON public.personalized_meal_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_student_analytics_student_id ON public.student_analytics(student_id);
