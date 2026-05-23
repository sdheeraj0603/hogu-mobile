/**
 * Meal Testing Panel
 * Test AI recommendations with mock data OR real Strava activities
 */

import { View, Text, ScrollView, Pressable, Alert, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import nutritionEngine, { Activity, UserBiometrics } from '@/app/services/nutritionEngine';
import StravaAPI from '@/app/services/stravaAPI';
import { mockActivities, mockBiometrics, testScenarios } from '@/app/constants/mockData';
import { exchangeCodeForToken } from '@/app/services/stravaOAuth';

interface TestResult {
  activity: Activity;
  recommendation: any;
  reasoning: string;
}

interface StravaActivityData {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  average_heartrate?: number;
  calories?: number;
  start_date: string;
}

function MealTestingPanel() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'mock' | 'strava'>('mock');

  // Mock testing state
  const [selectedScenario, setSelectedScenario] = useState<number>(0);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Strava state
  const [stravaToken, setStravaToken] = useState<string>('');
  const [stravaActivities, setStravaActivities] = useState<StravaActivityData[]>([]);
  const [showStravaInput, setShowStravaInput] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [athleteName, setAthleteName] = useState<string>('');

  // ═══════════════════════════════════════════════════════════════
  // OAUTH FLOW - Simple code exchange
  // ═══════════════════════════════════════════════════════════════

  const startStravaOAuth = async () => {
    try {
      const authUrl =
        'https://www.strava.com/oauth/authorize?client_id=233623&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fcallback&approval_prompt=force&scope=activity%3Aread_all';

      Alert.alert(
        'Get Your Strava Code',
        'Copy this link and open it in your browser:\n\nhttps://www.strava.com/oauth/authorize?client_id=233623\n\n1. Click Authorize\n2. Copy the code from the URL\n3. Paste it here',
        [
          {
            text: 'I have the code',
            onPress: () => {
              Alert.prompt(
                'Paste Your Code',
                'Enter the code from Strava:',
                [
                  {
                    text: 'Cancel',
                    onPress: () => setIsAuthenticating(false),
                    style: 'cancel',
                  },
                  {
                    text: 'OK',
                    onPress: (code: string | undefined) => handleCodeExchange(code),
                  },
                ],
                'plain-text'
              );
            },
          },
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', String(error));
    }
  };

  const handleCodeExchange = async (code: string | undefined) => {
    try {
      if (!code || !code.trim()) {
        Alert.alert('Error', 'No code provided');
        return;
      }

      setIsAuthenticating(true);
      console.log('[OAuth] Exchanging code for token...');
      const tokenData = await exchangeCodeForToken(code.trim());

      setStravaToken(tokenData.access_token);
      setAthleteName(`${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`);

      Alert.alert(
        'Success!',
        `Authenticated as ${tokenData.athlete.firstname}! Now click FETCH ACTIVITIES to see your workouts.`
      );

      setShowStravaInput(false);
    } catch (error) {
      console.error('[OAuth] Exchange error:', error);
      Alert.alert('Authorization Failed', String(error));
    } finally {
      setIsAuthenticating(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // MOCK SCENARIO TESTING
  // ═══════════════════════════════════════════════════════════════

  const runMockTest = (scenarioIndex: number) => {
    try {
      setLoading(true);
      const scenario = testScenarios[scenarioIndex];

      const result = nutritionEngine.analyzActivityAndRecommend(
        scenario.activity,
        mockBiometrics
      );

      setTestResult({
        activity: scenario.activity,
        recommendation: result.recommendation,
        reasoning: result.reasoning,
      });

      setSelectedScenario(scenarioIndex);
    } catch (error) {
      console.error('[Testing] Mock Error:', error);
      Alert.alert('Test Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // STRAVA INTEGRATION
  // ═══════════════════════════════════════════════════════════════

  const fetchStravaActivities = async () => {
    try {
      if (!stravaToken.trim()) {
        Alert.alert('Error', 'Please enter your Strava token');
        return;
      }

      setLoading(true);
      console.log('\n========================================');
      console.log('[Strava] Starting activity fetch...');
      console.log('[Strava] Token length:', stravaToken.length);
      console.log('[Strava] Token preview:', stravaToken.substring(0, 20) + '...');
      console.log('========================================\n');
      
      const api = new StravaAPI(stravaToken);

      console.log('[Strava] Step 1: Validating token by fetching athlete info...');
      const athlete = await api.getAthlete();
      console.log('[Strava] ✅ Token valid! Athlete:', athlete.firstname, athlete.lastname);

      console.log('[Strava] Step 2: Fetching activities...');
      const activities = await api.getActivities(15, 1);
      console.log('[Strava] ✅ Got', activities.length, 'activities');

      if (!activities || activities.length === 0) {
        Alert.alert(
          'No Activities Found',
          'Your Strava account is connected, but no activities were found. Try uploading a workout to Strava first.',
          [{ text: 'OK' }]
        );
        setStravaActivities([]);
        return;
      }

      setStravaActivities(activities);
      Alert.alert(
        '✅ Success!',
        `Loaded ${activities.length} activities from Strava!\n\nNow select an activity to get meal recommendations.`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('\n========================================');
      console.error('[Strava] ❌ ERROR:', error?.message || error);
      console.error('[Strava] Full error:', error);
      console.error('========================================\n');
      
      const errorMessage = error?.message || String(error);
      
      // Parse specific errors
      let displayMessage = errorMessage;
      if (errorMessage.includes('401') || errorMessage.includes('Invalid token')) {
        displayMessage = '❌ Invalid Token\n\nThe Strava token you provided is:\n• Expired\n• Revoked\n• Incorrect\n\nPlease get a fresh token from Strava.';
      } else if (errorMessage.includes('403') || errorMessage.includes('Access forbidden')) {
        displayMessage = '❌ Access Denied\n\nYour token doesn\'t have permission to read activities. Try generating a new token with full permissions.';
      } else if (errorMessage.includes('Network') || errorMessage.includes('Failed to fetch')) {
        displayMessage = '❌ Network Error\n\nCannot reach Strava servers:\n• Check your internet connection\n• Check firewall/VPN settings\n• Try again in a moment';
      }
      
      Alert.alert('Strava Error', displayMessage);
      setStravaActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const testStravaActivity = (stravaActivity: StravaActivityData) => {
    try {
      setLoading(true);

      const internalActivity: Activity = {
        name: stravaActivity.name,
        type: stravaActivity.type.toLowerCase(),
        distance: Math.round((stravaActivity.distance / 1000) * 10) / 10,
        duration: stravaActivity.moving_time,
        averageHeartRate: stravaActivity.average_heartrate || 120,
        caloriesBurned:
          stravaActivity.calories || Math.round((stravaActivity.moving_time / 3600) * 300),
        timestamp: new Date(stravaActivity.start_date).getTime(),
      };

      console.log('[Testing Strava] Activity:', internalActivity);

      const result = nutritionEngine.analyzActivityAndRecommend(internalActivity, mockBiometrics);

      setTestResult({
        activity: internalActivity,
        recommendation: result.recommendation,
        reasoning: result.reasoning,
      });
    } catch (error) {
      console.error('[Testing Strava] Error:', error);
      Alert.alert('Test Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // COMPONENT RENDERING
  // ═══════════════════════════════════════════════════════════════

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#131313' }}
      contentContainerStyle={{ paddingBottom: 30 }}
    >
      {/* Header with Tabs */}
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
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: '#caf300',
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          TESTING PANEL
        </Text>
        <Text
          style={{ fontSize: 24, fontWeight: '800', color: '#ffffff', marginBottom: 16 }}
        >
          Test Meal Recommendations
        </Text>

        {/* Tab Selector */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable
            onPress={() => setActiveTab('mock')}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              backgroundColor:
                activeTab === 'mock'
                  ? 'rgba(202, 243, 0, 0.3)'
                  : 'rgba(68, 73, 50, 0.3)',
              borderWidth: 1,
              borderColor: activeTab === 'mock' ? '#caf300' : 'rgba(68, 73, 50, 0.5)',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                fontWeight: '600',
                color: activeTab === 'mock' ? '#caf300' : '#c5c9ac',
              }}
            >
              Mock Data
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('strava')}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 6,
              backgroundColor:
                activeTab === 'strava'
                  ? 'rgba(202, 243, 0, 0.3)'
                  : 'rgba(68, 73, 50, 0.3)',
              borderWidth: 1,
              borderColor: activeTab === 'strava' ? '#caf300' : 'rgba(68, 73, 50, 0.5)',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontSize: 12,
                fontWeight: '600',
                color: activeTab === 'strava' ? '#caf300' : '#c5c9ac',
              }}
            >
              Real Strava
            </Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Biometrics Info */}
      <View style={{ paddingHorizontal: 20, paddingVertical: 16, gap: 8 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: '700',
            color: '#caf300',
            letterSpacing: 0.5,
          }}
        >
          TEST USER BIOMETRICS
        </Text>
        <View
          style={{
            backgroundColor: 'rgba(32, 32, 31, 0.7)',
            borderRadius: 8,
            padding: 12,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: '#c5c9ac' }}>Body Weight</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#caf300' }}>
              {mockBiometrics.bodyWeight} kg
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: '#c5c9ac' }}>Resting HR</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#caf300' }}>
              {mockBiometrics.restingHeartRate} bpm
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 12, color: '#c5c9ac' }}>VO2 Max</Text>
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#caf300' }}>
              {mockBiometrics.vo2Max}
            </Text>
          </View>
        </View>
      </View>

      {/* MOCK DATA TAB */}
      {activeTab === 'mock' && (
        <View style={{ paddingHorizontal: 20, paddingVertical: 16, gap: 10 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: '#caf300',
              letterSpacing: 0.5,
            }}
          >
            WORKOUT SCENARIOS
          </Text>
          {testScenarios.map((scenario, idx) => (
            <Pressable
              key={idx}
              onPress={() => runMockTest(idx)}
              disabled={loading}
              style={({ pressed }) => ({
                backgroundColor:
                  selectedScenario === idx ? 'rgba(202, 243, 0, 0.2)' : 'rgba(32, 32, 31, 0.7)',
                borderRadius: 8,
                borderWidth: 1,
                borderColor:
                  selectedScenario === idx ? '#caf300' : 'rgba(68, 73, 50, 0.5)',
                padding: 12,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text
                style={{ fontSize: 13, fontWeight: '700', color: '#ffffff', marginBottom: 4 }}
              >
                {scenario.name}
              </Text>
              <Text
                style={{ fontSize: 11, color: '#c5c9ac', lineHeight: 16 }}
              >
                {scenario.description}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* STRAVA DATA TAB */}
      {activeTab === 'strava' && (
        <View style={{ paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}>
          {/* Authentication Section */}
          {!stravaToken ? (
            <View style={{ gap: 10 }}>
              {/* OAuth Button */}
              <Pressable
                onPress={startStravaOAuth}
                disabled={isAuthenticating}
                style={{
                  backgroundColor: 'rgba(202, 243, 0, 0.3)',
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: '#caf300',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  opacity: isAuthenticating ? 0.6 : 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '800',
                    color: '#caf300',
                    marginBottom: 4,
                  }}
                >
                  AUTHORIZE WITH STRAVA
                </Text>
                <Text style={{ fontSize: 11, color: '#c5c9ac', lineHeight: 16 }}>
                  Easy 1-click connection to fetch your real activities
                </Text>
              </Pressable>

              {/* Manual Token Option */}
              <Pressable
                onPress={() => setShowStravaInput(!showStravaInput)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 6,
                  backgroundColor: 'rgba(68, 73, 50, 0.3)',
                }}
              >
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 11,
                    fontWeight: '600',
                    color: '#c5c9ac',
                  }}
                >
                  {showStravaInput ? 'Hide Token Input' : 'Manual Token Input'}
                </Text>
              </Pressable>

              {/* Manual Token Input */}
              {showStravaInput && (
                <View style={{ gap: 10, paddingTop: 10 }}>
                  <View style={{ gap: 6 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '700',
                        color: '#c5c9ac',
                      }}
                    >
                      OR PASTE PERSONAL ACCESS TOKEN
                    </Text>
                    <TextInput
                      placeholder="Paste your token from strava.com/settings/apps"
                      placeholderTextColor="#555"
                      value={stravaToken}
                      onChangeText={setStravaToken}
                      secureTextEntry={true}
                      style={{
                        backgroundColor: 'rgba(32, 32, 31, 0.9)',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        color: '#ffffff',
                        fontSize: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(68, 73, 50, 0.5)',
                      }}
                    />
                  </View>

                  {/* Action Buttons */}
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      onPress={() => {
                        setShowStravaInput(false);
                        setStravaToken('');
                        setStravaActivities([]);
                      }}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 6,
                        backgroundColor: 'rgba(68, 73, 50, 0.5)',
                      }}
                    >
                      <Text
                        style={{
                          textAlign: 'center',
                          fontSize: 12,
                          fontWeight: '600',
                          color: '#c5c9ac',
                        }}
                      >
                        Cancel
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={fetchStravaActivities}
                      disabled={loading || !stravaToken.trim()}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: 6,
                        backgroundColor: loading ? 'rgba(202, 243, 0, 0.3)' : 'rgba(202, 243, 0, 0.4)',
                        opacity: loading || !stravaToken.trim() ? 0.5 : 1,
                      }}
                    >
                      {loading ? (
                        <ActivityIndicator color="#caf300" size="small" />
                      ) : (
                        <Text
                          style={{
                            textAlign: 'center',
                            fontSize: 12,
                            fontWeight: '700',
                            color: '#caf300',
                          }}
                        >
                          FETCH ACTIVITIES
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          ) : (
            // Authenticated state
            <View style={{ gap: 10 }}>
              <View
                style={{
                  backgroundColor: 'rgba(202, 243, 0, 0.1)',
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#caf300',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#caf300' }}>
                  AUTHENTICATED
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff', marginTop: 4 }}>
                  {athleteName}
                </Text>
                <Pressable
                  onPress={() => {
                    setStravaToken('');
                    setAthleteName('');
                    setStravaActivities([]);
                  }}
                  style={{ marginTop: 8 }}
                >
                  <Text style={{ fontSize: 11, color: '#ffb1c3' }}>Sign out</Text>
                </Pressable>
              </View>

              {/* Fetch Activities Button */}
              <Pressable
                onPress={fetchStravaActivities}
                disabled={loading}
                style={{
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: 'rgba(202, 243, 0, 0.4)',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="#caf300" size="small" />
                ) : (
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 12,
                      fontWeight: '700',
                      color: '#caf300',
                    }}
                  >
                    FETCH ACTIVITIES
                  </Text>
                )}
              </Pressable>

              {/* Activities List */}
              {stravaActivities.length > 0 && (
                <View style={{ gap: 10 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color: '#caf300',
                      letterSpacing: 0.5,
                      marginTop: 8,
                    }}
                  >
                    YOUR ACTIVITIES ({stravaActivities.length})
                  </Text>
                  {stravaActivities.map((activity) => (
                    <Pressable
                      key={activity.id}
                      onPress={() => testStravaActivity(activity)}
                      disabled={loading}
                      style={({ pressed }) => ({
                        backgroundColor: 'rgba(32, 32, 31, 0.7)',
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: 'rgba(68, 73, 50, 0.5)',
                        padding: 12,
                        opacity: pressed ? 0.8 : 1,
                      })}
                    >
                      <Text
                        style={{ fontSize: 12, fontWeight: '700', color: '#ffffff', marginBottom: 4 }}
                      >
                        {activity.name}
                      </Text>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 11, color: '#c5c9ac' }}>
                          {activity.type} • {Math.round((activity.distance / 1000) * 10) / 10} km
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#caf300' }}>
                          {Math.round(activity.moving_time / 60)} min
                        </Text>
                      </View>
                      {activity.average_heartrate && (
                        <Text style={{ fontSize: 10, color: '#ffb1c3' }}>
                          Avg HR: {Math.round(activity.average_heartrate)} bpm
                        </Text>
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {/* TEST RESULT */}
      {testResult && (
        <View style={{ paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color: '#caf300',
              letterSpacing: 0.5,
            }}
          >
            TEST RESULT
          </Text>

          {/* Activity Details */}
          <View
            style={{
              backgroundColor: 'rgba(32, 32, 31, 0.7)',
              borderRadius: 8,
              padding: 12,
              gap: 8,
            }}
          >
            <Text
              style={{ fontSize: 12, fontWeight: '700', color: '#ffffff', marginBottom: 4 }}
            >
              Activity: {testResult.activity.name}
            </Text>
            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#c5c9ac' }}>Type</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#caf300' }}>
                  {testResult.activity.type}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#c5c9ac' }}>Duration</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#caf300' }}>
                  {Math.round(testResult.activity.duration / 60)} min
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#c5c9ac' }}>Distance</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#caf300' }}>
                  {testResult.activity.distance} km
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#c5c9ac' }}>Avg Heart Rate</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#caf300' }}>
                  {testResult.activity.averageHeartRate} bpm
                </Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 11, color: '#c5c9ac' }}>Calories Burned</Text>
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#caf300' }}>
                  {testResult.activity.caloriesBurned} kcal
                </Text>
              </View>
            </View>
          </View>

          {/* Recommendation */}
          <View
            style={{
              backgroundColor: 'rgba(202, 243, 0, 0.1)',
              borderRadius: 8,
              padding: 12,
              gap: 8,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: '700',
                color: '#caf300',
                marginBottom: 4,
              }}
            >
              MEAL RECOMMENDATION: {testResult.recommendation.name}
            </Text>
            <Text style={{ fontSize: 11, color: '#c5c9ac', lineHeight: 16 }}>
              {testResult.recommendation.description}
            </Text>
          </View>

          {/* Reasoning */}
          <View
            style={{
              backgroundColor: 'rgba(202, 243, 0, 0.08)',
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: '#caf300',
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: '#c5c9ac',
                lineHeight: 16,
                fontStyle: 'italic',
              }}
            >
              {testResult.reasoning}
            </Text>
          </View>

          {/* Macros */}
          <View
            style={{
              backgroundColor: 'rgba(32, 32, 31, 0.7)',
              borderRadius: 8,
              padding: 12,
              gap: 8,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '700',
                color: '#caf300',
                marginBottom: 4,
              }}
            >
              MACROS ({testResult.recommendation.prepTime} min prep)
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, color: '#c5c9ac' }}>Calories</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#caf300' }}>
                {testResult.recommendation.macros.calories} kcal
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, color: '#c5c9ac' }}>Protein</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#ffb1c3' }}>
                {testResult.recommendation.macros.protein}g
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, color: '#c5c9ac' }}>Carbs</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#caf300' }}>
                {testResult.recommendation.macros.carbs}g
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 10, color: '#c5c9ac' }}>Fats</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#d4a574' }}>
                {testResult.recommendation.macros.fats}g
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator color="#caf300" size="large" />
          <Text style={{ color: '#c5c9ac', marginTop: 8 }}>Processing...</Text>
        </View>
      )}
    </ScrollView>
  );
}

export default MealTestingPanel;
