import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Utensils, Clock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LogMeal = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    studentName: "",
    mealType: "",
    foodItems: "",
    calories: "",
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.studentName || !formData.mealType || !formData.foodItems) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Simulate saving the meal
    toast({
      title: "Meal Logged Successfully!",
      description: `${formData.mealType} for ${formData.studentName} has been recorded.`,
    });

    // Reset form
    setFormData({
      studentName: "",
      mealType: "",
      foodItems: "",
      calories: "",
      notes: ""
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-green">
            <Plus className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Log Your Meal</h1>
          <p className="text-muted-foreground">
            Record your daily meals to track your nutrition journey
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-card border-0 animate-slide-up">
          <CardHeader className="bg-gradient-secondary rounded-t-xl">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Utensils className="h-5 w-5 text-primary" />
              <span>Meal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Name */}
              <div className="space-y-2">
                <Label htmlFor="studentName" className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-primary" />
                  <span>Student Name *</span>
                </Label>
                <Input
                  id="studentName"
                  placeholder="Enter student name"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Meal Type */}
              <div className="space-y-2">
                <Label htmlFor="mealType" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Meal Type *</span>
                </Label>
                <Select value={formData.mealType} onValueChange={(value) => setFormData({ ...formData, mealType: value })}>
                  <SelectTrigger className="focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                    <SelectItem value="lunch">☀️ Lunch</SelectItem>
                    <SelectItem value="dinner">🌙 Dinner</SelectItem>
                    <SelectItem value="snack">🍎 Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Food Items */}
              <div className="space-y-2">
                <Label htmlFor="foodItems">
                  Food Items *
                </Label>
                <Textarea
                  id="foodItems"
                  placeholder="List the foods consumed (e.g., Grilled chicken, steamed broccoli, brown rice)"
                  value={formData.foodItems}
                  onChange={(e) => setFormData({ ...formData, foodItems: e.target.value })}
                  className="min-h-[100px] focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Calories */}
              <div className="space-y-2">
                <Label htmlFor="calories">
                  Estimated Calories
                </Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="Enter estimated calories"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className="focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">
                  Additional Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about the meal..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="focus:ring-primary focus:border-primary"
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit"
                className="w-full bg-gradient-primary hover:bg-primary-hover shadow-green text-lg py-6"
              >
                <Plus className="h-5 w-5 mr-2" />
                Log Meal
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="mt-8 shadow-card border-0 bg-accent-light/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-3">💡 Quick Tips</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Be as specific as possible when listing food items</li>
              <li>• Include portion sizes if known</li>
              <li>• Don't forget to log snacks and beverages</li>
              <li>• Take a photo of your meal to remember details later</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LogMeal;