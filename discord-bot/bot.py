import asyncio
import json
import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List
from dateutil import parser
import hashlib

import aiohttp
import discord
from discord import Intents
from dotenv import load_dotenv

# Load environment
load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
CHANNEL_ID = int(os.getenv("CHANNEL_ID", "0"))
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "60"))
SOLVES_FILE = os.getenv("SOLVES_FILE", "solves.json")
STATE_FILE = os.getenv("STATE_FILE", "state.json")
MENTION_ROLE_ID = os.getenv("MENTION_ROLE_ID", "0")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ctf-bot")

# Discord client
intents = Intents.default()
client = discord.Client(intents=intents)


# --------------------------
# Helpers: state & storage
# --------------------------
def load_state() -> Dict[str, Any]:
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"latest_ids": [], "table_id": None}


def save_state(state: Dict[str, Any]):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def load_solves() -> List[Dict[str, Any]]:
    if os.path.exists(SOLVES_FILE):
        with open(SOLVES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


def save_solves(solves: List[Dict[str, Any]]):
    with open(SOLVES_FILE, "w", encoding="utf-8") as f:
        json.dump(solves, f, indent=2)


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

def format_relative_date(iso_date: str) -> str:
    try:
        then = datetime.fromisoformat(iso_date.replace("Z", "+00:00"))
    except Exception:
        return iso_date

    now = datetime.now(timezone.utc)
    diff = now - then
    diff_seconds = int(diff.total_seconds())

    if diff_seconds < 60:
        return f"{diff_seconds} {'second' if diff_seconds == 1 else 'seconds'} ago"

    diff_minutes = diff_seconds // 60
    if diff_minutes < 60:
        return f"{diff_minutes} {'minute' if diff_minutes == 1 else 'minutes'} ago"

    diff_hours = diff_minutes // 60
    if diff_hours < 24:
        return f"{diff_hours} {'hour' if diff_hours == 1 else 'hours'} ago"

    diff_days = diff_hours // 24
    if diff_days < 30:
        time_str = then.strftime("%H:%M")
        return f"{diff_days} {'day' if diff_days == 1 else 'days'} ago • {time_str}"

    return then.strftime("%Y-%m-%d %H:%M:%S")


# --------------------------
# Fetching from Supabase
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
                t = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
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
# Render messages
# --------------------------
async def update_table(channel, solves: List[Dict[str, Any]], state: Dict[str, Any]):
    """Update atau create table message (20 terakhir)"""

    # embed = discord.Embed(
    #     title="🏆 First Blood Table (20 latest)",
    #     description="Showing the latest 20 first blood solves.",
    #     color=0xff0000
    # )

    # for s in solves[-20:]:
    #     # Use relative time formatting when possible
    #     rel_time = format_relative_date(s.get("time", ""))
    #     # Gabungkan user, challenge, category, dan time jadi satu baris
    #     line = f"{s['user']} → {s['challenge']} ({s['category']}) \n| {rel_time}"
    #     embed.add_field(
    #         name=line,
    #         value="\u200b",  # empty value supaya field tetap valid
    #         inline=False
    #     )

    lines = []
    for s in solves[-10:]:
        rel_time = format_relative_date(s.get("time", ""))
        lines.append(f"{s['user']} → {s['challenge']} ({s['category']}) \n| {rel_time}")

    embed = discord.Embed(
        title="🏆 First Blood Table (10 latest)",
        description="Showing the latest 10 first blood solves.",
        color=0xff0000
    )

    embed.add_field(
        name="\u200b",  # kosong biar nggak muncul nama field
        value="\n".join(lines),
        inline=False
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
    """Maintain up to 3 latest solves (hapus yang lama, simpan message.id asli)"""

    latest_solves = solves[-3:]
    current_ids = state.get("latest_ids", [])

    MAX_LATEST = 3
    # Hapus pesan lama kalau sudah lebih dari max
    while len(current_ids) >= MAX_LATEST:
        try:
            old_id = current_ids.pop(0)
            old_msg = await channel.fetch_message(int(old_id))
            await old_msg.delete()
        except:
            pass

    # Kirim solve baru kalau belum ada
    for s in latest_solves:
        raw_key = f"{s['user']}|{s['challenge']}|{s['time']}"
        sid = hashlib.sha256(raw_key.encode()).hexdigest()

        # cek apakah solve ini sudah dipost (by konten)
        already_posted = False
        for mid in current_ids:
            try:
                msg = await channel.fetch_message(int(mid))
                if sid in msg.content:  # embed sid ke content biar bisa dicek
                    already_posted = True
                    break
            except:
                pass

        if not already_posted:
            # Prefer relative time display
            try:
                solved_str = format_relative_date(s.get("time", ""))
            except Exception:
                solved_str = s.get("time", "")

            mention = ""
            if MENTION_ROLE_ID and MENTION_ROLE_ID != "0":
                mention = resolve_mention(channel, MENTION_ROLE_ID)

            # sisipkan sid biar bisa dicocokkan nanti
            # content = f"🩸 **{s['user']}** claimed first blood on **{s['challenge']}** ({s['category']}) at {solved_str} {mention}\n`{sid}`"
            content = f"🩸 **{s['user']}** claimed first blood on **{s['challenge']}** ({s['category']}) at {solved_str} {mention} ||{sid}||"

            msg = await channel.send(content)
            current_ids.append(str(msg.id))

    # Simpan hanya message.id terbaru (max 3)
    state["latest_ids"] = current_ids[-3:]

# --------------------------
# Main loop
# --------------------------
async def poll_loop():
    await client.wait_until_ready()
    channel = client.get_channel(CHANNEL_ID)
    if not channel:
        logger.error("Channel not found")
        await client.close()
        return

    state = load_state()
    seen = {s["id"] for s in load_solves()}

    async with aiohttp.ClientSession() as session:
        while not client.is_closed():
            try:
                solves = await fetch_firstbloods(session)

                old_solves = load_solves()
                old_ids = {s["id"] for s in old_solves}

                combined = {s["id"]: s for s in (old_solves + solves)}
                solves = sorted(combined.values(), key=lambda x: parser.isoparse(x["time"]))[-100:]
                save_solves(solves)

                new_solves = [s for s in solves if s["id"] not in old_ids]

                if new_solves:
                    await update_table(channel, solves, state)
                    await post_latest(channel, new_solves, state)

                save_state(state)
            except Exception:
                logger.exception("Error in poll loop")

            await asyncio.sleep(POLL_INTERVAL)


@client.event
async def on_ready():
    user = client.user
    user_name = getattr(user, "name", "<unknown>")
    user_disc = getattr(user, "discriminator", "????")
    logger.info("Logged in as %s#%s", user_name, user_disc)

    channel = client.get_channel(CHANNEL_ID)

    # Cek apakah file state.json atau solves.json belum ada
    state_exists = os.path.exists(STATE_FILE)
    solves_exists = os.path.exists(SOLVES_FILE)

    if channel and (not state_exists or not solves_exists):
        try:
            def is_me(m):
                return m.author == client.user
            purge_fn = getattr(channel, "purge", None)
            if callable(purge_fn):
                await channel.purge(limit=None, check=is_me)
            logger.info("Purged messages because state or solves file not found")
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
