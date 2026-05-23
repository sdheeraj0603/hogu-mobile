// strava-api.js - Strava API Integration Layer

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';
const FLASK_BACKEND = 'http://localhost:5000';

/**
 * Strava API Wrapper
 * Handles all Strava API calls and token management
 */
class StravaAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  /**
   * Get recent activities from Strava
   * @param {number} limit - Number of activities to fetch (default: 10)
   * @param {string} source - 'strava' (direct) or 'flask' (backend)
   */
  async getActivities(limit = 10, source = 'flask') {
    try {
      if (source === 'flask') {
        // Use Flask backend (easier for testing)
        return await this._getActivitiesFromFlask(limit);
      } else {
        // Call Strava API directly
        return await this._getActivitiesFromStrava(limit);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }
  }

  /**
   * Get activities from Flask backend
   * Flask backend handles Strava authentication
   */
  async _getActivitiesFromFlask(limit = 10) {
    const response = await fetch(
      `${FLASK_BACKEND}/api/activities?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Flask API error: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Get activities directly from Strava API
   * Requires valid Strava access token
   */
  async _getActivitiesFromStrava(limit = 10) {
    const response = await fetch(
      `${STRAVA_API_BASE}/athlete/activities?per_page=${limit}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Strava API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format to match Flask backend response
    return data.map(activity => ({
      id: activity.id,
      name: activity.name,
      distance: activity.distance || 0,
      moving_time: activity.moving_time || 0,
      elapsed_time: activity.elapsed_time || 0,
      total_elevation_gain: activity.total_elevation_gain || 0,
      type: activity.type,
      workout_type: activity.workout_type,
      start_date: activity.start_date,
      start_latlng: activity.start_latlng || [0, 0],
      average_speed: activity.average_speed || 0,
      average_heartrate: activity.average_heartrate,
      max_heartrate: activity.max_heartrate,
      average_temp: activity.average_temp,
      calories: activity.calories,
      gear_id: activity.gear_id,
      photos: activity.photos,
      polyline: activity.map?.summary_polyline,
      recommendations: null, // Will be fetched separately
    }));
  }

  /**
   * Get single activity details
   */
  async getActivityDetail(activityId) {
    try {
      const response = await fetch(
        `${STRAVA_API_BASE}/activities/${activityId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching activity detail:', error);
      throw error;
    }
  }

  /**
   * Get current athlete info (user profile)
   */
  async getAthlete() {
    try {
      const response = await fetch(
        `${STRAVA_API_BASE}/athlete`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching athlete info:', error);
      throw error;
    }
  }

  /**
   * Get activity streams (coordinates, heartrate, etc.)
   */
  async getActivityStreams(activityId, keys = ['latlng', 'altitude', 'heartrate']) {
    try {
      const keyString = keys.join(',');
      const response = await fetch(
        `${STRAVA_API_BASE}/activities/${activityId}/streams?keys=${keyString}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Strava API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching activity streams:', error);
      throw error;
    }
  }

  /**
   * Get recommendations for activity
   * (Must be fetched from Flask backend)
   */
  async getRecommendations(activityId) {
    try {
      const response = await fetch(
        `${FLASK_BACKEND}/api/activity/${activityId}/recommendations`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        return null; // No recommendations available
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return null;
    }
  }

  /**
   * Validate access token
   */
  async validateToken() {
    try {
      const athlete = await this.getAthlete();
      return !!athlete.id;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get token expiration info (if available)
   */
  getTokenInfo() {
    return {
      token: this.accessToken,
      hasToken: !!this.accessToken,
    };
  }
}

/**
 * Export singleton instance factory
 */
export const createStravaAPI = (accessToken) => {
  return new StravaAPI(accessToken);
};

/**
 * Default export for easy imports
 */
export default StravaAPI;

/**
 * HOW TO USE:
 * 
 * // Import
 * import StravaAPI from '../api/strava-api';
 * 
 * // Create instance with token
 * const stravaAPI = new StravaAPI(accessToken);
 * 
 * // Get activities from Flask backend
 * const activities = await stravaAPI.getActivities(10, 'flask');
 * 
 * // Get activities directly from Strava
 * const activities = await stravaAPI.getActivities(10, 'strava');
 * 
 * // Get single activity
 * const activity = await stravaAPI.getActivityDetail(123456);
 * 
 * // Get user profile
 * const athlete = await stravaAPI.getAthlete();
 * 
 * // Get recommendations
 * const recommendations = await stravaAPI.getRecommendations(123456);
 */
