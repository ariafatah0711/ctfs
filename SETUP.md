# Setup Guide - CTFS

Panduan lengkap untuk setup aplikasi CTFS dari awal.

## 🎯 Quick Start

### 1. Setup Supabase

1. **Buat Project Supabase**
   - Buka [supabase.com](https://supabase.com)
   - Klik "New Project"
   - Pilih organization dan isi nama project
   - Tunggu hingga project selesai dibuat

2. **Setup Database**
   - Buka SQL Editor di challanges Supabase
   - Copy semua isi file `supabase-schema-fixed.sql` (gunakan file yang fixed)
   - Paste dan jalankan script tersebut
   - Pastikan tidak ada error

3. **Ambil API Keys**
   - Buka Settings > API
   - Copy `Project URL` dan `anon public` key

### 2. Setup Environment

```bash
# Clone repository
git clone <your-repo-url>
cd ctfs

# Install dependencies
npm install

# Setup environment variables
cp env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Run Development

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup Detail

### Tables yang Dibuat

1. **users** - Data user
2. **challenges** - Data challenges
3. **solves** - Data penyelesaian challenge

### Sample Data

Script SQL sudah include 3 sample challenges:
- Welcome Challenge (100 pts)
- SQL Injection Basics (200 pts)
- Reverse Engineering 101 (300 pts)

### Row Level Security (RLS)

- Users bisa lihat semua data
- Users hanya bisa update data sendiri
- Solves hanya bisa dibuat oleh user yang login

## 🚀 Deploy ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy di Vercel

1. Login ke [vercel.com](https://vercel.com)
2. Klik "New Project"
3. Import dari GitHub repository
4. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

### 3. Update Supabase Settings

Di Supabase challanges:
1. Settings > Authentication
2. Site URL: `https://your-app.vercel.app`
3. Redirect URLs: `https://your-app.vercel.app/**`

## 🧪 Testing

### Test Flag Validation

```typescript
import { testFlagValidation } from '@/lib/flag-helper'

// Jalankan di browser console atau component
testFlagValidation()
```

### Test Sample Flags

- Flag: `hello` → Hash: `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3`
- Flag: `sqli123` → Hash: `ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d`
- Flag: `reverseme` → Hash: `5994471abb01112afcc18159f6cc74b4f511b99806da59b3caf5a9c173cacfc5`

## 🔧 Menambah Challenge Baru

### Via Supabase challanges

1. Buka Table Editor > challenges
2. Klik "Insert" > "Insert row"
3. Isi data:
   - title: Nama challenge
   - category: Kategori (Web, Reverse, Crypto, dll)
   - points: Jumlah poin
   - flag_hash: Hash SHA256 dari flag

### Via SQL

```sql
INSERT INTO challenges (title, category, points, flag_hash)
VALUES (
  'New Challenge',
  'Web',
  150,
  'hash_sha256_dari_flag'
);
```

### Generate Hash Flag

```typescript
import { generateFlagHash } from '@/lib/flag-helper'

const flag = "ctf{my_flag}"
const hash = generateFlagHash(flag)
console.log(hash) // Copy hash ini ke database
```

## 🐛 Troubleshooting

### Error: "Invalid API key"

- Pastikan `NEXT_PUBLIC_SUPABASE_ANON_KEY` benar
- Restart development server setelah update .env

### Error: "Failed to fetch"

- Cek `NEXT_PUBLIC_SUPABASE_URL`
- Pastikan project Supabase aktif

### Error: "User not found"

- Pastikan script SQL sudah dijalankan
- Cek tabel `users` ada data

### Error: "RLS policy violation"

- Pastikan user sudah login
- Cek RLS policies di Supabase

## 📱 Pages Overview

- **/** - Redirect ke login/challanges
- **/login** - Login page
- **/register** - Register page
- **/challanges** - Main challanges dengan challenges
- **/scoreboard** - Leaderboard ranking

## 🔒 Security Notes

- Semua flag disimpan sebagai hash SHA256
- Row Level Security aktif di semua tabel
- Authentication required untuk semua operasi
- Input validation di frontend dan backend

## 📞 Support

Jika ada masalah:
1. Cek console browser untuk error
2. Cek Supabase logs
3. Pastikan semua environment variables benar
4. Buat issue di repository

---

**Happy Hacking! 🚀**
