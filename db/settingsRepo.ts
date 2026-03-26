import { getDb } from './database';

export interface Settings {
  id?: number;
  name: string;
  role_title: string;
  org_name: string;
  start_date: string | null;
  leader_level: 'ic' | 'team_lead' | 'manager' | 'director' | 'executive';
  transition_summary: string;
  onboarding_complete: number;
  created_at?: string;
  updated_at?: string;
}

export async function getSettings(): Promise<Settings | null> {
  const db = await getDb();
  return (await db.getFirstAsync('SELECT * FROM settings WHERE id = 1')) as Settings | null;
}

export async function saveSettings(s: Partial<Settings>): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await getSettings();
  if (existing) {
    const fields = Object.keys(s)
      .filter(k => k !== 'id')
      .map(k => `${k} = ?`)
      .join(', ');
    const vals = [...Object.values(s).filter((_, i) => Object.keys(s)[i] !== 'id'), now, 1];
    if (fields) {
      await db.runAsync(`UPDATE settings SET ${fields}, updated_at = ? WHERE id = ?`, vals);
    }
  } else {
    await db.runAsync(
      `INSERT INTO settings (id, name, role_title, org_name, start_date, leader_level, transition_summary, onboarding_complete, created_at, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s.name ?? '',
        s.role_title ?? '',
        s.org_name ?? '',
        s.start_date ?? null,
        s.leader_level ?? 'manager',
        s.transition_summary ?? '',
        s.onboarding_complete ?? 0,
        now,
        now,
      ]
    );
  }
}
