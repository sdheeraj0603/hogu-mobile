// SimplifiedDashboardScreen.js - Strava Activities Only
// Just show Strava activities with meal recommendations

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import ActivityCard from '../components/ActivityCard';

// Simple Strava API wrapper (uses your existing backend or direct API)
const stravaAPI = {
  getActivities: async (token) => {
    try {
      // Option 1: Use your existing Flask backend at localhost:5000
      const response = await fetch('http://localhost:5000/api/activities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.json();

      // Option 2: Call Strava API directly
      // const response = await fetch('https://www.strava.com/api/v3/athlete/activities', {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // return response.json();
    } catch (error) {
      console.error('Error fetching activities:', error);
      return [];
    }
  },
};

const DashboardScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem('stravaToken');
      if (!token) {
        setError('No Strava token found');
        return;
      }

      const data = await stravaAPI.getActivities(token);
      setActivities(Array.isArray(data) ? data : [data]);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to load activities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncActivities = async () => {
    try {
      setRefreshing(true);
      const token = await AsyncStorage.getItem('stravaToken');
      const data = await stravaAPI.getActivities(token);
      setActivities(Array.isArray(data) ? data : [data]);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to sync activities');
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hello! 👟</Text>
        <Text style={styles.location}>📍 Bangalore, India</Text>
      </View>
      <View style={styles.stravaBadge}>
        <Text style={styles.badgeText}>🟢 Strava</Text>
      </View>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controls}>
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleSyncActivities}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator color={theme.colors.text} size="small" />
        ) : (
          <Text style={styles.buttonText}>⟳ Sync Activities</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderLastSync = () => (
    <Text style={styles.lastSync}>
      Last sync: {lastSync || 'Never'}
    </Text>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🏃</Text>
      <Text style={styles.emptyTitle}>No Activities</Text>
      <Text style={styles.emptyText}>
        Click "Sync Activities" to load from Strava
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>⚠️ {error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadActivities}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.secondary} size="large" />
          <Text style={styles.loadingText}>Loading activities...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={activities}
        renderItem={({ item }) => (
          <ActivityCard activity={item} />
        )}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderControls()}
            {renderLastSync()}
            {error && renderError()}
          </>
        }
        ListEmptyComponent={!error && renderEmpty()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleSyncActivities}
            tintColor={theme.colors.secondary}
          />
        }
        scrollEventThrottle={16}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  greeting: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  location: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  stravaBadge: {
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(255, 68, 68, 0.3)',
  },
  badgeText: {
    ...theme.typography.bodyBold,
    color: '#ef4444',
  },
  controls: {
    marginBottom: theme.spacing.lg,
  },
  button: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  lastSync: {
    ...theme.typography.tiny,
    color: theme.colors.textTertiary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
  },
  retryButton: {
    backgroundColor: theme.colors.danger,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});

export default DashboardScreen;
