import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ExploreScreen() {
  return (
    <LinearGradient
      colors={['rgba(202, 243, 0, 0.1)', 'rgba(19, 19, 19, 1)']}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}
    >
      <View style={{ alignItems: 'center', gap: 20 }}>
        <Text style={{ fontSize: 32, fontWeight: '800', color: '#caf300' }}>🚀</Text>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#ffffff', textAlign: 'center' }}>
          Coming Soon
        </Text>
        <Text style={{ fontSize: 14, color: '#c5c9ac', textAlign: 'center', lineHeight: 20 }}>
          More features and advanced analytics coming to HOG-U soon.
        </Text>
        
        <View
          style={{
            backgroundColor: 'rgba(202, 243, 0, 0.1)',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(202, 243, 0, 0.3)',
            padding: 16,
            width: '100%',
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#caf300', letterSpacing: 0.5 }}>
            PLANNED FEATURES:
          </Text>
          <Text style={{ fontSize: 12, color: '#c5c9ac', lineHeight: 18 }}>
            💪 Advanced Performance Analytics{'\n'}
            🍽️ AI Meal Recommendations{'\n'}
            🏆 Global Leaderboards{'\n'}
            📊 Training Intelligence
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
