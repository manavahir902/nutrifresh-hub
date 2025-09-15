import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Plus, 
  Bot, 
  Target, 
  Users,
  Zap,
  Clock,
  TrendingUp,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { generateIndianSchoolMealPlan, IndianMealPlanOutput } from "@/utils/indianSchoolMealPlanGenerator";

interface IndianMealPlanGeneratorProps {
  onMealPlanGenerated?: (mealPlan: IndianMealPlanOutput) => void;
}

export function IndianMealPlanGenerator({ onMealPlanGenerated }: IndianMealPlanGeneratorProps) {
  const [formData, setFormData] = useState({
    ageGroup: 'upper_primary',
    dietaryPreference: 'vegetarian',
    location: 'Mumbai',
    budgetConstraint: 'medium',
    durationDays: 7
  });
  
  const [generatedMealPlan, setGeneratedMealPlan] = useState<IndianMealPlanOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const mealPlan = generateIndianSchoolMealPlan(formData);
      setGeneratedMealPlan(mealPlan);
      setShowResults(true);
      onMealPlanGenerated?.(mealPlan);
    } catch (error) {
      console.error('Error generating meal plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getComplianceIcon = (isOk: boolean) => {
    return isOk ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getComplianceBadge = (isOk: boolean, label: string) => {
    return (
      <Badge variant={isOk ? "default" : "destructive"} className="flex items-center gap-1">
        {getComplianceIcon(isOk)}
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <span>Indian School Meal Plan Generator</span>
          </h2>
          <p className="text-muted-foreground">
            Culturally authentic, nutritionally compliant meal planning for Indian schools
          </p>
        </div>
      </div>

      {/* Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-primary" />
            <span>Generate Meal Plan</span>
          </CardTitle>
          <CardDescription>
            Configure parameters for your Indian school meal plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age Group</Label>
              <Select value={formData.ageGroup} onValueChange={(value) => setFormData({ ...formData, ageGroup: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary (6-10 years)</SelectItem>
                  <SelectItem value="upper_primary">Upper Primary (11-14 years)</SelectItem>
                  <SelectItem value="adolescent">Adolescent (15-17 years)</SelectItem>
                  <SelectItem value="adult">Adult (18+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietaryPreference">Dietary Preference</Label>
              <Select value={formData.dietaryPreference} onValueChange={(value) => setFormData({ ...formData, dietaryPreference: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="non_vegetarian">Non-Vegetarian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Mumbai, Delhi, Bangalore"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budgetConstraint">Budget Constraint</Label>
              <Select value={formData.budgetConstraint} onValueChange={(value) => setFormData({ ...formData, budgetConstraint: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (₹20-25/day)</SelectItem>
                  <SelectItem value="medium">Medium (₹25-35/day)</SelectItem>
                  <SelectItem value="high">High (₹35-45/day)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationDays">Duration (Days)</Label>
              <Select value={formData.durationDays.toString()} onValueChange={(value) => setFormData({ ...formData, durationDays: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days (1 Week)</SelectItem>
                  <SelectItem value="14">14 Days (2 Weeks)</SelectItem>
                  <SelectItem value="30">30 Days (1 Month)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Meal Plan...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Generate Indian School Meal Plan
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {generatedMealPlan && showResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>Generated Meal Plan</span>
            </CardTitle>
            <CardDescription>
              {generatedMealPlan.generation_metadata.age_group} students • {generatedMealPlan.generation_metadata.location} • {generatedMealPlan.generation_metadata.total_days} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="daily">Daily Plans</TabsTrigger>
                <TabsTrigger value="summary">Weekly Summary</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
              </TabsList>

              <TabsContent value="daily" className="space-y-4">
                {generatedMealPlan.meal_plan.map((day) => (
                  <Card key={day.day}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{day.day_name} (Day {day.day})</span>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {day.daily_totals.calories_kcal} kcal
                          </span>
                          <span className="flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            {day.daily_totals.protein_g}g protein
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            ₹{day.daily_totals.cost_rupees}
                          </span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {day.meals.map((meal, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold capitalize">{meal.meal_type}</h4>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{meal.total_calories} kcal</span>
                                <span>{meal.total_protein}g protein</span>
                                <span>₹{meal.total_cost}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {meal.items.map((item, itemIndex) => (
                                <div key={itemIndex} className="text-sm p-2 bg-muted rounded">
                                  <div className="font-medium">{item.name}</div>
                                  <div className="text-muted-foreground">
                                    {item.quantity_grams}g • {item.calories_kcal} kcal • {item.protein_g}g protein • ₹{item.cost_rupees}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {day.variety_notes.length > 0 && (
                          <div className="flex items-center space-x-2 text-amber-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">{day.variety_notes.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Daily Calories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{generatedMealPlan.weekly_summary.avg_daily_calories}</div>
                      <p className="text-xs text-muted-foreground">kcal per day</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Daily Protein</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{generatedMealPlan.weekly_summary.avg_daily_protein}g</div>
                      <p className="text-xs text-muted-foreground">grams per day</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Daily Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{generatedMealPlan.weekly_summary.avg_daily_cost}</div>
                      <p className="text-xs text-muted-foreground">rupees per day</p>
                    </CardContent>
                  </Card>
                </div>

                {generatedMealPlan.weekly_summary.variety_warnings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Variety Warnings</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {generatedMealPlan.weekly_summary.variety_warnings.map((warning, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-sm">{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="compliance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Calories Compliance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      {getComplianceBadge(
                        generatedMealPlan.weekly_summary.nutrition_compliance.calories_ok,
                        generatedMealPlan.weekly_summary.nutrition_compliance.calories_ok ? 'Compliant' : 'Non-Compliant'
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Protein Compliance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      {getComplianceBadge(
                        generatedMealPlan.weekly_summary.nutrition_compliance.protein_ok,
                        generatedMealPlan.weekly_summary.nutrition_compliance.protein_ok ? 'Compliant' : 'Non-Compliant'
                      )}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Variety Compliance</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                      {getComplianceBadge(
                        generatedMealPlan.weekly_summary.nutrition_compliance.variety_ok,
                        generatedMealPlan.weekly_summary.nutrition_compliance.variety_ok ? 'Compliant' : 'Non-Compliant'
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
