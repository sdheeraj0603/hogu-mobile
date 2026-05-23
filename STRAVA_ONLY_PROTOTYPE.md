# HOG-U Strava-Only Mobile App Prototype

## 🎯 Simplified Scope (Strava Only)

This is a **focused prototype** that:
- ✅ Works exclusively with Strava API
- ✅ Displays your activities from Strava
- ✅ Shows meal recommendations
- ✅ No multi-tracker complexity
- ✅ Fast to build and test
- ✅ Easy to extend later

---

## 📋 What We're Building

### 3 Simple Screens Only

1. **Login Screen** → Enter Strava credentials
2. **Dashboard Screen** → Show activities from Strava (MAIN)
3. **Settings Screen** → Logout, app info

**No need for:**
- Tracker management tab (only Strava)
- Complex navigation
- Multi-tracker adapters
- User authentication system (use Strava OAuth)

---

## 🏗️ Simplified Architecture

```
Strava API
    ↓
┌─────────────────┐
│ Mobile App      │
│ (React Native)  │
└─────────────────┘
    ↓
┌─────────────────┐
│ Display         │
│ Activities      │
└─────────────────┘
```

**That's it!** No database, no user auth system, no multi-tracker logic.

---

## 📱 Screens to Build

### Screen 1: Strava Login
```
┌─────────────────────┐
│   HOG-U 🏃         │
│ Performance Nut.   │
│                   │
│ [Login with Strava]│ ← OAuth button
│                   │
└─────────────────────┘
```

### Screen 2: Dashboard (Main)
```
┌──────────────────────┐
│ Welcome!             │
│ 📍 Bangalore         │
├──────────────────────┤
│ [⟳ Sync Activities] │
├──────────────────────┤
│ Activity Card 1      │
│ Run | Poha           │
├──────────────────────┤
│ Activity Card 2      │
│ Ride | Rice          │
│ [Pull to refresh]    │
└──────────────────────┘
```

### Screen 3: Settings
```
┌──────────────────────┐
│ Settings             │
├──────────────────────┤
│ 🟢 Strava Connected  │
│                      │
│ [Logout]             │
│ [About HOG-U]        │
│                      │
└──────────────────────┘
```

---

## 📂 Simplified File Structure

```
hogu-mobile/
├── App.js                    ← Navigation (simple)
├── theme.js                  ← Colors & styles (reuse)
├── strava-api.js             ← Strava OAuth only
├── screens/
│   ├── StravaLoginScreen.js  ← Strava OAuth
│   ├── DashboardScreen.js    ← Activities list
│   └── SettingsScreen.js     ← Logout
└── components/
    └── ActivityCard.js       ← Reuse from before
```

---

## 🎯 Timeline

- **Code**: 3-4 hours
- **Testing**: 1-2 hours
- **Total**: 5 hours
- **Ready**: Today/Tomorrow

---

## 🚀 Next Steps

1. Build simplified `App.js` (tab navigation: Home + Settings only)
2. Build `StravaLoginScreen.js` (OAuth button)
3. Build `DashboardScreen.js` (show Strava activities)
4. Build `SettingsScreen.js` (logout)
5. Reuse `ActivityCard.js` and `theme.js` from before
6. Test with real Strava account

---

## ✨ Advantages of This Approach

- ✅ **Fast**: 5 hours vs 3-4 weeks
- ✅ **Simple**: No complexity
- ✅ **Works**: Use existing Strava integration
- ✅ **Testable**: Real activities from your Strava
- ✅ **Extendable**: Easy to add Fitbit/Google Fit later
- ✅ **No Database**: No backend setup needed
- ✅ **No Auth System**: Use Strava OAuth directly

---

**Ready to build?** I'll create the simplified prototype files next! 📱
