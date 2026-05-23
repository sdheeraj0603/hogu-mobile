import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ===== THEME (Dark mode) =====
const theme = {
  colors: {
    primary: '#ef4444',
    secondary: '#3b82f6',
    background: '#0f172a',
    surface: '#1e293b',
    card: '#334155',
    text: '#ffffff',
    textSecondary: '#cbd5e1',
    border: '#475569',
    success: '#10b981',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

// ===== STRAVA API =====
const stravaAPI = {
  async getActivities(token) {
    try {
      // Use Flask backend
      const response = await fetch('http://localhost:5000/api/activities', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Flask backend failed, trying direct Strava API');
      // Fallback to direct Strava API
      try {
        const response = await fetch(
          'https://www.strava.com/api/v3/athlete/activities?per_page=10',
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
      } catch (err) {
        throw err;
      }
    }
  },

  async getAthlete(token) {
    const response = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
};

// ===== LOGIN SCREEN =====
function LoginScreen({ onLoginSuccess }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter your Strava access token');
      return;
    }
    setLoading(true);
    try {
      const athlete = await stravaAPI.getAthlete(token);
      await AsyncStorage.setItem('stravaToken', token);
      await AsyncStorage.setItem('stravaUser', JSON.stringify(athlete));
      onLoginSuccess();
    } catch (error) {
      Alert.alert('Error', 'Invalid token. Check your Strava API token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.loginHeader}>
          <Text style={styles.appTitle}>🏃 HOG-U</Text>
          <Text style={styles.subtitle}>Performance Nutrition</Text>
        </View>

        <View style={styles.featureList}>
          <Text style={styles.featureTitle}>What You Get:</Text>
          <FeatureItem icon="🏃" text="Sync Strava activities" />
          <FeatureItem icon="🍽️" text="Nutrition recommendations" />
          <FeatureItem icon="🌡️" text="Weather during workouts" />
          <FeatureItem icon="📍" text="Location names (Lalbagh, etc)" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Strava Access Token</Text>
          <Text style={styles.hint}>
            Get from: https://www.strava.com/settings/apps
          </Text>
          <View style={styles.tokenInput}>
            <Text style={styles.tokenText}>
              {token ? token.substring(0, 20) + '...' : 'Paste token here'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.inputField, { minHeight: 100 }]}
            onPress={() => {
              Alert.prompt(
                'Enter Strava Token',
                'Paste your access token from https://www.strava.com/settings/apps',
                (value) => {
                  if (value) setToken(value);
                },
                'plain-text'
              );
            }}
          >
            <Text style={styles.placeholder}>
              {token ? token.substring(0, 30) + '...' : 'Tap to paste token'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.disabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login with Strava</Text>
          )}
        </TouchableOpacity>

        <View style={styles.testTokenContainer}>
          <TouchableOpacity
            style={styles.testTokenButton}
            onPress={() => {
              const testToken = 'YOUR_TEST_TOKEN_HERE';
              if (testToken === 'YOUR_TEST_TOKEN_HERE') {
                Alert.alert(
                  'Test Mode',
                  'Edit App.js line ~100 and replace YOUR_TEST_TOKEN_HERE with your actual Strava token'
                );
              } else {
                setToken(testToken);
              }
            }}
          >
            <Text style={styles.testTokenText}>Use Test Token</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const FeatureItem = ({ icon, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

// ===== DASHBOARD SCREEN =====
function DashboardScreen({ token, onLogout }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    setError(null);
    try {
      const data = await stravaAPI.getActivities(token);
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setActivities([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadActivities();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.secondary} />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activities</Text>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={onLogout}
        >
          <Text style={styles.logoutText}>🚪</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadActivities}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <ActivityCard activity={item} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏃</Text>
            <Text style={styles.emptyText}>No activities yet</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      <TouchableOpacity
        style={styles.syncButton}
        onPress={loadActivities}
      >
        <Text style={styles.syncButtonText}>⟳ Sync</Text>
      </TouchableOpacity>
    </View>
  );
}

// ===== ACTIVITY CARD =====
function ActivityCard({ activity }) {
  const distance = activity.distance / 1000;
  const duration = Math.round(activity.moving_time / 60);
  const type = activity.type === 'Run' ? '🏃' : 
               activity.type === 'Ride' ? '🚴' : '⛹️';

  return (
    <View style={styles.activityCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.activityType}>{type} {activity.type}</Text>
        <Text style={styles.activityName}>{activity.name}</Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{distance.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>km</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{duration}</Text>
          <Text style={styles.metricLabel}>min</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>
            {(activity.average_speed * 3.6).toFixed(1)}
          </Text>
          <Text style={styles.metricLabel}>km/h</Text>
        </View>
      </View>

      <Text style={styles.date}>
        {new Date(activity.start_date).toLocaleDateString('en-IN')}
      </Text>
    </View>
  );
}

// ===== SETTINGS SCREEN =====
function SettingsScreen({ token, onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('stravaUser');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Disconnect from Strava?',
      [
        { text: 'Cancel' },
        {
          text: 'Logout',
          onPress: async () => {
            await AsyncStorage.removeItem('stravaToken');
            await AsyncStorage.removeItem('stravaUser');
            onLogout();
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.secondary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView style={styles.settingsContent}>
        {user && (
          <View style={styles.profileCard}>
            <Text style={styles.profileIcon}>🏃</Text>
            <Text style={styles.profileName}>{user.firstname} {user.lastname}</Text>
            <Text style={styles.profileStatus}>🟢 Connected to Strava</Text>
            {user.city && (
              <Text style={styles.profileCity}>📍 {user.city}</Text>
            )}
          </View>
        )}

        <View style={styles.settingSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <SettingItem label="App Version" value="1.0.0" />
          <SettingItem label="Powered by" value="Strava API" />
          <SettingItem label="Nutrition" value="AI-powered" />
        </View>

        <TouchableOpacity
          style={styles.logoutButtonFull}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonFullText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const SettingItem = ({ label, value }) => (
  <View style={styles.settingItem}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Text style={styles.settingValue}>{value}</Text>
  </View>
);

// ===== MAIN APP =====
export default function App() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const stored = await AsyncStorage.getItem('stravaToken');
      setToken(stored);
    } catch (error) {
      console.error('Error checking token:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    checkToken();
  };

  const handleLogout = () => {
    setToken(null);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.secondary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: 40 }]}>
      {!token ? (
        <LoginScreen onLoginSuccess={handleLogin} />
      ) : (
        <View style={{ flex: 1, flexDirection: 'column' }}>
          <ScrollView horizontal={false} style={{ flex: 1 }}>
            <DashboardScreen token={token} onLogout={handleLogout} />
          </ScrollView>
          <TouchableOpacity
            style={styles.bottomTabSettings}
            onPress={handleLogout}
          >
            <Text style={styles.bottomTabText}>⚙️ Settings</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  loginHeader: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  featureList: {
    marginBottom: theme.spacing.lg,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  tokenInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tokenText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: 'Courier',
  },
  inputField: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  disabled: {
    opacity: 0.6,
  },
  testTokenContainer: {
    alignItems: 'center',
  },
  testTokenButton: {
    paddingVertical: theme.spacing.sm,
  },
  testTokenText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
  },
  logoutButton: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    padding: theme.spacing.md,
    margin: theme.spacing.md,
    borderRadius: 4,
  },
  errorText: {
    color: theme.colors.primary,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  syncButton: {
    position: 'absolute',
    bottom: 80,
    right: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  activityCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  cardHeader: {
    marginBottom: theme.spacing.md,
  },
  activityType: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: theme.spacing.md,
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.secondary,
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  date: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  settingsContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 8,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  profileIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.md,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  profileStatus: {
    fontSize: 12,
    color: theme.colors.success,
    marginTop: 4,
  },
  profileCity: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settingSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLabel: {
    fontSize: 14,
    color: theme.colors.text,
  },
  settingValue: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  logoutButtonFull: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  logoutButtonFullText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  bottomTabSettings: {
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  bottomTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
