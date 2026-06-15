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

# Auto-detect local IP for dev
import socket, subprocess
def _get_local_ip():
    try:
        # macOS: get en0 (WiFi) IP directly
        result = subprocess.run(['ipconfig', 'getifaddr', 'en0'], capture_output=True, text=True)
        ip = result.stdout.strip()
        if ip:
            return ip
    except:
        pass
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

SERVER_BASE = f"http://{_get_local_ip()}:5000"
# PUBLIC_URL overrides the auto-detected LAN address with a public HTTPS URL
# (ngrok tunnel or deployed server) so OAuth redirects work from ANY phone /
# network. e.g. PUBLIC_URL=https://hogu.ngrok-free.app
PUBLIC_URL = os.environ.get("PUBLIC_URL", "").rstrip("/")
if PUBLIC_URL:
    SERVER_BASE = PUBLIC_URL

STRAVA_REDIRECT_URI = f"{SERVER_BASE}/auth/strava/callback"
# Google rejects http:// on non-localhost, but accepts the https ngrok/cloud
# URL — so on a real phone you MUST run with PUBLIC_URL set to https://...
GOOGLE_REDIRECT_URI = f"{SERVER_BASE}/auth/google/callback" if PUBLIC_URL else "http://localhost:5000/auth/google/callback"


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

@app.route('/auth/strava/start')
def strava_start():
    """Redirect user to Strava OAuth. Pass email as state."""
    email = request.args.get('email', '')
    auth_url = (
        f"https://www.strava.com/oauth/authorize"
        f"?client_id={STRAVA_CLIENT_ID}"
        f"&response_type=code"
        f"&redirect_uri={STRAVA_REDIRECT_URI}"
        f"&approval_prompt=force"
        f"&scope=activity:read_all"
        f"&state={email}"
    )
    return redirect(auth_url)


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
    token_data['expires_at'] = time.time() + token_data.get('expires_in', 3600)
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
    Simple email-based login. Returns the user's OWN connected fitness accounts.
    Each email is independent — every user connects their own Strava / Google Fit.
    """
    data = request.json or {}
    email = data.get('email', '').strip().lower()

    if not email or '@' not in email:
        return jsonify({"error": "Valid email required"}), 400

    user_tokens = get_user_tokens(email)

    connected = []

    # Use the logged-in user's email-derived name
    display_name = email.split('@')[0].replace('.', ' ').replace('_', ' ').title()

    if 'strava' in user_tokens:
        connected.append({
            "provider": "strava",
            "connected": True,
            "athleteName": display_name,
        })

    if 'google_fit' in user_tokens:
        connected.append({
            "provider": "google_fit",
            "connected": True,
            "athleteName": display_name,
        })

    return jsonify({
        "status": "success",
        "email": email,
        "connectedAccounts": connected,
        "hasWorkouts": len(connected) > 0,
    })


@app.route('/api/disconnect', methods=['POST'])
def disconnect():
    """
    Disconnect a provider (strava / google_fit) for a user so they can
    re-connect a different account.
    """
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    provider = data.get('provider', '')  # 'strava', 'google_fit', or 'all'

    if not email or '@' not in email:
        return jsonify({"error": "Valid email required"}), 400

    tokens = load_tokens()
    if email not in tokens:
        return jsonify({"status": "success", "message": "Nothing to disconnect"})

    if provider == 'all':
        tokens.pop(email, None)
    elif provider in ('strava', 'google_fit'):
        tokens.get(email, {}).pop(provider, None)
    else:
        return jsonify({"error": "provider must be 'strava', 'google_fit', or 'all'"}), 400

    save_tokens(tokens)
    print(f"[Disconnect] {provider} removed for {email}")
    return jsonify({"status": "success", "message": f"{provider} disconnected for {email}"})


@app.route('/api/exchange-code', methods=['POST'])
def exchange_code():
    """
    Mobile app sends auth code here after on-device OAuth.
    Backend exchanges it for tokens and stores them.
    """
    data = request.get_json()
    email = data.get('email')
    provider = data.get('provider')  # 'strava' or 'google_fit'
    code = data.get('code')
    redirect_uri = data.get('redirect_uri', '')

    if not email or not provider or not code:
        return jsonify({"error": "Missing email, provider, or code"}), 400

    if provider == 'strava':
        response = requests.post('https://www.strava.com/oauth/token', json={
            'client_id': STRAVA_CLIENT_ID,
            'client_secret': STRAVA_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code'
        })
        if response.status_code != 200:
            print(f"[exchange-code] Strava token exchange failed: {response.text}")
            return jsonify({"error": "Strava token exchange failed", "details": response.text}), 500
        token_data = response.json()
        save_user_token(email, 'strava', token_data)
        return jsonify({"status": "success", "provider": "strava", "athlete": token_data.get('athlete', {}).get('firstname', '')})

    elif provider == 'google_fit':
        response = requests.post('https://oauth2.googleapis.com/token', data={
            'client_id': GOOGLE_FIT_CLIENT_ID,
            'client_secret': GOOGLE_FIT_CLIENT_SECRET,
            'code': code,
            'grant_type': 'authorization_code',
            'redirect_uri': redirect_uri
        })
        if response.status_code != 200:
            print(f"[exchange-code] Google token exchange failed: {response.text}")
            return jsonify({"error": "Google token exchange failed", "details": response.text}), 500
        token_data = response.json()
        token_data['expires_at'] = time.time() + token_data.get('expires_in', 3600)
        save_user_token(email, 'google_fit', token_data)
        return jsonify({"status": "success", "provider": "google_fit"})

    return jsonify({"error": f"Unknown provider: {provider}"}), 400


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


# ============ AI MEAL RECOMMENDATION (Gemini) ============

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
# Models tried in order — if one is overloaded (503), fall back to the next
GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest",
    "gemini-2.0-flash-lite",
]
GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def _call_gemini(payload: dict):
    """
    Call Gemini with retry + multi-model fallback.
    Returns (raw_text, None) on success or (None, error_message) on failure.
    Handles 503 (overloaded) and 429 (rate limit) by retrying / switching models.
    """
    last_error = "Unknown error"
    for model in GEMINI_MODELS:
        url = f"{GEMINI_BASE}/{model}:generateContent?key={GEMINI_API_KEY}"
        for attempt in range(2):  # 2 attempts per model
            try:
                resp = requests.post(
                    url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=60
                )

                if resp.status_code == 200:
                    result = resp.json()
                    raw_text = (result.get('candidates', [{}])[0]
                                .get('content', {})
                                .get('parts', [{}])[0]
                                .get('text', ''))
                    if raw_text:
                        print(f"[Gemini] Success with {model}")
                        return raw_text, None
                    last_error = "Empty response from model"
                    break  # empty -> try next model

                # Transient errors: 503 overloaded, 429 rate limit, 500 internal
                if resp.status_code in (503, 429, 500):
                    last_error = f"{model}: {resp.status_code}"
                    print(f"[Gemini] {model} returned {resp.status_code} (attempt {attempt+1}), retrying...")
                    time.sleep(1.5 * (attempt + 1))  # backoff
                    continue
                else:
                    # Non-transient (e.g. 400) -> log and try next model
                    last_error = f"{model}: {resp.status_code} - {resp.text[:120]}"
                    print(f"[Gemini] {last_error}")
                    break

            except requests.exceptions.Timeout:
                last_error = f"{model}: timeout"
                print(f"[Gemini] {model} timed out (attempt {attempt+1})")
                continue
            except Exception as e:
                last_error = f"{model}: {str(e)[:120]}"
                print(f"[Gemini] {last_error}")
                break

    return None, last_error


# Keywords used to infer whether a meal is non-vegetarian (fallback if the
# model forgets to tag a meal's "diet" field).
NONVEG_KEYWORDS = [
    'chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'cod', 'tuna',
    'shrimp', 'prawn', 'bacon', 'steak', 'lamb', 'meat', 'sardine', 'anchovy',
    'crab', 'lobster', 'ham', 'sausage', 'mackerel', 'tilapia', 'trout',
    'duck', 'venison', 'oyster', 'mussel', 'clam', 'squid', 'octopus',
]


def _infer_diet(meal: dict) -> str:
    """Infer 'VEG' or 'NONVEG' from a meal's name + ingredients."""
    text = (str(meal.get('ingredients', '')) + ' ' + str(meal.get('name', ''))).lower()
    for kw in NONVEG_KEYWORDS:
        if kw in text:
            return 'NONVEG'
    return 'VEG'


@app.route('/api/ai-meal', methods=['POST'])
def ai_meal_recommendation():
    """
    Generate AI meal recommendation based on user's real workout data.
    Uses Gemini API to analyze workouts and suggest personalized meals.
    """
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    category = data.get('category', 'BULK')  # BULK, SHRED, CUT, ENDURANCE
    diet = data.get('diet', 'BOTH').upper()  # VEG, NONVEG, BOTH

    if not email:
        return jsonify({"error": "Email required"}), 400

    if not GEMINI_API_KEY:
        return jsonify({"error": "GEMINI_API_KEY not configured on server"}), 500

    # Fetch real workouts for this user
    user_tokens = get_user_tokens(email)
    all_workouts = []

    if 'strava' in user_tokens:
        all_workouts.extend(fetch_strava_workouts(user_tokens['strava'], email, 10))
    if 'google_fit' in user_tokens:
        all_workouts.extend(fetch_google_fit_workouts(user_tokens['google_fit'], email, 10))

    all_workouts.sort(key=lambda w: w.get('startDate', ''), reverse=True)

    if not all_workouts:
        return jsonify({"error": "No workouts found. Connect Strava or Google Fit first."}), 404

    # Format workouts for AI prompt
    workouts_text = "\n".join([
        f"- {w.get('source','').upper()}: {w.get('name','Workout')} ({w.get('type','Exercise')}) "
        f"for {(w.get('duration',0)//60)} mins, "
        f"{'burning ' + str(w.get('calories')) + ' kcal, ' if w.get('calories') else ''}"
        f"{'distance ' + str(round(w.get('distance',0)/1000, 1)) + ' km, ' if w.get('distance') else ''}"
        f"{'avg HR ' + str(int(w.get('avgHeartRate',0))) + ' bpm' if w.get('avgHeartRate') else ''}"
        for w in all_workouts[:8]
    ])

    total_calories = sum(w.get('calories', 0) or 0 for w in all_workouts[:8])
    total_duration = sum((w.get('duration', 0) or 0) // 60 for w in all_workouts[:8])

    # Build the dietary requirement based on the user's choice
    if diet == 'VEG':
        diet_instruction = (
            "ALL three meals MUST be strictly VEGETARIAN — no meat, poultry, fish, or seafood. "
            "Eggs and dairy ARE allowed. Set \"diet\": \"VEG\" on every meal."
        )
    elif diet == 'NONVEG':
        diet_instruction = (
            "ALL three meals MUST be NON-VEGETARIAN — each should feature a quality animal protein "
            "(chicken, beef, fish, etc). Set \"diet\": \"NONVEG\" on every meal."
        )
    else:  # BOTH
        diet_instruction = (
            "Provide a MIX of diets: at least ONE strictly VEGETARIAN option (no meat/poultry/fish/seafood; "
            "eggs and dairy allowed) AND at least ONE NON-VEGETARIAN option. Accurately set each meal's "
            "\"diet\" field to either \"VEG\" or \"NONVEG\" based on its ingredients."
        )

    system_prompt = (
        "You are HOG-U's elite AI sports nutritionist. Analyze user's Google Fit and Strava "
        "activities and return THREE distinct, customized, detailed athletic high-protein meal "
        "options in STRICT JSON. Each option must be genuinely different (different proteins, "
        "meal types, and flavor profiles) so the user has real variety to choose from."
    )

    user_prompt = f"""The user has synced the following recent biometric activities:
{workouts_text}

Summary: {len(all_workouts)} total sessions, ~{total_calories} kcal burned, ~{total_duration} mins total training.
Goal category: {category}

DIETARY REQUIREMENT: {diet_instruction}

Please design THREE highly functional, delicious, DISTINCT meal options that precisely replenish their energy deficit, aid muscle recovery, and match their activity profile. Vary the protein source, meal type, and cuisine across the three so they feel like real alternatives — not minor variations.

Respond ONLY with a valid, clean JSON object containing EXACTLY one key "meals" whose value is an array of EXACTLY 3 meal objects. Each meal object must contain EXACTLY these keys:
{{
  "meals": [
    {{
      "name": "AN UPPERCASE HIGH-ENERGY MEAL NAME",
      "category": "{category}",
      "diet": "VEG or NONVEG",
      "type": "Breakfast or Lunch or Pre-workout or Post-workout",
      "calories": 750,
      "proteinGrams": 55,
      "carbsGrams": 80,
      "fatsGrams": 18,
      "description": "1 to 2 powerful sentences explaining specifically why this meal was designed for their logged workouts.",
      "ingredients": "• Component 1\\n• Component 2\\n• Component 3\\n• Component 4",
      "instructions": "1. Step one\\n2. Step two\\n3. Step three"
    }}
  ]
}}"""

    # Call Gemini API with retry + fallback models
    try:
        gemini_payload = {
            "contents": [{"parts": [{"text": user_prompt}]}],
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "generationConfig": {
                "temperature": 0.7,
                "thinkingConfig": {"thinkingBudget": 0}
            }
        }

        raw_text, err = _call_gemini(gemini_payload)

        if raw_text is None:
            print(f"All Gemini models failed: {err}")
            return jsonify({"error": f"AI service temporarily unavailable ({err}). Please try again."}), 503

        # Clean JSON from markdown code blocks
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        meal_data = json.loads(cleaned)

        # Gemini returns {"meals": [...]} — normalize to a list of meals.
        if isinstance(meal_data, dict) and 'meals' in meal_data:
            meals = meal_data['meals']
        elif isinstance(meal_data, list):
            meals = meal_data
        else:
            # Backward-compat: a single meal object was returned
            meals = [meal_data]

        # Ensure category + diet are set correctly on every meal
        for m in meals:
            m.setdefault('category', category)
            d = str(m.get('diet', '')).upper().replace('-', '').replace(' ', '')
            if d in ('NONVEG', 'NONVEGETARIAN', 'NV'):
                d = 'NONVEG'
            elif d in ('VEG', 'VEGETARIAN', 'V'):
                d = 'VEG'
            else:
                d = _infer_diet(m)  # fallback: infer from ingredients
            m['diet'] = d

        return jsonify({
            "meals": meals,
            "workoutsAnalyzed": len(all_workouts),
            "totalCaloriesBurned": total_calories,
        })

    except json.JSONDecodeError as e:
        print(f"Gemini JSON parse error: {e}")
        print(f"Raw text: {raw_text[:300]}")
        return jsonify({"error": "AI returned invalid JSON", "raw": raw_text[:200]}), 502
    except Exception as e:
        print(f"Gemini request error: {e}")
        return jsonify({"error": str(e)}), 500


# ============ MAIN ============

if __name__ == '__main__':
    import sys
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    
    print("\n🚀 HOG-U Multi-Source Fitness Backend")
    print("=" * 50)
    print(f"🌐 SERVER_BASE: {SERVER_BASE}")
    print(f"   Strava redirect_uri: {STRAVA_REDIRECT_URI}")
    print(f"   Google redirect_uri: {GOOGLE_REDIRECT_URI}")
    if not PUBLIC_URL:
        print("   ⚠️  PUBLIC_URL not set — using LAN IP (same-WiFi only).")
        print("      Set PUBLIC_URL=https://<your>.ngrok-free.app for any phone/network.")
    print("=" * 50)
    print("📡 Endpoints:")
    print("   GET  /api/workouts?email=...      - Unified workouts")
    print("   GET  /api/health-metrics?email=... - Health data")
    print("   GET  /api/accounts?email=...       - Connected accounts")
    print("   POST /api/ai-meal                  - AI meal recommendation")
    print("   GET  /auth/strava/callback         - Strava OAuth callback")
    print("   GET  /auth/google/callback         - Google Fit OAuth callback")
    print("   POST /api/seed-strava              - Seed existing Strava token")
    print("=" * 50)
    print("\n⚡ To connect your existing Strava token:")
    print('   curl -X POST http://localhost:5000/api/seed-strava -H "Content-Type: application/json" -d \'{"email":"your@email.com"}\'')
    print("\n🔗 Samsung Health: Users must enable Samsung Health → Google Fit sync")
    print("   (Samsung Health app > Settings > Connected Services > Google Fit)")
    print()
    
    app.run(debug=False, host='0.0.0.0', port=port)
