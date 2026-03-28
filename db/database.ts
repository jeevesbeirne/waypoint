import { Platform } from 'react-native';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

// Web stub — in-memory data with localStorage persistence

const WEB_STORE_KEY = 'waypoint_webStore';

function buildDefaultWebStore(): Record<string, any[]> {
  return {
    settings: [],
    people: [],
    meetings: [],
    meeting_people: [],
    meeting_actions: [],
    checklist_items: [],
    daily_logs: [],
    weekly_reviews: [],
    diagnostic_notes: [],
    stars_assessment: [],
    strategy_vision: [],
    strategies: [],
    alignment_scores: [],
    early_wins: [],
    conversation_notes: [],
    assessment_criteria: [],
    assessment_scores: [],
    checklist_meta: [],
  };
}

function loadWebStore(): Record<string, any[]> {
  try {
    const saved = localStorage.getItem(WEB_STORE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure any new tables exist
      const defaults = buildDefaultWebStore();
      for (const key of Object.keys(defaults)) {
        if (!(key in parsed)) parsed[key] = defaults[key];
      }
      return parsed;
    }
  } catch (_) { /* ignore parse errors */ }
  return buildDefaultWebStore();
}

function persistWebStore() {
  try {
    localStorage.setItem(WEB_STORE_KEY, JSON.stringify(webStore));
  } catch (_) { /* ignore quota errors */ }
}

const webStore: Record<string, any[]> = typeof window !== 'undefined' && typeof localStorage !== 'undefined'
  ? loadWebStore()
  : buildDefaultWebStore();

function createWebStub() {
  return {
    _isWebStub: true,
    execAsync: async (sql: string) => {
      // Split multi-statement SQL by semicolons and execute each
      const statements = sql.split(';').map((s) => s.trim()).filter((s) => s.length > 0);
      for (const stmt of statements) {
        const upper = stmt.toUpperCase();
        if (upper.startsWith('DELETE')) {
          const tableMatch = stmt.match(/DELETE\s+FROM\s+(\w+)/i);
          if (tableMatch) {
            const table = tableMatch[1];
            if (webStore[table]) {
              const whereMatch = stmt.match(/WHERE\s+(.*)/i);
              if (whereMatch) {
                const whereClause = whereMatch[1];
                // Split by OR first, then AND within each OR group
                const orGroups = whereClause.split(/\s+OR\s+/i);
                webStore[table] = webStore[table].filter((row) => {
                  // Row is deleted if ANY OR group matches
                  const shouldDelete = orGroups.some((group) => {
                    const andConditions = group.split(/\s+AND\s+/i);
                    return andConditions.every((cond) => {
                      cond = cond.trim();
                      // Handle IS NULL
                      const isNullMatch = cond.match(/(\w+)\s+IS\s+NULL/i);
                      if (isNullMatch) {
                        return row[isNullMatch[1].trim()] == null;
                      }
                      // Handle IS NOT NULL
                      const isNotNullMatch = cond.match(/(\w+)\s+IS\s+NOT\s+NULL/i);
                      if (isNotNullMatch) {
                        return row[isNotNullMatch[1].trim()] != null;
                      }
                      // Handle = comparison
                      const eqMatch = cond.match(/(\w+)\s*=\s*(.+)/);
                      if (eqMatch) {
                        const col = eqMatch[1].trim();
                        let val: any = eqMatch[2].trim();
                        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                        else if (val.toUpperCase() === 'NULL') val = null;
                        else if (!isNaN(Number(val))) val = Number(val);
                        return row[col] == val;
                      }
                      return false;
                    });
                  });
                  return !shouldDelete;
                });
              } else {
                // No WHERE — delete all rows
                webStore[table] = [];
              }
              persistWebStore();
            }
          }
        } else if (upper.startsWith('CREATE TABLE')) {
          const tableMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
          if (tableMatch) {
            const table = tableMatch[1];
            if (!webStore[table]) {
              webStore[table] = [];
            }
          }
        } else if (upper.startsWith('INSERT')) {
          // Delegate to runAsync for INSERT
          const tableMatch = stmt.match(/INSERT\s+(?:OR\s+\w+\s+)?INTO\s+(\w+)/i);
          if (tableMatch) {
            const mapped = mapInsertParams(stmt, []);
            const table = tableMatch[1];
            if (!webStore[table]) webStore[table] = [];
            webStore[table].push(mapped);
            persistWebStore();
          }
        } else if (upper.startsWith('UPDATE')) {
          // Basic UPDATE with literal values
          const tableMatch = stmt.match(/UPDATE\s+(\w+)\s+SET\s+/i);
          if (tableMatch) {
            const table = tableMatch[1];
            if (!webStore[table]) webStore[table] = [];
            const setClause = stmt.match(/SET\s+(.*?)(?:\s+WHERE\s+|$)/is);
            if (setClause) {
              const setPairs = setClause[1].split(',').map((c) => c.trim());
              const updates: Record<string, any> = {};
              for (const pair of setPairs) {
                const [col, ...rest] = pair.split('=');
                let val: any = rest.join('=').trim();
                if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                else if (val.toUpperCase() === 'NULL') val = null;
                else if (val === '?') continue; // skip parameterized (no params in execAsync)
                else if (!isNaN(Number(val))) val = Number(val);
                updates[col.trim()] = val;
              }
              const whereMatch = stmt.match(/WHERE\s+(.*)/i);
              for (const row of webStore[table]) {
                let match = true;
                if (whereMatch) {
                  const conditions = whereMatch[1].split(/\s+AND\s+/i);
                  match = conditions.every((cond) => {
                    const eqMatch = cond.match(/(\w+)\s*=\s*(.+)/);
                    if (eqMatch) {
                      let val: any = eqMatch[2].trim();
                      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                      else if (!isNaN(Number(val))) val = Number(val);
                      return row[eqMatch[1].trim()] == val;
                    }
                    return false;
                  });
                }
                if (match) Object.assign(row, updates);
              }
              persistWebStore();
            }
          }
        }
        // PRAGMA and other statements are silently ignored (safe for web)
      }
    },
    getFirstAsync: async <T>(sql: string, params?: any[]): Promise<T | null> => {
      if (sql.includes('FROM settings')) return (webStore.settings[0] as T) ?? null;
      if (sql.includes('FROM people') && params) {
        return webStore.people.find((p) => p.id === params[0]) as T ?? null;
      }
      if (sql.includes('FROM daily_logs') && params) {
        return webStore.daily_logs.find((l) => l.date === params[0]) as T ?? null;
      }
      if (sql.includes('COUNT(*)')) {
        const countTableMatch = sql.match(/FROM\s+(\w+)/i);
        if (countTableMatch && webStore[countTableMatch[1]]) {
          const countTable = countTableMatch[1];
          let rows = webStore[countTable];
          // Apply WHERE filter if params provided
          if (params && params.length > 0) {
            const whereMatch = sql.match(/WHERE\s+(.*)/i);
            if (whereMatch) {
              const whereCols = [...whereMatch[1].matchAll(/(\w+)\s*=\s*\?/g)].map((m) => m[1]);
              rows = rows.filter((row) => whereCols.every((col, i) => row[col] == params[i]));
            }
          }
          return ({ n: rows.length } as unknown as T);
        }
        return ({ n: 0 } as unknown as T);
      }
      // Generic fallback: search all webStore tables for FROM <table> pattern
      const fromMatch = sql.match(/FROM\s+(\w+)/i);
      if (fromMatch) {
        const table = fromMatch[1];
        if (webStore[table]) {
          return (webStore[table][0] as T) ?? null;
        }
      }
      return null;
    },
    getAllAsync: async <T>(sql: string, params?: any[]): Promise<T[]> => {
      if (sql.includes('FROM people')) return webStore.people as T[];
      if (sql.includes('FROM checklist_items')) return webStore.checklist_items as T[];
      if (sql.includes('FROM meetings') && params) {
        return webStore.meetings.filter((m) => m.person_id === params[0]) as T[];
      }
      if (sql.includes('FROM daily_logs')) return webStore.daily_logs as T[];

      // Handle assessment_criteria with LEFT JOIN assessment_scores
      if (sql.includes('FROM assessment_criteria') && params && params.length > 0) {
        const personId = params[0];
        const criteria = (webStore.assessment_criteria || []).filter((c: any) => c.person_id === personId);
        // Sort by sort_order
        criteria.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        if (sql.includes('LEFT JOIN assessment_scores')) {
          // Join with scores
          return criteria.map((c: any) => {
            const score = (webStore.assessment_scores || []).find(
              (s: any) => s.criteria_id === c.id && s.person_id === personId
            );
            return {
              ...c,
              score: score ? score.score : 0,
              score_id: score ? score.id : null,
              score_notes: score ? score.notes : null,
            };
          }) as T[];
        }
        return criteria as T[];
      }
      if (sql.includes('FROM assessment_scores') && params && params.length > 0) {
        return (webStore.assessment_scores || []).filter((s: any) => s.person_id === params[0]) as T[];
      }

      // Generic fallback: extract table from FROM clause
      const fromMatch = sql.match(/FROM\s+(\w+)/i);
      if (fromMatch && webStore[fromMatch[1]]) {
        let rows = webStore[fromMatch[1]];
        if (params && params.length > 0) {
          const whereMatch = sql.match(/WHERE\s+(.*?)(?:\s+ORDER|\s+LIMIT|\s*$)/is);
          if (whereMatch) {
            const whereCols = [...whereMatch[1].matchAll(/(?:\w+\.)?(\w+)\s*=\s*\?/g)].map((m) => m[1]);
            rows = rows.filter((row: any) => whereCols.every((col, i) => row[col] == params[i]));
          }
        }
        return rows as T[];
      }
      return [];
    },
    runAsync: async (sql: string, params?: any[]) => {
      const trimmed = sql.trim();

      if (trimmed.toUpperCase().startsWith('INSERT')) {
        const tableMatch = trimmed.match(/INSERT\s+(?:OR\s+\w+\s+)?INTO\s+(\w+)/i);
        if (tableMatch) {
          const table = tableMatch[1];
          const mapped = params ? mapInsertParams(trimmed, params) : {};
          if (!webStore[table]) webStore[table] = [];
          if (table === 'settings') {
            // Settings is a singleton row
            webStore.settings = [{ id: 1, ...mapped }];
          } else {
            webStore[table].push(mapped);
          }
          persistWebStore();
        }
      } else if (trimmed.toUpperCase().startsWith('UPDATE')) {
        const tableMatch = trimmed.match(/UPDATE\s+(\w+)\s+SET\s+/i);
        if (tableMatch && params) {
          const table = tableMatch[1];
          if (!webStore[table]) webStore[table] = [];

          // Parse SET clause columns
          const setClause = trimmed.match(/SET\s+(.*?)(?:\s+WHERE\s+|$)/is);
          if (setClause) {
            const setCols = setClause[1].split(',').map((c) => c.trim().split(/\s*=\s*/)[0].trim());
            // Check for WHERE clause
            const whereMatch = trimmed.match(/WHERE\s+(.*)/i);
            let whereCols: string[] = [];
            if (whereMatch) {
              // Extract column names from WHERE: "col = ?" or "col = ? AND col2 = ?"
              whereCols = [...whereMatch[1].matchAll(/(\w+)\s*=\s*\?/g)].map((m) => m[1]);
            }

            // params = SET values first, then WHERE values
            const setValues = params.slice(0, setCols.length);
            const whereValues = params.slice(setCols.length);

            const updates: Record<string, any> = {};
            setCols.forEach((col, i) => { updates[col] = setValues[i]; });

            // Find matching rows
            const rows = webStore[table];
            for (const row of rows) {
              let match = true;
              if (whereCols.length > 0) {
                match = whereCols.every((col, i) => row[col] == whereValues[i]);
              }
              if (match) {
                Object.assign(row, updates);
              }
            }
            persistWebStore();
          }
        }
      } else if (trimmed.toUpperCase().startsWith('DELETE')) {
        const tableMatch = trimmed.match(/DELETE\s+FROM\s+(\w+)/i);
        if (tableMatch && params) {
          const table = tableMatch[1];
          if (webStore[table]) {
            const whereMatch = trimmed.match(/WHERE\s+(.*)/i);
            if (whereMatch) {
              const whereCols = [...whereMatch[1].matchAll(/(\w+)\s*=\s*\?/g)].map((m) => m[1]);
              webStore[table] = webStore[table].filter((row) => {
                return !whereCols.every((col, i) => row[col] == params[i]);
              });
              persistWebStore();
            }
          }
        }
      }
    },
  };
}

function mapInsertParams(sql: string, params: any[]): Record<string, any> {
  const result: Record<string, any> = {};
  const colMatch = sql.match(/\(([^)]+)\)\s+VALUES\s*\(([^)]+)\)/i);
  if (colMatch) {
    const cols = colMatch[1].split(',').map((c) => c.trim());
    const valuePlaceholders = colMatch[2].split(',').map((v) => v.trim());
    let paramIndex = 0;
    cols.forEach((col, i) => {
      const placeholder = valuePlaceholders[i];
      if (placeholder === '?') {
        result[col] = params[paramIndex++];
      } else {
        // Literal value — parse it
        const num = Number(placeholder);
        if (!isNaN(num)) {
          result[col] = num;
        } else if (placeholder.startsWith("'") && placeholder.endsWith("'")) {
          result[col] = placeholder.slice(1, -1);
        } else if (placeholder.toUpperCase() === 'NULL') {
          result[col] = null;
        } else {
          result[col] = placeholder;
        }
      }
    });
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
