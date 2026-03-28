# QA-CODE-1 — Waypoint App V4 Review

**Date:** 2026-03-28  
**Reviewer:** Inspector (QA-Code Agent)  
**Build:** V4 redesign (Waypoint v2.0.0)  
**Method:** Interactive browser testing on web + code review  

---

## Verdict: ❌ FAIL — Overall Score: 6.5/10

---

## Scores

| Dimension       | Score | Notes |
|-----------------|-------|-------|
| **Correctness** | 5/10  | Critical onboarding persistence bug; web DB stub silently drops UPDATE data |
| **Security**    | 7/10  | No auth (expected for local app), but SQL in web stub is fragile |
| **Robustness**  | 6/10  | Refresh kills session; web stub swallows errors silently |
| **Code Quality**| 8/10  | Well-structured, good component separation, consistent styling |

**Overall: 6.5/10** → FAIL (threshold ≥ 8)

---

## Critical Bugs (Required Fixes)

### 1. 🔴 CRITICAL — Onboarding state lost on page refresh (web)
- **File:** `db/database.ts`, lines 68–76 (web stub `runAsync`)
- **Impact:** Every page refresh, URL navigation, or browser reload resets the app to the onboarding screen. Completely breaks the app on web.
- **Root cause:** The web stub's `runAsync` UPDATE handler does `Object.assign(webStore.settings[0], params ? {} : {})` — the ternary always evaluates to `{}`, so no fields are actually updated. The INSERT path via `mapInsertParams` works, but subsequent UPDATEs (including `saveSettings({ onboarding_complete: 1 })`) are silently discarded.
- **Also:** `webStore` is a module-level in-memory object with no persistence (no localStorage, no IndexedDB). Any navigation that causes a module reload wipes all data.
- **Fix:** Either (a) implement proper SQL parsing in the web stub's `runAsync` for UPDATE, or (b) persist `webStore` to `localStorage`, or (c) use a real web SQLite library like `sql.js`.

### 2. 🔴 CRITICAL — Web stub `runAsync` UPDATE is a no-op
- **File:** `db/database.ts`, line 73
- **Code:** `Object.assign(webStore.settings[0], params ? {} : {})`
- **Impact:** This line does nothing — `params` is always truthy (an array), so it assigns `{}` to settings. All `UPDATE` calls on web are silently ignored: settings saves, checklist toggles persisting, alignment scores, reflections — none survive.
- **Fix:** Parse the SET clause from the SQL string and map `params` to the correct fields, or replace with a proper web DB.

### 3. 🟠 HIGH — Checklist toggle does not persist on web
- **File:** `db/database.ts` (web stub) + `db/checklistRepo.ts`
- **Impact:** Ticking a checkbox in the checklist works visually (Zustand state updates), but the web stub's `runAsync` for UPDATE on `checklist_items` table is not properly implemented. If you navigate away and come back, completion state is lost.
- **Fix:** The web stub needs proper UPDATE support for `checklist_items` table, or use a full web SQLite implementation.

### 4. 🟠 HIGH — Meeting/People/Reflection data cannot be saved on web
- **File:** `db/database.ts` (web stub `runAsync`)
- **Impact:** The `runAsync` INSERT handler only specifically handles `INSERT INTO settings`. All other INSERT statements (people, meetings, daily_logs, etc.) are not handled. The web stub is essentially read-only except for a broken settings INSERT.
- **Fix:** Generalize the `runAsync` INSERT handler to parse table name and map columns for any table, or implement a proper SQL layer.

### 5. 🟡 MEDIUM — Duplicate emoji rendering in tab bar (web)
- **File:** `app/(tabs)/_layout.tsx`
- **Observed:** Tab labels render as "📚 📚 Learn", "✅ ✅ Checklist", etc. — each emoji appears twice.
- **Cause:** Likely an expo-router web rendering issue where `tabBarIcon` and the tab's accessible name both render the emoji. The code itself only specifies one emoji per tab.
- **Fix:** Test with `tabBarShowIcon: false` on web, or add `tabBarAccessibilityLabel` to prevent duplication.

### 6. 🟡 MEDIUM — Inconsistent leader level naming between screens
- **File:** `app/onboarding/role-setup.tsx` line 16 vs `app/(tabs)/settings/index.tsx` line 24
- **Onboarding:** "Senior Manager / Director"
- **Settings:** "Director / Senior Manager"
- **Fix:** Standardize to one label. Extract `LEADER_LEVELS` to a shared constant.

### 7. 🟡 MEDIUM — QuickCaptureFAB visible on Learn tab (unnecessary)
- **File:** `components/QuickCaptureFAB.tsx`, line 43
- **Impact:** The floating "+" button appears on the Learn tab where it serves no useful purpose (Learn is read-only content). It also appears on Checklist, which already has its own "+ Add Task" button, making it redundant.
- **Fix:** Remove `'learn'` from `allowedTabs` array. Consider whether Checklist also needs it given the existing "+ Add Task" button.

### 8. 🟡 MEDIUM — Strategy page title says "Strategy" but card says "Strategy & Alignment"
- **File:** `app/(tabs)/track/strategy.tsx` (header) vs `app/(tabs)/track/index.tsx` (card)
- **Impact:** Minor branding inconsistency between the Track home card ("Strategy & Alignment") and the actual page header ("Strategy").
- **Fix:** Make the page header match: "Strategy & Alignment".

---

## Positive Findings

- ✅ **All 10 Watkins groups present** in checklist (Prepare Yourself, Accelerate Your Learning, Match Strategy to Situation, Negotiate Success, Secure Early Wins, Achieve Alignment, Build Your Team, Create Alliances, Manage Yourself, Accelerate Everyone)
- ✅ **105 checklist items** correctly seeded and displayed
- ✅ **Checklist hierarchy** works correctly: expand arrows LEFT, checkboxes RIGHT, vertical connecting lines, depth 0/1/2
- ✅ **Track hub** has all 5 sub-sections: People, Diagnostics, Strategy & Alignment, Meetings, Daily Reflection
- ✅ **Diagnostics** has all 4 tools: SWOT, Porter's Five Forces, STARS Mapping, General Notes
- ✅ **Strategy** has Vision, Mission, Strategies, Alignment Assessment (3 dimensions), Early Wins
- ✅ **Reflect** has daily prompt with category tag, day counter (Day 1 of 90), energy tracking
- ✅ **Settings** has start date, leader level, transition summary, and About section
- ✅ **Onboarding flow** works correctly within a single session (welcome → role setup → main app)
- ✅ **Learn tab** has phase heading, "How to think about your transition" section, all 10 key topics, Framework section, About Waypoint
- ✅ **Code quality** is generally high: clean component structure, consistent theme usage, proper TypeScript types
- ✅ **4-tab layout** (Learn, Checklist, Track, Settings) correctly implemented

---

## Architecture Notes

- The web platform uses an **in-memory stub** instead of a real database. This is the source of most bugs — it's essentially a demo-only implementation that doesn't survive state changes.
- The **native platform** (iOS/Android) uses expo-sqlite with proper schema and migrations — this likely works correctly.
- The **Zustand store** provides immediate UI updates, masking the fact that persistence is broken on web.
- The app's **routing** uses expo-router with a nested `(tabs)` group and an `onboarding` group, gated by an `onboarded` flag loaded from the database on mount.

---

## Summary

The app's **UI, content, and component structure are solid**. The design is clean, the 105-item checklist is comprehensive, and all specified features exist. The Learn tab, Track sub-sections, and Reflect screen all function as designed within a single session.

However, the **web database stub is fundamentally broken** — it cannot persist any data across page loads, and its UPDATE handler is a literal no-op. This makes the app unusable as anything beyond a static demo on web. Every refresh resets to onboarding, and no user data (settings, checklist progress, reflections, people, meetings) survives.

**The #1 priority fix is replacing or properly implementing the web database stub.** Until that's done, the web version is non-functional for any real use.
