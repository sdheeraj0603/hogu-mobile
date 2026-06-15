/**
 * Unified Fitness Data Service
 * Pulls REAL data from Strava, Google Fit (and Samsung Health via Google Fit sync)
 * 
 * Architecture:
 * - User links accounts via OAuth (Strava, Google Fit)
 * - Samsung Health users sync to Google Fit first (Samsung supports this natively)
 * - This service calls your Flask backend which stores tokens and fetches data
 * - Backend returns unified workout format regardless of source
 */

// Simple in-memory storage (avoids native module issues in Expo Go)
const memoryStore: Record<string, string> = {};
const AsyncStorage = {
  getItem: async (key: string) => memoryStore[key] || null,
  setItem: async (key: string, value: string) => { memoryStore[key] = value; },
};

// Your backend URL - Flask server running on your machine
const BACKEND_URL = 'http://192.168.1.17:5000'; // Mac's LAN IP (phone connects over WiFi)

// ============ UNIFIED DATA TYPES ============

export interface UnifiedWorkout {
  id: string;
  source: 'strava' | 'google_fit' | 'samsung_health';
  type: string; // Running, Cycling, Swimming, etc.
  name: string;
  startDate: string;
  duration: number; // seconds
  distance?: number; // meters
  calories?: number;
  avgHeartRate?: number;
  maxHeartRate?: number;
  elevationGain?: number;
  avgSpeed?: number; // m/s
}

export interface UserHealthMetrics {
  restingHR?: number;
  hrv?: number;
  activeCaloriesToday?: number;
  steps?: number;
  sleepHours?: number;
  lastSyncTime: string;
}

export interface ConnectedAccount {
  provider: 'strava' | 'google_fit';
  email: string;
  connected: boolean;
  lastSync?: string;
  athleteName?: string;
}

// ============ OAUTH URLS ============

const STRAVA_CLIENT_ID = '233623';
const STRAVA_REDIRECT_URI = 'hogu://oauth/strava'; // Deep link back to app

const GOOGLE_FIT_CLIENT_ID = 'GOOGLE_CLIENT_ID_FROM_ENV';
const GOOGLE_FIT_REDIRECT_URI = 'hogu://oauth/google';
const GOOGLE_FIT_SCOPES = [
  'https://www.googleapis.com/auth/fitness.activity.read',
  'https://www.googleapis.com/auth/fitness.heart_rate.read',
  'https://www.googleapis.com/auth/fitness.sleep.read',
  'https://www.googleapis.com/auth/fitness.body.read',
].join(' ');

// ============ SERVICE CLASS ============

class FitnessDataService {
  private userEmail: string | null = null;

  /**
   * Initialize with user's email (their identity across all services)
   */
  async init(email: string) {
    this.userEmail = email;
    await AsyncStorage.setItem('hogu_user_email', email);
  }

  // ─── OAUTH FLOWS ───────────────────────────────────────────

  /**
   * Get Strava OAuth URL - open this in a WebBrowser
   * After user authorizes, Strava redirects to your backend with a code
   */
  getStravaAuthURL(): string {
    return `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(BACKEND_URL + '/auth/strava/callback')}&scope=activity:read_all&state=${this.userEmail}`;
  }

  /**
   * Get Google Fit OAuth URL
   */
  getGoogleFitAuthURL(): string {
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_FIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(BACKEND_URL + '/auth/google/callback')}&response_type=code&scope=${encodeURIComponent(GOOGLE_FIT_SCOPES)}&state=${this.userEmail}&access_type=offline&prompt=consent`;
  }

  // ─── DATA FETCHING (from your backend) ─────────────────────

  /**
   * Get all workouts from all connected sources
   * Your backend handles token refresh + API calls + normalization
   */
  async getWorkouts(limit: number = 20): Promise<UnifiedWorkout[]> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/workouts?email=${this.userEmail}&limit=${limit}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return data.workouts as UnifiedWorkout[];
    } catch (error) {
      console.error('Failed to fetch workouts:', error);
      // Fallback: try direct Strava if backend is down
      return this.getStravaWorkoutsDirect();
    }
  }

  /**
   * Get health metrics (HR, HRV, calories) from Google Fit
   */
  async getHealthMetrics(): Promise<UserHealthMetrics> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/health-metrics?email=${this.userEmail}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch health metrics:', error);
      return { lastSyncTime: new Date().toISOString() };
    }
  }

  /**
   * Get list of connected accounts for this user
   */
  async getConnectedAccounts(): Promise<ConnectedAccount[]> {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/accounts?email=${this.userEmail}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      return [];
    }
  }

  // ─── DIRECT STRAVA (fallback if backend is down) ───────────

  /**
   * Direct Strava API call using locally stored token
   * This is what you already have working
   */
  private async getStravaWorkoutsDirect(): Promise<UnifiedWorkout[]> {
    try {
      const tokenStr = await AsyncStorage.getItem('strava_token');
      if (!tokenStr) return [];
      const token = JSON.parse(tokenStr);

      const response = await fetch(
        'https://www.strava.com/api/v3/athlete/activities?per_page=20',
        { headers: { Authorization: `Bearer ${token.access_token}` } }
      );

      if (!response.ok) {
        // Token expired - try refresh
        if (response.status === 401) {
          const newToken = await this.refreshStravaToken(token.refresh_token);
          if (newToken) return this.getStravaWorkoutsDirect();
        }
        return [];
      }

      const activities = await response.json();
      return activities.map((a: any) => ({
        id: `strava_${a.id}`,
        source: 'strava' as const,
        type: a.type,
        name: a.name,
        startDate: a.start_date,
        duration: a.moving_time,
        distance: a.distance,
        calories: a.calories,
        avgHeartRate: a.average_heartrate,
        maxHeartRate: a.max_heartrate,
        elevationGain: a.total_elevation_gain,
        avgSpeed: a.average_speed,
      }));
    } catch (error) {
      console.error('Direct Strava fetch failed:', error);
      return [];
    }
  }

  private async refreshStravaToken(refreshToken: string): Promise<any> {
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: '73515b47713192ae55aea6e42f54c284a6305f24',
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });
      if (!response.ok) return null;
      const newToken = await response.json();
      await AsyncStorage.setItem('strava_token', JSON.stringify(newToken));
      return newToken;
    } catch {
      return null;
    }
  }

  // ─── STORE STRAVA TOKEN LOCALLY (for direct fallback) ──────

  async saveStravaToken(tokenData: any) {
    await AsyncStorage.setItem('strava_token', JSON.stringify(tokenData));
  }
}

export const fitnessDataService = new FitnessDataService();
export default fitnessDataService;
