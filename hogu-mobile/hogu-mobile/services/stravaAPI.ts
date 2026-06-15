/**
 * Strava API Service
 * Handles all Strava API calls and authentication
 */

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export interface StravaActivity {
  id: number;
  name: string;
  type: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  average_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  calories?: number;
  start_date: string;
  start_latlng: [number, number];
}

export interface StravaAthlete {
  id: number;
  firstname: string;
  lastname: string;
  profile?: string;
  city?: string;
  state?: string;
  country?: string;
}

class StravaAPI {
  private accessToken: string | null = null;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || null;
  }

  /**
   * Set access token
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Validate that token exists
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get current athlete info
   */
  async getAthlete(): Promise<StravaAthlete> {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please login with Strava.');
    }

    try {
      console.log('[Strava API] Fetching athlete info...');
      console.log('[Strava API] Token (first 20 chars):', this.accessToken.substring(0, 20) + '...');
      
      const response = await fetch(`${STRAVA_API_BASE}/athlete`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[Strava API] Athlete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Strava API] Athlete error response:', errorText);
        
        if (response.status === 401) {
          throw new Error('❌ Invalid token. The token may be expired or incorrect.');
        }
        if (response.status === 403) {
          throw new Error('❌ Access forbidden. Check if the token has proper permissions.');
        }
        throw new Error(`❌ Strava API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('[Strava API] ✅ Athlete fetched:', data.firstname, data.lastname);
      return data;
    } catch (error: any) {
      console.error('[Strava API] Error fetching athlete info:', error?.message || error);
      
      // Detect network errors
      if (error?.message?.includes('Network') || error?.message?.includes('Failed to fetch')) {
        throw new Error('❌ Network error: Cannot reach Strava API. Check your internet connection.');
      }
      
      throw error;
    }
  }

  /**
   * Get recent activities
   */
  async getActivities(limit: number = 10, page: number = 1): Promise<StravaActivity[]> {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please login with Strava.');
    }

    try {
      const params = new URLSearchParams({
        per_page: limit.toString(),
        page: page.toString(),
      });

      console.log('[Strava API] Fetching activities with limit:', limit, 'page:', page);
      const response = await fetch(`${STRAVA_API_BASE}/athlete/activities?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('[Strava API] Activities response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Strava API] Error response text:', errorText);
        
        if (response.status === 401) {
          throw new Error('❌ Invalid token. Please check your Strava access token.');
        }
        if (response.status === 403) {
          throw new Error('❌ Access forbidden. Your token may not have permission to read activities.');
        }
        if (response.status === 429) {
          throw new Error('❌ Rate limited. Too many requests to Strava. Please wait a moment.');
        }
        throw new Error(`❌ Strava API error: ${response.status} - ${errorText}`);
      }

      const activities = await response.json();
      console.log('[Strava API] Successfully fetched', activities.length, 'activities');
      
      return activities.map((activity: any) => ({
        id: activity.id,
        name: activity.name,
        type: activity.type,
        distance: activity.distance || 0,
        moving_time: activity.moving_time || 0,
        elapsed_time: activity.elapsed_time || 0,
        total_elevation_gain: activity.total_elevation_gain || 0,
        average_speed: activity.average_speed || 0,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        calories: activity.calories,
        start_date: activity.start_date,
        start_latlng: activity.start_latlng || [0, 0],
      }));
    } catch (error: any) {
      console.error('[Strava API] Error fetching activities:', error?.message || error);
      
      // Detect network errors
      if (error?.message?.includes('Network') || error?.message?.includes('Failed to fetch')) {
        throw new Error('❌ Network error: Cannot reach Strava API. Check your internet connection.');
      }
      
      throw error;
    }
  }

  /**
   * Get single activity details
   */
  async getActivityDetail(activityId: number): Promise<StravaActivity | null> {
    if (!this.accessToken) {
      throw new Error('Not authenticated. Please login with Strava.');
    }

    try {
      const response = await fetch(`${STRAVA_API_BASE}/activities/${activityId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`Error fetching activity ${activityId}: ${response.status}`);
        return null;
      }

      const activity = await response.json();
      return {
        id: activity.id,
        name: activity.name,
        type: activity.type,
        distance: activity.distance || 0,
        moving_time: activity.moving_time || 0,
        elapsed_time: activity.elapsed_time || 0,
        total_elevation_gain: activity.total_elevation_gain || 0,
        average_speed: activity.average_speed || 0,
        average_heartrate: activity.average_heartrate,
        max_heartrate: activity.max_heartrate,
        calories: activity.calories,
        start_date: activity.start_date,
        start_latlng: activity.start_latlng || [0, 0],
      };
    } catch (error) {
      console.error('Error fetching activity detail:', error);
      throw error;
    }
  }

  /**
   * Validate token by fetching athlete
   */
  async validateToken(): Promise<boolean> {
    try {
      await this.getAthlete();
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}

// Export singleton instance factory
export const createStravaAPI = (accessToken?: string) => {
  return new StravaAPI(accessToken);
};

export default StravaAPI;
