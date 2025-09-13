import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Sparkles, MessageCircle, RefreshCw, Lightbulb, BookOpen, Target, Droplets, Clock, Apple } from "lucide-react";
import { useStudentDetails } from "@/hooks/useStudentDetails";

const AISuggestions = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { studentDetails } = useStudentDetails();
  
  const nutritionEducation = [
    {
      category: "macronutrients",
      title: "Understanding Macronutrients",
      icon: "🥗",
      content: "Your body needs three main macronutrients: carbohydrates (4 cal/g) for energy, proteins (4 cal/g) for muscle building, and fats (9 cal/g) for hormone production. A balanced diet should include 45-65% carbs, 10-35% protein, and 20-35% fats."
    },
    {
      category: "hydration",
      title: "Hydration & Performance",
      icon: "💧",
      content: "Water makes up 60% of your body weight. Dehydration can reduce cognitive performance by 10-15%. Aim for 35ml per kg of body weight daily. Add electrolytes during intense study sessions or workouts."
    },
    {
      category: "meal_timing",
      title: "Meal Timing for Students",
      icon: "⏰",
      content: "Eat every 3-4 hours to maintain stable blood sugar and focus. Breakfast within 1 hour of waking, lunch 4-5 hours later, dinner 2-3 hours before bed. Snacks between meals help maintain energy levels."
    },
    {
      category: "brain_food",
      title: "Foods for Brain Health",
      icon: "🧠",
      content: "Omega-3 fatty acids (fish, walnuts), antioxidants (berries, dark chocolate), and B-vitamins (whole grains, eggs) support cognitive function. Blueberries can improve memory, while green tea enhances focus."
    },
    {
      category: "sleep_nutrition",
      title: "Nutrition & Sleep Quality",
      icon: "😴",
      content: "Avoid caffeine 6 hours before bed. Magnesium-rich foods (bananas, almonds) and tryptophan (turkey, milk) promote better sleep. Heavy meals 3 hours before bed can disrupt sleep quality."
    },
    {
      category: "stress_eating",
      title: "Managing Stress Eating",
      icon: "🧘",
      content: "Stress increases cortisol, leading to cravings for high-sugar foods. Practice mindful eating, keep healthy snacks available, and try stress-reduction techniques like deep breathing before reaching for comfort food."
    },
    {
      category: "vitamins",
      title: "Essential Vitamins for Students",
      icon: "💊",
      content: "Vitamin B12 (meat, dairy) supports nerve function, Vitamin D (sunlight, fish) aids calcium absorption, Vitamin C (citrus, berries) boosts immunity, and Iron (spinach, meat) prevents fatigue. A varied diet ensures you get all essential vitamins."
    },
    {
      category: "gut_health",
      title: "Gut Health & Mental Wellbeing",
      icon: "🦠",
      content: "Your gut produces 90% of serotonin (mood hormone). Probiotics (yogurt, kefir) and prebiotics (garlic, onions) support gut bacteria. A healthy gut improves mood, focus, and overall wellbeing."
    }
  ];

  const dailyFacts = [
    "🍎 An apple a day provides 4g of fiber and 14% of daily Vitamin C needs",
    "🥛 Milk contains 8g of complete protein and 30% of daily calcium needs",
    "🥜 Nuts are 80% healthy fats and can reduce heart disease risk by 30%",
    "🥬 Leafy greens like spinach have 2.7mg iron per 100g - more than red meat",
    "🐟 Fatty fish like salmon provide 1.8g omega-3 per 100g serving",
    "🥕 Carrots contain beta-carotene that converts to Vitamin A for eye health",
    "🍌 Bananas have 422mg potassium - more than most energy drinks",
    "🥚 Eggs contain all 9 essential amino acids and 6g of protein each",
    "🌰 Almonds provide 7.3mg Vitamin E per 100g - 49% of daily needs",
    "🍓 Strawberries have more Vitamin C than oranges per 100g serving"
  ];

  const nutritionTips = [
    "Start your day with protein-rich breakfast to maintain energy levels",
    "Drink water before meals to aid digestion and prevent overeating",
    "Include colorful vegetables in every meal for diverse nutrients",
    "Choose whole grains over refined grains for sustained energy",
    "Eat slowly and mindfully to improve digestion and satisfaction",
    "Plan your meals weekly to ensure balanced nutrition",
    "Keep healthy snacks visible and unhealthy ones out of sight",
    "Listen to your body's hunger and fullness cues"
  ];

  const calculateDailyCalories = (details: any) => {
    const bmr = 10 * details.weight + 6.25 * details.height_cm - 5 * 20 + 5;
    const maintenance = bmr * 1.55;
    
    switch (details.goal) {
      case 'weight_loss': return Math.round(maintenance - 500);
      case 'weight_gain': return Math.round(maintenance + 500);
      case 'balance_weight': return Math.round(maintenance);
      default: return Math.round(maintenance);
    }
  };

  const getGoalSpecificAdvice = (goal: string) => {
    switch (goal) {
      case 'weight_loss':
        return "Focus on a calorie deficit of 500 calories daily. Prioritize lean proteins, vegetables, and whole grains. Include strength training to preserve muscle mass.";
      case 'weight_gain':
        return "Aim for a calorie surplus of 500 calories daily. Include healthy fats, complex carbs, and protein-rich foods. Eat 5-6 smaller meals throughout the day.";
      case 'balance_weight':
        return "Maintain your current weight with balanced macronutrients. Focus on whole foods, regular meal timing, and consistent exercise routine.";
      default:
        return "Focus on balanced nutrition with regular meal timing and adequate hydration.";
    }
  };

  const getBodyTypeAdvice = (bodyType: string) => {
    switch (bodyType) {
      case 'skinny':
        return "Focus on calorie-dense, nutrient-rich foods. Include healthy fats like nuts, avocados, and olive oil. Eat 5-6 meals daily with protein at each meal.";
      case 'skinny_fat':
        return "Combine strength training with a balanced diet. Focus on lean proteins, complex carbs, and limit processed foods. Build muscle while reducing body fat.";
      case 'fat':
        return "Create a sustainable calorie deficit. Focus on whole foods, increase protein intake, and include both cardio and strength training. Avoid extreme diets.";
      default:
        return "Focus on balanced nutrition with regular exercise and adequate hydration.";
    }
  };

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

  const personalizedSuggestions = studentDetails ? [
    {
      type: "goal_focused",
      title: `Working Towards: ${studentDetails.goal.replace('_', ' ').toUpperCase()}`,
      message: getGoalSpecificAdvice(studentDetails.goal),
      priority: "high"
    },
    {
      type: "body_type",
      title: `Body Type: ${studentDetails.body_type.replace('_', ' ').toUpperCase()}`,
      message: getBodyTypeAdvice(studentDetails.body_type),
      priority: "medium"
    },
    {
      type: "calorie_target",
      title: "Daily Calorie Target",
      message: `Based on your weight (${studentDetails.weight}kg) and height (${studentDetails.height_cm}cm), your estimated daily calorie needs are ${calculateDailyCalories(studentDetails)} calories for your goal.`,
      priority: "high"
    }
  ] : [];

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

        {/* Personalized Suggestions */}
        {personalizedSuggestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
              <Target className="h-6 w-6 text-primary" />
              <span>Personalized for You</span>
            </h2>
            <div className="space-y-4">
              {personalizedSuggestions.map((suggestion, index) => (
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
                          <Badge variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}>
                            {suggestion.priority} priority
                          </Badge>
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
          </div>
        )}

        {/* Daily Nutrition Education */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span>Daily Nutrition Education</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {nutritionEducation.map((topic, index) => (
              <Card key={index} className="shadow-card border-0 hover:shadow-green transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{topic.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {topic.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {topic.content}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Daily Nutrition Facts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
            <Apple className="h-6 w-6 text-primary" />
            <span>Daily Nutrition Facts</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyFacts.map((fact, index) => (
              <Card key={index} className="shadow-card border-0 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardContent className="p-4">
                  <p className="text-foreground font-medium">{fact}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Nutrition Tips */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <span>Quick Nutrition Tips</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nutritionTips.map((tip, index) => (
              <Card key={index} className="shadow-card border-0">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-primary font-bold text-sm">{index + 1}</span>
                    </div>
                    <p className="text-muted-foreground">{tip}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* General Suggestions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center space-x-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <span>Today's Tips</span>
          </h2>
          <div className="space-y-6 animate-slide-up">
            {[
              {
                type: "hydration",
                title: "Stay Hydrated",
                message: "Based on your activity level, aim for 6-8 glasses of water today. Consider having a glass before each meal!",
                priority: "high"
              },
              {
                type: "variety",
                title: "Add Color to Your Plate",
                message: "Try adding colorful vegetables like bell peppers, carrots, or leafy greens to your next meal for better nutrition.",
                priority: "medium"
              },
              {
                type: "timing",
                title: "Meal Timing Tip",
                message: "Try having your evening meal 2-3 hours before bedtime for better digestion and sleep quality.",
                priority: "low"
              }
            ].map((suggestion, index) => (
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
        </div>

    

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