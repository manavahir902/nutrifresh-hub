-- Database Normalization and Schema Improvements
-- This script normalizes the database schema and fixes relationships

-- 1. Create proper notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('message', 'ai_suggestion', 'meal_reminder', 'achievement')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Add missing columns to existing tables
ALTER TABLE public.student_meals 
ADD COLUMN IF NOT EXISTS meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS meal_type TEXT NOT NULL DEFAULT 'lunch' CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
ADD COLUMN IF NOT EXISTS student_class TEXT,
ADD COLUMN IF NOT EXISTS estimated_calories INTEGER,
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(8,2);

-- 3. Create student_meal_items table for better normalization
CREATE TABLE IF NOT EXISTS public.student_meal_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_meal_id UUID NOT NULL REFERENCES public.student_meals(id) ON DELETE CASCADE,
  food_item_id UUID REFERENCES public.food_items(id) ON DELETE CASCADE,
  quantity_grams INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Add nutritional information to food_items
ALTER TABLE public.food_items 
ADD COLUMN IF NOT EXISTS protein_per_100g DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS carbs_per_100g DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fats_per_100g DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS fiber_per_100g DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sugar_per_100g DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS sodium_per_100g DECIMAL(5,2) DEFAULT 0;

-- 5. Create user_achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('streak', 'goal_met', 'milestone', 'special')),
  achievement_name TEXT NOT NULL,
  description TEXT,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB
);

-- 6. Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dietary_preference TEXT CHECK (dietary_preference IN ('vegetarian', 'vegan', 'omnivore', 'pescatarian')),
  allergies TEXT[],
  disliked_foods TEXT[],
  preferred_cuisines TEXT[],
  meal_timing_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- 7. Create meal_reminders table
CREATE TABLE IF NOT EXISTS public.meal_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  reminder_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  days_of_week INTEGER[] NOT NULL DEFAULT '{1,2,3,4,5,6,7}', -- 1=Monday, 7=Sunday
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Enable RLS on new tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_reminders ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS policies for new tables

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
FOR INSERT WITH CHECK (true);

-- Student meal items policies
CREATE POLICY "Users can view their own meal items" ON public.student_meal_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_meals 
    WHERE id = student_meal_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own meal items" ON public.student_meal_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.student_meals 
    WHERE id = student_meal_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own meal items" ON public.student_meal_items
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.student_meals 
    WHERE id = student_meal_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own meal items" ON public.student_meal_items
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.student_meals 
    WHERE id = student_meal_id AND user_id = auth.uid()
  )
);

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create achievements" ON public.user_achievements
FOR INSERT WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON public.user_preferences
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
FOR UPDATE USING (auth.uid() = user_id);

-- Meal reminders policies
CREATE POLICY "Users can view their own reminders" ON public.meal_reminders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" ON public.meal_reminders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" ON public.meal_reminders
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" ON public.meal_reminders
FOR DELETE USING (auth.uid() = user_id);

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_student_meal_items_meal_id ON public.student_meal_items(student_meal_id);
CREATE INDEX IF NOT EXISTS idx_student_meal_items_food_id ON public.student_meal_items(food_item_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON public.user_achievements(achievement_type);

CREATE INDEX IF NOT EXISTS idx_meal_reminders_user_id ON public.meal_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_reminders_meal_type ON public.meal_reminders(meal_type);

-- 11. Create functions for common operations

-- Function to create notification when message is sent
CREATE OR REPLACE FUNCTION public.create_message_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    message_id,
    notification_type,
    title,
    content
  ) VALUES (
    NEW.recipient_id,
    NEW.id,
    'message',
    'New Message: ' || NEW.subject,
    NEW.content
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when message is sent
DROP TRIGGER IF EXISTS trigger_create_message_notification ON public.messages;
CREATE TRIGGER trigger_create_message_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW
  WHEN (NEW.recipient_id IS NOT NULL)
  EXECUTE FUNCTION public.create_message_notification();

-- Function to create notification for AI suggestions
CREATE OR REPLACE FUNCTION public.create_ai_suggestion_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (
    user_id,
    notification_type,
    title,
    content
  )
  SELECT 
    p.user_id,
    'ai_suggestion',
    'New AI Suggestion: ' || NEW.title,
    NEW.content
  FROM public.profiles p
  WHERE p.role = 'student'
  AND NEW.target_audience IN ('all', 'students');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when AI suggestion is created
DROP TRIGGER IF EXISTS trigger_create_ai_suggestion_notification ON public.ai_suggestions;
CREATE TRIGGER trigger_create_ai_suggestion_notification
  AFTER INSERT ON public.ai_suggestions
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION public.create_ai_suggestion_notification();

-- 12. Update existing data with proper nutritional information
UPDATE public.food_items SET
  protein_per_100g = CASE 
    WHEN name ILIKE '%chicken%' THEN 25.0
    WHEN name ILIKE '%fish%' THEN 22.0
    WHEN name ILIKE '%egg%' THEN 13.0
    WHEN name ILIKE '%milk%' OR name ILIKE '%yogurt%' THEN 3.5
    WHEN name ILIKE '%rice%' THEN 2.7
    WHEN name ILIKE '%bread%' THEN 9.0
    WHEN name ILIKE '%apple%' THEN 0.3
    WHEN name ILIKE '%banana%' THEN 1.1
    ELSE 5.0
  END,
  carbs_per_100g = CASE
    WHEN name ILIKE '%rice%' THEN 28.0
    WHEN name ILIKE '%bread%' THEN 49.0
    WHEN name ILIKE '%apple%' THEN 14.0
    WHEN name ILIKE '%banana%' THEN 23.0
    WHEN name ILIKE '%potato%' THEN 17.0
    ELSE 15.0
  END,
  fats_per_100g = CASE
    WHEN name ILIKE '%chicken%' THEN 3.6
    WHEN name ILIKE '%fish%' THEN 12.0
    WHEN name ILIKE '%egg%' THEN 11.0
    WHEN name ILIKE '%milk%' THEN 3.2
    WHEN name ILIKE '%oil%' THEN 100.0
    ELSE 2.0
  END
WHERE protein_per_100g = 0 OR carbs_per_100g = 0 OR fats_per_100g = 0;

-- 13. Create view for easy meal tracking
CREATE OR REPLACE VIEW public.meal_tracking_view AS
SELECT 
  sm.id,
  sm.user_id,
  sm.meal_name,
  sm.meal_date,
  sm.meal_type,
  sm.estimated_calories,
  sm.estimated_cost,
  sm.created_at,
  COALESCE(
    SUM((smi.quantity_grams / 100.0) * fi.calories_per_100g),
    sm.estimated_calories
  ) as total_calories,
  COALESCE(
    SUM((smi.quantity_grams / 100.0) * fi.protein_per_100g),
    0
  ) as total_protein,
  COALESCE(
    SUM((smi.quantity_grams / 100.0) * fi.carbs_per_100g),
    0
  ) as total_carbs,
  COALESCE(
    SUM((smi.quantity_grams / 100.0) * fi.fats_per_100g),
    0
  ) as total_fats
FROM public.student_meals sm
LEFT JOIN public.student_meal_items smi ON sm.id = smi.student_meal_id
LEFT JOIN public.food_items fi ON smi.food_item_id = fi.id
GROUP BY sm.id, sm.user_id, sm.meal_name, sm.meal_date, sm.meal_type, sm.estimated_calories, sm.estimated_cost, sm.created_at;

-- Grant access to the view
GRANT SELECT ON public.meal_tracking_view TO authenticated;

-- 14. Create function to calculate daily nutrition totals
CREATE OR REPLACE FUNCTION public.get_daily_nutrition_totals(
  target_user_id UUID,
  target_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_calories NUMERIC,
  total_protein NUMERIC,
  total_carbs NUMERIC,
  total_fats NUMERIC,
  meal_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(mtv.total_calories), 0) as total_calories,
    COALESCE(SUM(mtv.total_protein), 0) as total_protein,
    COALESCE(SUM(mtv.total_carbs), 0) as total_carbs,
    COALESCE(SUM(mtv.total_fats), 0) as total_fats,
    COUNT(*)::INTEGER as meal_count
  FROM public.meal_tracking_view mtv
  WHERE mtv.user_id = target_user_id
  AND mtv.meal_date = target_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_daily_nutrition_totals TO authenticated;

-- 15. Final verification
SELECT 
  'Database normalization completed successfully!' as status,
  (SELECT COUNT(*) FROM public.notifications) as notifications_count,
  (SELECT COUNT(*) FROM public.user_achievements) as achievements_count,
  (SELECT COUNT(*) FROM public.user_preferences) as preferences_count,
  (SELECT COUNT(*) FROM public.meal_reminders) as reminders_count;
