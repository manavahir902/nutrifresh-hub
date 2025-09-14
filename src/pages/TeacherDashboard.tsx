import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Calendar, 
  Target, 
  Award,
  GraduationCap,
  BarChart3,
  Send,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { StudentAnalytics } from "@/components/teacher/StudentAnalytics";
import { MessageStudents } from "@/components/teacher/MessageStudents";
import { MealPlanGenerator } from "@/components/teacher/MealPlanGenerator";
import { AISuggestionsManager } from "@/components/teacher/AISuggestionsManager";

interface StudentStats {
  totalStudents: number;
  activeStudents: number;
  totalMealsLogged: number;
  averageCalories: number;
  studentsWithGoals: number;
}

interface RecentActivity {
  id: string;
  type: 'meal_logged' | 'goal_updated' | 'message_sent';
  student_name: string;
  description: string;
  timestamp: string;
}

export function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudentStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalMealsLogged: 0,
    averageCalories: 0,
    studentsWithGoals: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      console.log('🔍 TEACHER DASHBOARD DEBUG');
      console.log('========================');
      console.log('Fetching dashboard data...');
      console.log('Current user:', user?.id);
      console.log('User email:', user?.email);
      
      // Check if user is authenticated
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      console.log('Auth check result:', { currentUser, authError });
      
      // Fetch student statistics
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      console.log('Students query result:', { students, studentsError });
      if (studentsError) {
        console.error('Students query failed:', studentsError);
        throw studentsError;
      }

      // Fetch student details
      const { data: studentDetails, error: detailsError } = await supabase
        .from('student_details')
        .select('*');

      console.log('Student details query result:', { studentDetails, detailsError });
      if (detailsError) throw detailsError;

      // Fetch recent meals
      const { data: recentMeals, error: mealsError } = await supabase
        .from('student_meals')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('Meals query result:', { recentMeals, mealsError });
      if (mealsError) throw mealsError;

      // Get student names for meals
      const mealWithNames = recentMeals?.map(meal => {
        const student = students?.find(s => s.user_id === meal.user_id);
        return {
          ...meal,
          profile: {
            first_name: student?.first_name || 'Unknown',
            last_name: student?.last_name || 'Student'
          }
        };
      }) || [];

      // Calculate statistics
      const totalStudents = students?.length || 0;
      const studentsWithGoals = studentDetails?.length || 0;
      const totalMealsLogged = recentMeals?.length || 0;
      
      // Calculate average calories from recent meals
      const totalCalories = recentMeals?.reduce((sum, meal) => sum + (meal.estimated_calories || 0), 0) || 0;
      const averageCalories = totalMealsLogged > 0 ? Math.round(totalCalories / totalMealsLogged) : 0;

      setStats({
        totalStudents,
        activeStudents: totalStudents, // For now, assume all students are active
        totalMealsLogged,
        averageCalories,
        studentsWithGoals
      });

      // Format recent activity
      const activity: RecentActivity[] = mealWithNames?.map(meal => ({
        id: meal.id,
        type: 'meal_logged',
        student_name: `${meal.profile?.first_name} ${meal.profile?.last_name}`,
        description: `Logged ${meal.meal_name} (${meal.estimated_calories} calories)`,
        timestamp: meal.created_at
      })) || [];

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span>Teacher Dashboard</span>
          </h1>
          <p className="text-muted-foreground">
            Monitor student progress and manage nutrition education
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeStudents} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meals Logged</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMealsLogged}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Calories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCalories}</div>
            <p className="text-xs text-muted-foreground">
              Per meal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Set</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studentsWithGoals}</div>
            <p className="text-xs text-muted-foreground">
              Students with goals
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="meal-plans" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Meal Plans</span>
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>AI Suggestions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <StudentAnalytics />
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <MessageStudents />
        </TabsContent>

        <TabsContent value="meal-plans" className="space-y-4">
          <MealPlanGenerator />
        </TabsContent>

        <TabsContent value="suggestions" className="space-y-4">
          <AISuggestionsManager />
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Latest student activities and progress updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {activity.type === 'meal_logged' && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.student_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent activity to display</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

