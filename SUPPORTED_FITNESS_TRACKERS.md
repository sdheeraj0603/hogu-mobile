# HOG-U: Multi-Tracker Integration Support

## Current Status
✅ **Strava API v3** - Fully Integrated

## How It Works: Auto-Fetch Architecture

```
User's Fitness Tracker
         ↓
    OAuth 2.0 Login
         ↓
    Access Token (6-hour expiry)
         ↓
    API Call: Get Recent Activities
         ↓
    Parse Activity Data:
    - name, type, distance, elevation
    - start_date (timestamp)
    - start_latlng (coordinates)
         ↓
    HOG-U Processing Engine
    - Calculate intensity index
    - Fetch weather data
    - Map location from coordinates
    - Determine meal window
    - Generate recommendations
         ↓
    Dashboard Display & Export
```

## What Data We Auto-Extract

| Field | Source | Used For |
|-------|--------|----------|
| **Activity Name** | Tracker | Display in dashboard |
| **Activity Type** | Tracker | Classify workout (Run, Cycle, Swim, etc.) |
| **Distance** | Tracker | Calculate intensity, determine recovery level |
| **Elevation Gain** | Tracker | Calculate intensity index (m/km ratio) |
| **Start Time** | Tracker | Determine meal window, fetch historical weather |
| **Coordinates** | Tracker | Map to location name (Lalbagh, Cubbon Park, etc.) |
| **Temperature** | Weather API | Assess environmental stress (OpenMeteo) |
| **Humidity** | Weather API | Calculate sweat status & hydration needs |

## Supported Fitness Trackers (Can Be Added)

### Currently Integrated
- ✅ **Strava** (Running, Cycling, Swimming, Multi-sport)
  - Uses: OAuth 2.0
  - API: Strava API v3
  - Rate Limit: 600 requests/15min
  - Data Quality: Excellent (GPS, elevation, timestamps)

### Can Be Easily Integrated
- ⏳ **Apple HealthKit** (iOS)
  - OAuth: HealthKit Framework
  - Data: Workouts, calories, heart rate
  
- ⏳ **Google Fit** (Android)
  - OAuth: Google OAuth 2.0
  - Data: Steps, distance, calories, heart rate
  
- ⏳ **Fitbit** (Wearables)
  - OAuth: Fitbit OAuth 2.0
  - Data: Activities, calories, heart rate zones
  
- ⏳ **Garmin Connect** (Sports Watches)
  - OAuth: Garmin OAuth 2.0
  - Data: Running, cycling, swimming, multisport
  
- ⏳ **TrainingPeaks** (Cycling/Triathlon)
  - OAuth: TrainingPeaks OAuth 2.0
  - Data: Structured workouts, TSS, IF scores
  
- ⏳ **Komoot** (Hiking/Adventure)
  - OAuth: Komoot OAuth 2.0
  - Data: Routes, elevation, terrain type

## Integration Pattern (Framework)

```python
# Template for any fitness tracker integration

def get_{tracker}_access_token():
    """
    1. Generate OAuth authorization URL
    2. User authorizes app
    3. Exchange auth code for access token
    4. Save token with expiration & refresh token
    """
    
def get_{tracker}_activities(access_token, limit=10):
    """
    Fetch recent activities from {tracker} API
    Required fields:
    - activity_name/name
    - activity_type/type
    - distance_m/distance
    - elevation_gain/total_elevation_gain
    - start_date/start_time
    - start_latlng/coordinates
    """
    
def map_{tracker}_to_standard_format(activity):
    """
    Convert tracker-specific format to HOG-U standard:
    {
        'activity_name': str,
        'activity_type': str,
        'distance_m': float,
        'elevation_gain': float,
        'start_date': ISO datetime,
        'start_latlng': [lat, lon]
    }
    """
```

## How to Add a New Tracker

1. **Get API Credentials**
   - Register app at tracker's developer portal
   - Get Client ID & Client Secret

2. **Implement OAuth Functions**
   ```python
   # In hogu_strava_integration.py (rename to hogu_fitness_integration.py)
   
   def get_tracker_auth_url():
       """Generate authorization URL"""
       
   def exchange_code_for_token(code):
       """Convert auth code to access token"""
       
   def get_tracker_activities(token):
       """Fetch activities from API"""
       
   def map_tracker_activity(activity):
       """Convert to standard format"""
   ```

3. **Add to `process_activity()` function**
   - All the meal recommendation logic stays the same
   - Just feed it standardized activity data

4. **Update `run_automated_hogu()`**
   - Add conditional: "if tracker == 'strava' else if tracker == 'fitbit' etc."
   - Call appropriate fetch function

## Current Data Processing Pipeline

### Input (From Any Tracker)
```json
{
    "name": "Morning Run",
    "type": "Run",
    "distance": 10821.5,
    "total_elevation_gain": 68.0,
    "start_date": "2026-05-03T06:33:34Z",
    "start_latlng": [12.949767, 77.58549]
}
```

### Processing
1. ✅ Extract metadata
2. ✅ Calculate intensity (elevation_gain / distance_km)
3. ✅ Convert timestamps to local timezone (IST +5:30)
4. ✅ Map coordinates → Location name (Lalbagh, Cubbon Park, etc.)
5. ✅ Fetch historical weather (Open-Meteo API)
6. ✅ Determine meal window (Morning Tiffin, Recovery Dinner, etc.)
7. ✅ Generate 4-level meal recommendations based on:
   - Activity intensity
   - Environmental humidity
   - Meal timing
   - Local food preferences

### Output (Unified Format)
```json
{
    "activity_name": "Test run",
    "activity_type": "Run",
    "distance_km": 10.82,
    "elevation_gain": 68.0,
    "intensity_index": 6.29,
    "meal_recommendation": "Level 1: Morning Tiffin Standard Recovery. Poha.",
    "location": "Lalbagh",
    "temperature": 21.8,
    "humidity": 97,
    "sweat_status": "CRITICAL",
    "meal_window": "Morning Tiffin",
    "start_time": "06:33 AM",
    "zomato_link": "https://www.zomato.com/bangalore/restaurants/search?q=Poha"
}
```

## Key Features

✅ **Auto-Fetching**
- Automatically pulls last N activities from tracker
- Runs on schedule (can add cron jobs)
- Handles token expiration & refresh

✅ **Location Intelligence**
- Maps coordinates to real place names
- Provides location-aware meal recommendations
- Currently supports: Lalbagh, Cubbon Park, Sankey Tank, Ulsoor Lake, JP Park

✅ **Weather Integration**
- Fetches historical weather for activity time & location
- Uses Open-Meteo (no API key needed)
- Provides temperature & humidity data

✅ **Intelligent Meal Recommendations**
- 4-level intensity-based system
- Considers: exercise intensity, humidity, meal timing, local cuisine
- Links to Zomato for ordering

✅ **Multi-Tracker Ready**
- Abstracted data model
- Can add trackers by just implementing API wrapper
- Core recommendation engine stays the same

## Real-World Use Case

**User Flow:**
1. User connects Strava account → OAuth login
2. HOG-U automatically fetches last 5 activities
3. For each activity:
   - Calculates metrics (distance, elevation, intensity)
   - Gets weather for that time/location
   - Generates meal recommendations
   - Detects location (e.g., Lalbagh)
   - Links to Zomato for ordering
4. Dashboard displays all activities with recommendations
5. User can export data as JSON for records

## Next Steps

To add new tracker support:
1. Fork `get_strava_auth_url()` → `get_fitbit_auth_url()`
2. Fork `get_recent_activities()` → `get_fitbit_activities()`
3. Map response format to standard structure
4. Add to main `run_automated_hogu()` function
5. Test with real API

**Time to integrate new tracker:** ~2-4 hours
**Breaking changes to existing code:** None (all new functions)
