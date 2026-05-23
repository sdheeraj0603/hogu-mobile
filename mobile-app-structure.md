# HOG-U React Native Mobile App - Structure & UI Design

## Project Setup
```bash
npx create-expo-app hogu-mobile
cd hogu-mobile
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-gesture-handler react-native-reanimated
npm install axios moment
```

## Folder Structure
```
hogu-mobile/
├── app/
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── ActivityDetailScreen.js
│   │   ├── TrackersScreen.js
│   │   └── SettingsScreen.js
│   ├── components/
│   │   ├── ActivityCard.js
│   │   ├── MealCard.js
│   │   ├── Header.js
│   │   └── BottomTabBar.js
│   ├── services/
│   │   ├── api.js
│   │   └── auth.js
│   ├── styles/
│   │   └── theme.js
│   └── App.js
├── package.json
└── app.json
```

## Color Scheme & Theme
```javascript
const theme = {
  colors: {
    primary: '#1a7f63',      // Teal Green
    secondary: '#4ade80',    // Light Green
    background: '#0a0a0a',   // Dark background
    card: 'rgba(255,255,255,0.03)',
    border: 'rgba(255,255,255,0.1)',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    success: '#4ade80',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700' },
    h2: { fontSize: 24, fontWeight: '700' },
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 14, fontWeight: '400' },
    small: { fontSize: 12, fontWeight: '400' }
  }
};
```

## Key Screens

### 1. Login Screen
- Email input field
- Password input field
- Login button
- Sign up link
- Forgot password link

### 2. Dashboard Screen (Main)
- Header with user greeting
- Tracker status badges
- "Sync Workouts" button (prominent)
- Activity cards list (scrollable)
- Pull-to-refresh functionality
- Empty state with illustration

### 3. Activity Detail Screen
- Full activity info (name, type, distance, elevation)
- Weather data (temperature, humidity, timestamp)
- Intensity visualization (graph/bar)
- Meal recommendation card with Zomato link
- Location map (optional)
- Share button

### 4. Trackers Screen
- Connected trackers list
- Tracker status (✅ Connected / ❌ Disconnected)
- Connect new tracker button
- Disconnect option per tracker

### 5. Settings Screen
- User profile section
- Notification preferences
- Data export option
- Logout button

## UI/UX Features
- Bottom tab navigation
- Smooth animations
- Loading states with skeleton screens
- Error handling with retry buttons
- Offline indicator
- Last sync timestamp
- Swipe to refresh
- Haptic feedback on actions

## Performance Optimizations
- Lazy loading images
- Memoized components
- Efficient list rendering (FlatList)
- Caching API responses
- Background sync job
