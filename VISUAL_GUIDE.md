# HOG-U BUILD - VISUAL FLOW DIAGRAM

## 📊 WHAT HAPPENS WHEN YOU BUILD

```
START
  |
  ├─→ PHASE 1: CREATE EXPO PROJECT
  |    ├─ npx create-expo-app hogu-mobile
  |    ├─ cd hogu-mobile
  |    └─ npm install @react-native-async-storage/async-storage
  |    └─→ ✅ Ready to code
  |
  ├─→ PHASE 2: ADD APP CODE
  |    ├─ cp ../App-Minimal.js ./App.js
  |    └─→ ✅ App file in place
  |
  ├─→ PHASE 3: GET STRAVA TOKEN
  |    ├─ https://www.strava.com/settings/apps
  |    ├─ Copy "Your Access Token"
  |    └─→ ✅ Token in clipboard
  |
  ├─→ PHASE 4: ADD TOKEN TO APP
  |    ├─ Open App.js in editor
  |    ├─ Find line ~100: const testToken = 'YOUR...'
  |    ├─ Paste your token
  |    ├─ Save file
  |    └─→ ✅ Token in code
  |
  ├─→ PHASE 5: RUN APP
  |    ├─ npm start
  |    ├─ Metro bundler starts (30-60 sec)
  |    ├─ Press 'i' (iOS) or 'a' (Android)
  |    ├─ App compiles (30-60 sec)
  |    └─→ ✅ App opens on device
  |
  └─→ SUCCESS! 🎉

```

---

## 🖥️ WHAT YOU'LL SEE ON SCREEN

### SCREEN 1: Login Screen
```
┌─────────────────────────────────────┐
│                                     │
│          🏃 HOG-U                   │
│   Performance Nutrition             │
│                                     │
│   What You Get:                     │
│   🏃 Sync Strava activities         │
│   🍽️ Nutrition recommendations      │
│   🌡️ Weather during workouts        │
│   📍 Location names                 │
│                                     │
│   Strava Access Token               │
│   ┌──────────────────────────────┐  │
│   │ Paste token here...          │  │
│   └──────────────────────────────┘  │
│                                     │
│   [ Login with Strava ]             │
│                                     │
└─────────────────────────────────────┘

YOUR ACTION:
1. Tap input field
2. Paste your token
3. Tap "Login with Strava"
4. Wait 2-3 seconds...
```

### SCREEN 2: Dashboard (After Login)
```
┌─────────────────────────────────────┐
│ Activities              🚪           │
├─────────────────────────────────────┤
│                                     │
│ 🏃 Morning Run                      │
│ 10.82 km  |  52 min  |  12.5 km/h  │
│ 2024-05-08                          │
│                                     │
│ 🚴 Evening Ride                     │
│ 25.3 km   |  90 min  |  16.8 km/h  │
│ 2024-05-07                          │
│                                     │
│ 🏃 Park Run                         │
│ 5.2 km    |  28 min  |  11.1 km/h  │
│ 2024-05-06                          │
│                                     │
│                            ⟳ Sync   │
└─────────────────────────────────────┘

YOUR ACTIONS:
- Scroll: List scrolls
- Swipe down: Refresh
- Tap ⟳: Sync button
- Tap 🚪: Logout
```

---

## 🔄 DATA FLOW IN APP

```
User enters token
      ↓
Validates with Strava API
      ↓ (Token valid?)
      YES
      ↓
Stores token in AsyncStorage (on device)
      ↓
Shows Dashboard screen
      ↓
Fetches activities from Strava API
      ↓
Shows activity list
      ↓
User can pull-to-refresh
      ↓
App fetches latest activities
      ↓
List updates
      ↓
User can logout
      ↓
Token cleared from device
      ↓
Back to login screen
```

---

## 🌐 NETWORK CALLS

```
APP                           STRAVA API
 |                                 |
 ├─ POST /athlete (validate token) →
 │                                 ├─ Check token
 ←─ 200 OK + athlete info ←────────┤
 |                                 |
 ├─ GET /athlete/activities ───────→
 │                                 ├─ Fetch activities
 ←─ 200 OK + [activities] ←────────┤
 |                                 |
 ├─ GET /athlete/activities ───────→
 │  (on pull-to-refresh)           ├─ Fetch again
 ←─ 200 OK + [activities] ←────────┤
 |                                 |
```

---

## 📂 FOLDER STRUCTURE (FINAL)

```
/Users/sdheeraj/VS-new/
├── hogu-mobile/                    ← Your app folder
│   ├── App.js                      ← Your app (from App-Minimal.js)
│   ├── app.json                    ← Config
│   ├── package.json                ← Dependencies list
│   ├── node_modules/               ← Installed packages
│   │   ├── react/
│   │   ├── react-native/
│   │   ├── @react-native-async-storage/
│   │   └── ...
│   ├── .gitignore
│   └── ...
│
├── App-Minimal.js                  ← Original file (reference)
├── BUILD_GUIDE.md                  ← Detailed guide
├── QUICK_REFERENCE.md              ← This quick ref
├── IMPLEMENTATION.md               ← How code works
├── README-APP.md                   ← Setup instructions
├── GET_STARTED.sh                  ← Quick start
├── check-progress.sh               ← Progress checker
└── ... (other files)
```

---

## ⏱️ TIMELINE

```
TIME  ACTIVITY                    WHAT'S HAPPENING
────────────────────────────────────────────────────
0:00  Start Phase 1              Creating Expo project
0:05  Phase 2                    Copying app code
0:07  Phase 3                    Getting Strava token
0:12  Phase 4                    Adding token to app
0:15  Phase 5                    Running npm start
0:30  ← Metro bundler compiles   Creating bundle
1:00  Pressing 'i' or 'a'        Starting simulator
1:30  ← App loads on device      Opening app
1:35  Login screen appears       ✅ See login screen
1:40  Pasting token + login      ✅ See dashboard
1:45  Dashboard loads            ✅ See activities
1:50  ✅ SUCCESS!
```

---

## ❌ COMMON MISTAKES

```
❌ MISTAKE 1: Forgetting to save App.js
   └─ FIX: Press Cmd+S after editing token

❌ MISTAKE 2: Wrong folder when running npm start
   └─ FIX: Make sure you're IN hogu-mobile folder
      cd hogu-mobile
      npm start

❌ MISTAKE 3: Token with spaces or extra characters
   └─ FIX: Copy-paste ONLY the token, no spaces
      a1b2c3d4e5f6... (clean token)
      NOT: "a1b2c3d4e5f6..." (with quotes)

❌ MISTAKE 4: Killing Metro before app loads
   └─ FIX: Wait 60 seconds for full load before pressing keys

❌ MISTAKE 5: Using old token
   └─ FIX: Get fresh token from settings/apps
```

---

## ✨ WHAT EACH FILE DOES

```
SETUP & CONFIG:
  package.json    ← Lists all dependencies
  app.json        ← Expo app configuration
  node_modules/   ← Installed libraries

APP CODE:
  App.js          ← Main app (login, dashboard, settings)
                    Contains: 3 screens + theme + API calls

YOUR CODES:
  hogu-mobile/    ← Your working app folder
```

---

## 🎯 CHECKPOINTS

| Checkpoint | Verification |
|-----------|--------------|
| 1. Project created | `ls hogu-mobile/` (folder exists) |
| 2. Code copied | `cat hogu-mobile/App.js` (shows code) |
| 3. Dependencies installed | `npm list --depth=0` (shows packages) |
| 4. Token added | `grep "const testToken" hogu-mobile/App.js` (shows YOUR token) |
| 5. Metro running | Terminal shows "Metro waiting on exp://..." |
| 6. Simulator/phone ready | Device shows Expo or simulator opened |
| 7. App compiled | Terminal shows "Compiled successfully" |
| 8. Login screen appears | You see 🏃 HOG-U on screen |
| 9. Token pasted | Token text shows in input |
| 10. Login clicked | Loading spinner appears |
| 11. Activities load | List of activities appears |
| 12. SUCCESS | ✅ App working! |

---

## 🚀 YOU'RE READY TO BUILD!

This is what will happen:
1. You run commands
2. Expo builds app
3. App opens on device
4. You log in with token
5. You see YOUR Strava data
6. **🎉 DONE!**

**Estimated time: 40 minutes**

**Next: Read BUILD_GUIDE.md for detailed steps**

---
