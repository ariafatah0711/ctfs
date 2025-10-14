import asyncio
import json
import logging
import os
from datetime import datetime, timezone, timedelta
from typing import Any, Dict, List
from dateutil import parser

import aiohttp
import discord
from discord import Intents
from dotenv import load_dotenv

import hashlib

# Load environment
load_dotenv()
DISCORD_TOKEN = os.getenv("DISCORD_TOKEN")
CHANNEL_ID = int(os.getenv("CHANNEL_ID", "0"))
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "60"))
STATE_FILE = os.getenv("STATE_FILE", "state.json")
MENTION_ROLE_ID = os.getenv("MENTION_ROLE_ID", "0")

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ctf-bot")

# Discord client
intents = Intents.default()
client = discord.Client(intents=intents)


def load_state() -> Dict[str, Any]:
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            data.setdefault("seen", [])
            data["seen"] = [str(x) for x in data.get("seen", [])]
            return data
    return {"seen": []}


def save_state(state: Dict[str, Any]):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)


def resolve_mention(channel, identifier: str) -> str:
    guild = getattr(channel, "guild", None)
    if not guild:
        return f"@{identifier}"

    # Kalau angka → bisa user id atau role id
    if identifier.isdigit():
        # coba user id
        member = guild.get_member(int(identifier))
        if member:
            return member.mention

        # coba role id
        role = guild.get_role(int(identifier))
        if role:
            return role.mention

    # Kalau string → bisa username / display name
    member = guild.get_member_named(identifier)
    if member:
        return member.mention

    # atau role name
    role = discord.utils.get(guild.roles, name=identifier)
    if role:
        return role.mention

    # fallback plain text
    return f"@{identifier}"

async def fetch_firstbloods(session: aiohttp.ClientSession) -> List[Dict[str, Any]]:
    try:
        url = SUPABASE_URL.rstrip("/") + "/rest/v1/rpc/get_notifications"
        headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
        payload = {"p_limit": 100, "p_offset": 0}

        async with session.post(url, json=payload, headers=headers, timeout=30) as resp:
            resp.raise_for_status()
            data = await resp.json()

        results = []
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(minutes=5)  # adjust if perlu
        for item in data:
            notif_type = str(item.get("notif_type") or "").lower()
            if notif_type not in ("first_blood", "firstblood", "first-blood", "first"):
                continue

            time_str = item.get("notif_created_at") or item.get("created_at") or ""
            if not time_str:
                continue

            try:
                t = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
                # if t < cutoff:
                #     continue
            except Exception:
                continue

            raw_key = f"{item.get('notif_username')}|{item.get('notif_challenge_title')}|{time_str}"
            sid = hashlib.sha256(raw_key.encode()).hexdigest()
            sid = str(item.get("notif_id") or item.get("id") or f"notif:{time_str}")
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

async def poll_loop():
    await client.wait_until_ready()
    channel = client.get_channel(CHANNEL_ID)
    if not channel:
        logger.error("Channel not found")
        await client.close()
        return

    state = load_state()
    seen = set(state["seen"])

    async with aiohttp.ClientSession() as session:
        while not client.is_closed():
            try:
                solves = await fetch_firstbloods(session)
                new_solves = [s for s in solves if s["id"] not in seen]
                new_solves.sort(key=lambda x: parser.isoparse(x["time"]))

                for s in new_solves:
                    # format waktu solved
                    try:
                        solved_at = datetime.fromisoformat(s["time"].replace("Z", "+00:00"))
                        solved_str = solved_at.strftime("%Y-%m-%d %H:%M:%S UTC")
                    except Exception:
                        solved_str = s["time"]

                    # cek apakah mention dipakai
                    mention = ""
                    if MENTION_ROLE_ID and MENTION_ROLE_ID != "0":
                        mention = resolve_mention(channel, MENTION_ROLE_ID)
                        content = f"🩸 **{s['user']}** claimed first blood on **{s['challenge']}** ({s['category']}) at {solved_str} — {mention}"
                    else:
                        content = f"🩸 **{s['user']}** claimed first blood on **{s['challenge']}** ({s['category']}) at {solved_str}"

                    await channel.send(content)
                    seen.add(s["id"])

                state["seen"] = list(seen)
                save_state(state)
            except Exception:
                logger.exception("Error in poll loop")

            await asyncio.sleep(POLL_INTERVAL)

@client.event
async def on_ready():
    logger.info("Logged in as %s#%s", client.user.name, client.user.discriminator)
    # Start poll loop
    asyncio.create_task(poll_loop())


def main():
    client.run(DISCORD_TOKEN)


if __name__ == "__main__":
    main()
