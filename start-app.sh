#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Starts the Expo app in TUNNEL mode so the QR code works on
# ANY phone / ANY network (bypasses corporate WiFi isolation).
#
# It injects EXPO_PUBLIC_API_BASE from the root .env's PUBLIC_URL
# so the app talks to your public backend (ngrok/cloud), not the LAN.
# ─────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")"

# Pull PUBLIC_URL from root .env -> becomes the app's backend URL
if [ -f .env ]; then
  export EXPO_PUBLIC_API_BASE=$(grep -E '^PUBLIC_URL=' .env | cut -d= -f2- | tr -d '"' | xargs)
fi

if [ -z "$EXPO_PUBLIC_API_BASE" ]; then
  echo "⚠️  PUBLIC_URL not set in .env — app will try to auto-detect the LAN IP"
  echo "    (works only for a phone on the SAME WiFi as this Mac)."
else
  echo "▶ App backend (EXPO_PUBLIC_API_BASE): $EXPO_PUBLIC_API_BASE"
fi

cd hogu-mobile
exec node ./node_modules/expo/bin/cli start --tunnel --clear
