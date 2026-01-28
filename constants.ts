
import { TrainingGoal, FitnessLevel, Equipment } from './types';

export const GOAL_OPTIONS: { value: TrainingGoal; label: string; icon: string }[] = [
  { value: 'Endurance', label: 'Century / Gran Fondo', icon: 'fa-route' },
  { value: 'Climbing', label: 'Mountain Specialist', icon: 'fa-mountain' },
  { value: 'Sprinting', label: 'Power & Speed', icon: 'fa-bolt' },
  { value: 'Weight Loss', label: 'Fitness & Health', icon: 'fa-weight-scale' },
  { value: 'Event Prep', label: 'Specific Race Prep', icon: 'fa-calendar-check' },
];

export const LEVEL_OPTIONS: { value: FitnessLevel; label: string; description: string }[] = [
  { value: 'Beginner', label: 'Beginner', description: 'Riding 0-3 hours weekly, new to structured training.' },
  { value: 'Intermediate', label: 'Intermediate', description: 'Riding 4-8 hours weekly, familiar with intervals.' },
  { value: 'Advanced', label: 'Advanced', description: '8+ hours weekly, experienced with power zones and TSS.' },
];

export const DAY_OPTIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'Road Bike', label: 'Road/Gravel Bike' },
  { value: 'Indoor Trainer', label: 'Smart Trainer' },
  { value: 'Power Meter', label: 'Power Meter' },
  { value: 'Heart Rate Monitor', label: 'Heart Rate Monitor' },
];
