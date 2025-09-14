import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function TestDatabase() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    if (!user) return;
    
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Check if messages table exists and is accessible
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(1);
      
      results.messages = {
        success: !messagesError,
        error: messagesError?.message,
        count: messagesData?.length || 0
      };

      // Test 2: Check if ai_suggestions table exists and is accessible
      const { data: suggestionsData, error: suggestionsError } = await supabase
        .from('ai_suggestions')
        .select('*')
        .limit(1);
      
      results.ai_suggestions = {
        success: !suggestionsError,
        error: suggestionsError?.message,
        count: suggestionsData?.length || 0
      };

      // Test 3: Check if food_items table exists and has data
      const { data: foodData, error: foodError } = await supabase
        .from('food_items')
        .select('*')
        .limit(5);
      
      results.food_items = {
        success: !foodError,
        error: foodError?.message,
        count: foodData?.length || 0,
        sample: foodData?.slice(0, 3).map(f => f.name) || []
      };

      // Test 4: Check if personalized_meal_plan_items table exists
      const { data: mealPlanData, error: mealPlanError } = await supabase
        .from('personalized_meal_plan_items')
        .select('*')
        .limit(1);
      
      results.meal_plan_items = {
        success: !mealPlanError,
        error: mealPlanError?.message,
        count: mealPlanData?.length || 0
      };

      // Test 5: Check if student_meals table exists
      const { data: studentMealsData, error: studentMealsError } = await supabase
        .from('student_meals')
        .select('*')
        .limit(1);
      
      results.student_meals = {
        success: !studentMealsError,
        error: studentMealsError?.message,
        count: studentMealsData?.length || 0
      };

      // Test 6: Check user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      results.profile = {
        success: !profileError,
        error: profileError?.message,
        data: profileData
      };

    } catch (error) {
      results.general_error = error;
    }

    setTestResults(results);
    setLoading(false);
  };

  const createTestMessage = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: user.id,
          subject: 'Test Message',
          content: 'This is a test message to verify the notification system is working.',
          message_type: 'announcement'
        });

      if (error) {
        console.error('Error creating test message:', error);
      } else {
        console.log('Test message created successfully');
        runTests(); // Refresh tests
      }
    } catch (error) {
      console.error('Error creating test message:', error);
    }
  };

  const createTestMealPlan = async () => {
    if (!user) return;
    
    try {
      // Get a food item first
      const { data: foodItems } = await supabase
        .from('food_items')
        .select('id')
        .limit(1);

      if (foodItems && foodItems.length > 0) {
        // Use the safe function to avoid duplicate key errors
        const { data, error } = await supabase
          .rpc('safe_insert_meal_plan_item', {
            p_user_id: user.id,
            p_day_of_week: 1,
            p_meal_type: 'breakfast',
            p_food_item_id: foodItems[0].id,
            p_quantity_grams: 100
          });

        if (error) {
          console.error('Error creating test meal plan:', error);
        } else {
          console.log('Test meal plan created successfully');
          runTests(); // Refresh tests
        }
      }
    } catch (error) {
      console.error('Error creating test meal plan:', error);
    }
  };

  useEffect(() => {
    if (user) {
      runTests();
    }
  }, [user]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button onClick={runTests} disabled={loading}>
              {loading ? 'Testing...' : 'Run Tests'}
            </Button>
            <Button onClick={createTestMessage} variant="outline">
              Create Test Message
            </Button>
            <Button onClick={createTestMealPlan} variant="outline">
              Create Test Meal Plan
            </Button>
          </div>

          <div className="space-y-2">
            {Object.entries(testResults).map(([key, result]: [string, any]) => (
              <div key={key} className="p-3 border rounded-lg">
                <h4 className="font-medium capitalize">{key.replace('_', ' ')}</h4>
                <div className={`text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                  {result.success ? '✅ Success' : '❌ Failed'}
                </div>
                {result.error && (
                  <div className="text-xs text-red-500 mt-1">
                    Error: {result.error}
                  </div>
                )}
                {result.count !== undefined && (
                  <div className="text-xs text-gray-600">
                    Count: {result.count}
                  </div>
                )}
                {result.sample && (
                  <div className="text-xs text-gray-600">
                    Sample: {result.sample.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
