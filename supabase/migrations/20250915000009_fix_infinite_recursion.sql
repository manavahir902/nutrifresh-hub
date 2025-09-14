-- Fix infinite recursion in profiles table policies
-- This migration will fix the circular dependency issue

-- Step 1: Drop all problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Teachers can view all profiles" ON public.profiles;

-- Step 2: Drop policies on other tables that reference profiles
DROP POLICY IF EXISTS "Teachers can view all messages" ON public.messages;
DROP POLICY IF EXISTS "ai_suggestions_all_policy" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Teachers can view all student meals" ON public.student_meals;
DROP POLICY IF EXISTS "Teachers can view all meal plan items" ON public.personalized_meal_plan_items;

-- Step 3: Create simple, non-recursive policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Step 4: Create simple policies for messages (without profile references)
CREATE POLICY "messages_select_own" ON public.messages
  FOR SELECT USING (auth.uid() = recipient_id OR auth.uid() = sender_id);

CREATE POLICY "messages_insert_own" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_update_own" ON public.messages
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Step 5: Create simple policies for AI suggestions (without profile references)
CREATE POLICY "ai_suggestions_select_active" ON public.ai_suggestions
  FOR SELECT USING (is_active = true);

-- Allow authenticated users to manage AI suggestions (simplified)
CREATE POLICY "ai_suggestions_manage" ON public.ai_suggestions
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 6: Create simple policies for personalized_meal_plan_items
CREATE POLICY "meal_plan_items_select_own" ON public.personalized_meal_plan_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "meal_plan_items_insert_own" ON public.personalized_meal_plan_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "meal_plan_items_update_own" ON public.personalized_meal_plan_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "meal_plan_items_delete_own" ON public.personalized_meal_plan_items
  FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Create simple policies for user_meals (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_meals') THEN
        DROP POLICY IF EXISTS "Users can view their own meals" ON public.user_meals;
        DROP POLICY IF EXISTS "Users can create their own meals" ON public.user_meals;
        DROP POLICY IF EXISTS "Users can update their own meals" ON public.user_meals;
        DROP POLICY IF EXISTS "Users can delete their own meals" ON public.user_meals;
        DROP POLICY IF EXISTS "Teachers can view all student meals" ON public.user_meals;
        
        CREATE POLICY "user_meals_select_own" ON public.user_meals
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "user_meals_insert_own" ON public.user_meals
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "user_meals_update_own" ON public.user_meals
          FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "user_meals_delete_own" ON public.user_meals
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Step 8: Create simple policies for student_meals (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'student_meals') THEN
        DROP POLICY IF EXISTS "Users can view their own meals" ON public.student_meals;
        DROP POLICY IF EXISTS "Users can create their own meals" ON public.student_meals;
        DROP POLICY IF EXISTS "Users can update their own meals" ON public.student_meals;
        DROP POLICY IF EXISTS "Users can delete their own meals" ON public.student_meals;
        DROP POLICY IF EXISTS "Teachers can view all student meals" ON public.student_meals;
        
        CREATE POLICY "student_meals_select_own" ON public.student_meals
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "student_meals_insert_own" ON public.student_meals
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "student_meals_update_own" ON public.student_meals
          FOR UPDATE USING (auth.uid() = user_id);
        
        CREATE POLICY "student_meals_delete_own" ON public.student_meals
          FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;
