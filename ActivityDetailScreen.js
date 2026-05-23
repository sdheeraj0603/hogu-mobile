// Activity Detail Screen - Full activity view

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { theme, getActivityColor, getStatusColor } from '../theme';

const ActivityDetailScreen = ({ route, navigation }) => {
  const { activity } = route.params;

  const activityColor = getActivityColor(activity.activity_type);
  const statusColor = getStatusColor(activity.sweat_status);

  const handleOpenZomato = () => {
    if (activity.zomato_link) {
      Linking.openURL(activity.zomato_link);
    }
  };

  const handleShare = () => {
    // Share activity data
    console.log('Share activity:', activity);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Activity Details</Text>
        <TouchableOpacity 
          onPress={handleShare}
          style={styles.shareButton}
        >
          <Text style={styles.shareIcon}>↗️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Activity Card */}
        <View style={[styles.card, { borderTopColor: activityColor }]}>
          {/* Activity Type & Location */}
          <View style={styles.section}>
            <View 
              style={[
                styles.typeTag,
                { backgroundColor: `${activityColor}20` }
              ]}
            >
              <Text style={[styles.typeText, { color: activityColor }]}>
                {activity.activity_type}
              </Text>
            </View>
            <Text style={styles.activityName}>{activity.activity_name}</Text>
            <Text style={styles.location}>📍 {activity.location}</Text>
          </View>

          {/* Distance & Elevation */}
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{activity.distance_km?.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Distance (km)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{activity.elevation_gain?.toFixed(0)}</Text>
              <Text style={styles.statLabel}>Elevation (m)</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: activityColor }]}>
                {activity.intensity_index?.toFixed(1)}
              </Text>
              <Text style={styles.statLabel}>Intensity</Text>
            </View>
          </View>

          {/* Time & Weather */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{activity.start_time}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Temperature</Text>
              <Text style={styles.infoValue}>{activity.temperature}°C</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Humidity</Text>
              <Text style={styles.infoValue}>{activity.humidity}%</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hydration Status</Text>
              <Text style={[styles.infoValue, { color: statusColor }]}>
                {activity.sweat_status}
              </Text>
            </View>
          </View>
        </View>

        {/* Meal Recommendation Section */}
        <View style={styles.mealSection}>
          <Text style={styles.sectionTitle}>🍽️ Nutrition Recommendation</Text>
          
          <View style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <Text style={styles.mealCategory}>{activity.meal_window || 'Recovery'}</Text>
              <Text style={styles.mealLevel}>
                Level {Math.floor(activity.intensity_index / 2)}
              </Text>
            </View>

            <Text style={styles.mealName}>
              {activity.meal_recommendation?.split('.').pop().trim()}
            </Text>

            <Text style={styles.mealFullDescription}>
              {activity.meal_recommendation}
            </Text>

            <TouchableOpacity 
              style={styles.zomatoLargeButton}
              onPress={handleOpenZomato}
            >
              <Text style={styles.zomatoButtonIcon}>🍔</Text>
              <Text style={styles.zomatoButtonText}>Order on Zomato</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Performance Tips</Text>
          
          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Hydration</Text>
            <Text style={styles.tipText}>
              With {activity.humidity}% humidity, maintain consistent water intake. 
              Aim for 200-250ml every 15 minutes during intense activities.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Nutrition Timing</Text>
            <Text style={styles.tipText}>
              Post-workout meal within 30 minutes. Your intensity index of 
              {activity.intensity_index?.toFixed(1)} requires proper recovery nutrition.
            </Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>Route Analysis</Text>
            <Text style={styles.tipText}>
              {activity.elevation_gain > 100 
                ? 'High elevation gain detected. Focus on leg recovery nutrition.' 
                : 'Moderate elevation. Standard recovery nutrition recommended.'}
            </Text>
          </View>
        </View>

        {/* Export Button */}
        <TouchableOpacity style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📥 Export Activity Data</Text>
        </TouchableOpacity>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareIcon: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderTopWidth: 4,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  typeTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  typeText: {
    ...theme.typography.bodyBold,
    fontWeight: '700',
  },
  activityName: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  location: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.secondary,
  },
  statLabel: {
    ...theme.typography.tiny,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  mealSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  mealCard: {
    backgroundColor: 'rgba(26, 127, 99, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(26, 127, 99, 0.3)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  mealCategory: {
    ...theme.typography.bodyBold,
    color: theme.colors.secondary,
  },
  mealLevel: {
    ...theme.typography.bodyBold,
    color: theme.colors.secondary,
  },
  mealName: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  mealFullDescription: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  zomatoLargeButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zomatoButtonIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  zomatoButtonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  tipsSection: {
    marginBottom: theme.spacing.lg,
  },
  tipCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
  },
  tipTitle: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  tipText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  exportButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  exportButtonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.textSecondary,
  },
  spacer: {
    height: theme.spacing.lg,
  },
});

export default ActivityDetailScreen;
