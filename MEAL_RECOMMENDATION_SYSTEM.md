# HOG-U Intelligent Meal Recommendation System

## Overview
A smart nutrition engine that analyzes your recent Strava activities and biometric data to recommend optimal recovery meals based on scientifically-backed nutritional principles.

## How It Works

### 1. Activity Analysis
When you complete a workout, HOG-U analyzes:
- **Activity Type**: Run, Ride, Swim, CrossFit, etc.
- **Intensity**: Duration, heart rate, elevation gain
- **Biometrics**: Body weight, temperature, rest heart rate
- **Energy Expenditure**: Estimated or actual calories burned

### 2. Nutritional Need Calculation
Based on activity profile, the engine calculates:
- **Carbohydrate Replenishment**: Glycogen depletion based on intensity & duration
- **Protein Requirements**: 1.2-2.0g per kg depending on intensity
- **Electrolyte Needs**: Sodium & potassium for sweat-heavy activities
- **Micronutrient Focus**: Iron, magnesium, potassium for recovery

### 3. Intelligent Meal Matching
The system scores meals across multiple dimensions:
- ✅ Activity type compatibility
- ✅ Nutritional focus areas (glycogen, protein, electrolytes)
- ✅ Macro balance matching
- ✅ Preparation time (prioritizes quick meals for immediate post-workout window)

### 4. Personalized Recommendation
Display includes:
- 📊 Complete macro breakdown with percentages
- 🧂 Key minerals (sodium, potassium, iron, magnesium)
- 🛒 Ingredient list with quantities
- 👨‍🍳 Step-by-step preparation instructions
- ⏱️ Total prep time
- 💡 Scientific reasoning for why this meal is optimal

---

## Example Scenarios

### Scenario 1: High-Intensity Trail Run (75 min)
**What Happened:**
- Heavy carb depletion
- Significant sweat loss → electrolyte deficit
- Muscle micro-tears → protein need
- Heart rate: 160+ bpm

**Recommendation:** 
Chocolate Banana Recovery Smoothie
- 💪 Immediate carb absorption (48g)
- 🥛 Fast protein (25g) for muscle repair
- 🧂 Potassium (520mg) from banana
- ⏱️ 5-minute prep (immediate recovery window)

### Scenario 2: Long Distance Road Bike (120 min)
**What Happened:**
- Very high glycogen depletion
- Moderate intensity → sustained effort
- Lower sweat loss than trail run
- Longer recovery window needed

**Recommendation:**
Whole Wheat Pasta with Marinara & Vegetables
- 🍝 High complex carbs (85g) for glycogen restoration
- 🧪 Extended digestion → sustained energy
- 🥬 Micronutrients from vegetables
- ⏱️ 20-minute prep allows for proper recovery meal

### Scenario 3: CrossFit Workout (45 min, High Intensity)
**What Happened:**
- High intensity → fast electrolyte loss
- Shorter duration → less total calorie deficit
- Strength component → protein priority
- Multiple rep schemes → mixed energy systems

**Recommendation:**
Grilled Chicken with Sweet Potato & Brown Rice
- 💪 Balanced macros (45g protein, 62g carbs)
- 🧂 Sodium + potassium for electrolyte replenishment
- 🌱 Complete amino acid profile
- ⏱️ 30-minute prep for comprehensive recovery

---

## Meal Database

### Categories

**High-Intensity Recovery:**
- Chocolate Banana Recovery Smoothie
- Grilled Chicken with Sweet Potato & Brown Rice

**Endurance Recovery:**
- Whole Wheat Pasta with Marinara & Vegetables

**Electrolyte Replenishment:**
- Coconut Electrolyte Recovery Bowl

**Muscle-Focused:**
- Baked Salmon with Quinoa & Broccoli

**Moderate Intensity:**
- Whole Grain Turkey & Avocado Sandwich

**Quick Post-Workout:**
- Peanut Butter & Banana with Honey

---

## Nutritional Science Behind Recommendations

### Glycogen Replenishment
- Rule: 1.0-1.2g carbs per kg body weight
- Multiplier: Duration & intensity affect total need
- Timing: Within 30-60 minutes post-exercise (24-hour recovery window)

### Protein Synthesis
- Low Intensity: 1.2g/kg
- High Intensity: 2.0g/kg
- Purpose: Muscle fiber repair and growth

### Electrolyte Balance
- **Sodium (Na)**: Sweat losses, fluid retention, muscle function
- **Potassium (K)**: Muscle contraction, cardiac function
- **Threshold**: Recommend if activity is sweat-heavy AND high intensity

### Micronutrient Focus
- **Iron**: Oxygen transport (endurance activities)
- **Magnesium**: Muscle function, energy metabolism
- **Recovery Role**: Supports adaptation and reduces soreness

---

## Integration with Strava

### Automatic Data Pulling
1. User logs in with Strava
2. App fetches latest activity from their Strava feed
3. Engine analyzes activity parameters
4. Recommendation displays in "Meals" tab

### Data Points Used
```
Activity → {
  name: "Trail Run at Forest Park",
  type: "Run",
  duration: 4500 seconds (75 min),
  distance: 12.3 km,
  elevationGain: 450 m,
  averageHeartRate: 165 bpm,
  maxHeartRate: 175 bpm,
  caloriesBurned: 850 (Strava estimate)
}
```

---

## UI/UX Design

### "Meals" Tab Features
- 📊 Priority score (1-10) with urgency indicator
- 💡 AI-generated reasoning explaining recommendation
- 📈 Macro breakdown with percentage contribution
- 🧪 Key mineral profile
- 📋 Full ingredient list with quantities
- 👨‍🍳 Numbered preparation steps
- ⏱️ Prep time estimate
- 🏷️ Recovery focus tags (glycogen, electrolytes, muscle repair, etc.)

### Color Coding
- **#caf300** (Volt Green): Primary accent, carbs, CTA
- **#ffb1c3** (Pink): Protein emphasis
- **#d4a574** (Bronze): Fats
- **#131313** (Dark): Background
- **#c5c9ac** (Tan): Secondary text

---

## Future Enhancements

1. **Custom Biometric Input**
   - User-entered body weight, temperature, rest HR
   - Stored preferences override defaults

2. **Meal History Tracking**
   - Log what you ate after workout
   - Track recovery metrics (soreness, energy, sleep)
   - AI learns your preferences

3. **Recipe Variations**
   - Multiple versions of same meal (quick, gourmet, vegan, etc.)
   - Dietary restriction filters (gluten-free, dairy-free, etc.)

4. **Shopping Integration**
   - Generate shopping list from recommendation
   - Integration with grocery delivery services

5. **Advanced Biometrics**
   - Connect to smartwatch/fitness tracker
   - Real-time body temperature from wearable
   - VO2 max integration

6. **Multi-Tracker Support**
   - Combine data from Apple Watch, Garmin, Fitbit
   - Aggregate nutrition recommendations

---

## Technology Stack

### Services
- `nutritionEngine.ts`: Core algorithm for activity analysis and meal matching
- `stravaAPI.ts`: Strava integration for activity fetching
- `MealRecommendationCard.tsx`: UI component displaying recommendations

### Data Flow
```
Strava Activity → NutritionEngine → Meal Match → UI Display
     ↓
  Activity Object
  (type, duration, HR, etc.)
     ↓
  Needs Calculation
  (carbs, protein, electrolytes)
     ↓
  Algorithm Scoring
  (best meal match)
     ↓
  React Component
  (beautiful UI display)
```

---

## How to Use

1. **Complete a Workout** in Strava
2. **Switch to "Meals" Tab** in HOG-U
3. **View Smart Recommendation**
   - See which meal is recommended and why
   - Review all macros, ingredients, and prep steps
4. **Prepare Your Recovery Meal**
   - Follow numbered instructions
   - Optimize your recovery

---

## Success Metrics

The system is working well if:
✅ Recommendation matches recent activity type
✅ Macros make sense for activity intensity
✅ Prep time is reasonable for post-workout window
✅ Ingredients are accessible and practical
✅ User sees clear reasoning in explanation
✅ Electrolytes are flagged for sweat-heavy activities

---

Generated: May 20, 2026
HOG-U Intelligent Nutrition System v1.0
