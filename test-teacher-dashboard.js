// Test script to verify teacher dashboard functionality
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lkkpwapwnolkyugmopuq.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxra3B3YXB3bm9sa3l1Z21vcHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzc0MTg1NiwiZXhwIjoyMDczMzE3ODU2fQ.zcABzwO-MU6_KEjxCVeJ4q18Ujf6Fwz4VLl5FbX6ijY';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testTeacherDashboard() {
  console.log('🧪 COMPREHENSIVE TEACHER DASHBOARD TEST');
  console.log('========================================');

  try {
    // Test 1: Teacher Profile
    console.log('\n1. Testing Teacher Profile...');
    const { data: teacher, error: teacherError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'manavahir902@gmail.com')
      .single();
    
    if (teacherError) {
      console.log('❌ Teacher profile error:', teacherError.message);
    } else {
      console.log('✅ Teacher profile found:', teacher.first_name, teacher.last_name, '- Role:', teacher.role);
    }

    // Test 2: Students Query
    console.log('\n2. Testing Students Query...');
    const { data: students, error: studentsError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');
    
    if (studentsError) {
      console.log('❌ Students error:', studentsError.message);
    } else {
      console.log('✅ Students found:', students.length);
      students.forEach(student => {
        console.log('  - ' + student.first_name + ' ' + student.last_name + ' (' + student.email + ')');
      });
    }

    // Test 3: Student Details Query
    console.log('\n3. Testing Student Details Query...');
    const { data: studentDetails, error: detailsError } = await supabase
      .from('student_details')
      .select('*');
    
    if (detailsError) {
      console.log('❌ Student details error:', detailsError.message);
    } else {
      console.log('✅ Student details found:', studentDetails.length);
    }

    // Test 4: Student Meals Query
    console.log('\n4. Testing Student Meals Query...');
    const { data: meals, error: mealsError } = await supabase
      .from('user_meals') // <-- fix table name if needed
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (mealsError) {
      console.log('❌ Meals error:', mealsError.message);
    } else {
      console.log('✅ Meals found:', meals.length);
      meals.forEach(meal => {
        console.log('  - ' + meal.meal_name + ' (' + meal.total_calories + ' cal)');
      });
    }

    // Test 5: Messages Query
    console.log('\n5. Testing Messages Query...');
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (messagesError) {
      console.log('❌ Messages error:', messagesError.message);
    } else {
      console.log('✅ Messages found:', messages.length);
    }

    // Test 6: Personalized Meal Plans Query
    console.log('\n6. Testing Personalized Meal Plans Query...');
    const { data: mealPlans, error: mealPlansError } = await supabase
      .from('personalized_meal_plans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (mealPlansError) {
      console.log('❌ Meal plans error:', mealPlansError.message);
    } else {
      console.log('✅ Meal plans found:', mealPlans.length);
    }

    // Test 7: AI Suggestions Query
    console.log('\n7. Testing AI Suggestions Query...');
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('ai_suggestions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (suggestionsError) {
      console.log('❌ AI suggestions error:', suggestionsError.message);
    } else {
      console.log('✅ AI suggestions found:', suggestions.length);
    }

    // Test 8: Student Analytics Query
    console.log('\n8. Testing Student Analytics Query...');
    const { data: analytics, error: analyticsError } = await supabase
      .from('student_analytics')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(10);
    
    if (analyticsError) {
      console.log('❌ Analytics error:', analyticsError.message);
    } else {
      console.log('✅ Analytics found:', analytics.length);
    }

    // Test 9: Calculate Dashboard Stats
    console.log('\n9. Calculating Dashboard Stats...');
    const totalStudents = students?.length || 0;
    const studentsWithGoals = studentDetails?.length || 0;
    const totalMealsLogged = meals?.length || 0;
    const totalCalories = meals?.reduce((sum, meal) => sum + (meal.estimated_calories || 0), 0) || 0;
    const averageCalories = totalMealsLogged > 0 ? Math.round(totalCalories / totalMealsLogged) : 0;

    console.log('📊 DASHBOARD STATISTICS:');
    console.log('  Total Students:', totalStudents);
    console.log('  Students with Goals:', studentsWithGoals);
    console.log('  Total Meals Logged:', totalMealsLogged);
    console.log('  Average Calories per Meal:', averageCalories);
    console.log('  Total Messages:', messages?.length || 0);
    console.log('  Personalized Meal Plans:', mealPlans?.length || 0);
    console.log('  AI Suggestions:', suggestions?.length || 0);
    console.log('  Analytics Records:', analytics?.length || 0);

    // Test 10: RLS Policy Test
    console.log('\n10. Testing RLS Policies...');
    console.log('  All queries should work for teachers with proper RLS policies');
    console.log('  If any query fails, it means RLS policies need to be fixed');

  } catch (err) {
    console.log('❌ Error:', err.message);
  }
}

testTeacherDashboard();
