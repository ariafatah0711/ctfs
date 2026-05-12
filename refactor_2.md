Klasifikasi dulu selesai, dan saya belum memindahkan file apa pun. Dari audit ini, ambiguity terbesar memang ada di `src/shared/lib` karena tiga hal numpuk sekaligus: domain service, infra/runtime helper, dan barrel re-export.

**Per-File Classification**

| File | Current responsibility | Actual ownership | Move recommendation | Risk level | Stay shared or move | Import impact estimate |
|---|---|---|---|---|---|---|
| `activityStats.ts` | Ambil statistik harian admin overview | `features/admin/overview` | Move as-is ke feature-owned service | Low | Move | Low |
| `admin.ts` | Admin scope, global admin check, event admin management | `features/admin` | Move as-is ke admin service/lib | Low | Move | Medium |
| `challenges.ts` | Challenge listing, detail, submit flag, admin CRUD, leaderboard, solvers, notifications, realtime subscriptions | Mixed: `features/challenges` + `features/scoreboard` + `widgets/notifications` + admin solvers | Jangan move as-is. Harus dipetakan dulu per cluster, lalu direct-import cleanup sebelum split | Very High | Temporary stay, then split | Very High |
| `crypto.ts` | Hash/validate flag | Generic utility | Keep shared | Low | Stay shared | Low |
| `events.ts` | Event listing, active filters, membership, join flow, admin CRUD, join-request review, member management | Mixed but still event-owned overall | Safe candidate untuk move as-is ke `features/events/services`, split belakangan bila perlu | Medium | Move | Medium-High |
| `index.ts` | Barrel re-export semua `shared/lib` | Transitional boundary only, not real ownership | Freeze new usage, lalu reduce gradually saat file-file dipindah | High | Temporary stay, then shrink/remove | Very High |
| `preview.ts` | Preview page data assembly | `features/preview` atau route-local preview module | Move as-is | Low | Move | Low |
| `settings.ts` | Local storage settings for theme, solve sound, challenge filters, selected event, guide seen | Infra/runtime storage, tapi bocor feature-specific keys | Jangan split sekarang. Klasifikasikan sebagai infra, lalu pecah bertahap per concern | High | Temporary stay, then split/move | Medium |
| `subChallenges.ts` | User sub-challenge flow + admin sub-challenge CRUD | `features/challenges` | Move as-is dulu ke challenge service, split admin/user later if needed | Medium | Move | Low-Medium |
| `supabase-config.ts` | Config status + config error message builder | Infra/runtime | Move ke infra path, mis. `src/lib/supabase/` | Low | Move | Low |
| `supabase.ts` | Supabase client bootstrap | Infra/runtime | Move ke infra path bareng `supabase-config.ts` | Medium | Move | Medium |
| `teams.ts` | Team CRUD, membership, scoreboard, progress, transfer captain, rename | `features/teams` | Move as-is ke team service/lib | Medium | Move | Medium |
| `users.ts` | User detail/profile, lookup, profile updates, category/difficulty totals, site info | Mixed: `features/users` + admin/overview stats | Jangan split dulu kalau belum siap. Bisa move as-is ke users feature, tapi stats/admin surface perlu ditandai | High | Move, but later than simple files | Medium-High |
| `userState.ts` | Per-user local storage state for notification/logs seen ids | Infra/runtime storage | Move ke infra/storage path | Low | Move | Low-Medium |
| `utils.ts` | `cn`, relative date formatting, event timing label helpers | Truly shared generic utility | Keep shared | Low | Stay shared | High |

**What This Means**

- `shared/lib` saat ini sebenarnya berisi 4 kategori berbeda:
  - Truly shared utility: `utils.ts`, `crypto.ts`
  - Infra/runtime utility: `supabase.ts`, `supabase-config.ts`, `settings.ts`, `userState.ts`
  - Feature/domain service: `activityStats.ts`, `admin.ts`, `events.ts`, `preview.ts`, `subChallenges.ts`, `teams.ts`, `users.ts`
  - Dangerous mixed boundary: `challenges.ts`, `index.ts`, dan sebagian `settings.ts` / `users.ts`

**Dangerous Mixed Files**
- `challenges.ts`
  - Ini file paling berbahaya.
  - Isinya mencampur public challenge queries, admin CRUD, scoreboard, solver admin, notifikasi, dan realtime subscription.
  - Kalau dipindah atau di-split terlalu cepat, import break dan ownership malah makin kabur.
- `users.ts`
  - User profile logic bercampur dengan site/admin overview stats.
  - Ownership-nya tidak sebersih `teams.ts`.
- `events.ts`
  - Masih satu domain, tapi public event flow bercampur dengan admin event management.
  - Lebih aman daripada `challenges.ts`, tapi tetap mixed.
- `settings.ts`
  - Secara teknis infra/runtime, tapi key yang disimpan milik beberapa feature.
  - Jadi jangan dianggap “generic utility murni”.
- `index.ts`
  - Ini bukan util; ini source ambiguity.
  - Selama barrel masih dipakai luas, dependency boundary tetap blur.

**Safest First Moves**
- `activityStats.ts`
  - Owner jelas, blast radius kecil.
- `preview.ts`
  - Consumer sedikit, ownership jelas.
- `admin.ts`
  - Owner jelas, domain tunggal.
- `supabase-config.ts`
  - Infra murni, mudah dipindah bareng bootstrap.
- `userState.ts`
  - Infra/storage murni, usage kecil.
- `supabase.ts`
  - Aman setelah path infra-nya siap; impact sedikit lebih besar karena dipakai auth/logs/api.
- `teams.ts`
  - Cukup aman karena tetap satu domain walau lumayan lebar.
- `subChallenges.ts`
  - Masih aman kalau move as-is dulu ke challenges feature.

**Moves To Postpone**
- `challenges.ts`
- `users.ts`
- `settings.ts`
- `index.ts` removal total

**Recommended Ownership Map**
- `shared/lib`
  - `utils.ts`
  - `crypto.ts`
- `lib/supabase`
  - `supabase.ts`
  - `supabase-config.ts`
- `lib/storage`
  - `settings.ts` or its later splits
  - `userState.ts`
- `features/admin`
  - `admin.ts`
- `features/admin/overview`
  - `activityStats.ts`
- `features/challenges`
  - `subChallenges.ts`
  - later: challenge-only slices from `challenges.ts`
- `features/events`
  - `events.ts`
- `features/preview`
  - `preview.ts`
- `features/teams`
  - `teams.ts`
- `features/users`
  - `users.ts`
- `features/scoreboard`
  - later: leaderboard-related slices from `challenges.ts`
- `widgets/notifications`
  - later: notification-related slices from `challenges.ts`

**Incremental Migration Advice**
- Kalau tujuan phase berikutnya tetap “ownership clarity dengan risiko minimal”, urutan terbaiknya:
  1. Stop nambah usage baru ke `@/shared/lib`
  2. Pindahin low-risk files yang owner-nya sudah jelas
  3. Baru kurangi barrel usage
  4. Setelah itu audit ulang `challenges.ts`, `users.ts`, `settings.ts`

Kalau kamu mau, next saya bisa bikin **Phase A migration plan** khusus untuk 5-6 file paling aman dulu, lengkap dengan exact file moves, import updates, risk, dan rollback, tanpa menyentuh `challenges.ts` dulu.
