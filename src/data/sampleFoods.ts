import { FoodPreference, MealCategory, MealItem, UserProfile } from '../types';

export interface FoodOption {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealCategory: MealCategory[];
  foodPreference: FoodPreference[];
  allergens: string[];
  isIndian: boolean;
  icon: string;
  notes: string;
}

export const FOOD_DATABASE: FoodOption[] = [
  // --- BREAKFAST ---
  {
    id: 'b-poha',
    name: 'Vegetable Kanda Poha with Peanuts',
    portion: '1 medium bowl (180g)',
    calories: 270,
    protein: 6,
    carbs: 42,
    fat: 9,
    mealCategory: ['breakfast', 'evening_snack'],
    foodPreference: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
    allergens: ['peanuts'],
    isIndian: true,
    icon: '🥣',
    notes: 'Flattened rice tossed with roasted peanuts, curry leaves, and mustard seeds.',
  },
  {
    id: 'b-idli-sambar',
    name: 'Steamed Idli (3 pcs) with Moong Sambar & Chutney',
    portion: '3 idlis + 1 cup sambar',
    calories: 290,
    protein: 9,
    carbs: 52,
    fat: 4,
    mealCategory: ['breakfast'],
    foodPreference: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
    allergens: [],
    isIndian: true,
    icon: '⚪',
    notes: 'Fermented rice & urad dal cakes with fiber-rich vegetable lentil stew.',
  },
  {
    id: 'b-oats-whey',
    name: 'Protein Rolled Oats with Milk, Nuts & Berries',
    portion: '1 large bowl (60g oats + 200ml milk)',
    calories: 390,
    protein: 26,
    carbs: 54,
    fat: 8,
    mealCategory: ['breakfast'],
    foodPreference: ['vegetarian', 'eggetarian', 'non_vegetarian'],
    allergens: ['dairy', 'nuts'],
    isIndian: false,
    icon: '🥣',
    notes: 'Complex carbs with high bioavailability protein and antioxidant rich berries.',
  },
  {
    id: 'b-eggs-toast',
    name: 'Whole Eggs Scramble (3 eggs) & 2 Roti / Toast',
    portion: '3 eggs + 2 whole wheat rotis',
    calories: 420,
    protein: 28,
    carbs: 34,
    fat: 18,
    mealCategory: ['breakfast'],
    foodPreference: ['eggetarian', 'non_vegetarian'],
    allergens: ['eggs', 'gluten'],
    isIndian: true,
    icon: '🍳',
    notes: 'High biological value protein with essential choline, lutein, and healthy fats.',
  },
  {
    id: 'b-upma',
    name: 'Vegetable Rava Upma with Mixed Veggies',
    portion: '1 medium bowl (200g)',
    calories: 260,
    protein: 7,
    carbs: 44,
    fat: 6,
    mealCategory: ['breakfast', 'evening_snack'],
    foodPreference: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
    allergens: ['gluten'],
    isIndian: true,
    icon: '🍲',
    notes: 'Semolina cooked with carrots, beans, peas, ginger, and curry leaves.',
  },
  {
    id: 'b-paneer-cheela',
    name: 'High-Protein Besan & Paneer Cheela (2 pcs)',
    portion: '2 cheelas with mint chutney',
    calories: 360,
    protein: 22,
    carbs: 28,
    fat: 16,
    mealCategory: ['breakfast'],
    foodPreference: ['vegetarian', 'eggetarian', 'non_vegetarian'],
    allergens: ['dairy'],
    isIndian: true,
    icon: '🥞',
    notes: 'Gram flour savory pancake stuffed with seasoned crumbled paneer.',
  },
  {
    id: 'b-dosa-sambar',
    name: 'Crisp Oats & Lentil Dosa with Sambar',
    portion: '2 dosas + 1 cup sambar',
    calories: 310,
    protein: 11,
    carbs: 48,
    fat: 7,
    mealCategory: ['breakfast'],
    foodPreference: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
    allergens: [],
    isIndian: true,
    icon: '🫓',
    notes: 'Low glycemic index fermented crepe with rich fiber.',
  },

  // --- MORNING SNACK ---
  {
    id: 'ms-sprouts',
    name: 'Fresh Moong Sprouts Chaat with Lemon & Herbs',
    portion: '1 cup (150g)',
    calories: 140,
    protein: 10,
    carbs: 22,
    fat: 1,
    mealCategory: ['morning_snack', 'evening_snack'],
    foodPreference: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
    allergens: [],
    isIndian: true,
    icon: '🌱',
    notes: 'Sprouted mung beans with chopped cucumber, tomato, chaat masala and fresh lime.',
  },
  {
    id: 'ms-boiled-eggs',
    name: 'Hard Boiled Eggs with Black Pepper',
    portion: '2 whole eggs',
    calories: 155,
    protein: 13,
    carbs: 1,
    fat: 10,
    mealCategory: ['morning_snack', 'evening_snack'],
    foodPreference: ['eggetarian', 'non_vegetarian'],
    allergens: ['eggs'],
    isIndian: false,
    icon: '🥚',
    notes: 'Quick grab-and-go protein punch with zero carbs.',
  },
  {
    id: 'ms-fruit-nuts',
    name: 'Fresh Apple Slices & Roasted Almonds',
    portion: '1 apple + 12 almonds (18g)',
    calories: 180,
    protein: 4,
    carbs: 26,
    fat: 8,
    mealCategory: ['morning_snack', 'evening_snack'],
    foodPreference: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
    allergens: ['nuts'],
    isIndian: false,
    icon: '🍎',
    notes: 'Natural polyphenols and healthy monounsaturated fatty acids.',
  },
  {
    id: 'ms-curd-berries',
    name: 'Low-Fat Greek Curd (Dahi) with Chia Seeds',
    portion: '1 cup (150g)',
    calories: 135,
    protein: 14,
    carbs: 8,
    fat: 4,
    mealCategory: ['morning_snack', 'evening_snack'],
    foodPreference: ['vegetarian', 'eggetarian', 'non_vegetarian'],
    allergens: ['dairy'],
    isIndian: true,
    icon: '🥣',
    notes: 'Gut-friendly probiotics with slow-digesting casein protein.',
  },

  // --- LUNCH ---
  {
    id: 'l-chicken-rice-dal',
    name: 'Grilled Chicken Breast, Brown Rice & Toor Dal',
    portion: '150g chicken + 1 cup rice + 1 cup dal',
    calories: 560,
    protein: 48,
    carbs: 62,
    fat: 11,
    mealCategory: ['lunch', 'dinner'],
    foodPreference: ['non_vegetarian'],
    allergens: [],
    isIndian: true,
    icon: '🍗',
    notes: 'Lean muscle building classic with complete amino acids, fiber and iron.',
  },
  {
    id: 'l-paneer-roti-dal',
    name: 'Low-Fat Paneer Bhurji, 3 Chapatis & Moong Dal',
    portion: '100g paneer + 3 rotis + 1 cup dal + salad',
    calories: 550,
    protein: 34,
    carbs: 68,
    fat: 16,
    mealCategory: ['lunch', 'dinner'],
    foodPreference: ['vegetarian', 'eggetarian', 'non_vegetarian'],
    allergens: ['dairy', 'gluten'],
    isIndian: true,
    icon: '🧀',
    notes: 'Rich vegetarian protein with wholesome whole wheat fiber and fresh greens.',
  },
  {
    id: 'l-fish-curry-rice',
    name: 'South Indian Fish Curry (Rohu/Pomfret) & Steamed Rice',
    portion: '160g fish fillet + 1.2 cup basmati rice + cucumber salad',
    calories: 510,
    protein: 42,
    carbs: 58,
    fat: 11,
    mealCategory: ['lunch', 'dinner'],
    foodPreference: ['non_vegetarian'],
    allergens: ['seafood'],
    isIndian: true,
    icon: '🐟',
    notes: 'Rich in Omega-3 fatty acids for cardiovascular and joint health.',
  },
  {
    id: 'l-soya-roti-dal',
    name: 'Soya Chunks Curry, 3 Whole Wheat Chapatis & Green Salad',
    portion: '60g dry soya chunks (cooked) + 3 rotis + salad',
    calories: 490,
    protein: 38,
    carbs: 64,
    fat: 8,
    mealCategory: ['lunch', 'dinner'],
    foodPreference: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
    allergens: ['soy', 'gluten'],
    isIndian: true,
    icon: '🥗',
    notes: 'Extremely high plant protein density with near-zero saturated fat.',
  },
  {
    id: 'l-dal-tadka-roti-sabzi',
    name: 'Chana Dal Tadka, 2 Chapatis, Bhindi Masala & Curd',
    portion: '1 bowl chana dal + 2 rotis + 1 cup sabzi + 100g curd',
    calories: 470,
    protein: 22,
    carbs: 68,
    fat: 12,
    mealCategory: ['lunch', 'dinner'],
    foodPreference: ['vegetarian', 'eggetarian', 'non_vegetarian'],
    allergens: ['dairy', 'gluten'],
    isIndian: true,
    icon: '🍛',
    notes: 'High dietary fiber and sustained slow-burning energy.',
  },

  // --- EVENING SNACK ---
  {
    id: 'es-roasted-chana',
    name: 'Roasted Chana (Bengal Gram) with Green Tea',
    portion: '50g roasted chana + 1 cup green tea',
    calories: 185,
    protein: 10,
    carbs: 28,
    fat: 3,
    mealCategory: ['evening_snack'],
    foodPreference: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
    allergens: [],
    isIndian: true,
    icon: '🫘',
    notes: 'Crunchy traditional snack packed with resistant starch and plant protein.',
  },
  {
    id: 'es-makhana',
    name: 'Roasted Fox Nuts (Phool Makhana) in Desi Ghee',
    portion: '35g roasted makhana',
    calories: 140,
    protein: 4,
    carbs: 24,
    fat: 3,
    mealCategory: ['evening_snack'],
    foodPreference: ['vegetarian', 'eggetarian', 'non_vegetarian'],
    allergens: [],
    isIndian: true,
    icon: '🍿',
    notes: 'Light on stomach, rich in magnesium, potassium, and antioxidants.',
  },
  {
    id: 'es-protein-shake',
    name: 'FitLife Protein Shake with Almond Milk & Banana',
    portion: '1 scoop whey / plant protein + 250ml milk + 1/2 banana',
    calories: 240,
    protein: 27,
    carbs: 22,
    fat: 4,
    mealCategory: ['evening_snack', 'morning_snack'],
    foodPreference: ['vegetarian', 'eggetarian', 'non_vegetarian'],
    allergens: ['dairy'],
    isIndian: false,
    icon: '🥤',
    notes: 'Fast-absorbing post-workout recovery shake.',
  },
  {
    id: 'es-sattu-drink',
    name: 'Desi Roasted Chana Sattu Sharbat (Namkeen)',
    portion: '40g sattu in 300ml cold water + roasted jeera & lemon',
    calories: 165,
    protein: 9,
    carbs: 26,
    fat: 2,
    mealCategory: ['evening_snack'],
    foodPreference: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
    allergens: [],
    isIndian: true,
    icon: '🥛',
    notes: 'Natural desi superfood beverage with cooling and gut-energizing properties.',
  },

  // --- DINNER ---
  {
    id: 'd-tandoori-chicken',
    name: 'Tandoori Chicken Tikka with Mint Chutney & 2 Roti',
    portion: '160g chicken tikka + 2 chapatis + green salad',
    calories: 460,
    protein: 44,
    carbs: 38,
    fat: 12,
    mealCategory: ['dinner'],
    foodPreference: ['non_vegetarian'],
    allergens: ['dairy', 'gluten'],
    isIndian: true,
    icon: '🍗',
    notes: 'Marinated in curd and spices, baked without heavy oil. Perfect lean evening protein.',
  },
  {
    id: 'd-palak-paneer',
    name: 'Palak Paneer with 2 Whole Wheat Phulkas & Cucumber',
    portion: '120g paneer in spinach gravy + 2 rotis',
    calories: 450,
    protein: 25,
    carbs: 38,
    fat: 20,
    mealCategory: ['dinner'],
    foodPreference: ['vegetarian', 'eggetarian', 'non_vegetarian'],
    allergens: ['dairy', 'gluten'],
    isIndian: true,
    icon: '🥬',
    notes: 'Rich in iron, calcium, vitamin K, and slow-release casein for overnight muscle repair.',
  },
  {
    id: 'd-egg-curry-rice',
    name: 'Homestyle 3-Egg Curry with 1 Cup Jeera Rice',
    portion: '3 eggs in mild curry + 1 cup rice + salad',
    calories: 480,
    protein: 26,
    carbs: 52,
    fat: 17,
    mealCategory: ['dinner'],
    foodPreference: ['eggetarian', 'non_vegetarian'],
    allergens: ['eggs'],
    isIndian: true,
    icon: '🍛',
    notes: 'Comforting, easily digestible dinner with high nutrient density.',
  },
  {
    id: 'd-tofu-veg-stirfry',
    name: 'Pan-Seared Tofu & Broccoli with Quinoa / Brown Rice',
    portion: '150g firm tofu + 1 cup steamed broccoli + 3/4 cup quinoa',
    calories: 410,
    protein: 28,
    carbs: 42,
    fat: 14,
    mealCategory: ['dinner'],
    foodPreference: ['vegetarian', 'vegan', 'eggetarian', 'non_vegetarian'],
    allergens: ['soy'],
    isIndian: false,
    icon: '🥦',
    notes: 'Low sodium, 100% plant-based lean dinner supporting cardiovascular rest.',
  },
  {
    id: 'd-moong-khichdi',
    name: 'Nutritious Moong Dal Khichdi with 1 Tsp Ghee & Curd',
    portion: '1.5 bowl khichdi + 100g curd + tomato salad',
    calories: 420,
    protein: 18,
    carbs: 64,
    fat: 10,
    mealCategory: ['dinner'],
    foodPreference: ['vegetarian', 'eggetarian', 'non_vegetarian'],
    allergens: ['dairy'],
    isIndian: true,
    icon: '🍲',
    notes: 'Gentle on digestion, promotes restorative deep sleep without nighttime bloating.',
  },
];

/**
 * Filter foods eligible for user preference & allergies
 */
export function getEligibleFoods(
  category: MealCategory,
  preference: FoodPreference,
  allergies: string[] = []
): FoodOption[] {
  const lowerAllergies = allergies.map(a => a.toLowerCase().trim());

  return FOOD_DATABASE.filter(food => {
    // Check category match
    if (!food.mealCategory.includes(category)) return false;

    // Check food preference match
    if (!food.foodPreference.includes(preference)) return false;

    // Check allergy safety
    const hasAllergen = food.allergens.some(al => 
      lowerAllergies.some(userAl => al.toLowerCase().includes(userAl) || userAl.includes(al.toLowerCase()))
    );
    if (hasAllergen) return false;

    return true;
  });
}

/**
 * Generates an initial personalized daily diet plan
 */
export function generatePersonalizedDietPlan(
  profile: Pick<UserProfile, 'foodPreference' | 'allergies' | 'mealsPerDay'>,
  targetCalories: number,
  targetProtein: number
): MealItem[] {
  const { foodPreference, allergies, mealsPerDay } = profile;

  // Determine meal sequence based on user preference (3, 4, 5, or 6 meals)
  let categories: MealCategory[] = ['breakfast', 'lunch', 'dinner'];
  if (mealsPerDay === 4) {
    categories = ['breakfast', 'lunch', 'evening_snack', 'dinner'];
  } else if (mealsPerDay >= 5) {
    categories = ['breakfast', 'morning_snack', 'lunch', 'evening_snack', 'dinner'];
  }

  const generatedMeals: MealItem[] = [];

  for (const cat of categories) {
    const eligible = getEligibleFoods(cat, foodPreference, allergies);
    const chosen = eligible.length > 0 ? eligible[0] : FOOD_DATABASE.find(f => f.mealCategory.includes(cat))!;

    // Find alternatives in the same category
    const alternatives = eligible
      .filter(f => f.id !== chosen.id)
      .slice(0, 4)
      .map(alt => ({
        id: `${alt.id}-alt`,
        name: alt.name,
        portion: alt.portion,
        calories: alt.calories,
        protein: alt.protein,
        carbs: alt.carbs,
        fat: alt.fat,
        category: cat,
        isEaten: false,
        isIndian: alt.isIndian,
        icon: alt.icon,
        notes: alt.notes,
        foodPreference: alt.foodPreference,
      }));

    generatedMeals.push({
      id: `meal-${cat}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: chosen.name,
      portion: chosen.portion,
      calories: chosen.calories,
      protein: chosen.protein,
      carbs: chosen.carbs,
      fat: chosen.fat,
      category: cat,
      isEaten: false,
      isIndian: chosen.isIndian,
      icon: chosen.icon,
      notes: chosen.notes,
      foodPreference: chosen.foodPreference,
      alternatives,
    });
  }

  return generatedMeals;
}
