import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Utensils, Plus, Leaf, Drumstick, ChefHat, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AddMealModal } from "@/components/meals/AddMealModal";

interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  cost_per_100g_rupees: number;
  is_veg: boolean;
  category: string;
}

interface MealPlan {
  id: string;
  day_of_week: number;
  meal_type: string;
  is_veg: boolean;
  total_calories: number;
  total_cost: number;
  meal_plan_items: {
    food_item_id: string;
    quantity_grams: number;
    food_items: FoodItem;
  }[];
}

const MealPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiet, setSelectedDiet] = useState<"veg" | "nonveg">("veg");
  const [showAddMeal, setShowAddMeal] = useState(false);

  const days = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  useEffect(() => {
    if (user) {
      fetchMealPlans();
      fetchFoodItems();
    }
  }, [user, selectedDiet]);

  const fetchMealPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select(`
          *,
          meal_plan_items (
            food_item_id,
            quantity_grams,
            food_items (*)
          )
        `)
        .eq('user_id', user?.id)
        .eq('is_veg', selectedDiet === "veg");

      if (error) throw error;
      setMealPlans(data || []);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodItems = async () => {
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .eq('is_veg', selectedDiet === "veg");

      if (error) throw error;
      setFoodItems(data || []);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  const generateMealPlans = async () => {
    if (!user) return;

    try {
      // Simple meal plan generation logic
      const generatedPlans = [];
      
      for (let day = 1; day <= 7; day++) {
        for (const mealType of mealTypes) {
          // Skip Sunday dinner for cheat meal
          if (day === 7 && mealType === "dinner") continue;
          
          const isCheatMeal = day === 7 && mealType === "lunch"; // Sunday lunch as cheat meal
          const availableItems = foodItems.filter(item => 
            isCheatMeal ? item.category === 'cheat' : item.category !== 'cheat'
          );
          
          if (availableItems.length === 0) continue;
          
          // Select random food items for the meal
          const selectedItems = [];
          const numItems = Math.min(3, availableItems.length);
          
          for (let i = 0; i < numItems; i++) {
            const randomItem = availableItems[Math.floor(Math.random() * availableItems.length)];
            selectedItems.push({
              food_item_id: randomItem.id,
              quantity_grams: isCheatMeal ? 200 : 150
            });
          }
          
          // Calculate totals
          const totalCalories = selectedItems.reduce((sum, item) => {
            const foodItem = availableItems.find(f => f.id === item.food_item_id);
            return sum + (foodItem ? (foodItem.calories_per_100g * item.quantity_grams / 100) : 0);
          }, 0);
          
          const totalCost = selectedItems.reduce((sum, item) => {
            const foodItem = availableItems.find(f => f.id === item.food_item_id);
            return sum + (foodItem ? (foodItem.cost_per_100g_rupees * item.quantity_grams / 100) : 0);
          }, 0);
          
          generatedPlans.push({
            user_id: user.id,
            day_of_week: day,
            meal_type: isCheatMeal ? "cheat" : mealType,
            is_veg: selectedDiet === "veg",
            total_calories: Math.round(totalCalories),
            total_cost: Math.round(totalCost * 100) / 100,
            items: selectedItems
          });
        }
      }
      
      // Clear existing meal plans for this diet type
      await supabase
        .from('meal_plans')
        .delete()
        .eq('user_id', user.id)
        .eq('is_veg', selectedDiet === "veg");
      
      // Insert new meal plans
      for (const plan of generatedPlans) {
        const { items, ...planData } = plan;
        const { data: mealPlan, error: planError } = await supabase
          .from('meal_plans')
          .insert(planData)
          .select()
          .single();
        
        if (planError) throw planError;
        
        // Insert meal plan items
        const mealPlanItems = items.map(item => ({
          meal_plan_id: mealPlan.id,
          ...item
        }));
        
        const { error: itemsError } = await supabase
          .from('meal_plan_items')
          .insert(mealPlanItems);
        
        if (itemsError) throw itemsError;
      }
      
      toast({
        title: "Meal Plans Generated!",
        description: "Your weekly meal plans have been created based on your preferences.",
      });
      
      fetchMealPlans();
    } catch (error) {
      console.error('Error generating meal plans:', error);
      toast({
        title: "Error",
        description: "Failed to generate meal plans. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMealPlansForDay = (dayIndex: number) => {
    return mealPlans.filter(plan => plan.day_of_week === dayIndex + 1);
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading meal plans...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Weekly Meal Plans</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Personalized nutrition plans based on your goals
        </p>

        <div className="flex items-center justify-center gap-4 mb-6">
          <Tabs value={selectedDiet} onValueChange={(value) => setSelectedDiet(value as "veg" | "nonveg")}>
            <TabsList>
              <TabsTrigger value="veg" className="flex items-center space-x-2">
                <Leaf className="h-4 w-4" />
                <span>Vegetarian</span>
              </TabsTrigger>
              <TabsTrigger value="nonveg" className="flex items-center space-x-2">
                <Drumstick className="h-4 w-4" />
                <span>Non-Vegetarian</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button onClick={generateMealPlans} className="flex items-center space-x-2">
            <ChefHat className="h-4 w-4" />
            <span>Generate New Plans</span>
          </Button>

          <Button onClick={() => setShowAddMeal(true)} variant="outline" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Log Meal</span>
          </Button>
        </div>
      </div>

      {/* Meal Plans Grid */}
      <div className="grid gap-6">
        {days.map((day, dayIndex) => {
          const dayMealPlans = getMealPlansForDay(dayIndex);
          
          return (
            <Card key={day} className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span>{day}</span>
                  {dayIndex === 6 && (
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>Cheat Day</span>
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dayMealPlans.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {dayMealPlans.map((plan) => (
                      <div key={plan.id} className="bg-muted/50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold capitalize flex items-center space-x-1">
                            <Utensils className="h-4 w-4" />
                            <span>{plan.meal_type}</span>
                          </h4>
                          {plan.meal_type === "cheat" && (
                            <Badge variant="destructive">Cheat Meal</Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2 mb-3">
                          {plan.meal_plan_items?.map((item, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{item.food_items.name}</span>
                              <span className="text-muted-foreground ml-2">({item.quantity_grams}g)</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{plan.total_calories} cal</span>
                          <span>₹{plan.total_cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No meal plans for {day}</p>
                    <p className="text-sm">Click "Generate New Plans" to create your weekly menu</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Meal Modal */}
      <AddMealModal 
        open={showAddMeal} 
        onOpenChange={setShowAddMeal}
        foodItems={foodItems}
      />
    </div>
  );
};

export default MealPlans;