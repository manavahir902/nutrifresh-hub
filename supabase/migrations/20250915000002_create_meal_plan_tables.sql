-- Create personalized_meal_plan_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.personalized_meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  quantity_grams DECIMAL(8,2) NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, day_of_week, meal_type, food_item_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_personalized_meal_plan_items_user_id ON public.personalized_meal_plan_items(user_id);
CREATE INDEX IF NOT EXISTS idx_personalized_meal_plan_items_day_meal ON public.personalized_meal_plan_items(day_of_week, meal_type);

-- Enable RLS
ALTER TABLE public.personalized_meal_plan_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own meal plan items" ON public.personalized_meal_plan_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meal plan items" ON public.personalized_meal_plan_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plan items" ON public.personalized_meal_plan_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plan items" ON public.personalized_meal_plan_items
  FOR DELETE USING (auth.uid() = user_id);

-- Teachers and admins can view all meal plan items
CREATE POLICY "Teachers can view all meal plan items" ON public.personalized_meal_plan_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role IN ('teacher', 'admin')
    )
  );
