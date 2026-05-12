**1. Current Structural Problems Found**
- `src/shared/components/custom` is the main ambiguity source. It mixes app-wide reusable pieces (`BackButton`, `BaseModal`, `ConfirmDialog`, `loading`), domain components (`DifficultyBadge`, `EventSelect`), and feature-owned auth/user pieces (`AuthProviders`, `SocialIcon`).
- Notifications are split across layers: `src/widgets/notifications/*` already exists, but `src/widgets/notifications/NavbarNotifications.tsx` still imports `NotificationToast` from `src/_layouts/components/notifications` and `useNotifications` from `src/_layouts/hooks/useNotifications`.
- `_layouts` still owns business UI for notifications, which breaks the “layout shells only” rule.
- `src/features/admin/shared` and `src/features/admin/ui` both exist, and both contain an `AdminPageShell`. They are not the same implementation, so ownership is unclear and the duplicate name is risky.
- `src/shared/lib` is not “shared utility” code. It currently holds domain services for admin, challenges, events, teams, users, preview, sub-challenges, and stats.
- `src/shared/lib/index.ts` is a mega barrel. Many features import `@/shared/lib`, which hides ownership and makes later moves harder.
- `src/shared/contexts` mixes true global providers (`AuthContext`, `ThemeContext`) with feature/domain contexts (`EventContext`, `FilterContext`, `SubChallengesContext`, `LogsContext`).
- `src/shared/index.ts` is another broad barrel and appears unused.
- `src/features/logs/contexts`, `src/features/users/actions`, and `src/features/users/services` are empty, which adds noise without clarifying ownership.

**2. Exact File/Folder Moves Proposed**
- Move `src/_layouts/hooks/useNotifications.ts` to `src/widgets/notifications/hooks/useNotifications.ts`.
- Move `src/_layouts/components/notifications/NotificationToast.tsx` to `src/widgets/notifications/components/NotificationToast.tsx`.
- Keep `src/widgets/notifications/components/NotificationBell.tsx`, `NotificationPanel.tsx`, and `NotificationItem.tsx` as the canonical versions, then delete the `_layouts` duplicates.
- Move `src/shared/components/custom/loading.tsx` to `src/shared/components/Loader.tsx`.
- Move `src/shared/components/custom/BackButton.tsx` to `src/shared/components/BackButton.tsx`.
- Move `src/shared/components/custom/ConfirmDialog.tsx` to `src/shared/components/ConfirmDialog.tsx`.
- Move `src/shared/components/custom/BaseModal.tsx` to `src/shared/components/BaseModal.tsx`.
- Move `src/shared/components/custom/BrandLogo.tsx` to `src/shared/components/BrandLogo.tsx`.
- Move `src/shared/components/GoogleLoginButton.tsx` to `src/features/auth/components/GoogleLoginButton.tsx`.
- Move `src/shared/components/custom/AuthProviders.tsx` to `src/features/auth/components/AuthProviders.tsx`.
- Move `src/shared/components/custom/SocialIcon.tsx` to `src/features/users/components/ui/SocialIcon.tsx`.
- Move `src/shared/components/custom/DifficultyBadge.tsx` to `src/features/challenges/components/DifficultyBadge.tsx`.
- Create `src/features/events/` and move `src/shared/components/custom/EventSelect.tsx` to `src/features/events/components/EventSelect.tsx`.
- Create `src/features/events/contexts/` and move `src/shared/contexts/EventContext.tsx` there.
- Move `src/shared/contexts/FilterContext.tsx` to `src/features/challenges/contexts/FilterContext.tsx`.
- Move `src/shared/contexts/SubChallengesContext.tsx` to `src/features/challenges/contexts/SubChallengesContext.tsx`.
- Move `src/shared/contexts/LogsContext.tsx` to `src/features/logs/contexts/LogsContext.tsx`.
- Keep `src/shared/contexts/AuthContext.tsx` and `ThemeContext.tsx` where they are.
- Move `src/shared/lib/admin.ts` to `src/features/admin/services/admin.service.ts`.
- Move `src/shared/lib/events.ts` to `src/features/events/services/event.service.ts`.
- Move `src/shared/lib/teams.ts` to `src/features/teams/services/team.service.ts`.
- Move `src/shared/lib/users.ts` to `src/features/users/services/user.service.ts`.
- Move `src/shared/lib/subChallenges.ts` to `src/features/challenges/services/sub-challenge.service.ts`.
- Move `src/shared/lib/activityStats.ts` to `src/features/admin/overview/services/activity-stats.service.ts`.
- Move `src/shared/lib/preview.ts` to `src/features/preview/services/preview.service.ts` only if you want a real `preview` feature; otherwise postpone.
- Move `src/shared/lib/supabase.ts` and `src/shared/lib/supabase-config.ts` to `src/lib/supabase/`.
- Move `src/shared/lib/settings.ts` and `src/shared/lib/userState.ts` to `src/lib/storage/`.
- Keep `src/shared/lib/utils.ts` and `src/shared/lib/crypto.ts` in `shared/lib`.
- Do not delete `src/features/admin/shared/components/AdminPageShell.tsx` yet. First decide whether `features/admin/ui/AdminPageShell.tsx` should absorb its behavior or vice versa.

**3. Which Folders Should Be Deleted**
- Delete `src/_layouts/hooks` after `useNotifications` is moved.
- Delete `src/_layouts/components/notifications` after `NotificationToast` is moved and widget imports are updated.
- Delete `src/shared/components/custom` after its files are redistributed.
- Delete `src/features/admin/shared` after the admin shell is reconciled and imports are removed.
- Delete `src/features/logs/contexts` only if you choose not to move `LogsContext` into it. Otherwise populate it.
- Delete `src/features/users/actions` and `src/features/users/services` if they remain empty after the cleanup.
- Delete `src/shared/index.ts` if you keep direct imports only.

**4. Which Imports Must Be Updated**
- `@/_layouts/hooks/useNotifications` -> `@/widgets/notifications/hooks/useNotifications`
- `@/_layouts/components/notifications/NotificationToast` -> `@/widgets/notifications/components/NotificationToast`
- `@/shared/components/custom/loading` -> `@/shared/components/Loader`
- `@/shared/components/custom/BackButton` -> `@/shared/components/BackButton`
- `@/shared/components/custom/ConfirmDialog` -> `@/shared/components/ConfirmDialog`
- `@/shared/components/custom` modal imports -> `@/shared/components/BaseModal`
- `@/shared/components/custom/BrandLogo` -> `@/shared/components/BrandLogo`
- `@/shared/components/GoogleLoginButton` -> `@/features/auth/components/GoogleLoginButton`
- `@/shared/components/custom/AuthProviders` or custom barrel -> `@/features/auth/components/AuthProviders`
- `@/shared/components/custom/SocialIcon` or custom barrel -> `@/features/users/components/ui/SocialIcon`
- `@/shared/components/custom/DifficultyBadge` -> `@/features/challenges/components/DifficultyBadge`
- `@/shared/components/custom/EventSelect` and `@/shared/components` re-exports -> `@/features/events/components/EventSelect`
- `@/shared/contexts/EventContext` -> `@/features/events/contexts/EventContext`
- `@/shared/contexts/FilterContext` -> `@/features/challenges/contexts/FilterContext`
- `@/shared/contexts/SubChallengesContext` -> `@/features/challenges/contexts/SubChallengesContext`
- `@/shared/contexts/LogsContext` -> `@/features/logs/contexts/LogsContext`
- Broad `@/shared/contexts` imports should be split to explicit module paths.
- Broad `@/shared/lib` imports should be replaced with feature-owned service imports.

**5. Safe Migration Order**
1. Consolidate notifications into `widgets/notifications`.
2. Remove `_layouts` notification dependencies and delete the duplicate notification folder.
3. Redistribute `shared/components/custom` into `shared/components`, `features/auth`, `features/users`, `features/challenges`, and `features/events`.
4. Move feature-specific contexts out of `shared/contexts`, keeping only `AuthContext` and `ThemeContext` there.
5. Move infrastructure files out of `shared/lib` first: Supabase client/config and local-storage helpers.
6. Replace `@/shared/lib` barrel imports with direct imports.
7. Move clearly owned domain service files from `shared/lib` into their features.
8. Reconcile the two admin shells, then delete `features/admin/shared`.

**6. Expected Final Structure**
```txt
src/
├── app/
├── _layouts/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── components/
├── widgets/
│   └── notifications/
│       ├── NavbarNotifications.tsx
│       ├── components/
│       └── hooks/
├── features/
│   ├── admin/
│   │   ├── admins/
│   │   ├── challenges/
│   │   ├── event/
│   │   ├── overview/
│   │   ├── solvers/
│   │   └── ui/
│   ├── auth/
│   │   └── components/
│   ├── challenges/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── services/
│   ├── events/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── services/
│   ├── logs/
│   │   ├── components/
│   │   ├── contexts/
│   │   └── lib/
│   ├── teams/
│   │   └── services/
│   └── users/
│       ├── components/
│       └── services/
├── shared/
│   ├── ui/
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   ├── styles/
│   └── types/
└── lib/
    ├── supabase/
    └── storage/
```

**7. Which Changes Are High Value**
- Notifications -> `widgets/notifications` only. This is the cleanest ownership fix and is already half-migrated.
- Deleting `shared/components/custom` by redistributing its contents. This removes the biggest ambiguous folder immediately.
- Moving `FilterContext`, `SubChallengesContext`, and `LogsContext` out of `shared/contexts`.
- Replacing `@/shared/lib` barrel imports with direct imports, even before every service file is moved.
- Resolving the admin shell duplication so there is one canonical `AdminPageShell`.

**8. Which Changes Should Be Postponed**
- Splitting `src/shared/lib/challenges.ts` into smaller services. It currently mixes challenge queries, scoreboard data, notifications, and solver admin behavior, so it needs a careful second pass.
- Moving `MarkdownRenderer` out of `shared/markdown`. Its ownership is not as ambiguous as `custom/` or `shared/lib`.
- Reworking `_layouts/components/PageWrapper`, `FloatingToolbar`, `TitlePage`, and `DevConfigDialog` unless you want a separate layout/widget cleanup pass.
- Renaming `CustomBadge` right now. It is inconsistent, but fixing `custom/`, contexts, and `shared/lib` gives much more clarity first.

If you want, I can turn this into a concrete phase-by-phase checklist and start with the safest high-value pass: notifications + removing `shared/components/custom`.
