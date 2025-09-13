import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Utensils, Clock, DollarSign, Flame } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MealAlternativeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalMeal: any;
  alternatives: any[];
  onSelectAlternative: (alternative: any) => void;
}

export function MealAlternativeModal({ 
  open, 
  onOpenChange, 
  originalMeal, 
  alternatives, 
  onSelectAlternative 
}: MealAlternativeModalProps) {
  const { toast } = useToast();
  const [selectedAlternative, setSelectedAlternative] = useState<any>(null);

  const handleSelectAlternative = () => {
    if (selectedAlternative) {
      onSelectAlternative(selectedAlternative);
      onOpenChange(false);
      setSelectedAlternative(null);
      toast({
        title: "Alternative Selected!",
        description: `${selectedAlternative.name} has been selected as an alternative to ${originalMeal.name}.`,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Utensils className="h-5 w-5 text-primary" />
            <span>Meal Not Available</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Meal */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Original Meal</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{originalMeal.name}</p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center space-x-1">
                    <Flame className="h-3 w-3" />
                    <span>{originalMeal.calories} cal</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <span>₹{originalMeal.cost}</span>
                  </span>
                </div>
              </div>
              <Badge variant="outline">Not Available</Badge>
            </div>
          </div>

          {/* Alternatives */}
          <div>
            <h3 className="font-semibold mb-4">Suggested Alternatives</h3>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {alternatives.length > 0 ? (
                alternatives.map((alternative, index) => (
                  <Card 
                    key={index} 
                    className={`cursor-pointer transition-all ${
                      selectedAlternative?.id === alternative.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedAlternative(alternative)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{alternative.name}</h4>
                            {alternative.type === 'student_meal' && (
                              <Badge variant="secondary" className="text-xs">
                                Your Meal
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <Flame className="h-3 w-3" />
                              <span>{alternative.calories || alternative.estimated_calories || 300} cal</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <DollarSign className="h-3 w-3" />
                              <span>₹{alternative.cost || alternative.estimated_cost || 20}</span>
                            </span>
                            {alternative.description && (
                              <span className="text-xs text-muted-foreground truncate max-w-48">
                                {alternative.description}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          <input
                            type="radio"
                            checked={selectedAlternative?.id === alternative.id}
                            onChange={() => setSelectedAlternative(alternative)}
                            className="h-4 w-4 text-primary"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No alternatives available</p>
                  <p className="text-sm">Try adding more meals to your collection</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSelectAlternative}
              disabled={!selectedAlternative}
            >
              Select Alternative
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
