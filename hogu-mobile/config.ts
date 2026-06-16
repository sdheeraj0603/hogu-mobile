import Constants from 'expo-constants';

/**
 * Single source of truth for the backend API base URL.
 *
 * Priority:
 *  1. EXPO_PUBLIC_API_BASE — your public backend URL (ngrok tunnel or deployed
 *     server). Set this so the app works on ANY phone & ANY network, and for
 *     production builds. e.g.  EXPO_PUBLIC_API_BASE=https://hogu.ngrok-free.app
 *  2. Expo dev-server IP — auto-detected from Metro (ONLY works for a phone on
 *     the SAME WiFi as this Mac; fails across networks / locked-down WiFi).
 *  3. Hardcoded localhost fallback.
 *
 * NOTE: when running `expo start --tunnel`, Metro's host is an *.exp.direct
 * tunnel (for the JS bundle only) — it is NOT your backend. That's why the
 * env var MUST take priority and we only auto-use the host when it's a real IP.
 */
function getApiBase(): string {
  // 1. Explicit public URL (ngrok / cloud) — best for multi-device + prod
  const envUrl = process.env.EXPO_PUBLIC_API_BASE;
  if (envUrl) return envUrl.replace(/\/+$/, '');

  // 2. Auto-detect the Mac's LAN IP from the Expo dev server (same-network dev)
  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    '';
  const host = debuggerHost.split(':')[0];
  const isIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  if (isIpv4) {
    return `http://${host}:5000`;
  }

  // 3. Last-resort fallback
  return 'http://127.0.0.1:5000';
}

export const API_BASE = getApiBase();
console.log('[Config] API Base URL:', API_BASE);

/**
 * Wrapper around fetch() for ALL backend calls.
 *
 * Adds the `ngrok-skip-browser-warning` header so ngrok's free-tier
 * interstitial HTML page never gets returned instead of our JSON (which would
 * make res.json() throw). Harmless when the backend isn't behind ngrok.
 *
 * Usage is identical to fetch():
 *   const res = await apiFetch(`${API_BASE}/api/login`, { method: 'POST', ... });
 */
export function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      'ngrok-skip-browser-warning': 'true',
      ...(options.headers || {}),
    },
  });
}
