import { Platform } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

// Web stub — in-memory data
// Pre-populate checklist items for web demo
import { CHECKLIST_ITEMS } from '../lib/checklistContent';
const now = new Date().toISOString();
const webStore: Record<string, any[]> = {
  settings: [],
  people: [],
  meetings: [],
  meeting_people: [],
  meeting_actions: [],
  checklist_items: CHECKLIST_ITEMS.map((item) => ({
    ...item,
    default_week: item.default_week,
    default_day: item.default_day ?? null,
    start_week: item.start_week ?? item.default_week,
    end_week: item.end_week ?? item.default_week,
    task_status: 'todo',
    parent_id: item.parent_id ?? null,
    depth: item.depth ?? 0,
    watkins_groups: item.watkins_groups ? JSON.stringify(item.watkins_groups) : null,
    sub_activity: item.sub_activity ?? null,
    task_group: null,
    is_user_task: 0,
    relevant_levels: JSON.stringify(item.relevant_levels ?? []),
    completed: 0,
    completed_date: null,
    scheduled_week: null,
    linked_person_id: null,
    linked_article_id: null,
    custom_note: null,
    created_at: now,
  })),
  daily_logs: [],
  weekly_reviews: [],
  diagnostic_notes: [],
  stars_assessment: [],
  strategy_vision: [],
  strategies: [],
  alignment_scores: [],
  early_wins: [],
};

function createWebStub() {
  return {
    _isWebStub: true,
    execAsync: async (_sql: string) => {},
    getFirstAsync: async <T>(sql: string, params?: any[]): Promise<T | null> => {
      if (sql.includes('FROM settings')) return (webStore.settings[0] as T) ?? null;
      if (sql.includes('FROM people') && params) {
        return webStore.people.find((p) => p.id === params[0]) as T ?? null;
      }
      if (sql.includes('FROM daily_logs') && params) {
        return webStore.daily_logs.find((l) => l.date === params[0]) as T ?? null;
      }
      if (sql.includes('COUNT(*)') && sql.includes('checklist_items')) return ({ n: webStore.checklist_items.length } as unknown as T);
      if (sql.includes('COUNT(*)')) return ({ n: 0 } as unknown as T);
      return null;
    },
    getAllAsync: async <T>(sql: string, params?: any[]): Promise<T[]> => {
      if (sql.includes('FROM people')) return webStore.people as T[];
      if (sql.includes('FROM checklist_items')) return webStore.checklist_items as T[];
      if (sql.includes('FROM meetings') && params) {
        return webStore.meetings.filter((m) => m.person_id === params[0]) as T[];
      }
      if (sql.includes('FROM daily_logs')) return webStore.daily_logs as T[];
      return [];
    },
    runAsync: async (sql: string, params?: any[]) => {
      // Basic web stub — handle INSERT/UPDATE for demo purposes
      if (sql.startsWith('INSERT INTO settings')) {
        webStore.settings = [{ id: 1, ...(params ? mapInsertParams(sql, params) : {}) }];
      } else if (sql.startsWith('UPDATE settings')) {
        if (webStore.settings[0]) {
          Object.assign(webStore.settings[0], params ? {} : {});
        }
      }
    },
  };
}

function mapInsertParams(sql: string, params: any[]): Record<string, any> {
  const result: Record<string, any> = {};
  const colMatch = sql.match(/\(([^)]+)\)\s+VALUES/);
  if (colMatch) {
    const cols = colMatch[1].split(',').map((c) => c.trim());
    cols.forEach((col, i) => { result[col] = params[i]; });
  }
  return result;
}

export async function getDb(): Promise<any> {
  if (db) return db;

  if (Platform.OS === 'web') {
    db = createWebStub();
    return db;
  }

  // Native: use expo-sqlite
  // Dynamic import to avoid web bundling issues
  const SQLite = require('expo-sqlite');
  db = await SQLite.openDatabaseAsync('waypoint_v2.db');
  await initSchema(db);
  return db;
}

async function initSchema(database: any) {
  await database.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      name TEXT,
      role_title TEXT,
      org_name TEXT,
      start_date TEXT,
      leader_level TEXT DEFAULT 'manager',
      transition_summary TEXT,
      onboarding_complete INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT,
      organisation TEXT,
      category TEXT DEFAULT 'other',
      notes TEXT,
      influence TEXT DEFAULT 'medium',
      alignment TEXT DEFAULT 'neutral',
      is_key_stakeholder INTEGER DEFAULT 0,
      relationship_quality INTEGER DEFAULT 3,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS meetings (
      id TEXT PRIMARY KEY,
      person_id TEXT REFERENCES people(id),
      date TEXT NOT NULL,
      title TEXT,
      meeting_type TEXT,
      notes TEXT,
      bullets TEXT,
      created_at TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS meeting_people (
      meeting_id TEXT NOT NULL,
      person_id TEXT NOT NULL,
      PRIMARY KEY (meeting_id, person_id),
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meeting_actions (
      id TEXT PRIMARY KEY,
      meeting_id TEXT NOT NULL,
      text TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      added_to_checklist INTEGER DEFAULT 0,
      checklist_item_id TEXT,
      checklist_task_id TEXT,
      created_at TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS checklist_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      detail TEXT,
      phase INTEGER,
      default_week INTEGER,
      default_day INTEGER,
      category TEXT,
      priority TEXT DEFAULT 'normal',
      completed INTEGER DEFAULT 0,
      completed_date TEXT,
      scheduled_week INTEGER,
      linked_person_id TEXT REFERENCES people(id),
      linked_article_id TEXT,
      custom_note TEXT,
      relevant_levels TEXT,
      is_from_meeting INTEGER DEFAULT 0,
      source_meeting_id TEXT,
      source_log_date TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_logs (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      prompt_text TEXT,
      response TEXT,
      wins TEXT,
      challenges TEXT,
      energy INTEGER,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS weekly_reviews (
      id TEXT PRIMARY KEY,
      week_number INTEGER,
      date_start TEXT,
      responses TEXT,
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS conversation_notes (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      conversation_type TEXT NOT NULL,
      note_text TEXT NOT NULL,
      note_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment_criteria (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      max_weight INTEGER NOT NULL DEFAULT 17,
      min_threshold INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment_scores (
      id TEXT PRIMARY KEY,
      person_id TEXT NOT NULL,
      criteria_id TEXT NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      last_updated TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
      FOREIGN KEY (criteria_id) REFERENCES assessment_criteria(id) ON DELETE CASCADE
    );
  `);

  // V4 migrations — meeting cross-reference flags
  const v4Migrations = [
    'ALTER TABLE meetings ADD COLUMN has_diagnostic INTEGER DEFAULT 0',
    'ALTER TABLE meetings ADD COLUMN diagnostic_type TEXT',
    'ALTER TABLE meetings ADD COLUMN has_strategy INTEGER DEFAULT 0',
    'ALTER TABLE meetings ADD COLUMN has_early_win INTEGER DEFAULT 0',
  ];

  for (const sql of v4Migrations) {
    try { await database.execAsync(sql); } catch (_) { /* column already exists */ }
  }

  // V3 migrations — add after existing schema creation
  const v3Migrations = [
    'ALTER TABLE checklist_items ADD COLUMN start_week INTEGER',
    'ALTER TABLE checklist_items ADD COLUMN end_week INTEGER',
    'ALTER TABLE checklist_items ADD COLUMN task_status TEXT DEFAULT "todo"',
    'ALTER TABLE checklist_items ADD COLUMN parent_id TEXT',
    'ALTER TABLE checklist_items ADD COLUMN depth INTEGER DEFAULT 0',
    'ALTER TABLE checklist_items ADD COLUMN watkins_groups TEXT',
    'ALTER TABLE checklist_items ADD COLUMN sub_activity TEXT',
    'ALTER TABLE checklist_items ADD COLUMN task_group TEXT',
  ];

  for (const sql of v3Migrations) {
    try { await database.execAsync(sql); } catch (_) { /* column already exists */ }
  }

  // Backfill
  await database.execAsync('UPDATE checklist_items SET start_week = default_week WHERE start_week IS NULL');
  await database.execAsync('UPDATE checklist_items SET end_week = default_week WHERE end_week IS NULL');
}
