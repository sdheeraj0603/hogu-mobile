// SimplifiedSettingsScreen.js - Strava Only Settings
// Just show Strava status and logout button

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

const SettingsScreen = ({ navigation }) => {
  const [stravaUser, setStravaUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStravaInfo();
  }, []);

  const loadStravaInfo = async () => {
    try {
      setLoading(true);
      // You can store Strava user info when you login
      const userInfo = await AsyncStorage.getItem('stravaUserInfo');
      if (userInfo) {
        setStravaUser(JSON.parse(userInfo));
      }
    } catch (error) {
      console.error('Error loading Strava info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to disconnect from Strava?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('stravaToken');
              await AsyncStorage.removeItem('stravaUserInfo');
              // Navigation is handled by App.js auth state
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={theme.colors.secondary} size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Strava Status Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Connection</Text>
        
        <View style={styles.stravaCard}>
          <Text style={styles.stravaIcon}>🏃</Text>
          <View style={styles.stravaInfo}>
            <Text style={styles.stravaName}>
              {stravaUser?.name || 'Strava User'}
            </Text>
            <Text style={styles.stravaStatus}>🟢 Connected</Text>
            {stravaUser?.city && (
              <Text style={styles.stravaLocation}>
                📍 {stravaUser.city}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <SettingRow
          icon="ℹ️"
          label="App Version"
          value="1.0.0"
        />

        <SettingRow
          icon="🏃"
          label="Powered by"
          value="Strava"
        />

        <SettingRow
          icon="🍽️"
          label="Nutrition by"
          value="Open-Meteo"
        />
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 Logout from Strava</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        HOG-U v1.0 • Performance Nutrition
      </Text>
    </View>
  );
};

const SettingRow = ({ icon, label, value }) => (
  <View style={styles.settingRow}>
    <View style={styles.settingLeft}>
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    <Text style={styles.settingValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  section: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  stravaCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  stravaIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  stravaInfo: {
    flex: 1,
  },
  stravaName: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  stravaStatus: {
    ...theme.typography.small,
    color: theme.colors.success,
    marginTop: 2,
  },
  stravaLocation: {
    ...theme.typography.tiny,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 18,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  settingValue: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.danger,
  },
  footer: {
    ...theme.typography.tiny,
    color: theme.colors.textTertiary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SettingsScreen;
