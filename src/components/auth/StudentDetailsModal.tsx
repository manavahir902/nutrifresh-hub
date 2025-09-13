import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Ruler, Weight, Target, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StudentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StudentDetailsModal({ open, onOpenChange }: StudentDetailsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    weight: "",
    heightInput: "",
    heightUnit: "cm", // "cm" or "feet"
    bodyType: "",
    goal: "",
    gender: ""
  });

  const bodyTypes = [
    { value: "skinny", label: "Skinny", description: "Low body fat, minimal muscle mass" },
    { value: "skinny_fat", label: "Skinny Fat", description: "Low muscle mass, higher body fat" },
    { value: "fat", label: "Overweight", description: "Higher body fat percentage" }
  ];

  const goals = [
    { value: "weight_gain", label: "Weight Gain", description: "Build muscle and increase weight" },
    { value: "weight_loss", label: "Weight Loss", description: "Reduce body fat and weight" },
    { value: "balance_weight", label: "Balance Weight", description: "Maintain current weight" }
  ];

  const genders = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" }
  ];

  const convertToCm = (value: string, unit: string) => {
    if (unit === "feet") {
      const feet = parseFloat(value);
      return Math.round(feet * 30.48); // Convert feet to cm
    }
    return Math.round(parseFloat(value));
  };

  const convertToFeet = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.weight || !formData.heightInput || !formData.bodyType || !formData.goal || !formData.gender) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save your details.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const heightCm = convertToCm(formData.heightInput, formData.heightUnit);
      const heightFeet = convertToFeet(heightCm);
      
      // Check if student details already exist
      const { data: existingDetails } = await supabase
        .from('student_details')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const studentDetailsData = {
        user_id: user.id,
        weight: parseFloat(formData.weight),
        height_cm: heightCm,
        height_feet: heightFeet,
        body_type: formData.bodyType,
        goal: formData.goal,
        gender: formData.gender
      };

      let error;
      if (existingDetails) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('student_details')
          .update(studentDetailsData)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('student_details')
          .insert(studentDetailsData);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Details Saved!",
        description: "Your student details have been saved successfully.",
      });

      onOpenChange(false);
      
      // Reset form
      setFormData({
        weight: "",
        heightInput: "",
        heightUnit: "cm",
        bodyType: "",
        goal: "",
        gender: ""
      });
    } catch (error) {
      console.error('Error saving student details:', error);
      toast({
        title: "Error",
        description: "Failed to save your details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>Student Details</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weight" className="flex items-center space-x-2">
              <Weight className="h-4 w-4 text-primary" />
              <span>Weight (kg)</span>
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="Enter your weight in kg"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              required
            />
          </div>

          {/* Height */}
          <div className="space-y-4">
            <Label className="flex items-center space-x-2">
              <Ruler className="h-4 w-4 text-primary" />
              <span>Height</span>
            </Label>
            
            <div className="space-y-3">
              {/* Height Unit Selection */}
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="heightUnit"
                    value="cm"
                    checked={formData.heightUnit === "cm"}
                    onChange={(e) => setFormData({ ...formData, heightUnit: e.target.value, heightInput: "" })}
                    className="text-primary"
                  />
                  <span>Centimeters (cm)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="heightUnit"
                    value="feet"
                    checked={formData.heightUnit === "feet"}
                    onChange={(e) => setFormData({ ...formData, heightUnit: e.target.value, heightInput: "" })}
                    className="text-primary"
                  />
                  <span>Feet</span>
                </label>
              </div>

              {/* Height Input */}
              <div className="space-y-2">
                <Label htmlFor="heightInput">
                  Height ({formData.heightUnit === "cm" ? "cm" : "feet"})
                </Label>
                <Input
                  id="heightInput"
                  type="number"
                  step={formData.heightUnit === "cm" ? "0.1" : "0.1"}
                  placeholder={`Enter height in ${formData.heightUnit === "cm" ? "centimeters" : "feet"}`}
                  value={formData.heightInput}
                  onChange={(e) => setFormData({ ...formData, heightInput: e.target.value })}
                  required
                />
                {formData.heightUnit === "feet" && (
                  <p className="text-sm text-muted-foreground">
                    Enter height in feet (e.g., 5.5 for 5 feet 6 inches)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Body Type */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary" />
              <span>Body Type</span>
            </Label>
            <Select value={formData.bodyType} onValueChange={(value) => setFormData({ ...formData, bodyType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your body type" />
              </SelectTrigger>
              <SelectContent>
                {bodyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-sm text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary" />
              <span>Gender</span>
            </Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((gender) => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Fitness Goal</span>
            </Label>
            <Select value={formData.goal} onValueChange={(value) => setFormData({ ...formData, goal: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select your fitness goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.value} value={goal.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{goal.label}</span>
                      <span className="text-sm text-muted-foreground">{goal.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* BMI Calculation Display */}
          {formData.weight && formData.heightInput && (
            <Card>
              <CardContent className="pt-4">
                <div className="text-center">
                  <h4 className="font-semibold mb-2">Your BMI</h4>
                  <div className="text-2xl font-bold text-primary">
                    {(() => {
                      const heightCm = convertToCm(formData.heightInput, formData.heightUnit);
                      const bmi = parseFloat(formData.weight) / Math.pow(heightCm / 100, 2);
                      return bmi.toFixed(1);
                    })()}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(() => {
                      const heightCm = convertToCm(formData.heightInput, formData.heightUnit);
                      const bmi = parseFloat(formData.weight) / Math.pow(heightCm / 100, 2);
                      if (bmi < 18.5) return "Underweight";
                      if (bmi < 25) return "Normal weight";
                      if (bmi < 30) return "Overweight";
                      return "Obese";
                    })()}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
              {loading ? "Saving..." : "Save Details"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}