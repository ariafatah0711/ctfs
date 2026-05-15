# NXCTF Visual UI Audit

Audit ini menilai konsistensi visual halaman publik NXCTF sebelum penyusunan design system. Scope sengaja dibatasi pada UI non-admin dan menjadikan halaman `challenges` sebagai baseline visual terbaik saat ini.

## Scope

### Included

- Challenges, events tab, challenge dialogs, hint/join dialogs
- Scoreboard user dan team
- Teams, team profile, team scoreboard
- User profile dan public user profile
- Auth pages
- Logs
- Info dan rules
- Navbar, footer, global layout, shared UI primitives

### Excluded

- `src/app/admin/*`
- `src/features/admin/*`
- Semua komponen internal admin

## Severity Legend

| Severity | Meaning |
|---|---|
| critical | Masalah visual mendasar yang dapat merusak arah desain utama atau menghambat design system. |
| high | Inkonsistensi besar yang terlihat lintas halaman dan perlu dibereskan sebelum tokenisasi. |
| medium | Masalah lokal atau pola yang belum matang tetapi tidak memblokir penggunaan. |
| low | Polish minor, naming visual, atau detail kecil yang bisa ditunda. |

## 1. Overall Visual Analysis

NXCTF sudah punya arah visual yang cukup jelas: dark-first, compact, glass surface, aksen biru, border halus, dan interaksi hover yang ringan. Halaman `challenges` adalah baseline paling matang karena memadukan density tinggi, hierarchy jelas, kartu yang khas, filter yang padat, dan micro-interaction yang terasa kompetitif.

Namun konsistensinya belum merata. Beberapa halaman baru memakai shared surface helper seperti `SURFACE_GLASS_CARD_*`, `PAGE_MAIN_CONTAINER_*`, `SegmentedTabs`, dan `EventSelect`, sementara area lain masih membawa gaya lokal: radius berbeda, warna pink/purple/orange sporadis, tombol shadcn default hitam/putih, dan surface yang kadang solid `gray-900`, kadang glass `#111622`, kadang card shadcn `bg-card`.

| Area | Visual maturity | Notes |
|---|---:|---|
| Challenges grid | High | Paling kuat sebagai baseline: compact, cyber minimal, clear card hierarchy. |
| Challenge filters | High | Control surface matang, density baik, visual aktif/nonaktif jelas. |
| Scoreboard | Medium-high | Konsisten dan profesional, tapi lebih SaaS dashboard daripada cyber competitive. |
| Logs | Medium-high | Compact dan readable, cocok dengan dashboard feed. |
| User profile | Medium | Rapi, tetapi lebih light glass profile daripada challenge baseline. |
| Teams | Medium | Fungsional dan cukup modern, tetapi beberapa section terasa oversized/marketing. |
| Auth | Medium | Polished, tetapi auth card punya sisa orange hover dan density lebih longgar. |
| Info/rules | Medium-low | Info terasa landing/marketing, rules minimal tetapi agak terpisah dari baseline app. |
| Navbar/footer | Medium | Stabil, tetapi navbar solid dan hover style belum sejalan dengan glass control baseline. |
| Dialog/modal | Medium | Ada shared dialog class, tetapi challenge sub-question/flag masih punya warna dan radius legacy. |

## 2. Current Design Direction

Baseline visual terbaik saat ini:

- Compact dashboard, bukan landing page.
- Dark cyber minimal dengan surface gelap `#0b0f19`, `#111622`, `gray-900`.
- Aksen utama biru: `blue-500`, `blue-600`, `blue-500/10`, `blue-500/20`.
- Border tipis: `gray-800`, `blue-500/10`, `blue-500/20`.
- Radius dominan `rounded-xl` untuk control dan `rounded-2xl` untuk cards/dialogs besar.
- Typography padat: heading bold/black, label uppercase kecil, metadata `text-[10px]` sampai `text-xs`.
- Hover subtle: border blue, slight translate/scale, soft shadow/glow.
- Informasi padat, banyak metadata ringkas, minim white space berlebih.

Design direction yang paling cocok untuk NXCTF:

> Compact, modern, cyber minimal, competitive dashboard, dense information layout, subtle glow, restrained visual style, professional CTF platform.

Hal yang perlu dijaga:

- Jangan membuat UI terlalu marketing atau terlalu "hero page".
- Jangan membuat semua permukaan menjadi kartu besar.
- Jangan menambah warna aksen baru kecuali punya fungsi status.
- Jangan membuat hover terlalu ramai; gunakan glow ringan, border, opacity, atau tiny transform.

## 3. Best Designed Pages/Components

| Rank | Page/component | Severity if changed carelessly | Why it works |
|---:|---|---|---|
| 1 | `features/challenges/components/ChallengeCard.tsx` | high | Visual identity paling kuat: dark card, metadata compact, difficulty/category, first blood/new states, hover glow. |
| 2 | `features/challenges/components/ChallengeFilterBar.tsx` + filter subcomponents | high | Dense control surface, clear selected state, event pills, search/settings/sort controls. |
| 3 | `features/challenges/components/ChallengeDetailDialog.tsx` shell | medium | Dialog layout fixed header/content/footer sudah matang; detail content masih mixed. |
| 4 | `features/scoreboard/components/base/*` | medium | Reusable scoreboard card/table/chart pattern sudah rapi dan predictable. |
| 5 | `features/logs/components/LogsList.tsx` | medium | Feed item compact, readable, good activity colors, good density. |
| 6 | `features/users/components/ui/UserStat.tsx` | medium | Stat card compact, reusable, hover matching app direction. |
| 7 | `shared/components/SegmentedTabs.tsx` | medium | Control primitive paling siap distandardisasi; sudah dipakai scoreboard/logs/profile/team tabs. |

## 4. Most Inconsistent Pages/Components

| Component/page | Severity | Issue |
|---|---|---|
| Challenge sub-question panel | high | Menggunakan pink accent, `rounded-md`, hardcoded `#1a1a33/#35355e`, berbeda dari blue/glass baseline. |
| Challenge flag form | high | Submit/focus memakai pink gradient/ring; terasa seperti subsystem lama di dalam dialog baru. |
| Info page | high | Masih cenderung landing/marketing, spacing lebih besar, hero besar, berbeda dari compact dashboard baseline. |
| Navbar | high | Solid `bg-gray-950/bg-white`, menu hover lokal, manual chevron SVG, belum mengikuti glass/surface language. |
| Shared `Button`, `Input`, `Card` primitives | high | Default shadcn token hitam/putih berbeda dari helper surface biru/glass yang dipakai halaman matang. |
| Teams create/join empty state | medium | Hero copy besar dan cards besar terasa lebih marketing dibanding dashboard dense. |
| Footer | medium | Cukup polished tapi lebih promotional, `orange` hover support dev mengganggu primary blue direction. |
| Rules page | medium | Minimal dan readable, tetapi tidak memakai shared card/surface hierarchy seperti dashboard pages. |
| Modal close/action patterns | medium | Ada shared `BaseModal` dan `DIALOG_*`, tetapi beberapa modal override close/action dengan bentuk berbeda. |

## 5. Detailed Consistency Analysis

### 5.1 Layout Consistency

| Area | Current state | Severity | Recommendation |
|---|---|---|---|
| Main containers | Banyak halaman memakai `max-w-7xl px-4 sm:px-6 lg:px-8 py-3/4`; scoreboard/logs memakai `PAGE_MAIN_CONTAINER_*`. | medium | Jadikan container challenges/scoreboard/logs/profile sebagai acuan ukuran halaman publik. |
| Page spacing | Challenges sangat compact (`py-2`, `space-y-3`), lainnya banyak `space-y-5/6`. | medium | Tentukan page density: primary dashboard pages sebaiknya `space-y-4/5`, challenge arena boleh `space-y-3`. |
| Auth layout | Centered card, bagus untuk auth, tetapi density berbeda wajar. | low | Auth boleh tetap lebih focused, tetapi surface/hover harus konsisten. |
| Info/rules | Lebih landing/content page dibanding dashboard. | medium | Info boleh editorial, tetapi jangan terlalu jauh dari app shell. |
| Scoreboard all | Tidak memakai `PageBackground` langsung, bergantung root background. | medium | Samakan dengan main scoreboard untuk visual continuity. |

### 5.2 Spacing Consistency

| Pattern | Observed usage | Severity | Notes |
|---|---|---|---|
| Card padding | `p-3`, `p-4`, `p-5`, `sm:p-5`, `md:p-6` tersebar. | medium | Pilih compact card `p-3/4`, standard card `p-4/5`, modal `p-4 md:p-6`. |
| Grid gap | Challenges `gap-4 md:gap-6`, logs `gap-2.5`, profile `gap-2.5/3`, info `gap-6`. | medium | Gap sudah kontekstual, tapi perlu kategori density. |
| Header spacing | Challenge dialog header padat; info hero dan teams empty state besar. | medium | Dashboard page jangan memakai hero spacing kecuali landing/info. |
| Form control height | Auth input `h-12`, event select/control `h-9/38px`, nav `py-2`. | medium | Bedakan form page vs dashboard controls, tapi naming/pattern harus jelas. |

### 5.3 Color Usage Consistency

| Color family | Usage | Severity | Assessment |
|---|---|---|---|
| Blue | Primary across challenges, scoreboard, profile, logs, navbar. | low | Cocok sebagai primary accent. |
| Pink | Challenge flag form and sub-question panel. | high | Tidak sinkron dengan baseline; terlihat legacy/special-case tanpa alasan visual kuat. |
| Purple | Team solved state, team role/status, some badges. | medium | Bisa dipertahankan sebagai semantic/team state, tetapi jangan jadi accent umum. |
| Orange | Footer support dev, dev config, old design note. | medium | Baik untuk dev/support secondary, tapi jangan masuk primary public UI. |
| Emerald/green | Success, solve, running service. | low | Semantic clear. |
| Red | Error/destructive/first blood. | low | Semantic clear. |
| Hardcoded darks | `#111622`, `#0a0d14`, `#1a1a33`, `#181829`, `#35355e`. | high | Banyak surface dark lokal; perlu dipetakan sebelum token system. |

### 5.4 Typography Consistency

| Pattern | Current state | Severity | Recommendation |
|---|---|---|---|
| Dashboard labels | Banyak `text-[10px] font-black uppercase tracking-widest`. | low | Ini cocok untuk cyber dashboard, pertahankan tapi batasi tracking ekstrem. |
| Body text | `text-sm`, `text-xs`, `text-[13px]` bercampur. | medium | Tetapkan body compact (`text-sm`) dan metadata (`text-xs`/`text-[11px]`). |
| Heading hierarchy | Challenges card `text-sm/md:text-base`, profile/team headers `text-2xl/3xl`, info `text-5xl/6xl`. | medium | Pastikan app pages tidak terasa seperti landing kecuali home/info. |
| Font weight | `font-bold`, `font-black`, `font-extrabold` sering bercampur. | medium | Gunakan `font-black` untuk badges/metric labels, `font-bold/semibold` untuk content. |
| Monospace | Good for flags, build metadata, commands, rank. | low | Sesuai domain CTF. |

### 5.5 Border Radius Consistency

| Radius | Usage | Severity | Notes |
|---|---|---|---|
| `rounded-md` | Shared shadcn controls, sub-question cards, small badges. | medium | Terlihat lebih old/default jika muncul di major UI. |
| `rounded-lg` | Navbar items, small icon buttons, attachment buttons. | low | Cocok untuk compact controls. |
| `rounded-xl` | Inputs, segmented tabs, stat cards, control surfaces. | low | Good default for dashboard controls. |
| `rounded-2xl` | Challenge cards, dialogs, large cards. | low | Good default for feature cards/surfaces. |
| `rounded-full` | Pills, avatars, back buttons. | low | Fine for pills/avatars. |

Masalah utama bukan jumlah radius, tapi context: challenge baseline card/control mostly `xl/2xl`, sedangkan sub-question panel dan shared primitives masih `md`.

### 5.6 Card Style Consistency

| Card family | Files/examples | Assessment |
|---|---|---|
| Challenge card | `ChallengeCard` | Most distinctive and polished. Dark, dense, interactive. |
| Shared glass card | `SURFACE_GLASS_CARD_*` | Good app-wide baseline for dashboard cards. |
| User card | `UserCard`, `UserStat` | Good, compact, but uses `rounded-xl` and lighter glass than challenge cards. |
| Scoreboard card | `BaseScoreboardCard` | Mature reusable table/chart shell. |
| Team cards | `TeamMembersSection`, create/join cards | Mixed: some shared glass, some custom `bg-white/70 dark:bg-[#111622]/70 shadow-lg`. |
| Info cards | Info stats/quick links | Polished but larger, more landing-like. |
| shadcn default card | `shared/ui/card.tsx` | Not visually aligned by default; requires overrides everywhere. |

### 5.7 Hover/Interaction Consistency

| Pattern | Usage | Severity | Notes |
|---|---|---|---|
| Border blue on hover | Challenges filters, logs, cards, profile stats. | low | Strong candidate for standard hover. |
| Small translate | Event cards, logs, profile rows, auth cards. | medium | Good, but direction varies: `-translate-y`, `translate-x`, `scale`. |
| Scale hover | Challenge cards `hover:scale-105`, auth button `hover:scale-[1.02]`. | medium | Challenge cards can keep stronger game-like hover; other dashboard controls should be restrained. |
| Shadow/glow | Blue glow often subtle; auth card still orange glow. | medium | Standardize glow color and intensity around blue. |
| Link hover underline | Scoreboard table uses underline; others use color only. | low | Acceptable if table links need affordance. |

### 5.8 Visual Hierarchy

| Area | Assessment | Severity |
|---|---|---|
| Challenges | Strong: points/title/category/difficulty clear. | low |
| Scoreboard | Strong table hierarchy, chart title acceptable. | low |
| Logs | Good timeline/feed hierarchy; icon/type/time/title readable. | low |
| Profile | Good stats/header hierarchy, but sections are visually softer than challenge baseline. | medium |
| Teams | Header and stats good; create/join page is more hero-focused than dense. | medium |
| Info | Hero dominates; useful for about page but not a baseline for app UI. | medium |
| Navbar | Brand strong, but active/current page state is weak or absent. | high |

### 5.9 Information Density

| Page | Density | Fit to direction |
|---|---|---|
| Challenges | High | Excellent fit. |
| Logs | High | Excellent fit. |
| Scoreboard | Medium-high | Good fit. |
| Team profile | Medium | Good but could be tighter. |
| User profile | Medium | Good but less cyber/dense. |
| Auth | Low-medium | Acceptable for form focus. |
| Info | Low | Acceptable for about page, not design baseline. |
| Rules | Medium | Readable, but lacks shared surface consistency. |

### 5.10 Background/Surface Consistency

| Surface | Current state | Severity |
|---|---|---|
| Page background | `#fafafa` / `#0b0f19` is consistent via `PageBackground`. | low |
| Orbs/watermark | Some pages show watermark/orbs, challenges disables orbs. | medium |
| Card surface | Mixed `bg-white/40`, `bg-white/60`, `dark:bg-[#111622]/60`, `dark:bg-gray-900/40`, `bg-card`. | high |
| Dialog surface | Mostly `bg-white/70 dark:bg-[#0a0d14]/80`, good. | medium |
| Navbar surface | Solid background; not aligned with glass pages. | high |

### 5.11 Icon Consistency

| Area | Current state | Severity | Notes |
|---|---|---|---|
| Lucide usage | Most app icons use lucide. | low | Good direction. |
| Manual SVG | Navbar chevrons and mobile menu icons are inline SVG. | medium | Replace later with lucide `ChevronDown/Menu/X` for consistency. |
| Emoji icon | `ChallengeServicesPanel` uses globe emoji. | medium | Use lucide `Globe` or `Server` later. |
| Text close | Team solves modal uses text close character. | medium | Use lucide `X`. |
| Icon sizes | Mostly `14-18px`, some hero icons larger. | low | Good overall. |

### 5.12 Table/Chart Consistency

| Component | Assessment | Severity |
|---|---|---|
| Scoreboard tables | Best current table pattern: compact, hover row, highlighted current row. | low |
| Team scoreboard | Reuses scoreboard base; good consistency. | low |
| Charts | Plotly theming is acceptable but uses independent color sets. | medium |
| User stats charts | More blue-only palette; visually less rich and less semantic than challenge difficulty/category colors. | medium |
| Logs feed | Not a table, but density and hover work well. | low |

### 5.13 Responsive Consistency

| Area | Current state | Severity | Notes |
|---|---|---|---|
| Challenges grid | Good responsive grid and render chunking. | low |
| Filters | Desktop sidebar/search and mobile controls are thoughtful. | low |
| Navbar mobile | Functional, but fullscreen menu visual is less polished than desktop app surfaces. | medium |
| Tables | Horizontal overflow works. | low |
| Profile/team headers | Good stacking behavior. | low |
| Info hero | Large logo/title can feel heavy on smaller screens. | medium |
| Dialogs | Shared width classes good; challenge dialog fixed `h-[90vh]` works for dense content. | low |

## 6. Repeated UI Issues

| Issue | Severity | Examples | Why it matters |
|---|---|---|---|
| Multiple surface systems | high | `SURFACE_GLASS_*`, shadcn `Card`, local `bg-white/40`, hardcoded dark hexes | Design system will be hard to define without first choosing canonical surfaces. |
| Accent color drift | high | Pink in flag/sub-question, orange in auth/footer/dev, purple outside team state | Baseline says blue cyber minimal; extra accents weaken identity. |
| Navbar not matching app shell | high | Solid background, local hover styles, weak active state | Navbar appears from older visual generation and is seen on all pages. |
| Shared primitives are not visually final | high | `Button`, `Input`, `Card`, `Select` default to shadcn neutral token style | Mature pages need overrides, causing duplication. |
| Mixed card radius | medium | `rounded-md`, `rounded-xl`, `rounded-2xl` across similar surfaces | Makes components feel from different eras. |
| Mixed hover grammar | medium | scale, translate, border, shadow, underline all mixed without role distinction | Users perceive inconsistent interactivity. |
| Oversized marketing sections in app pages | medium | Teams no-team state, Info page | Direction asks for compact competitive dashboard. |
| Legacy hardcoded dark purples | medium | Challenge sub-question/services | Breaks modern minimal palette. |
| Icon edge cases | medium | Emoji globe, inline SVG chevrons/menu, text close | Small, but noticeable after design system work. |
| Encoding artifacts in visible strings | medium | Some copied characters appear corrupted in code around dashes/close text | Can surface as unpolished UI text. |

## 7. Layout Density Analysis

| Page/component | Density score | Notes |
|---|---:|---|
| Challenges grid | 9/10 | Dense cards, minimal page chrome, great for CTF arena. |
| Challenge filter bar | 9/10 | Very efficient and visually clear. |
| Logs | 8/10 | Feed items are compact and scannable. |
| Scoreboard | 8/10 | Table/chart density good; chart takes healthy vertical space. |
| Team scoreboard | 8/10 | Matches scoreboard pattern. |
| User profile | 7/10 | Good stats and rows, but header/profile areas are softer. |
| Team profile | 7/10 | Good header, member cards slightly roomy. |
| Auth | 6/10 | Appropriate for auth forms. |
| Teams no-team | 5/10 | Too hero-like for dashboard direction. |
| Info | 4/10 | About page is polished but not compact. |

Recommended density rules before design system:

- Arena/dashboard pages: compact default, `py-3/4`, `space-y-4/5`.
- Cards in repeated lists: `p-3/4`, `gap-2/3`, metadata `text-[10px]/text-xs`.
- Feature profile headers: `p-4/5`, not full hero.
- Marketing/about pages: allowed to be more spacious, but should not define app primitives.

## 8. Color Consistency Analysis

| Role | Current best candidate | Current conflicts | Recommendation |
|---|---|---|---|
| Primary accent | Blue `500/600` | Pink flag form, orange old direction | Blue should remain primary. |
| Primary surface dark | `#111622` / `gray-900/40` | `#1a1a33`, `#181829`, `bg-card` | Pick one surface ladder later. |
| App background dark | `#0b0f19` | Some `gray-950`, `gray-900` page shells | Keep `#0b0f19` as base. |
| Success | Green/emerald | Mostly consistent | Keep semantic. |
| Destructive | Red | Mostly consistent | Keep semantic. |
| Warning | Amber/yellow | Used for maintenance/hints | Keep semantic. |
| Team state | Purple | Some non-team purple/pink nearby | Reserve purple for team solved/team concepts only. |
| Secondary accent | Orange | Footer/support/dev config/auth old hover | Restrict to support/dev or remove from public baseline. |

## 9. Component Consistency Report

| Component family | Maturity | Severity | Notes |
|---|---|---|---|
| Challenge cards | Mature | low | Strongest visual primitive. |
| Event cards | Mature | low | Similar to challenge cards but lighter; good for events tab. |
| Filter controls | Mature | low | Should inform future control primitives. |
| Segmented tabs | Mature | low | Reusable and close to design-system-ready. |
| Scoreboard card/table | Mature | low | Strong candidate for reusable data surface. |
| User cards/stats | Good | medium | Useful, but align radius/surface with dashboard standard later. |
| Team profile cards | Good/mixed | medium | Some sections reuse shared patterns, others local. |
| Auth card/input/button | Good/mixed | medium | Polished but slightly separate from baseline. |
| Dialog shell | Good | medium | Shared classes good; inner content inconsistent. |
| Empty states | Mixed | medium | Shared `EmptyState` is generic; logs/challenges/user have custom variants. |
| Navbar | Needs update | high | Global visibility makes this a priority. |
| Footer | Needs restraint | medium | Polished but not central dashboard style. |
| Shared shadcn primitives | Needs alignment | high | Existing defaults conflict with mature NXCTF visual style. |

## 10. Priority Issue List

| Priority | Severity | Issue | Affected areas | Suggested timing |
|---:|---|---|---|---|
| 1 | critical | Decide baseline app visual grammar from `challenges`, not from `info/home` or shadcn defaults. | All public UI | Before design system. |
| 2 | high | Normalize surface families: page, card, control, dialog, table. | Shared styles, scoreboard, teams, profile, auth | Before token system. |
| 3 | high | Align navbar with public app direction and add clear active state. | Global layout | Early. |
| 4 | high | Remove or re-scope pink accent from challenge flag/sub-question UI. | Challenge dialog internals | Early. |
| 5 | high | Update shared primitives visual defaults or explicitly treat them as low-level unstyled primitives. | `shared/ui/*` | Before broad refactor. |
| 6 | medium | Standardize hover grammar by component role. | Cards, rows, buttons, nav, dialogs | Before design system. |
| 7 | medium | Tighten team no-team page density. | Teams | After shared surface decisions. |
| 8 | medium | Make empty states consistent. | Challenges, logs, scoreboard, users, teams | After component audit. |
| 9 | medium | Standardize chart palette and chart card height. | Scoreboard/user stats/team stats | Later. |
| 10 | low | Replace inline SVG/emoji/text close with lucide icons. | Navbar, services panel, modal close | Opportunistic. |

## 11. Recommended Direction Before Design System

Do not create tokens yet. First, align on these visual decisions:

1. Treat `challenges` as the primary product baseline.
2. Define app page categories:
   - Arena/dashboard: challenges, scoreboard, logs, teams, profile.
   - Focus form: auth pages.
   - Editorial/about: info, rules.
3. Choose canonical surface styles by role:
   - Page background.
   - Glass card.
   - Interactive card.
   - Control/input.
   - Dialog.
   - Table/list row.
4. Reserve colors by meaning:
   - Blue: primary/action/focus.
   - Green/emerald: success/solve/running.
   - Red: destructive/error/first blood.
   - Amber/yellow: warning/hint/maintenance.
   - Purple: team-specific status only.
   - Orange: support/dev-only or deprecated in public app UI.
5. Decide radius roles:
   - `rounded-lg`: small buttons/icon controls.
   - `rounded-xl`: controls, inputs, list rows, compact cards.
   - `rounded-2xl`: major cards, dialogs, event/challenge cards.
6. Decide hover roles:
   - Cards: border blue + subtle shadow + optional small translate.
   - Challenge cards: may keep stronger scale because it is the arena surface.
   - Controls: background/border only, minimal movement.
   - Links: color shift; underline only for dense table links.
7. Audit shared primitives before refactor:
   - Either upgrade defaults to NXCTF visual language.
   - Or document them as base primitives that must be wrapped by feature-specific visual components.

## 12. Final Visual Maturity Assessment

| Dimension | Score | Assessment |
|---|---:|---|
| Layout consistency | 7/10 | Good feature layout patterns exist, but not fully shared. |
| Spacing consistency | 6/10 | Mostly reasonable, still mixed density between dashboard and marketing styles. |
| Color consistency | 6/10 | Blue baseline is strong; pink/orange/hardcoded darks need cleanup. |
| Typography consistency | 7/10 | Good compact cyber labels; weights and tracking need restraint. |
| Border consistency | 6/10 | Many valid radii, but role mapping is not explicit. |
| Card consistency | 7/10 | Strong mature card families exist; shared default card is not aligned. |
| Hover consistency | 6/10 | Good ingredients, inconsistent grammar. |
| Visual hierarchy | 7/10 | Strong on challenges/scoreboard/logs; weaker on info/teams no-team. |
| Density | 7/10 | Best pages fit direction well; some pages too spacious. |
| Responsive consistency | 7/10 | Generally solid, navbar/info need polish. |

Overall maturity: **medium-high for feature-level UI, medium for system consistency**.

NXCTF is ready for a design system discovery phase, but not ready for tokenization yet. The next best step is a small visual alignment pass: document canonical surface/radius/hover/color roles using `challenges` as source of truth, then update shared primitives and global navigation around those decisions.
