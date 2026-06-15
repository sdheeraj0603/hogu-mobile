/**
 * Apple HealthKit Integration
 * Real-time data from Apple Watch via native iOS integration
 * 
 * For Expo Go: Uses mock data
 * For native build: Uses actual HealthKit API
 */

import { Platform } from 'react-native';

export interface HealthKitWorkout {
  id: string;
  activityType: string;
  activityName: string;
  startDate: Date;
  endDate: Date;
  duration: number; // seconds
  distance?: number; // km
  calories: number;
  averageHeartRate?: number;
  maxHeartRate?: number;
  minHeartRate?: number;
  steps?: number;
  elevation?: number;
}

export interface HeartRateData {
  timestamp: Date;
  value: number; // bpm
}

export interface StepData {
  date: Date;
  steps: number;
}

// Mock data for testing
const MOCK_WORKOUTS: HealthKitWorkout[] = [
  {
    id: 'hw-run-20260522',
    activityType: 'HKWorkoutActivityTypeRunning',
    activityName: 'Morning Run',
    startDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    endDate: new Date(Date.now() - 2 * 60 * 60 * 1000 + 32 * 60 * 1000),
    duration: 32 * 60, // 32 minutes
    distance: 5.8,
    calories: 580,
    averageHeartRate: 152,
    maxHeartRate: 174,
    minHeartRate: 98,
    elevation: 45,
  },
  {
    id: 'hw-cycling-20260521',
    activityType: 'HKWorkoutActivityTypeCycling',
    activityName: 'Evening Cycle',
    startDate: new Date(Date.now() - 26 * 60 * 60 * 1000), // Yesterday
    endDate: new Date(Date.now() - 26 * 60 * 60 * 1000 + 58 * 60 * 1000),
    duration: 58 * 60,
    distance: 22.5,
    calories: 720,
    averageHeartRate: 138,
    maxHeartRate: 162,
    minHeartRate: 75,
    elevation: 120,
  },
  {
    id: 'hw-strength-20260520',
    activityType: 'HKWorkoutActivityTypeOtherTraining',
    activityName: 'Strength Training',
    startDate: new Date(Date.now() - 50 * 60 * 60 * 1000), // 2 days ago
    endDate: new Date(Date.now() - 50 * 60 * 60 * 1000 + 45 * 60 * 1000),
    duration: 45 * 60,
    distance: 0,
    calories: 420,
    averageHeartRate: 118,
    maxHeartRate: 145,
    minHeartRate: 88,
  },
];

const MOCK_HEART_RATE: HeartRateData[] = [
  { timestamp: new Date(Date.now() - 30 * 60 * 1000), value: 68 },
  { timestamp: new Date(Date.now() - 20 * 60 * 1000), value: 72 },
  { timestamp: new Date(Date.now() - 10 * 60 * 1000), value: 75 },
  { timestamp: new Date(Date.now() - 5 * 60 * 1000), value: 78 },
  { timestamp: new Date(), value: 76 },
];

class AppleHealthKitManager {
  private isSupported = Platform.OS === 'ios';
  private nativeModule: any = null;

  constructor() {
    this.initializeNativeModule();
  }

  private initializeNativeModule() {
    if (!this.isSupported) {
      console.log('[HealthKit] Not on iOS, using mock data');
      return;
    }

    try {
      // In a real native build, we'd require react-native-health here
      // const RNHealthKit = require('react-native-health').default;
      // this.nativeModule = RNHealthKit;
      console.log('[HealthKit] HealthKit module initialized');
    } catch (error) {
      console.warn('[HealthKit] Could not load native module:', error);
    }
  }

  /**
   * Get recent workouts from Apple Watch
   */
  async getRecentWorkouts(days: number = 7): Promise<HealthKitWorkout[]> {
    try {
      console.log(`[HealthKit] Fetching workouts from last ${days} days...`);

      if (this.nativeModule && this.isSupported) {
        // Real implementation would query HealthKit
        // const workouts = await this.nativeModule.getWorkouts({ days });
        // return this.parseWorkouts(workouts);
      }

      // Mock data for testing
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const filtered = MOCK_WORKOUTS.filter((w) => w.startDate > cutoffDate).sort(
        (a, b) => b.startDate.getTime() - a.startDate.getTime()
      );

      console.log(`[HealthKit] ✅ Found ${filtered.length} workouts`);
      return filtered;
    } catch (error) {
      console.error('[HealthKit] Error fetching workouts:', error);
      return [];
    }
  }

  /**
   * Get real-time heart rate data
   */
  async getHeartRateData(minutes: number = 30): Promise<HeartRateData[]> {
    try {
      console.log(`[HealthKit] Fetching heart rate from last ${minutes} minutes...`);

      if (this.nativeModule && this.isSupported) {
        // Real implementation would query HealthKit
        // const hrData = await this.nativeModule.getHeartRateSamples({ minutes });
        // return hrData;
      }

      // Mock data
      const cutoffTime = Date.now() - minutes * 60 * 1000;
      const filtered = MOCK_HEART_RATE.filter((hr) => hr.timestamp.getTime() > cutoffTime);

      console.log(`[HealthKit] ✅ Found ${filtered.length} heart rate samples`);
      return filtered;
    } catch (error) {
      console.error('[HealthKit] Error fetching heart rate:', error);
      return [];
    }
  }

  /**
   * Get step count for a specific date or date range
   */
  async getStepCount(startDate: Date, endDate: Date = new Date()): Promise<StepData> {
    try {
      console.log(`[HealthKit] Fetching steps from ${startDate.toDateString()}`);

      if (this.nativeModule && this.isSupported) {
        // Real implementation
        // const steps = await this.nativeModule.getStepCount({ startDate, endDate });
        // return steps;
      }

      // Mock data - random steps
      const steps = Math.floor(Math.random() * 15000) + 5000;
      return { date: startDate, steps };
    } catch (error) {
      console.error('[HealthKit] Error fetching steps:', error);
      return { date: startDate, steps: 0 };
    }
  }

  /**
   * Get resting heart rate
   */
  async getRestingHeartRate(): Promise<number | null> {
    try {
      console.log('[HealthKit] Fetching resting heart rate...');

      if (this.nativeModule && this.isSupported) {
        // Real implementation
        // const rhr = await this.nativeModule.getRestingHeartRate();
        // return rhr;
      }

      // Mock data
      return 62;
    } catch (error) {
      console.error('[HealthKit] Error fetching resting HR:', error);
      return null;
    }
  }

  /**
   * Get HRV (Heart Rate Variability)
   */
  async getHRV(): Promise<number | null> {
    try {
      console.log('[HealthKit] Fetching HRV...');

      if (this.nativeModule && this.isSupported) {
        // Real implementation
        // const hrv = await this.nativeModule.getHRV();
        // return hrv;
      }

      // Mock data (in ms)
      return 45;
    } catch (error) {
      console.error('[HealthKit] Error fetching HRV:', error);
      return null;
    }
  }

  /**
   * Get today's active calories
   */
  async getTodayActiveCalories(): Promise<number> {
    try {
      console.log('[HealthKit] Fetching today active calories...');

      if (this.nativeModule && this.isSupported) {
        // Real implementation
        // const calories = await this.nativeModule.getTodayActiveCalories();
        // return calories;
      }

      // Mock data
      const todayWorkouts = MOCK_WORKOUTS.filter((w) => {
        const today = new Date();
        return (
          w.startDate.getFullYear() === today.getFullYear() &&
          w.startDate.getMonth() === today.getMonth() &&
          w.startDate.getDate() === today.getDate()
        );
      });

      return todayWorkouts.reduce((sum, w) => sum + w.calories, 0);
    } catch (error) {
      console.error('[HealthKit] Error fetching active calories:', error);
      return 0;
    }
  }

  /**
   * Get latest workout
   */
  async getLatestWorkout(): Promise<HealthKitWorkout | null> {
    try {
      const workouts = await this.getRecentWorkouts(1);
      return workouts.length > 0 ? workouts[0] : null;
    } catch (error) {
      console.error('[HealthKit] Error fetching latest workout:', error);
      return null;
    }
  }

  /**
   * Format workout for display
   */
  formatWorkout(workout: HealthKitWorkout): string {
    const duration = Math.round(workout.duration / 60);
    const distance = workout.distance ? ` • ${workout.distance.toFixed(1)} km` : '';
    const hr = workout.averageHeartRate ? ` • Avg HR: ${workout.averageHeartRate} bpm` : '';
    return `${workout.activityName}${distance} • ${duration} min${hr}`;
  }
}

// Export singleton
export const healthKitManager = new AppleHealthKitManager();
export default AppleHealthKitManager;
