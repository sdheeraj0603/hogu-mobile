# HOG-U BUILD - QUICK REFERENCE CARD

## 🎯 GOAL
Build a React Native mobile app that shows your Strava activities with AI nutrition recommendations.

---

## 📋 5 PHASES (40 minutes total)

### PHASE 1: CREATE PROJECT (5 min)
```bash
npx create-expo-app hogu-mobile
cd hogu-mobile
npm install @react-native-async-storage/async-storage
```

**Verify:**
```bash
npm list @react-native-async-storage/async-storage
```

---

### PHASE 2: COPY APP CODE (2 min)
From parent directory:
```bash
cp ../App-Minimal.js ./App.js
```

**Verify:**
```bash
ls -la App.js
```

---

### PHASE 3: GET STRAVA TOKEN (5 min)

1. Visit: https://www.strava.com/settings/apps
2. Create app if needed
3. Find "Your Access Token"
4. Copy the full token (looks like: `a1b2c3d4e5f6...`)

---

### PHASE 4: ADD TOKEN TO APP (3 min)

Open: `hogu-mobile/App.js`

Find line ~100:
```javascript
const testToken = 'YOUR_STRAVA_ACCESS_TOKEN';
```

Replace with YOUR token:
```javascript
const testToken = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0';
```

Save file: `Cmd+S`

---

### PHASE 5: RUN APP (25 min)

```bash
npm start
```

Wait for:
```
Metro waiting on exp://...
```

**Choose device:**
- iOS: Press `i`
- Android: Press `a`
- Phone: Scan QR code with Expo Go

**Wait for app to load:** 30-60 seconds

---

## ✅ WHAT YOU'LL SEE

### Login Screen
- Input token
- Click "Login with Strava"
- Token validated with Strava API

### Dashboard Screen
- List of YOUR activities
- Distance, time, speed
- Pull down to refresh
- Tap ⚙️ to logout

### That's it! 🎉

---

## 🆘 QUICK TROUBLESHOOTING

| Problem | Solution |
|---------|----------|
| Token invalid | Get new one: https://www.strava.com/settings/apps |
| Activities empty | Check Strava has activities |
| Network error | Check internet, verify token |
| App crashes | Check token pasted correctly, save file |
| Simulator won't open | Kill: `pkill -f expo`, Run: `npm start` again |

---

## 📁 FILE STRUCTURE (FINAL)

```
hogu-mobile/
├── App.js              ← Your app (from App-Minimal.js)
├── app.json
├── package.json
├── node_modules/       ← Dependencies
└── ...
```

---

## 💾 TOKEN SECURITY

✅ Token stored securely on device (AsyncStorage)
✅ Only used for API calls to Strava
✅ Cleared on logout
⚠️ In development only - for production use OAuth

---

## 🎨 CUSTOMIZE (After It Works)

**Change colors:**
- Edit `theme.colors` in App.js (line ~20)

**Add more fields:**
- Edit `ActivityCard` function (line ~365)

**Use Flask backend:**
- Edit fetch URL (line ~45)

**Switch screens:**
- Tap ⚙️ button for Settings

---

## 🚀 DEPLOYMENT (Later)

When ready:
```bash
eas build --platform ios
eas build --platform android
```

Then submit to App Store or Google Play.

---

## 📚 DOCS

| File | What For |
|------|----------|
| BUILD_GUIDE.md | Detailed step-by-step |
| IMPLEMENTATION.md | How code works |
| README-APP.md | Quick 5-min setup |

---

## ⏱️ TIME ESTIMATE

| Phase | Time |
|-------|------|
| Create project | 5 min |
| Copy code | 2 min |
| Get token | 5 min |
| Add token | 3 min |
| Run app | 25 min |
| **TOTAL** | **40 min** |

---

## 🎯 SUCCESS CRITERIA

- [ ] App opens on simulator/phone
- [ ] Login screen visible
- [ ] Can paste token and login
- [ ] Activities appear in list
- [ ] Pull-to-refresh works
- [ ] Can logout

If all checked: **YOU'RE DONE!** 🎉

---

## 📞 NEED HELP?

1. **How to code?** → READ BUILD_GUIDE.md
2. **What does code do?** → READ IMPLEMENTATION.md
3. **Still stuck?** → Check GET_STARTED.sh

---

**YOU GOT THIS! 💪**
