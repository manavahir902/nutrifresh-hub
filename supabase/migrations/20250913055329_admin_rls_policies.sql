-- Add admin-specific RLS policies
-- This migration adds policies that allow admin users to access all data

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to check if user is teacher
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'teacher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin policies for profiles table
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete all profiles" ON public.profiles FOR DELETE USING (public.is_admin());

-- Admin policies for student_details table
CREATE POLICY "Admins can view all student details" ON public.student_details FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all student details" ON public.student_details FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete all student details" ON public.student_details FOR DELETE USING (public.is_admin());

-- Teacher policies for student_details table
CREATE POLICY "Teachers can view all student details" ON public.student_details FOR SELECT USING (public.is_teacher());

-- Admin policies for user_meals table
CREATE POLICY "Admins can view all user meals" ON public.user_meals FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all user meals" ON public.user_meals FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete all user meals" ON public.user_meals FOR DELETE USING (public.is_admin());

-- Teacher policies for user_meals table
CREATE POLICY "Teachers can view all user meals" ON public.user_meals FOR SELECT USING (public.is_teacher());

-- Admin policies for user_meal_items table
CREATE POLICY "Admins can view all user meal items" ON public.user_meal_items FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all user meal items" ON public.user_meal_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete all user meal items" ON public.user_meal_items FOR DELETE USING (public.is_admin());

-- Teacher policies for user_meal_items table
CREATE POLICY "Teachers can view all user meal items" ON public.user_meal_items FOR SELECT USING (public.is_teacher());

-- Admin policies for meal_plans table
CREATE POLICY "Admins can view all meal plans" ON public.meal_plans FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all meal plans" ON public.meal_plans FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete all meal plans" ON public.meal_plans FOR DELETE USING (public.is_admin());

-- Teacher policies for meal_plans table
CREATE POLICY "Teachers can view all meal plans" ON public.meal_plans FOR SELECT USING (public.is_teacher());

-- Admin policies for meal_plan_items table
CREATE POLICY "Admins can view all meal plan items" ON public.meal_plan_items FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can update all meal plan items" ON public.meal_plan_items FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admins can delete all meal plan items" ON public.meal_plan_items FOR DELETE USING (public.is_admin());

-- Teacher policies for meal_plan_items table
CREATE POLICY "Teachers can view all meal plan items" ON public.meal_plan_items FOR SELECT USING (public.is_teacher());
