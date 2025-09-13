import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Apple, Droplets, Zap, Clock, Users, BookOpen, Star } from "lucide-react";

const HealthyTips = () => {
  const tips = [
    {
      icon: Apple,
      category: "Nutrition",
      title: "Eat the Rainbow",
      description: "Include fruits and vegetables of different colors in your meals. Each color provides unique vitamins and antioxidants that your body needs.",
      actionTip: "Try to have at least 3 different colored foods on your plate each meal!"
    },
    {
      icon: Droplets,
      category: "Hydration",
      title: "Water First",
      description: "Start your day with a glass of water and aim for 8 glasses throughout the day. Your brain and body function better when properly hydrated.",
      actionTip: "Keep a water bottle at your desk and take sips between classes."
    },
    {
      icon: Clock,
      category: "Timing",
      title: "Regular Meal Times",
      description: "Eating at consistent times helps regulate your metabolism and prevents energy crashes during study sessions.",
      actionTip: "Set meal reminders on your phone to maintain consistent eating patterns."
    },
    {
      icon: Zap,
      category: "Energy",
      title: "Smart Snacking",
      description: "Choose snacks that combine protein and fiber to keep you energized. Think apple slices with peanut butter or yogurt with berries.",
      actionTip: "Prep healthy snacks at the beginning of the week to avoid vending machine temptations."
    },
    {
      icon: Users,
      category: "Social",
      title: "Eat Together",
      description: "Sharing meals with friends and family can improve digestion, reduce stress, and make healthy eating more enjoyable.",
      actionTip: "Organize healthy potluck lunches with your classmates once a week."
    },
    {
      icon: BookOpen,
      category: "Learning",
      title: "Read Food Labels",
      description: "Understanding nutrition labels helps you make informed choices. Look for foods with fewer ingredients and less added sugar.",
      actionTip: "Challenge yourself to compare labels when choosing between similar products."
    }
  ];

  const quickFacts = [
    {
      icon: "🧠",
      fact: "Brain Power",
      description: "Your brain uses about 20% of your daily calories - fuel it well!"
    },
    {
      icon: "💪",
      fact: "Protein Power",
      description: "Include protein in every meal to maintain steady energy levels."
    },
    {
      icon: "🌱",
      fact: "Fiber Facts",
      description: "Aim for 25-30g of fiber daily for better digestion and health."
    },
    {
      icon: "🌙",
      fact: "Sleep & Food",
      description: "Good nutrition improves sleep quality, and good sleep helps with healthy eating choices."
    }
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-green">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Healthy Living Tips</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Evidence-based nutrition and wellness tips to help you build lasting healthy habits
          </p>
        </div>

        {/* Quick Facts Banner */}
        <div className="bg-gradient-secondary rounded-2xl p-6 mb-12 animate-slide-up">
          <h2 className="text-xl font-semibold text-center mb-6 text-foreground">
            💡 Quick Health Facts
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickFacts.map((fact, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl mb-2">{fact.icon}</div>
                <h3 className="font-medium text-foreground mb-1">{fact.fact}</h3>
                <p className="text-xs text-muted-foreground">{fact.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {tips.map((tip, index) => (
            <Card 
              key={index} 
              className="shadow-card border-0 hover:shadow-green transition-all duration-300 hover:scale-105 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center shadow-green">
                    <tip.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-primary uppercase tracking-wide">
                      {tip.category}
                    </span>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {tip.description}
                </p>
                <div className="bg-accent-light rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-foreground">
                      {tip.actionTip}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Challenge */}
        <Card className="shadow-card border-0 bg-gradient-primary text-primary-foreground mb-8">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <Zap className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4">This Week's Challenge</h2>
            <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
              Try the "5-a-Day Color Challenge" - eat 5 different colored fruits or vegetables each day this week!
            </p>
            <Button 
              variant="secondary" 
              size="lg"
              className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
            >
              Accept Challenge
            </Button>
          </CardContent>
        </Card>

        {/* Resources */}
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>Additional Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">📚 Recommended Reading</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• "How to Build Healthy Habits" - Student Guide</li>
                  <li>• "Quick & Nutritious Meals for Busy Students"</li>
                  <li>• "Understanding Food Labels: A Teen's Guide"</li>
                  <li>• "Mindful Eating for Better Focus"</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">🎥 Video Resources</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• "5-Minute Healthy Breakfast Ideas"</li>
                  <li>• "Dorm Room Cooking Essentials"</li>
                  <li>• "Budget-Friendly Nutrition Tips"</li>
                  <li>• "Meal Prep for Students"</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Have questions about nutrition or healthy eating? 
                </p>
                <Button variant="outline">
                  Contact Our Nutrition Team
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthyTips;