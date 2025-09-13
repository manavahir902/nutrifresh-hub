import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, Users, User, TrendingUp, Calendar, Target, DollarSign } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { useAuth } from "@/hooks/useAuth";
import { useStudentDetails } from "@/hooks/useStudentDetails";
import { supabase } from "@/integrations/supabase/client";

const NutritionDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { studentDetails } = useStudentDetails();
  const [analytics, setAnalytics] = useState({
    weeklyCalories: [0, 0, 0, 0, 0, 0, 0],
    totalMeals: 0,
    averageCalories: 0,
    totalCost: 0,
    studentMeals: 0,
    customMeals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Fetch meal plans data
      const { data: mealPlans, error: mealPlansError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', user.id);

      if (mealPlansError) throw mealPlansError;

      // Fetch student meals data
      const { data: studentMeals, error: studentMealsError } = await supabase
        .from('student_meals' as any)
        .select('*')
        .eq('user_id', user.id);

      if (studentMealsError) {
        // If table doesn't exist, just use empty array
        if (studentMealsError.message.includes('relation "student_meals" does not exist')) {
          console.log('Student meals table not found, using empty array');
        } else {
          throw studentMealsError;
        }
      }

      // Calculate analytics
      const weeklyCalories = [0, 0, 0, 0, 0, 0, 0];
      let totalMeals = 0;
      let totalCalories = 0;
      let totalCost = 0;

      mealPlans?.forEach(plan => {
        const dayIndex = plan.day_of_week - 1;
        weeklyCalories[dayIndex] += plan.total_calories;
        totalMeals++;
        totalCalories += plan.total_calories;
        totalCost += plan.total_cost;
      });

      setAnalytics({
        weeklyCalories,
        totalMeals,
        averageCalories: totalMeals > 0 ? Math.round(totalCalories / totalMeals) : 0,
        totalCost: Math.round(totalCost * 100) / 100,
        studentMeals: (studentMeals || [])?.length || 0,
        customMeals: (studentMeals || [])?.filter(meal => meal.is_custom).length || 0
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-green">
            <BarChart3 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Nutrition Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics and insights into eating patterns
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Weekly Average"
            value={analytics.averageCalories.toLocaleString()}
            subtitle="Calories per meal"
            icon={TrendingUp}
            variant="default"
          />
          <StatCard
            title="Your Meals"
            value={analytics.studentMeals.toString()}
            subtitle="Custom meals added"
            icon={PieChart}
            variant="success"
          />
          <StatCard
            title="Total Meals"
            value={analytics.totalMeals.toString()}
            subtitle="In meal plans"
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Weekly Cost"
            value={`₹${analytics.totalCost}`}
            subtitle="Estimated cost"
            icon={DollarSign}
            variant="success"
          />
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-96 mx-auto">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger value="class" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Class</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              {/* Weekly Calorie Intake */}
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    <span>Weekly Calorie Intake</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                      <div key={day} className="flex items-center space-x-4">
                        <div className="w-12 text-sm text-muted-foreground">{day}</div>
                        <div className="flex-1 bg-muted rounded-full h-3 relative overflow-hidden">
                          <div 
                            className="bg-gradient-primary h-full rounded-full transition-all duration-300"
                            style={{ 
                              width: `${analytics.weeklyCalories[index] > 0 ? (analytics.weeklyCalories[index] / 2500) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <div className="w-16 text-sm font-medium text-right">
                          {analytics.weeklyCalories[index] || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Average: <span className="font-medium text-foreground">{analytics.averageCalories} calories/meal</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="animate-fade-in">
            <div className="space-y-6">
              {/* Student Details Card */}
              {studentDetails && (
                <Card className="shadow-card border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-primary" />
                      <span>Your Profile</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">Physical Stats</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Weight:</span>
                              <span className="font-medium">{studentDetails.weight} kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Height:</span>
                              <span className="font-medium">{studentDetails.height_cm} cm</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Body Type:</span>
                              <span className="font-medium capitalize">{studentDetails.body_type.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">Goals & Progress</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Goal:</span>
                              <span className="font-medium capitalize">{studentDetails.goal.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Custom Meals:</span>
                              <span className="font-medium">{analytics.studentMeals}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Weekly Budget:</span>
                              <span className="font-medium">₹{analytics.totalCost}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Meal Insights */}
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span>Meal Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-secondary/30 rounded-xl">
                      <div className="text-2xl font-bold text-primary mb-2">{analytics.studentMeals}</div>
                      <div className="text-sm text-muted-foreground">Your Custom Meals</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/30 rounded-xl">
                      <div className="text-2xl font-bold text-primary mb-2">{analytics.totalMeals}</div>
                      <div className="text-sm text-muted-foreground">Total Meal Plans</div>
                    </div>
                    <div className="text-center p-4 bg-secondary/30 rounded-xl">
                      <div className="text-2xl font-bold text-primary mb-2">₹{analytics.totalCost}</div>
                      <div className="text-sm text-muted-foreground">Weekly Cost</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="class" className="animate-fade-in">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Class-wise Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-secondary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Class Comparison</h3>
                  <p className="text-muted-foreground mb-6">
                    Compare nutrition metrics across different classes and grade levels
                  </p>
                  <Button variant="outline">
                    View Class Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NutritionDashboard;