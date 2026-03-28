import { getDb } from './database';
import { uuid } from '../lib/utils';

export interface DiagnosticNote {
  id: string;
  type: string; // 'swot_strength' | 'swot_weakness' | 'swot_opportunity' | 'swot_threat' | 'porter_rivalry' | 'porter_new_entrants' | 'porter_substitutes' | 'porter_suppliers' | 'porter_buyers' | 'stars' | 'general'
  content: string;
  source?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface StarsAssessment {
  id: string;
  startup_pct: number;
  turnaround_pct: number;
  accelerated_growth_pct: number;
  realignment_pct: number;
  sustaining_pct: number;
  notes?: string | null;
  updated_at?: string | null;
}

export async function initDiagnosticsTables(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS diagnostic_notes (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      source TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS stars_assessment (
      id TEXT PRIMARY KEY,
      startup_pct INTEGER DEFAULT 0,
      turnaround_pct INTEGER DEFAULT 0,
      accelerated_growth_pct INTEGER DEFAULT 0,
      realignment_pct INTEGER DEFAULT 0,
      sustaining_pct INTEGER DEFAULT 0,
      notes TEXT,
      updated_at TEXT
    );
  `);
}

export async function getDiagnosticNotes(type?: string): Promise<DiagnosticNote[]> {
  const db = await getDb();
  await initDiagnosticsTables();
  if (type) {
    return (await db.getAllAsync(
      'SELECT * FROM diagnostic_notes WHERE type = ? ORDER BY created_at DESC',
      [type]
    )) as DiagnosticNote[];
  }
  return (await db.getAllAsync(
    'SELECT * FROM diagnostic_notes ORDER BY created_at DESC'
  )) as DiagnosticNote[];
}

export async function getDiagnosticNotesByPrefix(prefix: string): Promise<DiagnosticNote[]> {
  const db = await getDb();
  await initDiagnosticsTables();
  return (await db.getAllAsync(
    "SELECT * FROM diagnostic_notes WHERE type LIKE ? ORDER BY created_at DESC",
    [prefix + '%']
  )) as DiagnosticNote[];
}

export async function saveDiagnosticNote(note: Partial<DiagnosticNote> & { type: string; content: string }): Promise<DiagnosticNote> {
  const db = await getDb();
  await initDiagnosticsTables();
  const now = new Date().toISOString();
  if (note.id) {
    await db.runAsync(
      'UPDATE diagnostic_notes SET content = ?, source = ?, updated_at = ? WHERE id = ?',
      [note.content, note.source ?? null, now, note.id]
    );
    return { ...note, updated_at: now } as DiagnosticNote;
  }
  const id = uuid();
  await db.runAsync(
    'INSERT INTO diagnostic_notes (id, type, content, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [id, note.type, note.content, note.source ?? null, now, now]
  );
  return { id, type: note.type, content: note.content, source: note.source ?? null, created_at: now, updated_at: now };
}

export async function deleteDiagnosticNote(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM diagnostic_notes WHERE id = ?', [id]);
}

export async function getStarsAssessment(): Promise<StarsAssessment | null> {
  const db = await getDb();
  await initDiagnosticsTables();
  return (await db.getFirstAsync('SELECT * FROM stars_assessment LIMIT 1')) as StarsAssessment | null;
}

export async function saveStarsAssessment(data: Partial<StarsAssessment>): Promise<StarsAssessment> {
  const db = await getDb();
  await initDiagnosticsTables();
  const now = new Date().toISOString();
  const existing = await getStarsAssessment();
  if (existing) {
    await db.runAsync(
      'UPDATE stars_assessment SET startup_pct = ?, turnaround_pct = ?, accelerated_growth_pct = ?, realignment_pct = ?, sustaining_pct = ?, notes = ?, updated_at = ? WHERE id = ?',
      [
        data.startup_pct ?? existing.startup_pct,
        data.turnaround_pct ?? existing.turnaround_pct,
        data.accelerated_growth_pct ?? existing.accelerated_growth_pct,
        data.realignment_pct ?? existing.realignment_pct,
        data.sustaining_pct ?? existing.sustaining_pct,
        data.notes ?? existing.notes ?? null,
        now,
        existing.id,
      ]
    );
    return { ...existing, ...data, updated_at: now };
  }
  const id = uuid();
  const result: StarsAssessment = {
    id,
    startup_pct: data.startup_pct ?? 0,
    turnaround_pct: data.turnaround_pct ?? 0,
    accelerated_growth_pct: data.accelerated_growth_pct ?? 0,
    realignment_pct: data.realignment_pct ?? 0,
    sustaining_pct: data.sustaining_pct ?? 0,
    notes: data.notes ?? null,
    updated_at: now,
  };
  await db.runAsync(
    'INSERT INTO stars_assessment (id, startup_pct, turnaround_pct, accelerated_growth_pct, realignment_pct, sustaining_pct, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, result.startup_pct, result.turnaround_pct, result.accelerated_growth_pct, result.realignment_pct, result.sustaining_pct, result.notes ?? null, now]
  );
  return result;
}
