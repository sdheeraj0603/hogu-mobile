// Settings Screen - User settings and preferences

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import { userService, authService } from '../services/api';

const SettingsScreen = ({ navigation }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoSync, setAutoSync] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Logout',
          onPress: async () => {
            try {
              await authService.logout();
              // Navigate to login screen
              navigation.getParent().getParent().goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleChangePassword = () => {
    Alert.prompt(
      'Change Password',
      'Enter your new password:',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Update',
          onPress: (newPassword) => {
            if (newPassword) {
              console.log('Password change requested');
              Alert.alert('Success', 'Password updated successfully');
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const SettingRow = ({ icon, label, value, onPress, isToggle, toggleValue, onToggleChange }) => (
    <TouchableOpacity 
      style={styles.settingRow}
      onPress={onPress}
      disabled={isToggle}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {isToggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggleChange}
          trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
          thumbColor={toggleValue ? theme.colors.secondary : theme.colors.textSecondary}
        />
      ) : (
        <View style={styles.settingRight}>
          <Text style={styles.settingValue}>{value}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          
          <View style={styles.profileCard}>
            <Text style={styles.profileIcon}>👤</Text>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{userProfile?.email}</Text>
              <Text style={styles.profileDate}>
                Member since {userProfile?.created_at?.split('T')[0] || 'N/A'}
              </Text>
            </View>
          </View>

          <SettingRow
            icon="🔐"
            label="Change Password"
            value="•••••••"
            onPress={handleChangePassword}
          />
          
          <SettingRow
            icon="📋"
            label="Edit Profile"
            value="›"
            onPress={() => {}}
          />
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          <SettingRow
            icon="🔔"
            label="Push Notifications"
            isToggle
            toggleValue={notifications}
            onToggleChange={setNotifications}
          />

          <SettingRow
            icon="🌙"
            label="Dark Mode"
            isToggle
            toggleValue={darkMode}
            onToggleChange={setDarkMode}
          />

          <SettingRow
            icon="⚡"
            label="Auto-Sync Activities"
            isToggle
            toggleValue={autoSync}
            onToggleChange={setAutoSync}
          />
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          <SettingRow
            icon="📥"
            label="Export All Data"
            value="›"
            onPress={() => {
              Alert.alert('Export', 'Preparing your data export...');
            }}
          />

          <SettingRow
            icon="🗑️"
            label="Clear Cache"
            value="›"
            onPress={() => {
              Alert.alert('Cache Cleared', 'App cache has been cleared');
            }}
          />

          <View style={styles.storageInfo}>
            <Text style={styles.storageLabel}>Storage Used</Text>
            <View style={styles.storageBar}>
              <View 
                style={[
                  styles.storageBarFill,
                  { width: '45%' }
                ]}
              />
            </View>
            <Text style={styles.storageText}>4.5 MB of 50 MB</Text>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <SettingRow
            icon="❓"
            label="Help & FAQ"
            value="›"
            onPress={() => {}}
          />

          <SettingRow
            icon="📧"
            label="Contact Support"
            value="›"
            onPress={() => {}}
          />

          <SettingRow
            icon="📄"
            label="Terms & Privacy"
            value="›"
            onPress={() => {}}
          />

          <SettingRow
            icon="ℹ️"
            label="App Version"
            value="1.0.0"
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => {
            Alert.alert(
              'Delete Account',
              'This action cannot be undone. All your data will be permanently deleted.',
              [
                { text: 'Cancel', onPress: () => {} },
                {
                  text: 'Delete',
                  onPress: () => console.log('Account deleted'),
                  style: 'destructive',
                },
              ]
            );
          }}
        >
          <Text style={styles.deleteButtonText}>⚠️ Delete Account</Text>
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
  content: {
    flex: 1,
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
  profileCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  profileIcon: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
  },
  profileEmail: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  profileDate: {
    ...theme.typography.tiny,
    color: theme.colors.textTertiary,
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
    fontSize: 20,
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  chevron: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
  },
  storageInfo: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  storageLabel: {
    ...theme.typography.bodyBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  storageBar: {
    height: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: theme.colors.secondary,
  },
  storageText: {
    ...theme.typography.tiny,
    color: theme.colors.textSecondary,
  },
  logoutButton: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.lg,
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
  deleteButton: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    ...theme.typography.bodyBold,
    color: theme.colors.danger,
    opacity: 0.6,
  },
  spacer: {
    height: theme.spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SettingsScreen;
