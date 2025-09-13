import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Utensils, Plus, Apple, Drumstick, ChefHat, Star, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { SimpleAddMealModal } from "@/components/meals/SimpleAddMealModal";
import { MealAlternativeModal } from "@/components/meals/MealAlternativeModal";
import { useStudentDetails } from "@/hooks/useStudentDetails";
import { StudentDetailsModal } from "@/components/auth/StudentDetailsModal";
import { populateFoodItems } from "@/utils/populateFoodItems";

interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  cost_per_100g_rupees: number;
  is_veg: boolean;
  category: string;
}

interface StudentMeal {
  id: string;
  meal_name: string;
  meal_type: string;
  student_class: string;
  description: string;
  estimated_calories: number;
  estimated_cost: number;
  is_custom: boolean;
}

interface MealPlan {
  id: string;
  day_of_week: number;
  meal_type: string;
  is_veg: boolean;
  total_calories: number;
  total_cost: number;
  meal_details?: string;
  meal_plan_items: {
    food_item_id: string | null;
    quantity_grams: number;
    food_items: FoodItem | null;
    meal_name?: string;
    meal_type?: string;
  }[];
}

const MealPlans = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { studentDetails, showDetailsModal, setShowDetailsModal } = useStudentDetails();
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [studentMeals, setStudentMeals] = useState<StudentMeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiet, setSelectedDiet] = useState<"veg" | "nonveg">("veg");
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAlternativeModal, setShowAlternativeModal] = useState(false);
  const [selectedMealForAlternative, setSelectedMealForAlternative] = useState<any>(null);
  const [isProcessingAlternative, setIsProcessingAlternative] = useState(false);

  const days = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  const getMealComposition = (mealType: string, isCheatMeal: boolean) => {
    if (isCheatMeal) {
      return { cheat: 100 };
    }

    switch (mealType) {
      case 'breakfast':
        return { grains: 40, fruits: 30, dairy: 20, nuts: 10 };
      case 'lunch':
        return { grains: 35, vegetables: 25, protein: 25, legumes: 15 };
      case 'dinner':
        return { vegetables: 40, protein: 30, grains: 20, oils: 10 };
      case 'snack':
        return { fruits: 50, nuts: 30, dairy: 20 };
      default:
        return { grains: 40, vegetables: 30, protein: 30 };
    }
  };

  const selectAffordableMeals = (availableMeals: any[], mealType: string, isCheatMeal: boolean, studentDetails: any, caloriesPerMeal: number) => {
    if (availableMeals.length === 0) return [];

    // Prioritize student meals (custom meals) for better affordability
    const studentMeals = availableMeals.filter(meal => meal.type === 'student_meal');
    const foodItems = availableMeals.filter(meal => meal.type === 'food_item');

    // Calculate daily budget based on student details (if available)
    const dailyBudget = studentDetails ? calculateDailyBudget(studentDetails) : 200; // Increased default budget
    const mealBudget = dailyBudget / 4; // 4 meals per day

    const selectedMeals = [];

    // First, try to include at least one student meal if available
    if (studentMeals.length > 0 && !isCheatMeal) {
      const randomStudentMeal = studentMeals[Math.floor(Math.random() * studentMeals.length)];
      selectedMeals.push({
        id: randomStudentMeal.id,
        name: randomStudentMeal.name,
        calories: randomStudentMeal.calories,
        cost: randomStudentMeal.cost,
        type: randomStudentMeal.type
      });
    }

    // Add food items to complete the meal with better variety
    const remainingBudget = mealBudget - selectedMeals.reduce((sum, meal) => sum + meal.cost, 0);
    const remainingCalories = (isCheatMeal ? caloriesPerMeal * 1.5 : caloriesPerMeal) - selectedMeals.reduce((sum, meal) => sum + meal.calories, 0);

    if (remainingBudget > 0 && remainingCalories > 0) {
      // Sort food items by cost to get variety (mix of cheap and moderate items)
      const sortedItems = [...foodItems].sort((a, b) => a.cost - b.cost);
      
      // Select 1-3 items with variety
      const numItems = Math.min(3, Math.max(1, Math.floor(Math.random() * 3) + 1));
      const selectedIndices = new Set();
      
      for (let i = 0; i < numItems && selectedIndices.size < sortedItems.length; i++) {
        let randomIndex;
        do {
          // Prefer items in different price ranges for variety
          if (i === 0) {
            // First item: prefer cheaper items (bottom 40%)
            randomIndex = Math.floor(Math.random() * Math.min(sortedItems.length, Math.ceil(sortedItems.length * 0.4)));
          } else if (i === 1) {
            // Second item: prefer mid-range items (middle 40%)
            const start = Math.floor(sortedItems.length * 0.3);
            const end = Math.floor(sortedItems.length * 0.7);
            randomIndex = start + Math.floor(Math.random() * (end - start));
          } else {
            // Third item: can be any item
            randomIndex = Math.floor(Math.random() * sortedItems.length);
          }
        } while (selectedIndices.has(randomIndex));
        
        selectedIndices.add(randomIndex);
        const selectedItem = sortedItems[randomIndex];
        
        // Check if we can afford this item
        if (selectedItem.cost <= remainingBudget) {
          selectedMeals.push({
            id: selectedItem.id,
            name: selectedItem.name,
            calories: selectedItem.calories,
            cost: selectedItem.cost,
            type: selectedItem.type
          });
        }
      }
    }

    return selectedMeals;
  };

  const calculateDailyBudget = (studentDetails: any) => {
    // Simple budget calculation based on student class
    // This could be enhanced with more sophisticated logic
    const baseBudget = 150; // Increased base daily budget in ₹ for better variety
    
    // Adjust based on student class (higher classes might have more budget)
    const classMultiplier = {
      '1-5': 0.8,
      '6-8': 1.0,
      '9-10': 1.2,
      '11-12': 1.4,
      'college': 1.6
    };

    // This would need to be stored in student details or profiles
    const studentClass = '6-8'; // Default class
    return Math.round(baseBudget * (classMultiplier[studentClass as keyof typeof classMultiplier] || 1.0));
  };

  useEffect(() => {
    if (user) {
      initializeData();
    }
  }, [user, selectedDiet]);

  const initializeData = async () => {
    try {
      // Populate food items if they don't exist
      await populateFoodItems();
      
      // Fetch data
      await Promise.all([
        fetchMealPlans(),
        fetchFoodItems(),
        fetchStudentMeals()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

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
      
      // Process meal plans to include student meals
      const processedPlans = (data || []).map((plan: any) => {
        // For now, we'll just return the basic meal plan structure
        // Student meals will be handled separately in the display
        return {
          ...plan,
          meal_plan_items: plan.meal_plan_items || []
        };
      });
      
      setMealPlans(processedPlans as MealPlan[]);
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
      
      console.log(`Fetched ${data?.length || 0} food items for ${selectedDiet} diet:`, data?.map(item => item.name));
      setFoodItems(data || []);
    } catch (error) {
      console.error('Error fetching food items:', error);
    }
  };

  const fetchStudentMeals = async () => {
    if (!user) return;
    
    try {
      // Try to fetch from student_meals table, but handle gracefully if it doesn't exist
      const { data, error } = await supabase
        .from('student_meals' as any)
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        // If table doesn't exist, just set empty array
        if (error.message.includes('relation "student_meals" does not exist')) {
          console.log('Student meals table not found, using empty array');
          setStudentMeals([]);
          return;
        }
        throw error;
      }
      setStudentMeals((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching student meals:', error);
      setStudentMeals([]); // Set empty array on error
    }
  };

  const calculateDailyCalorieTarget = () => {
    if (!studentDetails) return 2000; // Default calorie target
    
    const { weight, height_cm, goal } = studentDetails;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    const bmr = 10 * weight + 6.25 * height_cm - 5 * 20 + 5; // Assuming age 20 for students
    
    // Activity factor (moderate activity for students)
    const activityFactor = 1.55;
    const maintenanceCalories = bmr * activityFactor;
    
    // Adjust based on goal
    switch (goal) {
      case 'weight_loss':
        return Math.round(maintenanceCalories - 500); // 500 calorie deficit
      case 'weight_gain':
        return Math.round(maintenanceCalories + 500); // 500 calorie surplus
      case 'balance_weight':
        return Math.round(maintenanceCalories); // maintain weight
      default:
        return Math.round(maintenanceCalories);
    }
  };

  const generateMealPlans = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to generate meal plans.",
        variant: "destructive"
      });
      return;
    }

    if (!studentDetails) {
      toast({
        title: "Student Details Required",
        description: "Please complete your student details first to generate personalized meal plans.",
        variant: "destructive"
      });
      setShowDetailsModal(true);
      return;
    }

    try {
      const dailyCalorieTarget = calculateDailyCalorieTarget();
      const caloriesPerMeal = Math.round(dailyCalorieTarget / 4); // 4 meals per day
      
      console.log('Generating meal plans with:', {
        dailyCalorieTarget,
        caloriesPerMeal,
        foodItemsCount: foodItems.length,
        studentMealsCount: studentMeals.length,
        selectedDiet
      });
      
      // Check if we have any food items
      if (foodItems.length === 0) {
        toast({
          title: "No Food Items Available",
          description: "Please add some food items to the database first.",
          variant: "destructive"
        });
        return;
      }
      
      const generatedPlans = [];
      
      for (let day = 1; day <= 7; day++) {
        for (const mealType of mealTypes) {
          // Skip Sunday dinner for cheat meal
          if (day === 7 && mealType === "dinner") continue;
          
          const isCheatMeal = day === 7 && mealType === "lunch"; // Sunday lunch as cheat meal
          
          // Combine food items and student meals
          const filteredFoodItems = foodItems.filter(item => 
            isCheatMeal ? item.category === 'cheat' : item.category !== 'cheat'
          );
          
          console.log(`Day ${day}, ${mealType}: Available food items:`, filteredFoodItems.map(item => `${item.name} (₹${item.cost_per_100g_rupees})`));
          
          const allAvailableMeals = [
            ...filteredFoodItems.map(item => ({
              id: item.id,
              name: item.name,
              calories: item.calories_per_100g,
              cost: item.cost_per_100g_rupees,
              type: 'food_item',
              category: item.category
            })),
            ...studentMeals.filter(meal => meal.meal_type === mealType).map(meal => ({
              id: meal.id,
              name: meal.meal_name,
              calories: meal.estimated_calories || 300, // Default calories if not provided
              cost: meal.estimated_cost || 20, // Default cost if not provided
              type: 'student_meal',
              category: 'custom'
            }))
          ];
          
          if (allAvailableMeals.length === 0) {
            console.log(`No meals available for ${mealType} on day ${day}`);
            continue;
          }
          
           // Select meals based on affordability and preferences
           const selectedMeals = selectAffordableMeals(allAvailableMeals, mealType, isCheatMeal, studentDetails, caloriesPerMeal);
           
           console.log(`Selected meals for Day ${day}, ${mealType}:`, selectedMeals.map(meal => `${meal.name} (₹${meal.cost})`));
          
          if (selectedMeals.length === 0) continue;
          
          // Calculate totals
          const totalCalories = selectedMeals.reduce((sum, meal) => sum + meal.calories, 0);
          const totalCost = selectedMeals.reduce((sum, meal) => sum + meal.cost, 0);
          
           generatedPlans.push({
             user_id: user.id,
             day_of_week: day,
             meal_type: isCheatMeal ? "cheat" : mealType,
             is_veg: selectedDiet === "veg",
             total_calories: Math.round(totalCalories),
             total_cost: Math.round(totalCost * 100) / 100,
             items: selectedMeals.map(meal => ({
               food_item_id: meal.type === 'food_item' ? meal.id : null,
               quantity_grams: 100,
               meal_name: meal.name,
               meal_type: meal.type,
               student_meal_id: meal.type === 'student_meal' ? meal.id : null
             }))
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
       console.log('Inserting', generatedPlans.length, 'meal plans');
       
       for (const plan of generatedPlans) {
         const { items, ...planData } = plan;
         console.log('Inserting meal plan:', planData);
         
         const { data: mealPlan, error: planError } = await supabase
           .from('meal_plans')
           .insert(planData)
           .select()
           .single();
         
         if (planError) {
           console.error('Error inserting meal plan:', planError);
           throw planError;
         }
         
         // Insert meal plan items (only for food items, not student meals)
         const foodItemItems = items.filter(item => item.meal_type === 'food_item');
         if (foodItemItems.length > 0) {
           const mealPlanItems = foodItemItems.map(item => ({
             meal_plan_id: mealPlan.id,
             food_item_id: item.food_item_id,
             quantity_grams: item.quantity_grams
           }));
           
           console.log('Inserting meal plan items:', mealPlanItems);
           
           const { error: itemsError } = await supabase
             .from('meal_plan_items')
             .insert(mealPlanItems);
           
           if (itemsError) {
             console.error('Error inserting meal plan items:', itemsError);
             throw itemsError;
           }
         }
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

  const handleMealNotAvailable = (meal: any) => {
    if (isProcessingAlternative) {
      toast({
        title: "Please wait",
        description: "Processing your request...",
        variant: "default"
      });
      return; // Prevent double-click
    }
    
    console.log(`User clicked "Not Available" for: ${meal.name}`);
    
    setIsProcessingAlternative(true);
    
    // Get alternatives first
    const alternatives = getAlternativesForMeal(meal);
    
    if (alternatives.length === 0) {
      toast({
        title: "No Alternatives Found",
        description: "Sorry, we couldn't find suitable alternatives for this meal. Please try again later.",
        variant: "destructive"
      });
      setIsProcessingAlternative(false);
      return;
    }
    
    setSelectedMealForAlternative(meal);
    setShowAlternativeModal(true);
    
    // Reset processing state after modal interaction
    setTimeout(() => {
      setIsProcessingAlternative(false);
    }, 2000);
  };

  const handleSelectAlternative = async (alternative: any) => {
    try {
      console.log(`User selected alternative: ${alternative.name} for ${selectedMealForAlternative.name}`);
      
      // Update the meal plan in the database
      if (alternative.type === 'food_item') {
        // Update meal plan items table
        const { error } = await supabase
          .from('meal_plan_items')
          .update({ 
            food_item_id: alternative.id,
            quantity_grams: 100 // Default quantity
          })
          .eq('meal_plan_id', selectedMealForAlternative.meal_plan_id)
          .eq('food_item_id', selectedMealForAlternative.id);
          
        if (error) throw error;
      }
      
      // Update the meal plan totals
      const { error: updateError } = await supabase
        .from('meal_plans')
        .update({
          total_calories: alternative.calories,
          total_cost: alternative.cost
        })
        .eq('id', selectedMealForAlternative.meal_plan_id);
        
      if (updateError) throw updateError;
      
      toast({
        title: "Alternative Selected!",
        description: `${alternative.name} has been selected as an alternative to ${selectedMealForAlternative.name}.`,
      });
      
      // Refresh meal plans
      await fetchMealPlans();
      
    } catch (error) {
      console.error('Error updating meal plan:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update meal plan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setShowAlternativeModal(false);
      setSelectedMealForAlternative(null);
    }
  };

  const getAlternativesForMeal = (meal: any) => {
    // Get alternatives based on meal type, diet preference, and nutritional similarity
    const isVeg = selectedDiet === "veg";
    const targetCalories = meal.calories || 300;
    const targetCost = meal.cost || 20;
    
    // Filter food items by diet and exclude cheat meals for regular meals
    const foodAlternatives = foodItems.filter(item => {
      if (item.is_veg !== isVeg) return false;
      if (meal.meal_type === "cheat" && item.category !== "cheat") return false;
      if (meal.meal_type !== "cheat" && item.category === "cheat") return false;
      return item.id !== meal.id;
    });

    // Filter student meals by meal type
    const studentAlternatives = studentMeals.filter(studentMeal => 
      studentMeal.meal_type === meal.meal_type && studentMeal.id !== meal.id
    );

    // Combine and prioritize by nutritional similarity
    const allAlternatives = [
      ...foodAlternatives.map(item => ({
        ...item,
        type: 'food_item',
        calories: item.calories_per_100g,
        cost: item.cost_per_100g_rupees,
        category: item.category
      })),
      ...studentAlternatives.map(meal => ({
        ...meal,
        type: 'student_meal',
        calories: meal.estimated_calories || 300,
        cost: meal.estimated_cost || 20,
        category: 'custom'
      }))
    ];

    // Enhanced scoring system for better alternatives
    const scoredAlternatives = allAlternatives.map(alternative => {
      let score = 0;
      
      // Calorie similarity (40% weight) - prefer items within 20% of target calories
      const calorieDiff = Math.abs(alternative.calories - targetCalories);
      const calorieScore = Math.max(0, 100 - (calorieDiff / targetCalories) * 100);
      score += calorieScore * 0.4;
      
      // Cost similarity (20% weight) - prefer items within 30% of target cost
      const costDiff = Math.abs(alternative.cost - targetCost);
      const costScore = Math.max(0, 100 - (costDiff / targetCost) * 100);
      score += costScore * 0.2;
      
      // Category diversity (20% weight) - prefer different categories for variety
      const categoryScore = alternative.category !== meal.category ? 100 : 50;
      score += categoryScore * 0.2;
      
      // Availability preference (20% weight) - prefer common items
      const availabilityScore = alternative.cost <= targetCost * 1.5 ? 100 : 70;
      score += availabilityScore * 0.2;
      
      return { ...alternative, score };
    });

    // Sort by score (highest first)
    const sortedAlternatives = scoredAlternatives.sort((a, b) => b.score - a.score);

    // Select exactly 3 alternatives with good variety
    const selectedAlternatives = [];
    const usedCategories = new Set();
    
    // First pass: select best scoring items from different categories
    for (const alternative of sortedAlternatives) {
      if (selectedAlternatives.length >= 3) break;
      
      // Prefer items from different categories for variety
      if (!usedCategories.has(alternative.category) || selectedAlternatives.length >= 2) {
        selectedAlternatives.push(alternative);
        usedCategories.add(alternative.category);
      }
    }
    
    // If we don't have 3 yet, fill with remaining best options
    if (selectedAlternatives.length < 3) {
      for (const alternative of sortedAlternatives) {
        if (selectedAlternatives.length >= 3) break;
        if (!selectedAlternatives.some(alt => alt.id === alternative.id)) {
          selectedAlternatives.push(alternative);
        }
      }
    }

    console.log(`Selected 3 alternatives for ${meal.name}:`, selectedAlternatives.map(alt => `${alt.name} (score: ${alt.score.toFixed(1)})`));
    
    return selectedAlternatives.slice(0, 3);
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

        {/* Student Details Warning */}
        {!studentDetails && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Complete Your Profile</span>
            </div>
            <p className="text-yellow-700 mt-2">
              To generate personalized meal plans, please complete your student details including weight, height, body type, and fitness goals.
            </p>
            <Button 
              onClick={() => setShowDetailsModal(true)}
              className="mt-3"
              size="sm"
            >
              Complete Profile
            </Button>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 mb-6">
          <Tabs value={selectedDiet} onValueChange={(value) => setSelectedDiet(value as "veg" | "nonveg")}>
            <TabsList>
              <TabsTrigger value="veg" className="flex items-center space-x-2">
                <Apple className="h-4 w-4" />
                <span>Vegetarian</span>
              </TabsTrigger>
              <TabsTrigger value="nonveg" className="flex items-center space-x-2">
                <Drumstick className="h-4 w-4" />
                <span>Non-Vegetarian</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button 
            onClick={generateMealPlans} 
            className="flex items-center space-x-2"
            disabled={!studentDetails}
          >
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
                           {/* Show food items from meal_plan_items */}
                           {plan.meal_plan_items?.map((item, index) => (
                             <div key={index} className="flex items-center justify-between text-sm">
                               <div className="flex items-center space-x-2">
                                 <span className="font-medium">{item.food_items?.name || 'Food Item'}</span>
                                 <span className="text-muted-foreground">
                                   {item.quantity_grams ? `(${item.quantity_grams}g)` : ''}
                                 </span>
                               </div>
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleMealNotAvailable({
                                   id: item.food_item_id,
                                   name: item.food_items?.name,
                                   meal_type: plan.meal_type,
                                   calories: plan.total_calories,
                                   cost: plan.total_cost
                                 })}
                                 disabled={isProcessingAlternative}
                                 className="text-xs h-6 px-2"
                               >
                                 {isProcessingAlternative ? "Loading..." : "Not Available"}
                               </Button>
                             </div>
                           ))}
                           
                           {/* Show student meals for this meal type */}
                           {studentMeals
                             .filter(meal => meal.meal_type === plan.meal_type)
                             .slice(0, 2) // Show max 2 student meals per meal plan
                             .map((meal, index) => (
                               <div key={`student-${index}`} className="flex items-center justify-between text-sm">
                                 <div className="flex items-center space-x-2">
                                   <span className="font-medium">{meal.meal_name}</span>
                                   <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">
                                     Your Meal
                                   </span>
                                 </div>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => handleMealNotAvailable({
                                     id: meal.id,
                                     name: meal.meal_name,
                                     meal_type: plan.meal_type,
                                     calories: meal.estimated_calories || 300,
                                     cost: meal.estimated_cost || 20
                                   })}
                                   disabled={isProcessingAlternative}
                                   className="text-xs h-6 px-2"
                                 >
                                   {isProcessingAlternative ? "Loading..." : "Not Available"}
                                 </Button>
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
      <SimpleAddMealModal 
        open={showAddMeal} 
        onOpenChange={setShowAddMeal}
        onMealAdded={fetchStudentMeals}
      />

       {/* Student Details Modal */}
       <StudentDetailsModal 
         open={showDetailsModal} 
         onOpenChange={setShowDetailsModal}
       />

       {/* Meal Alternative Modal */}
       {selectedMealForAlternative && (
         <MealAlternativeModal
           open={showAlternativeModal}
           onOpenChange={setShowAlternativeModal}
           originalMeal={selectedMealForAlternative}
           alternatives={getAlternativesForMeal(selectedMealForAlternative)}
           onSelectAlternative={handleSelectAlternative}
         />
       )}
     </div>
   );
 };

export default MealPlans;