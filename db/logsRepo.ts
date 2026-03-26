import { getDb } from './database';
import { uuid } from '../lib/utils';

export interface DailyLog {
  id: string;
  date: string;
  prompt_text?: string;
  response?: string;
  wins?: string;
  challenges?: string;
  energy?: number;
  created_at: string;
}

export async function getLogForDate(date: string): Promise<DailyLog | null> {
  const db = await getDb();
  return (await db.getFirstAsync('SELECT * FROM daily_logs WHERE date = ?', [date])) as DailyLog | null;
}

export async function saveLog(log: Partial<DailyLog> & { date: string }): Promise<DailyLog> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await getLogForDate(log.date);
  if (existing) {
    await db.runAsync(
      `UPDATE daily_logs SET prompt_text=?, response=?, wins=?, challenges=?, energy=? WHERE date=?`,
      [
        log.prompt_text ?? existing.prompt_text ?? '',
        log.response ?? existing.response ?? '',
        log.wins ?? existing.wins ?? '[]',
        log.challenges ?? existing.challenges ?? '[]',
        log.energy ?? existing.energy ?? null,
        log.date,
      ]
    );
    return { ...existing, ...log };
  } else {
    const id = uuid();
    await db.runAsync(
      `INSERT INTO daily_logs (id, date, prompt_text, response, wins, challenges, energy, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        log.date,
        log.prompt_text ?? '',
        log.response ?? '',
        log.wins ?? '[]',
        log.challenges ?? '[]',
        log.energy ?? null,
        now,
      ]
    );
    return { ...log, id, created_at: now } as DailyLog;
  }
}

export async function getRecentLogs(limit: number = 7): Promise<DailyLog[]> {
  const db = await getDb();
  return (await db.getAllAsync(
    `SELECT * FROM daily_logs ORDER BY date DESC LIMIT ?`,
    [limit]
  )) as DailyLog[];
}
