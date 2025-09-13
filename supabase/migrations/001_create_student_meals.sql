-- Create student_meals table
CREATE TABLE IF NOT EXISTS public.student_meals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  meal_name text NOT NULL,
  meal_type text NOT NULL CHECK (meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text])),
  student_class text NOT NULL CHECK (student_class = ANY (ARRAY['1-5'::text, '6-8'::text, '9-10'::text, '11-12'::text, 'college'::text])),
  description text,
  estimated_calories integer,
  estimated_cost numeric,
  is_custom boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT student_meals_pkey PRIMARY KEY (id),
  CONSTRAINT student_meals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_student_meals_user_id ON public.student_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_student_meals_meal_type ON public.student_meals(meal_type);
CREATE INDEX IF NOT EXISTS idx_student_meals_student_class ON public.student_meals(student_class);

-- Enable RLS (Row Level Security)
ALTER TABLE public.student_meals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own student meals" ON public.student_meals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own student meals" ON public.student_meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student meals" ON public.student_meals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own student meals" ON public.student_meals
  FOR DELETE USING (auth.uid() = user_id);
