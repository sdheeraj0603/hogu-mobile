#!/bin/bash

# HOG-U BUILD PROGRESS TRACKER
# Run this script to see what you've completed so far

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        🏃 HOG-U MOBILE APP - BUILD PROGRESS                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
echo -n "✓ Node.js installed? "
if command -v node &> /dev/null; then
  echo "✅ YES ($(node --version))"
else
  echo "❌ NO - Install from https://nodejs.org/"
fi

# Check if Expo project exists
echo -n "✓ Expo project created? "
if [ -d "hogu-mobile" ]; then
  echo "✅ YES"
else
  echo "❌ NO - Run: npx create-expo-app hogu-mobile"
fi

# Check if App.js exists
echo -n "✓ App.js copied? "
if [ -f "hogu-mobile/App.js" ]; then
  echo "✅ YES"
else
  echo "❌ NO - Run: cp ../App-Minimal.js ./App.js"
fi

# Check if AsyncStorage installed
echo -n "✓ AsyncStorage installed? "
if [ -d "hogu-mobile/node_modules/@react-native-async-storage" ]; then
  echo "✅ YES"
else
  echo "❌ NO - Run: npm install @react-native-async-storage/async-storage"
fi

# Check if token is in App.js
echo -n "✓ Strava token added? "
if grep -q "a1b2c3d4e5f6" hogu-mobile/App.js 2>/dev/null || grep -q "const testToken = '[^Y]" hogu-mobile/App.js 2>/dev/null; then
  echo "✅ YES"
else
  echo "❌ NO - Edit hogu-mobile/App.js line ~100 and add your token"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      NEXT STEP                             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Run in hogu-mobile folder:"
echo ""
echo "  npm start"
echo ""
echo "Then press 'i' (iOS) or 'a' (Android) or scan QR code"
echo ""
echo "📖 Full guide: Read BUILD_GUIDE.md"
echo ""
