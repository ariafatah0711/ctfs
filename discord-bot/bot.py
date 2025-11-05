import asyncio
import json
import logging
import os
import hashlib
from datetime import datetime, timezone
from typing import Any, Dict, List
from dateutil import parser

import aiohttp
import discord
from discord import Intents
from dotenv import load_dotenv

# --------------------------
# Environment & Config
# --------------------------
load_dotenv()

DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
CHANNEL_ID = int(os.getenv("CHANNEL_ID", "0"))
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "60"))
SOLVES_FILE = os.getenv("SOLVES_FILE", "solves.json")
STATE_FILE = os.getenv("STATE_FILE", "state.json")
MENTION_ROLE_ID = os.getenv("MENTION_ROLE_ID", "0")

# --------------------------
# Logging setup
# --------------------------
logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s: %(message)s")
logger = logging.getLogger("ctf-bot")

# --------------------------
# Discord client
# --------------------------
intents = Intents.default()
client = discord.Client(intents=intents)


# --------------------------
# Helpers: File State & Storage
# --------------------------
def load_json(path: str, default: Any):
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    return default


def save_json(path: str, data: Any):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def load_state() -> Dict[str, Any]:
    return load_json(STATE_FILE, {"latest_ids": [], "table_id": None})


def save_state(state: Dict[str, Any]):
    save_json(STATE_FILE, state)


def load_solves() -> List[Dict[str, Any]]:
    return load_json(SOLVES_FILE, [])


def save_solves(solves: List[Dict[str, Any]]):
    save_json(SOLVES_FILE, solves)


def resolve_mention(channel, identifier: str) -> str:
    guild = getattr(channel, "guild", None)
    if not guild:
        return f"@{identifier}"

    if identifier.isdigit():
        member = guild.get_member(int(identifier))
        if member:
            return member.mention
        role = guild.get_role(int(identifier))
        if role:
            return role.mention

    member = guild.get_member_named(identifier)
    if member:
        return member.mention

    role = discord.utils.get(guild.roles, name=identifier)
    if role:
        return role.mention

    return f"@{identifier}"


def format_normal_date(iso_date: str) -> str:
    """Format date ke format normal YYYY-MM-DD HH:MM:SS"""
    try:
        then = datetime.fromisoformat(iso_date.replace("Z", "+00:00"))
        local_time = then.astimezone(timezone.utc)
        return local_time.strftime("%Y-%m-%d %H:%M:%S")
    except Exception:
        return iso_date


# --------------------------
# Fetch from Supabase
# --------------------------
async def fetch_firstbloods(session: aiohttp.ClientSession) -> List[Dict[str, Any]]:
    try:
        url = SUPABASE_URL.rstrip("/") + "/rest/v1/rpc/get_notifications"
        headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
        payload = {"p_limit": 100, "p_offset": 0}

        async with session.post(url, json=payload, headers=headers, timeout=30) as resp:
            resp.raise_for_status()
            data = await resp.json()

        results = []
        for item in data:
            notif_type = str(item.get("notif_type") or "").lower()
            if notif_type not in ("first_blood", "firstblood", "first-blood", "first"):
                continue

            time_str = item.get("notif_created_at") or item.get("created_at") or ""
            if not time_str:
                continue

            try:
                _ = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
            except Exception:
                continue

            raw_key = f"{item.get('notif_username')}|{item.get('notif_challenge_title')}|{time_str}"
            sid = hashlib.sha256(raw_key.encode()).hexdigest()

            results.append({
                "id": sid,
                "user": str(item.get("notif_username") or "<unknown>"),
                "challenge": str(item.get("notif_challenge_title") or "<unknown>"),
                "category": str(item.get("notif_category") or "<unknown>"),
                "time": time_str,
            })

        return results

    except Exception:
        logger.exception("Error fetching notifications")
        return []


# --------------------------
# Discord Message Rendering
# --------------------------
async def update_table(channel, solves: List[Dict[str, Any]], state: Dict[str, Any]):
    """Update atau create table message (10 terakhir)"""
    lines = []
    for s in solves[-10:]:
        t = format_normal_date(s.get("time", ""))
        lines.append(f"🩸 **{s['user']}** → **{s['challenge']}** ({s['category']})\n🕒 {t}")

    embed = discord.Embed(
        title="🏆 First Blood Table (10 Latest)",
        description="\n\n".join(lines),
        color=0xff0000
    )

    table_id = state.get("table_id")
    try:
        if table_id:
            msg = await channel.fetch_message(int(table_id))
            await msg.edit(embed=embed)
        else:
            msg = await channel.send(embed=embed)
            state["table_id"] = str(msg.id)
    except Exception:
        msg = await channel.send(embed=embed)
        state["table_id"] = str(msg.id)

async def post_latest(channel, solves: List[Dict[str, Any]], state: Dict[str, Any]):
    """
    Menampilkan 3 notifikasi solve terbaru (di luar tabel embed).
    Kalau ada solve baru -> kirim notif baru.
    Kalau notif > 3 -> hapus yang paling lama.
    """
    MAX_LATEST = 3
    current_ids: list[str] = state.get("latest_ids", [])

    # Ambil pesan lama (kalau masih ada)
    existing_msgs = []
    for mid in current_ids:
        try:
            msg = await channel.fetch_message(int(mid))
            existing_msgs.append(msg)
        except:
            pass

    # Kumpulkan sid dari pesan lama (disimpan di dalam ||sid||)
    existing_sids = set()
    for msg in existing_msgs:
        if "||" in msg.content:
            parts = msg.content.split("||")
            if len(parts) >= 2:
                existing_sids.add(parts[1].strip())

    # Ambil solve terbaru (3 terakhir)
    latest_solves = solves[-MAX_LATEST:]

    # Kirim notif baru kalau belum pernah dipost
    for s in latest_solves:
        sid = s["id"]
        if sid in existing_sids:
            continue  # sudah pernah dikirim

        solved_str = format_normal_date(s.get("time", ""))
        mention = (
            resolve_mention(channel, MENTION_ROLE_ID)
            if MENTION_ROLE_ID and MENTION_ROLE_ID != "0"
            else ""
        )

        content = (
            f"🩸 **{s['user']}** just claimed first blood on "
            f"**{s['challenge']}** ({s['category']})\n🕒 {solved_str} {mention} ||{sid}||"
        )

        msg = await channel.send(content)
        current_ids.append(str(msg.id))
        logger.info(f"Posted new first blood: {s['user']} - {s['challenge']}")

    # Hapus pesan lama kalau sudah lebih dari 3
    while len(current_ids) > MAX_LATEST:
        try:
            old_id = current_ids.pop(0)
            old_msg = await channel.fetch_message(int(old_id))
            await old_msg.delete()
            logger.info(f"Deleted old message {old_id}")
        except:
            pass

    # Simpan state terbaru
    state["latest_ids"] = current_ids

# --------------------------
# Main Loop
# --------------------------
from datetime import timezone
def parse_time_safe(t):
    dt = parser.isoparse(t)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt

async def poll_loop():
    await client.wait_until_ready()
    channel = client.get_channel(CHANNEL_ID)
    if not channel:
        logger.error("Channel not found, exiting.")
        await client.close()
        return

    state = load_state()
    last_post_time_str = state.get("last_post_time")
    last_post_time = (
        parse_time_safe(last_post_time_str)
        if last_post_time_str else datetime.min.replace(tzinfo=timezone.utc)
    )

    async with aiohttp.ClientSession() as session:
        while not client.is_closed():
            try:
                solves_new = await fetch_firstbloods(session)
                solves_old = load_solves()

                new_ids = {s["id"] for s in solves_new}
                old_ids = {s["id"] for s in solves_old}

                # Bersihkan data lama dari chall yang udah di-hide
                cleaned_solves = [s for s in solves_old if s["id"] in new_ids]
                if len(cleaned_solves) != len(solves_old):
                    logger.info("Removed stale solves for main table.")

                # Gabungkan dan simpan 100 terbaru
                combined = {s["id"]: s for s in (cleaned_solves + solves_new)}
                solves = sorted(combined.values(), key=lambda x: parse_time_safe(x["time"]))[-100:]
                save_solves(solves)

                # Ambil solve baru berdasarkan ID + waktu > last_post_time
                new_solves_detected = [
                    s for s in solves
                    if s["id"] not in old_ids and parse_time_safe(s["time"]) > last_post_time
                ]

                # Update embed utama
                await update_table(channel, solves, state)

                # Kirim notif realtime hanya kalau solve lebih baru dari terakhir post
                if new_solves_detected:
                    new_solves_detected = sorted(
                        new_solves_detected,
                        key=lambda x: parse_time_safe(x["time"])
                    )
                    await post_latest(channel, new_solves_detected, state)

                    # Update last_post_time ke solve terbaru
                    last_post_time = parse_time_safe(new_solves_detected[-1]["time"])
                    state["last_post_time"] = last_post_time.isoformat()

                save_state(state)

            except Exception:
                logger.exception("Error in poll loop")

            await asyncio.sleep(POLL_INTERVAL)

@client.event
async def on_ready():
    logger.info("Logged in as %s#%s", client.user.name, client.user.discriminator)
    channel = client.get_channel(CHANNEL_ID)

    if channel and (not os.path.exists(STATE_FILE) or not os.path.exists(SOLVES_FILE)):
        try:
            await channel.purge(limit=None, check=lambda m: m.author == client.user)
            logger.info("Channel purged (first run / missing state).")
        except Exception as e:
            logger.error("Failed to clear channel: %s", e)

    asyncio.create_task(poll_loop())


def main():
    if not DISCORD_TOKEN:
        logger.error("DISCORD_TOKEN not set. Exiting.")
        return
    client.run(DISCORD_TOKEN)


if __name__ == "__main__":
    main()
