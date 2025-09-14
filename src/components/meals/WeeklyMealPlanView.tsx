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
import { generateAIMealPlan, getAIMealSuggestions } from '@/utils/aiMealPlanGenerator';

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


  const generateWeeklyMealPlan = async (dietaryPreference: 'vegetarian' | 'non_vegetarian' = 'non_vegetarian') => {
    if (!user) {
      console.log('No user found');
      return;
    }
    
    if (!profile) {
      console.log('No profile found, using default values');
    }

    try {
      setGenerating(true);
      
      // Get user's student details for personalization
      const { data: studentDetails, error: detailsError } = await supabase
        .from('student_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Use default values if student details are not available or if profile is missing
      const defaultStudentDetails = {
        weight: 60,
        height_cm: 170,
        goal: 'balance_weight',
        body_type: 'skinny_fat'
      };
      
      // Enhanced meal plan generation with proper Indian meal structure
      const mealPlanRequest = {
        user: {
          age: profile?.age_group === '18-20' ? 19 : profile?.age_group === '21-25' ? 23 : 25,
          gender: profile?.gender || 'male',
          height_cm: studentDetails?.height_cm || defaultStudentDetails.height_cm,
          weight_kg: studentDetails?.weight || defaultStudentDetails.weight,
          activity_level: 'moderate' as const,
          goal: (studentDetails?.goal || defaultStudentDetails.goal) as 'maintain' | 'lose' | 'gain'
        },
        location: 'ahmedabad',
        rotation_days: 7,
        mode: 'full_day' as const,
        dietary_constraints: dietaryPreference === 'vegetarian' ? ['vegetarian'] : []
      };

      // Get available food items first to map ingredient names to IDs
      const { data: foodItems, error: foodError } = await supabase
        .from('food_items')
        .select('*')
        .order('name');

      if (foodError) {
        console.error('Error fetching food items:', foodError);
        throw foodError;
      }

      // Create a mapping from ingredient names to food item IDs
      // Since the enhanced generator outputs individual ingredients, we need to map them to available food items
      const ingredientToFoodId = new Map();
      
      // First, try to find exact matches for individual ingredients
      const ingredientMappings = {
        'rice': ['rice', 'basmati'],
        'toor_dal': ['dal', 'lentil', 'toor'],
        'moong_dal': ['moong', 'green gram'],
        'rajma': ['rajma', 'kidney bean'],
        'chana_dal': ['chana', 'chickpea', 'bengal gram'],
        'atta': ['atta', 'wheat', 'flour'],
        'potato': ['potato', 'aloo'],
        'onion': ['onion'],
        'tomato': ['tomato'],
        'carrot': ['carrot'],
        'spinach': ['spinach', 'palak'],
        'banana': ['banana'],
        'orange': ['orange'],
        'milk': ['milk'],
        'curd': ['curd', 'yogurt'],
        'cooking_oil': ['oil', 'cooking oil'],
        'paneer': ['paneer'],
        'egg': ['egg'],
        'chicken': ['chicken'],
        'fish': ['fish'],
        'mutton': ['mutton'],
        'prawn': ['prawn']
      };

      // Map ingredients to food items
      Object.entries(ingredientMappings).forEach(([ingredient, keywords]) => {
        const matchingFood = foodItems?.find(food => 
          keywords.some(keyword => food.name.toLowerCase().includes(keyword))
        );
        if (matchingFood) {
          ingredientToFoodId.set(ingredient, matchingFood.id);
        }
      });

      // If no exact match found, use fallback mappings to complete meals
      if (!ingredientToFoodId.has('rice')) {
        const riceMeal = foodItems?.find(food => 
          food.name.toLowerCase().includes('rice') || 
          food.name.toLowerCase().includes('dal rice')
        );
        if (riceMeal) ingredientToFoodId.set('rice', riceMeal.id);
      }

      if (!ingredientToFoodId.has('toor_dal')) {
        const dalMeal = foodItems?.find(food => 
          food.name.toLowerCase().includes('dal') || 
          food.name.toLowerCase().includes('lentil')
        );
        if (dalMeal) {
          ingredientToFoodId.set('toor_dal', dalMeal.id);
          ingredientToFoodId.set('moong_dal', dalMeal.id);
        }
      }

      if (!ingredientToFoodId.has('atta')) {
        const wheatMeal = foodItems?.find(food => 
          food.name.toLowerCase().includes('roti') || 
          food.name.toLowerCase().includes('wheat') ||
          food.name.toLowerCase().includes('atta')
        );
        if (wheatMeal) ingredientToFoodId.set('atta', wheatMeal.id);
      }

      // Add fallbacks for common missing ingredients - use the first available food item
      const firstFoodItem = foodItems?.[0];
      if (firstFoodItem) {
        const fallbackMappings = [
          'onion', 'tomato', 'cooking_oil', 'curd', 'banana', 
          'potato', 'carrot', 'spinach', 'milk', 'orange'
        ];
        
        fallbackMappings.forEach(ingredient => {
          if (!ingredientToFoodId.has(ingredient)) {
            ingredientToFoodId.set(ingredient, firstFoodItem.id);
          }
        });
      }

      console.log('Food items loaded:', foodItems?.length);
      console.log('Ingredient mapping created:', Object.fromEntries(ingredientToFoodId));

      // Try to use the enhanced meal plan generator first
      let mealPlanResult = null;
      try {
        const { generateEnhancedIndianMealPlan } = await import('@/utils/enhancedIndianMealPlanGenerator');
        mealPlanResult = await generateEnhancedIndianMealPlan(mealPlanRequest);
        console.log('Enhanced meal plan result:', mealPlanResult);
      } catch (enhancedError) {
        console.warn('Enhanced meal plan generator failed, using fallback:', enhancedError);
        // Fallback to original meal plan generation
        const { generateAIMealPlan } = await import('@/utils/aiMealPlanGenerator');
        const userProfile = {
          age: profile?.age_group === '18-20' ? 19 : profile?.age_group === '21-25' ? 23 : 25,
          weight: studentDetails?.weight || defaultStudentDetails.weight,
          height: studentDetails?.height_cm || defaultStudentDetails.height_cm,
          gender: profile?.gender || 'male',
          goal: studentDetails?.goal || defaultStudentDetails.goal,
          bodyType: studentDetails?.body_type || defaultStudentDetails.body_type,
          dietaryPreference: dietaryPreference,
          gender: 'male' as const
        };
        
        const fallbackPlan = await generateAIMealPlan({
          userProfile,
          availableFoods: foodItems || []
        });
        
        // Convert fallback plan to enhanced format
        mealPlanResult = {
          menu_sample: fallbackPlan.map((item, index) => ({
            day: Math.floor(index / 4) + 1,
            meals: [{
              time: item.meal_type as any,
              items: [{
                ingredient: item.food_item_id,
                grams: item.quantity_grams,
                unit_price: 0,
                cost: 0
              }],
              calories_kcal: 0,
              protein_g: 0,
              total_cost: 0
            }],
            daily_totals: {
              calories_kcal: 0,
              protein_g: 0,
              cost_total: 0
            }
          })),
          warnings: ['Used fallback meal plan generation']
        };
      }
      
      if (mealPlanResult && mealPlanResult.menu_sample.length > 0) {
        // Convert to database format
        const mealPlanItems = [];
        
        mealPlanResult.menu_sample.forEach(dayPlan => {
          dayPlan.meals.forEach(meal => {
            // Map meal types to database-compatible values
            let dbMealType = meal.time;
            if (meal.time === 'snack1' || meal.time === 'snack2') {
              dbMealType = 'snack';
            }
            
            meal.items.forEach(item => {
              const foodItemId = ingredientToFoodId.get(item.ingredient);
              if (foodItemId) {
                mealPlanItems.push({
                  day_of_week: dayPlan.day,
                  meal_type: dbMealType,
                  food_item_id: foodItemId,
                  quantity_grams: item.grams,
                  user_id: user.id
                });
              } else {
                console.warn(`No food item found for ingredient: ${item.ingredient}`);
              }
            });
          });
        });

        console.log('Final meal plan items to insert:', mealPlanItems.length, mealPlanItems.slice(0, 3));
        
        // Validate that we have items to insert
        if (mealPlanItems.length === 0) {
          throw new Error('No valid meal plan items could be created. Please check food items in database.');
        }

        // Use the safe_insert_meal_plan_item function for each item to avoid constraint violations
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < mealPlanItems.length; i++) {
          const item = mealPlanItems[i];
          
          try {
            const { data, error } = await supabase.rpc('safe_insert_meal_plan_item', {
              p_user_id: user.id,
              p_day_of_week: item.day_of_week,
              p_meal_type: item.meal_type,
              p_food_item_id: item.food_item_id,
              p_quantity_grams: item.quantity_grams
            });

            if (error) {
              console.error(`Error inserting item ${i}:`, error);
              errorCount++;
            } else {
              successCount++;
            }
          } catch (itemError) {
            console.error(`Exception inserting item ${i}:`, itemError);
            errorCount++;
          }
        }

        console.log(`Inserted ${successCount} items successfully, ${errorCount} errors`);

        if (errorCount > 0) {
          console.warn(`Some items failed to insert: ${errorCount} errors`);
        }

        toast({
          title: "Enhanced Meal Plan Generated!",
          description: `Generated ${mealPlanResult.menu_sample.length}-day meal plan with proper nutrition and cost calculation.`,
        });

        // Show warnings if any
        if (mealPlanResult.warnings.length > 0) {
          mealPlanResult.warnings.forEach(warning => {
            toast({
              title: "Warning",
              description: warning,
              variant: "destructive"
            });
          });
        }

        fetchMealPlan();
      }
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


  const saveMealPlan = async (mealPlanItems: any[]) => {
    if (!user) return;

    console.log('Saving meal plan with', mealPlanItems.length, 'items');

    try {
      // First, clear existing meal plan for this user
      const { error: deleteError } = await supabase
        .from('personalized_meal_plan_items')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error clearing existing meal plan:', deleteError);
        throw deleteError;
      }

      console.log('Cleared existing meal plan');

      // Use the safe_insert_meal_plan_item function for each item
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < mealPlanItems.length; i++) {
        const item = mealPlanItems[i];
        
        try {
          const { data, error } = await supabase.rpc('safe_insert_meal_plan_item', {
            p_user_id: user.id,
            p_day_of_week: item.day_of_week,
            p_meal_type: item.meal_type,
            p_food_item_id: item.food_item_id,
            p_quantity_grams: item.quantity_grams
          });

          if (error) {
            console.warn(`Error inserting item ${i + 1}:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (itemError) {
          console.warn(`Exception inserting item ${i + 1}:`, itemError);
          errorCount++;
        }

        // Log progress every 10 items
        if ((i + 1) % 10 === 0) {
          console.log(`Processed ${i + 1}/${mealPlanItems.length} items (${successCount} success, ${errorCount} errors)`);
        }
      }

      console.log(`Successfully saved ${successCount} meal plan items (${errorCount} errors)`);
      
      if (successCount === 0) {
        throw new Error('Failed to save any meal plan items');
      }
    } catch (error) {
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

  const calculateDayCost = (dayMeals: any) => {
    let totalCost = 0;
    Object.values(dayMeals).forEach((meals: any) => {
      meals.forEach((meal: any) => {
        if (meal.food_item) {
          totalCost += (meal.quantity_grams / 100) * meal.food_item.cost_per_100g_rupees;
        }
      });
    });
    return Math.round(totalCost);
  };

  const calculateWeeklyTotals = () => {
    let totalCalories = 0;
    let totalCost = 0;
    let totalProtein = 0;
    
    days.forEach(day => {
      const dayMeals = mealPlan[day] || {};
      totalCalories += calculateDayCalories(dayMeals);
      totalCost += calculateDayCost(dayMeals);
      
      // Calculate protein
      Object.values(dayMeals).forEach((meals: any) => {
        meals.forEach((meal: any) => {
          if (meal.food_item) {
            totalProtein += (meal.quantity_grams / 100) * (meal.food_item.protein_per_100g || 0);
          }
        });
      });
    });
    
    return {
      calories: totalCalories,
      cost: totalCost,
      protein: Math.round(totalProtein)
    };
  };

  const checkVariety = () => {
    const warnings = [];
    const riceCount = [];
    const fruitCount = [];
    
    days.forEach(day => {
      const dayMeals = mealPlan[day] || {};
      Object.values(dayMeals).forEach((meals: any) => {
        meals.forEach((meal: any) => {
          if (meal.food_item) {
            const name = meal.food_item.name.toLowerCase();
            if (name.includes('rice')) riceCount.push(day);
            if (name.includes('banana') || name.includes('orange')) fruitCount.push(day);
          }
        });
      });
    });
    
    if (riceCount.length > 3) {
      warnings.push(`Rice appears ${riceCount.length} times this week - consider more variety`);
    }
    
    if (fruitCount.length > 4) {
      warnings.push(`Same fruits repeated frequently - try seasonal variety`);
    }
    
    return warnings;
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
          <div className="flex items-center space-x-2 ml-4">
            <Button
              onClick={() => generateWeeklyMealPlan('vegetarian')}
              disabled={generating}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>🥬</span>
              )}
              <span>Veg Plan</span>
            </Button>
            <Button
              onClick={() => generateWeeklyMealPlan('non_vegetarian')}
              disabled={generating}
              variant="outline"
              className="flex items-center space-x-2"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span>🍗</span>
              )}
              <span>Non-Veg Plan</span>
            </Button>
          </div>
          <Button
            onClick={() => {
              console.log('Generate Plan button clicked');
              generateWeeklyMealPlan();
            }}
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

      {/* Weekly Summary */}
      {Object.keys(mealPlan).length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Utensils className="h-5 w-5 text-blue-600" />
              <span>Weekly Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{calculateWeeklyTotals().calories}</div>
                <div className="text-sm text-gray-600">Total Calories</div>
                <div className="text-xs text-gray-500">Avg: {Math.round(calculateWeeklyTotals().calories / 7)}/day</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">{calculateWeeklyTotals().protein}g</div>
                <div className="text-sm text-gray-600">Total Protein</div>
                <div className="text-xs text-gray-500">Avg: {Math.round(calculateWeeklyTotals().protein / 7)}g/day</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">₹{calculateWeeklyTotals().cost}</div>
                <div className="text-sm text-gray-600">Total Cost</div>
                <div className="text-xs text-gray-500">Avg: ₹{Math.round(calculateWeeklyTotals().cost / 7)}/day</div>
              </div>
            </div>
            
            {/* Variety Check */}
            {checkVariety().length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="font-medium text-yellow-800">Variety Suggestions</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1">
                  {checkVariety().map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Price Source Info */}
            <div className="mt-4 text-xs text-gray-500 text-center">
              <span>💰 Price source: Live market data (Ahmedabad) • Last updated: {new Date().toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Calendar View */}
      <div className="grid gap-4">
        {days.map((day, dayIndex) => {
          const dayMeals = mealPlan[day] || {};
          const dayCalories = calculateDayCalories(dayMeals);
          const dayCost = calculateDayCost(dayMeals);
          
          return (
            <Card key={day} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{day}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="flex items-center space-x-1">
                      <Utensils className="h-3 w-3" />
                      <span>{dayCalories} cal</span>
                    </Badge>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <span>₹{dayCost}</span>
                    </Badge>
                  </div>
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
                                  {meal.quantity_grams}g • {Math.round((meal.quantity_grams / 100) * (meal.food_item?.calories_per_100g || 0))} cal • ₹{Math.round((meal.quantity_grams / 100) * (meal.food_item?.cost_per_100g_rupees || 0))}
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
