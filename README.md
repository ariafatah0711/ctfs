# CTF Platform Setup & Deployment Guide

## 1. Clone Repository

```bash
git clone https://github.com/your-username/your-ctf-repo.git
cd your-ctf-repo
```

## 2. Install Dependencies

```bash
npm install

# dev
npm run dev

# build
npm run build
```

## 3. Supabase Setup

1. **Buat Project Supabase**
   Login ke [Supabase](https://supabase.com/) dan buat project baru.

2. **Copy Schema**
   Upload file `sql/chema.sql` ke Supabase SQL editor dan jalankan untuk setup database schema.

3. **Tambahkan Data Testing (Opsional)**
   - Untuk testing challenges: gunakan ```sql/testing_challenges.sql```.
   - Untuk scoreboard dummy: gunakan folder sql/dummy_scoreboard/.
     - Untuk testing challenges: gunakan sql/testing_challenges.sql.
     - generate terlebih dahulu dengan ```create_solves.py``` atau gunakan yang sudah ada ```solves.sql```

## 4. Konfigurasi Environment

Buat file `.env.local` di root project, isi dengan:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Ambil value dari project Supabase kamu.

## 5. Hosting ke Vercel

1. Push project ke GitHub.
2. Login ke [Vercel](https://vercel.com/) dan import repository.
3. Set environment variables di Vercel sesuai `.env.local`.
4. Deploy!

## 6. Setup Authentication (Login Gmail)
1. Enable Google Provider di Supabase
   - Dashboard → Authentication → Providers → Google → Enable.
   - Masukkan Client ID dan Client Secret dari Google Cloud Console.
2. Buat OAuth Client di Google
   - Buka Google Cloud Console
   - APIs & Services → Credentials → Create OAuth Client ID.
   - Pilih Application type: Web.
   - Authorized redirect URIs:
     ```https://<YOUR_PROJECT_REF>.supabase.co/auth/v1/callback```
   - Simpan Client ID dan Client Secret → masukkan ke Supabase.

---

**Note:**
Jika ada perubahan schema, ulangi langkah Supabase SQL dan deploy ulang ke Vercel.

> jika mengubah schema ulang hati hati bisa saja datanya kehapus

<!-- ### test security -->
<!-- ```bash
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
``` -->
