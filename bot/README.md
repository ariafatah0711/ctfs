# First Blood Announcer (Discord)
## setup vps

```bash
host=202.155.14.158
# scp root@${host}:/root/fgte0

rsync -av --delete --no-perms --no-owner --no-group \
    --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r \
    /mnt/e/5_web/ctfs/bot \
    "root@${host}:/root"
```

<!--
---

Bot ini mengirim notif `FIRST BLOOD` ke channel Discord.

## Fitur

- Hanya kirim notif `first_blood`
- Notif lama sebelum bot dijalankan akan di-skip
- Filter event cukup pakai `EVENT_ID`
- Format pesan Indonesia sesuai contoh

## Setup

1. Masuk folder `bot`
2. Install dependency:

```bash
pip install -r req.txt
```

3. Isi `.env`

Variabel wajib:

- `DISCORD_TOKEN`
- `CHANNEL_ID`
- `SUPABASE_URL`
- `SUPABASE_KEY`

Variabel opsional:

- `POLL_SECONDS` (recommended, default `10`)
- `POLL_MINUTES` (default `1`)
- `STATE_FILE` (default `state.json`)
- `LOG_LEVEL` (default `INFO`)
- `MENTION_ROLE_ID` (mention role setiap notif)
- `MENTION_USER_MAP` (format: `username=discordId,username2=discordId2`)
- `SUPABASE_AUTH_JWT` (pakai ini kalau RPC butuh user JWT, kalau kosong pakai `SUPABASE_KEY`)
- `EVENT_ID` (kosong = semua event)
- `EVENT_NAME` (opsional label event di pesan)

Jika `POLL_SECONDS` diisi, maka itu yang dipakai. Jika tidak, fallback ke `POLL_MINUTES`.

Kalau `EVENT_ID` kosong, bot kirim semua event.

## Run

```bash
python app.py
``` -->
