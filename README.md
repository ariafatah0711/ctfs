# CTFS - Capture The Flag System

Aplikasi CTF minimalis yang dibangun dengan Next.js dan Supabase. Aplikasi ini menyediakan sistem challenge, scoring, dan leaderboard untuk kompetisi Capture The Flag.

## 🚀 Fitur

```bash
curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/challenges"   -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users"   -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/solves"   -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/submit_flag" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"p_challenge_id\": \"${chall_id}\", \"p_flag\": \"flag{tes}\"}"

JWT="eyJhbGciOiJIUzI1NiIsImtpZCI6Imp6c0lrN0MzdFk0SWpUZGUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2piZGN4ZHZwYmZtcWNoZnBhd3FwLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3OGRmMzU4Yi02NjVkLTRhYTQtYTQ2OS1lZTY1NjhmYTJiMTgiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU4NjI2ODY5LCJpYXQiOjE3NTg2MjMyNjksImVtYWlsIjoidGVzNUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImRpc3BsYXlfbmFtZSI6InRlczUiLCJlbWFpbCI6InRlczVAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNzhkZjM1OGItNjY1ZC00YWE0LWE0NjktZWU2NTY4ZmEyYjE4IiwidXNlcm5hbWUiOiJ0ZXM1In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTg2MjMyNjl9XSwic2Vzc2lvbl9pZCI6ImM1NTdkZjEwLWI2MGQtNDI4NS1hNTU1LTA5YmVmOTQ0NGFkMyIsImlzX2Fub255bW91cyI6ZmFsc2V9.a5u_dYZAK7S1vfJRnNQi90j7i_l6sLoQUj9P-MxbPFU"
curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}"
curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/solves" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}"
curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/challenges" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}"
curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/challenge_flags" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}"

curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/challenges" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Insert/Delete Only",
    "description": "Challenge ini cuma buat test security insert & delete.",
    "category": "Testing",
    "points": 50,
    "hint": "No hint, this is just a test",
    "difficulty": "Easy",
    "attachments": "[]"
  }'

chall_id="2341c787-b77d-4ed9-ab31-38e523ff405f"
USER_ID="07fd81cb-ddae-4dfe-af89-f88220577828"

curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/challenge_flags" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d "{
    \"challenge_id\": \"${chall_id}\",
    \"flag\": \"flag{test_insert_delete}\"
  }"

curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users?id=eq.${USER_ID}" \
  -X PATCH \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{"is_admin": true}'

curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/submit_flag" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d "{\"p_challenge_id\": \"${chall_id}\", \"p_flag\": \"flag{tes}\"}"
```

- **Authentication**: Sistem login/register menggunakan Supabase Auth
- **challanges**: Tampilan challenges dengan status solved/belum
- **Flag Submission**: Validasi flag menggunakan hash SHA256
- **Scoreboard**: Ranking user berdasarkan total score
- **Admin challanges**: Panel admin untuk menambah challenge baru
- **Responsive Design**: UI yang clean dan minimalis dengan Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + Database)
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+
- npm atau yarn
- Akun Supabase

## ⚙️ Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd ctfs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Buat project baru di [Supabase](https://supabase.com)
2. Buka SQL Editor di challanges Supabase
3. Jalankan script SQL dari file `sql/schema.sql`
4. Jalankan script SQL dari file `sql/admin-policies.sql` (untuk admin functionality)
5. Ambil URL dan Anon Key dari Settings > API

### 4. Environment Variables

Buat file `.env.local` di root project:

```bash
cp env.example .env.local
```

Edit `.env.local` dengan data Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## 🗄️ Database Schema

### Tables

- **users**: Data user (id, username, score, is_admin)
- **challenges**: Data challenges (id, title, description, category, points, flag_hash, hint, difficulty, is_active)
- **solves**: Data penyelesaian challenge (id, user_id, challenge_id, created_at)

### Sample Data

Script SQL sudah include sample challenges:
- Welcome Challenge (100 pts) - flag: "hello"
- SQL Injection Basics (200 pts) - flag: "sqli123"
- Reverse Engineering 101 (300 pts) - flag: "reverseme"

## 👨‍💼 Admin Setup

Untuk mengaktifkan admin functionality:

1. Jalankan script `sql/admin-policies.sql`
2. Set user sebagai admin di database:
   ```sql
   UPDATE public.users SET is_admin = true WHERE id = 'your-user-id';
   ```

## 🚀 Deployment ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy di Vercel

1. Login ke [Vercel](https://vercel.com)
2. Import project dari GitHub
3. Tambahkan environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### 3. Update Supabase Settings

Di Supabase challanges, tambahkan domain Vercel ke:
- Settings > Authentication > Site URL
- Settings > Authentication > Redirect URLs

## 📁 Struktur Project

```
ctfs/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── challanges/       # Halaman challanges
│   │   ├── admin/          # Halaman admin challanges
│   │   ├── login/          # Halaman login
│   │   ├── register/       # Halaman register
│   │   ├── scoreboard/     # Halaman scoreboard
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   └── ChallengeCard.tsx # Challenge card component
│   ├── lib/               # Utility functions
│   │   ├── supabase.ts    # Supabase client
│   │   ├── auth.ts        # Auth functions
│   │   ├── challenges.ts  # Challenge functions
│   │   └── crypto.ts      # Crypto utilities
│   └── types/             # TypeScript types
├── sql/                   # Database scripts
│   ├── schema.sql         # Main database schema
│   └── admin-policies.sql # Admin policies
├── docs/                  # Documentation
│   ├── DEPLOY.md         # Deploy guide
│   ├── FLAG-TESTING.md   # Flag testing guide
│   ├── SAMPLE-FLAGS.md   # Sample flags
│   └── TROUBLESHOOTING.md # Troubleshooting guide
├── env.example           # Environment variables example
└── README.md            # This file
```

## 🔧 Helper Functions

### Hash Flag

```typescript
import { hashFlag } from '@/lib/crypto'

// Hash flag sebelum disimpan ke database
const flagHash = hashFlag('your-flag-here')
```

### Validate Flag

```typescript
import { validateFlag } from '@/lib/crypto'

// Validasi flag yang di-submit user
const isValid = validateFlag(submittedFlag, storedHash)
```

## 🎯 Cara Menambah Challenge Baru

### Via Admin challanges

1. Login sebagai admin
2. Buka halaman Admin challanges
3. Klik "Tambah Challenge"
4. Isi form dengan data challenge
5. Submit challenge

### Via Database

```sql
-- Contoh menambah challenge baru
INSERT INTO challenges (title, description, category, points, flag_hash, hint, difficulty)
VALUES (
  'New Challenge',
  'Description challenge',
  'Web',
  150,
  'hash_sha256_dari_flag',
  'Hint untuk challenge',
  'Medium'
);
```

## 🔒 Security Features

- Row Level Security (RLS) di Supabase
- Flag validation menggunakan SHA256 hash
- Authentication required untuk semua operasi
- Admin-only access untuk menambah challenge
- Input validation dan sanitization

## 📱 Pages

- **/** - Redirect ke login/challanges
- **/login** - Halaman login
- **/register** - Halaman register
- **/challanges** - challanges dengan daftar challenges
- **/scoreboard** - Leaderboard ranking
- **/admin** - Admin challanges (admin only)

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🆘 Support

Jika ada masalah atau pertanyaan, silakan buat issue di repository ini.
![alt text](images/README/image.png)
---

**Happy Hacking! 🚀**

```bash
-- Ganti 'your-user-id-here' dengan user ID yang sebenarnya
UPDATE public.users
SET is_admin = true
WHERE id = '';
```
