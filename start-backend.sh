#!/bin/bash
# ─────────────────────────────────────────────────────────────
# Starts the HOG-U Flask backend.
# Reads PUBLIC_URL from .env (dotenv) so OAuth redirects point at
# your ngrok/cloud URL instead of the LAN IP.
# ─────────────────────────────────────────────────────────────
set -e
cd "$(dirname "$0")"
source .venv/bin/activate
exec python3 hogu_backend.py
