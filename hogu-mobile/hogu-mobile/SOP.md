# HOG-U Mobile App — Standard Operating Procedure

## ⚠️ RULES (Never Break These)

### 1. Directory Structure Rules
```
hogu-mobile/hogu-mobile/
├── app/              ← ONLY route files go here (expo-router treats ALL files as routes)
│   ├── (tabs)/       ← Tab screens only (.tsx with default export React component)
│   ├── _layout.tsx   ← Root layout
│   ├── index.tsx     ← Auth check entry point
│   ├── login.tsx     ← Login screen
│   └── modal.tsx     ← Modal screen
├── services/         ← Business logic (NOT inside app/)
├── components/       ← Shared UI components (NOT inside app/)
├── constants/        ← Theme, config (NOT inside app/)
├── hooks/            ← Custom hooks (NOT inside app/)
└── assets/           ← Images, fonts
```

**CRITICAL**: Never put non-route files inside `app/`. Expo-router will try to render them as screens and crash.

### 2. Import Path Rules
- From `app/(tabs)/*.tsx` → use `../../services/xxx` or `@/services/xxx`
- From `app/*.tsx` → use `../services/xxx` or `@/services/xxx`  
- The `@/` alias points to the project root (`hogu-mobile/hogu-mobile/`)

### 3. Package Rules for Expo Go
These packages **DO NOT WORK** in Expo Go (need development build):
- ❌ `expo-crypto` (native module `ExpoCryptoAES` not available)
- ❌ `expo-auth-session` (depends on expo-crypto)
- ❌ `react-native-health` (native Apple HealthKit)
- ❌ Any package requiring native code not in Expo Go SDK

**Safe alternatives:**
- OAuth → Use `expo-web-browser` + `WebBrowser.openAuthSessionAsync()` directly
- Crypto → Not needed for our OAuth flow (server handles token exchange)
- HealthKit → Use mock data / backend APIs

### 4. IP Address Management
- Current Mac IP: Check with `ipconfig getifaddr en0`
- All `API_BASE` constants MUST match current IP
- Files containing `API_BASE`:
  - `app/(tabs)/index.tsx`
  - `app/(tabs)/testing.tsx`  
  - `app/login.tsx`
- **When IP changes**: update ALL three files

### 5. app.json Rules
```json
{
  "expo": {
    "scheme": "hogu",
    "updates": { "enabled": false }
  }
}
```
- `updates.enabled: false` → Prevents "failed to download remote update" error
- `scheme: "hogu"` → Required for OAuth deep link redirects

---

## 🚀 Startup Procedure

### Start Backend
```bash
cd /Users/sdheeraj/VS-new
pkill -9 -f "python3.*hogu_backend" 2>/dev/null
python3 hogu_backend.py &
# Verify: curl -s http://localhost:5000/api/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com"}'
```

### Start Expo
```bash
cd /Users/sdheeraj/VS-new/hogu-mobile/hogu-mobile
pkill -9 -f "npm|expo|metro" 2>/dev/null; sleep 2
rm -rf .expo node_modules/.cache
npm start -- --offline --clear
```

### Verify Before Testing
1. ✅ Backend responds: `curl http://192.168.1.3:5000/api/login -X POST -H "Content-Type: application/json" -d '{"email":"test@test.com"}'`
2. ✅ Metro shows QR code with correct IP
3. ✅ Phone and Mac on same WiFi network

---

## 🔧 Pre-Change Checklist (Before ANY Code Change)

- [ ] Will this file go inside `app/`? → It MUST be a route with `export default function`
- [ ] Does this import a package with native modules? → Check if it works in Expo Go
- [ ] Does this change IP/port? → Update ALL `API_BASE` references
- [ ] Am I adding a new tab? → Add to `app/(tabs)/_layout.tsx` AND create the file

---

## 🐛 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "missing required default export" | Non-route file inside `app/` | Move to `services/`, `components/`, etc. |
| "Cannot find native module" | Package not in Expo Go SDK | Remove import, use alternative |
| "failed to download remote update" | `updates` not disabled | Add `"updates": {"enabled": false}` to app.json |
| "Network request failed" / IO error | Wrong IP or backend not running | Check IP, restart backend |
| ENOENT package.json | Running npm from wrong directory | Always `cd` to `hogu-mobile/hogu-mobile` first |

---

## 📋 Post-Change Validation

After ANY change, run this before testing on phone:
```bash
cd /Users/sdheeraj/VS-new/hogu-mobile/hogu-mobile
# 1. Check no files in app/ that aren't routes
find app -name "*.ts" -o -name "*.tsx" | grep -v "_layout\|index\|login\|modal\|explore\|testing"
# Should return nothing (or only valid route files)

# 2. Check imports resolve correctly
grep -rn "from.*\.\./services\|from.*\./services" app/ --include="*.tsx" --include="*.ts"
# All paths should be ../../services/ (from tabs) or ../services/ (from app root)

# 3. Check no banned packages imported
grep -rn "expo-auth-session\|expo-crypto\|react-native-health" app/ --include="*.tsx" --include="*.ts"
# Should return nothing

# 4. Restart fresh
pkill -9 -f "npm|expo" 2>/dev/null; sleep 2
rm -rf .expo node_modules/.cache
npm start -- --offline --clear
```
