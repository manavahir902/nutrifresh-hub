import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar,
  Search,
  Eye,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface StudentWithDetails {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  age_group: string;
  student_details?: {
    weight: number;
    height_cm: number;
    body_type: string;
    goal: string;
  };
  recent_meals: number;
  total_calories: number;
  avg_calories: number;
  last_activity: string;
}

export function StudentAnalytics() {
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGoal, setFilterGoal] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    fetchStudentAnalytics();
  }, []);

  const fetchStudentAnalytics = async () => {
    try {
      // Fetch all students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('first_name');

      if (studentsError) throw studentsError;

      // Fetch student details separately
      const { data: studentDetailsData, error: detailsError } = await supabase
        .from('student_details')
        .select('*');

      if (detailsError) throw detailsError;

      if (studentsError) throw studentsError;

      // Fetch meal data for each student
      const studentsWithMeals = await Promise.all(
        studentsData.map(async (student) => {
          const { data: mealsData, error: mealsError } = await supabase
            .from('student_meals')
            .select('estimated_calories, created_at')
            .eq('user_id', student.user_id)
            .order('created_at', { ascending: false })
            .limit(30); // Last 30 meals

          if (mealsError) throw mealsError;

          const totalCalories = mealsData?.reduce((sum, meal) => sum + (meal.estimated_calories || 0), 0) || 0;
          const avgCalories = mealsData?.length > 0 ? Math.round(totalCalories / mealsData.length) : 0;
          const lastActivity = mealsData?.[0]?.created_at || student.created_at;

          // Find student details for this student
          const studentDetail = studentDetailsData?.find(detail => detail.user_id === student.user_id);

          return {
            id: student.user_id,
            first_name: student.first_name,
            last_name: student.last_name,
            email: student.email,
            age_group: student.age_group,
            student_details: studentDetail,
            recent_meals: mealsData?.length || 0,
            total_calories: totalCalories,
            avg_calories: avgCalories,
            last_activity: lastActivity
          };
        })
      );

      setStudents(studentsWithMeals);
    } catch (error) {
      console.error('Error fetching student analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGoal = filterGoal === "all" || student.student_details?.goal === filterGoal;
    
    return matchesSearch && matchesGoal;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
      case "calories":
        return b.avg_calories - a.avg_calories;
      case "meals":
        return b.recent_meals - a.recent_meals;
      case "activity":
        return new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime();
      default:
        return 0;
    }
  });

  const getGoalBadgeVariant = (goal: string) => {
    switch (goal) {
      case 'weight_gain': return 'default';
      case 'weight_loss': return 'destructive';
      case 'balance_weight': return 'secondary';
      default: return 'outline';
    }
  };

  const getBodyTypeBadgeVariant = (bodyType: string) => {
    switch (bodyType) {
      case 'skinny': return 'outline';
      case 'skinny_fat': return 'secondary';
      case 'fat': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading student analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-muted-foreground">
              Active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Calories</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.avg_calories, 0) / students.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goals Set</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => s.student_details?.goal).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Students with goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter(s => {
                const lastActivity = new Date(s.last_activity);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return lastActivity > weekAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Logged meals recently
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Student Analytics</span>
          </CardTitle>
          <CardDescription>
            Monitor student progress and nutrition habits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterGoal} onValueChange={setFilterGoal}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                <SelectItem value="weight_gain">Weight Gain</SelectItem>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="balance_weight">Balance Weight</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="calories">Avg. Calories</SelectItem>
                <SelectItem value="meals">Meals Logged</SelectItem>
                <SelectItem value="activity">Last Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Students Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Age Group</TableHead>
                  <TableHead>Body Type</TableHead>
                  <TableHead>Goal</TableHead>
                  <TableHead>Meals Logged</TableHead>
                  <TableHead>Avg. Calories</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {student.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.age_group}</Badge>
                    </TableCell>
                    <TableCell>
                      {student.student_details?.body_type ? (
                        <Badge variant={getBodyTypeBadgeVariant(student.student_details.body_type)}>
                          {student.student_details.body_type.replace('_', ' ')}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {student.student_details?.goal ? (
                        <Badge variant={getGoalBadgeVariant(student.student_details.goal)}>
                          {student.student_details.goal.replace('_', ' ')}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{student.recent_meals}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span>{student.avg_calories}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(student.last_activity).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {sortedStudents.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No students found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

