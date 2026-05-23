#!/bin/bash
# HOG-U Mobile App - One-Click Setup

echo "🏃 HOG-U Mobile App Setup"
echo "========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Create Expo project
echo "📦 Creating Expo project..."
npx create-expo-app hogu-mobile --template

cd hogu-mobile

# Copy minimal app file
echo "📄 Setting up app..."
cp ../App-Minimal.js ./App.js
cp ../expo-app.json ./app.json

# Install dependencies
echo "📥 Installing dependencies..."
npm install @react-native-async-storage/async-storage

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Get Strava token: https://www.strava.com/settings/apps"
echo "2. Edit App.js line ~100, replace YOUR_TEST_TOKEN_HERE with your token"
echo "3. Run: npm start"
echo "4. Press 'i' for iOS or 'a' for Android"
echo ""
echo "🚀 Ready to go!"
