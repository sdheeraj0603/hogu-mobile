#!/usr/bin/env python3
"""
Simple token refresher for Strava
"""

import json
import requests
from datetime import datetime

CLIENT_ID = "233623"
CLIENT_SECRET = "73515b47713192ae55aea6e42f54c284a6305f24"

print("🔄 Strava Token Refresher")
print("=" * 60)

# Load current token
try:
    with open('strava_token.json', 'r') as f:
        token_data = json.load(f)
    print("✓ Token file found")
except:
    print("❌ Token file not found")
    exit(1)

# Check expiration
expires_at = token_data.get('expires_at', 0)
current_time = datetime.now().timestamp()

print(f"Expires at: {datetime.fromtimestamp(expires_at)}")
print(f"Current time: {datetime.fromtimestamp(current_time)}")

if expires_at > current_time:
    print(f"✓ Token is still valid (expires in {int((expires_at - current_time) / 60)} minutes)")
else:
    print(f"❌ Token expired (by {int((current_time - expires_at) / 60)} minutes)")
    print("\n🔄 Refreshing token...")
    
    url = "https://www.strava.com/oauth/token"
    payload = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type": "refresh_token",
        "refresh_token": token_data.get('refresh_token')
    }
    
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            new_token_data = response.json()
            
            # Save new token
            with open('strava_token.json', 'w') as f:
                json.dump(new_token_data, f, indent=2)
            
            print("✅ Token refreshed successfully!")
            print(f"   New expires at: {datetime.fromtimestamp(new_token_data['expires_at'])}")
            
            # Test it
            print("\n🧪 Testing new token...")
            athlete_url = "https://www.strava.com/api/v3/athlete"
            headers = {"Authorization": f"Bearer {new_token_data['access_token']}"}
            
            test_response = requests.get(athlete_url, headers=headers)
            if test_response.status_code == 200:
                athlete = test_response.json()
                print(f"✅ Token works! Authenticated as: {athlete['firstname']} {athlete['lastname']}")
            else:
                print(f"❌ Token test failed: {test_response.status_code}")
        else:
            print(f"❌ Refresh failed: {response.status_code}")
            print(f"   Error: {response.json()}")
    except Exception as e:
        print(f"❌ Error: {e}")

print("=" * 60)
