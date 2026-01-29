
import { TrainingGoal, FitnessLevel, Equipment, Gender } from './types.ts';

export const GOAL_OPTIONS: { value: TrainingGoal; label: string; icon: string }[] = [
  { value: 'Gran Fondo', label: 'Gran Fondo / Langstrecke', icon: 'fa-route' },
  { value: 'Kriterium', label: 'Kriterium & Kurzdistanz', icon: 'fa-gauge-high' },
  { value: 'Fitness', label: 'Fitness & Gewichtsmanagement', icon: 'fa-heart-pulse' },
  { value: 'All-round', label: 'All-round / FTP-Boost', icon: 'fa-rocket' },
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

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'männlich', label: 'Männlich' },
  { value: 'weiblich', label: 'Weiblich' },
  { value: 'keine Angabe', label: 'Keine Angabe' },
];
