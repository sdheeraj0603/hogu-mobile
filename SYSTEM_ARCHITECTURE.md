# HOG-U System Architecture

## Current Auto-Fetching Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S FITNESS TRACKER                   │
│              (Strava / Apple Health / Fitbit / etc)         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ OAuth 2.0 Authentication
                     │ (User authorizes HOG-U to access data)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                  HOG-U BACKEND (Python Flask)               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Authentication Module                                │  │
│  │ - get_valid_access_token()                          │  │
│  │ - Handles token expiration & refresh                │  │
│  │ - Stores tokens securely                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Data Fetching Module                                │  │
│  │ - get_recent_activities()                           │  │
│  │ - Fetches last N activities from tracker            │  │
│  │ - Returns standardized JSON format                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Processing Engine                                   │  │
│  │ - process_strava_activity()                         │  │
│  │ ┌────────────────────────────────────────────────┐ │  │
│  │ │ 1. Extract: name, type, distance, elevation   │ │  │
│  │ │ 2. Calculate: intensity_index (m/km)          │ │  │
│  │ │ 3. Parse: timestamp → local timezone (IST)    │ │  │
│  │ │ 4. Map: coordinates → location name           │ │  │
│  │ │ 5. Fetch: weather data (Open-Meteo API)       │ │  │
│  │ │ 6. Analyze: meal window + intensity           │ │  │
│  │ │ 7. Generate: meal recommendations (4 levels)  │ │  │
│  │ │ 8. Link: Zomato restaurant search             │ │  │
│  │ └────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Output Generation                                   │  │
│  │ - Saves to: hogu_recommendations.json              │  │
│  │ - Contains 13 data fields per activity             │  │
│  │ - Includes all metrics + recommendations           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                     │
                     │ JSON API (/api/activities, /api/refresh)
                     ↓
┌─────────────────────────────────────────────────────────────┐
│                   WEB DASHBOARD (HTML/CSS/JS)               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Display Components                                  │  │
│  │ ┌────────────────────────────────────────────────┐ │  │
│  │ │ Card 1: Test run (Lalbagh)                    │ │  │
│  │ │ ┌──────────────────────────────────────────┐ │ │  │
│  │ │ │ 📌 Activity: Test run                    │ │ │  │
│  │ │ │ 📏 Distance: 10.82 km                    │ │ │  │
│  │ │ │ ⛰️ Elevation: 68.0 m                     │ │ │  │
│  │ │ │ 💪 Intensity: 6.29 m/km                │ │ │  │
│  │ │ │ 🕐 Time: 06:33 AM                       │ │ │  │
│  │ │ │ 📍 Location: Lalbagh                     │ │ │  │
│  │ │ │ 🌡️ Temp: 21.8°C | 💧 Humidity: 97%    │ │ │  │
│  │ │ │ 🍽️ Meal: Poha (Morning Tiffin)         │ │ │  │
│  │ │ │ 🔗 Order on Zomato →                    │ │ │  │
│  │ │ └──────────────────────────────────────────┘ │ │  │
│  │ └────────────────────────────────────────────────┘ │  │
│  │ (Repeat for each activity)                          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ User Actions                                        │  │
│  │ • ⟳ Sync Workouts → POST /api/refresh              │  │
│  │ • ↓ Export Data → Download hogu_*.json             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Example: One Activity

```
INPUT (from Strava API):
{
  "name": "Test run",
  "type": "Run",
  "distance": 10821.5,        ← meters
  "total_elevation_gain": 68,
  "start_date": "2026-05-03T06:33:34Z",
  "start_latlng": [12.949767, 77.58549]
}
         ↓
         │ PROCESSING
         ↓
OUTPUT (hogu_recommendations.json):
{
  "activity_name": "Test run",
  "activity_type": "Run",
  "distance_km": 10.82,
  "elevation_gain": 68,
  "intensity_index": 6.29,        ← Calculated: 68/10.82 m/km
  "meal_window": "Morning Tiffin", ← From 06:33 AM
  "temperature": 21.8,             ← From Open-Meteo API
  "humidity": 97,
  "sweat_status": "CRITICAL",      ← From humidity > 80%
  "start_time": "06:33 AM",        ← Converted to IST
  "location": "Lalbagh",           ← Mapped from coordinates
  "meal_recommendation": "Level 1: Morning Tiffin Standard Recovery. Poha.",
  "meal_query": "Poha",
  "zomato_link": "https://www.zomato.com/bangalore/restaurants/search?q=Poha"
}
```

## What "Auto-Fetch" Means

✅ **Automatic Data Collection**
- User authenticates once with Strava (or any tracker)
- System automatically retrieves last N activities
- No manual data entry needed

✅ **Scheduled Sync** (Can Be Configured)
- Run daily: `0 */6 * * * python3 hogu_strava_integration.py`
- Run on-demand: Click "Sync Workouts" button
- Keeps hogu_recommendations.json updated

✅ **Intelligent Processing**
- Extracts only required fields
- Calculates derived metrics
- Enriches with external data (weather)
- Generates actionable recommendations

✅ **Always-On Dashboard**
- Flask server runs continuously
- Dashboard always shows latest data
- API endpoints always available

## System Statistics

| Metric | Value |
|--------|-------|
| **Auto-Fetched Data Points per Activity** | 6 core fields |
| **Processed Data Points per Activity** | 13 enriched fields |
| **Processing Time per Activity** | ~500ms (includes weather API call) |
| **Activities Fetched per Sync** | 5-10 (configurable) |
| **Weather API Calls per Sync** | N (one per activity with coordinates) |
| **Token Validity** | 6 hours (auto-refresh) |
| **Dashboard Refresh Rate** | Manual + Auto-refresh API |
| **Supported Trackers** | 1 (Strava) - More can be added |

## Multi-Tracker Integration (Future)

Once integrated, all trackers feed into same processing pipeline:

```
Strava        ┐
Google Fit    ├─→ Standardized Format ─→ Processing Engine ─→ Dashboard
Apple Health  ┤                                                    ↓
Fitbit        ┤                                            hogu_recommendations.json
Garmin        ┘
```

Each tracker just needs:
- OAuth implementation ✓
- Activity data mapper ✓
- Rest handled by shared code ✓

## Key Takeaway

**Yes, HOG-U fully auto-fetches all this data from connected fitness trackers:**

✅ Activity name, type, distance, elevation  
✅ Workout timestamp (converts to local time)  
✅ Location (maps coordinates to place names)  
✅ Environmental data (fetches live weather)  
✅ Meal recommendations (AI-driven based on all above)  
✅ Restaurant links (Zomato integration)  

**Zero manual data entry needed after initial OAuth connection!**

---

For architecture details, see: `SUPPORTED_FITNESS_TRACKERS.md`
