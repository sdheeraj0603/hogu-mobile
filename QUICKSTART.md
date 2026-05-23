# 🚀 Quick Start Guide - HOG-U with Strava

## What's New
Your app now **automatically fetches activities from Strava** instead of requiring manual GPX files!

## 📋 Setup (5 minutes)

### Step 1: Get Strava API Credentials
1. Go to **https://www.strava.com/settings/api**
2. Click "Create an API Application"
3. Fill in:
   - Name: `HOG-U Meal Recommender`
   - Domain: `localhost`
4. **Copy your Client ID and Secret**

### Step 2: Update Code
Open `hogu_strava_integration.py` and update:
```python
STRAVA_CLIENT_ID = "YOUR_CLIENT_ID"          # ← Paste here
STRAVA_CLIENT_SECRET = "YOUR_CLIENT_SECRET"  # ← Paste here
```

### Step 3: Install & Run
```bash
pip install -r requirements.txt
python hogu_strava_integration.py
```

First run will ask you to authorize. Follow the prompts!

---

## 💻 Usage Options

### Option 1: Command Line (Simple)
```bash
python hogu_strava_integration.py
```
- Fetches your last 5 activities
- Generates recommendations in terminal
- Saves to `hogu_recommendations.json`

### Option 2: Web Dashboard (Nice UI)
```bash
pip install flask
python app.py
```
Then open: **http://localhost:5000**
- Beautiful web interface
- One-click refresh
- Zomato order links
- Export recommendations

### Option 3: Python Script (Automation)
```python
from hogu_strava_integration import run_automated_hogu

# Get recommendations for last 10 activities
results = run_automated_hogu(prefer_local=True, limit=10)

# Use the results
for activity in results:
    print(f"{activity['activity_name']}: {activity['meal_recommendation']}")
```

---

## 📊 What Happens

```
Your Activity (Running, Cycling, etc.)
         ↓
Strava API fetches automatically
         ↓
Extract: distance, elevation, location, time
         ↓
Fetch weather data from activity location
         ↓
Calculate intensity index
         ↓
Generate personalized meal recommendation
         ↓
Display with Zomato order link
```

---

## 🎯 Key Features

| Feature | Details |
|---------|---------|
| **Auto-Sync** | No more manual GPX uploads |
| **Multi-Activity** | Handles Running, Cycling, Swimming, Hiking, etc. |
| **Real-Time Weather** | Uses actual weather from activity location/time |
| **Smart Recommendations** | Based on intensity, humidity, time of day |
| **Direct Ordering** | One-click order links via Zomato |
| **Local/International** | Choose cuisine preference |

---

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `hogu_strava_integration.py` | Core automation engine |
| `hogu_full_sync1.py` | Original GPX-based version (still works) |
| `app.py` | Web dashboard backend |
| `templates/index.html` | Web dashboard UI |
| `strava_token.json` | Auto-generated (keep private!) |
| `hogu_recommendations.json` | Output recommendations |

---

## ⚠️ Important Notes

1. **First Run**: Will ask you to authorize Strava (one-time)
2. **Token**: Saved locally in `strava_token.json`
3. **Privacy**: Your token is private - don't share it
4. **Rate Limits**: Strava allows 600 requests/15min (plenty for this use)

---

## 🐛 Troubleshooting

**Q: "Failed to authenticate"**
- Delete `strava_token.json` and run again

**Q: "No activities found"**
- Make sure you have activities on Strava
- Check that OAuth was approved

**Q: "Weather API error"**
- Open-Meteo API is down (rare)
- Script falls back to average values

**Q: How do I switch between users?**
- Delete `strava_token.json`
- Run the script again
- Authorize with different Strava account

---

## 🎨 Customization

### Change Activity Limits
```python
run_automated_hogu(prefer_local=True, limit=20)  # Get last 20 instead of 5
```

### Switch Cuisine Type
```python
run_automated_hogu(prefer_local=False, limit=5)  # International meals
```

### Adjust Intensity Thresholds
Edit thresholds in `process_strava_activity()`:
```python
if intensity_index > 20:  # Changed from 18
    # Ultra high intensity
```

### Add More Meals
Add more options in the meal recommendation logic:
```python
elif meal_window == "Breakfast":
    meal_query = "Idli Vada" if prefer_local else "Pancakes with Eggs"
```

---

## 🔄 Automation (Schedule Auto-Refresh)

### On Mac (Using Cron)
```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 8 AM)
0 8 * * * cd /Users/sdheeraj/VS-new && python hogu_strava_integration.py
```

### On Windows (Using Task Scheduler)
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger: Daily at 8 AM
4. Action: `python "C:\path\hogu_strava_integration.py"`

---

## 📈 What's Next?

- ✨ Add Fitbit/Apple Health sync
- 📲 Mobile app
- 🤖 ML-based preference learning
- 🔔 Push notifications
- 📊 Historical analytics dashboard

---

## 🎉 You're Ready!

```bash
python hogu_strava_integration.py
```

Your personalized meal recommendations are just one command away! 🍽️💪

Questions? Check `STRAVA_SETUP_GUIDE.md` for detailed documentation.
