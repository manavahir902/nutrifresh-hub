import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Apple, 
  Zap,
  Clock,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NutritionGoal {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface DailyIntake {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string;
}

interface WeeklyProgress {
  [key: string]: DailyIntake;
}

export function NutritionDashboard() {
  const { user } = useAuth();
  const { profile } = useUserRole();
  const { toast } = useToast();
  const [goals, setGoals] = useState<NutritionGoal>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fats: 67
  });
  const [todayIntake, setTodayIntake] = useState<DailyIntake>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    date: new Date().toISOString().split('T')[0]
  });
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress>({});
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchNutritionData();
    }
  }, [user]);

  const fetchNutritionData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch user's student details to calculate goals
      const { data: studentDetails, error: detailsError } = await supabase
        .from('student_details')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (detailsError) {
        console.error('Error fetching student details:', detailsError);
      } else if (studentDetails) {
        // Calculate personalized nutrition goals
        const calculatedGoals = calculateNutritionGoals(studentDetails, profile);
        setGoals(calculatedGoals);
      }

      // Fetch today's meals
      await fetchTodayIntake();
      
      // Fetch weekly progress
      await fetchWeeklyProgress();
      
      // Calculate streak and achievements
      await calculateStreakAndAchievements();
      
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      toast({
        title: "Error",
        description: "Failed to load nutrition data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateNutritionGoals = (studentDetails: any, profile: any) => {
    // Basic BMR calculation
    const age = profile?.age_group === '13-17' ? 15 : 20;
    const weight = studentDetails?.weight || 60;
    const height = studentDetails?.height_cm || 170;
    
    // Mifflin-St Jeor Equation (simplified)
    let bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    
    // Activity factor
    const activityFactor = 1.4;
    const dailyCalories = Math.round(bmr * activityFactor);
    
    // Adjust based on goal
    let calorieMultiplier = 1;
    switch (studentDetails?.goal) {
      case 'lose_weight':
        calorieMultiplier = 0.8; // 20% deficit
        break;
      case 'gain_weight':
        calorieMultiplier = 1.2; // 20% surplus
        break;
      default:
        calorieMultiplier = 1; // maintain
    }
    
    const targetCalories = Math.round(dailyCalories * calorieMultiplier);
    
    // Macronutrient distribution
    const protein = Math.round(targetCalories * 0.25 / 4); // 25% calories from protein
    const carbs = Math.round(targetCalories * 0.50 / 4);   // 50% calories from carbs
    const fats = Math.round(targetCalories * 0.25 / 9);    // 25% calories from fats

    return {
      calories: targetCalories,
      protein,
      carbs,
      fats
    };
  };

  const fetchTodayIntake = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's meals
      const { data: meals, error } = await supabase
        .from('student_meals')
        .select(`
          *,
          meal_items:student_meal_items(
            quantity_grams,
            food_item:food_items(
              calories_per_100g,
              protein_per_100g,
              carbs_per_100g,
              fats_per_100g
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('meal_date', today);

      if (error) {
        console.error('Error fetching today\'s meals:', error);
        return;
      }

      // Calculate total intake
      let totalCalories = 0;
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFats = 0;

      meals?.forEach(meal => {
        meal.meal_items?.forEach((item: any) => {
          const quantity = item.quantity_grams / 100;
          const food = item.food_item;
          
          if (food) {
            totalCalories += food.calories_per_100g * quantity;
            totalProtein += (food.protein_per_100g || 0) * quantity;
            totalCarbs += (food.carbs_per_100g || 0) * quantity;
            totalFats += (food.fats_per_100g || 0) * quantity;
          }
        });
      });

      setTodayIntake({
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fats: Math.round(totalFats),
        date: today
      });
    } catch (error) {
      console.error('Error calculating today\'s intake:', error);
    }
  };

  const fetchWeeklyProgress = async () => {
    if (!user) return;

    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
      endOfWeek.setHours(23, 59, 59, 999);

      const { data: meals, error } = await supabase
        .from('student_meals')
        .select(`
          meal_date,
          meal_items:student_meal_items(
            quantity_grams,
            food_item:food_items(
              calories_per_100g,
              protein_per_100g,
              carbs_per_100g,
              fats_per_100g
            )
          )
        `)
        .eq('user_id', user.id)
        .gte('meal_date', startOfWeek.toISOString().split('T')[0])
        .lte('meal_date', endOfWeek.toISOString().split('T')[0]);

      if (error) {
        console.error('Error fetching weekly meals:', error);
        return;
      }

      // Group by date and calculate daily totals
      const weeklyData: WeeklyProgress = {};
      
      meals?.forEach(meal => {
        const date = meal.meal_date;
        if (!weeklyData[date]) {
          weeklyData[date] = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
            date
          };
        }

        meal.meal_items?.forEach((item: any) => {
          const quantity = item.quantity_grams / 100;
          const food = item.food_item;
          
          if (food) {
            weeklyData[date].calories += food.calories_per_100g * quantity;
            weeklyData[date].protein += (food.protein_per_100g || 0) * quantity;
            weeklyData[date].carbs += (food.carbs_per_100g || 0) * quantity;
            weeklyData[date].fats += (food.fats_per_100g || 0) * quantity;
          }
        });
      });

      // Round all values
      Object.keys(weeklyData).forEach(date => {
        weeklyData[date].calories = Math.round(weeklyData[date].calories);
        weeklyData[date].protein = Math.round(weeklyData[date].protein);
        weeklyData[date].carbs = Math.round(weeklyData[date].carbs);
        weeklyData[date].fats = Math.round(weeklyData[date].fats);
      });

      setWeeklyProgress(weeklyData);
    } catch (error) {
      console.error('Error calculating weekly progress:', error);
    }
  };

  const calculateStreakAndAchievements = async () => {
    if (!user) return;

    try {
      // Calculate current streak (consecutive days meeting calorie goals)
      let currentStreak = 0;
      const today = new Date();
      
      for (let i = 0; i < 30; i++) { // Check last 30 days
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const dayIntake = weeklyProgress[dateStr];
        if (dayIntake && dayIntake.calories >= goals.calories * 0.8) { // 80% of goal counts
          currentStreak++;
        } else {
          break;
        }
      }
      
      setStreak(currentStreak);

      // Calculate achievements
      const newAchievements: string[] = [];
      
      if (currentStreak >= 7) newAchievements.push('7-Day Streak');
      if (currentStreak >= 30) newAchievements.push('30-Day Streak');
      
      // Check if today's goals are met
      if (todayIntake.calories >= goals.calories * 0.9) {
        newAchievements.push('Daily Goal Met');
      }
      
      // Check weekly average
      const weeklyAvg = Object.values(weeklyProgress).reduce((sum, day) => sum + day.calories, 0) / 7;
      if (weeklyAvg >= goals.calories * 0.9) {
        newAchievements.push('Weekly Goal Met');
      }
      
      setAchievements(newAchievements);
    } catch (error) {
      console.error('Error calculating streak and achievements:', error);
    }
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressVariant = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return 'default';
    if (percentage >= 80) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Target className="h-6 w-6 text-primary" />
              <span>Nutrition Dashboard</span>
            </h2>
            <p className="text-muted-foreground mt-1">
              Track your daily nutrition progress
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-2 w-full" />
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
            <Target className="h-6 w-6 text-primary" />
            <span>Nutrition Dashboard</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            Track your daily nutrition progress and goals
          </p>
        </div>
        <Button
          onClick={fetchNutritionData}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Loader2 className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Daily Goals Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayIntake.calories} / {goals.calories}
            </div>
            <Progress 
              value={(todayIntake.calories / goals.calories) * 100} 
              className="mt-2"
            />
            <p className={`text-xs mt-1 ${getProgressColor(todayIntake.calories, goals.calories)}`}>
              {Math.round((todayIntake.calories / goals.calories) * 100)}% of daily goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protein</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayIntake.protein}g / {goals.protein}g
            </div>
            <Progress 
              value={(todayIntake.protein / goals.protein) * 100} 
              className="mt-2"
            />
            <p className={`text-xs mt-1 ${getProgressColor(todayIntake.protein, goals.protein)}`}>
              {Math.round((todayIntake.protein / goals.protein) * 100)}% of daily goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbs</CardTitle>
            <Apple className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayIntake.carbs}g / {goals.carbs}g
            </div>
            <Progress 
              value={(todayIntake.carbs / goals.carbs) * 100} 
              className="mt-2"
            />
            <p className={`text-xs mt-1 ${getProgressColor(todayIntake.carbs, goals.carbs)}`}>
              {Math.round((todayIntake.carbs / goals.carbs) * 100)}% of daily goal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fats</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayIntake.fats}g / {goals.fats}g
            </div>
            <Progress 
              value={(todayIntake.fats / goals.fats) * 100} 
              className="mt-2"
            />
            <p className={`text-xs mt-1 ${getProgressColor(todayIntake.fats, goals.fats)}`}>
              {Math.round((todayIntake.fats / goals.fats) * 100)}% of daily goal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Streak and Achievements */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Current Streak</span>
            </CardTitle>
            <CardDescription>
              Consecutive days meeting your nutrition goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {streak} days
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-muted-foreground">
                Keep it up! You're doing great.
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Achievements</span>
            </CardTitle>
            <CardDescription>
              Recent accomplishments and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {achievements.length > 0 ? (
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <Badge key={index} variant="default" className="mr-2">
                    {achievement}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Complete your daily goals to earn achievements!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Weekly Progress</span>
          </CardTitle>
          <CardDescription>
            Your calorie intake over the past week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(weeklyProgress).map(([date, intake]) => {
              const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
              const isToday = date === todayIntake.date;
              
              return (
                <div key={date} className="flex items-center space-x-4">
                  <div className="w-12 text-sm font-medium">
                    {dayName}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{intake.calories} cal</span>
                      <span className={getProgressColor(intake.calories, goals.calories)}>
                        {Math.round((intake.calories / goals.calories) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(intake.calories / goals.calories) * 100} 
                      variant={getProgressVariant(intake.calories, goals.calories)}
                    />
                  </div>
                  {isToday && (
                    <Badge variant="default">Today</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
