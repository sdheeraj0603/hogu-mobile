import gpxpy
import requests
import urllib.parse
import urllib3
from datetime import datetime, timedelta

# --- STABILITY: SILENCE macOS SSL WARNINGS ---
urllib3.disable_warnings(urllib3.exceptions.NotOpenSSLWarning)

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

def get_meal_time(hour):
    """Determines the appropriate meal window based on IST hour."""
    if 5 <= hour < 11: return "Morning Tiffin"
    elif 11 <= hour < 16: return "Lunch"
    elif 16 <= hour < 22: return "Recovery Dinner"
    else: return "Late Night Recovery"

def generate_hogu_final_report(gpx_file, prefer_local=True):
    """
    Core Engine: Processes GPX, corrects Timezone, Fetches Weather, 
    and curates localized nutrition.
    """
    try:
        with open(gpx_file, 'r') as f:
            gpx = gpxpy.parse(f)
        
        # 1. TIMEZONE CORRECTION (UTC to IST)
        utc_start = gpx.get_time_bounds().start_time
        # Correcting the 01:03 AM UTC bug to ~06:33 AM IST
        ist_start = utc_start + timedelta(hours=5, minutes=30)
        
        run_hour = ist_start.hour
        meal_window = get_meal_time(run_hour)
        
        # 2. PERFORMANCE METRICS
        dist_km = gpx.length_2d() / 1000
        start_pt = gpx.tracks[0].segments[0].points[0]
        
        gain = 0
        prev_alt = None
        for track in gpx.tracks:
            for seg in track.segments:
                for p in seg.points:
                    if prev_alt is not None and p.elevation > prev_alt:
                        gain += (p.elevation - prev_alt)
                    prev_alt = p.elevation

        intensity_index = gain / dist_km
        
        # 3. ENVIRONMENTAL SYNC
        temp, hum = get_weather_data(start_pt.latitude, start_pt.longitude, ist_start)
        
        # 4. CONTEXT-AWARE NUTRITION LOGIC
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
        print(f"\n--- 🏃 HOG-U PERFORMANCE REPORT ---")
        print(f"Session Distance  : {dist_km:.2f} km")
        print(f"Cumulative Gain   : {gain:.1f} m")
        print(f"Intensity Index   : {intensity_index:.2f} m/km")
        print(f"-----------------------------------")
        print(f"--- BIO-ENVIRONMENTAL DATA ---")
        print(f"Local Start Time  : {ist_start.strftime('%I:%M %p')}")
        print(f"Meal Window       : {meal_window}")
        print(f"Avg Temperature   : {temp}°C")
        print(f"Relative Humidity : {hum}%")
        print(f"Sweat Tax Status  : {'CRITICAL' if hum > 80 else 'NORMAL'}")
        print(f"-----------------------------------")
        print(f"🍽️ TARGET MEAL   : {recovery}")
        
        search_encoded = urllib.parse.quote(meal_query)
        zomato_link = f"https://www.zomato.com/bangalore/restaurants/search?q={search_encoded}"
        print(f"🔗 OPTIONAL ORDER : {zomato_link}")

    except Exception as e:
        print(f"Analysis Failed: {e}")

if __name__ == "__main__":
    # Path to your Samsung Health / Manual GPX Export
    generate_hogu_final_report('20260503_062534.gpx', prefer_local=True)
