/**
 * Strava Session Manager
 * Handles persistent token storage, auto-refresh, and session lifecycle
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshAccessToken } from './stravaOAuth';

const STORAGE_KEY = '@hogu_strava_session';

export interface StravaSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete_id: number;
  athlete_name: string;
  created_at: number;
}

export interface SessionStatus {
  isAuthenticated: boolean;
  tokenExpired: boolean;
  timeToExpire: number; // seconds
  athleteName?: string;
}

class StravaSessionManager {
  private session: StravaSession | null = null;
  private refreshPromise: Promise<StravaSession> | null = null;

  /**
   * Save session to persistent storage
   * Gracefully handles AsyncStorage not being available
   */
  async saveSession(session: StravaSession): Promise<void> {
    try {
      this.session = session;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      console.log('[Session] Session saved for', session.athlete_name);
    } catch (error: any) {
      // Silently handle AsyncStorage errors
      if (error?.message?.includes('Native module')) {
        console.log('[Session] AsyncStorage unavailable, session kept in memory');
        return;
      }
      console.error('[Session] Error saving session:', error);
      throw error;
    }
  }

  /**
   * Load session from persistent storage
   * Gracefully handles AsyncStorage not being available (offline mode)
   */
  async loadSession(): Promise<StravaSession | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) {
        console.log('[Session] No stored session found');
        return null;
      }

      this.session = JSON.parse(stored);
      console.log('[Session] Loaded session for', this.session?.athlete_name);
      return this.session;
    } catch (error: any) {
      // Silently handle AsyncStorage errors (normal in offline/bundling mode)
      if (error?.message?.includes('Native module')) {
        console.log('[Session] AsyncStorage unavailable (normal in offline mode)');
        return null;
      }
      console.error('[Session] Error loading session:', error);
      return null;
    }
  }

  /**
   * Clear session from storage
   */
  async clearSession(): Promise<void> {
    try {
      this.session = null;
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[Session] Session cleared');
    } catch (error) {
      console.error('[Session] Error clearing session:', error);
      throw error;
    }
  }

  /**
   * Get current session
   */
  getSession(): StravaSession | null {
    return this.session;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(): boolean {
    if (!this.session) return true;
    return Date.now() / 1000 > this.session.expires_at;
  }

  /**
   * Get time remaining before token expires (seconds)
   */
  getTimeToExpire(): number {
    if (!this.session) return -1;
    return Math.max(0, this.session.expires_at - Date.now() / 1000);
  }

  /**
   * Get current session status
   */
  getStatus(): SessionStatus {
    return {
      isAuthenticated: !!this.session,
      tokenExpired: this.isTokenExpired(),
      timeToExpire: this.getTimeToExpire(),
      athleteName: this.session?.athlete_name,
    };
  }

  /**
   * Get valid access token (auto-refresh if needed)
   * This ensures we always have a valid token before making API calls
   */
  async getValidAccessToken(): Promise<string> {
    if (!this.session) {
      throw new Error('No session available. Please authenticate first.');
    }

    // If token is still valid, return it
    if (!this.isTokenExpired()) {
      const timeLeft = this.getTimeToExpire();
      console.log(`[Session] Token valid for ${Math.round(timeLeft)} seconds`);
      return this.session.access_token;
    }

    // Token expired - need to refresh
    console.log('[Session] Token expired, refreshing...');

    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      console.log('[Session] Refresh already in progress, waiting...');
      const refreshedSession = await this.refreshPromise;
      return refreshedSession.access_token;
    }

    try {
      this.refreshPromise = this.performRefresh();
      const refreshedSession = await this.refreshPromise;
      await this.saveSession(refreshedSession);
      console.log('[Session] Token refreshed successfully');
      return refreshedSession.access_token;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * Perform token refresh
   */
  private async performRefresh(): Promise<StravaSession> {
    if (!this.session) {
      throw new Error('No session to refresh');
    }

    try {
      const refreshData = await refreshAccessToken(this.session.refresh_token);

      return {
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token,
        expires_at: refreshData.expires_at,
        athlete_id: this.session.athlete_id,
        athlete_name: this.session.athlete_name,
        created_at: this.session.created_at,
      };
    } catch (error) {
      console.error('[Session] Refresh failed:', error);
      // Clear invalid session
      await this.clearSession();
      throw new Error('Failed to refresh token. Please re-authenticate.');
    }
  }

  /**
   * Session requires re-authentication (token completely invalid)
   */
  requiresReauth(): boolean {
    return !this.session || this.isTokenExpired();
  }
}

// Export singleton instance
export default new StravaSessionManager();
