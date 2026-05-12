Masih ada, tapi sekarang kita sudah masuk area yang lebih “selective”, bukan low-risk semudah step-step sebelumnya.

Sisa `shared/lib` sekarang:
- `challenges.ts`
- `crypto.ts`
- `events.ts`
- `settings.ts`
- `teams.ts`
- `users.ts`
- `utils.ts`
- `index.ts`

Status yang paling masuk akal:
- `crypto.ts`: stay shared
- `utils.ts`: stay shared
- `teams.ts`: masih layak lanjut next, owner-nya cukup jelas ke `features/teams`
- `events.ts`: masih bisa dipindah, tapi sedikit lebih mixed daripada `teams.ts`
- `users.ts`: tunda dulu, karena campur profile logic dan stats/admin-ish data
- `settings.ts`: tunda dulu, karena ini infra tapi key-nya campur beberapa feature
- `challenges.ts`: paling berbahaya, jangan disentuh dulu
- `index.ts`: jangan dihapus dulu total, cukup dikecilkan bertahap

Jadi kalau mau lanjut incremental yang masih aman, urutannya sekarang:
1. `teams.ts`
2. `events.ts`
3. stop dulu dan audit ulang
4. baru putuskan `users.ts` / `settings.ts`
5. `challenges.ts` paling akhir

Kalau lanjut, saya saranin next langsung `teams.ts`.
