// Activity Card Component - Displays individual activity with meal recommendation

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme, getActivityColor, getStatusColor } from '../theme';

const ActivityCard = ({ activity, onPress }) => {
  const activityColor = getActivityColor(activity.activity_type);
  const statusColor = getStatusColor(activity.sweat_status);
  const mealName = activity.meal_recommendation?.split('.').pop().trim() || 'No recommendation';

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, { borderTopColor: activityColor }]}
    >
      {/* Header: Activity Type & Location */}
      <View style={styles.header}>
        <View style={[styles.typeTag, { backgroundColor: `${activityColor}20` }]}>
          <Text style={[styles.typeText, { color: activityColor }]}>
            {activity.activity_type}
          </Text>
        </View>
        <Text style={styles.location}>📍 {activity.location || 'Unknown'}</Text>
      </View>

      {/* Activity Name */}
      <Text style={styles.activityName}>{activity.activity_name}</Text>

      {/* Metrics Row */}
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{activity.distance_km?.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>km</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{activity.elevation_gain?.toFixed(0)}</Text>
          <Text style={styles.metricLabel}>m elev</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{activity.intensity_index?.toFixed(1)}</Text>
          <Text style={styles.metricLabel}>intensity</Text>
        </View>
      </View>

      {/* Weather Info */}
      <View style={styles.weatherRow}>
        <Text style={styles.weatherText}>🌡️ {activity.temperature}°C</Text>
        <Text style={styles.weatherText}>💧 {activity.humidity}%</Text>
        <Text style={[styles.weatherText, { color: statusColor }]}>
          ⚠️ {activity.sweat_status}
        </Text>
      </View>

      {/* Meal Recommendation */}
      <View style={styles.mealContainer}>
        <Text style={styles.mealLabel}>🍽️ Recommended Meal</Text>
        <Text style={styles.mealName}>{mealName}</Text>
        <Text style={styles.mealDesc}>{activity.meal_recommendation}</Text>
        <TouchableOpacity 
          style={styles.zomatoButton}
          onPress={() => {
            // Handle Zomato link opening
            console.log('Opening Zomato:', activity.zomato_link);
          }}
        >
          <Text style={styles.zomatoButtonText}>Order on Zomato →</Text>
        </TouchableOpacity>
      </View>

      {/* Timestamp */}
      <Text style={styles.timestamp}>{activity.start_time}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderTopWidth: 3,
    marginBottom: theme.spacing.md,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  typeTag: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
  },
  typeText: {
    ...theme.typography.smallBold,
    fontWeight: '700',
  },
  location: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  activityName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  metric: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  metricValue: {
    ...theme.typography.h4,
    color: theme.colors.secondary,
  },
  metricLabel: {
    ...theme.typography.tiny,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  },
  weatherText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  mealContainer: {
    backgroundColor: 'rgba(26, 127, 99, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(26, 127, 99, 0.3)',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  mealLabel: {
    ...theme.typography.tiny,
    color: theme.colors.secondary,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  mealName: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginTop: 4,
  },
  mealDesc: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  zomatoButton: {
    backgroundColor: 'rgba(26, 127, 99, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(26, 127, 99, 0.4)',
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },
  zomatoButtonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.secondary,
  },
  timestamp: {
    ...theme.typography.tiny,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.sm,
  },
});

export default ActivityCard;
