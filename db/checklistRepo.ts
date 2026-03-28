import { getDb } from './database';
import { CHECKLIST_ITEMS } from '../lib/checklistContent';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  detail: string;
  phase: 1 | 2 | 3;
  default_week: number;
  default_day?: number;
  category: string;
  priority: 'critical' | 'high' | 'normal';
  completed: number;
  completed_date?: string;
  scheduled_week?: number;
  linked_person_id?: string;
  linked_article_id?: string;
  custom_note?: string;
  relevant_levels?: string;
  is_from_meeting?: number;
  source_meeting_id?: string | null;
  source_log_date?: string | null;
  created_at: string;
  is_user_task?: number;
  start_week?: number;
  end_week?: number;
  task_status?: 'todo' | 'in-progress' | 'complete';
  parent_id?: string | null;
  depth?: number;
  watkins_groups?: string | null; // JSON array string
  sub_activity?: string | null;
  task_group?: string | null;
}

// Bump this version whenever CHECKLIST_ITEMS changes to force a re-seed on device
const CHECKLIST_DATA_VERSION = 6;

export async function seedChecklistIfEmpty(): Promise<void> {
  const db = await getDb();

  // Check if we need to re-seed due to data version change
  try {
    await db.execAsync('CREATE TABLE IF NOT EXISTS checklist_meta (key TEXT PRIMARY KEY, value TEXT)');
    const versionRow = (await db.getFirstAsync('SELECT value FROM checklist_meta WHERE key = ?', ['data_version'])) as { value: string } | null;
    const currentVersion = versionRow ? parseInt(versionRow.value, 10) : 0;

    if (currentVersion >= CHECKLIST_DATA_VERSION) {
      // Already on latest version, check if DB has items
      const count = (await db.getFirstAsync('SELECT COUNT(*) as n FROM checklist_items')) as { n: number } | null;
      if (count && count.n > 0) return;
    }

    // Need to re-seed: clear old prescribed tasks (keep user-created ones)
    await db.execAsync('DELETE FROM checklist_items WHERE is_user_task = 0 OR is_user_task IS NULL');
    await db.runAsync(
      'INSERT OR REPLACE INTO checklist_meta (key, value) VALUES (?, ?)',
      ['data_version', String(CHECKLIST_DATA_VERSION)]
    );
  } catch (e) {
    // First run — no meta table yet, proceed with seeding
    const count = (await db.getFirstAsync('SELECT COUNT(*) as n FROM checklist_items')) as { n: number } | null;
    if (count && count.n > 0) {
      // Old data without versioning — clear and re-seed
      await db.execAsync('DELETE FROM checklist_items');
      try {
        await db.execAsync('CREATE TABLE IF NOT EXISTS checklist_meta (key TEXT PRIMARY KEY, value TEXT)');
        await db.runAsync('INSERT OR REPLACE INTO checklist_meta (key, value) VALUES (?, ?)', ['data_version', String(CHECKLIST_DATA_VERSION)]);
      } catch (_) {}
    }
  }
  const now = new Date().toISOString();
  for (const item of CHECKLIST_ITEMS) {
    await db.runAsync(
      `INSERT INTO checklist_items (id, title, description, detail, phase, default_week, default_day, category, priority, completed, relevant_levels, created_at, start_week, end_week, parent_id, depth, watkins_groups, sub_activity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.title,
        item.description,
        item.detail,
        item.phase,
        item.default_week,
        item.default_day ?? null,
        item.category,
        item.priority,
        JSON.stringify(item.relevant_levels ?? []),
        now,
        item.start_week,
        item.end_week,
        item.parent_id ?? null,
        item.depth,
        JSON.stringify(item.watkins_groups),
        item.sub_activity ?? null,
      ]
    );
  }
}

export async function getChecklistItems(): Promise<ChecklistItem[]> {
  const db = await getDb();
  return (await db.getAllAsync(
    'SELECT * FROM checklist_items ORDER BY default_week ASC, phase ASC'
  )) as ChecklistItem[];
}

export async function toggleChecklistItem(id: string, completed: boolean): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE checklist_items SET completed = ?, completed_date = ? WHERE id = ?',
    [completed ? 1 : 0, completed ? now : null, id]
  );
}

export async function updateChecklistItem(id: string, updates: Partial<ChecklistItem>): Promise<void> {
  const db = await getDb();
  const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  if (!fields) return;
  await db.runAsync(
    `UPDATE checklist_items SET ${fields} WHERE id = ?`,
    [...Object.values(updates), id]
  );
}

export async function addCustomChecklistItem(item: {
  title: string;
  description?: string;
  category: string;
  week: number;
  start_week?: number;
  end_week?: number;
  parent_id?: string | null;
  depth?: number;
  watkins_groups?: string[];
  sub_activity?: string | null;
  due_date?: string;
  source_meeting_id?: string;
  source_log_date?: string;
}): Promise<ChecklistItem> {
  const db = await getDb();
  const now = new Date().toISOString();
  const { uuid } = await import('../lib/utils');
  const id = uuid();
  const startWeek = item.start_week ?? item.week;
  const endWeek = item.end_week ?? startWeek;
  const phase: 1 | 2 | 3 = startWeek <= 4 ? 1 : startWeek <= 8 ? 2 : 3;
  await db.runAsync(
    `INSERT INTO checklist_items (id, title, description, detail, phase, default_week, category, priority, completed,
      relevant_levels, is_from_meeting, source_meeting_id, source_log_date, created_at, is_user_task,
      start_week, end_week, parent_id, depth, watkins_groups, sub_activity)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'normal', 0, '[]', ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      item.title,
      item.description ?? '',
      '',
      phase,
      startWeek,
      item.category,
      item.source_meeting_id ? 1 : (item.source_log_date ? 1 : 0),
      item.source_meeting_id ?? null,
      item.source_log_date ?? null,
      now,
      startWeek,
      endWeek,
      item.parent_id ?? null,
      item.depth ?? (item.parent_id ? 1 : 0),
      JSON.stringify(item.watkins_groups ?? []),
      item.sub_activity ?? null,
    ]
  );
  return {
    id,
    title: item.title,
    description: item.description ?? '',
    detail: '',
    phase,
    default_week: startWeek,
    category: item.category,
    priority: 'normal',
    completed: 0,
    relevant_levels: '[]',
    is_from_meeting: item.source_meeting_id ? 1 : 0,
    source_meeting_id: item.source_meeting_id ?? null,
    source_log_date: item.source_log_date ?? null,
    created_at: now,
    is_user_task: 1,
    start_week: startWeek,
    end_week: endWeek,
    parent_id: item.parent_id ?? null,
    depth: item.depth ?? (item.parent_id ? 1 : 0),
    watkins_groups: JSON.stringify(item.watkins_groups ?? []),
    sub_activity: item.sub_activity ?? null,
  };
}

export async function moveChecklistItemToWeek(id: string, week: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE checklist_items SET scheduled_week = ?, start_week = ?, end_week = ? WHERE id = ?',
    [week, week, week, id]
  );
}

export async function moveChecklistItem(id: string, startWeek: number, endWeek: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE checklist_items SET start_week = ?, end_week = ?, scheduled_week = ? WHERE id = ?',
    [startWeek, endWeek, startWeek, id]
  );
}

export async function getChildTasks(parentId: string): Promise<ChecklistItem[]> {
  const db = await getDb();
  return (await db.getAllAsync(
    'SELECT * FROM checklist_items WHERE parent_id = ? ORDER BY start_week ASC, depth ASC',
    [parentId]
  )) as ChecklistItem[];
}

export async function updateChecklistItemFields(id: string, fields: Record<string, any>): Promise<void> {
  const db = await getDb();
  const keys = Object.keys(fields);
  if (keys.length === 0) return;
  const sets = keys.map((k) => `${k} = ?`).join(', ');
  await db.runAsync(`UPDATE checklist_items SET ${sets} WHERE id = ?`, [...Object.values(fields), id]);
}

export async function moveChecklistItemToWeekLegacy(id: string, week: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE checklist_items SET scheduled_week = ? WHERE id = ?',
    [week, id]
  );
}
