import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, MessageCircle, RefreshCw, Lightbulb } from "lucide-react";

const AISuggestions = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const suggestions = [
    {
      type: "nutrition",
      title: "Balance Your Lunch",
      message: "You had pizza today - great! Try adding a side salad or some fresh fruit to boost your vegetable intake and add more vitamins to your meal.",
      priority: "medium"
    },
    {
      type: "hydration",
      title: "Stay Hydrated",
      message: "Based on your activity level, aim for 6-8 glasses of water today. Consider having a glass before each meal!",
      priority: "high"
    },
    {
      type: "timing",
      title: "Meal Timing Tip",
      message: "You've been eating dinner quite late this week. Try having your evening meal 2-3 hours before bedtime for better digestion.",
      priority: "low"
    },
    {
      type: "variety",
      title: "Add Color to Your Plate",
      message: "This week you've had lots of beige foods! Try adding colorful vegetables like bell peppers, carrots, or leafy greens to your next meal.",
      priority: "medium"
    }
  ];

  const handleGenerateNew = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "border-l-destructive bg-destructive/5";
      case "medium": return "border-l-warning bg-warning/5";
      case "low": return "border-l-success bg-success/5";
      default: return "border-l-primary bg-primary/5";
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case "nutrition": return "🥗";
      case "hydration": return "💧";
      case "timing": return "⏰";
      case "variety": return "🌈";
      default: return "💡";
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-green">
            <Brain className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">AI Nutrition Suggestions</h1>
          <p className="text-muted-foreground">
            Personalized recommendations based on your eating patterns
          </p>
        </div>

        {/* Generate New Suggestions */}
        <div className="text-center mb-8">
          <Button 
            onClick={handleGenerateNew}
            disabled={isGenerating}
            className="bg-gradient-primary hover:bg-primary-hover shadow-green"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get New Suggestions
              </>
            )}
          </Button>
        </div>

        {/* Suggestions Grid */}
        <div className="space-y-6 animate-slide-up">
          {suggestions.map((suggestion, index) => (
            <Card 
              key={index} 
              className={`shadow-card border-0 border-l-4 transition-all duration-300 hover:shadow-green ${getPriorityColor(suggestion.priority)}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">{getPriorityIcon(suggestion.type)}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center space-x-2">
                      <span>{suggestion.title}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        suggestion.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                        suggestion.priority === 'medium' ? 'bg-warning/20 text-warning' :
                        'bg-success/20 text-success'
                      }`}>
                        {suggestion.priority} priority
                      </span>
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {suggestion.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Chatbot Preview */}
        <Card className="mt-12 shadow-card border-0 bg-gradient-secondary">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              <span>AI Nutrition Assistant</span>
              <span className="px-2 py-1 text-xs bg-accent text-accent-foreground rounded-full">
                Coming Soon
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gradient-primary rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-green">
                <MessageCircle className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Interactive Nutrition Chat</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Soon you'll be able to chat directly with our AI nutrition assistant for instant, 
                personalized advice and answers to your nutrition questions!
              </p>
              <div className="bg-card rounded-xl p-4 max-w-md mx-auto">
                <div className="flex items-center space-x-3 text-left">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Brain className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      "Ask me anything about nutrition, meal planning, or healthy eating habits!"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips for Better Suggestions */}
        <Card className="mt-8 shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              <span>Get Better Suggestions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">📝 Log meals regularly</h4>
                <p className="text-sm text-muted-foreground">
                  The more meals you log, the better our AI understands your eating patterns
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">🎯 Be specific</h4>
                <p className="text-sm text-muted-foreground">
                  Include details about portion sizes and preparation methods
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">⏱️ Log consistently</h4>
                <p className="text-sm text-muted-foreground">
                  Daily logging helps identify patterns and timing opportunities
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-foreground">📊 Review analytics</h4>
                <p className="text-sm text-muted-foreground">
                  Check your nutrition dashboard to understand the suggestions better
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AISuggestions;