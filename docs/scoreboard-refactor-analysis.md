# Scoreboard Refactor Analysis
> NXCTF · Analysis & Implementation Planning
> Mode: Analysis only — No code changes.

---

## 1. Current Scoreboard UX Analysis

### Route Structure
```
/scoreboard          → ScoreboardPage.tsx      (top 100, chart + table, event filter, mode tabs)
/scoreboard/all      → ScoreboardAllPage.tsx   (up to 1000 entries, table only, event filter, back button)
```

### What `/scoreboard` has:
- Page title + subtitle ("Live event rankings")
- `EventSelect` dropdown for filtering by event
- `SegmentedTabs` for mode: **Points** vs **First Blood**
- `ScoreboardChart` (Plotly line chart, top 10 users, height 300px)
- `ScoreboardTable` (top 100, with "Your Rank" badge in header, "Show All" button when ≥100 entries)
- Empty state with CTA to `/challenges`

### What `/scoreboard/all` has:
- `BackButton` to `/scoreboard`
- Title "Global Rankings" + subtitle "Showing X competitors"
- `EventSelect` dropdown (duplicated from main page)
- `ScoreboardTable` (top 1000)
- **No chart**
- **No mode tabs (no First Blood mode)**
- **No empty state**
- **No PageBackground component** (uses bare div)

### Current Data Flow
- Both pages use `useEventContext` via the shared `EventProvider` in `scoreboard/layout.tsx`
- `useScoreboardPageData`: fetches up to 100, also fetches progress for chart (top 10)
- `useScoreboardAllPageData`: fetches up to 1000, no progress data, no chart

---

## 2. Problems with Current Routing/Layout

### UX Problems

| # | Problem | Severity |
|---|---------|----------|
| 1 | User navigates to a new **URL** only to see more rows — conceptually wrong, this is a dataset scope change, not a new page | High |
| 2 | EventSelect is **duplicated** in both pages but state is not synced — changing event on `/scoreboard` then clicking "Show All" resets the event selection | High |
| 3 | `/scoreboard/all` loses **First Blood mode** — user cannot view first blood rankings for all players | High |
| 4 | `/scoreboard/all` uses a **bare div** without `PageBackground`, creating a visual inconsistency (no dark bg, no glassmorphism, different layout feel) | Medium |
| 5 | The **Back button** in `/scoreboard/all` feels navigational clutter — the user's mental model is "I expanded a list", not "I visited a new place" | Medium |
| 6 | Chart disappears completely in `/scoreboard/all` — no visual continuity | Low |
| 7 | `/scoreboard/all` title "Global Rankings" vs `/scoreboard` title "Scoreboard" — inconsistent naming | Low |

### Code Maintenance Problems

| # | Problem |
|---|---------|
| 1 | Two separate hooks (`useScoreboardPageData`, `useScoreboardAllPageData`) with ~80% duplicated logic |
| 2 | Two separate page components with duplicated `EventSelect` and header structure |
| 3 | Two separate routes to maintain, test, and keep consistent |
| 4 | Increasing divergence over time (already: `all` page has no empty state, no First Blood, no background) |

---

## 3. Comparison: Separate vs Unified Page

### Option A: Keep Separate Pages (Status Quo)
**Pros:**
- Zero refactor risk
- Simple URL semantics

**Cons:**
- Duplicated state, duplicated components, duplicated logic
- Growing visual divergence (already broken)
- Bad UX: page navigation for a dataset scope toggle
- Event selection is not preserved across pages

**Verdict: Reject.** The current approach is already showing signs of divergence and has UX-breaking issues.

---

### Option B: Full Merge — Single Page, No `/all` Route
**Concept:** `/scoreboard` shows all N entries by default, remove `/all` entirely.

**Pros:**
- Eliminates all divergence
- Simplest possible maintenance

**Cons:**
- Fetching 1000 entries by default is slower
- Chart with 1000 entries would be noisy (already limited to top 10)
- No way to give users a "focused" default view (top 100) vs extended view

**Verdict: Partially viable.** But misses the point — users benefit from a "default compact" view with an opt-in expanded view.

---

### Option C: Unified Page with Inline Scope Toggle (RECOMMENDED)
**Concept:** `/scoreboard` is the only route. A "Show All" toggle or inline control switches between top-100 and all-entries datasets. URL reflects state via query param.

```
/scoreboard                    → default (top 100, chart visible)
/scoreboard?view=all           → extended (top 1000, chart hidden or collapsed)
/scoreboard?event=<id>         → event-filtered
/scoreboard?event=<id>&view=all → combined
```

**Pros:**
- Single route, single page, single hook
- URL is bookmarkable and shareable
- Event selection is always preserved
- "Show All" becomes a UI control, not a navigation action
- First Blood mode available in all views
- Clean progressive disclosure: compact by default, expand on demand

**Cons:**
- Requires merging two hooks into one
- Chart visibility becomes conditional on `view` state
- Need careful handling of the different fetch limits (100 vs 1000)

**Verdict: Best approach.** Clean, maintainable, consistent with challenges page interaction grammar.

---

### Option D: Hybrid — Keep Routes but Sync State via URL
**Concept:** Keep both routes but use URL query params to sync event selection.

**Verdict: Stop-gap only.** Acceptable as a low-risk intermediate step but not the final goal.

---

## 4. Recommended Architecture

### Target Architecture

```
app/
└── scoreboard/
    ├── layout.tsx          ← Keep EventProvider (already correct)
    └── page.tsx            ← Single entry point → <ScoreboardPage />

features/scoreboard/
├── components/
│   ├── ScoreboardPage.tsx         ← Merged, unified page
│   ├── ScoreboardChart.tsx        ← No change
│   ├── ScoreboardTable.tsx        ← Minor: remove "Show All" Link, replace with callback
│   └── base/                      ← No change
├── hooks/
│   ├── useScoreboardData.ts       ← NEW: merged hook replacing both
│   └── index.ts
└── lib/
    └── ...                        ← No change
```

**Route `/scoreboard/all`:** Add redirect → `/scoreboard?view=all`, then deprecate.

---

## 5. Recommended Control Layout

### Header Bar (matches challenges page density)

```
[ Scoreboard                    ]  [ EventSelect ↕ ]  [ Points | First Blood ]
  Live event rankings  ●
```

On mobile: stacks vertically, EventSelect becomes full-width.

### Scope Control (replaces "Show All" button)

**Option 5A — Table Footer Control (LOW RISK, RECOMMENDED FIRST)**
```
[ ... top 100 rows ... ]
──────────────────────────
  Showing top 100 of 342 competitors    [ Show All ]
```
- No UI clutter in the header
- Contextual: the user reaches the end and knows there's more
- Preserves current `showAllLink` prop system, changes link to callback

**Option 5B — Header Scope Pill (MEDIUM RISK)**
Adds a compact scope toggle as a pill control inside `BaseScoreboardCard`'s header.

**Recommendation:** Start with Option 5A (footer toggle). Low risk, contextually clean.

---

## 6. Recommended Hierarchy

### Target Hierarchy
```
PageBackground
└── Header row (title + EventSelect + SegmentedTabs)
└── ScoreboardChart [conditional: hide when view=all]
└── ScoreboardTable
    └── Header: Ranking · RankBadge · [scope info]
    └── Table body
    └── Footer: "Showing N of M" + [Show All] toggle (if more entries exist)
```

**Chart visibility rule:**
- `view=default` → chart visible
- `view=all` → chart hidden (user intent is "see everyone", not "see top 10 chart")

---

## 7. Recommended Compactness Improvements

### Current Issues Found

#### ScoreboardAllPage.tsx
- Uses ad-hoc `max-w-7xl px-4 py-6 sm:px-6 lg:px-8` instead of shared `PAGE_MAIN_CONTAINER_6XL` token
- Uses hardcoded `text-xl font-black` instead of `TYPO_PAGE_TITLE_CLASS`
- Uses hardcoded subtitle style instead of `TYPO_METADATA_CLASS`
- Missing `PageBackground` — completely breaks glassmorphism consistency
- `BackButton` takes up horizontal space and adds visual noise

#### Removable Content
| Item | Location | Action |
|------|----------|--------|
| "Global Rankings" title | ScoreboardAllPage | Remove (unified page, single title) |
| "Showing X competitors" subtitle | ScoreboardAllPage | Move to table footer |
| BackButton | ScoreboardAllPage | Remove entirely |
| "Ranking" card title | ScoreboardTable | Make optional — consider removing |

---

## 8. Recommended Chart Refinements

### Current Issues
| Issue | Detail |
|-------|--------|
| Skeleton height mismatch | Skeleton is `h-80` (320px) but chart is `300px` → layout shift on load |
| Chart title redundancy | "Top 10 Users" is implied by context |
| Legend below chart | On narrow screens, legend can overlap chart data |
| No data guard | If `traces` is empty, Plotly renders blank space |

### Refinements
1. **Fix skeleton/chart height mismatch** — align both to `h-[300px]`
2. **Remove or reduce "Top 10 Users" title** — implied by the scoreboard context
3. **Legend position** — evaluate `orientation: 'v'` on wide screens for cleaner layout
4. **Add empty guard** — don't render `ScoreboardChart` if `chartData.length === 0`

---

## 9. Recommended Table Refinements

### Current Issues
| Issue | Detail |
|-------|--------|
| `missingLabel` is path-dependent | `pathname === '/scoreboard' ? 'Not in top 100' : 'Not ranked yet'` — fragile coupling to URL |
| "Show All" triggers navigation | Should be an inline toggle or callback |
| No total count displayed | User doesn't know how many total competitors exist |
| 1000 rows in DOM | No pagination or virtual scroll for "all" view |

### Refinements
1. **Extract `missingLabel`** out of path check — pass as explicit prop from parent
2. **Change "Show All" from Link to `onShowAll?: () => void`** callback — parent controls behavior
3. **Footer info row** — "Showing 100 of 342 total" + `[Show All]` button
4. **Consider virtual scrolling** for 1000 rows — low priority for now

---

## 10. Visual Consistency Analysis vs Challenges Page

### Challenges Page — Reference Patterns

| Pattern | Implementation |
|---------|----------------|
| Page container | `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` |
| Background | `PageBackground` with `showOrbs={false}` |
| Filter/control bar | Glass card: `bg-white/50 dark:bg-gray-900/50 border border-blue-500/20 backdrop-blur-sm rounded-2xl p-2` |
| Tab switching | `SegmentedTabs` with `variant="panel"` |
| Card surface | `SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS` |
| Spacing | `space-y-4` between sections |
| Controls density | Compact — `h-8` buttons, `text-xs` labels |

### Scoreboard — Consistency Matrix

| Pattern | ScoreboardPage | ScoreboardAllPage | Match? |
|---------|----------------|-------------------|--------|
| Page container | `PAGE_MAIN_CONTAINER_6XL` (`max-w-6xl`) | Ad-hoc `max-w-7xl` | ⚠️ Both differ from challenges `max-w-7xl` |
| Background | `PageBackground` ✅ | None ❌ | ❌ Broken |
| Tab switching | `SegmentedTabs variant="panel"` ✅ | None ❌ | ❌ Feature gap |
| Card surface | `SURFACE_GLASS_CARD_INTERACTIVE_BLUE_CLASS` ✅ | ✅ (via ScoreboardTable) | ✅ |
| Spacing | `space-y-6` | `mb-6` | ⚠️ Looser than challenges |
| Title style | `TYPO_PAGE_TITLE_CLASS` ✅ | Hardcoded ❌ | ❌ |

### Max Width Discrepancy
- Challenges: `max-w-7xl` (1280px)
- Scoreboard: `PAGE_MAIN_CONTAINER_6XL` = `max-w-6xl` (1152px)

Both scoreboard pages should align to `max-w-7xl` to match the challenges page ecosystem, especially since the table benefits from extra width.

---

## 11. Risk Analysis

### Low Risk (safe to do immediately)
| Change | Risk |
|--------|------|
| Add `PageBackground` to `/scoreboard/all` | 🟢 Pure visual |
| Use `TYPO_PAGE_TITLE_CLASS` in `/scoreboard/all` | 🟢 Style token only |
| Fix skeleton height mismatch in chart | 🟢 One number change |
| Remove path check from `ScoreboardTable` (extract as prop) | 🟢 Prop refactor |
| Add "Showing X of Y" footer text | 🟢 Display only |

### Medium Risk
| Change | Risk |
|--------|------|
| Convert "Show All" from Link to callback | 🟡 Interaction model change |
| Add `?view=all` query param support | 🟡 New URL state |
| Merge hooks into `useScoreboardData` | 🟡 Logic consolidation |
| Move "Show All" to table footer | 🟡 Layout change |

### High Risk
| Change | Risk |
|--------|------|
| Full route unification (delete `/scoreboard/all`) | 🔴 Removes live route, needs redirect |
| Chart collapse/hide in `view=all` mode | 🔴 Conditional rendering + animation |
| Virtual scrolling for 1000 rows | 🔴 New implementation required |

---

## 12. Suggested Implementation Order

### Phase 1 — Quick Wins (Low Risk, High Impact)
> Goal: Make `/scoreboard/all` visually consistent immediately.

1. Add `PageBackground` to `ScoreboardAllPage`
2. Use `PAGE_MAIN_CONTAINER_6XL` (or `max-w-7xl`) in `ScoreboardAllPage`
3. Use `TYPO_PAGE_TITLE_CLASS` and `TYPO_METADATA_CLASS` in `ScoreboardAllPage`
4. Fix skeleton height in `BaseScoreboardChart` (align `h-80` → `h-[300px]`)
5. Extract `missingLabel` path logic out of `ScoreboardTable` into a prop

### Phase 2 — UX Improvement (Medium Risk)
> Goal: Improve the "Show All" UX without removing the route yet.

6. Add "Showing N of M competitors" footer to `ScoreboardTable`
7. Convert `showAllLink` mechanism: `onShowAll?: () => void` prop, default behavior links to `?view=all`
8. Add `?view=all` query param support to `ScoreboardPage` (different fetch limit)
9. Sync `EventSelect` state to URL (`?event=<id>`) so event selection survives navigation

### Phase 3 — Consolidation (Medium-High Risk)
> Goal: Merge hooks, deprecate `/scoreboard/all` route.

10. Create `useScoreboardData(view: 'top' | 'all')` merged hook
11. Remove `useScoreboardAllPageData` and `ScoreboardAllPage`
12. Add redirect: `/scoreboard/all` → `/scoreboard?view=all`
13. Remove `BackButton` from flow entirely

### Phase 4 — Polish (Optional / Low Priority)
> Goal: Final visual and performance polish.

14. Chart collapse animation when switching to `view=all`
15. Align max-width with challenges page (`6xl` → `7xl`)
16. Evaluate virtual scrolling if 1000+ entries causes performance issues

---

## 13. Low Risk vs High Risk Changes (Summary)

```
PHASE 1 — SAFE TO DO NOW (no behavior change, only visual)
──────────────────────────────────────────────────────────
✅ PageBackground in ScoreboardAllPage
✅ Shared style tokens in ScoreboardAllPage  
✅ Fix chart skeleton height mismatch
✅ Extract missingLabel as prop

PHASE 2 — MEDIUM RISK (behavior change, routing)
──────────────────────────────────────────────────
⚠️ "Showing N of M" footer in table
⚠️ Show All as callback + ?view=all URL param
⚠️ Event state in URL params

PHASE 3 — HIGH RISK (route deletion, hook merge)
──────────────────────────────────────────────────
🔴 Hook consolidation
🔴 /scoreboard/all deprecation + redirect
🔴 ScoreboardAllPage removal

PHASE 4 — OPTIONAL
──────────────────────────────────────────────────
⬜ Chart collapse animation
⬜ Max-width alignment (6xl → 7xl)
⬜ Virtual scroll for 1000 rows
```

---

## Final Recommendation

**Unify `/scoreboard` and `/scoreboard/all` into a single route.**

The `/scoreboard/all` page is conceptually a **dataset scope toggle**, not a separate page. The current two-page architecture is already causing divergence (missing mode tabs, missing background, missing empty state) and UX breaks (event state not preserved, Back button clutter).

**Recommended UX:** Single `/scoreboard` page with `?view=all` query param. "Show All" becomes an inline footer action inside the table card, preserving the compact default view while making the expanded view feel native and seamless.

**Start with Phase 1** (purely visual fixes to `/scoreboard/all`) immediately — zero risk, prevents further divergence while the larger consolidation is planned.
