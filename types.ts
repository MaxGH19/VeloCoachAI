
export type TrainingGoal = 'Gran Fondo' | 'Kriterium' | 'Fitness' | 'All-round';
export type FitnessLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type Equipment = 'Smart Trainer' | 'Power Meter' | 'Heart Rate Monitor';
export type Gender = 'männlich' | 'weiblich' | 'keine Angabe';

export interface UserProfile {
  goal: TrainingGoal;
  level: FitnessLevel;
  weeklyHours: number;
  availableDays: string[];
  equipment: Equipment[];
  gender: Gender | '';
  age: number | undefined;
  weight: number | undefined;
  ftp?: number;
  maxHeartRate?: number;
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
