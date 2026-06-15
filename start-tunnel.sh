#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Starts the ngrok tunnel that exposes the HOG-U backend (:5000)
# to the public internet so ANY phone on ANY network can reach it.
#
# Requires (one-time):
#   1. ./tools/ngrok config add-authtoken <YOUR_TOKEN>
#   2. NGROK_DOMAIN=<your-name>.ngrok-free.app   in  .env   (recommended)
# ─────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")"

# Load NGROK_DOMAIN from .env if present
if [ -f .env ]; then
  NGROK_DOMAIN=$(grep -E '^NGROK_DOMAIN=' .env | cut -d= -f2- | tr -d '"' | xargs)
fi

if [ -z "$NGROK_DOMAIN" ]; then
  echo "▶ Starting ngrok with a RANDOM URL."
  echo "  (Reserve a free static domain at https://dashboard.ngrok.com/domains"
  echo "   and add NGROK_DOMAIN=... to .env so the URL never changes.)"
  exec ./tools/ngrok http 5000
else
  echo "▶ Starting ngrok on stable domain: https://$NGROK_DOMAIN  ->  localhost:5000"
  exec ./tools/ngrok http --domain="$NGROK_DOMAIN" 5000
fi
