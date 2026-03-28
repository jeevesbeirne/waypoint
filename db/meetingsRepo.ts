import { getDb } from './database';
import { uuid } from '../lib/utils';

export interface Meeting {
  id: string;
  person_id?: string; // legacy: single person link
  title?: string;
  date: string;
  meeting_type?: string;
  notes?: string;
  bullets?: string; // JSON array string
  has_diagnostic?: number;
  diagnostic_type?: string | null;
  has_strategy?: number;
  has_early_win?: number;
  created_at: string;
  updated_at?: string;
}

export interface MeetingAction {
  id: string;
  meeting_id: string;
  text: string;
  completed: number;
  added_to_checklist: number;
  checklist_item_id?: string | null;
  checklist_task_id?: string | null;
  created_at: string;
}

export interface MeetingWithPeople extends Meeting {
  people?: Array<{ id: string; name: string; title?: string }>;
  actions?: MeetingAction[];
}

export async function getMeetingsForPerson(personId: string): Promise<Meeting[]> {
  const db = await getDb();
  // Also include meetings linked via meeting_people join table
  return (await db.getAllAsync(
    `SELECT DISTINCT m.* FROM meetings m
     LEFT JOIN meeting_people mp ON mp.meeting_id = m.id
     WHERE m.person_id = ? OR mp.person_id = ?
     ORDER BY m.date DESC`,
    [personId, personId]
  )) as Meeting[];
}

export async function getAllMeetings(): Promise<Meeting[]> {
  const db = await getDb();
  return (await db.getAllAsync(
    'SELECT * FROM meetings ORDER BY date DESC'
  )) as Meeting[];
}

export async function getMeetingById(id: string): Promise<MeetingWithPeople | null> {
  const db = await getDb();
  const meeting = (await db.getFirstAsync('SELECT * FROM meetings WHERE id = ?', [id])) as Meeting | null;
  if (!meeting) return null;
  const people = (await db.getAllAsync(
    `SELECT p.id, p.name, p.title FROM people p
     JOIN meeting_people mp ON mp.person_id = p.id
     WHERE mp.meeting_id = ?`,
    [id]
  )) as Array<{ id: string; name: string; title?: string }>;
  const actions = (await db.getAllAsync(
    'SELECT * FROM meeting_actions WHERE meeting_id = ? ORDER BY created_at ASC',
    [id]
  )) as MeetingAction[];
  return { ...meeting, people, actions };
}

export async function saveMeeting(
  m: Partial<Meeting> & { date: string },
  personIds?: string[]
): Promise<Meeting> {
  const db = await getDb();
  const now = new Date().toISOString();
  if (m.id) {
    await db.runAsync(
      `UPDATE meetings SET date=?, title=?, meeting_type=?, notes=?, bullets=?, has_diagnostic=?, diagnostic_type=?, has_strategy=?, has_early_win=?, updated_at=? WHERE id=?`,
      [m.date, m.title ?? '', m.meeting_type ?? '', m.notes ?? '', m.bullets ?? '[]', m.has_diagnostic ?? 0, m.diagnostic_type ?? null, m.has_strategy ?? 0, m.has_early_win ?? 0, now, m.id]
    );
    if (personIds !== undefined) {
      await db.runAsync('DELETE FROM meeting_people WHERE meeting_id = ?', [m.id]);
      for (const pid of personIds) {
        await db.runAsync(
          'INSERT OR IGNORE INTO meeting_people (meeting_id, person_id) VALUES (?, ?)',
          [m.id, pid]
        );
      }
    }
    return { ...m, created_at: m.created_at ?? now, updated_at: now } as Meeting;
  } else {
    const id = uuid();
    // Support legacy person_id field
    const personId = m.person_id ?? null;
    await db.runAsync(
      `INSERT INTO meetings (id, person_id, title, date, meeting_type, notes, bullets, has_diagnostic, diagnostic_type, has_strategy, has_early_win, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, personId, m.title ?? '', m.date, m.meeting_type ?? '', m.notes ?? '', m.bullets ?? '[]', m.has_diagnostic ?? 0, m.diagnostic_type ?? null, m.has_strategy ?? 0, m.has_early_win ?? 0, now, now]
    );
    // Also insert into meeting_people for the primary person if given
    if (personId) {
      await db.runAsync(
        'INSERT OR IGNORE INTO meeting_people (meeting_id, person_id) VALUES (?, ?)',
        [id, personId]
      );
    }
    if (personIds) {
      for (const pid of personIds) {
        if (pid !== personId) {
          await db.runAsync(
            'INSERT OR IGNORE INTO meeting_people (meeting_id, person_id) VALUES (?, ?)',
            [id, pid]
          );
        }
      }
    }
    return { ...m, id, created_at: now, updated_at: now } as Meeting;
  }
}

export async function deleteMeeting(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM meeting_people WHERE meeting_id = ?', [id]);
  await db.runAsync('DELETE FROM meeting_actions WHERE meeting_id = ?', [id]);
  await db.runAsync('DELETE FROM meetings WHERE id = ?', [id]);
}

export async function addMeetingAction(
  meetingId: string,
  text: string
): Promise<MeetingAction> {
  const db = await getDb();
  const now = new Date().toISOString();
  const id = uuid();
  await db.runAsync(
    `INSERT INTO meeting_actions (id, meeting_id, text, completed, added_to_checklist, created_at)
     VALUES (?, ?, ?, 0, 0, ?)`,
    [id, meetingId, text, now]
  );
  return { id, meeting_id: meetingId, text, completed: 0, added_to_checklist: 0, created_at: now };
}

export async function toggleMeetingAction(actionId: string, completed: boolean): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE meeting_actions SET completed = ? WHERE id = ?',
    [completed ? 1 : 0, actionId]
  );
}

export async function markActionAddedToChecklist(
  actionId: string,
  checklistItemId: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE meeting_actions SET added_to_checklist = 1, checklist_item_id = ?, checklist_task_id = ? WHERE id = ?',
    [checklistItemId, checklistItemId, actionId]
  );
}
