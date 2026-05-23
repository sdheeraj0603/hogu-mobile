# 🍽️ HOG-U: Automated Meal Recommendation Engine with Strava Integration

## Overview
This system automates the process of fetching your fitness activities from **Strava** and providing personalized meal recommendations based on your performance metrics, environmental conditions, and recovery needs.

## Features
✅ **Strava OAuth Integration** - Secure authentication with your Strava account  
✅ **Automatic Activity Fetching** - Retrieves your recent workouts (running, cycling, etc.)  
✅ **Performance Analysis** - Calculates intensity, elevation gain, distance  
✅ **Environmental Data** - Fetches real-time weather conditions from activity location  
✅ **Smart Meal Recommendations** - Context-aware suggestions based on:
   - Time of day (Morning/Lunch/Evening/Night)
   - Activity intensity
   - Environmental humidity
   - Local vs. international cuisine preferences  
✅ **Zomato Integration** - Direct links to order recommended meals  
✅ **JSON Export** - Saves all recommendations for further analysis  

---

## Setup Instructions

### 1. Register Your App with Strava
1. Go to https://www.strava.com/settings/api
2. Click "Create an API Application"
3. Fill in the form:
   - **Application name**: `HOG-U Meal Recommender`
   - **Website**: `http://localhost`
   - **Application description**: `Personalized meal recommendations based on fitness activities`
   - **Authorization Callback Domain**: `localhost`
4. Accept the terms and create
5. Copy your **Client ID** and **Client Secret**

### 2. Update Configuration
Edit `hogu_strava_integration.py` and replace:
```python
STRAVA_CLIENT_ID = "YOUR_CLIENT_ID"          # Paste your Client ID
STRAVA_CLIENT_SECRET = "YOUR_CLIENT_SECRET"  # Paste your Client Secret
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. First Run - OAuth Authorization
```bash
python hogu_strava_integration.py
```

The script will:
1. Display a Strava authorization URL
2. Ask you to visit the URL and authorize the app
3. You'll be redirected to a URL with a `code` parameter
4. Paste that code when prompted
5. Your token will be saved to `strava_token.json` for future use

### 5. Subsequent Runs
After the first authorization, the script will:
- Automatically load your saved token
- Refresh it if expired
- Fetch your latest activities
- Generate recommendations

---

## Usage

### Basic Usage (Last 5 Activities)
```bash
python hogu_strava_integration.py
```

### Custom Usage (Python Script)
```python
from hogu_strava_integration import run_automated_hogu

# Fetch last 10 activities with local cuisine preference
results = run_automated_hogu(prefer_local=True, limit=10)

# Fetch last 20 activities with international cuisine
results = run_automated_hogu(prefer_local=False, limit=20)
```

---

## Output Example

```
============================================================
🏃 HOG-U PERFORMANCE REPORT - RUNNING
============================================================
Activity          : Morning 10K Run
Session Distance  : 10.45 km
Cumulative Gain   : 342.5 m
Intensity Index   : 32.74 m/km
-----------------------------------------------------------
--- BIO-ENVIRONMENTAL DATA ---
Local Start Time  : 06:30 AM
Meal Window       : Morning Tiffin
Avg Temperature  : 28°C
Relative Humidity : 82%
Sweat Tax Status  : CRITICAL
-----------------------------------------------------------
🍽️ TARGET MEAL   : Level 4: Morning Tiffin Extreme Recovery. Thatte Idli with Sambar + Salted Majjige + 1.5L Fluid.
🔗 OPTIONAL ORDER : https://www.zomato.com/bangalore/restaurants/search?q=Thatte%20Idli%20with%20Sambar
```

---

## File Structure
```
hogu_full_sync1.py                 # Original GPX-based version
hogu_strava_integration.py         # New automated Strava integration
strava_token.json                  # Auto-generated token (keep private!)
hogu_recommendations.json          # Output with meal recommendations
requirements.txt                   # Python dependencies
```

---

## How It Works

### 1. Authentication Flow
```
User runs script
    ↓
Check for saved token
    ↓
If expired → Refresh token
If missing → Show OAuth URL → User authorizes → Exchange code for token → Save token
    ↓
Use token to fetch activities
```

### 2. Activity Processing
```
Fetch activity from Strava
    ↓
Extract: distance, elevation, timestamp, location
    ↓
Convert UTC time to IST timezone
    ↓
Fetch weather data for activity location & time
    ↓
Calculate intensity index (elevation/distance)
    ↓
Apply meal recommendation logic
    ↓
Generate report with Zomato link
```

### 3. Recommendation Logic
```
IF (intensity_index > 18 AND humidity > 75%)
    → Level 4: Extreme Recovery
    → High protein + Extra fluids
    
ELIF (intensity_index > 10)
    → Level 2: Moderate Recovery
    → Balanced nutrition + Coconut water
    
ELSE
    → Level 1: Standard Recovery
    → Light meal
```

---

## Activity Types Supported
- Running (🏃)
- Cycling (🚴)
- Swimming (🏊)
- Hiking (⛰️)
- Rowing (🚣)
- And 50+ other Strava activity types

---

## Customization

### Add Your Own Meal Recommendations
Edit the `process_strava_activity()` function:
```python
if meal_window == "Morning Tiffin":
    meal_query = "YOUR_CUSTOM_MEAL" if prefer_local else "INTERNATIONAL_OPTION"
```

### Change Zomato to Another Food Platform
```python
# For DoorDash
doordash_link = f"https://www.doordash.com/search?query={search_encoded}&location=Bangalore"

# For Swiggy
swiggy_link = f"https://www.swiggy.com/restaurants/search?query={search_encoded}"
```

### Adjust Intensity Thresholds
```python
if intensity_index > 25:  # Changed from 18
    # Ultra high intensity
```

---

## Troubleshooting

### "Token refresh failed"
- Your Strava token has expired and can't be refreshed
- **Solution**: Delete `strava_token.json` and run the script again to re-authenticate

### "No activities found"
- Your Strava account has no public activities or API permissions issue
- **Solution**: Verify that `activity:read_all` scope is approved in Strava settings

### "Failed to fetch weather data"
- Open-Meteo API is unavailable (rare)
- **Solution**: Script falls back to Bengaluru averages automatically

### "Authorization code not working"
- Make sure you copied the entire code from the redirect URL
- **Solution**: Try re-authenticating again

---

## API Rate Limits
- **Strava**: 600 requests per 15 minutes, 30,000 per day
- **Open-Meteo**: 10,000 free requests per day
- This script uses ~1 request per activity, so you can process hundreds of activities

---

## Privacy & Security
⚠️ **IMPORTANT**: 
- `strava_token.json` contains your access token - **keep it private**
- Don't commit it to version control
- Add to `.gitignore`:
  ```
  strava_token.json
  hogu_recommendations.json
  ```

---

## Future Enhancements
- 🔔 Push notifications for meal recommendations
- 📊 Dashboard UI for viewing history
- 🤖 ML-based meal preference learning
- 📲 Mobile app integration
- 🍎 Apple Health sync support

---

## Support
For issues or feature requests, check:
- Strava API Docs: https://developers.strava.com/
- Open-Meteo Docs: https://open-meteo.com/

Happy training! 🏃💪🍽️
