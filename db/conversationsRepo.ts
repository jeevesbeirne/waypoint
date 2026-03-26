import { getDb } from './database';
import { uuid } from '../lib/utils';
import type { ConversationTypeId } from '../lib/watkins-conversations';

export interface ConversationNote {
  id: string;
  person_id: string;
  conversation_type: ConversationTypeId;
  note_text: string;
  note_date: string;
  created_at: string;
}

export async function getConversationNotes(
  personId: string,
  conversationType?: ConversationTypeId
): Promise<ConversationNote[]> {
  const db = await getDb();
  if (conversationType) {
    return (await db.getAllAsync(
      'SELECT * FROM conversation_notes WHERE person_id = ? AND conversation_type = ? ORDER BY created_at DESC',
      [personId, conversationType]
    )) as ConversationNote[];
  }
  return (await db.getAllAsync(
    'SELECT * FROM conversation_notes WHERE person_id = ? ORDER BY created_at DESC',
    [personId]
  )) as ConversationNote[];
}

export async function getConversationNoteCounts(
  personId: string
): Promise<Record<string, number>> {
  const db = await getDb();
  const rows = (await db.getAllAsync(
    'SELECT conversation_type, COUNT(*) as count FROM conversation_notes WHERE person_id = ? GROUP BY conversation_type',
    [personId]
  )) as Array<{ conversation_type: string; count: number }>;
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.conversation_type] = row.count;
  }
  return counts;
}

export async function addConversationNote(
  personId: string,
  conversationType: ConversationTypeId,
  noteText: string,
  noteDate: string
): Promise<ConversationNote> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = uuid();
  await db.runAsync(
    `INSERT INTO conversation_notes (id, person_id, conversation_type, note_text, note_date, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, personId, conversationType, noteText, noteDate, now]
  );
  return { id, person_id: personId, conversation_type: conversationType, note_text: noteText, note_date: noteDate, created_at: now };
}

export async function deleteConversationNote(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM conversation_notes WHERE id = ?', [id]);
}
