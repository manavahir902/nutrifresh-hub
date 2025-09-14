-- Create teacher_credentials table for admin-managed teacher accounts
CREATE TABLE public.teacher_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_code TEXT NOT NULL UNIQUE, -- Admin-generated unique code
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id), -- Admin who created this
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table for teacher-student communication
CREATE TABLE public.messages (
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
CREATE TABLE public.ai_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('nutrition_tip', 'health_fact', 'exercise_tip', 'motivation', 'recipe')),
  target_audience TEXT NOT NULL CHECK (target_audience IN ('all', 'students', 'teachers')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personalized_meal_plans table for AI-generated meal plans
CREATE TABLE public.personalized_meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('weight_gain', 'weight_loss', 'maintenance', 'muscle_building')),
  duration_days INTEGER NOT NULL DEFAULT 7,
  daily_calories INTEGER NOT NULL,
  daily_protein INTEGER NOT NULL,
  daily_carbs INTEGER NOT NULL,
  daily_fats INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id), -- Teacher who created this
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create personalized_meal_plan_items table
CREATE TABLE public.personalized_meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.personalized_meal_plans(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  quantity_grams INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student_analytics table for tracking performance
CREATE TABLE public.student_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meals_logged INTEGER NOT NULL DEFAULT 0,
  calories_consumed INTEGER NOT NULL DEFAULT 0,
  protein_consumed INTEGER NOT NULL DEFAULT 0,
  carbs_consumed INTEGER NOT NULL DEFAULT 0,
  fats_consumed INTEGER NOT NULL DEFAULT 0,
  water_intake_ml INTEGER NOT NULL DEFAULT 0,
  exercise_minutes INTEGER NOT NULL DEFAULT 0,
  mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.teacher_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teacher_credentials
CREATE POLICY "Teachers can view their own credentials" ON public.teacher_credentials 
FOR SELECT USING (auth.uid() = teacher_id);

CREATE POLICY "Admins can manage all teacher credentials" ON public.teacher_credentials 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for messages
CREATE POLICY "Users can view messages sent to them" ON public.messages 
FOR SELECT USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY "Teachers can send messages" ON public.messages 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Users can update their own message read status" ON public.messages 
FOR UPDATE USING (auth.uid() = recipient_id);

-- RLS Policies for ai_suggestions
CREATE POLICY "Everyone can view active AI suggestions" ON public.ai_suggestions 
FOR SELECT USING (is_active = true);

CREATE POLICY "Teachers and admins can manage AI suggestions" ON public.ai_suggestions 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

-- RLS Policies for personalized_meal_plans
CREATE POLICY "Students can view their own meal plans" ON public.personalized_meal_plans 
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all meal plans" ON public.personalized_meal_plans 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Teachers can create meal plans" ON public.personalized_meal_plans 
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

-- RLS Policies for personalized_meal_plan_items
CREATE POLICY "Users can view meal plan items for accessible meal plans" ON public.personalized_meal_plan_items 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.personalized_meal_plans pmp 
    WHERE pmp.id = meal_plan_id AND (
      pmp.student_id = auth.uid() OR 
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
      )
    )
  )
);

-- RLS Policies for student_analytics
CREATE POLICY "Students can view their own analytics" ON public.student_analytics 
FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Teachers can view all student analytics" ON public.student_analytics 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
  )
);

CREATE POLICY "Students can insert their own analytics" ON public.student_analytics 
FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Create triggers for timestamp updates
CREATE TRIGGER update_teacher_credentials_updated_at 
BEFORE UPDATE ON public.teacher_credentials 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_suggestions_updated_at 
BEFORE UPDATE ON public.ai_suggestions 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personalized_meal_plans_updated_at 
BEFORE UPDATE ON public.personalized_meal_plans 
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_student_analytics_student_id ON public.student_analytics(student_id);
CREATE INDEX idx_student_analytics_date ON public.student_analytics(date);
CREATE INDEX idx_personalized_meal_plans_student_id ON public.personalized_meal_plans(student_id);
CREATE INDEX idx_ai_suggestions_category ON public.ai_suggestions(category);
CREATE INDEX idx_ai_suggestions_is_active ON public.ai_suggestions(is_active);

-- Sample AI suggestions will be inserted after admin user is created
