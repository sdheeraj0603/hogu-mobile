#!/usr/bin/env python3
"""
Diagnostic script to test Strava API credentials
"""

import requests
import json

# Your credentials
CLIENT_ID = "233623"
CLIENT_SECRET = "73515b47713192ae55aea6e42f54c284a6305f24"
REDIRECT_URI = "http://localhost:8000/callback"

print("=" * 60)
print("🔍 STRAVA API CREDENTIAL DIAGNOSTIC")
print("=" * 60)

print("\n1️⃣  Testing OAuth Authorization URL Generation...")
print("-" * 60)

import urllib.parse
params = {
    "client_id": CLIENT_ID,
    "response_type": "code",
    "redirect_uri": REDIRECT_URI,
    "approval_prompt": "force",
    "scope": "activity:read_all"
}

auth_url = "https://www.strava.com/oauth/authorize?" + urllib.parse.urlencode(params)
print(f"✓ Auth URL created successfully")
print(f"  Client ID being used: {CLIENT_ID}")
print(f"  Client Secret being used: {CLIENT_SECRET[:10]}...{CLIENT_SECRET[-10:]}")
print(f"\n📋 Full URL:\n{auth_url}\n")

print("2️⃣  Instructions:")
print("-" * 60)
print("1. Copy the URL above and paste in your browser")
print("2. Click 'Authorize' on Strava")
print("3. You'll be redirected to http://localhost:8000/callback?code=XXXXX")
print("4. Copy the CODE value (after 'code=' and before '&')")
print("5. Run this script again and paste the code when prompted")
print("\n")

code = input("Paste the authorization code here (or press Enter to skip): ").strip()

if code:
    print("\n3️⃣  Testing Token Exchange...")
    print("-" * 60)
    
    token_url = "https://www.strava.com/oauth/token"
    payload = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code"
    }
    
    try:
        print(f"Sending POST to: {token_url}")
        print(f"Payload: {json.dumps({**payload, 'client_secret': '***'}, indent=2)}")
        
        response = requests.post(token_url, json=payload)
        
        print(f"\n📤 Response Status: {response.status_code}")
        print(f"📥 Response:\n{json.dumps(response.json(), indent=2)}\n")
        
        if response.status_code == 200:
            print("✅ TOKEN EXCHANGE SUCCESSFUL!")
            token_data = response.json()
            
            # Save the token
            with open('strava_token.json', 'w') as f:
                json.dump(token_data, f, indent=2)
            print("✓ Token saved to strava_token.json")
            
            # Test the token by fetching athlete info
            print("\n4️⃣  Testing Token with Athlete Data...")
            print("-" * 60)
            
            athlete_url = "https://www.strava.com/api/v3/athlete"
            headers = {"Authorization": f"Bearer {token_data['access_token']}"}
            
            athlete_response = requests.get(athlete_url, headers=headers)
            print(f"Athlete Info Status: {athlete_response.status_code}")
            
            if athlete_response.status_code == 200:
                athlete_data = athlete_response.json()
                print(f"✅ Successfully authenticated as: {athlete_data.get('firstname')} {athlete_data.get('lastname')}")
                print(f"   Athlete ID: {athlete_data.get('id')}")
            else:
                print(f"❌ Failed to fetch athlete data: {athlete_response.text}")
        else:
            print(f"❌ TOKEN EXCHANGE FAILED!")
            print(f"Error: {response.json()}")
    
    except Exception as e:
        print(f"❌ Error during token exchange: {e}")
else:
    print("⏭️  Skipped code submission")

print("\n" + "=" * 60)
print("🔍 DIAGNOSTIC COMPLETE")
print("=" * 60)
