"""
Hybrid F1 Data Providers & Utilities:
1. Safe JSON value sanitization (NaN/NaT/Inf -> None).
2. FastF1 v3.9+ F1TV authentication helpers (non-blocking in server mode).
3. FastF1 cache detection & MultiViewer circuit info.
4. OpenF1 API client + disk/memory cache for uncached/unauthenticated sessions (2023-2026+).
5. Jolpica-F1 (Ergast) helpers for standings, driver metadata, and circuit winner history.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
import time
import unicodedata
from bisect import bisect_left
from datetime import datetime, timezone
from threading import Lock
from typing import Any

import fastf1
import fastf1.mvapi
import pandas as pd
import requests
from fastf1.ergast import Ergast
from fastf1.exceptions import F1AuthError
import fastf1.internals.f1account as f1account
import fastf1.internals.f1account.login as f1login


OPENF1_BASE_URL = "https://api.openf1.org/v1"
JOLPICA_BASE_URL = "https://api.jolpi.ca/ergast/f1"

_openf1_rate_lock = Lock()
_openf1_last_request_ts = 0.0
_openf1_mem_cache: dict[str, tuple[float, Any]] = {}

FALLBACK_DRIVER_IMAGE = (
    "https://media.formula1.com/d_driver_fallback_image.png/"
    "content/dam/fom-website/drivers/driver_fallback_image.png"
)

STATIC_DRIVER_IMAGES = {
    "VER": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/9col/image.png",
    "NOR": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/9col/image.png",
    "LEC": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/9col/image.png",
    "PIA": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/9col/image.png",
    "SAI": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/9col/image.png",
    "RUS": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/9col/image.png",
    "HAM": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/9col/image.png",
    "PER": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/9col/image.png",
    "ALO": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/9col/image.png",
    "HUL": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/9col/image.png",
}

TEAM_COLORS = {
    "Red Bull": "3671C6",
    "Red Bull Racing": "3671C6",
    "Mercedes": "27F4D2",
    "Ferrari": "E80020",
    "McLaren": "FF8000",
    "Aston Martin": "229971",
    "Alpine": "0093CC",
    "Alpine F1 Team": "0093CC",
    "Williams": "64C4FF",
    "RB": "6692FF",
    "RB F1 Team": "6692FF",
    "Racing Bulls": "6692FF",
    "Haas": "B6BABD",
    "Haas F1 Team": "B6BABD",
    "Sauber": "52E252",
    "Kick Sauber": "52E252",
    "Audi": "F50537",
    "Cadillac": "909090",
}

CIRCUIT_IMAGES = {
    "Lusail": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop",
    "Yas Marina": "https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2832&auto=format&fit=crop",
    "Yas Island": "https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2832&auto=format&fit=crop",
    "Sakhir": "https://images.unsplash.com/photo-1532906619279-a798156785c7?q=80&w=2574&auto=format&fit=crop",
    "Bahrain": "https://images.unsplash.com/photo-1532906619279-a798156785c7?q=80&w=2574&auto=format&fit=crop",
    "Jeddah": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2670&auto=format&fit=crop",
    "Melbourne": "https://images.unsplash.com/photo-1580234550905-408e19d56482?q=80&w=2670&auto=format&fit=crop",
    "Albert Park": "https://images.unsplash.com/photo-1580234550905-408e19d56482?q=80&w=2670&auto=format&fit=crop",
    "Suzuka": "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?q=80&w=2670&auto=format&fit=crop",
    "Shanghai": "https://images.unsplash.com/photo-1535132011086-b8818f016104?q=80&w=2670&auto=format&fit=crop",
    "Miami": "https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=2525&auto=format&fit=crop",
    "Miami Gardens": "https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=2525&auto=format&fit=crop",
    "Imola": "https://images.unsplash.com/photo-1621932953986-15fcf084da0f?q=80&w=2670&auto=format&fit=crop",
    "Monaco": "https://images.unsplash.com/photo-1516335096713-6652e9283c3e?q=80&w=2667&auto=format&fit=crop",
    "Monte Carlo": "https://images.unsplash.com/photo-1516335096713-6652e9283c3e?q=80&w=2667&auto=format&fit=crop",
    "Montreal": "https://images.unsplash.com/photo-1573074617613-fc8443628f34?q=80&w=2670&auto=format&fit=crop",
    "Barcelona": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop",
    "Madrid": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop",
    "Spielberg": "https://images.unsplash.com/photo-1595752393674-84c25925c40e?q=80&w=2670&auto=format&fit=crop",
    "Silverstone": "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?q=80&w=2670&auto=format&fit=crop",
    "Budapest": "https://images.unsplash.com/photo-1532509854626-54754227793f?q=80&w=2670&auto=format&fit=crop",
    "Spa": "https://images.unsplash.com/photo-1596566427382-7d0434934e6d?q=80&w=2670&auto=format&fit=crop",
    "Spa-Francorchamps": "https://images.unsplash.com/photo-1596566427382-7d0434934e6d?q=80&w=2670&auto=format&fit=crop",
    "Zandvoort": "https://images.unsplash.com/photo-1629213506425-4c65e8c9d242?q=80&w=2670&auto=format&fit=crop",
    "Monza": "https://images.unsplash.com/photo-1596727147705-54a7d7501d7d?q=80&w=2670&auto=format&fit=crop",
    "Baku": "https://images.unsplash.com/photo-1575010726601-576a8a553e5d?q=80&w=2670&auto=format&fit=crop",
    "Kuala Lumpur": "https://images.unsplash.com/photo-1532906619279-a798156785c7?q=80&w=2574&auto=format&fit=crop",
    "Singapore": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop",
    "Marina Bay": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop",
    "Austin": "https://images.unsplash.com/photo-1580234550905-408e19d56482?q=80&w=2670&auto=format&fit=crop",
    "Mexico City": "https://images.unsplash.com/photo-1584646098378-0874589d76b1?q=80&w=2670&auto=format&fit=crop",
    "Sao Paulo": "https://images.unsplash.com/photo-1505528638255-fd05908162dc?q=80&w=2670&auto=format&fit=crop",
    "Las Vegas": "https://images.unsplash.com/photo-1605836011078-71368d1638b6?q=80&w=2670&auto=format&fit=crop",
}

DEFAULT_CIRCUIT_IMAGE = (
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop"
)


# ---------------------------------------------------------------------------
# Sanitization helpers
# ---------------------------------------------------------------------------


def normalize_text(value: str | None) -> str:
    if not value:
        return ""
    decomposed = unicodedata.normalize("NFKD", str(value))
    ascii_only = "".join(c for c in decomposed if not unicodedata.combining(c))
    return ascii_only.strip().lower()


def safe_float(val: Any, default: float | None = None) -> float | None:
    if val is None:
        return default
    try:
        if pd.isna(val):
            return default
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return default
        return f
    except (TypeError, ValueError):
        return default


def safe_int(val: Any, default: int | None = None) -> int | None:
    f = safe_float(val, None)
    if f is None:
        return default
    return int(round(f))


def safe_str(val: Any, default: str | None = None) -> str | None:
    if val is None:
        return default
    try:
        if pd.isna(val):
            return default
    except (TypeError, ValueError):
        pass
    s = str(val).strip()
    if s in ("", "nan", "NaN", "NaT", "None"):
        return default
    return s


def safe_seconds(val: Any, default: float | None = None) -> float | None:
    if val is None:
        return default
    try:
        if pd.isna(val):
            return default
        if hasattr(val, "total_seconds"):
            sec = float(val.total_seconds())
        else:
            sec = float(val)
        if math.isnan(sec) or math.isinf(sec):
            return default
        return sec
    except (TypeError, ValueError):
        return default


def safe_iso(val: Any) -> str | None:
    if val is None:
        return None
    try:
        if pd.isna(val):
            return None
        if hasattr(val, "isoformat"):
            return val.isoformat()
        return str(val)
    except (TypeError, ValueError):
        return None


def get_team_color(team_name: str | None) -> str:
    if not team_name:
        return "71717A"
    if team_name in TEAM_COLORS:
        return TEAM_COLORS[team_name]
    low = team_name.lower()
    for k, color in TEAM_COLORS.items():
        if k.lower() in low or low in k.lower():
            return color
    return "71717A"


def get_circuit_image(location: str | None) -> str:
    if not location:
        return DEFAULT_CIRCUIT_IMAGE
    if location in CIRCUIT_IMAGES:
        return CIRCUIT_IMAGES[location]
    norm_loc = normalize_text(location)
    for key, url in CIRCUIT_IMAGES.items():
        norm_key = normalize_text(key)
        if norm_key == norm_loc or norm_key in norm_loc or norm_loc in norm_key:
            return url
    return DEFAULT_CIRCUIT_IMAGE


import re as _re
import threading as _threading
from urllib.parse import urlsplit as _urlsplit, urlunsplit as _urlunsplit

_f1_auth_lock = _threading.Lock()
_F1_TRANSFORM_RE = _re.compile(r"\.transform/[^/]+/image\.[a-zA-Z0-9]+$", _re.IGNORECASE)


def sanitize_https_url(value: Any, default: str | None = None) -> str | None:
    """Allow only well-formed https:// URLs without control characters."""
    s = safe_str(value)
    if not s or any(ord(ch) < 32 or ch.isspace() for ch in s):
        return default
    parsed = _urlsplit(s)
    if parsed.scheme.lower() != "https" or not parsed.netloc:
        return default
    return s


def high_res_driver_image(value: Any) -> str | None:
    """Upgrade Formula 1 CDN driver headshot URLs from small `.transform/*` thumbnails to 9col high resolution."""
    url = sanitize_https_url(value)
    if not url:
        return None
    parsed = _urlsplit(url)
    host = (parsed.hostname or "").lower()
    if host in {"media.formula1.com", "www.formula1.com"}:
        upgraded_path = _F1_TRANSFORM_RE.sub(".transform/9col/image.png", parsed.path)
        if upgraded_path != parsed.path:
            return _urlunsplit((parsed.scheme, parsed.netloc, upgraded_path, parsed.query, parsed.fragment))
    return url


def resolve_driver_image(
    headshot_url: Any = None,
    code: str | None = None,
    visuals: dict[str, dict[str, str]] | None = None,
) -> str:
    """Resolve the highest-resolution driver headshot URL with season visuals and static fallbacks."""
    visual_img = visuals.get(code, {}).get("image") if visuals and code else None
    return (
        high_res_driver_image(headshot_url)
        or high_res_driver_image(visual_img)
        or (STATIC_DRIVER_IMAGES.get(code) if code else None)
        or FALLBACK_DRIVER_IMAGE
    )


# ---------------------------------------------------------------------------
# FastF1 v3.9+ Non-blocking F1TV Auth & Cache Checks
# ---------------------------------------------------------------------------


def install_nonblocking_f1_auth():
    """Prevent FastF1's CLI stdin prompt from hanging FastAPI workers."""

    def _nonblocking_creds() -> tuple[str, str]:
        username = os.environ.get(f1login.ENV_USERNAME)
        password = os.environ.get(f1login.ENV_PASSWORD)
        if username and password:
            return username, password
        raise F1AuthError(
            "No F1 account credentials available. Set F1_USERNAME and F1_PASSWORD "
            "or authenticate via POST /api/auth/login."
        )

    f1login._credentials_from_env_or_prompt = _nonblocking_creds


def get_f1_auth_status() -> dict[str, Any]:
    env_configured = bool(
        os.environ.get(f1login.ENV_USERNAME) and os.environ.get(f1login.ENV_PASSWORD)
    )
    token = f1account.token_manager.get_stored()
    if token is None:
        return {
            "authenticated": False,
            "token_valid": False,
            "env_configured": env_configured,
            "expires_at": None,
        }
    return {
        "authenticated": bool(token.is_valid()),
        "token_valid": bool(token.is_valid()),
        "env_configured": env_configured,
        "expires_at": datetime.fromtimestamp(token.expires_at, tz=timezone.utc).isoformat(),
    }


def has_f1_auth() -> bool:
    status = get_f1_auth_status()
    return bool(status["token_valid"] or status["env_configured"])


def login_f1tv(username: str, password: str) -> dict[str, Any]:
    with _f1_auth_lock:
        prev_user = os.environ.get(f1login.ENV_USERNAME)
        prev_pass = os.environ.get(f1login.ENV_PASSWORD)
        try:
            os.environ[f1login.ENV_USERNAME] = username
            os.environ[f1login.ENV_PASSWORD] = password
            f1account.get_token(force_renew=True, method="password")
            return get_f1_auth_status()
        finally:
            if prev_user is None:
                os.environ.pop(f1login.ENV_USERNAME, None)
            else:
                os.environ[f1login.ENV_USERNAME] = prev_user
            if prev_pass is None:
                os.environ.pop(f1login.ENV_PASSWORD, None)
            else:
                os.environ[f1login.ENV_PASSWORD] = prev_pass


def logout_f1tv() -> dict[str, Any]:
    with _f1_auth_lock:
        f1account.clear_token()
        return get_f1_auth_status()


def session_cache_dir(cache_dir: str, session: fastf1.core.Session) -> str:
    rel = session.api_path.removeprefix("/static/").strip("/")
    return os.path.join(cache_dir, rel)


def is_session_cached(
    cache_dir: str,
    session: fastf1.core.Session,
    require_laps: bool = False,
    require_telemetry: bool = False,
    require_weather: bool = False,
    require_messages: bool = False,
) -> bool:
    sdir = session_cache_dir(cache_dir, session)
    if not os.path.isdir(sdir):
        return False

    required = ["session_info.ff1pkl", "driver_info.ff1pkl"]
    if require_laps or require_telemetry:
        required.append("_extended_timing_data.ff1pkl")
    if require_telemetry:
        required.extend(["car_data.ff1pkl", "position_data.ff1pkl"])
    if require_weather:
        required.append("weather_data.ff1pkl")
    if require_messages:
        required.append("race_control_messages.ff1pkl")

    return all(os.path.exists(os.path.join(sdir, fname)) for fname in required)


def fastf1_can_load(
    cache_dir: str,
    session: fastf1.core.Session,
    require_laps: bool = False,
    require_telemetry: bool = False,
    require_weather: bool = False,
    require_messages: bool = False,
) -> bool:
    return has_f1_auth() or is_session_cached(
        cache_dir,
        session,
        require_laps=require_laps,
        require_telemetry=require_telemetry,
        require_weather=require_weather,
        require_messages=require_messages,
    )


# ---------------------------------------------------------------------------
# OpenF1 Client with Local Cache
# ---------------------------------------------------------------------------


def openf1_get(
    cache_dir: str,
    endpoint: str,
    params: dict[str, Any] | None = None,
    ttl_seconds: int = 86400 * 7,
) -> Any:
    global _openf1_last_request_ts
    params = params or {}
    # Support raw query params like date>=... by building sorted key
    key_str = f"{endpoint}?{'&'.join(f'{k}={v}' for k, v in sorted(params.items()))}"
    now = time.time()

    mem = _openf1_mem_cache.get(key_str)
    if mem and (now - mem[0]) < ttl_seconds:
        return mem[1]

    disk_dir = os.path.join(cache_dir, "openf1_cache")
    os.makedirs(disk_dir, exist_ok=True)
    safe_endpoint = _re.sub(r"[^a-zA-Z0-9_-]+", "_", endpoint.strip("/")) or "endpoint"
    digest = hashlib.sha256(key_str.encode("utf-8")).hexdigest()[:24]
    disk_path = os.path.join(disk_dir, f"{safe_endpoint}_{digest}.json")

    if os.path.exists(disk_path):
        mtime = os.path.getmtime(disk_path)
        if (now - mtime) < ttl_seconds:
            try:
                with open(disk_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                _openf1_mem_cache[key_str] = (now, data)
                return data
            except Exception:
                pass

    url = f"{OPENF1_BASE_URL}/{endpoint.lstrip('/')}"
    # Build query manually if keys contain >= or <= so requests doesn't encode the operator
    query_parts = []
    for k, v in params.items():
        if k.endswith(">=") or k.endswith("<="):
            query_parts.append(f"{k}{requests.utils.quote(str(v), safe=':+-.T')}")
        else:
            query_parts.append(f"{requests.utils.quote(str(k))}={requests.utils.quote(str(v))}")
    full_url = f"{url}?{'&'.join(query_parts)}" if query_parts else url

    for attempt in range(2):
        with _openf1_rate_lock:
            elapsed = time.time() - _openf1_last_request_ts
            if elapsed < 0.25:
                time.sleep(0.25 - elapsed)
            _openf1_last_request_ts = time.time()
            resp = requests.get(full_url, timeout=20)

        if resp.status_code == 429 and attempt == 0:
            time.sleep(1.5)
            continue
        if resp.status_code == 404:
            return []
        resp.raise_for_status()
        data = resp.json()
        if isinstance(data, dict) and data.get("detail") == "No results found.":
            data = []
        try:
            with open(disk_path, "w", encoding="utf-8") as f:
                json.dump(data, f)
        except Exception:
            pass
        _openf1_mem_cache[key_str] = (time.time(), data)
        return data

    return []


def map_session_type_to_openf1(session_type: str) -> list[str]:
    norm = normalize_text(session_type)
    mapping = {
        "r": ["Race"],
        "race": ["Race"],
        "q": ["Qualifying"],
        "qualifying": ["Qualifying"],
        "s": ["Sprint"],
        "sprint": ["Sprint"],
        "sq": ["Sprint Qualifying", "Sprint Shootout"],
        "sprint qualifying": ["Sprint Qualifying", "Sprint Shootout"],
        "sprint shootout": ["Sprint Shootout", "Sprint Qualifying"],
        "fp1": ["Practice 1"],
        "practice 1": ["Practice 1"],
        "fp2": ["Practice 2"],
        "practice 2": ["Practice 2"],
        "fp3": ["Practice 3"],
        "practice 3": ["Practice 3"],
    }
    return mapping.get(norm, [session_type])


LOCATION_ALIASES = {
    "yas island": ["yas island", "yas marina", "abu dhabi"],
    "yas marina": ["yas marina", "yas island", "abu dhabi"],
    "abu dhabi": ["yas marina", "yas island", "abu dhabi"],
    "monte carlo": ["monte carlo", "monaco"],
    "monaco": ["monaco", "monte carlo"],
    "marina bay": ["marina bay", "singapore"],
    "singapore": ["singapore", "marina bay"],
    "miami gardens": ["miami gardens", "miami"],
    "miami": ["miami", "miami gardens"],
    "spa-francorchamps": ["spa-francorchamps", "spa"],
    "spa": ["spa", "spa-francorchamps"],
    "sao paulo": ["sao paulo", "interlagos", "brazil"],
    "interlagos": ["interlagos", "sao paulo"],
    "montreal": ["montreal"],
    "sakhir": ["sakhir", "bahrain"],
    "bahrain": ["bahrain", "sakhir", "kuala lumpur"],
    "lusail": ["lusail", "qatar"],
    "melbourne": ["melbourne", "albert park", "australia"],
    "albert park": ["albert park", "melbourne"],
    "barcelona": ["barcelona", "catalunya"],
    "budapest": ["budapest", "hungaroring"],
    "madrid": ["madrid", "madring"],
}


def resolve_openf1_session(
    cache_dir: str,
    year: int,
    location: str,
    session_type: str,
    event_date: Any = None,
) -> dict[str, Any] | None:
    sessions = openf1_get(cache_dir, "sessions", {"year": year}, ttl_seconds=1800)
    if not isinstance(sessions, list) or not sessions:
        return None

    target_names = [normalize_text(x) for x in map_session_type_to_openf1(session_type)]
    candidates = [
        s
        for s in sessions
        if not s.get("is_cancelled")
        and (
            normalize_text(s.get("session_name")) in target_names
            or normalize_text(s.get("session_type")) in target_names
        )
    ]
    if not candidates:
        return None

    norm_loc = normalize_text(location)
    aliases = LOCATION_ALIASES.get(norm_loc, [norm_loc])

    # 1. Exact or alias location / circuit_short_name / country_name match
    matched = []
    for s in candidates:
        fields = [
            normalize_text(s.get("location")),
            normalize_text(s.get("circuit_short_name")),
            normalize_text(s.get("country_name")),
        ]
        if any(a == f or (a and f and (a in f or f in a)) for a in aliases for f in fields):
            matched.append(s)

    if len(matched) == 1:
        return matched[0]

    # 2. Disambiguate (or match) using event_date proximity
    pool = matched if matched else candidates
    if event_date is not None:
        try:
            target_dt = pd.Timestamp(event_date)
            if target_dt.tzinfo is not None:
                target_dt = target_dt.tz_convert("UTC").tz_localize(None)
            best = None
            best_diff = float("inf")
            for s in pool:
                ds = s.get("date_start")
                if not ds:
                    continue
                sdt = pd.Timestamp(ds).tz_convert("UTC").tz_localize(None)
                diff = abs((sdt - target_dt).total_seconds())
                if diff < best_diff:
                    best_diff = diff
                    best = s
            # Within 5 days (e.g. FP1 on Friday vs EventDate on Sunday)
            if best is not None and best_diff <= 5 * 86400:
                return best
        except Exception:
            pass

    return matched[0] if matched else None


def openf1_drivers_map(cache_dir: str, session_key: int) -> dict[int, dict[str, Any]]:
    raw = openf1_get(cache_dir, "drivers", {"session_key": session_key})
    out: dict[int, dict[str, Any]] = {}
    if not isinstance(raw, list):
        return out
    for d in raw:
        num = safe_int(d.get("driver_number"))
        if num is None:
            continue
        code = safe_str(d.get("name_acronym")) or str(num)
        first = safe_str(d.get("first_name"), "")
        last = safe_str(d.get("last_name"), "")
        full = (
            f"{first} {last}".strip()
            or safe_str(d.get("full_name"), "")
            or safe_str(d.get("broadcast_name"), code)
        )
        team = safe_str(d.get("team_name"), "Unknown")
        color = safe_str(d.get("team_colour")) or get_team_color(team)
        headshot = resolve_driver_image(d.get("headshot_url"), code)
        out[num] = {
            "number": str(num),
            "code": code,
            "name": full,
            "team": team,
            "color": color.lstrip("#"),
            "image": headshot,
        }
    return out


def _format_duration_str(seconds: float | None) -> str | None:
    if seconds is None:
        return None
    hrs = int(seconds // 3600)
    mins = int((seconds % 3600) // 60)
    secs = seconds % 60
    if hrs > 0:
        return f"{hrs}:{mins:02d}:{secs:06.3f}"
    return f"{mins}:{secs:06.3f}"


def openf1_get_drivers(
    cache_dir: str, year: int, location: str, session_type: str, event_date: Any = None
) -> list[dict[str, Any]]:
    sess = resolve_openf1_session(cache_dir, year, location, session_type, event_date)
    if not sess:
        return []
    sk = sess["session_key"]
    dmap = openf1_drivers_map(cache_dir, sk)
    results = openf1_get(cache_dir, "session_result", {"session_key": sk}, ttl_seconds=3600)

    drivers: list[dict[str, Any]] = []
    seen = set()
    if isinstance(results, list) and results:
        for r in results:
            num = safe_int(r.get("driver_number"))
            if num is None:
                continue
            seen.add(num)
            info = dmap.get(num, {})
            pos = safe_int(r.get("position"))
            dur = r.get("duration")
            # Qualifying returns [q1, q2, q3] list for duration sometimes
            if isinstance(dur, list):
                valid_q = [safe_float(x) for x in dur if safe_float(x) is not None]
                dur_sec = valid_q[-1] if valid_q else None
            else:
                dur_sec = safe_float(dur)
            gap = r.get("gap_to_leader")
            if isinstance(gap, list):
                gap = next((g for g in reversed(gap) if g is not None), None)
            status = "DSQ" if r.get("dsq") else ("DNS" if r.get("dns") else ("DNF" if r.get("dnf") else "Finished"))
            time_str = _format_duration_str(dur_sec) if pos == 1 else (f"+{gap}s" if isinstance(gap, (int, float)) and gap > 0 else _format_duration_str(dur_sec))
            drivers.append(
                {
                    "id": str(num),
                    "number": str(num),
                    "code": info.get("code", str(num)),
                    "name": info.get("name", f"Driver #{num}"),
                    "team": info.get("team", "Unknown"),
                    "color": info.get("color", "71717A"),
                    "position": pos,
                    "time": time_str,
                    "status": status,
                    "image": info.get("image", FALLBACK_DRIVER_IMAGE),
                }
            )
    for num, info in dmap.items():
        if num not in seen:
            drivers.append(
                {
                    "id": str(num),
                    "number": str(num),
                    "code": info["code"],
                    "name": info["name"],
                    "team": info["team"],
                    "color": info["color"],
                    "position": None,
                    "time": None,
                    "status": None,
                    "image": info["image"],
                }
            )
    drivers.sort(key=lambda x: x["position"] if x["position"] is not None else 999)
    return drivers


def _find_openf1_driver_number(dmap: dict[int, dict[str, Any]], driver_ident: str) -> int | None:
    ident_str = str(driver_ident).strip()
    if ident_str.isdigit():
        num = int(ident_str)
        if num in dmap:
            return num
    upper = ident_str.upper()
    for num, info in dmap.items():
        if info.get("code", "").upper() == upper:
            return num
    # fallback: return numeric if valid
    return int(ident_str) if ident_str.isdigit() else None


def _parse_iso_ts(ts_str: str) -> float:
    return pd.Timestamp(ts_str).timestamp()


def _merge_car_and_location(car_data: list[dict], loc_data: list[dict], limit: int) -> list[dict]:
    if not car_data:
        return []
    car_data = sorted(car_data, key=lambda x: x.get("date", ""))
    loc_data = sorted(loc_data, key=lambda x: x.get("date", ""))

    loc_times = [_parse_iso_ts(p["date"]) for p in loc_data if p.get("date")]
    loc_valid = [p for p in loc_data if p.get("date")]

    t0 = _parse_iso_ts(car_data[0]["date"])
    prev_t = t0
    dist = 0.0
    merged: list[dict[str, Any]] = []

    for row in car_data:
        dt_str = row.get("date")
        if not dt_str:
            continue
        t = _parse_iso_ts(dt_str)
        spd = safe_float(row.get("speed"), 0.0) or 0.0
        dt = max(0.0, t - prev_t)
        dist += (spd / 3.6) * dt
        prev_t = t

        x_val = 0.0
        y_val = 0.0
        if loc_times:
            idx = bisect_left(loc_times, t)
            if idx == 0:
                lp = loc_valid[0]
            elif idx >= len(loc_times):
                lp = loc_valid[-1]
            else:
                before = loc_times[idx - 1]
                after = loc_times[idx]
                lp = loc_valid[idx - 1] if (t - before) <= (after - t) else loc_valid[idx]
            x_val = safe_float(lp.get("x"), 0.0) or 0.0
            y_val = safe_float(lp.get("y"), 0.0) or 0.0

        brake_raw = safe_float(row.get("brake"), 0.0) or 0.0
        merged.append(
            {
                "time": round(t - t0, 3),
                "distance": round(dist, 2),
                "speed": spd,
                "rpm": safe_float(row.get("rpm"), 0.0) or 0.0,
                "gear": safe_int(row.get("n_gear"), 0) or 0,
                "throttle": safe_float(row.get("throttle"), 0.0) or 0.0,
                "brake": 100 if brake_raw > 0 else 0,
                "x": x_val,
                "y": y_val,
            }
        )

    if limit and len(merged) > limit:
        step = max(1, len(merged) // limit)
        merged = merged[::step]
    return merged


def _lap_time_window(lap: dict[str, Any]) -> tuple[str, str] | None:
    ds = lap.get("date_start")
    dur = safe_float(lap.get("lap_duration"))
    if not ds or not dur or dur <= 0:
        return None
    start_ts = pd.Timestamp(ds)
    end_ts = start_ts + pd.Timedelta(seconds=dur)
    return start_ts.isoformat(), end_ts.isoformat()


def openf1_get_telemetry(
    cache_dir: str,
    year: int,
    location: str,
    session_type: str,
    driver_ident: str,
    limit: int = 250,
    event_date: Any = None,
) -> dict[str, Any] | None:
    sess = resolve_openf1_session(cache_dir, year, location, session_type, event_date)
    if not sess:
        return None
    sk = sess["session_key"]
    dmap = openf1_drivers_map(cache_dir, sk)
    num = _find_openf1_driver_number(dmap, driver_ident)
    if num is None:
        return None

    laps = openf1_get(cache_dir, "laps", {"session_key": sk, "driver_number": num})
    valid_laps = [
        l for l in (laps or []) if safe_float(l.get("lap_duration")) and l.get("date_start")
    ]
    if not valid_laps:
        return None

    fastest = min(valid_laps, key=lambda l: float(l["lap_duration"]))
    window = _lap_time_window(fastest)
    if not window:
        return None
    t_start, t_end = window

    car_data = openf1_get(
        cache_dir,
        "car_data",
        {"session_key": sk, "driver_number": num, "date>=": t_start, "date<=": t_end},
    )
    loc_data = openf1_get(
        cache_dir,
        "location",
        {"session_key": sk, "driver_number": num, "date>=": t_start, "date<=": t_end},
    )
    telemetry = _merge_car_and_location(car_data or [], loc_data or [], limit=limit)
    if not telemetry:
        return None

    return {
        "driver_id": str(driver_ident),
        "driver_code": dmap.get(num, {}).get("code", str(num)),
        "lap_number": safe_int(fastest.get("lap_number")),
        "lap_time": safe_float(fastest.get("lap_duration")),
        "telemetry": telemetry,
        "source": "openf1",
    }


def openf1_get_track_data(
    cache_dir: str, year: int, location: str, session_type: str, event_date: Any = None
) -> dict[str, Any] | None:
    sess = resolve_openf1_session(cache_dir, year, location, session_type, event_date)
    if not sess:
        return None
    sk = sess["session_key"]
    circuit_key = safe_int(sess.get("circuit_key"))

    # Pick fastest lap across session
    laps = openf1_get(cache_dir, "laps", {"session_key": sk})
    valid = [l for l in (laps or []) if safe_float(l.get("lap_duration")) and l.get("date_start")]
    if not valid:
        return None
    fastest = min(valid, key=lambda l: float(l["lap_duration"]))
    num = safe_int(fastest.get("driver_number"))
    window = _lap_time_window(fastest)
    if num is None or not window:
        return None

    t_start, t_end = window
    loc_data = openf1_get(
        cache_dir,
        "location",
        {"session_key": sk, "driver_number": num, "date>=": t_start, "date<=": t_end},
    )
    car_data = openf1_get(
        cache_dir,
        "car_data",
        {"session_key": sk, "driver_number": num, "date>=": t_start, "date<=": t_end},
    )
    if not loc_data:
        return None

    car_sorted = sorted([c for c in (car_data or []) if c.get("date")], key=lambda x: x["date"])
    car_times = [_parse_iso_ts(c["date"]) for c in car_sorted]

    loc_sorted = sorted([l for l in loc_data if l.get("date")], key=lambda x: x["date"])
    # Downsample to ~180 points for smooth fast SVG track rendering
    step = max(1, len(loc_sorted) // 180)
    track_data = []
    for lp in loc_sorted[::step]:
        x = safe_float(lp.get("x"))
        y = safe_float(lp.get("y"))
        z = safe_float(lp.get("z"), 0.0)
        if x is None or y is None:
            continue
        spd = 200.0
        if car_times:
            t = _parse_iso_ts(lp["date"])
            idx = bisect_left(car_times, t)
            if idx >= len(car_times):
                idx = len(car_times) - 1
            spd = safe_float(car_sorted[idx].get("speed"), 200.0) or 200.0
        track_data.append({"x": x, "y": y, "z": z, "speed": spd})

    circuit_meta = get_mvapi_circuit_meta(year, circuit_key) if circuit_key else {}
    return {
        "circuit_name": sess.get("location") or location,
        "circuit_key": circuit_key,
        "track_data": track_data,
        "source": "openf1",
        **circuit_meta,
    }


def get_mvapi_circuit_meta(year: int, circuit_key: int | None) -> dict[str, Any]:
    if not circuit_key:
        return {}
    try:
        ci = fastf1.mvapi.get_circuit_info(year=year, circuit_key=circuit_key)
        if not ci:
            return {}
        corners = []
        if hasattr(ci, "corners") and ci.corners is not None and not ci.corners.empty:
            for _, r in ci.corners.iterrows():
                corners.append(
                    {
                        "x": safe_float(r.get("X")),
                        "y": safe_float(r.get("Y")),
                        "number": safe_int(r.get("Number")),
                        "letter": safe_str(r.get("Letter"), ""),
                    }
                )
        return {
            "rotation": safe_float(getattr(ci, "rotation", 0.0), 0.0),
            "corners_count": len(corners),
            "corners": corners,
        }
    except Exception:
        return {}


def openf1_get_weather(
    cache_dir: str, year: int, location: str, session_type: str, event_date: Any = None
) -> list[dict[str, Any]]:
    sess = resolve_openf1_session(cache_dir, year, location, session_type, event_date)
    if not sess:
        return []
    raw = openf1_get(cache_dir, "weather", {"session_key": sess["session_key"]})
    if not isinstance(raw, list) or not raw:
        return []

    t0 = _parse_iso_ts(raw[0]["date"]) if raw[0].get("date") else 0.0
    out = []
    for row in raw:
        t = _parse_iso_ts(row["date"]) - t0 if row.get("date") else 0.0
        out.append(
            {
                "time": round(max(0.0, t), 2),
                "air_temp": safe_float(row.get("air_temperature"), 0.0),
                "track_temp": safe_float(row.get("track_temperature"), 0.0),
                "humidity": safe_float(row.get("humidity"), 0.0),
                "pressure": safe_float(row.get("pressure"), 1013.0),
                "rainfall": bool(safe_int(row.get("rainfall"), 0)),
                "wind_speed": safe_float(row.get("wind_speed"), 0.0),
                "wind_direction": safe_int(row.get("wind_direction"), 0),
            }
        )
    return out


def openf1_get_race_control(
    cache_dir: str, year: int, location: str, session_type: str, event_date: Any = None
) -> list[dict[str, Any]]:
    sess = resolve_openf1_session(cache_dir, year, location, session_type, event_date)
    if not sess:
        return []
    raw = openf1_get(cache_dir, "race_control", {"session_key": sess["session_key"]})
    if not isinstance(raw, list) or not raw:
        return []

    t0 = _parse_iso_ts(sess["date_start"]) if sess.get("date_start") else 0.0
    out = []
    for row in raw:
        t = (_parse_iso_ts(row["date"]) - t0) if row.get("date") else 0.0
        out.append(
            {
                "time": round(max(0.0, t), 2),
                "utc": safe_str(row.get("date")),
                "category": safe_str(row.get("category"), "Other"),
                "message": safe_str(row.get("message"), ""),
                "flag": safe_str(row.get("flag")),
                "scope": safe_str(row.get("scope")),
                "sector": safe_int(row.get("sector")),
                "lap": safe_int(row.get("lap_number")),
            }
        )
    return out


def openf1_get_stints(
    cache_dir: str, year: int, location: str, session_type: str, event_date: Any = None
) -> list[dict[str, Any]]:
    sess = resolve_openf1_session(cache_dir, year, location, session_type, event_date)
    if not sess:
        return []
    sk = sess["session_key"]
    raw_stints = openf1_get(cache_dir, "stints", {"session_key": sk})
    if not isinstance(raw_stints, list) or not raw_stints:
        return []

    dmap = openf1_drivers_map(cache_dir, sk)
    results = openf1_get(cache_dir, "session_result", {"session_key": sk}, ttl_seconds=3600)
    pos_map = {}
    if isinstance(results, list):
        for r in results:
            num = safe_int(r.get("driver_number"))
            pos = safe_int(r.get("position"))
            if num is not None and pos is not None:
                pos_map[num] = pos

    grouped: dict[int, list[dict[str, Any]]] = {}
    max_lap = 1
    for s in raw_stints:
        num = safe_int(s.get("driver_number"))
        if num is None:
            continue
        ls = safe_int(s.get("lap_start"), 1) or 1
        le = safe_int(s.get("lap_end"), ls) or ls
        if le > max_lap:
            max_lap = le
        laps_count = max(1, le - ls + 1)
        grouped.setdefault(num, []).append(
            {
                "stint": safe_int(s.get("stint_number"), len(grouped.get(num, [])) + 1),
                "compound": safe_str(s.get("compound"), "UNKNOWN"),
                "laps": laps_count,
                "lap_start": ls,
                "lap_end": le,
            }
        )

    out = []
    for num, driver_stints in grouped.items():
        driver_stints.sort(key=lambda x: x["stint"] or 0)
        info = dmap.get(num, {})
        total_laps = sum(st["laps"] for st in driver_stints)
        out.append(
            {
                "driver": info.get("code", str(num)),
                "number": str(num),
                "name": info.get("name", f"Driver #{num}"),
                "team": info.get("team", "Unknown"),
                "color": info.get("color", "71717A"),
                "position": pos_map.get(num),
                "total_laps": total_laps,
                "race_laps": max_lap,
                "stints": driver_stints,
            }
        )
    out.sort(key=lambda x: x["position"] if x["position"] is not None else 999)
    return out


def openf1_get_lap_comparison(
    cache_dir: str, year: int, location: str, session_type: str, event_date: Any = None
) -> list[dict[str, Any]]:
    sess = resolve_openf1_session(cache_dir, year, location, session_type, event_date)
    if not sess:
        return []
    sk = sess["session_key"]
    dmap = openf1_drivers_map(cache_dir, sk)
    results = openf1_get(cache_dir, "session_result", {"session_key": sk}, ttl_seconds=3600)

    top_nums: list[int] = []
    if isinstance(results, list) and results:
        sorted_res = sorted(
            results,
            key=lambda r: safe_int(r.get("position"), 999) or 999,
        )
        for r in sorted_res[:3]:
            n = safe_int(r.get("driver_number"))
            if n is not None:
                top_nums.append(n)
    if not top_nums:
        top_nums = list(dmap.keys())[:3]

    comparison = []
    for num in top_nums:
        raw_laps = openf1_get(cache_dir, "laps", {"session_key": sk, "driver_number": num})
        durations = [
            safe_float(l.get("lap_duration"))
            for l in (raw_laps or [])
            if safe_float(l.get("lap_duration"))
        ]
        if not durations:
            continue
        min_lap = min(durations)
        threshold = min_lap * 1.10  # Filter SC/pit outliers similar to pick_quicklaps

        laps_data = []
        for l in raw_laps:
            lap_num = safe_int(l.get("lap_number"))
            dur = safe_float(l.get("lap_duration"))
            if lap_num is not None and dur is not None and dur <= threshold:
                laps_data.append({"lap": lap_num, "time": round(dur, 3)})
        laps_data.sort(key=lambda x: x["lap"])
        info = dmap.get(num, {})
        comparison.append(
            {
                "driver": info.get("code", str(num)),
                "name": info.get("name", f"Driver #{num}"),
                "color": info.get("color", "FF1801"),
                "laps": laps_data,
            }
        )
    return comparison


def openf1_get_team_radio(
    cache_dir: str, year: int, location: str, session_type: str, event_date: Any = None
) -> list[dict[str, Any]]:
    sess = resolve_openf1_session(cache_dir, year, location, session_type, event_date)
    if not sess:
        return []
    sk = sess["session_key"]
    raw = openf1_get(cache_dir, "team_radio", {"session_key": sk})
    if not isinstance(raw, list) or not raw:
        return []
    dmap = openf1_drivers_map(cache_dir, sk)
    t0 = _parse_iso_ts(sess["date_start"]) if sess.get("date_start") else 0.0

    radios = []
    for row in raw[-30:]:
        num = safe_int(row.get("driver_number"))
        info = dmap.get(num or -1, {})
        rec = sanitize_https_url(row.get("recording_url"))
        if not rec:
            continue
        dt_str = safe_str(row.get("date"), "")
        t = (_parse_iso_ts(dt_str) - t0) if dt_str and t0 else 0.0
        radios.append(
            {
                "driver_code": info.get("code", str(num or "")),
                "driver_name": info.get("name", f"Driver #{num}"),
                "driver_number": str(num) if num is not None else "",
                "team": info.get("team", "Unknown"),
                "color": info.get("color", "71717A"),
                "time": round(max(0.0, t), 1),
                "date": dt_str,
                "recording_url": rec,
            }
        )
    radios.reverse()
    return radios


# ---------------------------------------------------------------------------
# Season Driver Metadata & Historical Track Winners (Jolpica / OpenF1)
# ---------------------------------------------------------------------------


def get_season_driver_visuals(cache_dir: str, year: int) -> dict[str, dict[str, str]]:
    """Map driverCode -> {image, color} using latest completed OpenF1 race of that year."""
    sessions = openf1_get(
        cache_dir, "sessions", {"year": year, "session_name": "Race"}, ttl_seconds=3600
    )
    visuals: dict[str, dict[str, str]] = {}
    if isinstance(sessions, list) and sessions:
        now = datetime.now(timezone.utc)
        completed = []
        for s in sessions:
            if s.get("is_cancelled"):
                continue
            ds = s.get("date_start")
            if not ds:
                continue
            try:
                dt = datetime.fromisoformat(ds.replace("Z", "+00:00"))
                if dt < now:
                    completed.append((dt, s))
            except Exception:
                pass
        if completed:
            completed.sort(key=lambda x: x[0])
            latest_sk = completed[-1][1]["session_key"]
            dmap = openf1_drivers_map(cache_dir, latest_sk)
            for info in dmap.values():
                visuals[info["code"]] = {
                    "image": info["image"],
                    "color": info["color"],
                }
    return visuals


def get_circuit_history(cache_dir: str, location: str, max_years: int = 5) -> list[dict[str, Any]]:
    """Fetch historical race winners matching a circuit location via Jolpica-F1."""
    disk_dir = os.path.join(cache_dir, "openf1_cache")
    os.makedirs(disk_dir, exist_ok=True)
    norm_loc = normalize_text(location)
    cache_file = os.path.join(disk_dir, f"history_{hashlib.sha256(norm_loc.encode()).hexdigest()[:16]}.json")
    now = time.time()
    if os.path.exists(cache_file) and (now - os.path.getmtime(cache_file)) < 86400 * 3:
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass

    aliases = LOCATION_ALIASES.get(norm_loc, [norm_loc])
    ergast = Ergast()
    current_year = datetime.now(timezone.utc).year
    history: list[dict[str, Any]] = []

    for y in range(current_year, current_year - 7, -1):
        if len(history) >= max_years:
            break
        try:
            races = ergast.get_race_schedule(season=y)
            if races is None or races.empty:
                continue
            matched_round = None
            for _, row in races.iterrows():
                fields = [
                    normalize_text(row.get("locality")),
                    normalize_text(row.get("country")),
                    normalize_text(row.get("circuitName")),
                    normalize_text(row.get("raceName")),
                    normalize_text(row.get("circuitId")),
                ]
                if any(a == f or (a and f and (a in f or f in a)) for a in aliases for f in fields):
                    matched_round = safe_int(row.get("round"))
                    break
            if not matched_round:
                continue

            res = ergast.get_race_results(season=y, round=matched_round)
            if not res.content:
                continue
            df = res.content[0]
            if df.empty:
                continue
            winner = df.iloc[0]
            team = safe_str(winner.get("constructorName")) or (
                winner["constructorNames"][0]
                if "constructorNames" in winner and winner["constructorNames"]
                else "Unknown"
            )
            time_str = safe_str(winner.get("totalRaceTime")) or safe_str(winner.get("status"), "Finished")
            history.append(
                {
                    "year": y,
                    "driver": f"{safe_str(winner.get('givenName'), '')} {safe_str(winner.get('familyName'), '')}".strip(),
                    "code": safe_str(winner.get("driverCode"), ""),
                    "team": team,
                    "time": time_str,
                }
            )
        except Exception:
            continue

    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(history, f)
    except Exception:
        pass
    return history

