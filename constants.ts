
import { TrainingGoal, FitnessLevel, Equipment } from './types.ts';

export const GOAL_OPTIONS: { value: TrainingGoal; label: string; icon: string }[] = [
  { value: 'Endurance', label: 'Ausdauer / Century', icon: 'fa-route' },
  { value: 'Climbing', label: 'Bergspezialist', icon: 'fa-mountain' },
  { value: 'Sprinting', label: 'Kraft & Speed', icon: 'fa-bolt' },
  { value: 'Weight Loss', label: 'Fitness & Abnehmen', icon: 'fa-weight-scale' },
  { value: 'Event Prep', label: 'Wettkampfvorbereitung', icon: 'fa-calendar-check' },
];

export const LEVEL_OPTIONS: { value: FitnessLevel; label: string; description: string }[] = [
  { value: 'Beginner', label: 'Anfänger', description: '0-3 Stunden pro Woche, neu im strukturierten Training.' },
  { value: 'Intermediate', label: 'Fortgeschritten', description: '4-8 Stunden pro Woche, vertraut mit Intervallen.' },
  { value: 'Advanced', label: 'Profi', description: '8+ Stunden pro Woche, Erfahrung mit Leistungszonen und TSS.' },
];

export const DAY_OPTIONS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'Road Bike', label: 'Rennrad / Gravel' },
  { value: 'Indoor Trainer', label: 'Smart Trainer' },
  { value: 'Power Meter', label: 'Wattmessgerät' },
  { value: 'Heart Rate Monitor', label: 'Pulsgurt' },
];
