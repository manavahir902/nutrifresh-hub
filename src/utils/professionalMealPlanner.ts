// Professional Meal Planning System
// Based on nutrition science and Indian dietary patterns

export interface NutritionalProfile {
  age: number;
  gender: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  dietaryPreference: 'vegetarian' | 'non_vegetarian';
  healthGoals: 'weight_loss' | 'weight_gain' | 'maintenance' | 'muscle_gain';
  allergies: string[];
  dislikes: string[];
}

export interface MealItem {
  id: string;
  name: string;
  category: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g: number;
  cost_per_100g_rupees: number;
  is_veg: boolean;
  cooking_time: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  meal_types: string[]; // breakfast, lunch, dinner, snack
  cuisine_type: string; // north_indian, south_indian, gujarati, etc.
  seasonal: string[]; // summer, winter, monsoon, all_season
}

export interface MealPlan {
  day: number;
  day_name: string;
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snack: MealItem[];
  };
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_cost: number;
  nutrition_score: number; // 1-10
  variety_score: number; // 1-10
}

// Calculate BMR using Mifflin-St Jeor Equation
function calculateBMR(profile: NutritionalProfile): number {
  const { age, gender, weight, height } = profile;
  
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

// Calculate TDEE (Total Daily Energy Expenditure)
function calculateTDEE(profile: NutritionalProfile): number {
  const bmr = calculateBMR(profile);
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  return bmr * activityMultipliers[profile.activityLevel];
}

// Calculate target calories based on health goals
function calculateTargetCalories(profile: NutritionalProfile): number {
  const tdee = calculateTDEE(profile);
  
  switch (profile.healthGoals) {
    case 'weight_loss':
      return tdee - 500; // 500 calorie deficit
    case 'weight_gain':
      return tdee + 500; // 500 calorie surplus
    case 'muscle_gain':
      return tdee + 300; // 300 calorie surplus
    case 'maintenance':
    default:
      return tdee;
  }
}

// Calculate macronutrient targets
function calculateMacroTargets(profile: NutritionalProfile, targetCalories: number) {
  const proteinCalories = targetCalories * 0.25; // 25% protein
  const carbCalories = targetCalories * 0.55; // 55% carbs
  const fatCalories = targetCalories * 0.20; // 20% fat
  
  return {
    protein: Math.round(proteinCalories / 4), // 4 cal/g
    carbs: Math.round(carbCalories / 4), // 4 cal/g
    fat: Math.round(fatCalories / 9), // 9 cal/g
    calories: targetCalories
  };
}

// Indian meal patterns based on regional cuisine
const INDIAN_MEAL_PATTERNS = {
  north_indian: {
    breakfast: ['paratha', 'poha', 'upma', 'besan_chilla', 'aloo_tikki'],
    lunch: ['dal_rice', 'rajma_rice', 'chana_masala', 'palak_paneer', 'aloo_gobi'],
    dinner: ['roti_curry', 'biryani', 'pulao', 'tandoori', 'curry_rice'],
    snack: ['samosa', 'pakora', 'vada_pav', 'chaat', 'lassi']
  },
  south_indian: {
    breakfast: ['dosa', 'idli', 'upma', 'pongal', 'uttapam'],
    lunch: ['sambar_rice', 'rasam_rice', 'curry_rice', 'biryani', 'pulao'],
    dinner: ['roti_curry', 'rice_curry', 'biryani', 'pulao', 'curry_rice'],
    snack: ['vada', 'bonda', 'bajji', 'murukku', 'tea']
  },
  gujarati: {
    breakfast: ['thepla', 'dhokla', 'khandvi', 'handvo', 'poha'],
    lunch: ['dal_bhat', 'khichdi', 'curry_roti', 'pulao', 'biryani'],
    dinner: ['roti_curry', 'rice_curry', 'pulao', 'khichdi', 'curry_roti'],
    snack: ['fafda', 'gathiya', 'sev', 'namkeen', 'chaas']
  },
  bengali: {
    breakfast: ['luchi', 'puri', 'paratha', 'poha', 'upma'],
    lunch: ['rice_fish', 'rice_dal', 'biryani', 'pulao', 'curry_rice'],
    dinner: ['rice_curry', 'roti_curry', 'pulao', 'biryani', 'curry_rice'],
    snack: ['singara', 'pantua', 'rosogolla', 'misti', 'tea']
  }
};

// Meal timing and portion distribution
const MEAL_DISTRIBUTION = {
  breakfast: { calories: 0.25, protein: 0.20, carbs: 0.30, fat: 0.20 },
  lunch: { calories: 0.35, protein: 0.35, carbs: 0.40, fat: 0.30 },
  dinner: { calories: 0.30, protein: 0.35, carbs: 0.25, fat: 0.40 },
  snack: { calories: 0.10, protein: 0.10, carbs: 0.05, fat: 0.10 }
};

// Food compatibility matrix for better meal combinations
const FOOD_COMPATIBILITY = {
  'dal_rice': ['raita', 'pickle', 'papad', 'curry'],
  'chicken_curry': ['rice', 'roti', 'naan', 'raita'],
  'biryani': ['raita', 'salad', 'pickle'],
  'dosa': ['sambar', 'chutney', 'coconut_chutney'],
  'idli': ['sambar', 'chutney', 'coconut_chutney'],
  'paratha': ['curd', 'pickle', 'raita', 'chutney'],
  'samosa': ['chutney', 'tea', 'lassi'],
  'pakora': ['chutney', 'tea', 'lassi']
};

// Generate professional meal plan
export function generateProfessionalMealPlan(
  profile: NutritionalProfile,
  availableFoods: MealItem[],
  days: number = 7
): MealPlan[] {
  console.log('🍽️ Generating professional meal plan for:', profile);
  
  const targetCalories = calculateTargetCalories(profile);
  const macroTargets = calculateMacroTargets(profile, targetCalories);
  
  console.log('📊 Target calories:', targetCalories);
  console.log('🥗 Macro targets:', macroTargets);
  
  const mealPlans: MealPlan[] = [];
  
  for (let day = 1; day <= days; day++) {
    const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][day - 1];
    
    console.log(`\n📅 Generating ${dayName}...`);
    
    const mealPlan = generateDayMealPlan(profile, availableFoods, macroTargets, day);
    mealPlans.push({
      day,
      day_name: dayName,
      ...mealPlan
    });
  }
  
  return mealPlans;
}

// Generate meal plan for a single day
function generateDayMealPlan(
  profile: NutritionalProfile,
  availableFoods: MealItem[],
  macroTargets: any,
  day: number
): Omit<MealPlan, 'day' | 'day_name'> {
  
  // Filter foods based on dietary preference and allergies
  const suitableFoods = availableFoods.filter(food => {
    if (profile.dietaryPreference === 'vegetarian' && !food.is_veg) return false;
    if (profile.allergies.some(allergy => 
      food.name.toLowerCase().includes(allergy.toLowerCase())
    )) return false;
    if (profile.dislikes.some(dislike => 
      food.name.toLowerCase().includes(dislike.toLowerCase())
    )) return false;
    return true;
  });
  
  console.log(`🍎 Suitable foods: ${suitableFoods.length}`);
  
  // Categorize foods
  const breakfastFoods = suitableFoods.filter(f => f.meal_types.includes('breakfast'));
  const lunchFoods = suitableFoods.filter(f => f.meal_types.includes('lunch'));
  const dinnerFoods = suitableFoods.filter(f => f.meal_types.includes('dinner'));
  const snackFoods = suitableFoods.filter(f => f.meal_types.includes('snack'));
  
  // Generate meals with proper nutrition distribution
  const breakfast = generateMeal(
    breakfastFoods, 
    MEAL_DISTRIBUTION.breakfast, 
    macroTargets, 
    'breakfast',
    day
  );
  
  const lunch = generateMeal(
    lunchFoods, 
    MEAL_DISTRIBUTION.lunch, 
    macroTargets, 
    'lunch',
    day
  );
  
  const dinner = generateMeal(
    dinnerFoods, 
    MEAL_DISTRIBUTION.dinner, 
    macroTargets, 
    'dinner',
    day
  );
  
  const snack = generateMeal(
    snackFoods, 
    MEAL_DISTRIBUTION.snack, 
    macroTargets, 
    'snack',
    day
  );
  
  // Calculate totals
  const allMeals = [...breakfast, ...lunch, ...dinner, ...snack];
  const totalCalories = allMeals.reduce((sum, item) => sum + item.calories_per_100g, 0);
  const totalProtein = allMeals.reduce((sum, item) => sum + item.protein_per_100g, 0);
  const totalCarbs = allMeals.reduce((sum, item) => sum + item.carbs_per_100g, 0);
  const totalFat = allMeals.reduce((sum, item) => sum + item.fat_per_100g, 0);
  const totalCost = allMeals.reduce((sum, item) => sum + item.cost_per_100g_rupees, 0);
  
  // Calculate nutrition score (1-10)
  const nutritionScore = calculateNutritionScore(macroTargets, {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat
  });
  
  // Calculate variety score (1-10)
  const varietyScore = calculateVarietyScore(allMeals);
  
  return {
    meals: { breakfast, lunch, dinner, snack },
    total_calories: Math.round(totalCalories),
    total_protein: Math.round(totalProtein),
    total_carbs: Math.round(totalCarbs),
    total_fat: Math.round(totalFat),
    total_cost: Math.round(totalCost),
    nutrition_score: nutritionScore,
    variety_score: varietyScore
  };
}

// Generate a single meal with proper nutrition
function generateMeal(
  foods: MealItem[],
  distribution: any,
  macroTargets: any,
  mealType: string,
  day: number
): MealItem[] {
  
  if (foods.length === 0) return [];
  
  const targetCalories = macroTargets.calories * distribution.calories;
  const targetProtein = macroTargets.protein * distribution.protein;
  
  console.log(`  🍽️ ${mealType}: targeting ${Math.round(targetCalories)} cal, ${Math.round(targetProtein)}g protein`);
  
  // Sort foods by nutrition density and compatibility
  const sortedFoods = foods.sort((a, b) => {
    const aScore = (a.protein_per_100g * 4) + (a.fiber_per_100g * 2) - (a.cost_per_100g_rupees * 0.1);
    const bScore = (b.protein_per_100g * 4) + (b.fiber_per_100g * 2) - (b.cost_per_100g_rupees * 0.1);
    return bScore - aScore;
  });
  
  const selectedFoods: MealItem[] = [];
  let currentCalories = 0;
  let currentProtein = 0;
  
  // Select 1-3 foods for the meal
  const maxFoods = Math.min(3, Math.max(1, Math.floor(foods.length / 7) + 1));
  
  for (let i = 0; i < maxFoods && currentCalories < targetCalories * 1.2; i++) {
    const food = sortedFoods[i % sortedFoods.length];
    
    // Calculate portion size based on target calories
    const portionSize = Math.min(
      Math.max(50, (targetCalories - currentCalories) / food.calories_per_100g * 100),
      300
    );
    
    if (portionSize >= 50) {
      selectedFoods.push({
        ...food,
        portion_size: portionSize,
        calories_per_100g: (portionSize / 100) * food.calories_per_100g,
        protein_per_100g: (portionSize / 100) * food.protein_per_100g,
        carbs_per_100g: (portionSize / 100) * food.carbs_per_100g,
        fat_per_100g: (portionSize / 100) * food.fat_per_100g,
        cost_per_100g_rupees: (portionSize / 100) * food.cost_per_100g_rupees
      });
      
      currentCalories += selectedFoods[selectedFoods.length - 1].calories_per_100g;
      currentProtein += selectedFoods[selectedFoods.length - 1].protein_per_100g;
    }
  }
  
  console.log(`    ✅ Selected ${selectedFoods.length} items: ${selectedFoods.map(f => f.name).join(', ')}`);
  
  return selectedFoods;
}

// Calculate nutrition score based on how close we are to targets
function calculateNutritionScore(targets: any, actual: any): number {
  const calorieScore = Math.max(0, 10 - Math.abs(targets.calories - actual.calories) / targets.calories * 10);
  const proteinScore = Math.max(0, 10 - Math.abs(targets.protein - actual.protein) / targets.protein * 10);
  const carbScore = Math.max(0, 10 - Math.abs(targets.carbs - actual.carbs) / targets.carbs * 10);
  const fatScore = Math.max(0, 10 - Math.abs(targets.fat - actual.fat) / targets.fat * 10);
  
  return Math.round((calorieScore + proteinScore + carbScore + fatScore) / 4);
}

// Calculate variety score based on food diversity
function calculateVarietyScore(foods: MealItem[]): number {
  const categories = new Set(foods.map(f => f.category));
  const cuisines = new Set(foods.map(f => f.cuisine_type));
  const uniqueFoods = new Set(foods.map(f => f.id));
  
  const categoryScore = Math.min(10, categories.size * 2);
  const cuisineScore = Math.min(10, cuisines.size * 3);
  const foodScore = Math.min(10, uniqueFoods.size * 1.5);
  
  return Math.round((categoryScore + cuisineScore + foodScore) / 3);
}

// Get meal plan summary
export function getMealPlanSummary(mealPlans: MealPlan[]): any {
  const totalCalories = mealPlans.reduce((sum, plan) => sum + plan.total_calories, 0);
  const totalProtein = mealPlans.reduce((sum, plan) => sum + plan.total_protein, 0);
  const totalCarbs = mealPlans.reduce((sum, plan) => sum + plan.total_carbs, 0);
  const totalFat = mealPlans.reduce((sum, plan) => sum + plan.total_fat, 0);
  const totalCost = mealPlans.reduce((sum, plan) => sum + plan.total_cost, 0);
  const avgNutritionScore = mealPlans.reduce((sum, plan) => sum + plan.nutrition_score, 0) / mealPlans.length;
  const avgVarietyScore = mealPlans.reduce((sum, plan) => sum + plan.variety_score, 0) / mealPlans.length;
  
  return {
    total_calories: Math.round(totalCalories),
    total_protein: Math.round(totalProtein),
    total_carbs: Math.round(totalCarbs),
    total_fat: Math.round(totalFat),
    total_cost: Math.round(totalCost),
    avg_nutrition_score: Math.round(avgNutritionScore * 10) / 10,
    avg_variety_score: Math.round(avgVarietyScore * 10) / 10,
    daily_avg_calories: Math.round(totalCalories / mealPlans.length),
    daily_avg_cost: Math.round(totalCost / mealPlans.length)
  };
}
