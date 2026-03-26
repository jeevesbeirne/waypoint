import { getDb } from './database';
import { uuid } from '../lib/utils';

export interface Person {
  id: string;
  name: string;
  title?: string;
  organisation?: string;
  category: string;
  notes?: string;
  influence: 'low' | 'medium' | 'high';
  alignment: 'resistant' | 'neutral' | 'supportive';
  is_key_stakeholder: number;
  relationship_quality?: number;
  created_at: string;
  updated_at: string;
}

export async function getPeople(): Promise<Person[]> {
  const db = await getDb();
  return (await db.getAllAsync('SELECT * FROM people ORDER BY name ASC')) as Person[];
}

export async function savePerson(p: Partial<Person> & { name: string }): Promise<Person> {
  const db = await getDb();
  const now = new Date().toISOString();
  if (p.id) {
    await db.runAsync(
      `UPDATE people SET name=?, title=?, organisation=?, category=?, notes=?, influence=?, alignment=?, is_key_stakeholder=?, relationship_quality=?, updated_at=? WHERE id=?`,
      [p.name, p.title ?? '', p.organisation ?? '', p.category ?? 'other', p.notes ?? '',
       p.influence ?? 'medium', p.alignment ?? 'neutral', p.is_key_stakeholder ?? 0, p.relationship_quality ?? 3, now, p.id]
    );
    return { ...p, updated_at: now } as Person;
  } else {
    const id = uuid();
    await db.runAsync(
      `INSERT INTO people (id, name, title, organisation, category, notes, influence, alignment, is_key_stakeholder, relationship_quality, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, p.name, p.title ?? '', p.organisation ?? '', p.category ?? 'other', p.notes ?? '',
       p.influence ?? 'medium', p.alignment ?? 'neutral', p.is_key_stakeholder ?? 0, p.relationship_quality ?? 3, now, now]
    );
    return { ...p, id, created_at: now, updated_at: now } as Person;
  }
}

export async function deletePerson(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM conversation_notes WHERE person_id = ?', [id]);
  await db.runAsync('DELETE FROM assessment_scores WHERE person_id = ?', [id]);
  await db.runAsync('DELETE FROM assessment_criteria WHERE person_id = ?', [id]);
  await db.runAsync('DELETE FROM meetings WHERE person_id = ?', [id]);
  await db.runAsync('DELETE FROM people WHERE id = ?', [id]);
}
