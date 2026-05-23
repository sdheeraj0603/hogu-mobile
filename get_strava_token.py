#!/usr/bin/env python3
"""
Simple Strava Token Generator - paste your authorization code here
"""

import requests
import json

CLIENT_ID = "233623"
CLIENT_SECRET = "73515b47713192ae55aea6e42f54c284a6305f24"

print("\n" + "="*60)
print("🔐 STRAVA TOKEN GENERATOR")
print("="*60)

print("\n📋 To get your authorization code:")
print("1. Visit: https://www.strava.com/oauth/authorize?client_id=233623&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fcallback&approval_prompt=force&scope=activity%3Aread_all")
print("2. Click 'Authorize'")
print("3. Copy the CODE from the redirect URL (after 'code=' and before '&scope')")
print("4. Paste it below\n")

auth_code = input("🔑 Paste your authorization code: ").strip()

if not auth_code:
    print("❌ No code provided")
    exit(1)

print(f"\n✓ Code received: {auth_code[:20]}...")
print("\n📤 Exchanging code for token...")

token_url = "https://www.strava.com/oauth/token"
payload = {
    "client_id": CLIENT_ID,
    "client_secret": CLIENT_SECRET,
    "code": auth_code,
    "grant_type": "authorization_code"
}

try:
    response = requests.post(token_url, json=payload)
    
    if response.status_code == 200:
        token_data = response.json()
        
        # Save token
        with open('strava_token.json', 'w') as f:
            json.dump(token_data, f, indent=2)
        
        print("✅ SUCCESS! Token saved to strava_token.json")
        print(f"\n📊 Token Details:")
        print(f"   Access Token: {token_data['access_token'][:20]}...")
        print(f"   Expires In: {token_data['expires_in']} seconds")
        print(f"   Refresh Token: {token_data.get('refresh_token', 'N/A')[:20]}...")
        
        # Test the token
        print("\n🧪 Testing token...")
        athlete_url = "https://www.strava.com/api/v3/athlete"
        headers = {"Authorization": f"Bearer {token_data['access_token']}"}
        
        athlete_response = requests.get(athlete_url, headers=headers)
        
        if athlete_response.status_code == 200:
            athlete = athlete_response.json()
            print(f"✅ Authenticated as: {athlete['firstname']} {athlete['lastname']}")
            print(f"   Athlete ID: {athlete['id']}")
            print(f"\n🎉 You're ready to use HOG-U!")
            print(f"   Run: python3 hogu_strava_integration.py")
        else:
            print(f"⚠️  Token works but couldn't fetch athlete data")
    else:
        print(f"❌ Token exchange failed")
        print(f"   Status: {response.status_code}")
        print(f"   Error: {response.json()}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "="*60)
