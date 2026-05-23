import { View, Text, ScrollView, ImageBackground, Pressable, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import * as Font from 'expo-font';

const API_BASE = 'http://192.168.1.6:5000';

export default function LandingScreen() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [stravaConnected, setStravaConnected] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [stravaName, setStravaName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    Font.loadAsync({
      'Oswald-Bold': require('@expo-google-fonts/oswald/700Bold/Oswald_700Bold.ttf'),
    }).then(() => setFontsLoaded(true)).catch(() => {});
    checkConnections();
  }, []);

  const checkConnections = async () => {
    const email = await SecureStore.getItemAsync('hogu.user_email');
    if (!email) return;
    setUserEmail(email);

    try {
      const res = await fetch(`${API_BASE}/api/accounts?email=${encodeURIComponent(email)}`);
      const accounts = await res.json();
      if (Array.isArray(accounts)) {
        const strava = accounts.find((a: any) => a.provider === 'strava');
        const google = accounts.find((a: any) => a.provider === 'google_fit');
        setStravaConnected(!!strava);
        setGoogleConnected(!!google);
        if (strava?.athleteName) setStravaName(strava.athleteName);
      }
    } catch (e) {
      console.log('[Home] Could not reach backend, using cached state');
      // Fall back to cached data
      const cached = await SecureStore.getItemAsync('hogu.user_data');
      if (cached) {
        const data = JSON.parse(cached);
        const accounts = data.connectedAccounts || [];
        setStravaConnected(accounts.some((a: any) => a.provider === 'strava'));
        setGoogleConnected(accounts.some((a: any) => a.provider === 'google_fit'));
      }
    }
  };

  const handleConnectStrava = async () => {
    if (stravaConnected) {
      Alert.alert('Strava Linked', `Connected as ${stravaName || userEmail}`);
      return;
    }
    try {
      setConnecting('strava');
      // Open backend OAuth URL in browser
      await WebBrowser.openBrowserAsync(`${API_BASE}/auth/strava/start?email=${encodeURIComponent(userEmail)}`);
      // After returning, re-check connections
      await checkConnections();
    } catch (e: any) {
      Alert.alert('Connection Failed', e.message || 'Could not connect to Strava');
    } finally {
      setConnecting(null);
    }
  };

  const handleConnectGoogle = async () => {
    if (googleConnected) {
      Alert.alert('Google Fit Linked', `Connected as ${userEmail}`);
      return;
    }
    try {
      setConnecting('google');
      await WebBrowser.openBrowserAsync(`${API_BASE}/auth/google/start?email=${encodeURIComponent(userEmail)}`);
      await checkConnections();
    } catch (e: any) {
      Alert.alert('Connection Failed', e.message || 'Could not connect to Google Fit');
    } finally {
      setConnecting(null);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await SecureStore.deleteItemAsync('hogu.user_email');
          await SecureStore.deleteItemAsync('hogu.user_data');
          router.replace('/login' as any);
        }
      },
    ]);
  };
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#131313' }} contentContainerStyle={{ paddingBottom: 30 }}>
      <ImageBackground
        source={{
          uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBFDf1nkGG0ibxlJW-l4zWlgWhpYAw1aWHwAg3ONP6kIbzF9B3XL4mHqDzj21zl1dQJJDeMKUwIENC8Vy4Bv3hPIr2Q_7pW6deoX0JE5wQxkYbWq9iIMA-kCeGMPhio2etnLYgBQ0cfFvGeOgJH12MQl9rpPvxhJUYUgnpf09ArVSynMJcvnLUlv7NdA4ivKpbLGzPoigeM-qF0O4XMCFj8F93V-jZ5yLpzuPjYOuMJU9Kraw1Oh9c4lv9WlRV5AM4Lp4c4JBjOO8FM',
        }}
        style={{ width: '100%', height: 480, justifyContent: 'center', alignItems: 'center', backgroundColor: '#131313' }}
        imageStyle={{ opacity: 0.6, resizeMode: 'cover' }}
      >
        <LinearGradient colors={['rgba(19, 19, 19, 0.3)', 'rgba(19, 19, 19, 1)']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ paddingHorizontal: 20, alignItems: 'center', marginTop: -120 }}>
          <Text style={{ fontSize: 48, fontFamily: fontsLoaded ? 'Oswald-Bold' : undefined, fontWeight: fontsLoaded ? undefined : '800', color: '#ffffff', textAlign: 'center', lineHeight: 56, letterSpacing: 1 }}>SWEAT. TRACK.{'\n'}<Text style={{ color: '#caf300' }}>CONQUER.</Text></Text>
        </View>
      </ImageBackground>
      <View style={{ padding: 20, gap: 16, marginTop: -60 }}>
        <Text style={{ fontSize: 16, color: '#c5c9ac', textAlign: 'center', lineHeight: 24, marginHorizontal: 10, marginBottom: 4 }}>Aggressive tracking. Real-time bio-data. Zero excuses. HOG-U is the technical backbone for elite performance.</Text>
        <View style={{ borderRadius: 12, borderWidth: 1, borderColor: 'rgba(68, 73, 50, 0.5)', overflow: 'hidden' }}>
          <ImageBackground source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDo84_YWPhNwcHsCj8a2c9wBgl5Fvj7kbPqRWYZrjFggM6vXUlYd7IKuhjXO4TQEmk6d8KeKpZx0UvsW4Enm3V1QpIanMnE1SIxIbS4qQyc5YALH40L3nAQW4UoQOuiFK1flsbtsxf3ZEljqncNPsyNuSXy4HjHUqmJ-rSD9xsn03lizRXnYfEHJgkTFDv5XDbpHYFTCdrA0gWwyX6Ml0uL__bjCmJSBO_jGOVFtXuIuMeM1CI3Rinas3JR3YmrnJ7LyOc1t5oNJfvN' }} style={{ width: '100%' }} imageStyle={{ opacity: 0.45, resizeMode: 'cover' }}>
          <LinearGradient colors={['rgba(19, 19, 19, 0.2)', 'rgba(19, 19, 19, 0.75)']} style={{ padding: 20, gap: 16 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#caf300', letterSpacing: 1 }}>INTEGRATION</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>Multi-Tracker Sync</Text>
          <Text style={{ fontSize: 14, color: '#c5c9ac', lineHeight: 20 }}>Connect your fitness accounts to sync workout data automatically.</Text>

          {/* Strava Connect */}
          <Pressable
            onPress={handleConnectStrava}
            disabled={connecting === 'strava'}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: stravaConnected ? 'rgba(32, 32, 31, 0.7)' : 'rgba(32, 32, 31, 0.7)',
              borderWidth: 1, borderColor: stravaConnected ? 'rgba(68, 73, 50, 0.5)' : 'rgba(68, 73, 50, 0.5)',
              borderRadius: 8, padding: 14, opacity: pressed ? 0.8 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(252, 76, 2, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fc4c02' }}>S</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>Strava</Text>
                <Text style={{ fontSize: 11, color: stravaConnected ? '#caf300' : '#c5c9ac' }}>
                  {stravaConnected ? `Connected${stravaName ? ` · ${stravaName}` : ''}` : 'Tap to connect'}
                </Text>
              </View>
            </View>
            {connecting === 'strava' ? (
              <ActivityIndicator size="small" color="#fc4c02" />
            ) : (
              <View style={{ backgroundColor: stravaConnected ? '#caf300' : '#fc4c02', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: stravaConnected ? '#131313' : '#ffffff', letterSpacing: 0.5 }}>
                  {stravaConnected ? 'LINKED' : 'CONNECT'}
                </Text>
              </View>
            )}
          </Pressable>

          {/* Google Fit Connect */}
          <Pressable
            onPress={handleConnectGoogle}
            disabled={connecting === 'google'}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
              backgroundColor: googleConnected ? 'rgba(32, 32, 31, 0.7)' : 'rgba(32, 32, 31, 0.7)',
              borderWidth: 1, borderColor: googleConnected ? 'rgba(68, 73, 50, 0.5)' : 'rgba(68, 73, 50, 0.5)',
              borderRadius: 8, padding: 14, opacity: pressed ? 0.8 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(66, 133, 244, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#4285f4' }}>G</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#ffffff' }}>Google Fit</Text>
                <Text style={{ fontSize: 11, color: googleConnected ? '#caf300' : '#c5c9ac' }}>
                  {googleConnected ? 'Connected' : 'Tap to connect'}
                </Text>
              </View>
            </View>
            {connecting === 'google' ? (
              <ActivityIndicator size="small" color="#4285f4" />
            ) : (
              <View style={{ backgroundColor: googleConnected ? '#caf300' : '#4285f4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: googleConnected ? '#131313' : '#ffffff', letterSpacing: 0.5 }}>
                  {googleConnected ? 'LINKED' : 'CONNECT'}
                </Text>
              </View>
            )}
          </Pressable>

          </LinearGradient>
          </ImageBackground>
        </View>
        <Pressable style={({ pressed }) => ({ backgroundColor: 'rgba(32, 32, 31, 0.7)', borderRadius: 12, borderWidth: 1, borderColor: pressed ? '#caf300' : 'rgba(68, 73, 50, 0.5)', overflow: 'hidden', opacity: pressed ? 0.8 : 1 })}>
          <ImageBackground source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCggX281mr2Hsm2wu7CyZGlIUuJKheugxRadGcb2a1LbNM9egAZT9PeZ5Eiz0foW-1OmCDBViaCloiivVe4pAIYnv3K3ChfuXl8DMlG8mNE52qkfiCKy8wL9_ukMy-1oyGkx0t9eHQF6AJP91HUe2r8dUnBL-WsFLCyKUOOfg_5T6YYXusJ7r4neK9qrGhg8ExsAI32vfjsQhBm52UoQQ1MIcAVLrQksrKbE-PvdsTPDQ5J-g9ZW6Ej5C_WdcxFjgw0i8JNIK-DNpRB' }} style={{ width: '100%' }} imageStyle={{ opacity: 0.3, resizeMode: 'cover' }}>
            <LinearGradient colors={['rgba(19, 19, 19, 0.2)', 'rgba(19, 19, 19, 0.8)']} style={{ padding: 20, gap: 12 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ffb1c3', letterSpacing: 1 }}>FUEL</Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff' }}>AI Meal Engine</Text>
              <Text style={{ fontSize: 14, color: '#c5c9ac', lineHeight: 20 }}>Intelligent recovery meals tailored to your workout. Get personalized macros for optimal glycogen replenishment, electrolyte balance, and muscle repair.</Text>
              <View style={{ backgroundColor: 'rgba(42, 42, 42, 0.6)', borderRadius: 8, padding: 12, marginTop: 8, borderLeftWidth: 4, borderLeftColor: '#caf300', gap: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#c5c9ac', letterSpacing: 0.5 }}>TAP MEALS TAB FOR YOUR RECOMMENDATION</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#caf300' }}>🍽️ Smart Nutrition Analysis</Text>
                <Text style={{ fontSize: 10, color: '#c5c9ac' }}>Based on activity type, intensity & biometrics</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </Pressable>
        <View style={{ height: 20 }} />
        {/* Account & Logout */}
        <View style={{ backgroundColor: 'rgba(32, 32, 31, 0.5)', borderRadius: 8, padding: 16, alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 11, color: '#c5c9ac' }}>Signed in as <Text style={{ color: '#caf300', fontWeight: '700' }}>{userEmail}</Text></Text>
          <Pressable onPress={handleLogout} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: 11, color: '#ff6b6b', fontWeight: '600' }}>SIGN OUT</Text>
          </Pressable>
        </View>
        {/* Contact for Collabs & Endorsements */}
        <View style={{ backgroundColor: 'rgba(32, 32, 31, 0.5)', borderRadius: 8, padding: 16, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: 'rgba(68, 73, 50, 0.3)' }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#caf300', letterSpacing: 1 }}>COLLABS & ENDORSEMENTS</Text>
          <View style={{ gap: 6, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#ffffff', fontWeight: '600' }}>Dheeraj <Text style={{ color: '#c5c9ac', fontWeight: '400' }}>@Crispy_Dosee</Text></Text>
            <Text style={{ fontSize: 13, color: '#ffffff', fontWeight: '600' }}>Pratheeka <Text style={{ color: '#c5c9ac', fontWeight: '400' }}>@pratheeka_deepak</Text></Text>
          </View>
        </View>
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}
