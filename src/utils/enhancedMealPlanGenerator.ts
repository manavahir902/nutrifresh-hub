// Enhanced Indian Meal Plan Generator with Cultural Patterns
// Implements proper variety constraints, nutrition compliance, and cost optimization

export interface MealItem {
  name: string;
  quantity_grams: number;
  calories: number;
  protein: number;
  cost: number;
  category: string;
  is_leafy_vegetable?: boolean;
  is_pulse?: boolean;
  is_staple?: boolean;
}

export interface Meal {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: MealItem[];
  total_calories: number;
  total_protein: number;
  total_cost: number;
}

export interface DailyMealPlan {
  day: string;
  meals: {
    breakfast: MealItem[];
    lunch: MealItem[];
    dinner: MealItem[];
    snack: MealItem[];
  };
  totals: {
    calories: number;
    protein: number;
    cost: number;
  };
}

export interface WeeklySummary {
  avg_kcal_per_day: number;
  avg_protein_per_day: number;
  avg_cost_per_day: number;
  variety_warnings: string[];
}

export interface EnhancedMealPlanOutput {
  daily_plans: DailyMealPlan[];
  weekly_summary: WeeklySummary;
  generation_metadata: {
    generated_at: string;
    age_group: string;
    location: string;
    total_days: number;
  };
}

// Indian Food Database with realistic nutrition and pricing
const INDIAN_FOOD_DATABASE = {
  // Staple Grains
  rice: { calories: 130, protein: 2.7, cost_per_kg: 60, category: 'staple', is_staple: true, is_pulse: false, is_leafy_vegetable: false },
  atta: { calories: 341, protein: 11.8, cost_per_kg: 45, category: 'staple', is_staple: true, is_pulse: false, is_leafy_vegetable: false },
  ragi: { calories: 328, protein: 7.3, cost_per_kg: 80, category: 'staple', is_staple: true, is_pulse: false, is_leafy_vegetable: false },
  
  // Pulses
  toor_dal: { calories: 343, protein: 22.3, cost_per_kg: 120, category: 'pulse', is_pulse: true, is_staple: false, is_leafy_vegetable: false },
  moong_dal: { calories: 347, protein: 24.5, cost_per_kg: 130, category: 'pulse', is_pulse: true, is_staple: false, is_leafy_vegetable: false },
  chana_dal: { calories: 364, protein: 20.8, cost_per_kg: 110, category: 'pulse', is_pulse: true, is_staple: false, is_leafy_vegetable: false },
  rajma: { calories: 346, protein: 22.9, cost_per_kg: 140, category: 'pulse', is_pulse: true, is_staple: false, is_leafy_vegetable: false },
  chole: { calories: 364, protein: 20.8, cost_per_kg: 110, category: 'pulse', is_pulse: true, is_staple: false, is_leafy_vegetable: false },
  
  // Vegetables
  potato: { calories: 77, protein: 2.0, cost_per_kg: 25, category: 'vegetable', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  onion: { calories: 40, protein: 1.1, cost_per_kg: 30, category: 'vegetable', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  tomato: { calories: 18, protein: 0.9, cost_per_kg: 40, category: 'vegetable', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  carrot: { calories: 41, protein: 0.9, cost_per_kg: 35, category: 'vegetable', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  cabbage: { calories: 25, protein: 1.3, cost_per_kg: 20, category: 'vegetable', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  spinach: { calories: 23, protein: 2.9, cost_per_kg: 30, category: 'leafy_vegetable', is_leafy_vegetable: true, is_staple: false, is_pulse: false },
  methi: { calories: 23, protein: 2.9, cost_per_kg: 40, category: 'leafy_vegetable', is_leafy_vegetable: true, is_staple: false, is_pulse: false },
  mustard_greens: { calories: 23, protein: 2.9, cost_per_kg: 35, category: 'leafy_vegetable', is_leafy_vegetable: true, is_staple: false, is_pulse: false },
  bottle_gourd: { calories: 12, protein: 0.6, cost_per_kg: 20, category: 'vegetable', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  cauliflower: { calories: 25, protein: 1.9, cost_per_kg: 30, category: 'vegetable', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  
  // Fruits
  banana: { calories: 89, protein: 1.1, cost_per_kg: 60, category: 'fruit', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  apple: { calories: 52, protein: 0.3, cost_per_kg: 120, category: 'fruit', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  guava: { calories: 68, protein: 2.6, cost_per_kg: 80, category: 'fruit', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  papaya: { calories: 43, protein: 0.5, cost_per_kg: 40, category: 'fruit', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  
  // Dairy
  milk: { calories: 61, protein: 3.2, cost_per_litre: 50, category: 'dairy', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  curd: { calories: 60, protein: 3.1, cost_per_litre: 45, category: 'dairy', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  buttermilk: { calories: 30, protein: 1.5, cost_per_litre: 25, category: 'dairy', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  
  // Nuts & Seeds
  peanuts: { calories: 567, protein: 25.8, cost_per_kg: 120, category: 'nuts', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  roasted_chana: { calories: 364, protein: 20.8, cost_per_kg: 100, category: 'nuts', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  sprouts: { calories: 200, protein: 15.0, cost_per_kg: 80, category: 'nuts', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  
  // Oils
  cooking_oil: { calories: 884, protein: 0, cost_per_litre: 120, category: 'oil', is_staple: false, is_pulse: false, is_leafy_vegetable: false },
  
  // Spices
  spices: { calories: 0, protein: 0, cost_per_meal: 2, category: 'spices', is_staple: false, is_pulse: false, is_leafy_vegetable: false }
};

// Cultural Meal Patterns
const CULTURAL_MEAL_PATTERNS = {
  breakfast: [
    { name: "Idli with Sambar", items: ["rice", "toor_dal", "onion", "tomato"], base_calories: 200 },
    { name: "Masala Dosa", items: ["rice", "potato", "onion", "tomato"], base_calories: 250 },
    { name: "Poha", items: ["rice", "onion", "tomato", "peanuts"], base_calories: 180 },
    { name: "Upma", items: ["rice", "onion", "tomato", "carrot"], base_calories: 200 },
    { name: "Aloo Paratha with Curd", items: ["atta", "potato", "onion", "curd"], base_calories: 300 },
    { name: "Oats with Milk", items: ["milk", "banana"], base_calories: 220 },
    { name: "Ragi Dosa", items: ["ragi", "onion", "tomato"], base_calories: 180 }
  ],
  lunch: [
    { name: "Rice with Dal and Vegetables", items: ["rice", "toor_dal", "spinach", "onion", "tomato", "curd"], base_calories: 400 },
    { name: "Roti with Rajma and Salad", items: ["atta", "rajma", "methi", "onion", "tomato", "curd"], base_calories: 450 },
    { name: "Rice with Chole and Vegetables", items: ["rice", "chole", "mustard_greens", "onion", "tomato", "curd"], base_calories: 420 },
    { name: "Roti with Dal and Salad", items: ["atta", "moong_dal", "spinach", "onion", "tomato", "curd"], base_calories: 380 },
    { name: "Rice with Chana Dal and Vegetables", items: ["rice", "chana_dal", "methi", "onion", "tomato", "curd"], base_calories: 400 }
  ],
  dinner: [
    { name: "Curd Rice", items: ["rice", "curd", "onion"], base_calories: 250 },
    { name: "Khichdi", items: ["rice", "moong_dal", "onion"], base_calories: 300 },
    { name: "Dal with Roti", items: ["atta", "toor_dal", "onion", "tomato"], base_calories: 320 },
    { name: "Vegetable Upma", items: ["rice", "onion", "tomato", "carrot"], base_calories: 280 },
    { name: "Light Dal Rice", items: ["rice", "chana_dal", "onion"], base_calories: 300 }
  ],
  snack: [
    { name: "Banana", items: ["banana"], base_calories: 89 },
    { name: "Apple", items: ["apple"], base_calories: 52 },
    { name: "Guava", items: ["guava"], base_calories: 68 },
    { name: "Papaya", items: ["papaya"], base_calories: 43 },
    { name: "Buttermilk", items: ["buttermilk"], base_calories: 60 },
    { name: "Roasted Chana", items: ["roasted_chana"], base_calories: 100 },
    { name: "Peanuts", items: ["peanuts"], base_calories: 120 },
    { name: "Sprouts", items: ["sprouts"], base_calories: 80 }
  ]
};

// Nutrition targets by age group
const NUTRITION_TARGETS = {
  children: { calories: 1650, protein: 16, min_protein: 12, max_protein: 20 },
  teens: { calories: 2000, protein: 30, min_protein: 20, max_protein: 40 },
  adults: { calories: 2200, protein: 35, min_protein: 20, max_protein: 40 }
};

// Variety tracking system
class VarietyTracker {
  private usedPulses: string[] = [];
  private usedFruits: string[] = [];
  private riceCount: number = 0;
  private leafyVegetableCount: number = 0;
  private weeklyFoodCount: { [key: string]: number } = {};

  canUsePulse(pulse: string): boolean {
    return !this.usedPulses.slice(-1).includes(pulse);
  }

  canUseRice(): boolean {
    return this.riceCount < 4;
  }

  canUseFruit(fruit: string): boolean {
    return !this.usedFruits.includes(fruit);
  }

  addPulse(pulse: string): void {
    this.usedPulses.push(pulse);
  }

  addFruit(fruit: string): void {
    this.usedFruits.push(fruit);
  }

  addRice(): void {
    this.riceCount++;
  }

  addLeafyVegetable(): void {
    this.leafyVegetableCount++;
  }

  addFood(foodName: string): void {
    this.weeklyFoodCount[foodName] = (this.weeklyFoodCount[foodName] || 0) + 1;
  }

  getVarietyWarnings(): string[] {
    const warnings: string[] = [];
    
    if (this.riceCount > 4) {
      warnings.push(`Rice used ${this.riceCount} times this week (max 4)`);
    }
    
    if (this.leafyVegetableCount < 3) {
      warnings.push(`Only ${this.leafyVegetableCount} leafy vegetables this week (min 3)`);
    }
    
    Object.entries(this.weeklyFoodCount).forEach(([food, count]) => {
      if (count > 5) {
        warnings.push(`${food} used ${count} times this week (max 5)`);
      }
    });
    
    return warnings;
  }

  resetDaily(): void {
    this.usedPulses = [];
    this.usedFruits = [];
  }
}

// Calculate nutrition for a meal item
function calculateItemNutrition(itemName: string, quantity: number): { calories: number; protein: number; cost: number } {
  const food = INDIAN_FOOD_DATABASE[itemName as keyof typeof INDIAN_FOOD_DATABASE];
  if (!food) return { calories: 0, protein: 0, cost: 0 };
  
  const factor = quantity / 100;
  const calories = Math.round(food.calories * factor);
  const protein = Math.round(food.protein * factor * 10) / 10;
  
  // Handle different cost units
  let cost = 0;
  if ('cost_per_kg' in food) {
    cost = Math.round(food.cost_per_kg * quantity / 1000 * 100) / 100;
  } else if ('cost_per_litre' in food) {
    cost = Math.round(food.cost_per_litre * quantity / 1000 * 100) / 100;
  } else if ('cost_per_meal' in food) {
    cost = food.cost_per_meal;
  }
  
  return { calories, protein, cost };
}

// Enhanced scoring algorithm: nutrition (50%), cost (30%), variety (20%)
function calculateMealScore(
  meal: any,
  targetCalories: number,
  targetProtein: number,
  tracker: VarietyTracker,
  mealType: string
): number {
  // Calculate estimated nutrition
  const estimatedCalories = meal.items.reduce((sum: number, item: string) => {
    const nutrition = INDIAN_FOOD_DATABASE[item as keyof typeof INDIAN_FOOD_DATABASE];
    return sum + (nutrition ? nutrition.calories * 100 / 100 : 0); // Base 100g
  }, 0);
  
  const estimatedProtein = meal.items.reduce((sum: number, item: string) => {
    const nutrition = INDIAN_FOOD_DATABASE[item as keyof typeof INDIAN_FOOD_DATABASE];
    return sum + (nutrition ? nutrition.protein * 100 / 100 : 0); // Base 100g
  }, 0);
  
  const estimatedCost = meal.items.reduce((sum: number, item: string) => {
    const nutrition = INDIAN_FOOD_DATABASE[item as keyof typeof INDIAN_FOOD_DATABASE];
    if (!nutrition) return sum;
    
    let cost = 0;
    if ('cost_per_kg' in nutrition) {
      cost = nutrition.cost_per_kg * 100 / 1000; // Base 100g
    } else if ('cost_per_litre' in nutrition) {
      cost = nutrition.cost_per_litre * 100 / 1000; // Base 100ml
    } else if ('cost_per_meal' in nutrition) {
      cost = nutrition.cost_per_meal;
    }
    
    return sum + cost;
  }, 0);
  
  // 1. NUTRITION SCORE (50% weight)
  const calorieDiff = Math.abs(estimatedCalories - targetCalories) / targetCalories;
  const proteinDiff = Math.abs(estimatedProtein - targetProtein) / targetProtein;
  const nutritionScore = (calorieDiff + proteinDiff) * 0.5;
  
  // 2. COST SCORE (30% weight) - lower is better
  const costScore = (estimatedCost / 50) * 0.3; // Normalize to 50 rupees
  
  // 3. VARIETY SCORE (20% weight)
  let varietyScore = 0;
  
  // Check pulse variety
  const hasPulse = meal.items.some((item: string) => 
    ['toor_dal', 'moong_dal', 'chana_dal', 'rajma', 'chole'].includes(item)
  );
  if (hasPulse) {
    const pulseItem = meal.items.find((item: string) => 
      ['toor_dal', 'moong_dal', 'chana_dal', 'rajma', 'chole'].includes(item)
    );
    if (pulseItem && !tracker.canUsePulse(pulseItem)) {
      varietyScore += 100; // Heavy penalty for repeat pulses
    }
  }
  
  // Check rice variety
  if (meal.items.includes('rice') && !tracker.canUseRice()) {
    varietyScore += 100; // Heavy penalty for too much rice
  }
  
  // Check fruit variety for snacks
  if (mealType === 'snack') {
    const fruitItem = meal.items.find((item: string) => 
      ['banana', 'apple', 'guava', 'papaya'].includes(item)
    );
    if (fruitItem && !tracker.canUseFruit(fruitItem)) {
      varietyScore += 50; // Penalty for repeat fruits
    }
  }
  
  // Bonus for variety
  if (meal.variety) {
    varietyScore -= 20; // Bonus for variety
  }
  
  const finalScore = (nutritionScore * 0.5) + (costScore * 0.3) + (varietyScore * 0.2);
  return finalScore;
}

// Generate a single meal with variety constraints
function generateMeal(
  mealType: keyof typeof CULTURAL_MEAL_PATTERNS,
  targetCalories: number,
  targetProtein: number,
  tracker: VarietyTracker,
  day: number
): Meal {
  const patterns = CULTURAL_MEAL_PATTERNS[mealType];
  let selectedPattern = patterns[day % patterns.length];
  
  // Apply variety constraints
  if (mealType === 'lunch' || mealType === 'dinner') {
    // Check pulse variety
    const pulseItems = selectedPattern.items.filter(item => 
      ['toor_dal', 'moong_dal', 'chana_dal', 'rajma', 'chole'].includes(item)
    );
    if (pulseItems.length > 0 && !tracker.canUsePulse(pulseItems[0])) {
      selectedPattern = patterns.find(p => 
        !p.items.some(item => pulseItems.includes(item))
      ) || selectedPattern;
    }
    
    // Check rice variety
    if (selectedPattern.items.includes('rice') && !tracker.canUseRice()) {
      selectedPattern = patterns.find(p => !p.items.includes('rice')) || selectedPattern;
    }
  }
  
  if (mealType === 'snack') {
    // Check fruit variety
    const fruitItems = selectedPattern.items.filter(item => 
      ['banana', 'apple', 'guava', 'papaya'].includes(item)
    );
    if (fruitItems.length > 0 && !tracker.canUseFruit(fruitItems[0])) {
      selectedPattern = patterns.find(p => 
        !p.items.some(item => fruitItems.includes(item))
      ) || selectedPattern;
    }
  }
  
  const items: MealItem[] = [];
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCost = 0;
  
  // Calculate quantities to meet target calories
  const baseCalories = selectedPattern.base_calories;
  const scaleFactor = targetCalories / baseCalories;
  
  selectedPattern.items.forEach(itemName => {
    const baseQuantity = 100; // Base 100g
    const quantity = Math.round(baseQuantity * scaleFactor);
    const nutrition = calculateItemNutrition(itemName, quantity);
    
    const food = INDIAN_FOOD_DATABASE[itemName as keyof typeof INDIAN_FOOD_DATABASE];
    
    items.push({
      name: itemName,
      quantity_grams: quantity,
      calories: nutrition.calories,
      protein: nutrition.protein,
      cost: nutrition.cost,
      category: food?.category || 'other',
      is_leafy_vegetable: food?.is_leafy_vegetable || false,
      is_pulse: food?.is_pulse || false,
      is_staple: food?.is_staple || false
    });
    
    totalCalories += nutrition.calories;
    totalProtein += nutrition.protein;
    totalCost += nutrition.cost;
    
    // Update tracker
    if (food?.is_pulse) tracker.addPulse(itemName);
    if (food?.is_staple && itemName === 'rice') tracker.addRice();
    if (['banana', 'apple', 'guava', 'papaya'].includes(itemName)) {
      tracker.addFruit(itemName);
    }
    if (food?.is_leafy_vegetable) tracker.addLeafyVegetable();
    
    tracker.addFood(selectedPattern.name);
  });
  
  // Add spices cost
  totalCost += 2; // Spices allowance
    
    return {
    meal_type: mealType,
    items,
    total_calories: Math.round(totalCalories),
    total_protein: Math.round(totalProtein * 10) / 10,
    total_cost: Math.round(totalCost * 100) / 100
  };
}

// Main meal plan generation function
export function generateEnhancedMealPlan(
  ageGroup: 'children' | 'teens' | 'adults' = 'children',
  location: string = 'Mumbai',
  durationDays: number = 7
): EnhancedMealPlanOutput {
  const tracker = new VarietyTracker();
  const targets = NUTRITION_TARGETS[ageGroup];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Meal distribution
  const mealDistribution = {
    breakfast: 0.25,
    lunch: 0.40,
    dinner: 0.25,
    snack: 0.10
  };
  
  const dailyPlans: DailyMealPlan[] = [];
  
  for (let day = 1; day <= durationDays; day++) {
    tracker.resetDaily();
    const dayName = dayNames[(day - 1) % 7];
    
    // Generate each meal
    const breakfast = generateMeal('breakfast', Math.round(targets.calories * mealDistribution.breakfast), Math.round(targets.protein * mealDistribution.breakfast), tracker, day);
    const lunch = generateMeal('lunch', Math.round(targets.calories * mealDistribution.lunch), Math.round(targets.protein * mealDistribution.lunch), tracker, day);
    const dinner = generateMeal('dinner', Math.round(targets.calories * mealDistribution.dinner), Math.round(targets.protein * mealDistribution.dinner), tracker, day);
    const snack = generateMeal('snack', Math.round(targets.calories * mealDistribution.snack), Math.round(targets.protein * mealDistribution.snack), tracker, day);
    
    // Calculate daily totals
    const dailyTotals = {
      calories: breakfast.total_calories + lunch.total_calories + dinner.total_calories + snack.total_calories,
      protein: Math.round((breakfast.total_protein + lunch.total_protein + dinner.total_protein + snack.total_protein) * 10) / 10,
      cost: Math.round((breakfast.total_cost + lunch.total_cost + dinner.total_cost + snack.total_cost) * 100) / 100
    };
    
    dailyPlans.push({
      day: dayName,
      meals: {
        breakfast: breakfast.items,
        lunch: lunch.items,
        dinner: dinner.items,
        snack: snack.items
      },
      totals: dailyTotals
    });
  }
  
  // Calculate weekly summary
  const totalCalories = dailyPlans.reduce((sum, day) => sum + day.totals.calories, 0);
  const totalProtein = dailyPlans.reduce((sum, day) => sum + day.totals.protein, 0);
  const totalCost = dailyPlans.reduce((sum, day) => sum + day.totals.cost, 0);
  
  const weeklySummary: WeeklySummary = {
    avg_kcal_per_day: Math.round(totalCalories / durationDays),
    avg_protein_per_day: Math.round(totalProtein / durationDays * 10) / 10,
    avg_cost_per_day: Math.round(totalCost / durationDays * 100) / 100,
    variety_warnings: tracker.getVarietyWarnings()
  };
  
  return {
    daily_plans: dailyPlans,
    weekly_summary: weeklySummary,
    generation_metadata: {
      generated_at: new Date().toISOString(),
      age_group: ageGroup,
      location: location,
      total_days: durationDays
    }
  };
}

// Export for backward compatibility
export { generateEnhancedMealPlan as generateMealPlan };
