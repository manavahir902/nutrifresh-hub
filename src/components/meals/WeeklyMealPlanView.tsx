import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Clock, 
  Utensils, 
  Apple, 
  Coffee, 
  Sun, 
  Moon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MealPlanItem {
  id: string;
  day_of_week: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_item_id: string;
  quantity_grams: number;
  food_item?: {
    id: string;
    name: string;
    calories_per_100g: number;
    category: string;
    is_veg: boolean;
    cost_per_100g_rupees: number;
  };
}

interface WeeklyMealPlan {
  [day: string]: {
    [mealType: string]: MealPlanItem[];
  };
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const mealTypes = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'bg-orange-100 text-orange-800' },
  { key: 'lunch', label: 'Lunch', icon: Sun, color: 'bg-yellow-100 text-yellow-800' },
  { key: 'dinner', label: 'Dinner', icon: Moon, color: 'bg-blue-100 text-blue-800' },
  { key: 'snack', label: 'Snack', icon: Apple, color: 'bg-green-100 text-green-800' }
];

export function WeeklyMealPlanView() {
  const { user } = useAuth();
  const { profile } = useUserRole();
  const { toast } = useToast();
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>({});
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMealPlan();
    }
  }, [user, currentWeek]);

  const fetchMealPlan = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get the start and end of the current week
      const startOfWeek = new Date(currentWeek);
      startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1); // Monday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      endOfWeek.setHours(23, 59, 59, 999);

      // Fetch meal plan items for the current week
      const { data: mealPlanItems, error } = await supabase
        .from('personalized_meal_plan_items')
        .select(`
          *,
          food_item:food_items(*)
        `)
        .eq('user_id', user.id)
        .order('day_of_week')
        .order('meal_type');

      if (error) {
        console.error('Error fetching meal plan:', error);
        throw error;
      }

      // Organize meal plan by day and meal type
      const organizedPlan: WeeklyMealPlan = {};
      
      days.forEach((day, index) => {
        organizedPlan[day] = {};
        mealTypes.forEach(mealType => {
          organizedPlan[day][mealType.key] = [];
        });
      });

      mealPlanItems?.forEach(item => {
        const dayName = days[item.day_of_week - 1];
        if (dayName && organizedPlan[dayName]) {
          organizedPlan[dayName][item.meal_type] = [
            ...(organizedPlan[dayName][item.meal_type] || []),
            item
          ];
        }
      });

      setMealPlan(organizedPlan);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to load meal plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyMealPlan = async () => {
    if (!user || !profile) return;

    try {
      setGenerating(true);
      
      // Get user's student details for personalization
      const { data: studentDetails, error: detailsError } = await supabase
        .from('student_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (detailsError) {
        console.error('Error fetching student details:', detailsError);
        toast({
          title: "Error",
          description: "Please complete your profile first to generate personalized meal plans.",
          variant: "destructive"
        });
        return;
      }

      // Get available food items
      const { data: foodItems, error: foodError } = await supabase
        .from('food_items')
        .select('*')
        .order('name');

      if (foodError) {
        console.error('Error fetching food items:', foodError);
        throw foodError;
      }

      // Calculate nutritional needs based on user profile
      const nutritionalNeeds = calculateNutritionalNeeds(studentDetails, profile);
      
      // Generate meal plan for the week
      const generatedPlan = generatePersonalizedMealPlan(
        foodItems || [],
        nutritionalNeeds,
        studentDetails
      );

      // Save the generated meal plan
      await saveMealPlan(generatedPlan);
      
      toast({
        title: "✅ Meal Plan Generated!",
        description: "Your personalized weekly meal plan has been created.",
      });

      // Refresh the meal plan display
      await fetchMealPlan();
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const calculateNutritionalNeeds = (studentDetails: any, profile: any) => {
    // Basic BMR calculation (simplified)
    const age = profile.age_group === '13-17' ? 15 : 20;
    const weight = studentDetails?.weight || 60;
    const height = studentDetails?.height_cm || 170;
    
    // Mifflin-St Jeor Equation (simplified)
    let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    
    // Activity factor (sedentary to moderate)
    const activityFactor = 1.4;
    const dailyCalories = Math.round(bmr * activityFactor);
    
    // Macronutrient distribution
    const protein = Math.round(dailyCalories * 0.25 / 4); // 25% calories from protein
    const carbs = Math.round(dailyCalories * 0.50 / 4);   // 50% calories from carbs
    const fats = Math.round(dailyCalories * 0.25 / 9);    // 25% calories from fats

    return {
      calories: dailyCalories,
      protein,
      carbs,
      fats,
      age,
      weight,
      height,
      goal: studentDetails?.goal || 'maintain',
      bodyType: studentDetails?.body_type || 'balance_weight'
    };
  };

  const generatePersonalizedMealPlan = (foodItems: any[], nutritionalNeeds: any, studentDetails: any) => {
    const mealPlan: any[] = [];
    const isVeg = studentDetails?.dietary_preference === 'vegetarian';
    
    // Filter food items based on dietary preferences
    const availableFoods = foodItems.filter(item => 
      isVeg ? item.is_veg : true
    );

    // Meal calorie distribution
    const mealCalorieDistribution = {
      breakfast: 0.25,
      lunch: 0.35,
      dinner: 0.30,
      snack: 0.10
    };

    days.forEach((day, dayIndex) => {
      mealTypes.forEach(mealType => {
        const targetCalories = Math.round(
          nutritionalNeeds.calories * mealCalorieDistribution[mealType.key as keyof typeof mealCalorieDistribution]
        );

        // Select appropriate foods for this meal type
        const suitableFoods = selectFoodsForMealType(
          availableFoods,
          mealType.key,
          targetCalories,
          nutritionalNeeds
        );

        suitableFoods.forEach(food => {
          mealPlan.push({
            day_of_week: dayIndex + 1,
            meal_type: mealType.key,
            food_item_id: food.id,
            quantity_grams: food.quantity,
            student_id: user!.id
          });
        });
      });
    });

    return mealPlan;
  };

  const selectFoodsForMealType = (foods: any[], mealType: string, targetCalories: number, nutritionalNeeds: any) => {
    const suitableFoods = foods.filter(food => {
      // Basic meal type filtering
      switch (mealType) {
        case 'breakfast':
          return ['grains', 'dairy', 'fruits'].includes(food.category);
        case 'lunch':
          return ['grains', 'protein', 'vegetables'].includes(food.category);
        case 'dinner':
          return ['protein', 'vegetables', 'grains'].includes(food.category);
        case 'snack':
          return ['fruits', 'nuts', 'dairy'].includes(food.category);
        default:
          return true;
      }
    });

    // Select foods to meet calorie target
    const selectedFoods: any[] = [];
    let currentCalories = 0;

    for (const food of suitableFoods) {
      if (currentCalories >= targetCalories) break;
      
      const remainingCalories = targetCalories - currentCalories;
      const maxQuantity = Math.min(200, Math.round(remainingCalories / food.calories_per_100g * 100));
      
      if (maxQuantity >= 50) { // Minimum 50g serving
        selectedFoods.push({
          ...food,
          quantity: maxQuantity
        });
        currentCalories += (maxQuantity / 100) * food.calories_per_100g;
      }
    }

    return selectedFoods;
  };

  const saveMealPlan = async (mealPlanItems: any[]) => {
    if (!user) return;

    // Clear existing meal plan for this user
    await supabase
      .from('personalized_meal_plan_items')
      .delete()
      .eq('user_id', user.id);

    // Insert new meal plan items
    const { error } = await supabase
      .from('personalized_meal_plan_items')
      .insert(mealPlanItems);

    if (error) {
      console.error('Error saving meal plan:', error);
      throw error;
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newWeek);
  };

  const getWeekRange = () => {
    const startOfWeek = new Date(currentWeek);
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay() + 1);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toLocaleDateString(),
      end: endOfWeek.toLocaleDateString()
    };
  };

  const calculateDayCalories = (dayMeals: any) => {
    let totalCalories = 0;
    Object.values(dayMeals).forEach((meals: any) => {
      meals.forEach((meal: any) => {
        if (meal.food_item) {
          totalCalories += (meal.quantity_grams / 100) * meal.food_item.calories_per_100g;
        }
      });
    });
    return Math.round(totalCalories);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span>Weekly Meal Plan</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              Your personalized weekly meal plan
            </p>
          </div>
        </div>
        
        <div className="grid gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span>Weekly Meal Plan</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            {getWeekRange().start} - {getWeekRange().end}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={generateWeeklyMealPlan}
            disabled={generating}
            className="flex items-center space-x-2"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span>{generating ? 'Generating...' : 'Generate Plan'}</span>
          </Button>
        </div>
      </div>

      {/* Weekly Calendar View */}
      <div className="grid gap-4">
        {days.map((day, dayIndex) => {
          const dayMeals = mealPlan[day] || {};
          const dayCalories = calculateDayCalories(dayMeals);
          
          return (
            <Card key={day} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{day}</span>
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Utensils className="h-3 w-3" />
                    <span>{dayCalories} cal</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {mealTypes.map(mealType => {
                    const meals = dayMeals[mealType.key] || [];
                    const MealIcon = mealType.icon;
                    
                    return (
                      <div key={mealType.key} className="space-y-2">
                        <div className={`flex items-center space-x-2 p-2 rounded-lg ${mealType.color}`}>
                          <MealIcon className="h-4 w-4" />
                          <span className="text-sm font-medium">{mealType.label}</span>
                        </div>
                        <div className="space-y-2 min-h-[100px]">
                          {meals.length > 0 ? (
                            meals.map((meal, index) => (
                              <div key={index} className="p-2 border rounded-lg bg-card">
                                <div className="font-medium text-sm">
                                  {meal.food_item?.name || 'Unknown Food'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {meal.quantity_grams}g • {Math.round((meal.quantity_grams / 100) * (meal.food_item?.calories_per_100g || 0))} cal
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg text-center">
                              <div className="text-sm text-muted-foreground">
                                No {mealType.label.toLowerCase()} planned
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
