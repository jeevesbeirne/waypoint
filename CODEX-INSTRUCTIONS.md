# CODEX-INSTRUCTIONS.md — Waypoint V3 Build

## OVERVIEW
You are implementing 6 interconnected features for the Waypoint app (React Native / Expo Router).
Read this entire file before writing any code. Every change must pass `npx tsc --noEmit` with zero errors.

## PROJECT STRUCTURE
- **Root:** `~/waypoint/app-v2/`
- **Framework:** Expo 55 + Expo Router + expo-sqlite + Zustand
- **Styling:** React Native StyleSheet (no Tailwind/NativeWind)
- **Theme:** `lib/theme.ts` — use `colors`, `typography`, `spacing`, `radii`, `shadows`
- **Store:** `store/index.ts` — Zustand store with `checklistItems`, `settings`, etc.
- **DB:** `db/database.ts` (schema init + web stub), `db/checklistRepo.ts` (queries)
- **Content:** `lib/checklistContent.ts` (prescribed items)

## CRITICAL RULES
1. **TypeScript strict** — `npx tsc --noEmit` MUST pass with zero errors
2. **No new dependencies** — use only what's in package.json already
3. **Import paths** — use relative imports (e.g., `../../../lib/theme`)
4. **Expo Router** — tabs live in `app/(tabs)/[name]/_layout.tsx` + `index.tsx`
5. **Web compatibility** — `database.ts` has a web stub; new DB queries need web stub updates too
6. **All SQL migrations** — use try/catch per ALTER TABLE (column may already exist)
7. **Keep existing functionality working** — don't break the checklist, people, meetings, etc.

## BUILD ORDER (do exactly this sequence)

### Step 1: Create `lib/watkinsGroups.ts`
Create this new file with ALL the constants below:

```typescript
export const WATKINS_GROUPS = [
  'Prepare Yourself',
  'Accelerate Your Learning',
  'Match Strategy to Situation',
  'Negotiate Success',
  'Secure Early Wins',
  'Achieve Alignment',
  'Build Your Team',
  'Create Alliances',
  'Manage Yourself',
  'Accelerate Everyone',
] as const;

export type WatkinsGroup = typeof WATKINS_GROUPS[number];

export const WATKINS_GROUP_COLORS: Record<WatkinsGroup, string> = {
  'Prepare Yourself': '#6366F1',        // indigo
  'Accelerate Your Learning': '#3B82F6', // blue
  'Match Strategy to Situation': '#8B5CF6', // violet
  'Negotiate Success': '#EC4899',        // pink
  'Secure Early Wins': '#10B981',        // emerald
  'Achieve Alignment': '#F59E0B',        // amber
  'Build Your Team': '#EF4444',          // red
  'Create Alliances': '#14B8A6',         // teal
  'Manage Yourself': '#6B7280',          // gray
  'Accelerate Everyone': '#F97316',      // orange
};

export const WATKINS_SUB_ACTIVITIES: Record<WatkinsGroup, string[]> = {
  'Prepare Yourself': [
    'Mental preparation',
    'Research the organisation',
    'Read transition frameworks',
    'Personal logistics',
    'Clear personal plate',
    'Plan Day 1',
    'Set learning agenda',
  ],
  'Accelerate Your Learning': [
    'Stakeholder interviews',
    'Team assessment',
    'Document & data review',
    'Cultural diagnosis',
    'External / market analysis',
    'Observe & listen',
  ],
  'Match Strategy to Situation': [
    'STARS diagnosis',
    'Strategic options review',
    'Situational communication',
    'Adapt leadership style',
  ],
  'Negotiate Success': [
    'Expectations conversation',
    'Resources conversation',
    'Style conversation',
    'Personal development conversation',
    'Check-in meetings',
  ],
  'Secure Early Wins': [
    'Identify win opportunities',
    'Build credibility',
    'Deliver quick win',
    'Communicate wins',
    'Build momentum',
  ],
  'Achieve Alignment': [
    'Vision & mission clarity',
    'Strategic priorities',
    'Org structure review',
    'Metrics & KPIs',
    'Decision rights',
  ],
  'Build Your Team': [
    'Team assessment',
    'Performance conversations',
    'Personnel decisions',
    'Team culture',
    'Team development',
  ],
  'Create Alliances': [
    'Stakeholder mapping',
    'Lateral relationship building',
    'Influence without authority',
    'Coalition building',
    'Political navigation',
  ],
  'Manage Yourself': [
    'Reflection practice',
    'Energy management',
    'Seek advice & mentoring',
    'Decision discipline',
    'Work-life boundaries',
  ],
  'Accelerate Everyone': [
    'Capability building',
    'Knowledge sharing',
    'Coaching & delegation',
    'Succession planning',
  ],
};
```

### Step 2: Update `db/database.ts` — V3 Migrations

After the existing `initSchema` function's schema creation, add V3 migrations. Add these ALTER TABLE statements (each wrapped in try/catch):

```typescript
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
await database.execAsync(`UPDATE checklist_items SET start_week = default_week WHERE start_week IS NULL`);
await database.execAsync(`UPDATE checklist_items SET end_week = default_week WHERE end_week IS NULL`);
```

Also update the `webStore` to include the new fields in the checklist_items mapping:
```typescript
start_week: item.default_week,
end_week: (item as any).end_week ?? item.default_week,
task_status: 'todo',
parent_id: (item as any).parent_id ?? null,
depth: (item as any).depth ?? 0,
watkins_groups: (item as any).watkins_groups ? JSON.stringify((item as any).watkins_groups) : null,
sub_activity: (item as any).sub_activity ?? null,
task_group: (item as any).task_group ?? null,
is_user_task: 0,
```

### Step 3: Update `db/checklistRepo.ts` — Interface & Queries

Update the `ChecklistItem` interface to add:
```typescript
start_week?: number;
end_week?: number;
task_status?: 'todo' | 'in-progress' | 'complete';
parent_id?: string | null;
depth?: number;
watkins_groups?: string | null;  // JSON array string
sub_activity?: string | null;
task_group?: string | null;
```

Update `seedChecklistIfEmpty` to include the new columns in the INSERT statement.

Add new functions:
```typescript
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
  const sets = keys.map(k => `${k} = ?`).join(', ');
  await db.runAsync(`UPDATE checklist_items SET ${sets} WHERE id = ?`, [...Object.values(fields), id]);
}
```

### Step 4: Rewrite `lib/checklistContent.ts` — Full Hierarchy + Watkins Groups

This is the biggest change. Replace the entire `CHECKLIST_ITEMS` array with a new version that includes:
- `start_week` and `end_week` for every item
- `watkins_groups` as a string array (1-2 groups per item)
- `parent_id` linking sub-tasks to parents
- `depth` (0, 1, or 2)

Update the `ChecklistItemDef` interface:
```typescript
export interface ChecklistItemDef {
  id: string;
  title: string;
  description: string;
  detail: string;
  phase: 1 | 2 | 3;
  default_week: number;
  default_day?: number;
  category: string;
  priority: 'critical' | 'high' | 'normal';
  relevant_levels?: LeaderLevel[];
  start_week: number;
  end_week: number;
  watkins_groups: string[];
  parent_id?: string;
  depth: number;
  sub_activity?: string;
}
```

**WEEK 0 tasks** — Replace the existing week 0 items (0-1 through 0-8) with these new ones:

```
id: 'w0-1', title: 'Mentally close out your previous role', watkins_groups: ['Prepare Yourself', 'Manage Yourself'], start_week: 0, end_week: 0, depth: 0
id: 'w0-2', title: 'Research the organisation from public sources', watkins_groups: ['Prepare Yourself', 'Accelerate Your Learning'], start_week: 0, end_week: 0, depth: 0
id: 'w0-3', title: 'Read or re-read your transition framework', watkins_groups: ['Prepare Yourself'], start_week: 0, end_week: 0, depth: 0
id: 'w0-4', title: 'Sort practical logistics', watkins_groups: ['Prepare Yourself'], start_week: 0, end_week: 0, depth: 0
id: 'w0-5', title: 'Clear your personal plate', watkins_groups: ['Prepare Yourself', 'Manage Yourself'], start_week: 0, end_week: 0, depth: 0
id: 'w0-6', title: 'Have any pre-start conversations you\'ve been invited to', watkins_groups: ['Prepare Yourself', 'Negotiate Success'], start_week: 0, end_week: 0, depth: 0
id: 'w0-7', title: 'Plan your Day 1 introduction', watkins_groups: ['Prepare Yourself'], start_week: 0, end_week: 0, depth: 0
id: 'w0-8', title: 'Write down your 5 biggest questions', watkins_groups: ['Prepare Yourself', 'Accelerate Your Learning'], start_week: 0, end_week: 0, depth: 0
```

Include appropriate descriptions for each (use the descriptions from the brief).

**HIERARCHICAL TASKS** — implement these parent/child structures:

**Parent: "Diagnose your situation" (wk 1-4) [Accelerate Your Learning, Match Strategy to Situation]**
- id: 'h1', depth: 0, parent_id: undefined
  - Sub: "Gather information" (wk 1-3), id: 'h1-1', depth: 1, parent_id: 'h1'
    - Sub-sub: "Speak to all direct reports" (wk 1-2), id: 'h1-1a', depth: 2, parent_id: 'h1-1'
    - Sub-sub: "Speak to key stakeholders" (wk 1-3), id: 'h1-1b', depth: 2, parent_id: 'h1-1'
    - Sub-sub: "Review existing strategy docs" (wk 1-2), id: 'h1-1c', depth: 2, parent_id: 'h1-1'
  - Sub: "Map the landscape" (wk 2-4), id: 'h1-2', depth: 1, parent_id: 'h1'
    - Sub-sub: "Complete STARS situation analysis" (wk 3-4), id: 'h1-2a', depth: 2, parent_id: 'h1-2'
    - Sub-sub: "Identify key challenges and opportunities" (wk 3-4), id: 'h1-2b', depth: 2, parent_id: 'h1-2'

**Parent: "Build relationship with your boss" (wk 1-8) [Negotiate Success]**
- id: 'h2', depth: 0
  - Sub: "Initial expectations conversation" (wk 1-2), id: 'h2-1', depth: 1, parent_id: 'h2'
  - Sub: "Resources conversation" (wk 5-6), id: 'h2-2', depth: 1, parent_id: 'h2'
  - Sub: "Style conversation" (wk 3-4), id: 'h2-3', depth: 1, parent_id: 'h2'
  - Sub: "Check-in: am I focused on the right things?" (wk 7-7), id: 'h2-4', depth: 1, parent_id: 'h2'
  - Sub: "Day 60 milestone review" (wk 8-8), id: 'h2-5', depth: 1, parent_id: 'h2'

**Parent: "Secure early wins" (wk 3-7) [Secure Early Wins]**
- id: 'h3', depth: 0
  - Sub: "Identify 2-3 potential early wins" (wk 3-3), id: 'h3-1', depth: 1, parent_id: 'h3'
  - Sub: "Deliver first early win" (wk 5-5), id: 'h3-2', depth: 1, parent_id: 'h3'
  - Sub: "Communicate what's changed and why" (wk 5-6), id: 'h3-3', depth: 1, parent_id: 'h3'
  - Sub: "Deliver second early win" (wk 7-7), id: 'h3-4', depth: 1, parent_id: 'h3'

**Parent: "Assess and build your team" (wk 2-8) [Build Your Team]**
- id: 'h4', depth: 0
  - Sub: "Schedule 1:1s with all direct reports" (wk 1-1), id: 'h4-1', depth: 1, parent_id: 'h4'
  - Sub: "Assess team capability and performance" (wk 2-4), id: 'h4-2', depth: 1, parent_id: 'h4'
  - Sub: "Have performance conversations where needed" (wk 5-6), id: 'h4-3', depth: 1, parent_id: 'h4'
  - Sub: "Make personnel decisions if required" (wk 6-8), id: 'h4-4', depth: 1, parent_id: 'h4'
  - Sub: "Establish team culture and ways of working" (wk 4-8), id: 'h4-5', depth: 1, parent_id: 'h4'

**Parent: "Create alliances and stakeholder network" (wk 1-10) [Create Alliances]**
- id: 'h5', depth: 0
  - Sub: "Identify your top 5 stakeholders" (wk 1-2), id: 'h5-1', depth: 1, parent_id: 'h5'
  - Sub: "Map stakeholders on influence/alignment grid" (wk 2-3), id: 'h5-2', depth: 1, parent_id: 'h5'
  - Sub: "Build one key lateral peer relationship" (wk 4-6), id: 'h5-3', depth: 1, parent_id: 'h5'
  - Sub: "Strengthen wider stakeholder network" (wk 7-10), id: 'h5-4', depth: 1, parent_id: 'h5'

**Parent: "Achieve strategic alignment" (wk 4-10) [Achieve Alignment]**
- id: 'h6', depth: 0
  - Sub: "Clarify the strategic priorities" (wk 4-5), id: 'h6-1', depth: 1, parent_id: 'h6'
  - Sub: "Align team on vision and goals" (wk 5-7), id: 'h6-2', depth: 1, parent_id: 'h6'
  - Sub: "Review org structure for fit" (wk 6-8), id: 'h6-3', depth: 1, parent_id: 'h6'
  - Sub: "Establish metrics and decision rights" (wk 8-10), id: 'h6-4', depth: 1, parent_id: 'h6'

**STANDALONE TASKS** — Keep all the existing "principle" tasks (1-1 through 10-6) BUT:
- Add `start_week` = `default_week` and `end_week` = `default_week` for single-week tasks
- Map `category` to appropriate `watkins_groups` array:
  - 'Self' → ['Prepare Yourself'] or ['Manage Yourself'] depending on context
  - 'Boss' → ['Negotiate Success']
  - 'Team' → ['Build Your Team']
  - 'Stakeholders' → ['Create Alliances']
  - 'Strategy' → ['Match Strategy to Situation'] or ['Achieve Alignment'] depending on context
- Add `depth: 0` to all standalone tasks
- Remove any tasks that are now REPLACED by the hierarchical parents above (e.g., remove duplicates)
- Keep tasks that are complementary/different from the hierarchy tasks

**IMPORTANT:** Many existing tasks overlap with the new hierarchy tasks. If a standalone task is essentially the same as a hierarchy task, REMOVE the standalone version. If it adds unique value, keep it. Use your judgment.

### Step 5: Update `db/checklistRepo.ts` — Seed Logic

Update `seedChecklistIfEmpty` to include the new fields:
```typescript
await db.runAsync(
  `INSERT INTO checklist_items (id, title, description, detail, phase, default_week, default_day, category, priority, completed, relevant_levels, created_at, start_week, end_week, parent_id, depth, watkins_groups, sub_activity)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    item.id, item.title, item.description, item.detail,
    item.phase, item.default_week, item.default_day ?? null,
    item.category, item.priority,
    JSON.stringify(item.relevant_levels ?? []),
    now,
    item.start_week, item.end_week,
    item.parent_id ?? null, item.depth,
    JSON.stringify(item.watkins_groups),
    item.sub_activity ?? null,
  ]
);
```

Also update `addCustomChecklistItem` to accept and store `start_week`, `end_week`, `parent_id`, `depth`, `watkins_groups`.

### Step 6: Create Calendar Tab

**Create `app/(tabs)/calendar/_layout.tsx`:**
```typescript
import { Stack } from 'expo-router';

export default function CalendarLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}
```

**Create `app/(tabs)/calendar/index.tsx`:**

Build a Gantt-style horizontal timeline. Use React Native `ScrollView` (horizontal) with absolute-positioned bars.

Structure:
- SafeAreaView wrapper
- Header: "Calendar" title + "Today" button
- Phase labels bar across top
- Gantt chart area:
  - Vertical axis: tasks grouped by Watkins group (left side labels)
  - Horizontal axis: weeks 0-13 (scrollable)
  - Tasks rendered as coloured bars using absolute positioning
  - Bar color from WATKINS_GROUP_COLORS
  - Current week highlighted
  - Week 0 visually distinct (different bg)
  - Tap bar → open ItemDetailModal (import from checklist or create shared component)

Implementation approach:
- Define COLUMN_WIDTH = 70 (per week column)
- Define ROW_HEIGHT = 40 (per task row)
- Total chart width = 14 * COLUMN_WIDTH (weeks 0-13)
- Left sidebar: 200px wide with task names (grouped by Watkins group)
- Main area: horizontal ScrollView
- Each task bar: absolute positioned View with left = startWeek * COLUMN_WIDTH, width = (endWeek - startWeek + 1) * COLUMN_WIDTH
- Sub-tasks: indented in left sidebar, thinner bars
- Completed tasks: reduced opacity + strikethrough

For the ItemDetailModal: extract it into `components/ItemDetailModal.tsx` as a shared component (used by both Checklist and Calendar tabs). Pass the same props.

### Step 7: Update `app/(tabs)/_layout.tsx` — Add Calendar Tab

Add Calendar between Checklist and Reflect:
```typescript
<Tabs.Screen
  name="calendar"
  options={{
    title: 'Calendar',
    tabBarIcon: ({ focused }) => <TabIcon emoji="📅" focused={focused} />,
  }}
/>
```

Tab order: Learn | Checklist | Calendar | Reflect | People | Meetings | Settings

### Step 8: Update Checklist Tab — Hierarchy + Multi-week + Edit Mode

**In `app/(tabs)/checklist/index.tsx`:**

1. **Hierarchy display:**
   - Group tasks by parent/child relationships
   - Parent tasks show ▶ expand chevron
   - Track expanded parents in state: `expandedParents: Set<string>`
   - Tap expand → shows sub-tasks indented (16px for depth 1, 32px for depth 2)
   - Left border accent matching Watkins group colour
   - Parent shows "X/Y sub-tasks complete" progress badge

2. **Multi-week badges:**
   - If `start_week !== end_week`: show "Wk X–Y" instead of "Wk X"
   - In week view: show task in EVERY week it spans

3. **Enhanced ItemDetailModal** (now shared component):
   - Add "Edit ✏️" button in header
   - Edit mode: title → TextInput, description → TextInput
   - Watkins group selector: multi-select chips (max 2) from WATKINS_GROUPS
   - Sub-activity dropdown populated from WATKINS_SUB_ACTIVITIES
   - Start week / End week pickers (0-13)
   - Changing start week auto-adjusts end week to maintain duration
   - Save / Cancel buttons
   - Show "Starts: Week X → Ends: Week Y"
   - If start_date set: show dates alongside weeks

4. **Enhanced Add Task modal:**
   - Start week AND end week pickers
   - Watkins group(s) multi-select (max 2 from 10 groups)
   - Sub-activity dropdown
   - Parent task selector (dropdown of existing depth=0 tasks)

5. **Enhanced long-press:**
   - Add "Edit dates…" option opening inline date edit
   - When moving parent: prompt about children
   - If moving parent + children: offset all by delta

### Step 9: Extract `components/ItemDetailModal.tsx`

Move the ItemDetailModal out of checklist/index.tsx into a shared component. It should:
- Accept `item`, `visible`, `onClose`, `onToggle`, `onSave` (for edit saves), `allItems` (for parent display)
- Include full edit mode with Watkins groups, dates, etc.
- Be importable by both Checklist and Calendar tabs

### Step 10: Final Checks

1. Run `npx tsc --noEmit` — fix ALL errors
2. Ensure all imports are correct
3. Ensure the web stub in database.ts handles new fields
4. Verify calendar tab renders without crash

## WATKINS GROUP → OLD CATEGORY MAPPING (for backward compatibility)
When a task has `watkins_groups`, use the first group's color. When it only has `category`:
- Boss → Negotiate Success
- Team → Build Your Team  
- Stakeholders → Create Alliances
- Self → Manage Yourself (or Prepare Yourself for week 0)
- Strategy → Match Strategy to Situation

## IMPORTANT NOTES
- The `is_user_task` column already exists in the DB schema, don't add it in migrations
- `scheduled_week` is the existing "moved to" week column — keep it, use `start_week`/`end_week` as the new canonical fields
- The web stub in database.ts is minimal — make sure new queries don't crash on web
- Keep the existing filter system working (status, phase, category, search)
- The theme has `colors.phase.learn`, `.build`, `.deliver` — use these for phase colours

## When completely finished, run:
```
openclaw gateway wake --text "Codex done: Waypoint V3 — all 6 features implemented" --mode now
```
