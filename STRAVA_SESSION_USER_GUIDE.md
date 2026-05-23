# 🔗 Using the Improved Strava Integration

## Quick Start (30 seconds)

### First Time Setup

1. **Open the Testing Tab**
   - Tap the "Testing" tab in the app
   - Select "Real Strava" option

2. **Connect Your Account**
   - Tap the green **"🔗 CONNECT STRAVA"** button
   - Browser opens Strava authorization page
   - Click **Authorize**

3. **Get Your Code**
   - After clicking Authorize, look at the browser URL
   - You'll see: `localhost:8000/callback?code=XXXXX`
   - Copy the code (the part after `code=`)

4. **Complete Connection**
   - Paste the code into the app
   - See confirmation: **"✅ Connected!"**
   - Your session is saved! 🎉

---

## What Happens After First Setup

### Next Time You Open the App
- ✅ You're automatically logged in
- ✅ No need to re-authenticate
- ✅ Session is loaded from storage

### When Token Expires (every 6 hours)
- 🔄 App automatically refreshes token in background
- ✅ You won't notice anything
- ✅ Everything continues working

### When You Close & Reopen App
- ✅ Session persists
- ✅ Logged in instantly
- ✅ No code entry needed

---

## Using Strava Features

### Fetch Your Activities

```
1. Tap "Real Strava" tab
2. See your athlete name & connected status
3. Tap "📊 FETCH MY ACTIVITIES"
4. Activities load automatically
```

### Test a Workout

```
1. Activities appear in a list
2. Each activity shows:
   - Name (e.g., "Morning Run")
   - Type & Duration
   - Distance & Heart Rate
   - Calories Burned
3. Tap activity to get meal recommendations
```

### Logout

```
1. Tap the red "Logout" button
2. Confirm: "Logout?"
3. Session cleared
4. Next time: Need to re-authenticate
```

---

## Common Scenarios

### "I already have a Strava token"
→ Use the new "Connect Strava" button instead  
→ It's more secure and saves your session

### "Session expired - what do I do?"
→ Nothing! App refreshes token automatically  
→ If it fails, you'll see a prompt to re-authenticate

### "Can I use multiple Strava accounts?"
→ Not yet, but each logout/login switches accounts  
→ Only one account active at a time

### "I closed the browser before copying the code"
→ Tap "Connect Strava" again  
→ Browser will open again  
→ Repeat the authorization

### "I'm on someone else's device"
→ Just logout from the Strava tab  
→ Your session is immediately cleared  
→ They can now log in with their account

---

## Session Status Indicator

### What You See When Connected ✅

```
┌─────────────────────────────┐
│ ✅ CONNECTED                │
│ John Doe                    │
│ Token expires in 5 hours    │
│            [Logout]         │
└─────────────────────────────┘
```

### What You See When Disconnected ❌

```
┌─────────────────────────────┐
│ 🔐 Not Connected            │
│ Connect your Strava account │
│ to analyze your real        │
│ activities                  │
└─────────────────────────────┘
```

---

## Pro Tips

### Tip 1: Keep Your Session Alive
- Open the Testing tab at least once per day
- Token auto-refreshes with each activity fetch
- Sessions last indefinitely (until manual logout)

### Tip 2: Multiple Devices
- Each device saves its own session
- You can be logged in on phone & tablet separately
- Logging out on one device doesn't affect others

### Tip 3: Privacy
- Your Strava token is encrypted on device
- Only used for fetching your own activities
- Refresh tokens rotate automatically
- Sessions can be cleared anytime

### Tip 4: Troubleshooting
- If session won't load → Clear app cache
- If activities won't fetch → Check internet connection
- If stuck on "Loading..." → Force close app and reopen

---

## Understanding the Session

### What's Stored?
```
✅ Your access token (to fetch data)
✅ Your refresh token (to stay logged in)
✅ Your athlete ID & name
✅ Token expiration time
❌ Never: Your Strava password
❌ Never: Sensitive personal data
```

### How It Works
```
Day 1:
  - You authenticate via OAuth
  - Session saved to device storage
  - Token valid for 6 hours

Day 1, Hour 5:
  - You tap "Fetch Activities"
  - App checks if token expired
  - Token still valid ✓ Use it

Day 1, Hour 7:
  - Token has expired
  - App automatically refreshes
  - New token obtained
  - Activity fetch continues
```

---

## Frequently Asked Questions

### Q: Will I have to re-login every time I open the app?
**A:** No! Session is persistent. You'll stay logged in unless you explicitly logout.

### Q: What if I uninstall the app?
**A:** Your session is cleared when you uninstall. You'll need to re-authenticate when reinstalling.

### Q: Can I sync activities from multiple accounts?
**A:** Not simultaneously. You can logout and switch accounts, but only one is active at a time.

### Q: Is my Strava token safe?
**A:** Yes! Token is encrypted by device OS and never shared. Only used for your own data.

### Q: What if I revoke the app on Strava's website?
**A:** Session becomes invalid. Tap "Connect Strava" again to re-authenticate.

### Q: How often do tokens refresh?
**A:** Automatically every 6 hours or when you make an API call with an expired token.

### Q: Can I see my session details?
**A:** Currently shown in the "Connected" status card. More details coming soon!

### Q: What happens during network errors?
**A:** App shows helpful error messages and lets you retry. Session is preserved.

---

## Next Steps

### Now That You're Connected

1. **Test With Mock Data First**
   - Go to "Mock Data" tab
   - Try a few workout scenarios
   - Get familiar with meal recommendations

2. **Compare With Real Data**
   - Switch to "Real Strava" tab
   - Fetch your actual activities
   - See recommendations based on your workouts

3. **Integrate Into Your Routine**
   - After each workout, check the app
   - See personalized meal recommendations
   - Track your macros

---

## Troubleshooting Guide

### Issue: "Native module is null"
**When:** During first app load  
**Why:** Offline Expo bundling limitation  
**Fix:** Automatically resolves when app runs on device  
**Duration:** ~5 seconds on first load

### Issue: "Session failed to load"
**When:** App starts  
**Why:** AsyncStorage initialization delay  
**Fix:** Refresh app or restart device  
**Duration:** One-time, then works smoothly

### Issue: "Activities won't load"
**When:** Tap "FETCH MY ACTIVITIES"  
**Why:** Network issue or token expired  
**Fix:** Check internet, wait 10 seconds, retry  
**Duration:** Usually resolved in 1 retry

### Issue: "Code didn't paste"
**When:** During OAuth  
**Why:** Browser URL cut off or wrong code copied  
**Fix:** Make sure you have full `code=XXXXX` part  
**Duration:** Tap "CONNECT STRAVA" to retry

---

## Support

**Something not working?**

1. ✅ Check internet connection
2. ✅ Try logging out and back in
3. ✅ Force close app and reopen
4. ✅ Clear app cache (Settings → Apps → Clear Cache)
5. ✅ Check browser for latest code if stuck on OAuth

**Still stuck?**
→ Check STRAVA_INTEGRATION_IMPROVEMENTS.md for technical details
→ Review logs in Testing tab debug section

---

## 🎉 You're Ready!

Your Strava session is now:
- ✅ Persistent across app restarts
- ✅ Auto-refreshing when needed
- ✅ Securely stored on your device
- ✅ Easy to use with one click

**Happy tracking!** 🏃‍♂️📊
