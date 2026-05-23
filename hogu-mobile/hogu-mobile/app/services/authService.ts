/**
 * Unified Auth Service
 * Handles OAuth flows for Strava & Google Fit
 * Stores tokens per-user via SecureStore
 */

import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SecureStore from 'expo-secure-store';

// Ensure web browser auth sessions complete properly
WebBrowser.maybeCompleteAuthSession();

// ── Strava Config ──
const STRAVA_CLIENT_ID = '233623';
const STRAVA_CLIENT_SECRET = '73515b47713192ae55aea6e42f54c284a6305f24';
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

// ── Google Fit Config (OAuth handled server-side, these are unused on device) ──
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_SECRET || '';
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.body.read',
  'https://www.googleapis.com/auth/fitness.location.read',
].join(' ');

// Storage keys
const STRAVA_TOKEN_KEY = 'hogu.strava_tokens';
const GOOGLE_TOKEN_KEY = 'hogu.google_tokens';

export interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete_name?: string;
  email?: string;
}

// ══════════════════════════════════════
//  TOKEN STORAGE
// ══════════════════════════════════════

export async function getStoredStravaTokens(): Promise<TokenData | null> {
  try {
    const data = await SecureStore.getItemAsync(STRAVA_TOKEN_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export async function getStoredGoogleTokens(): Promise<TokenData | null> {
  try {
    const data = await SecureStore.getItemAsync(GOOGLE_TOKEN_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

async function saveStravaTokens(tokens: TokenData): Promise<void> {
  await SecureStore.setItemAsync(STRAVA_TOKEN_KEY, JSON.stringify(tokens));
}

async function saveGoogleTokens(tokens: TokenData): Promise<void> {
  await SecureStore.setItemAsync(GOOGLE_TOKEN_KEY, JSON.stringify(tokens));
}

export async function disconnectStrava(): Promise<void> {
  await SecureStore.deleteItemAsync(STRAVA_TOKEN_KEY);
  console.log('[Auth] ✅ Strava disconnected');
}

export async function disconnectGoogle(): Promise<void> {
  await SecureStore.deleteItemAsync(GOOGLE_TOKEN_KEY);
  console.log('[Auth] ✅ Google Fit disconnected');
}

// ══════════════════════════════════════
//  STRAVA OAUTH
// ══════════════════════════════════════

export async function connectStrava(): Promise<TokenData> {
  // In dev mode, seed tokens directly (redirect URI not registered)
  // TODO: Replace with real OAuth once redirect URI is registered in Strava settings
  console.log('[Auth] Using dev Strava tokens');
  const devTokens: TokenData = {
    access_token: '91caf151202bff7e189224493821a955a5e6263f',
    refresh_token: 'd8e6926f6766ed69e2573ce543f51e337458ecea',
    expires_at: 1779501460,
    athlete_name: 'Dheeraj',
  };
  await saveStravaTokens(devTokens);
  console.log('[Auth] ✅ Strava connected (dev mode)');
  return devTokens;

  /* REAL OAUTH - uncomment when redirect URI is registered
  const redirectUri = Linking.createURL('oauth/strava');
  console.log('[Auth] Strava redirect URI:', redirectUri);

  const authUrl = `${STRAVA_AUTH_URL}?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&approval_prompt=force&scope=activity:read_all`;

  console.log('[Auth] Opening Strava login...');
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== 'success' || !result.url) {
    throw new Error('Strava authorization was cancelled');
  }

  // Extract auth code from redirect URL
  const url = new URL(result.url);
  const code = url.searchParams.get('code') || new URL(result.url.replace('#', '?')).searchParams.get('code');

  if (!code) {
    throw new Error('No authorization code received from Strava');
  }

  console.log('[Auth] Got Strava auth code, exchanging for token...');

  // Exchange code for tokens
  const tokenRes = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Strava token exchange failed: ${err}`);
  }

  const data = await tokenRes.json();
  const tokens: TokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: data.expires_at,
    athlete_name: `${data.athlete?.firstname || ''} ${data.athlete?.lastname || ''}`.trim(),
  };

  await saveStravaTokens(tokens);
  console.log('[Auth] ✅ Strava connected:', tokens.athlete_name);
  return tokens;
  END REAL OAUTH */
}

// ══════════════════════════════════════
//  GOOGLE FIT OAUTH
// ══════════════════════════════════════

export async function connectGoogleFit(): Promise<TokenData> {
  // In dev mode, seed tokens directly (Google blocks OAuth from Expo Go)
  // TODO: Replace with real OAuth once app is registered & verified with Google
  console.log('[Auth] Using dev Google tokens (OAuth blocked in Expo Go)');
  const devTokens: TokenData = {
    access_token: 'dev_google_token',
    refresh_token: '1//0g2Z3x4y5z6a7b8c9d0e',
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    email: 'dheerajsmurthy@gmail.com',
  };
  await saveGoogleTokens(devTokens);
  console.log('[Auth] ✅ Google Fit connected (dev mode)');
  return devTokens;

  /* REAL OAUTH - uncomment when app is verified with Google
  const redirectUri = Linking.createURL('oauth/google');
  console.log('[Auth] Google redirect URI:', redirectUri);

  const authUrl = `${GOOGLE_AUTH_URL}?client_id=${GOOGLE_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(GOOGLE_FIT_SCOPES)}&access_type=offline&prompt=consent`;

  console.log('[Auth] Opening Google Fit login...');
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== 'success' || !result.url) {
    throw new Error('Google authorization was cancelled');
  }

  const url = new URL(result.url);
  const code = url.searchParams.get('code');

  if (!code) {
    throw new Error('No authorization code received from Google');
  }

  console.log('[Auth] Got Google auth code, exchanging for token...');

  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google token exchange failed: ${err}`);
  }

  const data = await tokenRes.json();
  const tokens: TokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (data.expires_in || 3600),
    email: 'Connected',
  };

  await saveGoogleTokens(tokens);
  console.log('[Auth] ✅ Google Fit connected');
  return tokens;
  END REAL OAUTH */
}

// ══════════════════════════════════════
//  TOKEN REFRESH
// ══════════════════════════════════════

export async function getValidStravaToken(): Promise<string | null> {
  const tokens = await getStoredStravaTokens();
  if (!tokens) return null;

  // Check if token is expired (with 5 min buffer)
  if (tokens.expires_at < Date.now() / 1000 + 300) {
    try {
      console.log('[Auth] Refreshing Strava token...');
      const res = await fetch(STRAVA_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      if (!res.ok) throw new Error('Refresh failed');

      const data = await res.json();
      tokens.access_token = data.access_token;
      tokens.refresh_token = data.refresh_token;
      tokens.expires_at = data.expires_at;
      await saveStravaTokens(tokens);
      console.log('[Auth] ✅ Strava token refreshed');
    } catch (e) {
      console.error('[Auth] Strava refresh failed:', e);
      return null;
    }
  }

  return tokens.access_token;
}

export async function getValidGoogleToken(): Promise<string | null> {
  const tokens = await getStoredGoogleTokens();
  if (!tokens) return null;

  if (tokens.expires_at < Date.now() / 1000 + 300) {
    try {
      console.log('[Auth] Refreshing Google token...');
      const res = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: tokens.refresh_token,
          grant_type: 'refresh_token',
        }).toString(),
      });

      if (!res.ok) throw new Error('Refresh failed');

      const data = await res.json();
      tokens.access_token = data.access_token;
      tokens.expires_at = Math.floor(Date.now() / 1000) + (data.expires_in || 3600);
      await saveGoogleTokens(tokens);
      console.log('[Auth] ✅ Google token refreshed');
    } catch (e) {
      console.error('[Auth] Google refresh failed:', e);
      return null;
    }
  }

  return tokens.access_token;
}

// ══════════════════════════════════════
//  DEV MODE: Auto-seed existing tokens
//  Remove this in production
// ══════════════════════════════════════

const DEV_STRAVA_TOKENS: TokenData = {
  access_token: '91caf151202bff7e189224493821a955a5e6263f',
  refresh_token: 'd8e6926f6766ed69e2573ce543f51e337458ecea',
  expires_at: 1779501460,
  athlete_name: 'Dheeraj',
};

const DEV_GOOGLE_TOKENS: TokenData = {
  access_token: '',
  refresh_token: 'PLACEHOLDER_REFRESH_TOKEN',
  expires_at: 0,
  email: 'dheerajsmurthy@gmail.com',
};

export async function seedDevTokens(): Promise<void> {
  const strava = await getStoredStravaTokens();
  const google = await getStoredGoogleTokens();

  if (!strava) {
    await SecureStore.setItemAsync(STRAVA_TOKEN_KEY, JSON.stringify(DEV_STRAVA_TOKENS));
    console.log('[Auth] 🌱 Seeded dev Strava tokens');
  }
  if (!google) {
    await SecureStore.setItemAsync(GOOGLE_TOKEN_KEY, JSON.stringify(DEV_GOOGLE_TOKENS));
    console.log('[Auth] 🌱 Seeded dev Google Fit tokens');
  }
}
