import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import nutritionEngine, { Activity, UserBiometrics, NutritionPlan } from '@/app/services/nutritionEngine';
import StravaAPI from '@/app/services/stravaAPI';

interface MealRecommendationScreenProps {
  activity?: Activity;
  biometrics?: UserBiometrics;
}

export function MealRecommendationCard({ activity, biometrics }: MealRecommendationScreenProps) {
  const [recommendation, setRecommendation] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastActivity, setLastActivity] = useState<Activity | null>(activity || null);

  useEffect(() => {
    if (activity) {
      generateRecommendation(activity);
    } else {
      // Fetch latest activity from Strava
      fetchLatestActivity();
    }
  }, [activity]);

  const fetchLatestActivity = async () => {
    try {
      setLoading(true);

      // Try to get latest activity from Strava
      const strava = new StravaAPI();
      const activities = await strava.getActivities(1, 1);

      if (activities && activities.length > 0) {
        const stravaActivity = activities[0];

        // Convert Strava activity to our Activity format
        const activity: Activity = {
          name: stravaActivity.name,
          type: stravaActivity.type,
          duration: stravaActivity.moving_time || 0,
          distance: (stravaActivity.distance || 0) / 1000, // Convert to km
          elevationGain: stravaActivity.total_elevation_gain,
          caloriesBurned: stravaActivity.calories,
          averageHeartRate: stravaActivity.average_heartrate,
          maxHeartRate: stravaActivity.max_heartrate,
          timestamp: new Date(stravaActivity.start_date).getTime(),
        };

        setLastActivity(activity);
        generateRecommendation(activity);
      }
    } catch (error) {
      console.error('[Nutrition] Error fetching latest activity:', error);
      Alert.alert('Activity Fetch Error', 'Could not fetch latest activity. Please connect to Strava first.');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendation = (activity: Activity) => {
    try {
      // Default biometrics if not provided
      const defaultBiometrics: UserBiometrics = biometrics || {
        bodyWeight: 75, // Default 75kg
        bodyTemperature: 37,
        restingHeartRate: 60,
      };

      const plan = nutritionEngine.analyzActivityAndRecommend(activity, defaultBiometrics);
      setRecommendation(plan);
    } catch (error) {
      console.error('[Nutrition] Error generating recommendation:', error);
      Alert.alert('Recommendation Error', 'Could not generate meal recommendation');
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['rgba(202, 243, 0, 0.1)', 'rgba(19, 19, 19, 1)']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}
      >
        <ActivityIndicator size="large" color="#caf300" />
      </LinearGradient>
    );
  }

  if (!recommendation || !lastActivity) {
    return (
      <LinearGradient
        colors={['rgba(202, 243, 0, 0.1)', 'rgba(19, 19, 19, 1)']}
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}
      >
        <View style={{ alignItems: 'center', gap: 15 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#caf300' }}>🍽️</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>No Recent Activity</Text>
          <Text style={{ fontSize: 14, color: '#c5c9ac', textAlign: 'center' }}>
            Complete a workout first, then we'll recommend the perfect recovery meal.
          </Text>
        </View>
      </LinearGradient>
    );
  }

  const { recommendation: meal, reasoning, priority } = recommendation;
  const macroPercentages = {
    protein: Math.round((meal.macros.protein * 4) / meal.macros.calories * 100),
    carbs: Math.round((meal.macros.carbs * 4) / meal.macros.calories * 100),
    fats: Math.round((meal.macros.fats * 9) / meal.macros.calories * 100),
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#131313' }}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* Header */}
      <LinearGradient
        colors={['rgba(202, 243, 0, 0.2)', 'rgba(19, 19, 19, 0.5)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingVertical: 24,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(202, 243, 0, 0.2)',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#caf300', letterSpacing: 1, marginBottom: 8 }}>
          SMART NUTRITION
        </Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#ffffff', marginBottom: 8 }}>
          Recovery Meal
        </Text>
        <Text style={{ fontSize: 13, color: '#c5c9ac', lineHeight: 19 }}>
          Based on your {lastActivity.type} ({Math.round(lastActivity.duration / 60)} min)
        </Text>
      </LinearGradient>

      {/* Recommendation Card */}
      <View style={{ padding: 20, gap: 20 }}>
        {/* Priority Badge */}
        <View
          style={{
            backgroundColor: 'rgba(202, 243, 0, 0.1)',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(202, 243, 0, 0.3)',
            paddingHorizontal: 12,
            paddingVertical: 8,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#caf300' }}>
            🎯 PRIORITY: {priority}/10 {priority > 7 ? '(HIGH)' : priority > 4 ? '(MEDIUM)' : '(LOW)'}
          </Text>
        </View>

        {/* Meal Name & Description */}
        <View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#ffffff', marginBottom: 8 }}>
            {meal.name}
          </Text>
          <Text style={{ fontSize: 14, color: '#c5c9ac', lineHeight: 20 }}>
            {meal.description}
          </Text>
        </View>

        {/* Reasoning */}
        <View
          style={{
            backgroundColor: 'rgba(202, 243, 0, 0.08)',
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: '#caf300',
            paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        >
          <Text style={{ fontSize: 12, color: '#c5c9ac', lineHeight: 18, fontStyle: 'italic' }}>
            💡 {reasoning}
          </Text>
        </View>

        {/* Macro Breakdown */}
        <View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#caf300', marginBottom: 12, letterSpacing: 0.5 }}>
            MACRO BREAKDOWN
          </Text>

          {/* Calories */}
          <View style={{ backgroundColor: 'rgba(32, 32, 31, 0.7)', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: '#c5c9ac', marginBottom: 4 }}>Total Calories</Text>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#caf300' }}>
              {meal.macros.calories} kcal
            </Text>
          </View>

          {/* Macros Grid */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            {/* Protein */}
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(32, 32, 31, 0.7)',
                borderRadius: 8,
                padding: 12,
                borderTopWidth: 2,
                borderTopColor: '#ffb1c3',
              }}
            >
              <Text style={{ fontSize: 11, color: '#c5c9ac', marginBottom: 4 }}>Protein</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffb1c3' }}>
                {meal.macros.protein}g
              </Text>
              <Text style={{ fontSize: 10, color: '#c5c9ac', marginTop: 4 }}>
                {macroPercentages.protein}% cal
              </Text>
            </View>

            {/* Carbs */}
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(32, 32, 31, 0.7)',
                borderRadius: 8,
                padding: 12,
                borderTopWidth: 2,
                borderTopColor: '#caf300',
              }}
            >
              <Text style={{ fontSize: 11, color: '#c5c9ac', marginBottom: 4 }}>Carbs</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#caf300' }}>
                {meal.macros.carbs}g
              </Text>
              <Text style={{ fontSize: 10, color: '#c5c9ac', marginTop: 4 }}>
                {macroPercentages.carbs}% cal
              </Text>
            </View>

            {/* Fats */}
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(32, 32, 31, 0.7)',
                borderRadius: 8,
                padding: 12,
                borderTopWidth: 2,
                borderTopColor: '#d4a574',
              }}
            >
              <Text style={{ fontSize: 11, color: '#c5c9ac', marginBottom: 4 }}>Fats</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#d4a574' }}>
                {meal.macros.fats}g
              </Text>
              <Text style={{ fontSize: 10, color: '#c5c9ac', marginTop: 4 }}>
                {macroPercentages.fats}% cal
              </Text>
            </View>
          </View>

          {/* Fiber if available */}
          {meal.macros.fiber && (
            <View style={{ backgroundColor: 'rgba(32, 32, 31, 0.7)', borderRadius: 8, padding: 12 }}>
              <Text style={{ fontSize: 11, color: '#c5c9ac', marginBottom: 4 }}>Fiber</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#c5c9ac' }}>
                {meal.macros.fiber}g
              </Text>
            </View>
          )}
        </View>

        {/* Micronutrients */}
        {Object.keys(meal.micronutrients).length > 0 && (
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#caf300', marginBottom: 12, letterSpacing: 0.5 }}>
              KEY MINERALS
            </Text>

            <View style={{ backgroundColor: 'rgba(32, 32, 31, 0.7)', borderRadius: 8, padding: 14, gap: 10 }}>
              {meal.micronutrients.sodium && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#c5c9ac' }}>Sodium</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#caf300' }}>
                    {meal.micronutrients.sodium}mg
                  </Text>
                </View>
              )}
              {meal.micronutrients.potassium && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#c5c9ac' }}>Potassium</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#caf300' }}>
                    {meal.micronutrients.potassium}mg
                  </Text>
                </View>
              )}
              {meal.micronutrients.iron && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#c5c9ac' }}>Iron</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#caf300' }}>
                    {meal.micronutrients.iron}mg
                  </Text>
                </View>
              )}
              {meal.micronutrients.magnesium && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#c5c9ac' }}>Magnesium</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#caf300' }}>
                    {meal.micronutrients.magnesium}mg
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Ingredients */}
        <View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#caf300', marginBottom: 10, letterSpacing: 0.5 }}>
            INGREDIENTS ({meal.servings} {meal.servings === 1 ? 'serving' : 'servings'})
          </Text>
          <View style={{ backgroundColor: 'rgba(32, 32, 31, 0.7)', borderRadius: 8, padding: 14, gap: 8 }}>
            {meal.ingredients.map((ingredient, idx) => (
              <View key={idx} style={{ flexDirection: 'row' }}>
                <Text style={{ fontSize: 12, color: '#caf300', marginRight: 10 }}>✓</Text>
                <Text style={{ fontSize: 12, color: '#c5c9ac', flex: 1 }}>{ingredient}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Instructions */}
        <View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#caf300', marginBottom: 10, letterSpacing: 0.5 }}>
            PREP TIME: {meal.prepTime} MIN
          </Text>
          <View style={{ backgroundColor: 'rgba(32, 32, 31, 0.7)', borderRadius: 8, overflow: 'hidden' }}>
            {meal.instructions.map((instruction, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  padding: 12,
                  borderBottomWidth: idx < meal.instructions.length - 1 ? 1 : 0,
                  borderBottomColor: 'rgba(68, 73, 50, 0.3)',
                }}
              >
                <View
                  style={{
                    backgroundColor: '#caf300',
                    borderRadius: 12,
                    width: 24,
                    height: 24,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: '#131313' }}>
                    {idx + 1}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#c5c9ac', flex: 1, lineHeight: 18 }}>
                  {instruction}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recovery Focus */}
        {meal.recoveryFocus.length > 0 && (
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#caf300', marginBottom: 10, letterSpacing: 0.5 }}>
              RECOVERY FOCUS
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {meal.recoveryFocus.map((focus, idx) => (
                <View
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(202, 243, 0, 0.15)',
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(202, 243, 0, 0.3)',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#caf300' }}>
                    {focus.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

export default MealRecommendationCard;
