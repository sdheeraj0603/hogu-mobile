# 🚀 BUILD HOG-U MOBILE APP - JUST DO THIS

## STEP 1: Create Project (Run in Terminal)
```bash
npx create-expo-app hogu-mobile
cd hogu-mobile
```
⏱️ Takes: 2 min
✅ Done when: You see "Created hogu-mobile"

---

## STEP 2: Install Package (Run in Terminal)
```bash
npm install @react-native-async-storage/async-storage
```
⏱️ Takes: 30 seconds
✅ Done when: Command finishes (no errors)

---

## STEP 3: Copy App Code (Run in Terminal)
```bash
cp ../App-Minimal.js ./App.js
```
⏱️ Takes: 1 second
✅ Done when: No error message

---

## STEP 4: Get Your Strava Token
1. Open browser: https://www.strava.com/settings/apps
2. Look for "Your Access Token"
3. **Copy it** (entire token - looks like: `a1b2c3d4e5f6...`)
4. **Keep it in clipboard**

⏱️ Takes: 2 min
✅ Done when: Token copied to clipboard

---

## STEP 5: Add Token to App
1. Open: `hogu-mobile/App.js` in your code editor
2. Press `Ctrl+F` (or `Cmd+F` on Mac)
3. Search: `YOUR_STRAVA_ACCESS_TOKEN`
4. You'll find this line around line 100:
   ```javascript
   const testToken = 'YOUR_STRAVA_ACCESS_TOKEN';
   ```
5. Replace with your token:
   ```javascript
   const testToken = 'a1b2c3d4e5f6...';  // Paste YOUR token here
   ```
6. **Save file**: Press `Cmd+S` (Mac) or `Ctrl+S` (Windows/Linux)

⏱️ Takes: 1 min
✅ Done when: File saved (no asterisk in tab)

---

## STEP 6: Run App (Run in Terminal)
Make sure you're in the `hogu-mobile` folder:
```bash
npm start
```

⏱️ Takes: 30-60 seconds
✅ Done when: You see:
```
Metro waiting on exp://...
```

---

## STEP 7: Open on Device
**Choose ONE:**

### Option A: iOS Simulator (Mac)
In terminal, press: `i`
Wait 30 seconds for app to open.

### Option B: Android Emulator
In terminal, press: `a`
Wait 1 minute for app to open.

### Option C: Your Phone (Easiest!)
1. Install **Expo Go** app (App Store or Google Play)
2. Scan the QR code shown in terminal
3. App opens in Expo Go

⏱️ Takes: 30-60 seconds
✅ Done when: You see the app on screen

---

## STEP 8: Login
When app opens, you'll see:
```
🏃 HOG-U
Performance Nutrition
[Input field]
[Login button]
```

1. **Tap** the input field
2. **Paste** your Strava token (from Step 4)
3. **Tap** "Login with Strava"
4. **Wait** 2-3 seconds...

⏱️ Takes: 1 min
✅ Done when: You see your activities list!

---

## STEP 9: Test It Works
You should see:
- ✅ List of YOUR Strava activities
- ✅ Distance, time, speed for each
- ✅ Can scroll down
- ✅ Can swipe down to refresh
- ✅ Can logout (tap 🚪 button)

✅ **YOU'RE DONE!** 🎉

---

## ❌ STUCK? Quick Fixes

**"Command not found: npx"**
→ Install Node.js: https://nodejs.org/

**"Token is invalid"**
→ Get new token from: https://www.strava.com/settings/apps
→ Make sure NO spaces around token
→ Edit App.js line 100 again
→ Save file
→ Kill terminal: `Ctrl+C`
→ Run: `npm start` again

**"Module not found"**
→ Run: `npm install @react-native-async-storage/async-storage`

**"Activities list empty"**
→ Check you have activities on Strava
→ Tap the sync button (⟳) in app
→ Check internet connection

**"Black screen, nothing loads"**
→ Press `r` in terminal
→ Or kill Expo: `Ctrl+C`
→ Run again: `npm start`

**"App crashes"**
→ Check token pasted correctly (no extra quotes)
→ Save file
→ Kill Expo: `Ctrl+C`
→ Run: `npm start`

---

## 🎯 TOTAL TIME: ~40 minutes

| Step | Time |
|------|------|
| 1. Create project | 2 min |
| 2. Install package | 1 min |
| 3. Copy code | 1 min |
| 4. Get token | 2 min |
| 5. Add token | 1 min |
| 6. Run app | 2 min |
| 7. Open device | 5 min |
| 8. Login | 1 min |
| 9. Test | 2 min |
| **Waiting time** | **20 min** |
| **TOTAL** | **40 min** |

---

## ✅ YOU'RE DONE WHEN:

- [ ] Step 1: Created `hogu-mobile` folder
- [ ] Step 2: Installed AsyncStorage
- [ ] Step 3: Copied App.js
- [ ] Step 4: Have token in clipboard
- [ ] Step 5: Added token to App.js, saved
- [ ] Step 6: `npm start` running (see Metro message)
- [ ] Step 7: App opened on device/simulator
- [ ] Step 8: Pasted token, clicked login
- [ ] Step 9: See activities list on screen

**All checked? YOU WIN!** 🎉

---

## 🎨 AFTER IT WORKS (Optional)

**Change colors:**
Edit App.js line 20:
```javascript
const theme = {
  colors: {
    primary: '#ef4444',  // Change red to your color
    secondary: '#3b82f6', // Change blue
    // ...
  },
};
```
Save, press `r` in terminal.

**Add more info:**
Edit App.js line 365 (ActivityCard function):
```javascript
<Text>↑ {activity.elevation_gain}m</Text>
<Text>❤️ {activity.average_heartrate} bpm</Text>
```

---

**START NOW! Run Step 1 in terminal.** 💪
