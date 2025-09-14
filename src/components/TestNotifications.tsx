import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function TestNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createTestMessage = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: user.id,
          subject: 'Test Notification',
          content: 'This is a test message to verify the notification system is working properly. You can view this in the notifications section.',
          message_type: 'announcement'
        });

      if (error) {
        console.error('Error creating test message:', error);
        toast({
          title: "Error",
          description: "Failed to create test message: " + error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Test message created! Check the notifications section.",
        });
      }
    } catch (error) {
      console.error('Error creating test message:', error);
      toast({
        title: "Error",
        description: "Failed to create test message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTestMealPlan = async () => {
    if (!user) return;
    
    setLoading(true);
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
          toast({
            title: "Error",
            description: "Failed to create test meal plan: " + error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: "Test meal plan created! Check the meal plans section.",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "No food items found in database",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating test meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to create test meal plan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const populateFoodItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Clear existing food items
      await supabase.from('food_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      // Insert sample food items
      const { error } = await supabase
        .from('food_items')
        .insert([
          { name: '🍛 Dal Rice (Lentil Curry with Rice)', calories_per_100g: 180, cost_per_100g_rupees: 8, is_veg: true, category: 'complete_meal' },
          { name: '🍛 Chicken Curry with Rice', calories_per_100g: 210, cost_per_100g_rupees: 15, is_veg: false, category: 'complete_meal' },
          { name: '🥞 Masala Dosa', calories_per_100g: 180, cost_per_100g_rupees: 15, is_veg: true, category: 'breakfast' },
          { name: '🥞 Idli (2 pieces)', calories_per_100g: 120, cost_per_100g_rupees: 8, is_veg: true, category: 'breakfast' },
          { name: '🥟 Samosa (2 pieces)', calories_per_100g: 300, cost_per_100g_rupees: 8, is_veg: true, category: 'snacks' },
          { name: '🥤 Tea', calories_per_100g: 5, cost_per_100g_rupees: 2, is_veg: true, category: 'beverages' },
          { name: '🍰 Gulab Jamun (2 pieces)', calories_per_100g: 320, cost_per_100g_rupees: 8, is_veg: true, category: 'desserts' },
          { name: '🍔 Veg Burger', calories_per_100g: 250, cost_per_100g_rupees: 15, is_veg: true, category: 'fast_food' },
          { name: '🍚 Basmati Rice (Raw)', calories_per_100g: 130, cost_per_100g_rupees: 3, is_veg: true, category: 'ingredients' },
          { name: '🥚 Eggs', calories_per_100g: 155, cost_per_100g_rupees: 5, is_veg: false, category: 'ingredients' }
        ]);

      if (error) {
        console.error('Error populating food items:', error);
        toast({
          title: "Error",
          description: "Failed to populate food items: " + error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Food items populated successfully! You can now generate meal plans.",
        });
      }
    } catch (error) {
      console.error('Error populating food items:', error);
      toast({
        title: "Error",
        description: "Failed to populate food items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test System Components</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={createTestMessage} 
            disabled={loading}
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <span className="font-medium">Create Test Message</span>
            <span className="text-xs opacity-75">Test notification system</span>
          </Button>
          
          <Button 
            onClick={createTestMealPlan} 
            disabled={loading}
            variant="outline"
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <span className="font-medium">Create Test Meal Plan</span>
            <span className="text-xs opacity-75">Test meal plan system</span>
          </Button>
          
          <Button 
            onClick={populateFoodItems} 
            disabled={loading}
            variant="secondary"
            className="h-auto p-4 flex flex-col items-center space-y-2"
          >
            <span className="font-medium">Populate Food Items</span>
            <span className="text-xs opacity-75">Add sample food data</span>
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Use these buttons to test the system components:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Create Test Message:</strong> Creates a sample notification message</li>
            <li><strong>Create Test Meal Plan:</strong> Creates a sample meal plan item</li>
            <li><strong>Populate Food Items:</strong> Adds sample food items to the database</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
