# Troubleshooting Guide - CTFS

Panduan mengatasi masalah yang sering terjadi saat setup dan deploy aplikasi CTFS.

## 🚨 Error SQL Setup

### Error: "permission denied to set parameter app.jwt_secret"

**Penyebab:** Baris `ALTER DATABASE postgres SET "app.jwt_secret"` memerlukan permission superuser.

**Solusi:**
1. Gunakan file `supabase-schema-fixed.sql` (sudah diperbaiki)
2. Atau hapus baris tersebut dari script SQL
3. Script akan tetap berfungsi tanpa baris tersebut

### Error: "relation already exists"

**Penyebab:** Tabel sudah ada di database.

**Solusi:**
```sql
-- Hapus tabel yang sudah ada (jika perlu)
DROP TABLE IF EXISTS public.solves CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Jalankan script SQL lagi
```

### Error: "function get_leaderboard() already exists"

**Penyebab:** Function sudah ada.

**Solusi:**
```sql
-- Hapus function yang sudah ada
DROP FUNCTION IF EXISTS get_leaderboard();

-- Jalankan script SQL lagi
```

## 🔐 Error Authentication

### Error: "Invalid API key"

**Penyebab:** API key Supabase salah atau tidak ada.

**Solusi:**
1. Cek file `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```
2. Pastikan tidak ada spasi atau karakter tambahan
3. Restart development server: `npm run dev`

### Error: "Failed to fetch"

**Penyebab:** URL Supabase salah atau project tidak aktif.

**Solusi:**
1. Cek `NEXT_PUBLIC_SUPABASE_URL` di `.env.local`
2. Pastikan project Supabase aktif
3. Cek koneksi internet

### Error: "User not found" atau "PGRST116: The result contains 0 rows"

**Penyebab:** User sudah terdaftar di `auth.users` tapi tidak ada di tabel `public.users`.

**Solusi:**
1. **Jalankan script fix existing users:**
   ```sql
   -- Jalankan di Supabase SQL Editor
   INSERT INTO public.users (id, username, score)
   SELECT 
     au.id,
     COALESCE(
       au.raw_user_meta_data->>'username',
       au.raw_user_meta_data->>'display_name',
       split_part(au.email, '@', 1),
       'user_' || substring(au.id::text, 1, 8)
     ) as username,
     0 as score
   FROM auth.users au
   LEFT JOIN public.users pu ON au.id = pu.id
   WHERE pu.id IS NULL
     AND au.email_confirmed_at IS NOT NULL;
   ```

2. **Atau gunakan script `fix-existing-users.sql`**

3. **Cek data user:**
   ```sql
   SELECT u.id, u.username, u.score, au.email
   FROM public.users u
   JOIN auth.users au ON u.id = au.id;
   ```

## 🗄️ Error Database

### Error: "RLS policy violation" atau "new row violates row-level security policy"

**Penyebab:** Row Level Security policy tidak mengizinkan operasi, terutama saat registrasi.

**Solusi:**
1. **Jalankan script fix RLS:**
   ```sql
   -- Jalankan di Supabase SQL Editor
   DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
   
   CREATE POLICY "Allow user registration" ON public.users
     FOR INSERT WITH CHECK (
       auth.uid() = id AND 
       auth.role() = 'authenticated'
     );
   ```

2. **Atau gunakan script `fix-rls-policy.sql`**

3. **Cek policies yang ada:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users';
   ```

4. **Jika masih error, gunakan policy yang lebih permisif:**
   ```sql
   DROP POLICY IF EXISTS "Allow user registration" ON public.users;
   CREATE POLICY "Allow user registration" ON public.users
     FOR INSERT WITH CHECK (true);
   ```

### Error: "Foreign key constraint violation"

**Penyebab:** Referensi ke tabel yang tidak ada.

**Solusi:**
1. Pastikan semua tabel sudah dibuat
2. Cek urutan pembuatan tabel di script SQL
3. Pastikan `auth.users` table ada (default Supabase)

## 🚀 Error Deploy

### Error: "Build failed"

**Penyebab:** Error saat build di Vercel.

**Solusi:**
1. Cek logs di Vercel dashboard
2. Pastikan semua dependencies terinstall
3. Cek TypeScript errors:
   ```bash
   npm run build
   ```

### Error: "Environment variables not found"

**Penyebab:** Env vars tidak di-set di Vercel.

**Solusi:**
1. Buka Vercel dashboard > Project > Settings > Environment Variables
2. Tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy project

### Error: "CORS policy"

**Penyebab:** Domain tidak diizinkan di Supabase.

**Solusi:**
1. Buka Supabase dashboard > Settings > API
2. Tambahkan domain Vercel ke allowed origins
3. Atau tambahkan di Authentication > Site URL

## 🔧 Error Runtime

### Error: "Cannot read properties of undefined"

**Penyebab:** Data tidak ter-load dengan benar.

**Solusi:**
1. Cek console browser untuk error detail
2. Pastikan Supabase connection berfungsi
3. Cek network tab untuk failed requests

### Error: "Flag validation failed"

**Penyebab:** Hash flag tidak cocok.

**Solusi:**
1. Cek flag yang di-submit user
2. Cek hash yang tersimpan di database
3. Test dengan sample flags:
   - `hello` → `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3`
   - `sqli123` → `ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d`

## 🧪 Testing & Debug

### Test Supabase Connection

```javascript
// Jalankan di browser console
import { supabase } from './src/lib/supabase'
console.log(supabase)
```

### Test Flag Hash

```javascript
// Jalankan di browser console
import { hashFlag } from './src/lib/crypto'
console.log(hashFlag('hello'))
// Output: a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3
```

### Check Database Tables

```sql
-- Jalankan di Supabase SQL Editor
SELECT * FROM public.users;
SELECT * FROM public.challenges;
SELECT * FROM public.solves;
```

## 📞 Getting Help

Jika masih ada masalah:

1. **Check logs:**
   - Browser console
   - Vercel function logs
   - Supabase logs

2. **Verify setup:**
   - Environment variables
   - Database schema
   - RLS policies

3. **Test components:**
   - Supabase connection
   - Authentication flow
   - Database queries

4. **Create issue** di repository dengan detail:
   - Error message
   - Steps to reproduce
   - Environment info

---

**Happy debugging! 🐛**
