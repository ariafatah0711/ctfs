Sisa `src/shared/lib` sekarang:
- `challenges.ts`
- `events.ts`
- `teams.ts`
- `users.ts`
- `settings.ts`
- `crypto.ts`
- `utils.ts`
- `index.ts`

Audit ini fokus ke:
- jangan ubah behavior
- jangan sweeping refactor
- cari move paling aman dulu
- tandai file mixed yang harus dipostpone

Update:
- `src/shared/lib/events.ts` sudah dipindah ownership-nya ke `src/features/events/services/event.service.ts`
- `src/shared/lib/events.ts` sekarang berfungsi sebagai compatibility shim via re-export

## Per-file audit

### `challenges.ts`

Responsibility sekarang:
- challenge list publik
- challenge detail / placeholder / services
- submit flag
- admin CRUD challenge
- leaderboard / progress / first blood
- solver lookup
- notifications dan realtime solves

Status:
- bukan truly shared
- sudah jelas domain-owned
- terlalu mixed untuk dipindah 1:1

Import usage penting:
- `features/challenges/*`
- `features/scoreboard/*`
- `features/admin/challenges/*`
- `features/admin/solvers/*`
- `features/admin/overview/*`
- `features/users/hooks/useUserProfile.ts`
- `features/logs/contexts/LogsContext.tsx`
- `widgets/notifications/hooks/useNotifications.ts`

Recommended owner:
- `features/challenges`

Target path:
- jangan move langsung
- eventual split:
  - `src/features/challenges/services/challenge.service.ts`
  - `src/features/challenges/services/challenge-admin.service.ts`
  - `src/features/scoreboard/services/leaderboard.service.ts`
  - `src/widgets/notifications/services/notification.service.ts`

Risk level:
- high

Safe to move now:
- postpone

Catatan:
- ada reverse dependency `shared -> features` karena `getFirstBloodLeaderboard()` memakai `getLogs()` dari `features/logs`
- ini sinyal kuat bahwa file harus dipecah dulu sebelum move

### `events.ts`

Responsibility sekarang:
- event CRUD
- assign challenge ke event
- active/started filtering
- join settings
- membership lookup
- join requests
- admin member management

Status:
- bukan truly shared
- domain-owned oleh `events`

Import usage penting:
- `features/events/contexts/EventContext.tsx`
- `features/challenges/hooks/useChallengeEventAccess.ts`
- `features/challenges/components/JoinEventDialog.tsx`
- `features/admin/event/lib/index.ts`
- `features/admin/admins/lib/index.ts`

Recommended owner:
- `features/events`

Target path:
- `src/features/events/services/event.service.ts`

Risk level:
- low

Safe to move now:
- done

Catatan:
- owner jelas
- consumer count masih relatif terkendali
- tidak ada mixed dependency separah `challenges.ts`

### `teams.ts`

Responsibility sekarang:
- create/join/leave/delete team
- invite code
- my team / team by name / team by user id
- team summary
- team challenges
- team scoreboard dan progress
- captain/member management
- export type team

Status:
- bukan truly shared
- domain-owned oleh `teams`

Import usage penting:
- `features/teams/hooks/useMyTeam.ts`
- `features/teams/hooks/useTeamDetail.ts`
- `features/teams/hooks/useTeamScoreboard.ts`
- `features/teams/types/index.ts`
- `features/challenges/hooks/useChallengeList.ts`
- `features/users/hooks/useUserProfile.ts`

Recommended owner:
- `features/teams`

Target path:
- `src/features/teams/services/team.service.ts`

Risk level:
- medium

Safe to move now:
- yes, setelah `events.ts`

Catatan:
- service ownership jelas
- tapi ada type export dari service file yang masih dipakai lintas feature
- lebih aman move service dulu, type cleanup belakangan

### `users.ts`

Responsibility sekarang:
- user detail/profile lookup
- user profile lite
- username/email lookup
- solved challenge list
- category totals
- difficulty totals
- site info
- update username / bio / sosmed / profile picture

Status:
- mixed
- sebagian domain `users`
- sebagian lagi admin/site analytics

Import usage penting:
- `app/user/[username]/page.tsx`
- `features/users/hooks/useUserProfile.ts`
- `features/users/components/UserProfile/EditProfileModal.tsx`
- `features/admin/overview/hooks/useAdminOverviewData.ts`
- `features/admin/overview/types/index.ts`
- `features/admin/overview/components/AuditLog/EmailWithUsernameTooltip.tsx`

Recommended owner:
- split first
- mayoritas ke `features/users`
- `getInfo()` lebih cocok ke `features/admin/overview`

Target path:
- `src/features/users/services/user-profile.service.ts`
- `src/features/admin/overview/services/site-info.service.ts`

Risk level:
- high

Safe to move now:
- postpone

Catatan:
- file ini belum aman dipindah sebagai satu unit
- harus dipisah berdasarkan responsibility dulu

### `settings.ts`

Responsibility sekarang:
- localStorage-backed client settings
- theme setting
- solve notification sound setting
- selected event setting
- challenge filter setting
- tutorial seen state
- legacy key migration

Status:
- truly shared
- cross-cutting client infra

Import usage penting:
- `shared/contexts/ThemeContext.tsx`
- `features/events/contexts/EventContext.tsx`
- `widgets/notifications/hooks/useNotifications.ts`
- `features/challenges/hooks/useChallengeFilterSettings.ts`
- `features/challenges/components/ChallengeJoyride.tsx`

Recommended owner:
- `shared`

Target path:
- keep for now at `src/shared/lib/settings.ts`
- optional future rename: `src/shared/lib/client-settings.ts`

Risk level:
- medium

Safe to move now:
- keep in shared

Catatan:
- meski key namespace campur beberapa feature, responsibility-nya tetap infra shared

### `crypto.ts`

Responsibility sekarang:
- `hashFlag()`
- `validateFlag()`

Status:
- truly shared secara nature
- saat ini unused

Import usage penting:
- tidak ada consumer aktif di luar barrel

Recommended owner:
- `shared`

Target path:
- keep at `src/shared/lib/crypto.ts`

Risk level:
- low

Safe to move now:
- no-op / postpone

Catatan:
- bukan prioritas move karena belum memberi value refactor yang nyata

### `utils.ts`

Responsibility sekarang:
- `cn()`
- `formatRelativeDate()`
- `formatEventDurationCompact()`
- `formatEventTimingLabel()`

Status:
- truly shared
- dipakai lintas UI, shared components, widgets, dan feature code

Import usage penting:
- `shared/ui/*`
- `shared/components/*`
- `features/auth/*`
- `features/admin/*`
- `features/users/*`
- `features/challenges/*`
- `features/logs/*`
- `widgets/notifications/*`
- `app/preview/page.tsx`
- `app/maintenance/page.tsx`

Recommended owner:
- `shared`

Target path:
- keep for now at `src/shared/lib/utils.ts`

Risk level:
- medium-high

Safe to move now:
- keep in shared

Catatan:
- fan-out sangat besar
- jangan disentuh kecuali ada alasan kuat

### `index.ts`

Responsibility sekarang:
- barrel export untuk semua isi `src/shared/lib`

Status:
- compatibility surface
- bukan owner domain logic

Import usage penting:
- dipakai luas oleh `features/challenges`
- `features/teams`
- `features/users`
- `features/scoreboard`
- `features/admin`
- `features/logs`

Recommended owner:
- `shared` sementara

Target path:
- keep at `src/shared/lib/index.ts`

Risk level:
- high

Safe to move now:
- postpone perubahan besar

Catatan:
- jangan dihapus dulu
- paling aman dikecilkan bertahap setelah consumer pindah ke import path yang lebih spesifik

## Output akhir

### Safest first move

Done:
- `src/features/events/services/event.service.ts`

Alasan:
- owner paling jelas
- sedikit mixed concern
- consumer masih relatif sedikit
- tidak butuh split internal besar sebelum move

### Files to keep in shared

- `settings.ts`
- `utils.ts`
- `crypto.ts`
- `index.ts` sementara sebagai compatibility barrel

### Files to postpone

- `challenges.ts`
- `users.ts`
- perubahan besar pada `index.ts`

### Migration order

1. move `teams.ts`
2. stop dan audit ulang import surface
3. split `users.ts`, baru move bagian yang owner-nya jelas
4. split `challenges.ts` paling akhir

## Recommended next step

Kalau lanjut incremental dengan risk paling rendah:
1. move `src/shared/lib/teams.ts` ke owner baru di `features/teams`
2. update consumer yang jelas dulu, terutama `features/teams/*`
3. pertahankan compatibility layer sementara bila perlu
4. jangan sentuh `challenges.ts` dulu
