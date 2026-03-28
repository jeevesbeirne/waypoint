# Waypoint V4 — QA Re-run

## Status
Build is COMPLETE. All code is written and committed. This is a QA-only pass — no new features to build.

## Start command
```bash
cd ~/waypoint/app-v2 && CI=1 npx expo start --port 8081
```
Web app at: http://localhost:8081

## What was built (V4 redesign)
- 4 tabs: Learn | Checklist | Track | Settings
- Learn tab: "How to think about your transition" section, phase-aware heading
- Checklist: tick box RIGHT, expand arrow LEFT, vertical lines, depth 0/1/2
- Track tab with 5 sub-sections: People, Diagnostics (SWOT/Porter/STARS/Notes), Strategy & Alignment (Vision/Mission/Strategy + Alignment + Early Wins), Meetings, Reflect
- Settings: start date, leader level, transition summary only
- 95 tasks from spreadsheet, all 10 Watkins groups

## Spec
Full brief: `~/waypoint/FORGE_V4_BRIEF.md`

## Current task: QA REVIEW ONLY
Inspector should test the running app interactively, then review code. Score and report.

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
