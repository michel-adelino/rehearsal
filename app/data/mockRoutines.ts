import { Routine, Teacher, Genre, Level } from '../types/routine';
import { mockDancers } from './mockDancers';

export const mockLevels: Level[] = [
  { id: 'level-1', name: 'Beginner', color: '#3B82F6' }, // Blue
  { id: 'level-2', name: 'Intermediate', color: '#F59E0B' }, // Amber/Orange
  { id: 'level-3', name: 'Advanced', color: '#EF4444' }, // Red
  { id: 'level-4', name: 'Full-Time Dancers', color: '#A78BFA' }, // Purple
  { id: 'level-5', name: 'Part-Time Dancers', color: '#10B981' } // Green
];

export const mockTeachers: Teacher[] = [
  { id: 'teacher-1', name: 'Maria Santos', email: 'maria@studio.com' },
  { id: 'teacher-2', name: 'David Park', email: 'david@studio.com' },
  { id: 'teacher-3', name: 'Lisa Chen', email: 'lisa@studio.com' },
  { id: 'teacher-4', name: 'James Wilson', email: 'james@studio.com' }
];

export const mockGenres: Genre[] = [
  { id: 'genre-1', name: 'Ballet' },
  { id: 'genre-2', name: 'Hip Hop' },
  { id: 'genre-3', name: 'Contemporary' },
  { id: 'genre-4', name: 'Jazz' },
  { id: 'genre-5', name: 'Tap' },
  { id: 'genre-6', name: 'Modern' }
];

export const mockRoutines: Routine[] = [
  {
    id: 'routine-1',
    songTitle: 'Swan Lake Suite',
    dancers: [mockDancers[0], mockDancers[2], mockDancers[6], mockDancers[8]],
    teacher: mockTeachers[0],
    genre: mockGenres[0],
    level: mockLevels[3], // Full-Time Dancers
    duration: 60,
    notes: 'Focus on technique and precision',
    scheduledHours: 0,
    color: mockLevels[3].color
  },
  {
    id: 'routine-2',
    songTitle: 'Urban Beat',
    dancers: [mockDancers[1], mockDancers[3], mockDancers[7]],
    teacher: mockTeachers[1],
    genre: mockGenres[1],
    level: mockLevels[4], // Part-Time Dancers
    duration: 60,
    notes: 'High energy routine',
    scheduledHours: 0,
    color: mockLevels[4].color
  },
  {
    id: 'routine-3',
    songTitle: 'Emotional Journey',
    dancers: [mockDancers[2], mockDancers[5], mockDancers[9]],
    teacher: mockTeachers[2],
    genre: mockGenres[2],
    level: mockLevels[3], // Full-Time Dancers
    duration: 60,
    notes: 'Expressive contemporary piece',
    scheduledHours: 0,
    color: mockLevels[3].color
  },
  {
    id: 'routine-4',
    songTitle: 'Jazz Fusion',
    dancers: [mockDancers[4], mockDancers[6], mockDancers[9]],
    teacher: mockTeachers[3],
    genre: mockGenres[3],
    level: mockLevels[4], // Part-Time Dancers
    duration: 60,
    notes: 'Smooth jazz with modern elements',
    scheduledHours: 0,
    color: mockLevels[4].color
  },
  {
    id: 'routine-5',
    songTitle: 'Tap Rhythm',
    dancers: [mockDancers[4], mockDancers[8]],
    teacher: mockTeachers[0],
    genre: mockGenres[4],
    level: mockLevels[3], // Full-Time Dancers
    duration: 60,
    notes: 'Fast-paced tap routine',
    scheduledHours: 0,
    color: mockLevels[3].color
  },
  {
    id: 'routine-6',
    songTitle: 'Modern Expression',
    dancers: [mockDancers[0], mockDancers[5], mockDancers[6]],
    teacher: mockTeachers[2],
    genre: mockGenres[5],
    level: mockLevels[4], // Part-Time Dancers
    duration: 60,
    notes: 'Abstract modern dance',
    scheduledHours: 0,
    color: mockLevels[4].color
  },
  {
    id: 'routine-7',
    songTitle: 'Street Vibes',
    dancers: [mockDancers[1], mockDancers[3], mockDancers[7]],
    teacher: mockTeachers[1],
    genre: mockGenres[1],
    level: mockLevels[3], // Full-Time Dancers
    duration: 60,
    notes: 'Urban street dance style',
    scheduledHours: 0,
    color: mockLevels[3].color
  },
  {
    id: 'routine-8',
    songTitle: 'Classical Variations',
    dancers: [mockDancers[0], mockDancers[2], mockDancers[8]],
    teacher: mockTeachers[0],
    genre: mockGenres[0],
    level: mockLevels[4], // Part-Time Dancers
    duration: 120,
    notes: 'Traditional ballet variations',
    scheduledHours: 0,
    color: mockLevels[4].color
  }
];
