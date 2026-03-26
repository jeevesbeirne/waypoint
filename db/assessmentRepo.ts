import { getDb } from './database';
import { uuid } from '../lib/utils';
import { DEFAULT_ASSESSMENT_CRITERIA } from '../lib/watkins-conversations';

export interface AssessmentCriterion {
  id: string;
  person_id: string;
  name: string;
  description: string | null;
  max_weight: number;
  min_threshold: number;
  sort_order: number;
  created_at: string;
}

export interface AssessmentScore {
  id: string;
  person_id: string;
  criteria_id: string;
  score: number;
  notes: string | null;
  last_updated: string;
  created_at: string;
}

export interface CriterionWithScore extends AssessmentCriterion {
  score: number;
  score_id: string | null;
  score_notes: string | null;
}

export async function getAssessmentCriteria(personId: string): Promise<AssessmentCriterion[]> {
  const db = await getDb();
  return (await db.getAllAsync(
    'SELECT * FROM assessment_criteria WHERE person_id = ? ORDER BY sort_order ASC',
    [personId]
  )) as AssessmentCriterion[];
}

export async function getAssessmentScores(personId: string): Promise<AssessmentScore[]> {
  const db = await getDb();
  return (await db.getAllAsync(
    'SELECT * FROM assessment_scores WHERE person_id = ?',
    [personId]
  )) as AssessmentScore[];
}

export async function getCriteriaWithScores(personId: string): Promise<CriterionWithScore[]> {
  const db = await getDb();
  return (await db.getAllAsync(
    `SELECT ac.*, 
       COALESCE(s.score, 0) as score,
       s.id as score_id,
       s.notes as score_notes
     FROM assessment_criteria ac
     LEFT JOIN assessment_scores s ON s.criteria_id = ac.id AND s.person_id = ac.person_id
     WHERE ac.person_id = ?
     ORDER BY ac.sort_order ASC`,
    [personId]
  )) as CriterionWithScore[];
}

export async function seedDefaultCriteria(personId: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  for (let i = 0; i < DEFAULT_ASSESSMENT_CRITERIA.length; i++) {
    const c = DEFAULT_ASSESSMENT_CRITERIA[i];
    const id = uuid();
    await db.runAsync(
      `INSERT INTO assessment_criteria (id, person_id, name, description, max_weight, min_threshold, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, personId, c.name, c.description, c.defaultWeight, c.defaultThreshold, i, now]
    );
  }
}

export async function hasAssessmentCriteria(personId: string): Promise<boolean> {
  const db = await getDb();
  const row = (await db.getFirstAsync(
    'SELECT COUNT(*) as n FROM assessment_criteria WHERE person_id = ?',
    [personId]
  )) as { n: number } | null;
  return (row?.n ?? 0) > 0;
}

export async function updateCriterion(
  id: string,
  updates: Partial<Pick<AssessmentCriterion, 'name' | 'description' | 'max_weight' | 'min_threshold' | 'sort_order'>>
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.max_weight !== undefined) { fields.push('max_weight = ?'); values.push(updates.max_weight); }
  if (updates.min_threshold !== undefined) { fields.push('min_threshold = ?'); values.push(updates.min_threshold); }
  if (updates.sort_order !== undefined) { fields.push('sort_order = ?'); values.push(updates.sort_order); }
  if (fields.length === 0) return;
  values.push(id);
  await db.runAsync(`UPDATE assessment_criteria SET ${fields.join(', ')} WHERE id = ?`, values);
}

export async function addCriterion(
  personId: string,
  name: string,
  weight: number,
  threshold: number,
  sortOrder: number,
  description?: string
): Promise<AssessmentCriterion> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = uuid();
  await db.runAsync(
    `INSERT INTO assessment_criteria (id, person_id, name, description, max_weight, min_threshold, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, personId, name, description ?? null, weight, threshold, sortOrder, now]
  );
  return { id, person_id: personId, name, description: description ?? null, max_weight: weight, min_threshold: threshold, sort_order: sortOrder, created_at: now };
}

export async function deleteCriterion(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM assessment_scores WHERE criteria_id = ?', [id]);
  await db.runAsync('DELETE FROM assessment_criteria WHERE id = ?', [id]);
}

export async function saveScore(
  personId: string,
  criteriaId: string,
  score: number,
  notes?: string | null
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  const existing = (await db.getFirstAsync(
    'SELECT id FROM assessment_scores WHERE person_id = ? AND criteria_id = ?',
    [personId, criteriaId]
  )) as { id: string } | null;
  if (existing) {
    await db.runAsync(
      'UPDATE assessment_scores SET score = ?, notes = ?, last_updated = ? WHERE id = ?',
      [score, notes ?? null, now, existing.id]
    );
  } else {
    const id = uuid();
    await db.runAsync(
      `INSERT INTO assessment_scores (id, person_id, criteria_id, score, notes, last_updated, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, personId, criteriaId, score, notes ?? null, now, now]
    );
  }
}

export async function resetToDefaults(personId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM assessment_scores WHERE person_id = ?', [personId]);
  await db.runAsync('DELETE FROM assessment_criteria WHERE person_id = ?', [personId]);
  await seedDefaultCriteria(personId);
}
