#!/usr/bin/env bash

# ================================================================
# HOG-U MOBILE APP - GET STARTED
# ================================================================
# This file tells you exactly what to do to get the app running
# ================================================================

cat << 'EOF'

🏃 HOG-U MOBILE APP
═══════════════════════════════════════════════════════════════

WHAT YOU HAVE:
  ✅ App-Minimal.js      (Complete working app, 20KB, ~800 lines)
  ✅ README-APP.md        (5-minute setup guide)
  ✅ IMPLEMENTATION.md    (Technical overview)

WHAT YOU NEED TO DO:

STEP 1: Create Expo Project (2 min)
───────────────────────────────────────────────────────────────
$ npx create-expo-app hogu-mobile
$ cd hogu-mobile

STEP 2: Install Dependencies (3 min)
───────────────────────────────────────────────────────────────
$ npm install @react-native-async-storage/async-storage

STEP 3: Copy Our App (1 min)
───────────────────────────────────────────────────────────────
$ cp ../App-Minimal.js ./App.js

STEP 4: Get Strava Token (1 min)
───────────────────────────────────────────────────────────────
1. Visit: https://www.strava.com/settings/apps
2. Look for "Your Access Token"
3. Copy it (looks like: 12345abc...xyz)

STEP 5: Add Token to App (1 min)
───────────────────────────────────────────────────────────────
$ Open App.js in your editor
$ Find line ~100: const testToken = 'YOUR_STRAVA_ACCESS_TOKEN';
$ Replace with your token: const testToken = '12345abc...xyz';
$ Save file

STEP 6: Run App (2 min)
───────────────────────────────────────────────────────────────
$ npm start

Then choose:
  i  → iOS Simulator (Mac)
  a  → Android Emulator
  QR → Scan with Expo Go on your phone

═══════════════════════════════════════════════════════════════
TOTAL TIME: ~10 minutes

WHAT YOU'LL SEE:
  1. Login screen with token input
  2. Your Strava activities in a list
  3. Settings with logout option

KEY FEATURES:
  ✓ View all Strava activities
  ✓ See distance, time, speed
  ✓ Pull-to-refresh to sync
  ✓ Dark theme
  ✓ Logout anytime

═══════════════════════════════════════════════════════════════

TROUBLESHOOTING:

Token invalid?
  → Get new one: https://www.strava.com/settings/apps

Activities don't load?
  → Check internet connection
  → Verify token is correct (no extra spaces)

Module error?
  → Run: npm install
  → Make sure you're in hogu-mobile folder

Simulator won't start?
  → Kill Expo: pkill -f expo
  → Run: npm start again

═══════════════════════════════════════════════════════════════

THAT'S IT! 🚀

Your app should now show your real Strava data.

Next: Read IMPLEMENTATION.md for technical details on how the
code works and what you can customize.

═══════════════════════════════════════════════════════════════

EOF

echo ""
echo "Ready? Run the 6 steps above! 💪"
echo ""
