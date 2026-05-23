# ✅ WORKING SERVER STARTUP METHOD

## ALWAYS USE THIS EXACT METHOD

### Step 1: Kill all processes
```bash
pkill -9 -f "npm|expo|metro|watchman" 2>/dev/null; sleep 1
```

### Step 2: Navigate to correct directory
```bash
cd /Users/sdheeraj/VS-new/hogu-mobile/hogu-mobile
```

### Step 3: Clear caches
```bash
rm -rf .expo node_modules/.cache .watchmanconfig && /usr/local/bin/watchman watch-del-all 2>/dev/null || true
```

### Step 4: Start server (FOREGROUND, not background!)
```bash
npm start -- --offline --clear
```

**DO NOT use background (`&`) - run in foreground to see the QR code immediately!**

## Expected Output
You should see:
```
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▄▀ ▀ ▄ ███ ▄▄▄▄▄ █
█ █   █ █   █▀ █▄ █ █   █ █
... [QR CODE] ...

› Metro waiting on exp://10.22.1.88:8081
› Scan the QR code above with Expo Go
```

## What's Working
✅ Server starts cleanly  
✅ Metro bundler initializes  
✅ QR code is visible  
✅ No IO exceptions  

## One Command to Run Everything
```bash
pkill -9 -f "npm|expo|metro|watchman" 2>/dev/null; sleep 1; cd /Users/sdheeraj/VS-new/hogu-mobile/hogu-mobile; rm -rf .expo node_modules/.cache .watchmanconfig && /usr/local/bin/watchman watch-del-all 2>/dev/null || true; npm start -- --offline --clear
```

Copy and paste this entire command when needed!
