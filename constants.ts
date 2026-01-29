
import { TrainingGoal, FitnessLevel, Equipment } from './types.ts';

export const GOAL_OPTIONS: { value: TrainingGoal; label: string; icon: string }[] = [
  { value: 'Gran Fondo', label: 'Gran Fondo / Langstrecke', icon: 'fa-route' },
  { value: 'Kriterium', label: 'Kriterium & Kurzdistanz', icon: 'fa-gauge-high' },
  { value: 'Fitness', label: 'Fitness & Gewichtsmanagement', icon: 'fa-heart-pulse' },
  { value: 'All-round', label: 'All-round / FTP-Boost', icon: 'fa-rocket' },
];

export const LEVEL_OPTIONS: { value: FitnessLevel; label: string; description: string }[] = [
  { value: 'Beginner', label: 'Anfänger', description: '0-3h/Woche, neu im Training.' },
  { value: 'Intermediate', label: 'Fortgeschritten', description: '4-8h/Woche, Intervalle bekannt.' },
  { value: 'Advanced', label: 'Leistungssport', description: '8+ h/Woche, Zonen & TSS Profi.' },
];

export const DAY_OPTIONS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

export const EQUIPMENT_OPTIONS: { value: Equipment; label: string }[] = [
  { value: 'Road Bike', label: 'Rennrad / Gravel' },
  { value: 'Indoor Trainer', label: 'Smart Trainer' },
  { value: 'Power Meter', label: 'Wattmessgerät' },
  { value: 'Heart Rate Monitor', label: 'Pulsgurt' },
];
