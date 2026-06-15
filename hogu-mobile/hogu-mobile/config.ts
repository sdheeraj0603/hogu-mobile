import Constants from 'expo-constants';

/**
 * Auto-detect the backend API base URL.
 * In dev, uses the same IP that Expo is serving from (the Mac's local IP).
 * In production, replace with your actual server URL.
 */
function getApiBase(): string {
  // Production override
  const PRODUCTION_URL = ''; // Set this when you deploy, e.g. 'https://api.hogu.app'
  if (PRODUCTION_URL) return PRODUCTION_URL;

  // In Expo dev, get the debuggerHost which contains the Mac's IP
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || '';
  const ip = debuggerHost.split(':')[0];

  if (ip) {
    return `http://${ip}:5000`;
  }

  // Fallback to your local network IP (from Flask output: 100.64.0.1)
  return 'http://100.64.0.1:5000';
}

export const API_BASE = getApiBase();
console.log('[Config] API Base URL:', API_BASE);
