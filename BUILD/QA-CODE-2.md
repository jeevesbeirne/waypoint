# QA-CODE-2 — Waypoint App V4 Review (Loop 2)

**Date:** 2026-03-28  
**Reviewer:** Inspector (QA-Code Agent)  
**Build:** V4 redesign — post QA-CODE-1 fixes  
**Method:** Interactive browser testing on web (ports 8081 + 8765) + source code review  

---

## Verdict: ❌ FAIL — Overall Score: 6.0/10

---

## Scores

| Dimension       | Score | Notes |
|-----------------|-------|-------|
| **Correctness** | 5/10  | Checklist duplication on every reload is a showstopper; seeding logic breaks persistence |
| **Security**    | 7/10  | No auth (expected for local app); web stub SQL parsing is fragile but adequate |
| **Robustness**  | 5/10  | App breaks on reload due to re-seeding; 400+ React key warnings; deep-linking broken |
| **Code Quality**| 7/10  | Fixes are well-structured but critical integration gap: seedChecklistIfEmpty vs web stub |

**Overall: 6.0/10** → FAIL (threshold ≥ 8)

---

## Critical Finding: Metro Stale Bundle

**The Metro server on port 8081 (the specified test port) is serving a STALE BUNDLE that does NOT include ANY of the 8 fixes.** The Metro process on port 8081 was started at 20:27, but code fixes were applied at 20:41–20:43. With `CI=1`, Metro doesn't hot-reload.

```
Port 8081 bundle: contains OLD code (Object.assign(webStore.settings[0], params ? {} : {}))
Port 8765 bundle: contains NEW code (persistWebStore, tabBarShowIcon, etc.)
```

**All fix verification was done on port 8765** (the newer Metro instance with the actual fixes). The port 8081 instance is useless for testing fixes.

**Action required:** Kill the port 8081 Metro, clear cache, restart: `npx expo start --port 8081 --clear`

---

## Fix Verification Summary

| # | Issue | Fix Status | Notes |
|---|-------|-----------|-------|
| 1 | Onboarding state lost on refresh | ✅ FIXED (port 8765) | localStorage persistence works; settings survive reload |
| 2 | Checklist toggle doesn't persist | ❌ BROKEN (new bug) | Checked items survive in localStorage BUT `seedChecklistIfEmpty` re-seeds on every reload, appending duplicates and resetting completion state |
| 3 | Tab bar duplicate emojis | ✅ FIXED (port 8765) | `tabBarShowIcon: false` on web works correctly |
| 4 | Leader level label inconsistency | ✅ FIXED (source code) | Shared `LEADER_LEVELS` constant in `lib/constants.ts` |
| 5 | FAB on Learn tab | ✅ FIXED (port 8765) | `'learn'` removed from `allowedTabs` — visually confirmed |
| 6 | Strategy page title mismatch | ✅ FIXED (source code + Track hub) | Heading says "Strategy & Alignment" in source; Track hub card confirmed visually |
| 7 | People/data save persistence | ⚠️ PARTIALLY FIXED | INSERT/UPDATE now work, but the same re-seeding bug may affect other data tables |

---

## New Critical Bugs

### 1. 🔴 CRITICAL — Checklist items duplicated 4x on every page reload

- **Files:** `db/database.ts` (web stub `getFirstAsync`), `db/checklistRepo.ts` (`seedChecklistIfEmpty`)
- **Impact:** App shows 420 items instead of ~105. "Prepare Yourself" has 53 items instead of ~11. "Accelerate Your Learning" has 184 items instead of ~46. Every subsequent reload adds another full copy.
- **Root cause:** `seedChecklistIfEmpty()` queries `checklist_meta` table for `data_version`, but `getFirstAsync` in the web stub has no handler for `checklist_meta` queries — it returns `null`. This makes `currentVersion = 0`, which is always < `CHECKLIST_DATA_VERSION = 6`. The function then calls `execAsync('DELETE FROM checklist_items WHERE is_user_task = 0...')` — but `execAsync` is a no-op in the web stub. So existing items are never deleted, and the full 105-item set is re-inserted via `runAsync`, duplicating everything.
- **Fix options:**
  1. Add `checklist_meta` handling to `getFirstAsync` (e.g. `if (sql.includes('FROM checklist_meta')) return webStore.checklist_meta?.[0] as T ?? null`)
  2. Make `execAsync` handle DELETE statements (currently it's a no-op)
  3. Change the INSERT to use `INSERT OR REPLACE` with proper ID matching to deduplicate

### 2. 🔴 CRITICAL — Checklist completion state wiped on reload

- **Impact:** Even when a user checks items, the re-seeding on next reload pushes new unchecked copies of the same items into the array, and the old checked items may be buried or overwritten.
- **Root cause:** Same as above — re-seeding doesn't clear old items (execAsync DELETE is no-op) and doesn't check for existing items by ID before inserting.

### 3. 🟠 HIGH — 400+ React duplicate key warnings

- **Observed:** Yellow toast showing "457 Encountered two children with t..." (truncated "Encountered two children with the same key")
- **Cause:** Checklist items have the same IDs due to duplication. React's key prop receives duplicate values.
- **Impact:** Performance degradation, potential rendering bugs, console spam

### 4. 🟡 MEDIUM — Deep-linking to tabs doesn't work

- **Observed:** Navigating directly to `http://localhost:8765/settings` or `http://localhost:8765/checklist` always redirects to the Learn tab
- **Cause:** `_layout.tsx` always calls `router.replace('/(tabs)/learn')` when `onboarded === true`, ignoring the current URL path
- **Impact:** Browser back/forward, bookmarks, and direct URL access are broken

### 5. 🟡 MEDIUM — `execAsync` is a complete no-op on web

- **File:** `db/database.ts`, line 83: `execAsync: async (_sql: string) => {}`
- **Impact:** Any SQL executed via `execAsync` (CREATE TABLE, DELETE, PRAGMA, ALTER TABLE) is silently ignored. This causes the checklist duplication bug and may cause other subtle issues.
- **Fix:** At minimum, implement DELETE handling in `execAsync` (or redirect to `runAsync` for DELETE statements)

---

## Positive Findings (confirmed on port 8765 with updated code)

- ✅ Onboarding state persists across page refresh (Fix 1 works)
- ✅ Tab bar shows single emoji per tab on web (Fix 3 works)
- ✅ Leader level labels are consistent via shared constant (Fix 4 works)
- ✅ No FAB on Learn tab (Fix 5 works)
- ✅ Strategy card says "Strategy & Alignment" on Track hub (Fix 6 works)
- ✅ INSERT and UPDATE handlers in web stub now work generically
- ✅ localStorage persistence layer is implemented and functional
- ✅ Web stub correctly parses SET/WHERE clauses for UPDATE
- ✅ Learn tab content is comprehensive and well-structured
- ✅ Track hub has all 5 sections: People, Diagnostics, Strategy & Alignment, Meetings, Daily Reflection
- ✅ Code quality of fixes is good: shared constants, platform checks, proper SQL parsing

---

## Architecture Assessment

The web stub has been significantly improved but has a critical gap: **`getFirstAsync` and `execAsync` are not generic enough to handle all the SQL queries the app issues.** The app's `seedChecklistIfEmpty` function uses queries that the web stub doesn't handle, creating a fatal interaction.

The fix is straightforward:
1. Make `getFirstAsync` fall back to a generic "search all tables" approach for unrecognized queries, OR add explicit handling for `checklist_meta`
2. Make `execAsync` handle at minimum DELETE statements (delegate to the existing DELETE logic in `runAsync`)
3. Consider consolidating `execAsync` and `runAsync` for operations that can modify data

---

## Summary

5 of the 8 original fixes are confirmed working in the source code and on the updated Metro bundle (port 8765). However, the **checklist persistence fix introduced a critical regression** — the interaction between `seedChecklistIfEmpty`'s version-checking logic and the web stub's incomplete `getFirstAsync`/`execAsync` handlers causes checklist items to be duplicated 4x on every page reload and completion state to be wiped.

**The port 8081 Metro server (specified in HANDOFF.md) is still serving the pre-fix bundle and must be restarted.**

### Priority fixes for Loop 3:
1. **CRITICAL:** Add `checklist_meta` query handling to `getFirstAsync` in the web stub
2. **CRITICAL:** Implement DELETE in `execAsync` (or delegate to `runAsync`'s DELETE handler)
3. **HIGH:** Fix deep-linking — don't override URL path in `_layout.tsx` when already on a valid tab route
4. **PROCESS:** Restart Metro on port 8081 (or use `--clear` flag) after code changes
