import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { API_BASE, apiFetch } from '../../config';

interface AIMeal {
  name: string;
  category: string;
  diet?: string;
  type: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  description: string;
  ingredients: string;
  instructions: string;
}

interface AIMealResponse {
  meals: AIMeal[];
  workoutsAnalyzed?: number;
  totalCaloriesBurned?: number;
}

export default function MealsScreen() {
  const [aiMeals, setAiMeals] = useState<AIMeal[]>([]);
  const [mealsMeta, setMealsMeta] = useState<{ workoutsAnalyzed?: number; totalCaloriesBurned?: number }>({});
  const [selectedMealIdx, setSelectedMealIdx] = useState(0);
  const [loadingMeal, setLoadingMeal] = useState(false);
  const [mealError, setMealError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('BULK');
  const [diet, setDiet] = useState<string>('BOTH');

  const getMealRecommendation = async () => {
    setLoadingMeal(true);
    setMealError(null);
    setAiMeals([]);
    setMealsMeta({});
    setSelectedMealIdx(0);
    try {
      const email = await SecureStore.getItemAsync('hogu.user_email');
      if (!email) {
        setMealError('Not logged in. Go to Home and sign in.');
        return;
      }

      console.log('[Meals] Requesting AI meal for:', email, 'category:', category, 'diet:', diet);
      const res = await apiFetch(`${API_BASE}/api/ai-meal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, category, diet }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      const response = data as AIMealResponse;
      const meals = response.meals || [];
      if (meals.length === 0) {
        throw new Error('No meal options returned. Try again.');
      }

      console.log(`[Meals] ✅ ${meals.length} AI meals received`);
      setAiMeals(meals);
      setMealsMeta({
        workoutsAnalyzed: response.workoutsAnalyzed,
        totalCaloriesBurned: response.totalCaloriesBurned,
      });
    } catch (e: any) {
      console.error('[Meals] ❌ AI meal error:', e.message);
      setMealError(e.message || 'Failed to get AI recommendation');
    } finally {
      setLoadingMeal(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#131313', paddingVertical: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#caf300', marginBottom: 4 }}>
            What&apos;s Cooking
          </Text>
          <Text style={{ fontSize: 14, color: '#c5c9ac' }}>
            AI meals tailored to your synced workouts
          </Text>
        </View>

      <View style={{ paddingHorizontal: 20 }}>
        {/* Category Selector */}
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#c5c9ac', marginBottom: 8, letterSpacing: 0.5 }}>NUTRITION GOAL</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {['BULK', 'SHRED', 'CUT', 'ENDURANCE'].map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: category === cat ? '#caf300' : '#2a2a2a',
                borderWidth: 1, borderColor: category === cat ? '#caf300' : '#444',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: category === cat ? '#131313' : '#c5c9ac' }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Diet Preference Selector */}
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#c5c9ac', marginBottom: 8, letterSpacing: 0.5 }}>DIET PREFERENCE</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            { key: 'BOTH', label: 'BOTH' },
            { key: 'VEG', label: 'VEG' },
            { key: 'NONVEG', label: 'NON-VEG' },
          ].map((d) => (
            <TouchableOpacity
              key={d.key}
              onPress={() => setDiet(d.key)}
              style={{
                flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center',
                backgroundColor: diet === d.key ? '#caf300' : '#2a2a2a',
                borderWidth: 1, borderColor: diet === d.key ? '#caf300' : '#444',
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: diet === d.key ? '#131313' : '#c5c9ac' }}>{d.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meal Recommendation Button */}
        <TouchableOpacity
          onPress={getMealRecommendation}
          disabled={loadingMeal}
          style={{ backgroundColor: loadingMeal ? '#8a9e00' : '#caf300', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 20 }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#131313', letterSpacing: 0.5 }}>
            {loadingMeal ? 'COOKING SOMETHING UP...' : "Let's see what's cooking !"}
          </Text>
        </TouchableOpacity>

        {/* AI Meal Results */}
        {loadingMeal && <ActivityIndicator color="#caf300" style={{ marginBottom: 20 }} />}
        {mealError && (
          <View style={{ backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: 8, padding: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#ff6b6b' }}>
            <Text style={{ fontSize: 12, color: '#ff6b6b' }}>{mealError}</Text>
          </View>
        )}
        {aiMeals.length > 0 && (
          <View style={{ marginBottom: 40 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 4 }}>Your Meal Options</Text>
            <Text style={{ fontSize: 11, color: '#888', marginBottom: 16 }}>
              {aiMeals.length} personalized options
              {mealsMeta.workoutsAnalyzed ? ` • ${mealsMeta.workoutsAnalyzed} workouts analyzed` : ''}
              {mealsMeta.totalCaloriesBurned ? ` • ${mealsMeta.totalCaloriesBurned} kcal burned` : ''}
            </Text>

            {/* Meal option selector tabs */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {aiMeals.map((m, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setSelectedMealIdx(idx)}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center',
                    backgroundColor: selectedMealIdx === idx ? '#caf300' : '#2a2a2a',
                    borderWidth: 1, borderColor: selectedMealIdx === idx ? '#caf300' : '#444',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '800', color: selectedMealIdx === idx ? '#131313' : '#c5c9ac' }}>
                    OPT {idx + 1}
                  </Text>
                  <Text style={{ fontSize: 9, color: selectedMealIdx === idx ? '#1a1a1a' : '#888', marginTop: 2 }} numberOfLines={1}>
                    {m.type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selected meal card */}
            {(() => {
              const meal = aiMeals[selectedMealIdx];
              if (!meal) return null;
              return (
                <View style={{ backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: '#caf300' }}>
                  {/* Diet label */}
                  <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                    <View style={{
                      backgroundColor: meal.diet === 'NONVEG' ? 'rgba(255,107,107,0.15)' : 'rgba(122,196,76,0.15)',
                      borderWidth: 1, borderColor: meal.diet === 'NONVEG' ? '#ff6b6b' : '#7ac44c',
                      borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
                    }}>
                      <Text style={{ fontSize: 10, fontWeight: '800', color: meal.diet === 'NONVEG' ? '#ff6b6b' : '#7ac44c', letterSpacing: 0.5 }}>
                        {meal.diet === 'NONVEG' ? 'NON-VEG' : 'VEG'}
                      </Text>
                    </View>
                  </View>

                  {/* Meal name + meta */}
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#caf300', marginBottom: 4 }}>{meal.name}</Text>
                  <Text style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>
                    {meal.type} • {meal.category}
                  </Text>

                  {/* Description */}
                  <Text style={{ fontSize: 13, color: '#c5c9ac', lineHeight: 20, marginBottom: 16 }}>{meal.description}</Text>

                  {/* Macros */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#1a1a1a', borderRadius: 8, paddingVertical: 12, marginBottom: 16 }}>
                    <MacroBadge label="Calories" value={meal.calories} color="#caf300" />
                    <MacroBadge label="Protein" value={`${meal.proteinGrams}g`} color="#ffb1c3" />
                    <MacroBadge label="Carbs" value={`${meal.carbsGrams}g`} color="#4285f4" />
                    <MacroBadge label="Fat" value={`${meal.fatsGrams}g`} color="#d4a574" />
                  </View>

                  {/* Ingredients */}
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff', marginBottom: 6 }}>Ingredients</Text>
                  <Text style={{ fontSize: 12, color: '#c5c9ac', lineHeight: 20, marginBottom: 16 }}>{meal.ingredients}</Text>

                  {/* Instructions */}
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff', marginBottom: 6 }}>Instructions</Text>
                  <Text style={{ fontSize: 12, color: '#c5c9ac', lineHeight: 20 }}>{meal.instructions}</Text>
                </View>
              );
            })()}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function MacroBadge({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 14, fontWeight: '700', color }}>{value}</Text>
      <Text style={{ fontSize: 9, color: '#888' }}>{label}</Text>
    </View>
  );
}
