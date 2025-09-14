import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Plus, 
  Bot, 
  Target, 
  Users,
  Zap,
  Clock,
  TrendingUp,
  Eye,
  Trash2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_details?: {
    weight: number;
    height_cm: number;
    body_type: string;
    goal: string;
  };
}

interface MealPlan {
  id: string;
  plan_name: string;
  plan_type: string;
  duration_days: number;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fats: number;
  is_active: boolean;
  created_at: string;
  student: {
    first_name: string;
    last_name: string;
  };
}

interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  cost_per_100g_rupees: number;
  is_veg: boolean;
  category: string;
}

export function MealPlanGenerator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [formData, setFormData] = useState({
    planName: "",
    planType: "balance_weight",
    durationDays: 7
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch students with their details
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name,
          email,
          student_details(*)
        `)
        .eq('role', 'student')
        .order('first_name');

      if (studentsError) throw studentsError;

      // Fetch existing meal plans
      const { data: mealPlansData, error: mealPlansError } = await supabase
        .from('personalized_meal_plans')
        .select(`
          *,
          student:profiles!personalized_meal_plans_student_id_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (mealPlansError) throw mealPlansError;

      // Fetch food items
      const { data: foodItemsData, error: foodItemsError } = await supabase
        .from('food_items')
        .select('*')
        .order('name');

      if (foodItemsError) throw foodItemsError;

      setStudents(studentsData?.map(s => ({ id: s.user_id, ...s })) || []);
      setMealPlans(mealPlansData || []);
      setFoodItems(foodItemsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNutritionalNeeds = (student: Student) => {
    if (!student.student_details) return null;

    const { weight, height_cm, body_type, goal } = student.student_details;
    
    // Calculate BMR using Mifflin-St Jeor Equation
    const age = 16; // Default age for students
    const bmr = 10 * weight + 6.25 * height_cm - 5 * age + 5; // Male formula
    
    // Activity factor (sedentary to lightly active for students)
    const activityFactor = 1.4;
    const tdee = bmr * activityFactor;
    
    let targetCalories = tdee;
    let proteinRatio = 0.25;
    let carbRatio = 0.45;
    let fatRatio = 0.30;
    
    // Adjust based on goal
    switch (goal) {
      case 'weight_gain':
        targetCalories = tdee + 300;
        proteinRatio = 0.30;
        carbRatio = 0.40;
        fatRatio = 0.30;
        break;
      case 'weight_loss':
        targetCalories = tdee - 300;
        proteinRatio = 0.35;
        carbRatio = 0.35;
        fatRatio = 0.30;
        break;
      case 'balance_weight':
      default:
        // Keep default ratios
        break;
    }
    
    return {
      calories: Math.round(targetCalories),
      protein: Math.round((targetCalories * proteinRatio) / 4), // 4 cal/g protein
      carbs: Math.round((targetCalories * carbRatio) / 4), // 4 cal/g carbs
      fats: Math.round((targetCalories * fatRatio) / 9) // 9 cal/g fat
    };
  };

  const generateMealPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !formData.planName) {
      toast({
        title: "Missing Information",
        description: "Please select a student and enter a plan name.",
        variant: "destructive"
      });
      return;
    }

    const student = students.find(s => s.id === selectedStudent);
    if (!student || !student.student_details) {
      toast({
        title: "Student Details Missing",
        description: "Selected student doesn't have complete details.",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);

    try {
      const nutritionalNeeds = calculateNutritionalNeeds(student);
      if (!nutritionalNeeds) throw new Error("Could not calculate nutritional needs");

      // Create the meal plan
      const { data: mealPlanData, error: mealPlanError } = await supabase
        .from('personalized_meal_plans')
        .insert({
          student_id: selectedStudent,
          plan_name: formData.planName,
          plan_type: formData.planType,
          duration_days: formData.durationDays,
          daily_calories: nutritionalNeeds.calories,
          daily_protein: nutritionalNeeds.protein,
          daily_carbs: nutritionalNeeds.carbs,
          daily_fats: nutritionalNeeds.fats,
          created_by: user!.id
        })
        .select()
        .single();

      if (mealPlanError) throw mealPlanError;

      // Generate meal plan items for each day and meal type
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      const mealCalorieDistribution = {
        breakfast: 0.25,
        lunch: 0.35,
        dinner: 0.30,
        snack: 0.10
      };

      const mealPlanItems = [];

      for (let day = 1; day <= formData.durationDays; day++) {
        for (const mealType of mealTypes) {
          const targetCalories = Math.round(nutritionalNeeds.calories * mealCalorieDistribution[mealType as keyof typeof mealCalorieDistribution]);
          
          // Select appropriate food items based on meal type and nutritional needs
          const selectedFoods = selectFoodItemsForMeal(mealType, targetCalories, formData.planType);
          
          for (const food of selectedFoods) {
            mealPlanItems.push({
              meal_plan_id: mealPlanData.id,
              day_of_week: day,
              meal_type: mealType,
              food_item_id: food.id,
              quantity_grams: food.quantity
            });
          }
        }
      }

      // Insert all meal plan items
      const { error: itemsError } = await supabase
        .from('personalized_meal_plan_items')
        .insert(mealPlanItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Meal Plan Generated!",
        description: `AI-generated meal plan created for ${student.first_name} ${student.last_name}`,
      });

      setShowCreateModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate meal plan.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const selectFoodItemsForMeal = (mealType: string, targetCalories: number, planType: string) => {
    const selectedFoods = [];
    let remainingCalories = targetCalories;

    // Filter food items based on meal type and plan type
    let availableFoods = foodItems.filter(food => {
      if (mealType === 'breakfast') {
        return ['grain', 'dairy', 'fruit'].includes(food.category);
      } else if (mealType === 'lunch' || mealType === 'dinner') {
        return ['grain', 'protein', 'vegetable', 'dairy'].includes(food.category);
      } else if (mealType === 'snack') {
        return ['fruit', 'dairy'].includes(food.category);
      }
      return true;
    });

    // Adjust for plan type
    if (planType === 'weight_gain') {
      availableFoods = availableFoods.filter(food => food.calories_per_100g > 100);
    } else if (planType === 'weight_loss') {
      availableFoods = availableFoods.filter(food => food.calories_per_100g < 200);
    }

    // Select foods to meet calorie target
    while (remainingCalories > 50 && availableFoods.length > 0) {
      const randomFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];
      const maxQuantity = Math.min(200, Math.round(remainingCalories / (randomFood.calories_per_100g / 100)));
      
      if (maxQuantity >= 50) {
        selectedFoods.push({
          id: randomFood.id,
          quantity: maxQuantity
        });
        remainingCalories -= (randomFood.calories_per_100g / 100) * maxQuantity;
      }
      
      // Remove this food to avoid repetition
      availableFoods = availableFoods.filter(f => f.id !== randomFood.id);
    }

    return selectedFoods;
  };

  const resetForm = () => {
    setFormData({
      planName: "",
      planType: "balance_weight",
      durationDays: 7
    });
    setSelectedStudent("");
  };

  const toggleMealPlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('personalized_meal_plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Meal plan ${!currentStatus ? 'activated' : 'deactivated'} successfully.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update meal plan status.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading meal plans...</p>
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
            <Bot className="h-6 w-6 text-primary" />
            <span>AI Meal Plan Generator</span>
          </h2>
          <p className="text-muted-foreground">
            Generate personalized meal plans based on student goals and body type
          </p>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Generate Meal Plan</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>Generate AI Meal Plan</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={generateMealPlan} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Select Student</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.filter(s => s.student_details).map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} - {student.student_details?.goal.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name</Label>
                <Input
                  id="planName"
                  placeholder="e.g., Weight Loss Plan - Week 1"
                  value={formData.planName}
                  onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type</Label>
                <Select value={formData.planType} onValueChange={(value) => setFormData({ ...formData, planType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weight_loss">Weight Loss</SelectItem>
                    <SelectItem value="weight_gain">Weight Gain</SelectItem>
                    <SelectItem value="balance_weight">Balance Weight</SelectItem>
                    <SelectItem value="muscle_building">Muscle Building</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Days)</Label>
                <Select value={formData.durationDays.toString()} onValueChange={(value) => setFormData({ ...formData, durationDays: parseInt(value) })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 Days (1 Week)</SelectItem>
                    <SelectItem value="14">14 Days (2 Weeks)</SelectItem>
                    <SelectItem value="30">30 Days (1 Month)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedStudent && (
                <div className="p-3 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Student Details:</h4>
                  {(() => {
                    const student = students.find(s => s.id === selectedStudent);
                    const needs = student ? calculateNutritionalNeeds(student) : null;
                    return needs ? (
                      <div className="text-sm space-y-1">
                        <p>Target Calories: {needs.calories} kcal/day</p>
                        <p>Protein: {needs.protein}g | Carbs: {needs.carbs}g | Fats: {needs.fats}g</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={generating}>
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate Meal Plan
                  </>
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Meal Plans List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Generated Meal Plans</span>
          </CardTitle>
          <CardDescription>
            AI-generated personalized meal plans for students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Plan Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Daily Calories</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mealPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="font-medium">
                      {plan.student?.first_name} {plan.student?.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{plan.plan_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {plan.plan_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.duration_days} days</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span>{plan.daily_calories} kcal</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? "default" : "secondary"}>
                      {plan.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(plan.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleMealPlanStatus(plan.id, plan.is_active)}
                      >
                        {plan.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {mealPlans.length === 0 && (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No meal plans generated yet</p>
              <p className="text-sm text-muted-foreground">Start by generating your first AI meal plan</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

