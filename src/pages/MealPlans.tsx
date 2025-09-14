import { WeeklyMealPlanView } from "@/components/meals/WeeklyMealPlanView";

const MealPlans = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Meal Plans & Nutrition</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Your personalized weekly meal plans and nutrition tracking
        </p>
      </div>

      {/* Weekly Meal Plan View */}
      <WeeklyMealPlanView />
    </div>
  );
};

export default MealPlans;