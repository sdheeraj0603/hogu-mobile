# 🚀 Build HOG-U Mobile App - Step-by-Step Guide

## Phase 1: Setup (15 minutes)

### Step 1.1: Create Expo Project
Open your terminal and run:

```bash
npx create-expo-app hogu-mobile
cd hogu-mobile
```

**What happens:**
- Creates a new Expo project
- Sets up basic React Native structure
- Ready for development

**Expected output:**
```
✓ Created hogu-mobile
✓ Dependencies installed
✓ Ready to run
```

### Step 1.2: Install Required Package
```bash
npm install @react-native-async-storage/async-storage
```

**What this does:**
- Adds AsyncStorage library (stores Strava token on device)
- Takes ~30 seconds

**Verify it worked:**
```bash
npm list @react-native-async-storage/async-storage
```

Should show: `@react-native-async-storage/async-storage@1.21.0`

---

## Phase 2: Add App Code (10 minutes)

### Step 2.1: Copy App-Minimal.js
From your `/Users/sdheeraj/VS-new` folder:

```bash
cp ../App-Minimal.js ./App.js
```

**What you're doing:**
- Replacing the default App.js with our complete app
- This file has everything: login, dashboard, settings

### Step 2.2: Verify File Copied
```bash
ls -la App.js
```

Should show: `-rw-r--r-- App.js`

---

## Phase 3: Get Strava Token (5 minutes)

### Step 3.1: Create Strava App
1. Go to: https://www.strava.com/settings/apps
2. Click **"Create New App"** if you don't have one
3. Fill in:
   - **Name**: "HOG-U Local"
   - **Website**: "http://localhost:3000" (for testing)
   - **Description**: "Nutrition tracking app"
4. Click **"Create"**

### Step 3.2: Get Access Token
1. You'll see: **Client ID**, **Client Secret**, **Access Token**
2. Look for "Your Access Token" (looks like: `12345abc...xyz`)
3. **Copy it** (the full token)

**Example token format:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

---

## Phase 4: Add Token to App (3 minutes)

### Step 4.1: Edit App.js
In your code editor (VS Code), open `hogu-mobile/App.js`

### Step 4.2: Find Line ~100
Search for: `const testToken = 'YOUR_STRAVA_ACCESS_TOKEN';`

It's in the `LoginScreen` function, around line 100.

### Step 4.3: Replace with Your Token
**Before:**
```javascript
const testToken = 'YOUR_STRAVA_ACCESS_TOKEN';
```

**After:**
```javascript
const testToken = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0';
```

(Paste YOUR actual token, not this example)

### Step 4.4: Save File
Press `Ctrl+S` (or `Cmd+S` on Mac)

---

## Phase 5: Run App (5 minutes)

### Step 5.1: Start Expo
In terminal (in `hogu-mobile` folder):

```bash
npm start
```

**What happens:**
- Metro bundler starts
- Compiles your app
- Shows QR code in terminal
- Takes ~30-60 seconds

**Expected output:**
```
Metro waiting on exp://...
Starting Expo server...
Tunnel ready.
```

### Step 5.2: Choose Device to Run On

**Option A: iOS Simulator (Mac only)**
```
Press 'i' to open iOS Simulator
```
- App opens automatically
- Takes ~30 seconds to load

**Option B: Android Emulator**
```
Press 'a' to open Android Emulator
```
- Need Android SDK installed
- Takes ~1 minute to load

**Option C: Your Phone (Easiest)**
1. Install **Expo Go** app:
   - iOS: App Store
   - Android: Google Play
2. In terminal, scan the QR code with your phone
3. App opens in Expo Go

---

## Phase 6: Test App (10 minutes)

### Screen 1: Login Screen
You should see:
- 🏃 **HOG-U** logo (large)
- "Performance Nutrition" subtitle
- 4 feature bullets
- Text input field for token
- Blue **"Login with Strava"** button

**What to do:**
1. Tap the input field
2. Paste your Strava token
3. Tap **"Login with Strava"** button

**Expected result:**
- Loading spinner appears
- After 2-3 seconds → navigates to Dashboard

### Screen 2: Dashboard
You should see:
- **Activities** header with logout button (🚪)
- List of your Strava activities loading
- Each card shows:
  - Activity type (🏃 Run, 🚴 Ride, etc.)
  - Activity name (e.g., "Morning Run")
  - Distance (km)
  - Duration (minutes)
  - Speed (km/h)
  - Date

**What to try:**
1. **Scroll down** - List should scroll smoothly
2. **Swipe down from top** - Pull-to-refresh (spinner appears, re-fetches activities)
3. **Tap ⟳ Sync button** (bottom right) - Refreshes activity list
4. **Tap 🚪 button** (top right) - Logout (dialog appears asking to confirm)

### Screen 3: Settings (Optional)
If you want to see settings:
1. Look for ⚙️ icon at bottom
2. Tap it
3. See your Strava profile info
4. Logout button available

---

## ✅ Checklist - You're Done If:

- [ ] `npx create-expo-app hogu-mobile` succeeded
- [ ] `npm install @react-native-async-storage/async-storage` succeeded
- [ ] Copied `App-Minimal.js` → `App.js`
- [ ] Got Strava token from https://www.strava.com/settings/apps
- [ ] Edited App.js with token (line ~100)
- [ ] Saved App.js file
- [ ] Ran `npm start`
- [ ] App opened on simulator/phone
- [ ] Login screen visible
- [ ] Pasted token and clicked login
- [ ] Activities list appeared
- [ ] Pull-to-refresh worked
- [ ] Logout button worked

---

## 🐛 Troubleshooting

### Problem: "Command not found: npx"
**Solution:**
- Install Node.js from https://nodejs.org/
- Restart terminal
- Try again

### Problem: "Token is invalid"
**Solution:**
1. Go to https://www.strava.com/settings/apps
2. Verify you're logged in to Strava
3. Copy token again (make sure no extra spaces)
4. Edit App.js and paste again
5. Save file and run `npm start` again

### Problem: "Activities list is empty"
**Solution:**
1. Check that you have activities on Strava
2. Go to https://www.strava.com and verify you see activities
3. Try "Sync" button in app to refresh
4. If still empty, check internet connection

### Problem: "Activities don't load (network error)"
**Solution:**
1. Check your internet connection
2. Go to https://www.strava.com/api/v3/athlete
3. In URL bar, add your token: `?access_token=YOUR_TOKEN`
4. If you get JSON response, token is valid
5. Try "Retry" button in app

### Problem: "Module not found: @react-native-async-storage"
**Solution:**
```bash
npm install @react-native-async-storage/async-storage
```

### Problem: "App crashes on startup"
**Solution:**
1. Check that you pasted token correctly (line ~100)
2. Make sure no syntax errors (check for extra quotes)
3. Save file
4. Kill Expo: `Ctrl+C`
5. Run again: `npm start`

### Problem: "Simulator won't open"
**Solution for iOS:**
```bash
# Kill Expo
pkill -f expo

# Try again
npm start
# Press 'i'
```

**Solution for Android:**
- Make sure Android Emulator is running first
- Then run `npm start` and press 'a'

### Problem: "Black screen, nothing loads"
**Solution:**
1. Press `r` in terminal to reload app
2. If still black, kill and restart: `npm start`
3. Wait 60 seconds for first load

---

## 📱 Next: Customize App (Optional)

### Change Colors
Edit App.js around line 20:

```javascript
const theme = {
  colors: {
    primary: '#ef4444',      // Change this to your color
    secondary: '#3b82f6',    // Change this too
    background: '#0f172a',   // Dark background
    // ... other colors
  },
};
```

### Add More Activity Fields
Edit App.js around line 365 in `ActivityCard` function:

```javascript
function ActivityCard({ activity }) {
  // Add these lines to show more info:
  {activity.elevation_gain && <Text>↑ {activity.elevation_gain}m</Text>}
  {activity.average_heartrate && <Text>❤️ {activity.average_heartrate}bpm</Text>}
}
```

### Use Flask Backend Instead
Edit App.js around line 45:

```javascript
// Change from:
const response = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=10', {

// To:
const response = await fetch('http://localhost:5000/api/activities', {
```

---

## 🎉 You Now Have:

✅ Working React Native app  
✅ Real Strava data loading  
✅ Beautiful dark theme  
✅ Pull-to-refresh  
✅ Secure token storage  
✅ Error handling  

---

## Next Steps:

1. **Share with friends**: Build APK/IPA and share
2. **Add features**: Heart rate graph, map view, etc.
3. **Deploy**: Submit to App Store/Google Play
4. **Multi-tracker**: Add Fitbit, Google Fit (see BUILD_PLAN.md)

---

## Questions?

- **How code works?** → Read IMPLEMENTATION.md
- **Want to extend?** → Check "Customize App" section above
- **Issues?** → Check Troubleshooting section

**Good luck! 🚀**
