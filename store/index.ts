import { create } from 'zustand';
import type { Settings } from '../db/settingsRepo';
import type { Person } from '../db/peopleRepo';
import type { ChecklistItem } from '../db/checklistRepo';

interface AppState {
  settings: Settings | null;
  setSettings: (s: Settings | null) => void;

  people: Person[];
  setPeople: (p: Person[]) => void;

  checklistItems: ChecklistItem[];
  setChecklistItems: (items: ChecklistItem[]) => void;

  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  dayNumber: number;
  setDayNumber: (d: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  settings: null,
  setSettings: (settings) => set({ settings }),

  people: [],
  setPeople: (people) => set({ people }),

  checklistItems: [],
  setChecklistItems: (checklistItems) => set({ checklistItems }),

  isLoading: true,
  setLoading: (isLoading) => set({ isLoading }),

  dayNumber: 1,
  setDayNumber: (dayNumber) => set({ dayNumber }),
}));
