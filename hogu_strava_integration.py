"""
HOG-U: Automated Meal Recommendation Engine with Strava Integration
Fetches recent activities from Strava and recommends meals based on performance metrics.
"""

import requests
import urllib.parse
import urllib3
from datetime import datetime, timedelta
import json
import os
from pathlib import Path

# --- STABILITY: SILENCE macOS SSL WARNINGS ---
urllib3.disable_warnings(urllib3.exceptions.NotOpenSSLWarning)

# ==================== STRAVA API CONFIG ====================
STRAVA_CLIENT_ID = "233623"  # Get from https://www.strava.com/settings/api
STRAVA_CLIENT_SECRET = "73515b47713192ae55aea6e42f54c284a6305f24"
STRAVA_REDIRECT_URI = "http://localhost:8000/callback"

TOKEN_FILE = "strava_token.json"

# ==================== STRAVA AUTHENTICATION ====================

def save_token(token_data):
    """Save access token to file for future use."""
    with open(TOKEN_FILE, 'w') as f:
        json.dump(token_data, f)
    print(f"✓ Token saved to {TOKEN_FILE}")

def load_token():
    """Load existing access token."""
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'r') as f:
            return json.load(f)
    return None

def refresh_strava_token(refresh_token):
    """Refresh expired Strava access token."""
    url = "https://www.strava.com/oauth/token"
    payload = {
        "client_id": STRAVA_CLIENT_ID,
        "client_secret": STRAVA_CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        token_data = response.json()
        save_token(token_data)
        return token_data['access_token']
    except Exception as e:
        print(f"❌ Token refresh failed: {e}")
        return None

def get_strava_auth_url():
    """Generate Strava OAuth authorization URL."""
    params = {
        "client_id": STRAVA_CLIENT_ID,
        "response_type": "code",
        "redirect_uri": STRAVA_REDIRECT_URI,
        "approval_prompt": "force",  # Force re-authentication
        "scope": "activity:read_all"  # Request read access to all activities
    }
    auth_url = "https://www.strava.com/oauth/authorize?" + urllib.parse.urlencode(params)
    return auth_url

def exchange_code_for_token(authorization_code):
    """Exchange authorization code for access token."""
    url = "https://www.strava.com/oauth/token"
    payload = {
        "client_id": STRAVA_CLIENT_ID,
        "client_secret": STRAVA_CLIENT_SECRET,
        "code": authorization_code,
        "grant_type": "authorization_code"
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        token_data = response.json()
        save_token(token_data)
        return token_data['access_token']
    except Exception as e:
        print(f"❌ Authentication failed: {e}")
        return None

def get_valid_access_token():
    """Get a valid access token, refreshing if necessary."""
    token_data = load_token()
    
    if token_data is None:
        print("🔐 First time setup - Need Strava authentication")
        auth_url = get_strava_auth_url()
        print(f"\n1. Visit this URL: {auth_url}")
        print("\n2. After authorizing, you'll be redirected to a URL")
        auth_code = input("3. Paste the 'code' parameter from the redirect URL: ").strip()
        
        if auth_code:
            return exchange_code_for_token(auth_code)
        else:
            print("❌ No authorization code provided")
            return None
    
    # Check if token is expired
    expires_at = token_data.get('expires_at', 0)
    if expires_at < datetime.now().timestamp():
        print("🔄 Token expired, refreshing...")
        return refresh_strava_token(token_data.get('refresh_token'))
    
    return token_data.get('access_token')

# ==================== STRAVA DATA FETCHING ====================

def get_recent_activities(access_token, limit=10):
    """Fetch recent activities from Strava."""
    url = "https://www.strava.com/api/v3/athlete/activities"
    headers = {"Authorization": f"Bearer {access_token}"}
    params = {"per_page": limit, "page": 1}
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Failed to fetch activities: {e}")
        return []

def get_activity_details(activity_id, access_token):
    """Fetch detailed information about a specific activity."""
    url = f"https://www.strava.com/api/v3/activities/{activity_id}"
    headers = {"Authorization": f"Bearer {access_token}"}
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Failed to fetch activity details: {e}")
        return None

# ==================== LOCATION MAPPING ====================

def get_location_name(lat, lon):
    """Map coordinates to location names (hardcoded for Bangalore landmarks)."""
    # Bangalore popular fitness locations mapping
    locations = {
        "Lalbagh": {"lat": 12.9498, "lon": 77.5855, "radius": 0.02},
        "Cubbon Park": {"lat": 12.9352, "lon": 77.5903, "radius": 0.02},
        "Sankey Tank": {"lat": 13.0033, "lon": 77.6155, "radius": 0.02},
        "Ulsoor Lake": {"lat": 13.0346, "lon": 77.6246, "radius": 0.02},
        "JP Park": {"lat": 12.9716, "lon": 77.5938, "radius": 0.02},
    }
    
    # Check if coordinates match any known location
    for location, info in locations.items():
        lat_diff = abs(lat - info["lat"])
        lon_diff = abs(lon - info["lon"])
        if lat_diff < info["radius"] and lon_diff < info["radius"]:
            return location
    
    # Default to city if no specific location matches
    return "Bangalore"

# ==================== WEATHER DATA ====================

def get_weather_data(lat, lon, timestamp):
    """Fetches historical weather for the specific coordinate and time."""
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat, "longitude": lon,
        "start_date": timestamp.date().isoformat(),
        "end_date": timestamp.date().isoformat(),
        "hourly": "temperature_2m,relative_humidity_2m",
        "timezone": "auto"
    }
    try:
        response = requests.get(url, params=params).json()
        hour = timestamp.hour
        return response['hourly']['temperature_2m'][hour], response['hourly']['relative_humidity_2m'][hour]
    except:
        # Fallback to Bengaluru May averages
        return 22.9, 89.0

# ==================== NUTRITION ENGINE ====================

def get_meal_time(hour):
    """Determines the appropriate meal window based on IST hour."""
    if 5 <= hour < 11: return "Morning Tiffin"
    elif 11 <= hour < 16: return "Lunch"
    elif 16 <= hour < 22: return "Recovery Dinner"
    else: return "Late Night Recovery"

def calculate_intensity_index(distance_m, elevation_gain_m):
    """Calculate intensity index from distance and elevation."""
    if distance_m == 0:
        return 0
    distance_km = distance_m / 1000
    return elevation_gain_m / distance_km

def process_strava_activity(activity, prefer_local=True):
    """
    Process Strava activity data and generate meal recommendations.
    """
    try:
        # Extract activity metadata
        activity_name = activity.get('name', 'Unknown Activity')
        activity_type = activity.get('type', 'Unknown')  # Running, Cycling, etc.
        distance_m = activity.get('distance', 0)
        elevation_gain = activity.get('total_elevation_gain', 0)
        start_time_str = activity.get('start_date', '')
        
        # Parse activity timestamp (UTC)
        if start_time_str:
            start_time_utc = datetime.fromisoformat(start_time_str.replace('Z', '+00:00'))
            # Convert UTC to IST
            start_time_ist = start_time_utc + timedelta(hours=5, minutes=30)
        else:
            start_time_ist = datetime.now()
        
        # Get location data from start_latlng
        start_latlng = activity.get('start_latlng', [None, None])
        start_lat = start_latlng[0] if start_latlng else None
        start_lon = start_latlng[1] if start_latlng else None
        
        # Get location name from coordinates
        location_name = get_location_name(start_lat, start_lon) if start_lat and start_lon else "Bangalore"
        
        # Calculate metrics
        dist_km = distance_m / 1000
        intensity_index = calculate_intensity_index(distance_m, elevation_gain)
        
        # Get weather data
        if start_lat and start_lon:
            temp, hum = get_weather_data(start_lat, start_lon, start_time_ist)
        else:
            temp, hum = 22.9, 89.0  # Fallback
        
        run_hour = start_time_ist.hour
        meal_window = get_meal_time(run_hour)
        
        # Determine recovery needs based on activity metrics
        if intensity_index > 18 and hum > 75:
            # High Stress / High Humidity Branch
            if meal_window == "Morning Tiffin":
                meal_query = "Thatte Idli with Sambar" if prefer_local else "Pasta Aglio Olio with Chicken"
            elif meal_window == "Recovery Dinner":
                meal_query = "Ragi Mudde with Soppina Saaru" if prefer_local else "Grilled Salmon with Sweet Potato"
            else:
                meal_query = "High Protein Thali" if prefer_local else "Pasta Carbonara"
            
            recovery = f"Level 4: {meal_window} Extreme Recovery. {meal_query} + Salted Majjige + 1.5L Fluid."
        
        elif intensity_index > 10:
            # Moderate Stress Branch
            meal_query = "Set Dosa with Sagoo" if prefer_local else "Chicken Quinoa Bowl"
            recovery = f"Level 2: {meal_window} Moderate Recovery. {meal_query} + Coconut Water."
        
        else:
            # Low Stress Branch
            meal_query = "Poha" if prefer_local else "Fruit and Nut Salad"
            recovery = f"Level 1: {meal_window} Standard Recovery. {meal_query}."

        # --- FINAL REPORT OUTPUT ---
        print(f"\n{'='*60}")
        print(f"🏃 HOG-U PERFORMANCE REPORT - {activity_type.upper()}")
        print(f"{'='*60}")
        print(f"Activity          : {activity_name}")
        print(f"Session Distance  : {dist_km:.2f} km")
        print(f"Cumulative Gain   : {elevation_gain:.1f} m")
        print(f"Intensity Index   : {intensity_index:.2f} m/km")
        print(f"---" + "-"*57)
        print(f"--- BIO-ENVIRONMENTAL DATA ---")
        print(f"Local Start Time  : {start_time_ist.strftime('%I:%M %p')}")
        print(f"Meal Window       : {meal_window}")
        print(f"Activity Location : {location_name}")
        print(f"Avg Temperature   : {temp}°C")
        print(f"Relative Humidity : {hum}%")
        print(f"Sweat Tax Status  : {'CRITICAL' if hum > 80 else 'NORMAL'}")
        print(f"---" + "-"*57)
        print(f"🍽️ TARGET MEAL   : {recovery}")
        
        search_encoded = urllib.parse.quote(meal_query)
        zomato_link = f"https://www.zomato.com/bangalore/restaurants/search?q={search_encoded}"
        print(f"🔗 OPTIONAL ORDER : {zomato_link}\n")
        
        return {
            "activity_name": activity_name,
            "activity_type": activity_type,
            "distance_km": dist_km,
            "elevation_gain": elevation_gain,
            "intensity_index": intensity_index,
            "meal_recommendation": recovery,
            "meal_query": meal_query,
            "zomato_link": zomato_link,
            "meal_window": meal_window,
            "temperature": temp,
            "humidity": hum,
            "sweat_status": "CRITICAL" if hum > 80 else "NORMAL",
            "start_time": start_time_ist.strftime('%I:%M %p'),
            "location": location_name
        }
    
    except Exception as e:
        print(f"❌ Analysis Failed: {e}")
        return None

# ==================== MAIN AUTOMATION ====================

def run_automated_hogu(prefer_local=True, limit=5):
    """
    Main automation function: Fetch latest activities from Strava and generate recommendations.
    """
    print("\n🚀 HOG-U AUTOMATED MEAL RECOMMENDATION ENGINE")
    print("=" * 60)
    
    # Step 1: Get valid Strava access token
    access_token = get_valid_access_token()
    if not access_token:
        print("❌ Failed to authenticate with Strava")
        return
    
    print("✓ Successfully authenticated with Strava\n")
    
    # Step 2: Fetch recent activities
    print(f"📊 Fetching your last {limit} activities...")
    activities = get_recent_activities(access_token, limit=limit)
    
    if not activities:
        print("❌ No activities found")
        return
    
    print(f"✓ Found {len(activities)} activities\n")
    
    # Step 3: Process each activity and generate recommendations
    results = []
    for idx, activity in enumerate(activities, 1):
        print(f"\n[{idx}/{len(activities)}] Processing: {activity['name']}")
        result = process_strava_activity(activity, prefer_local=prefer_local)
        if result:
            results.append(result)
    
    # Step 4: Save results to JSON
    output_file = "hogu_recommendations.json"
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)
    print(f"\n✓ Results saved to {output_file}")
    
    return results

if __name__ == "__main__":
    # Run automated meal recommendations for last 5 activities
    run_automated_hogu(prefer_local=True, limit=5)
