/**
 * Nutrition Engine - Intelligent meal recommendations based on activity analysis
 * Analyzes recent activities and biometric data to suggest recovery meals
 */

export interface Activity {
  name: string;
  type: string; // 'Run', 'Ride', 'Swim', 'CrossFit', etc.
  duration: number; // in seconds
  distance: number; // in km
  elevationGain?: number; // in meters
  caloriesBurned?: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  workoutIntensity?: 'low' | 'moderate' | 'high' | 'very_high';
  timestamp?: number;
}

export interface UserBiometrics {
  bodyWeight: number; // kg
  bodyTemperature?: number; // Celsius
  restingHeartRate?: number;
  vo2Max?: number;
}

export interface MealRecommendation {
  id: string;
  name: string;
  description: string;
  prepTime: number; // minutes
  servings: number;
  macros: {
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fats: number; // grams
    fiber?: number;
  };
  micronutrients: {
    sodium?: number; // mg
    potassium?: number; // mg
    iron?: number; // mg
    magnesium?: number; // mg
  };
  ingredients: string[];
  instructions: string[];
  bestFor: string[]; // activity types this meal works well for
  recoveryFocus: string[]; // what this meal helps with ('hydration', 'glycogen', 'muscle_repair', etc.)
}

export interface NutritionPlan {
  recommendation: MealRecommendation;
  reasoning: string;
  recoveryPhase: 'immediate' | 'short_term' | 'extended'; // timing of meal
  priority: number; // 1-10, higher = more important
}

// Meal Database
const mealDatabase: MealRecommendation[] = [
  // HIGH-INTENSITY RECOVERY
  {
    id: 'chocolate_banana_smoothie',
    name: 'Chocolate Banana Recovery Smoothie',
    description: 'Fast-absorbing carbs and protein blend for post-intense workout recovery',
    prepTime: 5,
    servings: 1,
    macros: {
      calories: 350,
      protein: 25,
      carbs: 48,
      fats: 8,
      fiber: 3,
    },
    micronutrients: {
      potassium: 520,
      magnesium: 45,
      iron: 2.1,
    },
    ingredients: [
      '1 ripe banana',
      '1 scoop chocolate protein powder',
      '1 cup almond milk',
      '1 tbsp almond butter',
      '1 tbsp cocoa powder',
      'Ice cubes',
    ],
    instructions: [
      'Add milk to blender',
      'Add banana and break into chunks',
      'Add protein powder, almond butter, and cocoa',
      'Blend until smooth',
      'Add ice if desired',
      'Serve immediately',
    ],
    bestFor: ['Run', 'CrossFit', 'Swim'],
    recoveryFocus: ['glycogen_replenishment', 'muscle_repair', 'fast_carbs'],
  },

  {
    id: 'grilled_chicken_rice',
    name: 'Grilled Chicken with Sweet Potato & Brown Rice',
    description: 'Complete meal with lean protein, complex carbs, and micronutrients for glycogen and muscle recovery',
    prepTime: 30,
    servings: 2,
    macros: {
      calories: 520,
      protein: 45,
      carbs: 62,
      fats: 6,
      fiber: 7,
    },
    micronutrients: {
      potassium: 890,
      iron: 3.2,
      magnesium: 78,
      sodium: 420,
    },
    ingredients: [
      '200g grilled chicken breast',
      '1 medium sweet potato',
      '0.5 cup cooked brown rice',
      'Olive oil spray',
      'Sea salt & pepper',
      'Fresh herbs (rosemary, thyme)',
    ],
    instructions: [
      'Season chicken breast with salt, pepper, and herbs',
      'Grill for 6-7 minutes per side until cooked through',
      'Bake sweet potato at 200°C for 20 minutes',
      'Cook brown rice according to package directions',
      'Plate and serve warm',
    ],
    bestFor: ['Run', 'Ride', 'CrossFit', 'Swim'],
    recoveryFocus: ['muscle_repair', 'glycogen_replenishment', 'micronutrients', 'sustained_energy'],
  },

  // ENDURANCE RECOVERY
  {
    id: 'pasta_marinara_veggies',
    name: 'Whole Wheat Pasta with Marinara & Vegetables',
    description: 'High-carb meal ideal for endurance athletes to restore glycogen stores',
    prepTime: 20,
    servings: 2,
    macros: {
      calories: 480,
      protein: 18,
      carbs: 85,
      fats: 5,
      fiber: 12,
    },
    micronutrients: {
      potassium: 650,
      iron: 4.1,
      magnesium: 92,
      sodium: 340,
    },
    ingredients: [
      '150g whole wheat pasta',
      '300g marinara sauce',
      '1 cup mixed vegetables (zucchini, bell peppers, spinach)',
      '2 cloves garlic',
      'Parmesan cheese (optional)',
      'Olive oil',
    ],
    instructions: [
      'Cook pasta according to package directions',
      'Sauté vegetables with garlic in olive oil',
      'Mix in marinara sauce and simmer for 5 minutes',
      'Drain pasta and combine with sauce',
      'Top with Parmesan if desired',
      'Serve immediately',
    ],
    bestFor: ['Run', 'Ride', 'Swim'],
    recoveryFocus: ['glycogen_replenishment', 'micronutrients', 'sustained_carbs'],
  },

  // ELECTROLYTE RECOVERY
  {
    id: 'coconut_electrolyte_bowl',
    name: 'Coconut Electrolyte Recovery Bowl',
    description: 'High sodium and potassium content for electrolyte replenishment after sweat-heavy activities',
    prepTime: 10,
    servings: 1,
    macros: {
      calories: 320,
      protein: 12,
      carbs: 42,
      fats: 12,
      fiber: 6,
    },
    micronutrients: {
      sodium: 520,
      potassium: 780,
      magnesium: 68,
      iron: 2.8,
    },
    ingredients: [
      '1 cup plain Greek yogurt',
      '0.5 cup coconut water',
      '0.5 cup granola',
      '1 banana (sliced)',
      '2 tbsp coconut flakes',
      '1 tbsp honey',
      'Pinch of sea salt',
    ],
    instructions: [
      'Pour Greek yogurt into bowl',
      'Add coconut water to yogurt and stir',
      'Top with granola',
      'Arrange banana slices',
      'Sprinkle coconut flakes',
      'Drizzle honey and add sea salt',
      'Mix before eating',
    ],
    bestFor: ['Run', 'CrossFit', 'Outdoor activities'],
    recoveryFocus: ['electrolyte_replenishment', 'hydration', 'glycogen_replenishment', 'probiotics'],
  },

  // MUSCLE-FOCUSED
  {
    id: 'salmon_quinoa',
    name: 'Baked Salmon with Quinoa & Broccoli',
    description: 'Omega-3 rich meal for muscle recovery and inflammation reduction',
    prepTime: 25,
    servings: 2,
    macros: {
      calories: 550,
      protein: 42,
      carbs: 54,
      fats: 14,
      fiber: 8,
    },
    micronutrients: {
      potassium: 920,
      iron: 3.7,
      magnesium: 110,
      sodium: 380,
    },
    ingredients: [
      '180g salmon fillet',
      '0.75 cup cooked quinoa',
      '2 cups broccoli florets',
      'Lemon juice',
      'Olive oil',
      'Sea salt & pepper',
    ],
    instructions: [
      'Preheat oven to 190°C',
      'Season salmon with lemon, salt, pepper',
      'Bake salmon for 12-15 minutes',
      'Steam broccoli for 5-7 minutes',
      'Cook quinoa according to package',
      'Plate and serve',
    ],
    bestFor: ['CrossFit', 'Strength training', 'Swim'],
    recoveryFocus: ['muscle_repair', 'inflammation_reduction', 'omega3s', 'micronutrients'],
  },

  // MODERATE INTENSITY
  {
    id: 'turkey_sandwich',
    name: 'Whole Grain Turkey & Avocado Sandwich',
    description: 'Balanced meal for moderate-intensity recovery with sustained energy',
    prepTime: 8,
    servings: 1,
    macros: {
      calories: 420,
      protein: 28,
      carbs: 38,
      fats: 14,
      fiber: 6,
    },
    micronutrients: {
      potassium: 540,
      iron: 2.4,
      magnesium: 54,
      sodium: 480,
    },
    ingredients: [
      '2 slices whole grain bread',
      '100g sliced turkey breast',
      '0.5 avocado',
      '1 slice tomato',
      'Lettuce leaf',
      'Mustard or hummus',
    ],
    instructions: [
      'Toast whole grain bread if desired',
      'Spread mustard or hummus on bread',
      'Layer turkey, avocado, tomato, lettuce',
      'Add second slice of bread',
      'Cut diagonally and serve',
    ],
    bestFor: ['Run', 'Ride', 'Light workout'],
    recoveryFocus: ['balanced_nutrition', 'protein_synthesis', 'sustained_energy'],
  },

  // QUICK POST-WORKOUT
  {
    id: 'peanut_butter_banana',
    name: 'Peanut Butter & Banana with Honey',
    description: 'Quick carb and protein combo for immediate post-workout window',
    prepTime: 3,
    servings: 1,
    macros: {
      calories: 310,
      protein: 12,
      carbs: 38,
      fats: 12,
      fiber: 4,
    },
    micronutrients: {
      potassium: 450,
      magnesium: 42,
      iron: 1.2,
    },
    ingredients: [
      '2 tbsp natural peanut butter',
      '1 large banana',
      '1 tbsp honey',
      'Pinch of cinnamon',
    ],
    instructions: [
      'Slice banana lengthwise',
      'Spread peanut butter on banana pieces',
      'Drizzle honey',
      'Sprinkle cinnamon',
      'Eat immediately',
    ],
    bestFor: ['Run', 'Bike', 'CrossFit'],
    recoveryFocus: ['quick_carbs', 'protein', 'immediate_energy'],
  },
];

class NutritionEngine {
  /**
   * Analyze activity and recommend meal
   */
  analyzActivityAndRecommend(
    activity: Activity,
    biometrics: UserBiometrics
  ): NutritionPlan {
    // Calculate activity intensity if not provided
    const intensity = this.calculateIntensity(activity);

    // Determine nutritional needs
    const needs = this.determineNutritionalNeeds(activity, intensity, biometrics);

    // Find best matching meal
    const bestMeal = this.findBestMeal(activity, needs, intensity);

    // Generate reasoning
    const reasoning = this.generateReasoning(activity, needs, bestMeal);

    return {
      recommendation: bestMeal,
      reasoning,
      recoveryPhase: this.determineRecoveryPhase(activity),
      priority: this.calculatePriority(activity, intensity),
    };
  }

  /**
   * Calculate activity intensity (1-10 scale)
   */
  private calculateIntensity(activity: Activity): number {
    if (activity.workoutIntensity) {
      const intensityMap = {
        low: 3,
        moderate: 5,
        high: 7,
        very_high: 9,
      };
      return intensityMap[activity.workoutIntensity];
    }

    // Estimate from heart rate or duration
    const durationMinutes = activity.duration / 60;
    let intensity = 5;

    if (activity.averageHeartRate) {
      // Rough estimate: >160 = high, >140 = moderate, <120 = low
      if (activity.averageHeartRate > 160) intensity = 8;
      else if (activity.averageHeartRate > 140) intensity = 6;
      else if (activity.averageHeartRate > 120) intensity = 5;
      else intensity = 3;
    } else if (durationMinutes > 90) {
      intensity = 7; // Long endurance
    }

    return Math.min(10, Math.max(1, intensity));
  }

  /**
   * Determine nutritional needs based on activity
   */
  private determineNutritionalNeeds(
    activity: Activity,
    intensity: number,
    biometrics: UserBiometrics
  ) {
    const durationHours = activity.duration / 3600;
    const caloriesNeeded = activity.caloriesBurned || this.estimateCalories(activity, biometrics);

    return {
      carbs: this.calculateCarbNeeds(intensity, durationHours, caloriesNeeded),
      protein: this.calculateProteinNeeds(intensity, biometrics.bodyWeight),
      electrolytes: this.calculateElectrolyteNeeds(activity, intensity),
      focus: this.determineFocus(activity),
    };
  }

  /**
   * Estimate calories burned if not provided
   */
  private estimateCalories(activity: Activity, biometrics: UserBiometrics): number {
    const durationMinutes = activity.duration / 60;

    // Basic MET (Metabolic Equivalent) calculation
    const metValues: Record<string, number> = {
      Run: 11.5,
      Ride: 10,
      Swim: 11,
      CrossFit: 9,
      Walk: 3.5,
      Hike: 6,
    };

    const met = metValues[activity.type] || 7;
    const calories = (met * biometrics.bodyWeight * durationMinutes) / 60;

    return Math.round(calories);
  }

  /**
   * Calculate carb replenishment needs (grams)
   */
  private calculateCarbNeeds(intensity: number, durationHours: number, caloriesBurned: number): number {
    // Higher intensity and longer duration = more carbs needed
    // General rule: 1.0-1.2g per kg body weight for glycogen replenishment
    const baseCarbs = caloriesBurned * 0.5; // ~50% of calories from carbs
    const intensityFactor = intensity / 5; // 1.0 = moderate, 1.8 = very high
    const durationFactor = Math.min(durationHours / 1.5, 1.5); // Cap at 1.5x

    return Math.round(baseCarbs * intensityFactor * durationFactor);
  }

  /**
   * Calculate protein needs (grams)
   */
  private calculateProteinNeeds(intensity: number, bodyWeight: number): number {
    // 1.2-2.0g per kg depending on intensity
    const minProtein = 1.2;
    const maxProtein = 2.0;
    const proteinPerKg = minProtein + (intensity / 10) * (maxProtein - minProtein);

    return Math.round(proteinPerKg * bodyWeight);
  }

  /**
   * Calculate electrolyte needs (high sweat loss activities)
   */
  private calculateElectrolyteNeeds(activity: Activity, intensity: number): boolean {
    // High electrolyte needs for: hot weather runs, high-intensity sweat-heavy activities
    const sweatHeavyActivities = ['Run', 'CrossFit', 'Spin', 'HIIT'];
    const highIntensity = intensity > 7;
    const isSweatHeavy = sweatHeavyActivities.includes(activity.type);

    return isSweatHeavy && highIntensity;
  }

  /**
   * Determine focus area based on activity type
   */
  private determineFocus(activity: Activity): string[] {
    const focusMap: Record<string, string[]> = {
      Run: ['glycogen_replenishment', 'electrolyte_balance'],
      Ride: ['glycogen_replenishment', 'muscle_recovery'],
      Swim: ['muscle_repair', 'glycogen_replenishment'],
      CrossFit: ['muscle_repair', 'glycogen_replenishment', 'electrolyte_balance'],
      Strength: ['muscle_repair', 'protein_synthesis'],
      HIIT: ['electrolyte_balance', 'glycogen_replenishment', 'quick_recovery'],
    };

    return focusMap[activity.type] || ['balanced_recovery'];
  }

  /**
   * Find best meal match
   */
  private findBestMeal(
    activity: Activity,
    needs: any,
    intensity: number
  ): MealRecommendation {
    let bestMeal = mealDatabase[0];
    let bestScore = -Infinity;

    mealDatabase.forEach((meal) => {
      let score = 0;

      // Activity type match
      if (meal.bestFor.includes(activity.type)) {
        score += 30;
      }

      // Focus area match
      const mealFocus = meal.recoveryFocus.join(',');
      needs.focus.forEach((focus: string) => {
        if (mealFocus.includes(focus)) {
          score += 20;
        }
      });

      // Carb match (for high-intensity)
      if (intensity > 7 && meal.macros.carbs > 50) {
        score += 15;
      }

      // Electrolyte check
      if (needs.electrolytes && meal.micronutrients.sodium && meal.micronutrients.sodium > 400) {
        score += 20;
      }

      // Protein match
      if (Math.abs(meal.macros.protein - needs.protein) < 15) {
        score += 10;
      }

      // Prep time (prefer quick meals for immediate recovery)
      if (meal.prepTime < 15) {
        score += 5;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMeal = meal;
      }
    });

    return bestMeal;
  }

  /**
   * Generate human-readable reasoning
   */
  private generateReasoning(activity: Activity, needs: any, meal: MealRecommendation): string {
    const durationMinutes = activity.duration / 60;
    let reason = `Based on your ${activity.type} (${durationMinutes.toFixed(0)}min): `;

    if (needs.focus.includes('glycogen_replenishment')) {
      reason += `You depleted glycogen stores and need ${needs.carbs}g of carbs. `;
    }

    if (needs.focus.includes('muscle_repair')) {
      reason += `Your muscles need ${needs.protein}g of protein for recovery. `;
    }

    if (needs.electrolytes) {
      reason += `High sweat loss detected - replenishing with electrolytes. `;
    }

    reason += `${meal.name} provides the perfect balance of nutrients your body needs right now.`;

    return reason;
  }

  /**
   * Determine recovery phase timing
   */
  private determineRecoveryPhase(activity: Activity): 'immediate' | 'short_term' | 'extended' {
    const durationMinutes = activity.duration / 60;

    if (durationMinutes < 30) {
      return 'short_term';
    } else if (durationMinutes < 90) {
      return 'immediate';
    } else {
      return 'extended';
    }
  }

  /**
   * Calculate priority (1-10)
   */
  private calculatePriority(activity: Activity, intensity: number): number {
    const durationMinutes = activity.duration / 60;
    let priority = Math.max(intensity, durationMinutes / 15);

    return Math.min(10, Math.round(priority));
  }

  /**
   * Get all available meals
   */
  getMealDatabase(): MealRecommendation[] {
    return mealDatabase;
  }
}

export default new NutritionEngine();
