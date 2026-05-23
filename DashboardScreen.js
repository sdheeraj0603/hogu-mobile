// Dashboard Screen - Main activity feed

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
import { theme } from '../theme';
import ActivityCard from '../components/ActivityCard';
import { activitiesService } from '../services/api';

const DashboardScreen = ({ navigation }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSync, setLastSync] = useState(null);

  // Load activities on mount
  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activitiesService.getActivities(10);
      setActivities(Array.isArray(response.data) ? response.data : [response.data]);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to load activities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncWorkouts = async () => {
    try {
      setRefreshing(true);
      const response = await activitiesService.syncActivities();
      setActivities(Array.isArray(response.data) ? response.data : [response.data]);
      setLastSync(new Date().toLocaleTimeString());
    } catch (err) {
      setError('Failed to sync workouts');
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleActivityPress = (activity) => {
    navigation.navigate('ActivityDetail', { activity });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hello, Runner! 👟</Text>
        <Text style={styles.location}>📍 Bangalore, India</Text>
      </View>
      <TouchableOpacity
        style={styles.trackerBadge}
        onPress={() => navigation.navigate('Trackers')}
      >
        <Text style={styles.badgeText}>🟢 Connected</Text>
      </TouchableOpacity>
    </View>
  );

  const renderControls = () => (
    <View style={styles.controls}>
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleSyncWorkouts}
        disabled={refreshing}
      >
        {refreshing ? (
          <ActivityIndicator color={theme.colors.text} size="small" />
        ) : (
          <Text style={styles.buttonText}>⟳ Sync Workouts</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
        <Text style={styles.buttonTextSecondary}>↓ Export Data</Text>
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
        Click "Sync Workouts" to load from Strava
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
          <ActivityCard
            activity={item}
            onPress={() => handleActivityPress(item)}
          />
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
            onRefresh={handleSyncWorkouts}
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
  trackerBadge: {
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.3)',
  },
  badgeText: {
    ...theme.typography.bodyBold,
    color: theme.colors.secondary,
  },
  controls: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  buttonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  buttonTextSecondary: {
    ...theme.typography.bodyBold,
    color: theme.colors.textSecondary,
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
