import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface FoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  cost_per_100g_rupees: number;
  is_veg: boolean;
  category: string;
}

interface SelectedFood {
  foodItem: FoodItem;
  quantity: number;
}

interface AddMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  foodItems: FoodItem[];
}

export function AddMealModal({ open, onOpenChange, foodItems }: AddMealModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mealName, setMealName] = useState("");
  const [mealType, setMealType] = useState("");
  const [selectedFoods, setSelectedFoods] = useState<SelectedFood[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState("");
  const [quantity, setQuantity] = useState(100);

  const addFoodItem = () => {
    const foodItem = foodItems.find(item => item.id === selectedFoodId);
    if (foodItem && quantity > 0) {
      setSelectedFoods([...selectedFoods, { foodItem, quantity }]);
      setSelectedFoodId("");
      setQuantity(100);
    }
  };

  const removeFoodItem = (index: number) => {
    setSelectedFoods(selectedFoods.filter((_, i) => i !== index));
  };

  const calculateTotalCalories = () => {
    return selectedFoods.reduce((total, { foodItem, quantity }) => {
      return total + (foodItem.calories_per_100g * quantity / 100);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mealName || !mealType || selectedFoods.length === 0 || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and add at least one food item.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const totalCalories = Math.round(calculateTotalCalories());
      
      // Create user meal
      const { data: userMeal, error: mealError } = await supabase
        .from('user_meals')
        .insert({
          user_id: user.id,
          meal_name: mealName,
          meal_type: mealType,
          total_calories: totalCalories
        })
        .select()
        .single();

      if (mealError) throw mealError;

      // Create user meal items
      const mealItems = selectedFoods.map(({ foodItem, quantity }) => ({
        user_meal_id: userMeal.id,
        food_item_id: foodItem.id,
        quantity_grams: quantity
      }));

      const { error: itemsError } = await supabase
        .from('user_meal_items')
        .insert(mealItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Meal Logged!",
        description: `${mealName} has been added with ${totalCalories} calories.`,
      });

      // Reset form
      setMealName("");
      setMealType("");
      setSelectedFoods([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error logging meal:', error);
      toast({
        title: "Error",
        description: "Failed to log meal. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Add Your Meal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mealName">Meal Name</Label>
              <Input
                id="mealName"
                placeholder="e.g., Breakfast, Lunch Combo"
                value={mealName}
                onChange={(e) => setMealName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mealType">Meal Type</Label>
              <Select value={mealType} onValueChange={setMealType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select meal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Food Item */}
          <div className="space-y-4">
            <Label>Add Food Items</Label>
            <div className="flex gap-2">
              <Select value={selectedFoodId} onValueChange={setSelectedFoodId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select food item" />
                </SelectTrigger>
                <SelectContent>
                  {foodItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{item.name}</span>
                        <div className="flex items-center space-x-2 ml-2">
                          <Badge variant={item.is_veg ? "secondary" : "destructive"}>
                            {item.is_veg ? "Veg" : "Non-Veg"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.calories_per_100g} cal/100g
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="100"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                <Label className="text-sm text-muted-foreground">g</Label>
              </div>
              
              <Button type="button" onClick={addFoodItem} disabled={!selectedFoodId || quantity <= 0}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Selected Foods */}
          {selectedFoods.length > 0 && (
            <div className="space-y-4">
              <Label>Selected Food Items</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedFoods.map(({ foodItem, quantity }, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{foodItem.name}</span>
                      <div className="text-sm text-muted-foreground">
                        {quantity}g • {Math.round(foodItem.calories_per_100g * quantity / 100)} calories
                        • ₹{Math.round(foodItem.cost_per_100g_rupees * quantity / 100)}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFoodItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total Calories */}
          {selectedFoods.length > 0 && (
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  <span className="font-medium">Total Calories</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {Math.round(calculateTotalCalories())} cal
                </span>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || selectedFoods.length === 0}>
            {loading ? "Logging Meal..." : "Log Meal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}