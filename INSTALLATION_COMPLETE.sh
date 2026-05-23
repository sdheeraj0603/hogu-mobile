#!/usr/bin/env bash

# HOG-U Setup Complete - Installation Summary
# Display this after setup is complete

echo "
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🍽️  HOG-U: Automated Meal Recommendation Engine             ║
║       Now Powered by Strava Integration                       ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

✅ SETUP COMPLETE!

Your meal recommendation app has been fully automated with Strava 
integration. Here's what you can do now:

───────────────────────────────────────────────────────────────────

🚀 QUICK START (Choose One):

1. INTERACTIVE SETUP (Easiest)
   └─ python setup.py
   └─ Follows you through step-by-step

2. TERMINAL MODE (Simple Output)
   └─ python hogu_strava_integration.py
   └─ Shows recommendations in terminal

3. WEB DASHBOARD (Beautiful UI)
   └─ pip install flask
   └─ python app.py
   └─ Open http://localhost:5000

───────────────────────────────────────────────────────────────────

📋 WHAT YOU NEED:

1. Strava Account (free): https://www.strava.com
2. Strava API App: https://www.strava.com/settings/api
   → Create app and copy Client ID + Secret
   → Add to hogu_strava_integration.py (lines 13-14)

───────────────────────────────────────────────────────────────────

📚 DOCUMENTATION:

QUICKSTART.md              ← Read this first! (5 min)
README.md                  ← Complete overview
STRAVA_SETUP_GUIDE.md      ← Detailed setup guide
CONFIGURATION_EXAMPLES.md  ← Code examples
documentation.txt         ← Full index

───────────────────────────────────────────────────────────────────

🎯 HOW IT WORKS:

  Your Activity
       ↓
  Strava Sync (automatic)
       ↓
  Analyze: Distance, Elevation, Weather, Time
       ↓
  Generate Personalized Meal Recommendation
       ↓
  Display with Zomato Order Link
       ↓
  Save for Future Analysis

───────────────────────────────────────────────────────────────────

✨ KEY FEATURES:

✅ Automatic Activity Fetching    (no manual uploads)
✅ Real-Time Weather Integration  (activity location)
✅ Smart Meal Recommendations     (based on 5+ factors)
✅ Direct Zomato Ordering         (one-click links)
✅ Web Dashboard                  (beautiful UI)
✅ JSON Export                    (data analysis)
✅ Fully Customizable             (your rules)
✅ Production Ready                (tested & working)

───────────────────────────────────────────────────────────────────

🔒 SECURITY NOTES:

⚠️  strava_token.json contains your access token
    → Keep it private!
    → Already added to .gitignore

⚠️  Don't share your Client Secret
    → Only use in secure environments
    → Use environment variables in production

───────────────────────────────────────────────────────────────────

🎬 NEXT STEPS:

Step 1: Get Strava Credentials
        → Visit https://www.strava.com/settings/api
        → Create an API app
        → Copy Client ID and Secret

Step 2: Update Configuration
        → Open hogu_strava_integration.py
        → Edit lines 13-14 with your credentials
        → OR use: python setup.py (interactive)

Step 3: Run Your First Fetch
        → python hogu_strava_integration.py
        → First run will ask you to authorize
        → Follow the prompts
        → Get instant meal recommendations!

Step 4: (Optional) Use Web Dashboard
        → pip install flask
        → python app.py
        → Visit http://localhost:5000

───────────────────────────────────────────────────────────────────

📊 FILES CREATED:

Core Files:
  hogu_strava_integration.py  ← Automation engine (main file)
  app.py                      ← Web dashboard backend
  templates/index.html        ← Dashboard frontend
  setup.py                    ← Interactive setup wizard

Documentation:
  README.md                   ← Full overview
  QUICKSTART.md              ← 5-minute setup
  STRAVA_SETUP_GUIDE.md      ← Complete guide
  CONFIGURATION_EXAMPLES.md  ← Code examples
  documentation.txt          ← This file

Configuration:
  requirements.txt           ← Python dependencies
  .gitignore                ← Git ignore patterns

Generated (after first run):
  strava_token.json         ← Authentication token
  hogu_recommendations.json ← Your recommendations

───────────────────────────────────────────────────────────────────

💡 TIPS:

1. First Time Authentication
   └─ Script will show a Strava URL
   └─ Click it and authorize
   └─ Copy the code from redirect
   └─ Token saves automatically

2. Schedule Daily Runs
   └─ On Mac/Linux: Edit crontab
   └─ On Windows: Use Task Scheduler
   └─ Examples in CONFIGURATION_EXAMPLES.md

3. Customize Meals
   └─ Edit process_strava_activity() function
   └─ Add your own meal options
   └─ See CONFIGURATION_EXAMPLES.md

4. Multiple Food Platforms
   └─ Works with Zomato (default)
   └─ Can add DoorDash, Swiggy, etc.
   └─ See CONFIGURATION_EXAMPLES.md

───────────────────────────────────────────────────────────────────

❓ QUICK FAQ:

Q: Do I need to authorize every time?
A: No! Token is saved. Only first time.

Q: Can I use without Strava account?
A: No, but original hogu_full_sync1.py still works with GPX files.

Q: How often can I run it?
A: As much as you want! Strava limit: 600/15min, 30,000/day.

Q: Can I change meal recommendations?
A: Yes! Edit process_strava_activity() function.

Q: How do I troubleshoot?
A: See STRAVA_SETUP_GUIDE.md > Troubleshooting section.

───────────────────────────────────────────────────────────────────

🎯 YOU'RE ALL SET!

Ready to get started?

Option 1: Easiest
  └─ python setup.py

Option 2: Manual
  └─ Follow QUICKSTART.md
  └─ Takes 5 minutes

Option 3: Detailed
  └─ Read STRAVA_SETUP_GUIDE.md
  └─ Takes 10 minutes

───────────────────────────────────────────────────────────────────

📞 SUPPORT:

  Strava API:    https://developers.strava.com/
  Weather Data:  https://open-meteo.com/
  Flask:         https://flask.palletsprojects.com/
  Python:        https://www.python.org/

───────────────────────────────────────────────────────────────────

Happy Training! 💪🏃🚴🍽️

Your personalized meal recommendations are one command away.

                        -- HOG-U Team

═══════════════════════════════════════════════════════════════════
"
