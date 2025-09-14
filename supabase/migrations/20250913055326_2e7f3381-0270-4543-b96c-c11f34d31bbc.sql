-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  age_group TEXT NOT NULL CHECK (age_group IN ('5-10', '11-15', '16-20', '21+')),
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create student details table
CREATE TABLE public.student_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  height_cm INTEGER NOT NULL,
  height_feet TEXT NOT NULL,
  body_type TEXT NOT NULL CHECK (body_type IN ('skinny', 'skinny_fat', 'fat')),
  goal TEXT NOT NULL CHECK (goal IN ('weight_gain', 'weight_loss', 'balance_weight')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create food items table
CREATE TABLE public.food_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  calories_per_100g INTEGER NOT NULL,
  cost_per_100g_rupees DECIMAL(8,2) NOT NULL,
  is_veg BOOLEAN NOT NULL DEFAULT true,
  category TEXT NOT NULL DEFAULT 'main',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'cheat')),
  is_veg BOOLEAN NOT NULL DEFAULT true,
  total_calories INTEGER NOT NULL DEFAULT 0,
  total_cost DECIMAL(8,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal plan items table
CREATE TABLE public.meal_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meal_plan_id UUID NOT NULL REFERENCES public.meal_plans(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  quantity_grams INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user meals (logged meals) table
CREATE TABLE public.user_meals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  total_calories INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user meal items table
CREATE TABLE public.user_meal_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_meal_id UUID NOT NULL REFERENCES public.user_meals(id) ON DELETE CASCADE,
  food_item_id UUID NOT NULL REFERENCES public.food_items(id) ON DELETE CASCADE,
  quantity_grams INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_meal_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for student_details
CREATE POLICY "Users can view their own student details" ON public.student_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own student details" ON public.student_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own student details" ON public.student_details FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for food_items (public read access)
CREATE POLICY "Everyone can view food items" ON public.food_items FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can create food items" ON public.food_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create RLS policies for meal_plans
CREATE POLICY "Users can view their own meal plans" ON public.meal_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own meal plans" ON public.meal_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meal plans" ON public.meal_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meal plans" ON public.meal_plans FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for meal_plan_items
CREATE POLICY "Users can view meal plan items for their meal plans" ON public.meal_plan_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.meal_plans mp 
    WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create meal plan items for their meal plans" ON public.meal_plan_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meal_plans mp 
    WHERE mp.id = meal_plan_id AND mp.user_id = auth.uid()
  )
);

-- Create RLS policies for user_meals
CREATE POLICY "Users can view their own meals" ON public.user_meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own meals" ON public.user_meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own meals" ON public.user_meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own meals" ON public.user_meals FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for user_meal_items
CREATE POLICY "Users can view their meal items" ON public.user_meal_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_meals um 
    WHERE um.id = user_meal_id AND um.user_id = auth.uid()
  )
);
CREATE POLICY "Users can create their meal items" ON public.user_meal_items FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_meals um 
    WHERE um.id = user_meal_id AND um.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_student_details_updated_at BEFORE UPDATE ON public.student_details FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample food items
INSERT INTO public.food_items (name, calories_per_100g, cost_per_100g_rupees, is_veg, category) VALUES
-- Vegetarian items
('Rice (Basmati)', 130, 15, true, 'grain'),
('Wheat Roti', 260, 12, true, 'grain'),
('Dal (Lentils)', 116, 25, true, 'protein'),
('Paneer', 265, 80, true, 'protein'),
('Chicken Curry', 180, 120, false, 'protein'),
('Fish Curry', 150, 100, false, 'protein'),
('Mixed Vegetables', 45, 20, true, 'vegetable'),
('Curd/Yogurt', 60, 15, true, 'dairy'),
('Banana', 89, 10, true, 'fruit'),
('Apple', 52, 25, true, 'fruit'),
('Milk', 42, 8, true, 'dairy'),
('Egg', 155, 12, false, 'protein'),
-- Cheat meal items
('Pizza', 266, 150, true, 'cheat'),
('Burger', 295, 120, false, 'cheat'),
('Ice Cream', 207, 80, true, 'cheat'),
('Chocolate', 546, 200, true, 'cheat'),
('French Fries', 365, 60, true, 'cheat');