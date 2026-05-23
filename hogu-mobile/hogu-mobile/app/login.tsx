import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_BASE = 'http://192.168.1.6:5000';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Store user email
      await SecureStore.setItemAsync('hogu.user_email', trimmed);
      await SecureStore.setItemAsync('hogu.user_data', JSON.stringify(data));

      console.log('[Login] ✅ Authenticated:', trimmed, 'Connected accounts:', data.connectedAccounts?.length || 0);

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (e: any) {
      console.error('[Login] Error:', e);
      setError('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#131313' }}
    >
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ fontSize: 36, fontWeight: '900', color: '#caf300', letterSpacing: 2 }}>HOG-U</Text>
          <Text style={{ fontSize: 12, color: '#c5c9ac', marginTop: 8, letterSpacing: 1 }}>THE ENGINE OF ELITE PERFORMANCE</Text>
        </View>

        {/* Email input */}
        <View style={{ gap: 16 }}>
          <View>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#c5c9ac', letterSpacing: 1, marginBottom: 8 }}>EMAIL ADDRESS</Text>
            <TextInput
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
              placeholder="your@email.com"
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={{
                backgroundColor: 'rgba(32, 32, 31, 0.8)',
                borderWidth: 1,
                borderColor: error ? '#ff4444' : 'rgba(68, 73, 50, 0.5)',
                borderRadius: 8,
                padding: 16,
                fontSize: 16,
                color: '#ffffff',
              }}
              onSubmitEditing={handleLogin}
            />
          </View>

          {error ? (
            <Text style={{ color: '#ff6b6b', fontSize: 12, fontWeight: '600' }}>{error}</Text>
          ) : null}

          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => ({
              backgroundColor: loading ? '#8a9e00' : '#caf300',
              paddingVertical: 18,
              borderRadius: 8,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
              shadowColor: '#caf300',
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            })}
          >
            {loading ? (
              <ActivityIndicator color="#131313" />
            ) : (
              <Text style={{ color: '#131313', fontSize: 14, fontWeight: '800', letterSpacing: 1 }}>SIGN IN</Text>
            )}
          </Pressable>
        </View>

        {/* Footer */}
        <View style={{ alignItems: 'center', marginTop: 32 }}>
          <Text style={{ fontSize: 11, color: '#555', textAlign: 'center', lineHeight: 18 }}>
            Sign in to sync your fitness trackers{'\n'}and get personalized recommendations.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
