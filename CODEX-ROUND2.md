# CODEX-ROUND2.md — 11 Fixes from User Testing

**Read this entire file before writing any code.** Every change must pass `npx tsc --noEmit` with zero errors.

## PROJECT CONTEXT
- **Root:** `~/waypoint/app-v2/`
- **Framework:** Expo 55 + Expo Router + expo-sqlite + Zustand
- **Styling:** React Native StyleSheet (no Tailwind/NativeWind)
- **Theme:** `lib/theme.ts` — use `colors`, `typography`, `spacing`, `radii`, `shadows`
- **DB:** `db/database.ts` (schema init + web stub), various repos in `db/`

## CRITICAL RULES
1. **TypeScript strict** — `npx tsc --noEmit` MUST pass with zero errors
2. **No new dependencies** — use only what's in package.json already
3. **Import paths** — use relative imports (e.g., `../../../lib/theme`)
4. **All SQL migrations** — use try/catch per ALTER TABLE (column may already exist)
5. **Web compatibility** — `database.ts` has a web stub; update if needed
6. **Keep existing functionality working** — don't break anything that already works

---

## FIX 1 (L1): Remove Phase Banner from Learn Tab

**File:** `app/(tabs)/learn/index.tsx`

Remove the entire Phase Banner block from `LearnTab()`. Delete this JSX:

```tsx
{/* Phase Banner */}
<View style={[styles.phaseBanner, { backgroundColor: showPrepare ? colors.primary : phase.color }]}>
  <Text style={styles.phaseBannerEmoji}>{phaseIcon}</Text>
  <View>
    <Text style={styles.phaseBannerDay}>{phaseDayLabel}</Text>
    <Text style={styles.phaseBannerName}>{phaseName}</Text>
  </View>
  {!showPrepare && (
    <View style={styles.phasePill}>
      <Text style={styles.phasePillText}>Week {weekNum}</Text>
    </View>
  )}
</View>
```

Also remove the associated variables that are now unused:
- `showPrepare`, `phaseName`, `phaseIcon`, `phaseDayLabel`
- `dayNumber`, `getPhase`, `getWeekNumber`, `phaseConfig` imports if now unused
- All `phaseBanner*` and `phasePill*` styles

Replace with a simple heading area:
```tsx
<View style={styles.learnHeader}>
  <Text style={styles.learnTitle}>📚 Learn</Text>
  <Text style={styles.learnSubtitle}>Frameworks and research for your transition</Text>
</View>
```

Add styles:
```tsx
learnHeader: {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.sm,
},
learnTitle: {
  fontSize: typography.sizes['2xl'],
  fontWeight: typography.weights.bold,
  color: colors.primary,
},
learnSubtitle: {
  fontSize: typography.sizes.sm,
  color: colors.text.secondary,
  marginTop: spacing.xs,
},
```

---

## FIX 2 (L2): Match Expand Arrows to Checklist Pattern

**File:** `app/(tabs)/learn/index.tsx`

The Learn tab's category accordion currently has small ▼/▲ arrows on the RIGHT side. Redesign to match the Checklist's pattern: large ▶/▼ arrows on the LEFT side with 44×44 touch targets.

**Replace the accordionHeader Pressable for categories:**

Current:
```tsx
<Pressable
  style={styles.accordionHeader}
  onPress={() => toggleCategory(cat.key)}
>
  <Text style={styles.accordionTitle}>{cat.label}</Text>
  <Text style={styles.accordionChevron}>{isExpanded ? '▲' : '▼'}</Text>
</Pressable>
```

New:
```tsx
<Pressable
  style={styles.accordionHeader}
  onPress={() => toggleCategory(cat.key)}
>
  <View style={styles.accordionExpandBtn}>
    <Text style={styles.accordionExpandArrow}>{isExpanded ? '▼' : '▶'}</Text>
  </View>
  <Text style={styles.accordionTitle}>{cat.label}</Text>
</Pressable>
```

**Update styles:**
```tsx
accordionHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: spacing.sm,
  paddingRight: spacing.md,
},
accordionExpandBtn: {
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
},
accordionExpandArrow: {
  fontSize: 18,
  color: colors.text.secondary,
  fontWeight: 'bold',
},
```

Remove the old `accordionChevron` style.

---

## FIX 3 (L3): Remove Redundant Topic Name on Expand

**File:** `app/(tabs)/learn/index.tsx`

Currently when you expand a category (e.g. "1. Prepare Yourself"), each article shows its title (e.g. "Prepare Yourself") with a "3 min" badge, and you have to expand THAT again to see content. This is redundant since most categories have exactly one article.

**Change:** When a category is expanded, immediately show the article summary bullets directly — no intermediate article expand step.

Replace the article rendering block inside `{isExpanded && (` with:

```tsx
{isExpanded && (
  <View style={styles.accordionContent}>
    {articles.map((article) => (
      <View key={article.id} style={styles.articleBlock}>
        <View style={styles.articleDirectContent}>
          <View style={styles.articleMetaRow}>
            <View style={styles.readTimeBadge}>
              <Text style={styles.readTimeText}>{article.readTimeMinutes} min read</Text>
            </View>
          </View>
          {article.summaryBullets.map((bullet, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.articleBulletText}>{bullet}</Text>
            </View>
          ))}
          <Pressable
            style={styles.readFullBtn}
            onPress={() =>
              router.push(`/(tabs)/learn/article/${article.id}`)
            }
          >
            <Text style={styles.readFullBtnText}>Read full article →</Text>
          </Pressable>
        </View>
      </View>
    ))}
  </View>
)}
```

Remove `expandedArticles` state and `toggleArticle` function since they're no longer needed.

Add style:
```tsx
articleDirectContent: {
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
},
articleMetaRow: {
  flexDirection: 'row',
  marginBottom: spacing.sm,
},
```

Remove `articleHeader`, `articleHeaderLeft`, `articleTitle`, `articleChevron`, `articleExpanded` styles.

---

## FIX 4 (L4): "Create Coalitions" → "Create Alliances"

**File:** `app/(tabs)/learn/index.tsx`

In the `CATEGORIES` array, change:
```tsx
{ key: 'coalitions', label: '8. Create Coalitions' },
```
to:
```tsx
{ key: 'coalitions', label: '8. Create Alliances' },
```

Also in the same `CATEGORIES` array, fix the label for topic 9:
```tsx
{ key: 'balance', label: '9. Keep Your Balance' },
```
to:
```tsx
{ key: 'balance', label: '9. Manage Yourself' },
```

**Also check `lib/learningContent.ts`:** The `CATEGORY_LABELS` already has `coalitions: 'Alliances'` and `balance: 'Manage Yourself'` — these are correct, no change needed there.

---

## FIX 5 (L5): Ensure All 10 Topics Show

**File:** `app/(tabs)/learn/index.tsx`

After fix L4, all 10 CATEGORIES entries should have correct labels. Verify that all 10 categories have articles by checking in `lib/learningContent.ts`. Looking at the ARTICLES array:
- 'prepare' → 'prepare-yourself' ✓
- 'learning' → 'accelerate-your-learning' ✓
- 'situation' → 'match-strategy-to-situation' ✓
- 'negotiate' → 'negotiate-success' ✓
- 'early-wins' → 'secure-early-wins' ✓
- 'alignment' → 'achieve-alignment' ✓
- 'team' → 'build-your-team' ✓
- 'coalitions' → 'create-alliances' ✓
- 'balance' → 'manage-yourself' ✓
- 'accelerate' → 'accelerate-everyone' ✓

All 10 have articles. The issue was likely the wrong labels causing confusion. But ALSO: the current code skips categories with 0 articles — and since all 10 have articles, they should all render.

**BUT** — currently the code does `if (items.length === 0) return null;` inside a `.map()` for CATEGORIES — which is wrong actually, it's not items, it's articles. Let me check... Yes it filters `const articles = ARTICLES.filter((a) => a.category === cat.key);` then renders if there are articles. This should work.

The real fix for L5 is just making sure labels are correct (done in L4) and that no category gets hidden. The categories should all render because they all have articles. No additional code change needed beyond L4.

---

## FIX 6 (C1): Sub-task Indentation on Native

**File:** `app/(tabs)/checklist/index.tsx`

The current indentation uses connecting line `View` elements with `width: 24` for each depth level. On native, this isn't visually obvious enough. The connecting lines show but the row itself doesn't look indented.

**Fix:** Increase indent to 32px per level and apply `marginLeft` directly to the row container rather than relying solely on the connecting line Views.

Find the `renderItemRow` function. Change the indentation wrapper:

**Current:**
```tsx
<View style={{ flexDirection: 'row', marginHorizontal: spacing.lg }}>
  {/* Vertical connecting lines for each depth level */}
  {Array.from({ length: depth }).map((_, i) => (
    <View key={i} style={{ width: 24, alignItems: 'center' }}>
      <View style={{ width: 2, flex: 1, backgroundColor: groupColor + '40' }} />
    </View>
  ))}
```

**New:**
```tsx
<View style={{ flexDirection: 'row', marginHorizontal: spacing.lg, marginLeft: spacing.lg + (depth * 32) }}>
  {/* Vertical connecting line for indented items */}
  {depth > 0 && (
    <View style={{ width: 4, marginRight: 8, borderRadius: 2, backgroundColor: groupColor + '40' }} />
  )}
```

This gives:
- depth 0: marginLeft = spacing.lg (normal)
- depth 1: marginLeft = spacing.lg + 32 (visibly indented)
- depth 2: marginLeft = spacing.lg + 64 (further indented)

Also for depth > 0 items, show a small colored accent bar on the left instead of the connecting line Views. This is simpler and more visually distinct on native.

Remove the old connecting line `Array.from` block entirely.

---

## FIX 7 (C2): Sub-sub-task Indentation

This is automatically handled by Fix 6 above — depth 2 items get `depth * 32 = 64` extra marginLeft. Test with the hierarchical tasks (e.g., h1 → h1-1 → h1-1a) to verify three visually distinct levels.

---

## FIX 8 (T1): Restructure Strategy Section

**Files to modify:**
1. `db/strategyRepo.ts` — add `StrategyAlignment` interface and CRUD functions
2. `db/database.ts` — add migration for `strategy_alignments` table
3. `app/(tabs)/track/strategy/index.tsx` — redesign UI

### Step 1: Database migration (`db/database.ts`)

Add after the existing V4 migrations block:

```typescript
// Strategy alignment per-strategy
try {
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS strategy_alignments (
      id TEXT PRIMARY KEY,
      strategy_id TEXT NOT NULL,
      dimension TEXT NOT NULL,
      score INTEGER DEFAULT 3,
      current_state TEXT,
      changes_needed TEXT,
      updated_at TEXT
    )
  `);
} catch (_) {}
```

Also update the web stub's `buildDefaultWebStore()` to include `strategy_alignments: []`.

### Step 2: Strategy Repo (`db/strategyRepo.ts`)

Add new interface:
```typescript
export interface StrategyAlignment {
  id: string;
  strategy_id: string;
  dimension: 'structure' | 'processes' | 'capabilities';
  score: number;
  current_state?: string | null;
  changes_needed?: string | null;
  updated_at?: string | null;
}
```

Add new functions:
```typescript
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
    return { ...existing, score, current_state: currentState ?? existing.current_state ?? null, changes_needed: changesNeeded ?? existing.changes_needed ?? null, updated_at: now };
  }

  const id = uuid();
  await db.runAsync(
    'INSERT INTO strategy_alignments (id, strategy_id, dimension, score, current_state, changes_needed, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, strategyId, dimension, score, currentState ?? null, changesNeeded ?? null, now]
  );
  return { id, strategy_id: strategyId, dimension, score, current_state: currentState ?? null, changes_needed: changesNeeded ?? null, updated_at: now };
}
```

### Step 3: Redesign Strategy UI (`app/(tabs)/track/strategy/index.tsx`)

**Rewrite** the screen to have this structure:

1. **Vision card** (keep as-is — editable text area)
2. **Mission card** (keep as-is — editable text area)
3. **Strategies list** with "+ Add Strategy" button
4. Each strategy card is **expandable** (tap to expand). When expanded, show:
   - **Overview** — the strategy description (editable TextInput)
   - **Structure** — "Current team structure relevant to this strategy and how to review it"
     - TextInput for `current_state`
     - TextInput for `changes_needed`
     - 1-5 alignment score slider (reuse the ±1 stepper pattern)
   - **Processes** — "Relevant processes to support this strategy and how they need changing"
     - Same three fields as Structure
   - **Capabilities** — "Capabilities in the team and how they need to change"
     - Same three fields as Structure

5. **REMOVE** the separate "⚖️ Alignment Assessment" section (the global one with Structure/Processes/Capabilities). Alignment is now per-strategy.

6. **REMOVE** the "Early Wins" link/button from this screen. Early Wins is now its own screen on Track home (see Fix 9).

**Implementation details for each expanded strategy:**

```tsx
const ALIGNMENT_DIMS = [
  { key: 'structure' as const, title: '🏗 Structure', desc: 'Current team structure relevant to this strategy and how to review it' },
  { key: 'processes' as const, title: '⚙️ Processes', desc: 'Relevant processes to support this strategy and how they need changing' },
  { key: 'capabilities' as const, title: '🧠 Capabilities', desc: 'Capabilities in the team and how they need to change' },
] as const;
```

For each strategy, track alignment data in state using a map: `strategyAlignments: Map<string, StrategyAlignment[]>`. Load on mount and when a strategy is expanded.

Use `expandedStrategyId` state (string | null) to track which strategy is expanded. Only one at a time.

When strategy is expanded, show alignment dimensions with:
- Score display (1-5 with + / - buttons and colour coding)
- "Current state" text area
- "Changes needed" text area
- Auto-save on blur

**Import the new functions:**
```typescript
import {
  getVisionMission, saveVisionMission,
  getStrategies, saveStrategy, deleteStrategy,
  getStrategyAlignments, saveStrategyAlignment,
  type Strategy, type StrategyAlignment, type StrategyVision,
} from '../../../../db/strategyRepo';
```

Remove imports for `getAlignmentScores`, `saveAlignmentScore`, `AlignmentScore`.

---

## FIX 9 (T2): Promote Early Wins to Track Home

### Step 1: Create `app/(tabs)/track/early-wins.tsx`

Create a NEW file at `app/(tabs)/track/early-wins.tsx`. Copy the EXACT content from `app/(tabs)/track/strategy/early-wins.tsx` but change:
- Back button text from "← Strategy" to "← Track"
- The back route goes to Track home

The file content should be identical to the existing `app/(tabs)/track/strategy/early-wins.tsx` except:
```tsx
<Pressable onPress={() => router.back()}><Text style={styles.backText}>← Track</Text></Pressable>
```

### Step 2: Update Track home (`app/(tabs)/track/index.tsx`)

Change the SECTIONS array to have 6 cards in a 2×3 grid:

```typescript
const SECTIONS = [
  { key: 'people', emoji: '👤', title: 'People', desc: 'Stakeholders, reports, relationships', route: '/(tabs)/track/people' },
  { key: 'diagnostics', emoji: '🔍', title: 'Diagnostics', desc: 'SWOT, Porter, STARS mapping', route: '/(tabs)/track/diagnostics' },
  { key: 'strategy', emoji: '🎯', title: 'Strategy', desc: 'Vision, mission, and strategic priorities', route: '/(tabs)/track/strategy' },
  { key: 'early-wins', emoji: '⚡', title: 'Early Wins', desc: 'Track and deliver quick wins', route: '/(tabs)/track/early-wins' },
  { key: 'meetings', emoji: '📝', title: 'Meetings', desc: 'Log meetings and conversations', route: '/(tabs)/track/meetings' },
  { key: 'reflect', emoji: '💭', title: 'Reflect', desc: 'Daily reflections and energy tracking', route: '/(tabs)/track/reflect' },
] as const;
```

**IMPORTANT:** Remove the separate "Daily Reflection" full-width card at the bottom since Reflect is now in the grid.

Also change the Strategy card title from "Strategy &\nAlignment" to just "Strategy".

The grid should now render all 6 cards using the existing grid layout (2 columns).

### Step 3: Update Strategy screen title

In `app/(tabs)/track/strategy/index.tsx`, change the heading from "Strategy & Alignment" to "Strategy" since alignment is now per-strategy within the page, and Early Wins is separate.

---

## FIX 10 (D1): Data Persistence — Investigate and Fix

**Investigation checklist:**

1. Check `db/database.ts` — the V4 migration adds columns `has_diagnostic`, `diagnostic_type`, `has_strategy`, `has_early_win` to meetings. These use `ALTER TABLE` with try/catch which is correct.

2. Check `db/meetingsRepo.ts` `saveMeeting()` — the INSERT includes ALL V4 columns with proper defaults. This looks correct.

3. Check `db/peopleRepo.ts` `savePerson()` — standard INSERT/UPDATE. This looks correct.

4. **Potential issue:** The `initStrategyTables()` function in `db/strategyRepo.ts` is called at the start of every strategy operation. It creates tables if they don't exist. But on first app launch, if a user goes to Meetings before Strategy, the `strategy_alignments` table won't exist yet. This could cause issues if any code references it. Make sure all table creation happens in `initSchema()` in `database.ts`.

5. **Potential issue:** The `is_user_task` column is used in `seedChecklistIfEmpty()` delete query but isn't added via ALTER TABLE migration — it's created with the initial table. But older DB versions might not have it. Add a migration:
```typescript
try { await database.execAsync('ALTER TABLE checklist_items ADD COLUMN is_user_task INTEGER DEFAULT 0'); } catch (_) {}
```

6. **Test:** After all fixes, verify `npx tsc --noEmit` passes.

**FIX:** Move ALL table creation into `initSchema()` in `database.ts` so tables exist on first launch regardless of navigation order. Add strategy tables to the main schema:

After the existing CREATE TABLE blocks in `initSchema()`, add:
```sql
CREATE TABLE IF NOT EXISTS strategy_vision (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS strategies (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS alignment_scores (
  id TEXT PRIMARY KEY,
  dimension TEXT NOT NULL,
  score INTEGER DEFAULT 3,
  notes TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS early_wins (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'identified',
  is_visible INTEGER DEFAULT 0,
  is_team_owned INTEGER DEFAULT 0,
  addresses_frustration INTEGER DEFAULT 0,
  connected_to_strategy INTEGER DEFAULT 0,
  notes TEXT,
  date_identified TEXT,
  date_delivered TEXT,
  created_at TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS strategy_alignments (
  id TEXT PRIMARY KEY,
  strategy_id TEXT NOT NULL,
  dimension TEXT NOT NULL,
  score INTEGER DEFAULT 3,
  current_state TEXT,
  changes_needed TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS diagnostic_notes (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS stars_assessment (
  id TEXT PRIMARY KEY,
  dimension TEXT NOT NULL,
  percentage INTEGER DEFAULT 0,
  notes TEXT,
  updated_at TEXT
);
CREATE TABLE IF NOT EXISTS checklist_meta (
  key TEXT PRIMARY KEY,
  value TEXT
);
```

Add the `is_user_task` migration too:
```typescript
try { await database.execAsync('ALTER TABLE checklist_items ADD COLUMN is_user_task INTEGER DEFAULT 0'); } catch (_) {}
```

This ensures all tables exist on first launch.

---

## FIX 11: Bump CHECKLIST_DATA_VERSION

**File:** `db/checklistRepo.ts`

No checklist content changes in this round, so DO NOT bump the version. Leave `CHECKLIST_DATA_VERSION = 6`.

---

## BUILD ORDER

Execute in this exact sequence:

1. **Fix 8 step 1 & Fix 10:** Update `db/database.ts` — add all table creation to initSchema, add strategy_alignments migration
2. **Fix 8 step 2:** Update `db/strategyRepo.ts` — add StrategyAlignment interface and CRUD
3. **Fix 8 step 3:** Rewrite `app/(tabs)/track/strategy/index.tsx` — per-strategy alignment, remove global alignment, remove early wins link
4. **Fix 9 step 1:** Create `app/(tabs)/track/early-wins.tsx` — copy from strategy/early-wins.tsx with back button change
5. **Fix 9 step 2:** Update `app/(tabs)/track/index.tsx` — 6 cards grid
6. **Fixes 1-5:** Update `app/(tabs)/learn/index.tsx` — remove phase banner, fix arrows, fix redundancy, fix labels
7. **Fixes 6-7:** Update `app/(tabs)/checklist/index.tsx` — fix indentation
8. Run `npx tsc --noEmit` and fix ALL errors

## VERIFICATION

After all changes:
1. `npx tsc --noEmit` → zero errors
2. Check that all changed files have correct imports
3. Check that the web stub in database.ts includes `strategy_alignments` in buildDefaultWebStore

## When completely finished, run:
```
openclaw gateway wake --text "Codex done: Round 2 — all 11 fixes implemented" --mode now
```
