import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import nutritionEngine from '../services/nutritionEngine';
import type { Activity, NutritionPlan } from '../services/nutritionEngine';

const API_BASE = 'http://192.168.1.6:5000';

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
  const [mealPlan, setMealPlan] = useState<NutritionPlan[] | null>(null);
  const [loadingMeal, setLoadingMeal] = useState(false);

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

  const getMealRecommendation = () => {
    if (!selectedWorkout) return;
    setLoadingMeal(true);

    const activity: Activity = {
      name: selectedWorkout.name || selectedWorkout.type,
      type: mapWorkoutType(selectedWorkout.type),
      duration: selectedWorkout.duration,
      distance: (selectedWorkout.distance || 0) / 1000,
      elevationGain: selectedWorkout.elevationGain,
      caloriesBurned: selectedWorkout.calories,
      averageHeartRate: selectedWorkout.avgHeartRate,
      maxHeartRate: selectedWorkout.maxHeartRate,
    };

    const biometrics = { bodyWeight: 72 };
    const plan = nutritionEngine.analyzActivityAndRecommend(activity, biometrics);
    setMealPlan(plan ? [plan] : []);
    setLoadingMeal(false);
  };

  const mapWorkoutType = (type: string): string => {
    const map: Record<string, string> = {
      'Run': 'Run', 'Running': 'Run', 'Ride': 'Ride', 'Cycling': 'Ride',
      'Swim': 'Swim', 'Swimming': 'Swim', 'Walking': 'Walk', 'Walk': 'Walk',
    };
    return map[type] || type;
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
            onPress={() => { setSelectedWorkout(workout); setMealPlan(null); }}
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

          {/* Meal Recommendation Button */}
          <TouchableOpacity
            onPress={getMealRecommendation}
            style={{ backgroundColor: '#caf300', paddingVertical: 16, borderRadius: 8, alignItems: 'center', marginBottom: 20 }}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#131313', letterSpacing: 0.5 }}>
              🍽️ GET AI MEAL RECOMMENDATION
            </Text>
          </TouchableOpacity>

          {/* Meal Plan Results */}
          {loadingMeal && <ActivityIndicator color="#caf300" style={{ marginBottom: 20 }} />}
          {mealPlan && mealPlan.length > 0 && (
            <View style={{ marginBottom: 40 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#ffffff', marginBottom: 16 }}>🍽️ Recovery Meals</Text>
              {mealPlan.slice(0, 3).map((plan, idx) => (
                <View key={idx} style={{ backgroundColor: '#2a2a2a', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: idx === 0 ? '#caf300' : '#444' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff', marginBottom: 4 }}>
                    {plan.recommendation.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#c5c9ac', marginBottom: 8 }}>
                    {plan.reasoning}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <MacroBadge label="Cal" value={plan.recommendation.macros.calories} color="#caf300" />
                    <MacroBadge label="Protein" value={`${plan.recommendation.macros.protein}g`} color="#ffb1c3" />
                    <MacroBadge label="Carbs" value={`${plan.recommendation.macros.carbs}g`} color="#4285f4" />
                    <MacroBadge label="Fat" value={`${plan.recommendation.macros.fats}g`} color="#d4a574" />
                  </View>
                  <Text style={{ fontSize: 10, color: '#888', marginTop: 8 }}>
                    ⏱️ {plan.recommendation.prepTime} min prep • {plan.recoveryPhase} recovery
                  </Text>
                </View>
              ))}
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
