# CTFS - Capture The Flag System

Aplikasi CTF minimalis yang dibangun dengan Next.js dan Supabase. Aplikasi ini menyediakan sistem challenge, scoring, dan leaderboard untuk kompetisi Capture The Flag.

## 🚀 Fitur

```bash
npx shadcn@latest add button card dialog input textarea select badge label skelaton table switch
```

```bash
chall_id="10000000-0000-0000-0000-000000000001"
USER_ID="00000000-0000-0000-0000-000000000001"

curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/challenges"   -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/users"   -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}"
curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/solves"   -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}"

curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/submit_flag" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"p_challenge_id\": \"${chall_id}\", \"p_flag\": \"flag{dummy1}\"}"

JWT="eyJhbGciOiJIUzI1NiIsImtpZCI6Imp6c0lrN0MzdFk0SWpUZGUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2piZGN4ZHZwYmZtcWNoZnBhd3FwLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI1YzMzMzFmMy05NzI3LTRlYzQtODk0ZS02MzhmYmMyNTNiYTQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzU4NjM2MjcwLCJpYXQiOjE3NTg2MzI2NzAsImVtYWlsIjoiY2FsaG91bnNndDA3QGdtYWlsLmNvbSIsInBob25lIjoiIiwiYXBwX21ldGFkYXRhIjp7InByb3ZpZGVyIjoiZW1haWwiLCJwcm92aWRlcnMiOlsiZW1haWwiXX0sInVzZXJfbWV0YWRhdGEiOnsiZGlzcGxheV9uYW1lIjoiYWRtaW4iLCJlbWFpbCI6ImNhbGhvdW5zZ3QwN0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJzdWIiOiI1YzMzMzFmMy05NzI3LTRlYzQtODk0ZS02MzhmYmMyNTNiYTQiLCJ1c2VybmFtZSI6ImFkbWluIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTg2MjkwNzZ9XSwic2Vzc2lvbl9pZCI6ImUxZTA3YjUzLTVhYjctNGRmYS05YTA2LTYwMTAxM2Q5NDJmYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.ct0HmJ6RXccRTpG0iA8XicytvfJ6PmGBtH0LOB1uaq0"

curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/is_admin" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}"

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

curl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/submit_flag" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d "{\"p_challenge_id\": \"${chall_id}\", \"p_flag\": \"flag{dummy1}\"}"

CHALL_TEST_RAW=$(curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/add_challenge" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{
    "p_title":"Test Add Challenge (auto)",
    "p_description":"Dipakai untuk testing hak akses",
    "p_category":"Testing",
    "p_points":10,
    "p_flag":"flag{autotest_add}",
    "p_difficulty":"Easy",
    "p_hint": null,
    "p_attachments": "[]"
  }')

CHALL_TEST=$(echo "${CHALL_TEST_RAW}" | tr -d '"')
echo $CHALL_TEST

curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/update_challenge" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{
    "p_challenge_id":"'"${CHALL_TEST}"'",
    "p_title":"Updated Title (test)",
    "p_description":"Updated desc",
    "p_category":"Web",
    "p_points":99,
    "p_difficulty":"Hard",
    "p_hint": null,
    "p_attachments": "[]",
    "p_is_active": true,
    "p_flag": "flag{updated_flag_optional}"
  }'

curl -s "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/delete_challenge" \
  -H "apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer ${JWT}" \
  -H "Content-Type: application/json" \
  -d '{"p_challenge_id":"'"${CHALL_TEST}"'"}'
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
- **/challanges** - challanges dengan Register challenges
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
