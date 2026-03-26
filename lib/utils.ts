import { differenceInCalendarDays, addDays, format, parseISO } from 'date-fns';
import type { PhaseKey } from './theme';

export function getDayNumber(startDate: string | null | undefined): number {
  if (!startDate) return 1;
  try {
    const start = parseISO(startDate);
    const today = new Date();
    const diff = differenceInCalendarDays(today, start) + 1;
    return Math.max(1, Math.min(90, diff));
  } catch {
    return 1;
  }
}

export function getPhase(dayNumber: number): PhaseKey {
  if (dayNumber <= 30) return 'learn';
  if (dayNumber <= 60) return 'build';
  return 'deliver';
}

export function getPhaseNumber(dayNumber: number): 1 | 2 | 3 {
  if (dayNumber <= 30) return 1;
  if (dayNumber <= 60) return 2;
  return 3;
}

export function getWeekNumber(dayNumber: number): number {
  return Math.min(13, Math.ceil(dayNumber / 7));
}

export function formatDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'd MMM');
  } catch {
    return dateStr;
  }
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getMilestoneDate(startDate: string, day: number): Date {
  return addDays(parseISO(startDate), day - 1);
}

export function getWeekDateRange(startDate: string, weekNum: number): string {
  try {
    const start = parseISO(startDate);
    const weekStart = addDays(start, (weekNum - 1) * 7);
    const weekEnd = addDays(weekStart, 6);
    return `${format(weekStart, 'd MMM')} – ${format(weekEnd, 'd MMM')}`;
  } catch {
    return `Week ${weekNum}`;
  }
}

export function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function uuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
