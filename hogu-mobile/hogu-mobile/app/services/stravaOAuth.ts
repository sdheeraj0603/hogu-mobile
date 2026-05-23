/**
 * Strava OAuth Service
 * Handles the OAuth flow to get access tokens without manual code entry
 */

import * as Linking from 'expo-linking';

const CLIENT_ID = '233623';
const CLIENT_SECRET = '73515b47713192ae55aea6e42f54c284a6305f24';
const REDIRECT_URI = 'http://localhost:8000/callback'; // For web/dev
const STRAVA_OAUTH_URL = 'https://www.strava.com/oauth/authorize';
const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token';

/**
 * Generate the authorization URL for the user to visit
 * They'll click "Authorize" and get a code
 */
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    approval_prompt: 'force',
    scope: 'activity:read_all',
  });

  return `${STRAVA_OAUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 * This is done server-side (or via a secure backend)
 */
export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: any;
}> {
  try {
    console.log('[OAuth] Exchanging code for token...');

    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[OAuth] Token exchange failed:', error);
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();

    console.log('[OAuth] ✅ Token received!');
    console.log('[OAuth] Athlete:', data.athlete?.firstname, data.athlete?.lastname);

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: data.athlete,
    };
  } catch (error) {
    console.error('[OAuth] Error:', error);
    throw error;
  }
}

/**
 * Refresh an expired access token using the refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_at: number;
}> {
  try {
    console.log('[OAuth] Refreshing access token...');

    const response = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();

    console.log('[OAuth] ✅ Token refreshed!');

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    };
  } catch (error) {
    console.error('[OAuth] Refresh error:', error);
    throw error;
  }
}

/**
 * Open the Strava authorization URL in the browser
 * User clicks "Authorize" and gets a code
 */
export async function openStravaAuthorizationPage(): Promise<void> {
  const url = getAuthorizationUrl();

  try {
    console.log('[OAuth] Opening Strava authorization page...');
    const result = await Linking.openURL(url);

    if (!result) {
      throw new Error('Failed to open URL');
    }

    console.log('[OAuth] Authorization page opened');
  } catch (error) {
    console.error('[OAuth] Error opening page:', error);
    throw new Error('Could not open Strava authorization page');
  }
}

// Default export to prevent expo-router warnings
export default {
  getAuthorizationUrl,
  exchangeCodeForToken,
  refreshAccessToken,
  openStravaAuthorizationPage,
};
