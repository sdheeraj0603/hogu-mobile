import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function AppEntry() {
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const email = await SecureStore.getItemAsync('hogu.user_email');
      if (email) {
        console.log('[App] User logged in:', email);
        router.replace('/(tabs)' as any);
      } else {
        console.log('[App] No user found, showing login');
        router.replace('/login' as any);
      }
    } catch (e) {
      router.replace('/login' as any);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#131313', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#caf300" />
    </View>
  );
}
