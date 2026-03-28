import { getDb } from './database';
import { uuid } from '../lib/utils';

export interface StrategyVision {
  id: string;
  type: 'vision' | 'mission';
  content?: string | null;
  updated_at?: string | null;
}

export interface Strategy {
  id: string;
  title: string;
  description?: string | null;
  status: 'draft' | 'in_progress' | 'aligned';
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

export interface AlignmentScore {
  id: string;
  dimension: 'structure' | 'processes' | 'capabilities';
  score: number; // 1-5
  notes?: string | null;
  updated_at?: string | null;
}

export interface StrategyAlignment {
  id: string;
  strategy_id: string;
  dimension: 'structure' | 'processes' | 'capabilities';
  score: number;
  current_state?: string | null;
  changes_needed?: string | null;
  updated_at?: string | null;
}

export interface EarlyWin {
  id: string;
  title: string;
  description?: string | null;
  status: 'identified' | 'pitched' | 'in_progress' | 'delivered' | 'communicated';
  is_visible: number;
  is_team_owned: number;
  addresses_frustration: number;
  connected_to_strategy: number;
  notes?: string | null;
  date_identified?: string | null;
  date_delivered?: string | null;
  created_at?: string;
  updated_at?: string | null;
}

// Vision / Mission
export async function getVisionMission(type: 'vision' | 'mission'): Promise<StrategyVision | null> {
  const db = await getDb();
  return (await db.getFirstAsync('SELECT * FROM strategy_vision WHERE type = ?', [type])) as StrategyVision | null;
}

export async function saveVisionMission(type: 'vision' | 'mission', content: string): Promise<StrategyVision> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = await getVisionMission(type);
  if (existing) {
    await db.runAsync('UPDATE strategy_vision SET content = ?, updated_at = ? WHERE id = ?', [content, now, existing.id]);
    return { ...existing, content, updated_at: now };
  }
  const id = uuid();
  await db.runAsync('INSERT INTO strategy_vision (id, type, content, updated_at) VALUES (?, ?, ?, ?)', [id, type, content, now]);
  return { id, type, content, updated_at: now };
}

// Strategies
export async function getStrategies(): Promise<Strategy[]> {
  const db = await getDb();
  return (await db.getAllAsync('SELECT * FROM strategies ORDER BY created_at DESC')) as Strategy[];
}

export async function saveStrategy(s: Partial<Strategy> & { title: string }): Promise<Strategy> {
  const db = await getDb();
  const now = new Date().toISOString();
  if (s.id) {
    await db.runAsync(
      'UPDATE strategies SET title = ?, description = ?, status = ?, notes = ?, updated_at = ? WHERE id = ?',
      [s.title, s.description ?? null, s.status ?? 'draft', s.notes ?? null, now, s.id]
    );
    return { ...s, updated_at: now } as Strategy;
  }
  const id = uuid();
  await db.runAsync(
    'INSERT INTO strategies (id, title, description, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, s.title, s.description ?? null, s.status ?? 'draft', s.notes ?? null, now, now]
  );
  return { id, title: s.title, description: s.description ?? null, status: (s.status ?? 'draft') as Strategy['status'], notes: s.notes ?? null, created_at: now, updated_at: now };
}

export async function deleteStrategy(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM strategies WHERE id = ?', [id]);
}

// Alignment
export async function getAlignmentScores(): Promise<AlignmentScore[]> {
  const db = await getDb();
  return (await db.getAllAsync('SELECT * FROM alignment_scores ORDER BY dimension ASC')) as AlignmentScore[];
}

export async function saveAlignmentScore(dimension: AlignmentScore['dimension'], score: number, notes?: string): Promise<AlignmentScore> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = (await db.getFirstAsync('SELECT * FROM alignment_scores WHERE dimension = ?', [dimension])) as AlignmentScore | null;
  if (existing) {
    await db.runAsync('UPDATE alignment_scores SET score = ?, notes = ?, updated_at = ? WHERE id = ?', [score, notes ?? existing.notes ?? null, now, existing.id]);
    return { ...existing, score, notes: notes ?? existing.notes ?? null, updated_at: now };
  }
  const id = uuid();
  await db.runAsync('INSERT INTO alignment_scores (id, dimension, score, notes, updated_at) VALUES (?, ?, ?, ?, ?)', [id, dimension, score, notes ?? null, now]);
  return { id, dimension, score, notes: notes ?? null, updated_at: now };
}

export async function getStrategyAlignments(strategyId: string): Promise<StrategyAlignment[]> {
  const db = await getDb();
  return (await db.getAllAsync(
    'SELECT * FROM strategy_alignments WHERE strategy_id = ? ORDER BY dimension ASC',
    [strategyId]
  )) as StrategyAlignment[];
}

export async function saveStrategyAlignment(
  strategyId: string,
  dimension: StrategyAlignment['dimension'],
  score: number,
  currentState?: string,
  changesNeeded?: string
): Promise<StrategyAlignment> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = (await db.getFirstAsync(
    'SELECT * FROM strategy_alignments WHERE strategy_id = ? AND dimension = ?',
    [strategyId, dimension]
  )) as StrategyAlignment | null;

  if (existing) {
    await db.runAsync(
      'UPDATE strategy_alignments SET score = ?, current_state = ?, changes_needed = ?, updated_at = ? WHERE id = ?',
      [score, currentState ?? existing.current_state ?? null, changesNeeded ?? existing.changes_needed ?? null, now, existing.id]
    );
    return {
      ...existing,
      score,
      current_state: currentState ?? existing.current_state ?? null,
      changes_needed: changesNeeded ?? existing.changes_needed ?? null,
      updated_at: now,
    };
  }

  const id = uuid();
  await db.runAsync(
    'INSERT INTO strategy_alignments (id, strategy_id, dimension, score, current_state, changes_needed, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, strategyId, dimension, score, currentState ?? null, changesNeeded ?? null, now]
  );
  return { id, strategy_id: strategyId, dimension, score, current_state: currentState ?? null, changes_needed: changesNeeded ?? null, updated_at: now };
}

// Early Wins
export async function getEarlyWins(): Promise<EarlyWin[]> {
  const db = await getDb();
  return (await db.getAllAsync('SELECT * FROM early_wins ORDER BY created_at DESC')) as EarlyWin[];
}

export async function saveEarlyWin(w: Partial<EarlyWin> & { title: string }): Promise<EarlyWin> {
  const db = await getDb();
  const now = new Date().toISOString();
  if (w.id) {
    await db.runAsync(
      'UPDATE early_wins SET title=?, description=?, status=?, is_visible=?, is_team_owned=?, addresses_frustration=?, connected_to_strategy=?, notes=?, date_identified=?, date_delivered=?, updated_at=? WHERE id=?',
      [w.title, w.description ?? null, w.status ?? 'identified', w.is_visible ?? 0, w.is_team_owned ?? 0, w.addresses_frustration ?? 0, w.connected_to_strategy ?? 0, w.notes ?? null, w.date_identified ?? null, w.date_delivered ?? null, now, w.id]
    );
    return { ...w, updated_at: now } as EarlyWin;
  }
  const id = uuid();
  const result: EarlyWin = {
    id, title: w.title, description: w.description ?? null, status: (w.status ?? 'identified') as EarlyWin['status'],
    is_visible: w.is_visible ?? 0, is_team_owned: w.is_team_owned ?? 0, addresses_frustration: w.addresses_frustration ?? 0,
    connected_to_strategy: w.connected_to_strategy ?? 0, notes: w.notes ?? null,
    date_identified: w.date_identified ?? now.split('T')[0], date_delivered: w.date_delivered ?? null,
    created_at: now, updated_at: now,
  };
  await db.runAsync(
    'INSERT INTO early_wins (id, title, description, status, is_visible, is_team_owned, addresses_frustration, connected_to_strategy, notes, date_identified, date_delivered, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, result.title, result.description, result.status, result.is_visible, result.is_team_owned, result.addresses_frustration, result.connected_to_strategy, result.notes, result.date_identified, result.date_delivered, now, now]
  );
  return result;
}

export async function deleteEarlyWin(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM early_wins WHERE id = ?', [id]);
}
