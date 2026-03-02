import asyncio
import json
import logging
import os
import re
from contextlib import suppress
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Set, Tuple, cast

import aiohttp
import discord
from discord.abc import Messageable
from dateutil import parser as dt_parser
from dotenv import load_dotenv

@dataclass
class BotConfig:
  discord_token: str
  channel_id: int
  poll_interval_seconds: int
  state_file: Path
  log_level: str
  supabase_url: str
  supabase_key: str
  supabase_auth_jwt: Optional[str]
  mention_role_id: Optional[int]
  mention_user_map: Dict[str, int]
  event_id: Optional[str]
  event_name: Optional[str]
  challenge_map_ttl_sec: int


def parse_int(value: Optional[str], default: int) -> int:
  try:
    return int(value) if value is not None else default
  except Exception:
    return default


def parse_mention_map(raw: Optional[str]) -> Dict[str, int]:
  result: Dict[str, int] = {}
  if not raw:
    return result

  pairs = [item.strip() for item in raw.split(",") if item.strip()]
  for pair in pairs:
    if "=" not in pair:
      continue
    key, value = pair.split("=", 1)
    username = key.strip()
    discord_id = value.strip()
    if not username or not discord_id.isdigit():
      continue
    result[username] = int(discord_id)
  return result


def load_config() -> BotConfig:
  load_dotenv()

  discord_token = (os.getenv("DISCORD_TOKEN") or "").strip()
  channel_id_raw = (os.getenv("CHANNEL_ID") or "").strip()
  supabase_url = (os.getenv("SUPABASE_URL") or "").strip().rstrip("/")
  supabase_key = (os.getenv("SUPABASE_KEY") or "").strip()

  if not discord_token:
    raise ValueError("DISCORD_TOKEN belum diisi")
  if not channel_id_raw.isdigit():
    raise ValueError("CHANNEL_ID harus angka")
  if not supabase_url:
    raise ValueError("SUPABASE_URL belum diisi")
  if not supabase_key:
    raise ValueError("SUPABASE_KEY belum diisi")

  poll_seconds_raw = os.getenv("POLL_SECONDS")
  if poll_seconds_raw is not None and poll_seconds_raw.strip() != "":
    poll_interval = parse_int(poll_seconds_raw, 10)
  else:
    poll_minutes = max(parse_int(os.getenv("POLL_MINUTES"), 1), 1)
    poll_interval = poll_minutes * 60
  state_file = Path((os.getenv("STATE_FILE") or "state.json").strip())
  log_level = (os.getenv("LOG_LEVEL") or "INFO").strip().upper()

  mention_role_raw = (os.getenv("MENTION_ROLE_ID") or "").strip()
  mention_role_id = int(mention_role_raw) if mention_role_raw.isdigit() else None

  event_id = (os.getenv("EVENT_ID") or "").strip() or None
  event_name = (os.getenv("EVENT_NAME") or "").strip() or None

  if event_id and not re.fullmatch(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", event_id):
    logging.warning("EVENT_ID tidak valid UUID, filter event dimatikan. value=%s", event_id)
    event_id = None
  elif event_id:
    event_id = event_id.lower()

  return BotConfig(
    discord_token=discord_token,
    channel_id=int(channel_id_raw),
    poll_interval_seconds=max(poll_interval, 10),
    state_file=state_file,
    log_level=log_level,
    supabase_url=supabase_url,
    supabase_key=supabase_key,
    supabase_auth_jwt=(os.getenv("SUPABASE_AUTH_JWT") or "").strip() or None,
    mention_role_id=mention_role_id,
    mention_user_map=parse_mention_map(os.getenv("MENTION_USER_MAP")),
    event_id=event_id,
    event_name=event_name,
    challenge_map_ttl_sec=max(parse_int(os.getenv("CHALLENGE_MAP_TTL_SEC"), 300), 60),
  )


class FirstBloodAnnouncer:
  def __init__(self, config: BotConfig):
    self.config = config
    self.client = discord.Client(intents=discord.Intents.default())
    self.session: Optional[aiohttp.ClientSession] = None

    self.started_at = datetime.now(timezone.utc)
    self.cursor_time = self.started_at
    self.cursor_iso = self.started_at.isoformat()
    self.polling_task: Optional[asyncio.Task[None]] = None

    self.seen_keys: Set[str] = set()
    self.challenge_map: Dict[str, Dict[str, Optional[str]]] = {}
    self.challenge_map_loaded_at: Optional[datetime] = None

    self.client.event(self.on_ready)

  async def on_ready(self):
    logging.info("Discord bot login sebagai %s", self.client.user)
    if self.polling_task is None or self.polling_task.done():
      self.polling_task = asyncio.create_task(self.poll_loop())

  def _supabase_headers(self) -> Dict[str, str]:
    token = self.config.supabase_auth_jwt or self.config.supabase_key
    return {
      "apikey": self.config.supabase_key,
      "Authorization": f"Bearer {token}",
      "Content-Type": "application/json",
    }

  def _state_payload(self) -> Dict[str, Any]:
    return {
      "started_at": self.started_at.isoformat(),
      "cursor_iso": self.cursor_iso,
      "seen_keys": list(self.seen_keys)[-5000:],
    }

  def _load_state(self):
    if not self.config.state_file.exists():
      return
    try:
      raw = json.loads(self.config.state_file.read_text(encoding="utf-8"))
      seen = raw.get("seen_keys")
      if isinstance(seen, list):
        self.seen_keys = {str(item) for item in seen if item}
    except Exception:
      logging.warning("State file tidak valid, lanjut tanpa state lama")

  def _save_state(self):
    try:
      self.config.state_file.write_text(json.dumps(self._state_payload(), ensure_ascii=False, indent=2), encoding="utf-8")
    except Exception as exc:
      logging.warning("Gagal simpan state: %s", exc)

  async def _ensure_session(self):
    if self.session is None or self.session.closed:
      self.session = aiohttp.ClientSession(timeout=aiohttp.ClientTimeout(total=30))

  async def _fetch_rpc(self, rpc_name: str, payload: Dict[str, Any]) -> Any:
    await self._ensure_session()
    assert self.session is not None
    url = f"{self.config.supabase_url}/rest/v1/rpc/{rpc_name}"
    async with self.session.post(url, headers=self._supabase_headers(), json=payload) as resp:
      text = await resp.text()
      if resp.status >= 400:
        raise RuntimeError(f"RPC {rpc_name} gagal ({resp.status}): {text}")
      if not text:
        return None
      return json.loads(text)

  async def _fetch_challenge_map(self):
    now = datetime.now(timezone.utc)
    if self.challenge_map_loaded_at and (now - self.challenge_map_loaded_at).total_seconds() < self.config.challenge_map_ttl_sec:
      return

    await self._ensure_session()
    assert self.session is not None

    url = f"{self.config.supabase_url}/rest/v1/challenges"
    base_params = {
      "order": "created_at.asc",
      "limit": "1000",
      "offset": "0",
    }

    params_with_events = {
      **base_params,
      "select": "id,event_id,title,category,events(name)",
    }

    async with self.session.get(url, headers=self._supabase_headers(), params=params_with_events) as resp:
      text = await resp.text()
      if resp.status < 400:
        data = json.loads(text) if text else []
      else:
        if "permission denied for table events" not in text.lower():
          raise RuntimeError(f"Fetch challenges gagal ({resp.status}): {text}")

        logging.warning("Tidak punya akses tabel events, fallback tanpa event_name dari DB")
        params_without_events = {
          **base_params,
          "select": "id,event_id,title,category",
        }

        async with self.session.get(url, headers=self._supabase_headers(), params=params_without_events) as resp2:
          text2 = await resp2.text()
          if resp2.status >= 400:
            raise RuntimeError(f"Fetch challenges fallback gagal ({resp2.status}): {text2}")
          data = json.loads(text2) if text2 else []

    mapping: Dict[str, Dict[str, Optional[str]]] = {}
    for row in data or []:
      challenge_id = str(row.get("id") or "")
      if not challenge_id:
        continue
      event_obj = row.get("events")
      event_name = None
      if isinstance(event_obj, dict):
        value = event_obj.get("name")
        if value is not None:
          event_name = str(value)

      event_id_value = str(row.get("event_id")).lower() if row.get("event_id") is not None else None
      if event_name is None and event_id_value == self.config.event_id and self.config.event_name:
        event_name = self.config.event_name

      mapping[challenge_id] = {
        "event_id": event_id_value,
        "event_name": event_name,
      }

    self.challenge_map = mapping
    self.challenge_map_loaded_at = now

    if self.config.event_id:
      matched = sum(1 for value in self.challenge_map.values() if value.get("event_id") == self.config.event_id)
      logging.info("Validasi EVENT_ID=%s | challenge_terkait=%s", self.config.event_id, matched)
      if matched == 0:
        logging.warning("EVENT_ID tidak ditemukan di challenge map. Cek uuid event atau challenge belum di-assign ke event ini.")
        event_counts: Dict[str, int] = {}
        for value in self.challenge_map.values():
          event_id = value.get("event_id")
          if not event_id:
            continue
          event_counts[event_id] = event_counts.get(event_id, 0) + 1

        if not event_counts:
          logging.warning("Tidak ada challenge ber-event yang terlihat oleh bot (semua Main / tidak visible via RLS).")
        else:
          top_events = sorted(event_counts.items(), key=lambda item: item[1], reverse=True)[:10]
          printable = ", ".join([f"{eid}({count})" for eid, count in top_events])
          logging.warning("EVENT_ID yang terlihat bot (top): %s", printable)

  def _event_passes_filter(self, challenge_id: str) -> bool:
    if not self.config.event_id:
      return True

    meta = self.challenge_map.get(challenge_id, {})
    event_id = meta.get("event_id")
    return event_id == self.config.event_id

  def _event_label(self, challenge_id: str) -> str:
    meta = self.challenge_map.get(challenge_id, {})
    name = meta.get("event_name")
    if name:
      return name
    if self.config.event_name and self.config.event_id:
      return self.config.event_name
    return "Main"

  def _mention_for_username(self, username: str) -> str:
    discord_id = self.config.mention_user_map.get(username)
    if discord_id:
      return f"(<@{discord_id}>)"
    return ""

  def _build_message(self, row: Dict[str, Any]) -> str:
    username = str(row.get("log_username") or "unknown")
    challenge_title = str(row.get("log_challenge_title") or "Unknown Challenge")
    category = str(row.get("log_category") or "Unknown")
    challenge_id = str(row.get("log_challenge_id") or "")
    event_name = self._event_label(challenge_id)
    mention_part = self._mention_for_username(username)
    role_part = f"<@&{self.config.mention_role_id}> " if self.config.mention_role_id else ""

    return (
      f"{role_part}:drop_of_blood: FIRST BLOOD — Peserta {mention_part} "
      f"dengan username **{username}** berhasil first blood pada challenge "
      f"**{challenge_title}** ({event_name}) ({category})"
    ).strip()

  def _row_key(self, row: Dict[str, Any]) -> str:
    return "|".join([
      str(row.get("log_challenge_id") or ""),
      str(row.get("log_user_id") or ""),
      str(row.get("log_created_at") or ""),
    ])

  def _parse_dt(self, value: Any) -> Optional[datetime]:
    if not value:
      return None
    try:
      dt = dt_parser.isoparse(str(value))
      return dt.astimezone(timezone.utc)
    except Exception:
      return None

  async def _fetch_new_first_blood(self) -> List[Dict[str, Any]]:
    logs = await self._fetch_rpc("get_logs", {"p_limit": 250, "p_offset": 0})
    if not isinstance(logs, list):
      return []

    filtered: List[Tuple[datetime, Dict[str, Any]]] = []

    max_in_page = self.cursor_time
    scanned_first_blood = 0
    passed_event_filter = 0
    for row in logs:
      if not isinstance(row, dict):
        continue
      if str(row.get("log_type")) != "first_blood":
        continue
      scanned_first_blood += 1

      row_dt = self._parse_dt(row.get("log_created_at"))
      if row_dt is None:
        continue

      if row_dt > max_in_page:
        max_in_page = row_dt

      if row_dt < self.started_at:
        continue

      key = self._row_key(row)
      if key in self.seen_keys:
        continue

      challenge_id = str(row.get("log_challenge_id") or "")
      if not challenge_id:
        continue

      if not self._event_passes_filter(challenge_id):
        continue

      passed_event_filter += 1

      filtered.append((row_dt, row))

    self.cursor_time = max(self.cursor_time, max_in_page)
    self.cursor_iso = self.cursor_time.isoformat()

    filtered.sort(key=lambda item: item[0])
    logging.info(
      "Logs first_blood=%s | lolos_filter=%s | baru_terkirim=%s",
      scanned_first_blood,
      passed_event_filter,
      len(filtered),
    )
    return [item[1] for item in filtered]

  async def poll_once(self):
    await self._fetch_challenge_map()
    rows = await self._fetch_new_first_blood()
    if not rows:
      return

    channel_obj = self.client.get_channel(self.config.channel_id)
    if channel_obj is None:
      channel_obj = await self.client.fetch_channel(self.config.channel_id)

    if not isinstance(channel_obj, Messageable):
      raise RuntimeError(f"CHANNEL_ID {self.config.channel_id} bukan channel yang bisa kirim pesan")

    channel = cast(Messageable, channel_obj)

    for row in rows:
      key = self._row_key(row)
      if key in self.seen_keys:
        continue

      message = self._build_message(row)
      try:
        await channel.send(message)
      except Exception as exc:
        logging.exception("Gagal kirim ke Discord channel %s: %s", self.config.channel_id, exc)
        continue
      self.seen_keys.add(key)

    if len(self.seen_keys) > 10000:
      self.seen_keys = set(list(self.seen_keys)[-5000:])

    self._save_state()
    logging.info("Terkirim %s notif first blood baru", len(rows))

  async def poll_loop(self):
    self._load_state()
    logging.info(
      "Polling aktif tiap %s detik | event_id=%s | start_at=%s",
      self.config.poll_interval_seconds,
      self.config.event_id or "ALL",
      self.started_at.isoformat(),
    )

    while not self.client.is_closed():
      try:
        await self.poll_once()
      except Exception as exc:
        logging.exception("Polling error: %s", exc)

      await asyncio.sleep(self.config.poll_interval_seconds)

  async def run(self):
    try:
      await self.client.start(self.config.discord_token)
    finally:
      if self.polling_task:
        self.polling_task.cancel()
        with suppress(asyncio.CancelledError):
          await self.polling_task
      if self.session and not self.session.closed:
        await self.session.close()


def setup_logging(level: str):
  logging.basicConfig(
    level=getattr(logging, level, logging.INFO),
    format="%(asctime)s | %(levelname)s | %(message)s",
  )
  logging.getLogger("discord").setLevel(logging.INFO)


if __name__ == "__main__":
  cfg = load_config()
  setup_logging(cfg.log_level)
  announcer = FirstBloodAnnouncer(cfg)
  asyncio.run(announcer.run())
