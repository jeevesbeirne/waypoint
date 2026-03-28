# QA-UX Report — Loop 1
Date: 2026-03-28

## Market research summary

- **Best-in-class task/checklist apps** (Todoist, Things 3, TickTick) share common patterns: bottom tab navigation, clean visual hierarchy, satisfying completion animations, search + filtering, and clear parent/child task relationships with indentation. Things 3 in particular is praised for its "elegant" design — minimal chrome, generous whitespace, and subtle interactions.
- **Executive onboarding is served by frameworks, not apps.** The First 90 Days by Watkins is the gold standard, but solutions are typically delivered as PDF toolkits, coaching programmes (IMD, Enboarder), or embedded in HR platforms — not as standalone mobile apps. This means Waypoint occupies a genuine market gap.
- **Common UX complaints** about leadership/productivity apps include: overwhelming feature density, unclear next actions, too many empty states on first use, and poor cross-referencing between related data (e.g. notes from meetings not connected to people or strategy).
- **Notion and Obsidian** are increasingly used by executives for personal knowledge management, but lack structured frameworks — Waypoint's opinionated Watkins structure is a differentiator.
- **Accessibility standards for productivity apps**: WCAG 2.1 AA minimum — adequate contrast, minimum 44×44px touch targets, clear focus indicators, screen reader compatibility.

## Overall score: 8.0/10
(Average of four dimensions)

## Dimension scores
- Feature completeness: 8/10
- UX patterns: 8/10
- Polish and detail: 8/10
- Accessibility: 8/10

## PASS

This app would genuinely be useful to a Director starting a new role. The Watkins framework integration is thoughtful, the content quality is high, and the feature set covers the full spec. A few issues prevent a higher score.

---

## Detailed analysis

### Feature completeness: 8/10

**What works well:**
- All 4 tabs present and functional (Learn, Checklist, Track, Settings)
- Learn tab: "How to think about your transition" section with 4 stages, "About the research" collapsible, all 10 Watkins topics with expandable article previews, full article reader with key takeaways
- Checklist: 105 tasks, By Topic / By Week views, search, comprehensive filters (status, phase, Watkins group), parent/child hierarchy with expand/collapse, checkbox on right side, vertical connecting lines, "+ Add Task" functionality
- Track: 5 sub-sections (People, Diagnostics, Strategy & Alignment, Meetings, Daily Reflection)
- Track → People: grouped by relationship type, comprehensive add form (relationship type, influence, alignment, key stakeholder toggle), person detail with 3 tabs (Overview, Conversations, Assessment)
- Track → Diagnostics: SWOT (4 quadrants with add), Porter's Five Forces (5 sections), STARS Mapping (5 types with percentage steppers and totals), General Notes
- Track → Strategy: Vision, Mission, Strategies (add), Alignment Assessment (Structure/Processes/Capabilities with 1-5 scale), Early Wins
- Track → Meetings: search, new meeting form with type chips, people present integration, cross-reference flags (diagnostic/strategy/early win)
- Track → Reflect: contextual daily prompt with day counter, text area, save
- Settings: start date, leader level, transition summary, about section

**Issues:**
1. **Assessment tab shows no default criteria.** The spec calls for 6 default Watkins criteria (Competence, Judgement, Energy, Focus, Relationships, Trust) pre-populated with +/- steppers and progress bars. Currently shows "0/0" with Edit criteria / + Add / Reset buttons but nothing visible. This is the most significant feature gap — a Director looking to assess their direct reports would see an empty screen with no guidance on what to assess.
2. **Porter's Five Forces missing overview summary.** The spec calls for "Overview summary at top: simple indicator (High/Medium/Low) for each force." Currently only shows the 5 expandable sections without a summary view. Minor but reduces the diagnostic value.

### UX patterns: 8/10

**What works well:**
- Bottom tab navigation follows platform conventions (like Things 3, Todoist)
- Consistent navigation pattern: Track home → sub-section → detail → back
- "← Back" and "← Track" breadcrumbs provide clear navigation context
- Empty states throughout are well-crafted with icons, descriptive text, and clear CTAs ("+ Add your first person", "+ Log your first meeting", "No early wins yet")
- Filter chips use familiar toggle pattern
- Segmented controls (By Topic / By Week) are intuitive
- Person add form uses appropriate input types (chips for relationship type, scale for influence/alignment)
- Meeting form correctly integrates with People list
- Cross-reference flags on meetings are a genuinely thoughtful feature that addresses a real user need (connecting information across contexts)
- Search bars present where needed (People, Meetings, Checklist)

**Issues:**
3. **Checklist sub-task indentation could be more visually distinct.** While vertical connecting lines exist, the sub-tasks (e.g. "Schedule early meetings — direct reports" as a child of "Schedule early meetings for relationship building") appear at the same visual indent level as siblings of the parent. Compare to Things 3 where child tasks have clear indentation + a connecting line, making the hierarchy immediately scannable. The sub-tasks are shown but the visual differentiation between "child that's expanded out of parent" and "independent sibling task" is subtle.
4. **No confirmation feedback on save actions.** When saving a person, meeting, or reflection, there's no toast/snackbar confirming the save succeeded. Best practice (Todoist, Notion) shows brief success feedback. The app silently navigates back, which works but isn't confidence-inspiring for a first-time user.

### Polish and detail: 8/10

**What works well:**
- Warm, professional colour scheme (cream background, navy headers, amber/gold accents) — doesn't feel like generic AI-generated UI
- Consistent card styling throughout
- Good typography hierarchy (headers, body, metadata)
- Article reading experience is genuinely excellent — Key Takeaways box, proper paragraph spacing, bold for emphasis, "What to do" action sections
- Emoji use is tasteful and functional (🔍 for diagnostics, 📋 for strategies, 🏆 for early wins) without being childish
- Version number in Settings footer
- STARS Mapping screen is particularly well-designed with stepper controls and progress bars
- Alignment Assessment uses amber colour coding with "3/5 — Partial" labels

**Issues:**
5. **React Native warning visible in UI.** "Unexpected text node: . A text n..." error toast appears at the bottom of the People list screen. This is a development warning leaking into the user-visible UI. A Director would see this and question the app's quality.
6. **Learn tab doesn't scroll properly in web view.** The Learn tab content extends below the fold (including the framework section and About Waypoint) but the scroll view doesn't respond to standard scroll interactions in the browser. This may be a React Native Web scrolling issue. Content below "Key Topics" section requires topic expansion to reach.

### Accessibility: 8/10

**What works well:**
- Text contrast is generally good (dark text on cream/white backgrounds)
- Touch targets for checkboxes and expand arrows appear adequate (≥44px based on visual inspection)
- Tab bar icons have text labels
- Relationship type and filter chips are large enough to tap
- Stepper buttons (+/-) on STARS and Alignment have adequate size
- Placeholder text provides clear guidance in form fields

**Issues:**
7. **Tab bar emoji duplication.** Each tab shows its emoji twice (e.g. "📚 📚 Learn") — this is visible in the DOM structure and may cause screen reader confusion. Each tab should have the emoji once.
8. **No visible focus indicators for keyboard navigation.** While primarily a mobile app, the web version should support keyboard navigation with visible focus rings for accessibility compliance. Currently no focus states are visible on interactive elements.

---

## Required improvements (Builder must implement ALL of these)

### Improvement 1: Populate default assessment criteria
**Dimension:** Feature completeness
**Current state:** Assessment tab on person detail shows "TEAM ASSESSMENT 0/0" with Edit criteria / + Add / Reset buttons but no default criteria. Empty screen for a new Direct Report.
**Best practice:** The spec requires 6 default Watkins criteria (Competence, Judgement, Energy, Focus, Relationships, Trust) with 100-point pool, +/- steppers, progress bars, and threshold indicators. Assessment apps like 15Five and Culture Amp pre-populate assessment frameworks.
**Required change:** Pre-populate the 6 Watkins criteria when the Assessment tab is first viewed for a Direct Report or Team Member. Show the 100-point distribution pool with +/- steppers and progress bars. The Reset button should restore these defaults.

### Improvement 2: Fix React Native text node warning
**Dimension:** Polish and detail
**Current state:** "Unexpected text node: . A text n..." error toast appears at the bottom of the People list screen, likely from a stray text node or period character in the JSX.
**Best practice:** No development warnings should be visible to users in production.
**Required change:** Find and fix the stray text node in the People list component. This is likely a misplaced `.` or whitespace between JSX elements.

### Improvement 3: Fix tab bar emoji duplication
**Dimension:** Accessibility
**Current state:** Each tab shows its emoji twice in the DOM (e.g. "📚 📚 Learn"), visible in the accessibility tree. This appears to be a rendering issue where both a platform-specific and fallback emoji are rendered simultaneously.
**Best practice:** Each tab should render its label once for clean screen reader output (e.g. "Learn" with a single icon).
**Required change:** Fix the tab bar rendering to show each emoji once. Check `_layout.tsx` for duplicate icon rendering.

## Observations (optional, not required for pass)

1. **Porter's Five Forces missing overview summary** — The spec mentions "Overview summary at top: simple indicator (High/Medium/Low) for each force." Adding this would increase diagnostic value. Not blocking because the core note-taking functionality works.
2. **No save confirmation feedback** — Adding a brief success toast (2-3 seconds) after saving a person, meeting, or reflection would increase user confidence. Standard in Todoist, Notion, etc.
3. **Checklist sub-task visual hierarchy** — The indentation between parent and child tasks could be more visually pronounced. Things 3's approach of clear left-indentation (16-24px per level) with connecting lines makes scanning faster.
4. **Learn tab scroll in web** — The scroll behaviour may need adjustment for web rendering. Consider testing with `nestedScrollEnabled` or adjusting the ScrollView configuration for web compatibility.
5. **No onboarding flow** — First-time users land on the Learn tab with no guided introduction. Apps like Headspace and Calm use a brief onboarding to set context. For a Director starting a new role, a 3-screen onboarding ("Set your start date → Choose your level → Here's your 90-day plan") would increase engagement.
6. **No data export** — Executives switching roles frequently would value the ability to export their transition data (PDF report, meeting notes export). Not in spec, but worth considering.
7. **Daily Reflection could show history** — Currently only shows today's prompt. Showing a scrollable history of past reflections would add value for the "review" phase.
8. **Cross-reference from meetings is one-directional** — Flagging a meeting as containing diagnostic info is great, but there's no visible link back from the Diagnostics section to the meeting. Bidirectional cross-referencing would complete the loop.
