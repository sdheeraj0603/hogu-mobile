import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

function getApiBase(): string {
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || '';
  const ip = debuggerHost.split(':')[0];
  if (ip) return `http://${ip}:5000`;
  return 'http://192.168.1.6:5000';
}

const API_BASE = getApiBase();

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

interface UnifiedWorkout {
  id: string;
  source: string;
  type: string;
  name: string;
  startDate: string;
  duration: number;
  distance?: number;
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  elevationGain?: number;
  avgSpeed?: number;
}

export default function TestingScreen() {
  const [selectedWorkout, setSelectedWorkout] = useState<UnifiedWorkout | null>(null);
  const [workouts, setWorkouts] = useState<UnifiedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiMeals, setAiMeals] = useState<AIMeal[]>([]);
  const [mealsMeta, setMealsMeta] = useState<{ workoutsAnalyzed?: number; totalCaloriesBurned?: number }>({});
  const [selectedMealIdx, setSelectedMealIdx] = useState(0);
  const [loadingMeal, setLoadingMeal] = useState(false);
  const [mealError, setMealError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>('BULK');
  const [diet, setDiet] = useState<string>('BOTH');

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    setLoading(true);
    setError(null);
    try {
      const email = await SecureStore.getItemAsync('hogu.user_email');
      if (!email) {
        setError('Not logged in. Go to Home and sign in.');
        setLoading(false);
        return;
      }

      console.log('[Testing] Fetching workouts from backend for:', email);
      const res = await fetch(`${API_BASE}/api/workouts?email=${encodeURIComponent(email)}&limit=20`);
      
      if (!res.ok) {
        throw new Error(`Backend error: ${res.status}`);
      }

      const data = await res.json();
      const wkts: UnifiedWorkout[] = (data.workouts || []).map((w: any) => ({
        id: w.id || `${w.source}_${w.startDate}`,
        source: w.source || 'unknown',
        type: w.type || 'Unknown',
        name: w.name || w.type || 'Workout',
        startDate: w.startDate,
        duration: w.duration || 0,
        distance: w.distance,
        calories: w.calories,
        avgHeartRate: w.avgHeartRate,
        maxHeartRate: w.maxHeartRate,
        elevationGain: w.elevationGain,
        avgSpeed: w.avgSpeed,
      }));

      console.log(`[Testing] ✅ Loaded ${wkts.length} workouts from backend`);
      setWorkouts(wkts);
    } catch (e: any) {
      console.error('[Testing] ❌ Error:', e.message);
      setError(e.message || 'Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

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

      console.log('[Testing] Requesting AI meal for:', email, 'category:', category, 'diet:', diet);
      const res = await fetch(`${API_BASE}/api/ai-meal`, {
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

      console.log(`[Testing] ✅ ${meals.length} AI meals received`);
      setAiMeals(meals);
      setMealsMeta({
        workoutsAnalyzed: response.workoutsAnalyzed,
        totalCaloriesBurned: response.totalCaloriesBurned,
      });
    } catch (e: any) {
      console.error('[Testing] ❌ AI meal error:', e.message);
      setMealError(e.message || 'Failed to get AI recommendation');
    } finally {
      setLoadingMeal(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const sourceColor = (source: string) => {
    return source === 'strava' ? '#fc4c02' : source === 'google_fit' ? '#4285f4' : '#caf300';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#131313', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#caf300" />
        <Text style={{ color: '#c5c9ac', marginTop: 12 }}>Loading real workout data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#131313', paddingVertical: 20 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#caf300', marginBottom: 4 }}>
          ⚡ Real Fitness Data
        </Text>
        <Text style={{ fontSize: 14, color: '#c5c9ac' }}>
          Live from Google Fit & Strava • {workouts.length} workouts
        </Text>
        {error && <Text style={{ fontSize: 12, color: '#ff6b6b', marginTop: 8 }}>⚠️ {error}</Text>}
      </View>

      {/* Connected Sources */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ backgroundColor: 'rgba(66, 133, 244, 0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(66, 133, 244, 0.3)' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#4285f4' }}>● GOOGLE FIT</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(252, 76, 2, 0.15)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: 'rgba(252, 76, 2, 0.3)' }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fc4c02' }}>● STRAVA</Text>
          </View>
        </View>
      </View>

      {/* Workout List */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 12 }}>Recent Workouts</Text>
        {workouts.map((workout) => (
          <TouchableOpacity
            key={workout.id}
            onPress={() => { setSelectedWorkout(workout); setAiMeals([]); setMealsMeta({}); }}
            style={{
              backgroundColor: selectedWorkout?.id === workout.id ? '#caf300' : '#2a2a2a',
              paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, marginBottom: 10,
              borderLeftWidth: 4, borderLeftColor: sourceColor(workout.source),
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: selectedWorkout?.id === workout.id ? '#131313' : '#ffffff', marginBottom: 2 }}>
                  {workout.name || workout.type}
                </Text>
                <Text style={{ fontSize: 12, color: selectedWorkout?.id === workout.id ? '#1a1a1a' : '#c5c9ac' }}>
                  {workout.type} • {formatDuration(workout.duration)}
                  {workout.distance ? ` • ${(workout.distance / 1000).toFixed(1)} km` : ''}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: selectedWorkout?.id === workout.id ? '#333' : sourceColor(workout.source), textTransform: 'uppercase' }}>
                  {workout.source.replace('_', ' ')}
                </Text>
                <Text style={{ fontSize: 10, color: selectedWorkout?.id === workout.id ? '#333' : '#888', marginTop: 2 }}>
                  {formatDate(workout.startDate)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Selected Workout Details */}
      {selectedWorkout && (
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 16 }}>📊 Workout Details</Text>
          <View style={{ backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#caf300', marginBottom: 12 }}>
              {selectedWorkout.name || selectedWorkout.type}
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {selectedWorkout.distance ? <StatBox label="Distance" value={`${(selectedWorkout.distance / 1000).toFixed(2)} km`} /> : null}
              <StatBox label="Duration" value={formatDuration(selectedWorkout.duration)} />
              {selectedWorkout.avgHeartRate ? <StatBox label="Avg HR" value={`${selectedWorkout.avgHeartRate} bpm`} color="#ffb1c3" /> : null}
              {selectedWorkout.maxHeartRate ? <StatBox label="Max HR" value={`${selectedWorkout.maxHeartRate} bpm`} color="#ff6b6b" /> : null}
              {selectedWorkout.elevationGain ? <StatBox label="Elevation" value={`${selectedWorkout.elevationGain} m`} /> : null}
              {selectedWorkout.avgSpeed ? <StatBox label="Avg Speed" value={`${(selectedWorkout.avgSpeed * 3.6).toFixed(1)} km/h`} /> : null}
              {selectedWorkout.calories ? <StatBox label="Calories" value={`${selectedWorkout.calories} kcal`} color="#d4a574" /> : null}
            </View>

            <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#444' }}>
              <Text style={{ fontSize: 11, color: '#888' }}>
                Source: {selectedWorkout.source.replace('_', ' ').toUpperCase()} • {formatDate(selectedWorkout.startDate)}
              </Text>
            </View>
          </View>

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
              { key: 'BOTH', label: '🍽️ BOTH' },
              { key: 'VEG', label: '🥦 VEG' },
              { key: 'NONVEG', label: '🍗 NON-VEG' },
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
              {loadingMeal ? '🤖 ANALYZING WORKOUTS...' : '🍽️ GET AI MEAL RECOMMENDATION'}
            </Text>
          </TouchableOpacity>

          {/* AI Meal Results */}
          {loadingMeal && <ActivityIndicator color="#caf300" style={{ marginBottom: 20 }} />}
          {mealError && (
            <View style={{ backgroundColor: 'rgba(255,107,107,0.1)', borderRadius: 8, padding: 12, marginBottom: 20, borderLeftWidth: 4, borderLeftColor: '#ff6b6b' }}>
              <Text style={{ fontSize: 12, color: '#ff6b6b' }}>⚠️ {mealError}</Text>
            </View>
          )}
          {aiMeals.length > 0 && (
            <View style={{ marginBottom: 40 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 4 }}>🍽️ AI Meal Options</Text>
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
                      {m.diet === 'NONVEG' ? '🍗' : '🥦'} OPT {idx + 1}
                    </Text>
                    <Text style={{ fontSize: 9, color: selectedMealIdx === idx ? '#1a1a1a' : '#888', marginTop: 2 }} numberOfLines={1}>
                      {aiMeals[idx].type}
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
                    {/* Diet badge */}
                    <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                      <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 5,
                        backgroundColor: meal.diet === 'NONVEG' ? 'rgba(255,107,107,0.15)' : 'rgba(122,196,76,0.15)',
                        borderWidth: 1, borderColor: meal.diet === 'NONVEG' ? '#ff6b6b' : '#7ac44c',
                        borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
                      }}>
                        <View style={{
                          width: 8, height: 8, borderRadius: 2,
                          backgroundColor: meal.diet === 'NONVEG' ? '#ff6b6b' : '#7ac44c',
                        }} />
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
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff', marginBottom: 6 }}>🥗 Ingredients</Text>
                    <Text style={{ fontSize: 12, color: '#c5c9ac', lineHeight: 20, marginBottom: 16 }}>{meal.ingredients}</Text>

                    {/* Instructions */}
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff', marginBottom: 6 }}>👨‍🍳 Instructions</Text>
                    <Text style={{ fontSize: 12, color: '#c5c9ac', lineHeight: 20 }}>{meal.instructions}</Text>
                  </View>
                );
              })()}
            </View>
          )}
        </View>
      )}

      {/* Refresh Button */}
      <View style={{ paddingHorizontal: 20, marginBottom: 60 }}>
        <TouchableOpacity
          onPress={loadRealData}
          style={{ borderWidth: 1, borderColor: '#caf300', paddingVertical: 12, borderRadius: 8, alignItems: 'center' }}
        >
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#caf300' }}>🔄 REFRESH DATA</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function StatBox({ label, value, color = '#ffffff' }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ minWidth: '30%', backgroundColor: '#1a1a1a', borderRadius: 8, padding: 10 }}>
      <Text style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color }}>{value}</Text>
    </View>
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
