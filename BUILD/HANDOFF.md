# Waypoint V4 — Build Handoff

## Status
Build is COMPLETE. Round 2 user testing fixes applied and committed.

## Start command
```bash
cd ~/waypoint/app-v2 && CI=1 npx expo start --port 8081
```
Web app at: http://localhost:8081

## What was built (V4 redesign)
- 4 tabs: Learn | Checklist | Track | Settings
- Learn tab: "How to think about your transition" section, simple heading (no phase banner)
- Checklist: tick box RIGHT, expand arrow LEFT, vertical lines, depth 0/1/2
- Track tab with 6 sub-sections: People, Diagnostics, Strategy, Early Wins, Meetings, Reflect
- Settings: start date, leader level, transition summary only
- 95 tasks from spreadsheet, all 10 Watkins groups

## Spec
Full brief: `~/waypoint/FORGE_V4_BRIEF.md`
Round 2 fixes: `~/waypoint/FORGE_V4_ROUND2.md`

---

## Round 2 Fixes (2026-03-28)

All 11 issues from user testing fixed. `npx tsc --noEmit` passes clean. Commit: `545ab68`.

### Learn Tab (5 fixes)

**L1: Removed phase banner**
- Deleted the "Before Day 1 / Prepare Yourself" hero heading from Learn tab
- Replaced with simple "📚 Learn" heading + subtitle
- Removed all `phaseBanner*` and `phasePill*` styles and associated state/imports

**L2: Expand arrows match Checklist pattern**
- Category accordion now uses large ▶/▼ arrows on the LEFT side
- 44×44 touch targets matching the Checklist expand button pattern
- Removed old right-side ▲/▼ chevrons

**L3: Removed redundant topic expand**
- Expanding a category now immediately shows article bullets + "Read full article →" button
- Removed the intermediate article title/expand step
- Removed `expandedArticles` state and `toggleArticle` function

**L4: Label corrections**
- "8. Create Coalitions" → "8. Create Alliances"
- "9. Keep Your Balance" → "9. Manage Yourself"

**L5: All 10 topics visible**
- Confirmed all 10 CATEGORIES entries have matching articles in `learningContent.ts`
- All 10 now render correctly with the label fixes from L4

### Checklist (2 fixes)

**C1/C2: Sub-task indentation fixed for native**
- Changed indentation approach: `marginLeft: spacing.lg + (depth * 32)` applied directly to the row wrapper
- Depth 1 → +32px indent, Depth 2 → +64px indent
- Added colored accent bar (4px wide) for depth > 0 items instead of connecting line Views
- Removed the old `Array.from({ length: depth })` connecting line approach

### Track Restructure (2 fixes)

**T1: Strategy restructured — per-strategy alignment**
- Each strategy card is now expandable (tap to expand)
- Expanded view shows: Overview text + Structure/Processes/Capabilities alignment sections
- Each alignment dimension has: score (1-5 with ±1 steppers), "Current state" text area, "Changes needed" text area
- All fields auto-save on blur
- **Removed** the global "⚖️ Alignment Assessment" section (alignment is now per-strategy)
- **Removed** the Early Wins link from Strategy page
- Changed heading from "Strategy & Alignment" to "Strategy"

**T2: Early Wins promoted to Track home**
- Created `app/(tabs)/track/early-wins.tsx` — standalone Early Wins screen
- Track home now shows 6 cards: People, Diagnostics, Strategy, Early Wins, Meetings, Reflect
- Removed the separate "Daily Reflection" full-width card (Reflect is now in the grid)

### Data Persistence (1 fix + bonus)

**D1: Database schema hardening**
- Moved ALL strategy tables into `initSchema()` in `database.ts` (strategy_vision, strategies, alignment_scores, early_wins, strategy_alignments, diagnostic_notes, stars_assessment, checklist_meta)
- Added `is_user_task INTEGER DEFAULT 0` migration for checklist_items
- Added `strategy_alignments` table creation in both native schema and web stub
- **Bonus fix**: Fixed web stub `getFirstAsync()` to properly filter by WHERE params — was returning wrong records when looking up by specific ID/type

### Files changed
- `app/(tabs)/learn/index.tsx` — L1-L5 (phase banner, arrows, redundancy, labels)
- `app/(tabs)/checklist/index.tsx` — C1/C2 (indentation)
- `app/(tabs)/track/index.tsx` — T2 (6-card grid)
- `app/(tabs)/track/strategy/index.tsx` — T1 (per-strategy alignment)
- `app/(tabs)/track/early-wins.tsx` — T2 (new file)
- `db/database.ts` — D1 (schema hardening, web stub fix)
- `db/strategyRepo.ts` — T1 (StrategyAlignment CRUD)
- `CODEX-ROUND2.md` — build brief (new file)

---

## QA-CODE-1 Fixes (2026-03-28)

All 8 issues from QA-CODE-1 report fixed. `npx tsc --noEmit` passes clean.

### Fixes 1–4: Web DB stub rewrite (`db/database.ts`)
- **INSERT** now generic — parses table name from SQL, maps columns to params (including handling literal values like `1` in `VALUES`), stores in correct `webStore[table]` array
- **UPDATE** now generic — parses SET columns and WHERE clause, maps params correctly, updates matching rows
- **DELETE** support added for completeness
- **localStorage persistence** — `webStore` loads from `localStorage` on init via `loadWebStore()`, persists after every write via `persistWebStore()`. Data survives page reloads.
- **Verified**: complete onboarding → refresh → stays on main app (not sent back to onboarding). Tick checklist items → refresh → still ticked.

### Fix 5: Duplicate emoji in tab bar (`app/(tabs)/_layout.tsx`)
- Added `Platform` import, set `tabBarShowIcon: false` on web for each tab to prevent emoji rendering twice

### Fix 6: Inconsistent leader level naming
- Created `lib/constants.ts` with shared `LEADER_LEVELS` array (standardised to "Senior Manager / Director")
- Updated `app/onboarding/role-setup.tsx` and `app/(tabs)/settings/index.tsx` to import from shared constant

### Fix 7: QuickCaptureFAB on Learn tab (`components/QuickCaptureFAB.tsx`)
- Removed `'learn'` from `allowedTabs` array — FAB no longer shows on Learn tab

### Fix 8: Strategy page title (`app/(tabs)/track/strategy/index.tsx`)
- Changed heading from "Strategy" to "Strategy & Alignment" to match Track home card
