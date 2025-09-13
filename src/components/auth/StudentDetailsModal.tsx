import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, Ruler, Target, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface StudentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function StudentDetailsModal({ open, onOpenChange, onComplete }: StudentDetailsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    heightCm: "",
    heightFeet: "",
    bodyType: "",
    goal: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.weight || !formData.heightCm || !formData.heightFeet || !formData.bodyType || !formData.goal || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('student_details')
        .insert({
          user_id: user.id,
          weight: parseFloat(formData.weight),
          height_cm: parseInt(formData.heightCm),
          height_feet: formData.heightFeet,
          body_type: formData.bodyType,
          goal: formData.goal
        });

      if (error) throw error;

      toast({
        title: "Profile Complete!",
        description: "Your student details have been saved successfully.",
      });
      
      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving student details:', error);
      toast({
        title: "Error",
        description: "Failed to save student details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateFeetFromCm = (cm: string) => {
    if (!cm) return "";
    const totalInches = parseInt(cm) / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  const handleCmChange = (value: string) => {
    setFormData({ 
      ...formData, 
      heightCm: value,
      heightFeet: calculateFeetFromCm(value)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground flex items-center justify-center space-x-2">
            <User className="h-6 w-6 text-primary" />
            <span>Complete Your Profile</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center space-x-2">
              <Scale className="h-4 w-4 text-primary" />
              <span>Weight (kg)</span>
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Enter your weight"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Ruler className="h-4 w-4 text-primary" />
              <span>Height</span>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="heightCm" className="text-sm text-muted-foreground">Centimeters</Label>
                <Input
                  id="heightCm"
                  type="number"
                  placeholder="170"
                  value={formData.heightCm}
                  onChange={(e) => handleCmChange(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="heightFeet" className="text-sm text-muted-foreground">Feet & Inches</Label>
                <Input
                  id="heightFeet"
                  placeholder="5 feet 7 inches"
                  value={formData.heightFeet}
                  onChange={(e) => setFormData({ ...formData, heightFeet: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyType">Body Type</Label>
            <Select value={formData.bodyType} onValueChange={(value) => setFormData({ ...formData, bodyType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your body type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skinny">Skinny</SelectItem>
                <SelectItem value="skinny_fat">Skinny Fat</SelectItem>
                <SelectItem value="fat">Fat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal" className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Fitness Goal</span>
            </Label>
            <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_gain">Weight Gain</SelectItem>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="balance_weight">Balance Weight</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Complete Profile"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}