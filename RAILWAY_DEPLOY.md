# Deploying the HOG-U backend to Railway

This turns the fragile **phone → ngrok → relay-laptop → Mac** chain into a single
always-on cloud service. Once deployed, no laptop or Mac needs to stay awake, and
Zscaler is irrelevant — every phone hits Railway's public HTTPS URL directly.

```
Before:  📱 → ngrok cloud → 💻 relay laptop → WiFi → 🖥️ Mac:5000     (both must stay on)
After:   📱 → https://<your-app>.up.railway.app   (Railway, always on)
```

---

## What already got wired up in the code

These are committed already — you don't have to touch them:

| File | Purpose |
|------|---------|
| `Procfile` | Start command: `gunicorn hogu_backend:app` (production WSGI server) |
| `railway.json` | Builder = Nixpacks, health check = `/health`, auto-restart on failure |
| `requirements.txt` | Pinned deps incl. `gunicorn` + `Werkzeug` (matches your local versions) |
| `.python-version` | Pins Python **3.11** for the build |
| `hogu_backend.py` | • reads `$PORT` from Railway  • `TOKEN_FILE` env var → persistent volume  • auto-derives `PUBLIC_URL` from `RAILWAY_PUBLIC_DOMAIN`  • new `/` + `/health` route |

**Key idea:** the app auto-detects its own Railway domain (`RAILWAY_PUBLIC_DOMAIN`)
and uses it as the OAuth redirect base — so you don't even have to set `PUBLIC_URL`.
You *do* still have to register that domain with Strava & Google (Steps 5–6).

---

## Step 0 — Prereqs

- Code is committed & pushed (it is — `github.com/sdheeraj0603/hogu-mobile`, branch `main`).
- Have your local `.env` open — you'll copy the secret values from it into Railway.
- A Railway account: https://railway.com (sign in with GitHub).

---

## Step 1 — Create the project from GitHub

1. Railway dashboard → **New Project** → **Deploy from GitHub repo**.
2. Pick **`sdheeraj0603/hogu-mobile`**.
3. Railway detects Python (via `requirements.txt`) and starts the first build.
   - It reads `railway.json` → uses the `gunicorn` start command automatically.
   - ⏱️ First build ≈ 1–3 min. It'll go live but **fail health checks until Step 2+4** — that's expected.

> The repo root has both the Flask backend *and* the Expo app. Railway only builds
> the Python backend because there's no root `package.json` and our start command
> explicitly targets `hogu_backend:app`. Nothing else in the repo gets run.

---

## Step 2 — Set environment variables

Project → your service → **Variables** tab → add each of these (copy the **values**
from your local `.env`):

| Variable | Where to get it |
|----------|-----------------|
| `STRAVA_CLIENT_ID` | from local `.env` |
| `STRAVA_CLIENT_SECRET` | from local `.env` |
| `GOOGLE_FIT_CLIENT_ID` | from local `.env` |
| `GOOGLE_FIT_CLIENT_SECRET` | from local `.env` |
| `GEMINI_API_KEY` | from local `.env` |
| `TOKEN_FILE` | set to **`/data/user_tokens.json`** (points at the volume in Step 3) |

You **don't** need `PUBLIC_URL` — the app derives it from Railway's domain. (If you
later add a custom domain, set `PUBLIC_URL=https://your.domain` to override.)

Railway redeploys automatically each time you save variables.

---

## Step 3 — Add a persistent volume (so logins survive redeploys)

The container filesystem is **ephemeral** — every redeploy wipes it. `user_tokens.json`
holds every user's linked Strava/Google accounts, so it must live on a volume.

1. Service → **Settings** → **Volumes** → **New Volume**.
2. Mount path: **`/data`**
3. Save. (This is why `TOKEN_FILE=/data/user_tokens.json` in Step 2.)

Now token data persists across deploys, restarts, and crashes.

---

## Step 4 — Generate the public domain

1. Service → **Settings** → **Networking** → **Generate Domain**.
2. Railway gives you something like **`hogu-mobile-production.up.railway.app`**.
3. Copy it — you'll register it with Strava & Google next, and point the app at it.

Verify it's alive — open in a browser:

```
https://<your-app>.up.railway.app/health
```

You should see JSON like:
```json
{ "status": "ok", "service": "hogu-backend", "publicUrl": "https://<your-app>.up.railway.app", ... }
```
Confirm `publicUrl` shows the **https Railway domain** (not a `192.168.x` LAN IP).

---

## Step 5 — Update Strava OAuth (one time)

https://www.strava.com/settings/api → your app →

- **Authorization Callback Domain** = `<your-app>.up.railway.app`
  *(domain only — no `https://`, no path)*

Save.

---

## Step 6 — Update Google OAuth (one time)

https://console.cloud.google.com → **APIs & Services** → **Credentials** → your
OAuth 2.0 Client →

- **Authorized redirect URIs** → add:
  `https://<your-app>.up.railway.app/auth/google/callback`

Save. (You can leave the old ngrok URI too; multiple are allowed.)

---

## Step 7 — Point the mobile app at Railway

Edit **`hogu-mobile/.env`** — change the one line:

```diff
- EXPO_PUBLIC_API_BASE=https://promenade-shifty-demanding.ngrok-free.dev
+ EXPO_PUBLIC_API_BASE=https://<your-app>.up.railway.app
```

Then restart Metro so the env var is picked up:

```bash
npm --prefix /Users/sdheeraj/VS-new/hogu-mobile start -- --clear
```

The app's `config.ts` reads `EXPO_PUBLIC_API_BASE` first, so every screen now talks
to Railway. (The `ngrok-skip-browser-warning` header it always sends is harmless.)

---

## Step 8 — Verify end-to-end

1. `GET /health` → `status: ok` ✅ (Step 4)
2. In the app: **log in** with an email → should hit `/api/login` on Railway.
3. **Connect Strava** → browser opens Strava → authorize → auto-closes back to app.
4. **Connect Google Fit** → account chooser → authorize → auto-closes back to app.
5. Workouts + AI meal load.

Watch it live: Railway service → **Deployments** → **View Logs** (you'll see the
gunicorn access logs and any `[strava callback] linked …` / `[Gemini] Success` lines).

---

## Migrating your existing 4 test accounts (optional)

Your current `user_tokens.json` (dheeraj / test / icy.fawks / isiri) lives only on
the Mac. Fastest ways to carry it over:

- **Easiest:** just re-connect each account once through the deployed app (Step 8).
- **Copy the file:** use Railway's volume — `railway run` / the service shell to
  write `/data/user_tokens.json`, or add a tiny one-off admin endpoint. Re-connecting
  is usually simpler for 4 accounts.

> Note: `dheerajsmurthy@gmail.com` currently only has `google_fit` — Strava still
> needs a re-connect regardless.

---

## Cost & ops notes

- **Cost:** Railway's usage-based plan (~$5/mo credit on the trial). This tiny Flask
  service + a small volume is well within a few dollars/month.
- **Redeploys:** every `git push` to `main` auto-builds & deploys. Env vars + the
  `/data` volume persist across deploys.
- **Scaling caveat:** tokens are a JSON file on one volume. Fine for one instance /
  a handful of testers. If you ever scale to multiple instances or make this a real
  product, migrate `user_tokens.json` → SQLite-on-volume or a managed DB (Postgres
  via Railway plugin) so state isn't tied to a single volume.
- **Timeout:** gunicorn `--timeout 120` covers the AI-meal Gemini retries (up to ~60s).

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Health check fails / deploy "crashed" | Check **Logs**. Usually a missing env var (Step 2) — the app boots but Strava/Google calls 500 until secrets are set. |
| `publicUrl` shows `192.168.x` in `/health` | `RAILWAY_PUBLIC_DOMAIN` not present — make sure you **Generated a Domain** (Step 4), then redeploy. |
| Logins disappear after a deploy | Volume not mounted at `/data` **or** `TOKEN_FILE` not set to `/data/user_tokens.json` (Steps 2–3). |
| Strava "redirect_uri mismatch" | Callback **Domain** must be the bare host, no `https://`, no path (Step 5). |
| Google "redirect_uri_mismatch" | Must be the full `https://…/auth/google/callback` (Step 6), exact match. |
| Build didn't pick Python | Ensure `requirements.txt` is at repo root (it is). Railway → redeploy. |
