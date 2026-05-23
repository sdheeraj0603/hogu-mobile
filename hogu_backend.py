"""
HOG-U Multi-Source Fitness Backend
Handles OAuth for Strava + Google Fit, stores tokens per user email,
fetches and normalizes workout data from all sources.

Samsung Health: No public cloud API exists. Users must sync Samsung Health → Google Fit
(Samsung Health app supports this natively in Settings > Connected Services > Google Fit)
Then we read their Samsung Health data via Google Fit API.

Run: python3 hogu_backend.py
"""

from flask import Flask, request, jsonify, redirect
import json
import os
import time
import requests
from datetime import datetime, timedelta

app = Flask(__name__)

# ============ CONFIG ============
from dotenv import load_dotenv
load_dotenv()

STRAVA_CLIENT_ID = os.environ.get("STRAVA_CLIENT_ID")
STRAVA_CLIENT_SECRET = os.environ.get("STRAVA_CLIENT_SECRET")

GOOGLE_FIT_CLIENT_ID = os.environ.get("GOOGLE_FIT_CLIENT_ID")
GOOGLE_FIT_CLIENT_SECRET = os.environ.get("GOOGLE_FIT_CLIENT_SECRET")

# Simple file-based token storage (use a real DB in production)
TOKEN_FILE = "user_tokens.json"
REDIRECT_APP_URL = "hogu://oauth/complete"  # Deep link back to mobile app
GOOGLE_REDIRECT_URI = "http://localhost:5000/auth/google/callback"


# ============ TOKEN STORAGE ============

def load_tokens() -> dict:
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_tokens(tokens: dict):
    with open(TOKEN_FILE, 'w') as f:
        json.dump(tokens, f, indent=2)

def get_user_tokens(email: str) -> dict:
    tokens = load_tokens()
    return tokens.get(email, {})

def save_user_token(email: str, provider: str, token_data: dict):
    tokens = load_tokens()
    if email not in tokens:
        tokens[email] = {}
    tokens[email][provider] = token_data
    save_tokens(tokens)


# ============ OAUTH CALLBACKS ============

@app.route('/auth/strava/callback')
def strava_callback():
    """Strava redirects here after user authorizes. Exchange code for token."""
    code = request.args.get('code')
    email = request.args.get('state')  # We pass email as state param
    
    if not code or not email:
        return jsonify({"error": "Missing code or email"}), 400
    
    # Exchange code for token
    response = requests.post('https://www.strava.com/oauth/token', json={
        'client_id': STRAVA_CLIENT_ID,
        'client_secret': STRAVA_CLIENT_SECRET,
        'code': code,
        'grant_type': 'authorization_code'
    })
    
    if response.status_code != 200:
        return jsonify({"error": "Token exchange failed"}), 500
    
    token_data = response.json()
    save_user_token(email, 'strava', token_data)
    
    # Redirect back to mobile app
    return redirect(f"{REDIRECT_APP_URL}?provider=strava&status=success")


@app.route('/auth/google/callback')
def google_callback():
    """Google redirects here after user authorizes Google Fit."""
    code = request.args.get('code')
    email = request.args.get('state')
    
    if not code or not email:
        return jsonify({"error": "Missing code or email"}), 400
    
    # Exchange code for token
    response = requests.post('https://oauth2.googleapis.com/token', data={
        'client_id': GOOGLE_FIT_CLIENT_ID,
        'client_secret': GOOGLE_FIT_CLIENT_SECRET,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': GOOGLE_REDIRECT_URI
    })
    
    if response.status_code != 200:
        return jsonify({"error": "Google token exchange failed"}), 500
    
    token_data = response.json()
    save_user_token(email, 'google_fit', token_data)
    
    return redirect(f"{REDIRECT_APP_URL}?provider=google_fit&status=success")


# ============ DATA ENDPOINTS ============

@app.route('/api/workouts')
def get_workouts():
    """Get unified workouts from all connected sources for a user."""
    email = request.args.get('email')
    limit = int(request.args.get('limit', 20))
    
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    user_tokens = get_user_tokens(email)
    all_workouts = []
    
    # Fetch from Strava
    if 'strava' in user_tokens:
        strava_workouts = fetch_strava_workouts(user_tokens['strava'], email, limit)
        all_workouts.extend(strava_workouts)
    
    # Fetch from Google Fit (includes Samsung Health data if synced)
    if 'google_fit' in user_tokens:
        gfit_workouts = fetch_google_fit_workouts(user_tokens['google_fit'], email, limit)
        all_workouts.extend(gfit_workouts)
    
    # Sort by date, most recent first
    all_workouts.sort(key=lambda w: w['startDate'], reverse=True)
    
    return jsonify({"workouts": all_workouts[:limit]})


@app.route('/api/health-metrics')
def get_health_metrics():
    """Get health metrics (resting HR, HRV, calories) from Google Fit."""
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    user_tokens = get_user_tokens(email)
    
    metrics = {"lastSyncTime": datetime.now().isoformat()}
    
    if 'google_fit' in user_tokens:
        token = ensure_google_token_fresh(user_tokens['google_fit'], email)
        if token:
            metrics.update(fetch_google_fit_metrics(token))
    
    return jsonify(metrics)


@app.route('/api/accounts')
def get_accounts():
    """Get list of connected accounts for a user."""
    email = request.args.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    user_tokens = get_user_tokens(email)
    accounts = []
    
    if 'strava' in user_tokens:
        athlete = user_tokens['strava'].get('athlete', {})
        accounts.append({
            "provider": "strava",
            "email": email,
            "connected": True,
            "athleteName": f"{athlete.get('firstname', '')} {athlete.get('lastname', '')}".strip(),
            "lastSync": datetime.now().isoformat()
        })
    
    if 'google_fit' in user_tokens:
        accounts.append({
            "provider": "google_fit",
            "email": email,
            "connected": True,
            "athleteName": email,
            "lastSync": datetime.now().isoformat()
        })
    
    return jsonify(accounts)


# ============ STRAVA DATA FETCHING ============

def ensure_strava_token_fresh(token_data, email):
    """Refresh Strava token if expired."""
    expires_at = token_data.get('expires_at', 0)
    if time.time() < expires_at - 60:
        return token_data  # Still valid
    
    # Refresh
    response = requests.post('https://www.strava.com/oauth/token', json={
        'client_id': STRAVA_CLIENT_ID,
        'client_secret': STRAVA_CLIENT_SECRET,
        'grant_type': 'refresh_token',
        'refresh_token': token_data.get('refresh_token')
    })
    
    if response.status_code != 200:
        return None
    
    new_token = response.json()
    new_token['athlete'] = token_data.get('athlete', {})
    save_user_token(email, 'strava', new_token)
    return new_token


def fetch_strava_workouts(token_data: dict, email: str, limit: int) -> list:
    """Fetch activities from Strava API."""
    token = ensure_strava_token_fresh(token_data, email)
    if not token:
        return []
    
    try:
        response = requests.get(
            'https://www.strava.com/api/v3/athlete/activities',
            headers={'Authorization': f"Bearer {token['access_token']}"},
            params={'per_page': limit}
        )
        
        if response.status_code != 200:
            return []
        
        activities = response.json()
        return [{
            'id': f"strava_{a['id']}",
            'source': 'strava',
            'type': a.get('type', 'Unknown'),
            'name': a.get('name', 'Workout'),
            'startDate': a.get('start_date', ''),
            'duration': a.get('moving_time', 0),
            'distance': a.get('distance', 0),
            'calories': a.get('calories'),
            'avgHeartRate': a.get('average_heartrate'),
            'maxHeartRate': a.get('max_heartrate'),
            'elevationGain': a.get('total_elevation_gain', 0),
            'avgSpeed': a.get('average_speed', 0),
        } for a in activities]
    except Exception as e:
        print(f"Strava fetch error: {e}")
        return []


# ============ GOOGLE FIT DATA FETCHING ============

def ensure_google_token_fresh(token_data, email):
    """Refresh Google OAuth token if expired."""
    expires_at = token_data.get('expires_at', 0)
    if time.time() < expires_at - 60:
        return token_data
    
    response = requests.post('https://oauth2.googleapis.com/token', data={
        'client_id': GOOGLE_FIT_CLIENT_ID,
        'client_secret': GOOGLE_FIT_CLIENT_SECRET,
        'grant_type': 'refresh_token',
        'refresh_token': token_data.get('refresh_token')
    })
    
    if response.status_code != 200:
        return None
    
    new_token = response.json()
    new_token['refresh_token'] = token_data.get('refresh_token')  # Google doesn't always return it
    new_token['expires_at'] = time.time() + new_token.get('expires_in', 3600)
    save_user_token(email, 'google_fit', new_token)
    return new_token


def fetch_google_fit_workouts(token_data: dict, email: str, limit: int) -> list:
    """
    Fetch workouts from Google Fit REST API.
    This includes data synced FROM Samsung Health → Google Fit.
    """
    token = ensure_google_token_fresh(token_data, email)
    if not token:
        return []
    
    try:
        # Get sessions (workouts) from last 30 days
        end_time = datetime.now()
        start_time = end_time - timedelta(days=30)
        
        response = requests.get(
            'https://www.googleapis.com/fitness/v1/users/me/sessions',
            headers={'Authorization': f"Bearer {token['access_token']}"},
            params={
                'startTime': start_time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
                'endTime': end_time.strftime('%Y-%m-%dT%H:%M:%S.000Z'),
            }
        )
        
        if response.status_code != 200:
            print(f"Google Fit sessions error: {response.status_code}")
            return []
        
        sessions = response.json().get('session', [])
        
        # Map Google Fit activity types to readable names
        activity_type_map = {
            7: 'Walking', 8: 'Running', 1: 'Cycling', 82: 'Swimming',
            80: 'Strength Training', 35: 'HIIT', 9: 'Aerobics',
            97: 'Yoga', 25: 'Elliptical', 14: 'Rowing',
        }
        
        workouts = []
        for s in sessions[:limit]:
            start_ms = int(s.get('startTimeMillis', 0))
            end_ms = int(s.get('endTimeMillis', 0))
            activity_type = s.get('activityType', 0)
            
            workouts.append({
                'id': f"gfit_{s.get('id', '')}",
                'source': 'google_fit',
                'type': activity_type_map.get(activity_type, 'Workout'),
                'name': s.get('name', activity_type_map.get(activity_type, 'Workout')),
                'startDate': datetime.fromtimestamp(start_ms / 1000).isoformat(),
                'duration': (end_ms - start_ms) // 1000,
                'distance': None,  # Need separate dataset query
                'calories': None,  # Need separate dataset query
                'avgHeartRate': None,
                'maxHeartRate': None,
                'elevationGain': None,
                'avgSpeed': None,
            })
        
        # Enrich with actual metrics (HR, calories, distance)
        for workout in workouts:
            enrich_google_fit_workout(token, workout)
        
        return workouts
    except Exception as e:
        print(f"Google Fit fetch error: {e}")
        return []


def enrich_google_fit_workout(token: dict, workout: dict):
    """Fetch detailed metrics for a single Google Fit workout."""
    try:
        start_time = datetime.fromisoformat(workout['startDate'])
        end_time = start_time + timedelta(seconds=workout['duration'])
        
        start_ns = int(start_time.timestamp() * 1e9)
        end_ns = int(end_time.timestamp() * 1e9)
        
        # Fetch heart rate
        hr_response = requests.post(
            'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
            headers={
                'Authorization': f"Bearer {token['access_token']}",
                'Content-Type': 'application/json'
            },
            json={
                "aggregateBy": [
                    {"dataTypeName": "com.google.heart_rate.bpm"},
                    {"dataTypeName": "com.google.calories.expended"},
                    {"dataTypeName": "com.google.distance.delta"},
                ],
                "startTimeMillis": int(start_time.timestamp() * 1000),
                "endTimeMillis": int(end_time.timestamp() * 1000),
            }
        )
        
        if hr_response.status_code == 200:
            buckets = hr_response.json().get('bucket', [])
            for bucket in buckets:
                for dataset in bucket.get('dataset', []):
                    for point in dataset.get('point', []):
                        dtype = point.get('dataTypeName', '')
                        values = point.get('value', [])
                        if 'heart_rate' in dtype and values:
                            workout['avgHeartRate'] = values[0].get('fpVal')
                        elif 'calories' in dtype and values:
                            workout['calories'] = int(values[0].get('fpVal', 0))
                        elif 'distance' in dtype and values:
                            workout['distance'] = values[0].get('fpVal', 0)
    except Exception as e:
        print(f"Enrich error: {e}")


def fetch_google_fit_metrics(token: dict) -> dict:
    """Fetch today's health metrics from Google Fit."""
    metrics = {}
    try:
        now = datetime.now()
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        
        response = requests.post(
            'https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate',
            headers={
                'Authorization': f"Bearer {token['access_token']}",
                'Content-Type': 'application/json'
            },
            json={
                "aggregateBy": [
                    {"dataTypeName": "com.google.calories.expended"},
                    {"dataTypeName": "com.google.step_count.delta"},
                    {"dataTypeName": "com.google.heart_rate.bpm"},
                ],
                "startTimeMillis": int(start_of_day.timestamp() * 1000),
                "endTimeMillis": int(now.timestamp() * 1000),
            }
        )
        
        if response.status_code == 200:
            buckets = response.json().get('bucket', [])
            for bucket in buckets:
                for dataset in bucket.get('dataset', []):
                    for point in dataset.get('point', []):
                        dtype = point.get('dataTypeName', '')
                        values = point.get('value', [])
                        if 'calories' in dtype and values:
                            metrics['activeCaloriesToday'] = int(values[0].get('fpVal', 0))
                        elif 'step_count' in dtype and values:
                            metrics['steps'] = int(values[0].get('intVal', 0))
                        elif 'heart_rate' in dtype and values:
                            metrics['restingHR'] = int(values[0].get('fpVal', 0))
    except Exception as e:
        print(f"Google Fit metrics error: {e}")
    
    return metrics


# ============ SEED EXISTING STRAVA TOKEN ============

@app.route('/api/seed-strava', methods=['POST'])
def seed_strava():
    """
    Seed an existing Strava token (from strava_token.json) into the user store.
    Call this once to migrate your existing token.
    """
    email = request.json.get('email')
    if not email:
        return jsonify({"error": "Email required"}), 400
    
    token_file = os.path.join(os.path.dirname(__file__), 'strava_token.json')
    if not os.path.exists(token_file):
        return jsonify({"error": "No strava_token.json found"}), 404
    
    with open(token_file, 'r') as f:
        token_data = json.load(f)
    
    save_user_token(email, 'strava', token_data)
    return jsonify({"status": "success", "message": f"Strava token saved for {email}"})


@app.route('/api/login', methods=['POST'])
def login():
    """
    Simple email-based login. Returns connected fitness accounts.
    In production, add proper password/OTP verification.
    """
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    
    if not email or '@' not in email:
        return jsonify({"error": "Valid email required"}), 400
    
    user_tokens = get_user_tokens(email)
    connected = []
    
    if 'strava' in user_tokens:
        athlete = user_tokens['strava'].get('athlete', {})
        connected.append({
            "provider": "strava",
            "connected": True,
            "athleteName": f"{athlete.get('firstname', '')} {athlete.get('lastname', '')}".strip() or email,
        })
    
    if 'google_fit' in user_tokens:
        connected.append({
            "provider": "google_fit",
            "connected": True,
            "athleteName": email,
        })
    
    return jsonify({
        "status": "success",
        "email": email,
        "connectedAccounts": connected,
        "hasWorkouts": len(connected) > 0,
    })


@app.route('/auth/strava/start')
def strava_start():
    """Redirect user to Strava OAuth. Pass email as state."""
    email = request.args.get('email', '')
    redirect_uri = 'http://192.168.1.6:5000/auth/strava/callback'
    auth_url = (
        f"https://www.strava.com/oauth/authorize"
        f"?client_id={STRAVA_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={redirect_uri}"
        f"&approval_prompt=force"
        f"&scope=activity:read_all"
        f"&state={email}"
    )
    return redirect(auth_url)


@app.route('/auth/google/start')
def google_start():
    """Redirect user to Google OAuth. Pass email as state."""
    email = request.args.get('email', '')
    scopes = 'https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.heart_rate.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.location.read'
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth"
        f"?client_id={GOOGLE_FIT_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={GOOGLE_REDIRECT_URI}"
        f"&scope={scopes}"
        f"&access_type=offline"
        f"&prompt=consent"
        f"&state={email}"
    )
    return redirect(auth_url)


# ============ MAIN ============

if __name__ == '__main__':
    print("\n🚀 HOG-U Multi-Source Fitness Backend")
    print("=" * 50)
    print("📡 Endpoints:")
    print("   GET  /api/workouts?email=...      - Unified workouts")
    print("   GET  /api/health-metrics?email=... - Health data")
    print("   GET  /api/accounts?email=...       - Connected accounts")
    print("   GET  /auth/strava/callback         - Strava OAuth callback")
    print("   GET  /auth/google/callback         - Google Fit OAuth callback")
    print("   POST /api/seed-strava              - Seed existing Strava token")
    print("=" * 50)
    print("\n⚡ To connect your existing Strava token:")
    print('   curl -X POST http://localhost:5000/api/seed-strava -H "Content-Type: application/json" -d \'{"email":"your@email.com"}\'')
    print("\n🔗 Samsung Health: Users must enable Samsung Health → Google Fit sync")
    print("   (Samsung Health app > Settings > Connected Services > Google Fit)")
    print()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
