import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BarChart3, PieChart, Users, User, TrendingUp, Calendar } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

const NutritionDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const mockChartData = {
    healthyVsUnhealthy: { healthy: 65, unhealthy: 35 },
    weeklyCalories: [1800, 1950, 1720, 2100, 1890, 1760, 2050],
    studentComparison: [
      { name: "Alice", healthy: 80, calories: 1850 },
      { name: "Bob", healthy: 65, calories: 2100 },
      { name: "Carol", healthy: 90, calories: 1750 },
      { name: "David", healthy: 55, calories: 2200 }
    ]
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
            value="1,890"
            subtitle="Calories per day"
            icon={TrendingUp}
            variant="default"
          />
          <StatCard
            title="Healthy Meals"
            value="65%"
            subtitle="This week"
            icon={PieChart}
            variant="success"
          />
          <StatCard
            title="Active Students"
            value="24"
            subtitle="Logging meals"
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Days Tracked"
            value="7/7"
            subtitle="This week"
            icon={Calendar}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Healthy vs Unhealthy Chart */}
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-primary" />
                    <span>Healthy vs Unhealthy Meals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    {/* Simplified pie chart representation */}
                    <div className="w-full h-full rounded-full bg-gradient-to-r from-success to-accent flex items-center justify-center">
                      <div className="w-32 h-32 bg-destructive/20 rounded-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">65%</div>
                          <div className="text-sm text-muted-foreground">Healthy</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-success rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Healthy (65%)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-destructive/60 rounded-full"></div>
                      <span className="text-sm text-muted-foreground">Unhealthy (35%)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                              width: `${(mockChartData.weeklyCalories[index] / 2500) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <div className="w-16 text-sm font-medium text-right">
                          {mockChartData.weeklyCalories[index]}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      Average: <span className="font-medium text-foreground">1,890 calories/day</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="animate-fade-in">
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Student-wise Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockChartData.studentComparison.map((student, index) => (
                    <div key={student.name} className="bg-secondary/30 p-6 rounded-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-foreground">{student.name}</h3>
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Healthy Ratio</span>
                            <span className="font-medium">{student.healthy}%</span>
                          </div>
                          <div className="bg-muted rounded-full h-2">
                            <div 
                              className="bg-success h-full rounded-full transition-all duration-300"
                              style={{ width: `${student.healthy}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Avg. Calories</span>
                          <span className="font-medium">{student.calories}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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