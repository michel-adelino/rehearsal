import { Dancer } from './dancer';

export type { Dancer };

export interface Teacher {
  id: string;
  name: string;
  email?: string;
}

export interface Genre {
  id: string;
  name: string;
}

export interface Level {
  id: string;
  name: string;
  color: string;
}

export interface Routine {
  id: string;
  songTitle: string;
  dancers: Dancer[];
  teacher: Teacher;
  genre: Genre;
  level?: Level;
  duration: number; // in minutes
  notes?: string;
  scheduledHours: number; // total hours scheduled
  color: string; // for calendar display
  isInactive?: boolean; // manually marked as inactive
}

export interface RoutineDetails {
  id: string;
  songTitle: string;
  dancers: Dancer[];
  teacher: Teacher;
  genre: Genre;
  duration: number;
  level?: Level;
  notes: string;
}
