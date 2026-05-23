# HOG-U Development Guidelines
## Preventing Future Disasters

### ✅ Critical Rules to Follow

#### 1. **Project Root Structure** (CRITICAL)
```
/Users/sdheeraj/VS-new/hogu-mobile/
├── hogu-mobile/          ← REAL APP ROOT - Always run from here!
│   ├── app/
│   ├── package.json
│   ├── tsconfig.json
│   └── index.js (entry point)
├── index.js.OLD          ← OLD FILES (ignore these)
├── app.json.OLD
└── tsconfig.json.OLD
```

**RULE**: Always run Expo from `/hogu-mobile/hogu-mobile/`, never from `/hogu-mobile/`

#### 2. **Correct Commands**
```bash
# ✅ CORRECT
cd /Users/sdheeraj/VS-new/hogu-mobile/hogu-mobile
npm start -- --offline --reset-cache

# ❌ WRONG  
cd /Users/sdheeraj/VS-new/hogu-mobile
npm start
```

#### 3. **File Structure Rules**

**Services** (`/app/services/`)
- Must have named exports for functions: `export async function exchangeCodeForToken(...)`
- Must have a default export to prevent expo-router warnings: `export default { func1, func2 }`
- Examples:
  - `stravaAPI.ts` ✅ (has default export)
  - `nutritionEngine.ts` ✅ (has default export)
  - `stravaOAuth.ts` ✅ (has default export)

**Constants** (`/app/constants/`)
- Must have a default export: `export default { mockActivities, mockBiometrics, testScenarios }`
- Examples:
  - `mockData.ts` ✅ (has default export)

**Screens/Components** (`/app/(tabs)/` and `/app/components/`)
- Must have exactly ONE `export default ComponentName` at the end
- NO double exports: `export function X() {...}` + `export default X` = ERROR
- Clean example:
  ```tsx
  function MealTestingPanel() {
    // ...
  }
  export default MealTestingPanel;
  ```

#### 4. **JSX Rules**
- All opening tags must have matching closing tags
- No stray `</ImageBackground>` without `<ImageBackground>`
- Use only imported components (don't use `Pressable` unless imported)
- Correct: `<View>...</View>`
- Wrong: `<View>...</ImageBackground>`

#### 5. **When Something Breaks**
1. Check the Metro terminal output for the exact error line
2. Look at the file + line number shown in the error
3. Fix the file
4. Metro auto-reloads (don't need to restart if online)
5. If cache issues: `rm -rf .expo node_modules/.cache && npm start -- --offline --reset-cache`

#### 6. **Cache Issues Checklist**
```bash
# Step 1: Kill all processes
pkill -9 -f "npm|expo|metro"

# Step 2: Clear caches
cd /Users/sdheeraj/VS-new/hogu-mobile/hogu-mobile
rm -rf .expo node_modules/.cache

# Step 3: Fresh restart
npm start -- --offline --reset-cache

# Step 4: Reload in Expo Go (pull down or shake device)
```

#### 7. **Testing the Auth Screen**
The MealTestingPanel testing screen has:
- **Mock Data Tab**: Select test scenarios (6 available)
- **Strava Tab**: OAuth button + manual token input

To fix OAuth authentication:
1. Tap "Authorize with Strava" button
2. System opens Strava login in browser
3. After auth, returned code is exchanged for token
4. Token saved and used to fetch real activities

#### 8. **File Edits Best Practices**
- Use `replace_string_in_file` with 3-5 lines of context
- Never use incomplete edits with `...` markers
- When replacing large sections, provide full context
- Test compilation after edits: check no errors appear

#### 9. **Component Import Paths**
All imports use `@/` alias (configured in tsconfig.json):
```tsx
// ✅ CORRECT
import MealTestingPanel from '@/app/components/MealTestingPanel';
import nutritionEngine from '@/app/services/nutritionEngine';
import { mockActivities } from '@/app/constants/mockData';

// ❌ WRONG
import MealTestingPanel from '../../components/MealTestingPanel';
```

#### 10. **Metro Bundler Output Patterns**
```
"Metro waiting on exp://192.168.1.8:8081"  ✅ Ready
"ERROR SyntaxError: ..."                    ❌ Fix the file
"WARN Route missing default export"         ⚠️ Add: export default { ... }
"Compiled successfully"                      ✅ App ready
```

### 📋 Checklist Before Deploying Features

- [ ] No double exports in any file
- [ ] All services have default exports
- [ ] All JSX tags properly closed
- [ ] No unused imports
- [ ] Path aliases use `@/` prefix
- [ ] TSconfig has `"baseUrl": "."`
- [ ] Running from `/hogu-mobile/hogu-mobile/`
- [ ] Metro shows "waiting on exp://..."
- [ ] Expo Go shows landing page

### 🚀 Testing OAuth Auth Screen Flow

1. Open app → Navigate to Testing tab (🧪 icon)
2. Switch to "Strava" tab
3. Click "🔐 Authorize with Strava"
4. Browser opens → Login with Strava account
5. Approve access scopes
6. Return to app → Token saved
7. Tap "📊 Fetch My Workouts"
8. Real activities load from your Strava

### 📱 If Expo Shows "Go Back to Expo Home"
This means a component crashed. Check:
1. Terminal for the error message
2. Line number indicated in error
3. Look for: missing exports, stray JSX tags, unimported components
4. Fix and Metro recompiles automatically
5. Refresh Expo Go app

### 🔧 Quick Fixes

**"Cannot find name 'Pressable'"**
→ Add to imports: `import { Pressable } from 'react-native'`

**"Missing default export"**
→ Add at end of file: `export default { functionName1, functionName2 }`

**"Expected JSX closing tag"**
→ Check all `<View>`, `<ScrollView>`, `<Text>` have matching `</...>`

**"Property doesn't exist"**
→ Check import statement for the component/function

### 📞 Emergency Reset (Nuclear Option)
```bash
pkill -9 -f "npm|expo|metro|watchman"
cd /Users/sdheeraj/VS-new/hogu-mobile/hogu-mobile
rm -rf .expo node_modules/.cache .watchmanconfig
npm install
npm start -- --offline --reset-cache
# Wait 90 seconds for full rebuild
```

---

**Last Updated**: May 20, 2026  
**Version**: 1.0  
**Status**: Active Development
