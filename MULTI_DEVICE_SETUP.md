# 🌍 HOG-U — Multi-Device / Any-Network Setup (ngrok)

This makes the app + backend reachable from **any phone on any network** — no more
LAN IPs, no "I/O error" scanning the QR, and Strava/Google OAuth that doesn't break
when your Mac's IP changes.

## What changed in the code

| Piece | Before | After |
|---|---|---|
| App backend URL | hardcoded `192.168.1.x` in 4 files | one `config.ts`, driven by `EXPO_PUBLIC_API_BASE` |
| Backend OAuth redirects | LAN IP / `localhost` | driven by `PUBLIC_URL` env var |
| Metro/QR delivery | LAN only | `expo start --tunnel` (works anywhere) |

You now have 3 helper scripts in the project root:

- `./start-backend.sh` → runs Flask (loads `.env`)
- `./start-tunnel.sh` → runs ngrok → public HTTPS URL for the backend
- `./start-app.sh` → runs Expo in **tunnel** mode, pointing the app at your public backend

---

## One-time setup (≈5 min)

### 1. Create a free ngrok account + add your authtoken
1. Sign up: https://dashboard.ngrok.com/signup
2. Copy your authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
3. Register it (run from the project root):
   ```bash
   ./tools/ngrok config add-authtoken <YOUR_AUTHTOKEN>
   ```

### 2. Reserve a free static domain (so the URL never changes)
1. Go to https://dashboard.ngrok.com/domains
2. Click **+ New Domain** — you get one free, e.g. `hogu-dheeraj.ngrok-free.app`
3. Copy that domain.

### 3. Add two lines to your `.env`
Append these (replace with YOUR domain):
```bash
PUBLIC_URL=https://hogu-dheeraj.ngrok-free.app
NGROK_DOMAIN=hogu-dheeraj.ngrok-free.app
```
- `PUBLIC_URL` → backend uses it for OAuth redirects **and** the app uses it as its API base.
- `NGROK_DOMAIN` → makes `start-tunnel.sh` always bind the same URL.

### 4. Register the callback URLs (one time, never again)
**Strava** → https://www.strava.com/settings/api
- *Authorization Callback Domain* = `hogu-dheeraj.ngrok-free.app`  (bare domain, no https://, no path)

**Google** → https://console.cloud.google.com/apis/credentials
- Edit your OAuth 2.0 Client → **Authorized redirect URIs** → Add:
  `https://hogu-dheeraj.ngrok-free.app/auth/google/callback`

---

## Daily run (3 terminals)

```bash
# Terminal 1 — public tunnel to the backend
./start-tunnel.sh

# Terminal 2 — the backend itself
./start-backend.sh        # banner should show SERVER_BASE = your https ngrok URL

# Terminal 3 — the app (tunnelled QR works on every phone)
./start-app.sh            # scan the QR with Expo Go on ANY phone / ANY network
```

That's it. Any phone that scans the QR loads the app, and Connect Strava / Google Fit
work because the redirect goes to your stable `https://…ngrok-free.app` URL.

---

## How it routes

```
 Phone (any network)
   │  Expo Go ── tunnel ──►  Metro bundler (your Mac)        [start-app.sh --tunnel]
   │  App API  ───────────►  https://xxx.ngrok-free.app ──►  Flask :5000   [start-tunnel.sh]
   │  OAuth    ───────────►  Strava / Google ──redirect──►   https://xxx.ngrok-free.app/...
```

---

## Notes & gotchas
- **Free ngrok shows an interstitial page** the first time a browser hits the URL. For
  OAuth this is fine (it only affects manual browser visits, not the API).
- **Keep all 3 running.** If you restart ngrok without a reserved `NGROK_DOMAIN`, the URL
  changes and you'd have to update `.env` + re-register callbacks — that's exactly why we
  reserve the static domain in step 2.
- **Production later:** deploy Flask to Render/Railway/Fly, set `PUBLIC_URL` to that domain,
  and run `eas build` for a real installable app. The code already supports it — just a
  different `PUBLIC_URL`.
- **`tools/ngrok` is git-ignored?** Add `tools/` to `.gitignore` if you don't want the
  binary committed.
