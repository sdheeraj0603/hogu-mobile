/**
 * Mock data for testing meal recommendation engine
 * Simulate various workout scenarios
 */

import { Activity, UserBiometrics } from '@/app/services/nutritionEngine';

export const mockActivities: Record<string, Activity> = {
  // Trail Run - High intensity, sweat loss, carb depletion
  trailRun: {
    name: 'Forest Park Trail Run',
    type: 'Run',
    duration: 4500, // 75 minutes
    distance: 12.3,
    elevationGain: 450,
    caloriesBurned: 850,
    averageHeartRate: 165,
    maxHeartRate: 175,
    workoutIntensity: 'high',
    timestamp: Date.now(),
  },

  // Long Distance Road Bike - Endurance, high glycogen depletion
  roadBike: {
    name: 'Morning Road Bike - City Loop',
    type: 'Ride',
    duration: 7200, // 120 minutes
    distance: 45.6,
    elevationGain: 120,
    caloriesBurned: 1200,
    averageHeartRate: 140,
    maxHeartRate: 155,
    workoutIntensity: 'moderate',
    timestamp: Date.now(),
  },

  // CrossFit Workout - High intensity, mixed movements
  crossfit: {
    name: 'CrossFit: Murph Modified',
    type: 'CrossFit',
    duration: 2700, // 45 minutes
    distance: 0,
    elevationGain: 0,
    caloriesBurned: 450,
    averageHeartRate: 168,
    maxHeartRate: 185,
    workoutIntensity: 'very_high',
    timestamp: Date.now(),
  },

  // Swimming - Full body, moderate intensity
  swimming: {
    name: 'Pool Swim - Endurance',
    type: 'Swim',
    duration: 3600, // 60 minutes
    distance: 2.5,
    elevationGain: 0,
    caloriesBurned: 650,
    averageHeartRate: 145,
    maxHeartRate: 160,
    workoutIntensity: 'moderate',
    timestamp: Date.now(),
  },

  // Easy Recovery Run - Low intensity
  recoveryRun: {
    name: 'Easy Recovery Jog',
    type: 'Run',
    duration: 1800, // 30 minutes
    distance: 4.2,
    elevationGain: 0,
    caloriesBurned: 300,
    averageHeartRate: 120,
    maxHeartRate: 135,
    workoutIntensity: 'low',
    timestamp: Date.now(),
  },

  // Mountain Bike - Technical, mixed intensity
  mountainBike: {
    name: 'Singletracks Trail Ride',
    type: 'Ride',
    duration: 5400, // 90 minutes
    distance: 22.4,
    elevationGain: 650,
    caloriesBurned: 950,
    averageHeartRate: 150,
    maxHeartRate: 170,
    workoutIntensity: 'high',
    timestamp: Date.now(),
  },
};

export const mockBiometrics: UserBiometrics = {
  bodyWeight: 75, // kg
  bodyTemperature: 37, // Celsius
  restingHeartRate: 60,
  vo2Max: 52,
};

// Preset scenarios for quick testing
export const testScenarios = [
  {
    name: '🏃 Trail Run (High Intensity)',
    activity: mockActivities.trailRun,
    description: 'After a intense 75-min trail run with 450m elevation gain',
  },
  {
    name: '🚴 Long Road Bike (Endurance)',
    activity: mockActivities.roadBike,
    description: 'After a 2-hour road bike with significant carb depletion',
  },
  {
    name: '⛹️ CrossFit (Mixed Movements)',
    activity: mockActivities.crossfit,
    description: 'After a high-intensity 45-min CrossFit workout',
  },
  {
    name: '🏊 Swimming (Full Body)',
    activity: mockActivities.swimming,
    description: 'After a 60-min pool swimming session',
  },
  {
    name: '🚶 Recovery Run (Low Intensity)',
    activity: mockActivities.recoveryRun,
    description: 'After a 30-min easy recovery jog',
  },
  {
    name: '🚵 Mountain Bike (Technical)',
    activity: mockActivities.mountainBike,
    description: 'After a 90-min mountain bike with technical terrain',
  },
];

// Default export to prevent expo-router warnings
export default { mockActivities, mockBiometrics, testScenarios };
