import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface SimpleAddMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMealAdded?: () => void;
}

export function SimpleAddMealModal({ open, onOpenChange, onMealAdded }: SimpleAddMealModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mealName: "",
    mealType: "",
    description: "",
    estimatedCalories: "",
    estimatedCost: ""
  });

  const mealTypes = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
    { value: "snack", label: "Snack" }
  ];


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.mealName || !formData.mealType || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Add the meal to a custom student_meals table
      const { error } = await supabase
        .from('student_meals' as any)
        .insert({
          user_id: user.id,
          meal_name: formData.mealName,
          meal_type: formData.mealType,
          student_class: "6-8", // Default class
          description: formData.description,
          estimated_calories: formData.estimatedCalories ? parseInt(formData.estimatedCalories) : null,
          estimated_cost: formData.estimatedCost ? parseFloat(formData.estimatedCost) : null,
          is_custom: true
        });

      if (error) throw error;

      toast({
        title: "Meal Added!",
        description: `${formData.mealName} has been added to your meal options.`,
      });

      // Reset form
      setFormData({
        mealName: "",
        mealType: "",
        description: "",
        estimatedCalories: "",
        estimatedCost: ""
      });

      onOpenChange(false);
      onMealAdded?.();
    } catch (error) {
      console.error('Error adding meal:', error);
      toast({
        title: "Error",
        description: "Failed to add meal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-primary" />
            <span>Add Your Meal</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meal Name */}
          <div className="space-y-2">
            <Label htmlFor="mealName">Meal Name *</Label>
            <Input
              id="mealName"
              placeholder="e.g., Mom's Dal Rice, School Canteen Sandwich"
              value={formData.mealName}
              onChange={(e) => setFormData({ ...formData, mealName: e.target.value })}
              required
            />
          </div>

          {/* Meal Type */}
          <div className="space-y-2">
            <Label htmlFor="mealType">Meal Type *</Label>
            <Select value={formData.mealType} onValueChange={(value) => setFormData({ ...formData, mealType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {mealTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your meal, ingredients, or where you usually have it..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Estimated Calories */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCalories">Estimated Calories (Optional)</Label>
            <Input
              id="estimatedCalories"
              type="number"
              placeholder="e.g., 350"
              value={formData.estimatedCalories}
              onChange={(e) => setFormData({ ...formData, estimatedCalories: e.target.value })}
            />
          </div>

          {/* Estimated Cost */}
          <div className="space-y-2">
            <Label htmlFor="estimatedCost">Estimated Cost in ₹ (Optional)</Label>
            <Input
              id="estimatedCost"
              type="number"
              step="0.1"
              placeholder="e.g., 25.50"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Save className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Add Meal
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
