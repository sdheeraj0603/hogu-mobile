// StravaLoginScreen.js - Simplified Strava OAuth Login
// Just show a "Login with Strava" button
// No email/password complexity

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { theme } from '../theme';

const StravaLoginScreen = ({ route }) => {
  const [loading, setLoading] = useState(false);
  const { onLoginSuccess } = route.params || {};

  // Strava OAuth Config
  const STRAVA_CLIENT_ID = 'YOUR_STRAVA_CLIENT_ID';
  const REDIRECT_URI = 'hogu-mobile://strava-callback';
  const STRAVA_AUTH_URL = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=activity:read`;

  const handleStravaLogin = async () => {
    try {
      setLoading(true);

      // For development: Use a test token or manual OAuth flow
      // For production: Implement proper OAuth callback handling

      // For now, you can manually get a token from Strava:
      // 1. Go to https://www.strava.com/settings/apps
      // 2. Create an app (OAuth Application)
      // 3. Get the access token

      const testToken = 'YOUR_STRAVA_ACCESS_TOKEN';

      if (!testToken || testToken === 'YOUR_STRAVA_ACCESS_TOKEN') {
        Alert.alert(
          'Setup Required',
          'Please add your Strava access token to StravaLoginScreen.js',
          [
            {
              text: 'Get Token',
              onPress: () => {
                Linking.openURL('https://www.strava.com/settings/apps');
              },
            },
            { text: 'OK', onPress: () => {} },
          ]
        );
        return;
      }

      // Call the success callback
      if (onLoginSuccess) {
        onLoginSuccess(testToken);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to login with Strava');
      console.error('Strava login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Text style={styles.logo}>HOG-U</Text>
          <Text style={styles.tagline}>Performance Nutrition</Text>
        </View>

        {/* Welcome Message */}
        <View style={styles.messageSection}>
          <Text style={styles.title}>Welcome to HOG-U</Text>
          <Text style={styles.subtitle}>
            See your Strava activities and get personalized meal recommendations based on your workouts.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Feature icon="🏃" text="Sync activities from Strava" />
          <Feature icon="🍽️" text="Get personalized meal recommendations" />
          <Feature icon="🌡️" text="Weather-aware nutrition tips" />
          <Feature icon="📍" text="Location-based restaurant links" />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, loading && styles.buttonDisabled]}
          onPress={handleStravaLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.text} size="small" />
          ) : (
            <>
              <Text style={styles.loginIcon}>🏃</Text>
              <Text style={styles.loginText}>Login with Strava</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info Text */}
        <Text style={styles.infoText}>
          We use your Strava account to fetch your activities securely.
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        🏃 Powered by Strava • 🍽️ Powered by Open-Meteo
      </Text>
    </View>
  );
};

const Feature = ({ icon, text }) => (
  <View style={styles.featureRow}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: theme.spacing.xxl,
  },
  logo: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
    fontWeight: '800',
  },
  tagline: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  messageSection: {
    marginVertical: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  featuresSection: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: theme.spacing.md,
  },
  featureText: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 1,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  loginText: {
    ...theme.typography.h4,
    color: theme.colors.text,
    fontWeight: '700',
  },
  infoText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  footer: {
    ...theme.typography.tiny,
    color: theme.colors.textTertiary,
    textAlign: 'center',
  },
});

export default StravaLoginScreen;
