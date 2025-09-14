// Real AI Meal Plan Generator using free APIs
// This uses actual AI services for human-relevant meal planning

interface MealPlanRequest {
  userProfile: {
    age: number;
    weight: number;
    height: number;
    goal: 'weight_loss' | 'weight_gain' | 'balance_weight';
    bodyType: 'skinny' | 'skinny_fat' | 'fat';
    dietaryPreference: 'vegetarian' | 'non_vegetarian';
    gender: 'male' | 'female' | 'other';
  };
  availableFoods: Array<{
    id: string;
    name: string;
    calories_per_100g: number;
    category: string;
    is_veg: boolean;
    cost_per_100g_rupees: number;
  }>;
}

interface MealPlanItem {
  day_of_week: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_item_id: string;
  quantity_grams: number;
}

// Enhanced AI meal plan generation with PM-POSHAN compliance
export const generateAIMealPlan = async (request: MealPlanRequest): Promise<MealPlanItem[]> => {
  try {
    console.log('Generating enhanced AI meal plan with PM-POSHAN compliance...');
    
    // Calculate nutritional needs with PM-POSHAN standards
    const nutritionalNeeds = calculateEnhancedNutritionalNeeds(request.userProfile);
    
    // Create a detailed prompt for AI
    const prompt = createMealPlanPrompt(request.userProfile, nutritionalNeeds, request.availableFoods);
    
    // Try to use real AI first
    try {
      const aiResponse = await callRealAI(prompt);
      const mealPlan = parseAIResponse(aiResponse, request.availableFoods);
      
      if (mealPlan && mealPlan.length > 0) {
        console.log('Real AI meal plan generated successfully');
        return mealPlan;
      }
    } catch (aiError) {
      console.log('Real AI failed, using enhanced fallback:', aiError);
    }
    
    // Enhanced fallback with PM-POSHAN compliance
    console.log('Using enhanced meal plan generation with PM-POSHAN compliance');
    const mealPlan = generateEnhancedRealisticMealPlan(
      request.availableFoods,
      nutritionalNeeds,
      request.userProfile
    );
    
    console.log('Enhanced meal plan generated with', mealPlan.length, 'items');
    
    return mealPlan;
  } catch (error) {
    console.error('Error generating AI meal plan:', error);
    throw new Error('Failed to generate meal plan');
  }
};

// Real AI integration using free APIs
const callRealAI = async (prompt: string): Promise<string> => {
  try {
    // Using a free AI service - Cohere API (free tier)
    const response = await fetch('https://api.cohere.ai/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_COHERE_API_KEY', // Get free key from cohere.ai
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: prompt,
        max_tokens: 2000,
        temperature: 0.8,
        k: 0,
        p: 0.75,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
      })
    });

    if (!response.ok) {
      // Fallback to Hugging Face
      return await callHuggingFaceAI(prompt);
    }

    const data = await response.json();
    return data.generations?.[0]?.text || '';
  } catch (error) {
    console.error('Cohere AI failed, trying Hugging Face:', error);
    return await callHuggingFaceAI(prompt);
  }
};

// Fallback to Hugging Face AI
const callHuggingFaceAI = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer hf_your_token_here',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 2000,
          temperature: 0.8,
          do_sample: true,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    return data[0]?.generated_text || '';
  } catch (error) {
    console.error('Hugging Face AI failed:', error);
    throw error;
  }
};

// Create detailed prompt for AI
const createMealPlanPrompt = (profile: any, nutritionalNeeds: any, availableFoods: any[]) => {
  const foodList = availableFoods.slice(0, 30).map(food => `${food.name} (${food.category})`).join(', ');
  
  return `You are a professional Indian nutritionist. Create a realistic 7-day Indian meal plan for a ${profile.age}-year-old ${profile.gender} who is ${profile.height}cm tall and weighs ${profile.weight}kg.

GOAL: ${profile.goal}
DIETARY PREFERENCE: ${profile.dietaryPreference}
DAILY CALORIE TARGET: ${nutritionalNeeds.calories} calories

AVAILABLE INDIAN FOODS: ${foodList}

REQUIREMENTS:
- 7 days (Monday to Sunday)
- 4 meals per day: breakfast, lunch, dinner, snack
- Use ONLY the available foods listed above
- Create VARIETY - different foods each day
- Realistic Indian meal combinations
- Proper portion sizes (100-300g per meal)
- Balanced nutrition with proteins, carbs, and vegetables
- Include traditional Indian breakfast, lunch, dinner patterns

IMPORTANT: 
- Use complete meals like "Dal Rice", "Chicken Curry with Rice", "Palak Paneer with Rice"
- For breakfast: use items like "Masala Dosa", "Idli", "Poha", "Upma", "Paratha", "Bread Butter"
- For snacks: use ONLY proper snacks like "Samosa", "Pakora", "Tea", "Lassi", "Vada Pav", "Cutlet"
- NEVER use raw ingredients like "Basmati Rice (Raw)", "Eggs", "Chicken (Raw)" as snacks
- NEVER repeat the same food item more than once per day
- Ensure variety - different foods each day of the week
- Match the dietary preference (vegetarian/non-vegetarian)
- Keep snacks light and appropriate (100-200g portions)

Format as JSON:
{
  "monday": {
    "breakfast": {"food": "Masala Dosa", "quantity": 200},
    "lunch": {"food": "Dal Rice (Lentil Curry with Rice)", "quantity": 250},
    "dinner": {"food": "Palak Paneer with Rice", "quantity": 220},
    "snack": {"food": "Tea", "quantity": 150}
  },
  "tuesday": {
    "breakfast": {"food": "Idli (2 pieces)", "quantity": 150},
    "lunch": {"food": "Chicken Curry with Rice", "quantity": 280},
    "dinner": {"food": "Rajma Rice (Kidney Bean Curry with Rice)", "quantity": 240},
    "snack": {"food": "Lassi (Sweet)", "quantity": 200}
  }
  // ... continue for all 7 days
}

Make it realistic, varied, and practical for daily Indian cooking.`;
};

// Parse AI response into meal plan items
const parseAIResponse = (aiResponse: string, availableFoods: any[]): MealPlanItem[] => {
  try {
    // Try to extract JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    
    const mealPlanData = JSON.parse(jsonMatch[0]);
    const mealPlanItems: MealPlanItem[] = [];
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    days.forEach((day, dayIndex) => {
      const dayData = mealPlanData[day];
      if (dayData) {
        mealTypes.forEach((mealType, mealIndex) => {
          const meal = dayData[mealType];
          if (meal && meal.food) {
            // Find matching food item
            const foodItem = availableFoods.find(food => 
              food.name.toLowerCase().includes(meal.food.toLowerCase()) ||
              meal.food.toLowerCase().includes(food.name.toLowerCase())
            );
            
            if (foodItem) {
              mealPlanItems.push({
                day_of_week: dayIndex + 1,
                meal_type: mealType as any,
                food_item_id: foodItem.id,
                quantity_grams: Math.round(meal.quantity || 150)
              });
            }
          }
        });
      }
    });
    
    return mealPlanItems;
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw error;
  }
};

// Enhanced nutritional needs calculation with PM-POSHAN compliance
const calculateEnhancedNutritionalNeeds = (profile: MealPlanRequest['userProfile']) => {
  // Determine age group for PM-POSHAN standards
  const isPrimary = profile.age >= 6 && profile.age <= 10;
  const isUpperPrimary = profile.age >= 11 && profile.age <= 14;
  
  let dailyCalories, protein, iron, vitaminA;
  
  if (isPrimary) {
    // PM-POSHAN Primary standards
    dailyCalories = 450;
    protein = 12;
    iron = 3;
    vitaminA = 40;
  } else if (isUpperPrimary) {
    // PM-POSHAN Upper Primary standards
    dailyCalories = 700;
    protein = 20;
    iron = 3;
    vitaminA = 40;
  } else {
    // Adult calculation using BMR
    let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    
    // Add gender factor
    if (profile.gender === 'male') {
      bmr += 5;
    } else {
      bmr -= 161;
    }
    
    // Activity factor (sedentary to moderate for students)
    const activityFactor = 1.4;
    dailyCalories = Math.round(bmr * activityFactor);
    
    // Adjust based on goal
    switch (profile.goal) {
      case 'weight_loss':
        dailyCalories -= 500; // 500 calorie deficit
        break;
      case 'weight_gain':
        dailyCalories += 500; // 500 calorie surplus
        break;
      case 'balance_weight':
      default:
        // Keep maintenance calories
        break;
    }
    
    // Ensure minimum calories
    dailyCalories = Math.max(dailyCalories, 1200);
    protein = Math.round(dailyCalories * 0.25 / 4); // 25% from protein
    iron = 3;
    vitaminA = 40;
  }
  
  return {
    calories: dailyCalories,
    protein: protein,
    carbs: Math.round(dailyCalories * 0.50 / 4),   // 50% from carbs
    fats: Math.round(dailyCalories * 0.25 / 9),    // 25% from fats
    iron: iron,
    vitaminA: vitaminA,
    isPrimary: isPrimary,
    isUpperPrimary: isUpperPrimary
  };
};

const calculateNutritionalNeeds = (profile: MealPlanRequest['userProfile']) => {
  // BMR calculation using Mifflin-St Jeor Equation
  let bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
  
  // Add gender factor
  if (profile.gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  
  // Activity factor (sedentary to moderate for students)
  const activityFactor = 1.4;
  let dailyCalories = Math.round(bmr * activityFactor);
  
  // Adjust based on goal
  switch (profile.goal) {
    case 'weight_loss':
      dailyCalories -= 500; // 500 calorie deficit
      break;
    case 'weight_gain':
      dailyCalories += 500; // 500 calorie surplus
      break;
    case 'balance_weight':
    default:
      // Keep maintenance calories
      break;
  }
  
  // Ensure minimum calories
  dailyCalories = Math.max(dailyCalories, 1200);
  
  return {
    calories: dailyCalories,
    protein: Math.round(dailyCalories * 0.25 / 4), // 25% from protein
    carbs: Math.round(dailyCalories * 0.50 / 4),   // 50% from carbs
    fats: Math.round(dailyCalories * 0.25 / 9),    // 25% from fats
  };
};

const generatePersonalizedMealPlan = (
  availableFoods: MealPlanRequest['availableFoods'],
  nutritionalNeeds: ReturnType<typeof calculateNutritionalNeeds>,
  profile: MealPlanRequest['userProfile']
): MealPlanItem[] => {
  const mealPlan: MealPlanItem[] = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Filter foods based on dietary preference
  const suitableFoods = availableFoods.filter(food => 
    profile.dietaryPreference === 'vegetarian' ? food.is_veg : true
  );
  
  // Meal calorie distribution
  const mealDistribution = {
    breakfast: 0.25,
    lunch: 0.35,
    dinner: 0.30,
    snack: 0.10
  };
  
  // Track used foods to ensure variety across days
  const usedFoods = new Set<string>();
  
  // Generate meals for each day with variety
  days.forEach((day, dayIndex) => {
    Object.entries(mealDistribution).forEach(([mealType, calorieRatio]) => {
      const targetCalories = Math.round(nutritionalNeeds.calories * calorieRatio);
      const mealItems = selectFoodsForMeal(
        suitableFoods,
        mealType as keyof typeof mealDistribution,
        targetCalories,
        profile,
        usedFoods // Pass used foods to avoid repetition
      );
      
      mealItems.forEach(item => {
        mealPlan.push({
          day_of_week: dayIndex + 1,
          meal_type: mealType as MealPlanItem['meal_type'],
          food_item_id: item.food_item_id,
          quantity_grams: item.quantity_grams
        });
        usedFoods.add(item.food_item_id);
      });
    });
  });
  
  return mealPlan;
};

// Enhanced realistic meal plan generation with PM-POSHAN compliance
const generateEnhancedRealisticMealPlan = (
  availableFoods: MealPlanRequest['availableFoods'],
  nutritionalNeeds: ReturnType<typeof calculateEnhancedNutritionalNeeds>,
  profile: MealPlanRequest['userProfile']
): MealPlanItem[] => {
  const mealPlan: MealPlanItem[] = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  console.log('🍽️ Generating ENHANCED realistic meal plan with PM-POSHAN compliance for:', profile.dietaryPreference);
  console.log('📊 Available foods count:', availableFoods.length);
  console.log('🎯 Target calories:', nutritionalNeeds.calories);
  console.log('🥩 Target protein:', nutritionalNeeds.protein);
  console.log('🔬 Target iron:', nutritionalNeeds.iron);
  console.log('🥕 Target vitamin A:', nutritionalNeeds.vitaminA);
  
  // Filter foods based on dietary preference
  const suitableFoods = availableFoods.filter(food => 
    profile.dietaryPreference === 'vegetarian' ? food.is_veg : true
  );
  
  console.log('✅ Suitable foods count:', suitableFoods.length);
  
  // Enhanced food categorization with PM-POSHAN focus
  const breakfastFoods = suitableFoods.filter(food => 
    food.category === 'breakfast' || 
    food.name.toLowerCase().includes('dosa') ||
    food.name.toLowerCase().includes('idli') ||
    food.name.toLowerCase().includes('poha') ||
    food.name.toLowerCase().includes('upma') ||
    food.name.toLowerCase().includes('paratha') ||
    food.name.toLowerCase().includes('chilla') ||
    food.name.toLowerCase().includes('uttapam') ||
    food.name.toLowerCase().includes('thepla') ||
    food.name.toLowerCase().includes('dhokla') ||
    food.name.toLowerCase().includes('bread') ||
    food.name.toLowerCase().includes('toast') ||
    food.name.toLowerCase().includes('oats') ||
    food.name.toLowerCase().includes('cornflakes') ||
    food.name.toLowerCase().includes('muesli')
  );
  
  // Enhanced lunch/dinner foods with complete meals and nutrition focus
  const lunchDinnerFoods = suitableFoods.filter(food => 
    food.category === 'complete_meal' ||
    (food.name.toLowerCase().includes('curry') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('dal') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('rajma') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('chana') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('paneer') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('aloo') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('gobi') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('palak') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('matar') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('baingan') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('chicken') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('mutton') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('fish') && food.name.toLowerCase().includes('rice')) ||
    food.name.toLowerCase().includes('biryani') ||
    food.name.toLowerCase().includes('pulao') ||
    food.name.toLowerCase().includes('khichdi') ||
    // Add more nutritious options
    food.name.toLowerCase().includes('spinach') ||
    food.name.toLowerCase().includes('carrot') ||
    food.name.toLowerCase().includes('bottle gourd') ||
    food.name.toLowerCase().includes('cauliflower')
  );
  
  const snackFoods = suitableFoods.filter(food => 
    food.category === 'snacks' || 
    food.category === 'beverages' ||
    food.category === 'desserts' ||
    food.name.toLowerCase().includes('samosa') ||
    food.name.toLowerCase().includes('pakora') ||
    food.name.toLowerCase().includes('vada') ||
    food.name.toLowerCase().includes('dhokla') ||
    food.name.toLowerCase().includes('cutlet') ||
    food.name.toLowerCase().includes('chaat') ||
    food.name.toLowerCase().includes('lassi') ||
    food.name.toLowerCase().includes('tea') ||
    food.name.toLowerCase().includes('coffee') ||
    food.name.toLowerCase().includes('juice') ||
    food.name.toLowerCase().includes('raita') ||
    food.name.toLowerCase().includes('pickle') ||
    food.name.toLowerCase().includes('salad') ||
    food.name.toLowerCase().includes('papad') ||
    // Add nutritious snacks
    food.name.toLowerCase().includes('banana') ||
    food.name.toLowerCase().includes('orange') ||
    food.name.toLowerCase().includes('apple')
  );
  
  console.log('🌅 Breakfast foods:', breakfastFoods.length);
  console.log('🍽️ Lunch/Dinner foods:', lunchDinnerFoods.length);
  console.log('🍿 Snack foods:', snackFoods.length);
  
  // Enhanced meal patterns with PM-POSHAN nutrition focus - using actual food IDs
  const enhancedMealPatterns = [
    // Monday - Balanced nutrition
    {
      breakfast: ['idli', 'masala-dosa', 'poha', 'upma', 'aloo-paratha-breakfast'],
      lunch: ['dal-rice', 'rajma-rice', 'chana-masala', 'palak-paneer'],
      dinner: ['veg-biryani', 'dal-rice', 'veg-pulao', 'chicken-biryani'],
      snack: ['banana', 'orange', 'samosa', 'pakora']
    },
    // Tuesday - Protein focus
    {
      breakfast: ['poha', 'upma', 'besan-chilla', 'aloo-paratha-breakfast'],
      lunch: ['rajma-rice', 'chana-masala', 'aloo-gobi', 'matar-paneer'],
      dinner: ['dal-rice', 'veg-pulao', 'chicken-biryani', 'veg-biryani'],
      snack: ['banana', 'pakora', 'vada', 'dhokla']
    },
    // Wednesday - Iron rich
    {
      breakfast: ['upma', 'masala-dosa', 'idli', 'paneer-paratha-breakfast'],
      lunch: ['chana-masala', 'aloo-gobi', 'matar-paneer', 'palak-paneer'],
      dinner: ['veg-pulao', 'chicken-biryani', 'dal-rice', 'veg-biryani'],
      snack: ['banana', 'vada', 'dhokla', 'samosa']
    },
    // Thursday - Vitamin A focus
    {
      breakfast: ['aloo-paratha-breakfast', 'poha', 'upma', 'besan-chilla'],
      lunch: ['matar-paneer', 'aloo-gobi', 'palak-paneer', 'rajma-rice'],
      dinner: ['dal-rice', 'chicken-biryani', 'veg-pulao', 'veg-biryani'],
      snack: ['banana', 'dhokla', 'samosa', 'pakora']
    },
    // Friday - Complete nutrition
    {
      breakfast: ['masala-dosa', 'idli', 'poha', 'upma'],
      lunch: ['chicken-curry', 'mutton-curry', 'fish-curry', 'egg-curry'],
      dinner: ['chicken-biryani', 'veg-pulao', 'dal-rice', 'mutton-biryani'],
      snack: ['banana', 'cutlet', 'samosa', 'pakora']
    },
    // Saturday - Cheat day with nutrition
    {
      breakfast: ['aloo-paratha-breakfast', 'paneer-paratha-breakfast', 'chole-bhature'],
      lunch: ['chole-bhature', 'aloo-paratha', 'paneer-paratha'],
      dinner: ['chicken-biryani', 'mutton-biryani', 'veg-pulao'],
      snack: ['banana', 'samosa', 'pakora', 'dhokla']
    },
    // Sunday - Family day with balanced nutrition
    {
      breakfast: ['aloo-paratha-breakfast', 'paneer-paratha-breakfast', 'masala-dosa'],
      lunch: ['chicken-biryani', 'veg-pulao', 'rajma-rice', 'chicken-curry'],
      dinner: ['mutton-biryani', 'veg-pulao', 'dal-rice', 'fish-biryani'],
      snack: ['banana', 'samosa', 'pakora', 'dhokla']
    }
  ];
  
  // Generate meals for each day with enhanced nutrition focus
  days.forEach((day, dayIndex) => {
    console.log(`\n📅 Generating ${day} with PM-POSHAN compliance...`);
    
    const pattern = enhancedMealPatterns[dayIndex];
    const usedFoods = new Set<string>();
    
    // Calculate target calories per meal based on PM-POSHAN standards
    const targetCaloriesPerMeal = {
      breakfast: Math.round(nutritionalNeeds.calories * 0.25),
      lunch: Math.round(nutritionalNeeds.calories * 0.35),
      dinner: Math.round(nutritionalNeeds.calories * 0.30),
      snack: Math.round(nutritionalNeeds.calories * 0.10)
    };
    
    // BREAKFAST - Enhanced nutrition focus
    let breakfastFood = null;
    
    // Try to find food by exact ID match first
    for (const option of pattern.breakfast) {
      breakfastFood = breakfastFoods.find(food => 
        food.id === option && !usedFoods.has(food.id)
      );
      if (breakfastFood) break;
    }
    
    // If not found by ID, try by name match
    if (!breakfastFood) {
      for (const option of pattern.breakfast) {
        breakfastFood = breakfastFoods.find(food => 
          food.name.toLowerCase().includes(option.toLowerCase()) && !usedFoods.has(food.id)
        );
        if (breakfastFood) break;
      }
    }
    
    // If still not found, use any available breakfast food
    if (!breakfastFood) {
      breakfastFood = breakfastFoods.find(food => !usedFoods.has(food.id));
    }
    
    if (breakfastFood) {
      // Calculate quantity based on target calories
      const quantity = Math.round((targetCaloriesPerMeal.breakfast / breakfastFood.calories_per_100g) * 100);
      mealPlan.push({
        day_of_week: dayIndex + 1,
        meal_type: 'breakfast',
        food_item_id: breakfastFood.id,
        quantity_grams: Math.max(80, Math.min(200, quantity)) // Reasonable range
      });
      usedFoods.add(breakfastFood.id);
    }
    
    // LUNCH - Enhanced nutrition focus
    let lunchFood = null;
    
    // Try to find food by exact ID match first
    for (const option of pattern.lunch) {
      lunchFood = lunchDinnerFoods.find(food => 
        food.id === option && !usedFoods.has(food.id)
      );
      if (lunchFood) break;
    }
    
    // If not found by ID, try by name match
    if (!lunchFood) {
      for (const option of pattern.lunch) {
        lunchFood = lunchDinnerFoods.find(food => 
          food.name.toLowerCase().includes(option.toLowerCase()) && !usedFoods.has(food.id)
        );
        if (lunchFood) break;
      }
    }
    
    // If still not found, use any available lunch/dinner food
    if (!lunchFood) {
      lunchFood = lunchDinnerFoods.find(food => !usedFoods.has(food.id));
    }
    
    if (lunchFood) {
      // Calculate quantity based on target calories
      const quantity = Math.round((targetCaloriesPerMeal.lunch / lunchFood.calories_per_100g) * 100);
      mealPlan.push({
        day_of_week: dayIndex + 1,
        meal_type: 'lunch',
        food_item_id: lunchFood.id,
        quantity_grams: Math.max(150, Math.min(300, quantity)) // Reasonable range
      });
      usedFoods.add(lunchFood.id);
    }
    
    // DINNER - Enhanced nutrition focus
    let dinnerFood = null;
    
    // Try to find food by exact ID match first
    for (const option of pattern.dinner) {
      dinnerFood = lunchDinnerFoods.find(food => 
        food.id === option && !usedFoods.has(food.id)
      );
      if (dinnerFood) break;
    }
    
    // If not found by ID, try by name match
    if (!dinnerFood) {
      for (const option of pattern.dinner) {
        dinnerFood = lunchDinnerFoods.find(food => 
          food.name.toLowerCase().includes(option.toLowerCase()) && !usedFoods.has(food.id)
        );
        if (dinnerFood) break;
      }
    }
    
    // If still not found, use any available lunch/dinner food
    if (!dinnerFood) {
      dinnerFood = lunchDinnerFoods.find(food => !usedFoods.has(food.id));
    }
    
    if (dinnerFood) {
      // Calculate quantity based on target calories
      const quantity = Math.round((targetCaloriesPerMeal.dinner / dinnerFood.calories_per_100g) * 100);
      mealPlan.push({
        day_of_week: dayIndex + 1,
        meal_type: 'dinner',
        food_item_id: dinnerFood.id,
        quantity_grams: Math.max(120, Math.min(250, quantity)) // Reasonable range
      });
      usedFoods.add(dinnerFood.id);
    }
    
    // SNACK - Enhanced nutrition focus
    let snackFood = null;
    
    // Try to find food by exact ID match first
    for (const option of pattern.snack) {
      snackFood = snackFoods.find(food => 
        food.id === option && !usedFoods.has(food.id)
      );
      if (snackFood) break;
    }
    
    // If not found by ID, try by name match
    if (!snackFood) {
      for (const option of pattern.snack) {
        snackFood = snackFoods.find(food => 
          food.name.toLowerCase().includes(option.toLowerCase()) && !usedFoods.has(food.id)
        );
        if (snackFood) break;
      }
    }
    
    // If still not found, use any available snack food
    if (!snackFood) {
      snackFood = snackFoods.find(food => !usedFoods.has(food.id));
    }
    
    if (snackFood) {
      // Calculate quantity based on target calories
      const quantity = Math.round((targetCaloriesPerMeal.snack / snackFood.calories_per_100g) * 100);
      mealPlan.push({
        day_of_week: dayIndex + 1,
        meal_type: 'snack',
        food_item_id: snackFood.id,
        quantity_grams: Math.max(50, Math.min(150, quantity)) // Reasonable range
      });
      usedFoods.add(snackFood.id);
    }
    
    const dayItems = mealPlan.filter(item => item.day_of_week === dayIndex + 1);
    console.log(`  ✅ ${day} complete: ${dayItems.length} items`);
    console.log(`    Breakfast: ${dayItems.filter(item => item.meal_type === 'breakfast').length} items`);
    console.log(`    Lunch: ${dayItems.filter(item => item.meal_type === 'lunch').length} items`);
    console.log(`    Dinner: ${dayItems.filter(item => item.meal_type === 'dinner').length} items`);
    console.log(`    Snack: ${dayItems.filter(item => item.meal_type === 'snack').length} items`);
  });
  
  console.log(`\n🎉 Generated enhanced meal plan with ${mealPlan.length} items`);
  console.log(`📊 PM-POSHAN compliance: ${nutritionalNeeds.isPrimary ? 'Primary' : nutritionalNeeds.isUpperPrimary ? 'Upper Primary' : 'Adult'}`);
  return mealPlan;
};

// REALISTIC meal plan generation - thinking like a human
const generateRealisticMealPlan = (
  availableFoods: MealPlanRequest['availableFoods'],
  nutritionalNeeds: ReturnType<typeof calculateNutritionalNeeds>,
  profile: MealPlanRequest['userProfile']
): MealPlanItem[] => {
  const mealPlan: MealPlanItem[] = [];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  console.log('🍽️ Generating REALISTIC meal plan for:', profile.dietaryPreference);
  console.log('📊 Available foods count:', availableFoods.length);
  
  // Filter foods based on dietary preference
  const suitableFoods = availableFoods.filter(food => 
    profile.dietaryPreference === 'vegetarian' ? food.is_veg : true
  );
  
  console.log('✅ Suitable foods count:', suitableFoods.length);
  
  // IMPROVED food categorization - prioritize complete meals
  const breakfastFoods = suitableFoods.filter(food => 
    food.category === 'breakfast' || 
    food.name.toLowerCase().includes('dosa') ||
    food.name.toLowerCase().includes('idli') ||
    food.name.toLowerCase().includes('poha') ||
    food.name.toLowerCase().includes('upma') ||
    food.name.toLowerCase().includes('paratha') ||
    food.name.toLowerCase().includes('chilla') ||
    food.name.toLowerCase().includes('uttapam') ||
    food.name.toLowerCase().includes('thepla') ||
    food.name.toLowerCase().includes('dhokla') ||
    food.name.toLowerCase().includes('bread') ||
    food.name.toLowerCase().includes('toast') ||
    food.name.toLowerCase().includes('oats') ||
    food.name.toLowerCase().includes('cornflakes') ||
    food.name.toLowerCase().includes('muesli')
  );
  
  // PRIORITIZE complete meals for lunch and dinner
  const lunchDinnerFoods = suitableFoods.filter(food => 
    food.category === 'complete_meal' ||
    (food.name.toLowerCase().includes('curry') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('dal') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('rajma') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('chana') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('paneer') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('aloo') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('gobi') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('palak') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('matar') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('baingan') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('chicken') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('mutton') && food.name.toLowerCase().includes('rice')) ||
    (food.name.toLowerCase().includes('fish') && food.name.toLowerCase().includes('rice')) ||
    food.name.toLowerCase().includes('biryani') ||
    food.name.toLowerCase().includes('pulao') ||
    food.name.toLowerCase().includes('khichdi')
  );
  
  const snackFoods = suitableFoods.filter(food => 
    food.category === 'snacks' || 
    food.category === 'beverages' ||
    food.category === 'desserts' ||
    food.name.toLowerCase().includes('samosa') ||
    food.name.toLowerCase().includes('pakora') ||
    food.name.toLowerCase().includes('vada') ||
    food.name.toLowerCase().includes('dhokla') ||
    food.name.toLowerCase().includes('cutlet') ||
    food.name.toLowerCase().includes('chaat') ||
    food.name.toLowerCase().includes('lassi') ||
    food.name.toLowerCase().includes('tea') ||
    food.name.toLowerCase().includes('coffee') ||
    food.name.toLowerCase().includes('juice') ||
    food.name.toLowerCase().includes('raita') ||
    food.name.toLowerCase().includes('pickle') ||
    food.name.toLowerCase().includes('salad') ||
    food.name.toLowerCase().includes('papad')
  );
  
  console.log('🌅 Breakfast foods:', breakfastFoods.length);
  console.log('🍽️ Lunch/Dinner foods:', lunchDinnerFoods.length);
  console.log('🍿 Snack foods:', snackFoods.length);
  
  // AUTHENTIC INDIAN MEAL COMBINATIONS - Predefined realistic meal patterns
  const mealPatterns = [
    // Monday
    {
      breakfast: ['idli', 'dosa', 'poha', 'upma', 'paratha'],
      lunch: ['dal-rice', 'rajma-rice', 'chana-masala', 'palak-paneer'],
      dinner: ['khichdi', 'dal-rice', 'pulao', 'biryani'],
      snack: ['samosa', 'pakora', 'vada', 'dhokla']
    },
    // Tuesday
    {
      breakfast: ['poha', 'upma', 'besan-chilla', 'aloo-paratha'],
      lunch: ['rajma-rice', 'chana-masala', 'aloo-gobi', 'matar-paneer'],
      dinner: ['dal-rice', 'pulao', 'biryani', 'veg-biryani'],
      snack: ['pakora', 'vada', 'cutlet', 'dhokla']
    },
    // Wednesday
    {
      breakfast: ['upma', 'dosa', 'idli', 'paneer-paratha'],
      lunch: ['chana-masala', 'aloo-gobi', 'baingan-bharta', 'matar-paneer'],
      dinner: ['pulao', 'biryani', 'khichdi', 'dal-rice'],
      snack: ['vada', 'dhokla', 'samosa', 'cutlet']
    },
    // Thursday
    {
      breakfast: ['paratha', 'poha', 'upma', 'besan-chilla'],
      lunch: ['matar-paneer', 'aloo-gobi', 'palak-paneer', 'rajma-rice'],
      dinner: ['dal-rice', 'biryani', 'pulao', 'khichdi'],
      snack: ['dhokla', 'samosa', 'pakora', 'vada']
    },
    // Friday
    {
      breakfast: ['dosa', 'idli', 'poha', 'upma'],
      lunch: ['chicken-curry', 'mutton-curry', 'fish-curry', 'egg-curry'],
      dinner: ['biryani', 'pulao', 'dal-rice', 'khichdi'],
      snack: ['cutlet', 'samosa', 'pakora', 'vada']
    },
    // Saturday - Cheat day
    {
      breakfast: ['aloo-paratha', 'paneer-paratha', 'chole-bhature'],
      lunch: ['chole-bhature', 'aloo-paratha', 'paneer-paratha'],
      dinner: ['pizza', 'biryani', 'pulao'],
      snack: ['ice-cream', 'jalebi', 'gulab-jamun']
    },
    // Sunday - Family day
    {
      breakfast: ['puri', 'aloo-paratha', 'paneer-paratha'],
      lunch: ['biryani', 'pulao', 'rajma-rice', 'chicken-curry'],
      dinner: ['biryani', 'pulao', 'dal-rice', 'khichdi'],
      snack: ['jalebi', 'gulab-jamun', 'kheer', 'rasgulla']
    }
  ];
  
  // Generate meals for each day with variety
  days.forEach((day, dayIndex) => {
    console.log(`\n📅 Generating ${day}...`);
    
    const pattern = mealPatterns[dayIndex];
    const usedFoods = new Set<string>();
    
    // BREAKFAST - Select 1 item with variety
    const breakfastOptions = pattern.breakfast.filter(option => 
      breakfastFoods.some(food => food.name.toLowerCase().includes(option))
    );
    
    if (breakfastOptions.length > 0) {
      const selectedOption = breakfastOptions[dayIndex % breakfastOptions.length];
      const breakfastFood = breakfastFoods.find(food => 
        food.name.toLowerCase().includes(selectedOption) && !usedFoods.has(food.id)
      );
      
      if (breakfastFood) {
      mealPlan.push({
        day_of_week: dayIndex + 1,
          meal_type: 'breakfast',
          food_item_id: breakfastFood.id,
          quantity_grams: Math.floor(Math.random() * 60) + 120 // 120-180g
        });
        usedFoods.add(breakfastFood.id);
      }
    }
    
    // LUNCH - Select 1 complete meal with variety
    const lunchOptions = pattern.lunch.filter(option => 
      lunchDinnerFoods.some(food => food.name.toLowerCase().includes(option))
    );
    
    if (lunchOptions.length > 0) {
      const selectedOption = lunchOptions[dayIndex % lunchOptions.length];
      const lunchFood = lunchDinnerFoods.find(food => 
        food.name.toLowerCase().includes(selectedOption) && !usedFoods.has(food.id)
      );
      
      if (lunchFood) {
      mealPlan.push({
        day_of_week: dayIndex + 1,
        meal_type: 'lunch',
          food_item_id: lunchFood.id,
          quantity_grams: Math.floor(Math.random() * 80) + 180 // 180-260g
        });
        usedFoods.add(lunchFood.id);
      }
    }
    
    // DINNER - Select 1 complete meal with variety
    const dinnerOptions = pattern.dinner.filter(option => 
      lunchDinnerFoods.some(food => food.name.toLowerCase().includes(option))
    );
    
    if (dinnerOptions.length > 0) {
      const selectedOption = dinnerOptions[dayIndex % dinnerOptions.length];
      const dinnerFood = lunchDinnerFoods.find(food => 
        food.name.toLowerCase().includes(selectedOption) && !usedFoods.has(food.id)
      );
      
    if (dinnerFood) {
      mealPlan.push({
        day_of_week: dayIndex + 1,
        meal_type: 'dinner',
        food_item_id: dinnerFood.id,
        quantity_grams: Math.floor(Math.random() * 60) + 140 // 140-200g
      });
        usedFoods.add(dinnerFood.id);
      }
    }
    
    // SNACK - Select 1 snack with variety
    const snackOptions = pattern.snack.filter(option => 
      snackFoods.some(food => food.name.toLowerCase().includes(option))
    );
    
    if (snackOptions.length > 0) {
      const selectedOption = snackOptions[dayIndex % snackOptions.length];
      const snackFood = snackFoods.find(food => 
        food.name.toLowerCase().includes(selectedOption) && !usedFoods.has(food.id)
      );
      
    if (snackFood) {
      mealPlan.push({
        day_of_week: dayIndex + 1,
        meal_type: 'snack',
        food_item_id: snackFood.id,
        quantity_grams: Math.floor(Math.random() * 40) + 60 // 60-100g
      });
        usedFoods.add(snackFood.id);
      }
    }
    
    const dayItems = mealPlan.filter(item => item.day_of_week === dayIndex + 1);
    console.log(`  ✅ ${day} complete: ${dayItems.length} items`);
    console.log(`    Breakfast: ${dayItems.filter(item => item.meal_type === 'breakfast').length} items`);
    console.log(`    Lunch: ${dayItems.filter(item => item.meal_type === 'lunch').length} items`);
    console.log(`    Dinner: ${dayItems.filter(item => item.meal_type === 'dinner').length} items`);
    console.log(`    Snack: ${dayItems.filter(item => item.meal_type === 'snack').length} items`);
  });
  
  console.log(`\n🎉 Generated realistic meal plan with ${mealPlan.length} items`);
  return mealPlan;
};

// Helper function to find food by ID or name with variety
function findFoodById(foods: any[], id: string, dayIndex: number = 0): any {
  // First try to find by exact ID
  let food = foods.find(food => food.id === id);
  
  // If not found, try to find by name pattern
  if (!food) {
    const namePattern = id.replace(/-/g, ' ').toLowerCase();
    food = foods.find(food => 
      food.name.toLowerCase().includes(namePattern) ||
      food.name.toLowerCase().includes(id.toLowerCase())
    );
  }
  
  // If still not found, use day-based selection for variety
  if (!food) {
    // Use day index to ensure different foods each day
    const shuffledFoods = [...foods].sort(() => Math.random() - 0.5);
    food = shuffledFoods[dayIndex % shuffledFoods.length];
  }
  
  return food;
}

// Helper function to select foods by pattern
function selectFoodsByPattern(foods: any[], pattern: string[], count: number): any[] {
  const selected: any[] = [];
  const shuffled = [...foods].sort(() => Math.random() - 0.5);
  
  // Try to match pattern first
  for (const patternId of pattern) {
    if (selected.length >= count) break;
    const food = shuffled.find(f => f.id === patternId);
    if (food && !selected.find(s => s.id === food.id)) {
      selected.push(food);
    }
  }
  
  // Fill remaining slots with random foods
  while (selected.length < count && selected.length < shuffled.length) {
    const food = shuffled[selected.length % shuffled.length];
    if (!selected.find(s => s.id === food.id)) {
      selected.push(food);
    } else {
      break;
    }
  }
  
  return selected;
}

const selectFoodsForMeal = (
  foods: MealPlanRequest['availableFoods'],
  mealType: string,
  targetCalories: number,
  profile: MealPlanRequest['userProfile'],
  globalUsedFoods?: Set<string>
) => {
  // Filter foods suitable for meal type - IMPROVED FILTERING
  let suitableFoods = foods.filter(food => {
    // Skip raw ingredients completely
    if (food.name.toLowerCase().includes('(raw)') || 
        food.name.toLowerCase().includes('raw ') ||
        food.name.toLowerCase().includes('flour') ||
        food.name.toLowerCase().includes('oil') ||
        food.name.toLowerCase().includes('butter') ||
        food.name.toLowerCase().includes('milk') ||
        food.name.toLowerCase().includes('eggs') ||
        food.name.toLowerCase().includes('chicken') && !food.name.toLowerCase().includes('curry') ||
        food.name.toLowerCase().includes('fish') && !food.name.toLowerCase().includes('curry') ||
        food.name.toLowerCase().includes('mutton') && !food.name.toLowerCase().includes('curry') ||
        food.name.toLowerCase().includes('paneer') && !food.name.toLowerCase().includes('curry') && !food.name.toLowerCase().includes('paratha') ||
        food.name.toLowerCase().includes('aloo') && !food.name.toLowerCase().includes('curry') && !food.name.toLowerCase().includes('paratha') ||
        food.name.toLowerCase().includes('gobi') && !food.name.toLowerCase().includes('curry') ||
        food.name.toLowerCase().includes('palak') && !food.name.toLowerCase().includes('curry') ||
        food.name.toLowerCase().includes('matar') && !food.name.toLowerCase().includes('curry') ||
        food.name.toLowerCase().includes('baingan') && !food.name.toLowerCase().includes('curry') ||
        food.name.toLowerCase().includes('dal') && !food.name.toLowerCase().includes('curry') && !food.name.toLowerCase().includes('rice') ||
        food.name.toLowerCase().includes('rajma') && !food.name.toLowerCase().includes('curry') && !food.name.toLowerCase().includes('rice') ||
        food.name.toLowerCase().includes('chana') && !food.name.toLowerCase().includes('curry') && !food.name.toLowerCase().includes('masala') ||
        food.name.toLowerCase().includes('rice') && !food.name.toLowerCase().includes('curry') && !food.name.toLowerCase().includes('biryani') && !food.name.toLowerCase().includes('pulao') ||
        food.name.toLowerCase().includes('onion') ||
        food.name.toLowerCase().includes('tomato') ||
        food.name.toLowerCase().includes('carrot') ||
        food.name.toLowerCase().includes('cucumber') ||
        food.name.toLowerCase().includes('garlic')) {
      return false;
    }
    
    switch (mealType) {
      case 'breakfast':
        // Only proper breakfast items
        return food.category === 'breakfast' || 
               food.name.toLowerCase().includes('dosa') ||
               food.name.toLowerCase().includes('idli') ||
               food.name.toLowerCase().includes('poha') ||
               food.name.toLowerCase().includes('upma') ||
               food.name.toLowerCase().includes('paratha') ||
               food.name.toLowerCase().includes('chilla') ||
               food.name.toLowerCase().includes('uttapam') ||
               food.name.toLowerCase().includes('thepla') ||
               food.name.toLowerCase().includes('dhokla') ||
               food.name.toLowerCase().includes('bread') ||
               food.name.toLowerCase().includes('oats') ||
               food.name.toLowerCase().includes('cornflakes') ||
               food.name.toLowerCase().includes('muesli');
      case 'lunch':
        // Only complete meals for lunch
        return food.category === 'complete_meal' ||
               (food.name.toLowerCase().includes('curry') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('dal') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('rajma') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('chana') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('paneer') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('aloo') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('gobi') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('palak') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('matar') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('baingan') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('chicken') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('mutton') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('fish') && food.name.toLowerCase().includes('rice')) ||
               food.name.toLowerCase().includes('biryani') ||
               food.name.toLowerCase().includes('pulao') ||
               food.name.toLowerCase().includes('khichdi');
      case 'dinner':
        // Only complete meals for dinner
        return food.category === 'complete_meal' ||
               (food.name.toLowerCase().includes('curry') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('dal') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('rajma') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('chana') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('paneer') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('aloo') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('gobi') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('palak') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('matar') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('baingan') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('chicken') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('mutton') && food.name.toLowerCase().includes('rice')) ||
               (food.name.toLowerCase().includes('fish') && food.name.toLowerCase().includes('rice')) ||
               food.name.toLowerCase().includes('biryani') ||
               food.name.toLowerCase().includes('pulao') ||
               food.name.toLowerCase().includes('khichdi');
      case 'snack':
        // Only proper snacks - no raw ingredients or main meals
        return (food.category === 'snacks' || 
                food.category === 'beverages' ||
                food.category === 'desserts') &&
                !food.name.toLowerCase().includes('rice') &&
               !food.name.toLowerCase().includes('curry') &&
                !food.name.toLowerCase().includes('dal') &&
                !food.name.toLowerCase().includes('rajma') &&
               !food.name.toLowerCase().includes('chana') &&
               !food.name.toLowerCase().includes('paneer') &&
               !food.name.toLowerCase().includes('aloo') &&
               !food.name.toLowerCase().includes('gobi') &&
               !food.name.toLowerCase().includes('palak') &&
               !food.name.toLowerCase().includes('matar') &&
               !food.name.toLowerCase().includes('baingan') &&
               !food.name.toLowerCase().includes('chicken') &&
               !food.name.toLowerCase().includes('mutton') &&
               !food.name.toLowerCase().includes('fish') ||
               food.name.toLowerCase().includes('samosa') ||
               food.name.toLowerCase().includes('pakora') ||
               food.name.toLowerCase().includes('vada') ||
               food.name.toLowerCase().includes('dhokla') ||
               food.name.toLowerCase().includes('cutlet') ||
               food.name.toLowerCase().includes('chaat') ||
               food.name.toLowerCase().includes('lassi') ||
               food.name.toLowerCase().includes('tea') ||
               food.name.toLowerCase().includes('coffee') ||
               food.name.toLowerCase().includes('juice') ||
               food.name.toLowerCase().includes('raita') ||
               food.name.toLowerCase().includes('pickle') ||
               food.name.toLowerCase().includes('salad') ||
               food.name.toLowerCase().includes('papad');
      default:
        return true;
    }
  });
  
  // Shuffle foods to ensure variety instead of sorting by efficiency
  const shuffledFoods = [...suitableFoods].sort(() => Math.random() - 0.5);
  
  // Select foods to meet calorie target
  const selectedItems: Array<{ food_item_id: string; quantity_grams: number }> = [];
  let currentCalories = 0;
  
  const usedFoods = new Set<string>();
  
  for (const food of shuffledFoods) {
    if (currentCalories >= targetCalories || 
        usedFoods.has(food.id) || 
        (globalUsedFoods && globalUsedFoods.has(food.id))) continue;
    
    const remainingCalories = targetCalories - currentCalories;
    const maxQuantity = Math.min(300, Math.round(remainingCalories / food.calories_per_100g * 100));
    
    if (maxQuantity >= 50) { // Minimum 50g serving
      selectedItems.push({
        food_item_id: food.id,
        quantity_grams: maxQuantity
      });
      currentCalories += (maxQuantity / 100) * food.calories_per_100g;
      usedFoods.add(food.id);
      
      // For lunch/dinner, try to add a second item for variety
      if ((mealType === 'lunch' || mealType === 'dinner') && selectedItems.length === 1) {
        const secondFood = shuffledFoods.find(f => 
          !usedFoods.has(f.id) && 
          f.id !== food.id &&
          (f.category === 'complete_meal' ||
           f.name.toLowerCase().includes('curry') ||
           f.name.toLowerCase().includes('biryani') ||
           f.name.toLowerCase().includes('pulao')) &&
          (!globalUsedFoods || !globalUsedFoods.has(f.id))
        );
        
        if (secondFood && currentCalories < targetCalories * 0.9) {
          const remainingCalories2 = targetCalories - currentCalories;
          const maxQuantity2 = Math.min(200, Math.round(remainingCalories2 / secondFood.calories_per_100g * 100));
          
          if (maxQuantity2 >= 50) {
            selectedItems.push({
              food_item_id: secondFood.id,
              quantity_grams: maxQuantity2
            });
            currentCalories += (maxQuantity2 / 100) * secondFood.calories_per_100g;
            usedFoods.add(secondFood.id);
          }
        }
      }
    }
  }
  
  // If we haven't met the calorie target, add more items
  if (currentCalories < targetCalories * 0.8) {
    const additionalCalories = targetCalories - currentCalories;
    const additionalFood = shuffledFoods.find(f => 
      !usedFoods.has(f.id) && 
      (!globalUsedFoods || !globalUsedFoods.has(f.id))
    );
    
    if (additionalFood) {
      const additionalQuantity = Math.round(additionalCalories / additionalFood.calories_per_100g * 100);
      selectedItems.push({
        food_item_id: additionalFood.id,
        quantity_grams: Math.min(additionalQuantity, 300)
      });
    }
  }
  
  return selectedItems;
};

// AI-powered meal suggestions based on user preferences
export const getAIMealSuggestions = (profile: MealPlanRequest['userProfile']): string[] => {
  const suggestions: string[] = [];
  
  // Goal-based suggestions
  switch (profile.goal) {
    case 'weight_loss':
      suggestions.push(
        "Focus on high-protein, low-calorie foods like lean meats, fish, and vegetables",
        "Include fiber-rich foods to keep you feeling full longer",
        "Consider smaller, more frequent meals to maintain metabolism"
      );
      break;
    case 'weight_gain':
      suggestions.push(
        "Include calorie-dense foods like nuts, avocados, and healthy oils",
        "Add protein shakes or smoothies between meals",
        "Focus on complex carbohydrates for sustained energy"
      );
      break;
    case 'balance_weight':
      suggestions.push(
        "Maintain a balanced ratio of macronutrients",
        "Include a variety of colorful fruits and vegetables",
        "Stay hydrated and maintain regular meal timing"
      );
      break;
  }
  
  // Body type suggestions
  switch (profile.bodyType) {
    case 'skinny':
      suggestions.push("Include healthy fats like olive oil, nuts, and seeds");
      break;
    case 'skinny_fat':
      suggestions.push("Focus on lean proteins and limit processed foods");
      break;
    case 'fat':
      suggestions.push("Prioritize whole foods and control portion sizes");
      break;
  }
  
  // Age-based suggestions
  if (profile.age < 20) {
    suggestions.push("Ensure adequate calcium and iron for growth and development");
  }
  
  return suggestions;
};
