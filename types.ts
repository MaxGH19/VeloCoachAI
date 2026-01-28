
export type TrainingGoal = 'Endurance' | 'Climbing' | 'Sprinting' | 'Weight Loss' | 'Event Prep';
export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type Equipment = 'Road Bike' | 'Indoor Trainer' | 'Power Meter' | 'Heart Rate Monitor';

export interface UserProfile {
  goal: TrainingGoal;
  level: FitnessLevel;
  weeklyHours: number;
  availableDays: string[];
  equipment: Equipment[];
  age: number;
  weight: number;
}

export interface TrainingSession {
  day: string;
  type: string;
  title: string;
  durationMinutes: number;
  intensity: 'Low' | 'Moderate' | 'High' | 'Rest';
  description: string;
  intervals?: string;
}

export interface WeeklyPlan {
  weekNumber: number;
  focus: string;
  sessions: TrainingSession[];
}

export interface FullTrainingPlan {
  planTitle: string;
  summary: string;
  targetMetrics: {
    estimatedTSS: number;
    weeklyVolume: string;
  };
  weeks: WeeklyPlan[];
}
