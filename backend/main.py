import os
import urllib.parse
import time
from threading import Lock
from typing import Any

import fastf1
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastf1.ergast import Ergast
from pydantic import BaseModel

try:
    from .data_providers import (
        FALLBACK_DRIVER_IMAGE,
        STATIC_DRIVER_IMAGES,
        fastf1_can_load,
        get_circuit_history,
        get_circuit_image,
        get_f1_auth_status,
        get_mvapi_circuit_meta,
        get_season_driver_visuals,
        get_team_color,
        install_nonblocking_f1_auth,
        login_f1tv,
        logout_f1tv,
        openf1_get_drivers,
        openf1_get_lap_comparison,
        openf1_get_race_control,
        openf1_get_stints,
        openf1_get_team_radio,
        openf1_get_telemetry,
        openf1_get_track_data,
        openf1_get_weather,
        resolve_openf1_session,
        safe_float,
        safe_int,
        safe_iso,
        safe_seconds,
        safe_str,
    )
except ImportError:
    from data_providers import (
        FALLBACK_DRIVER_IMAGE,
        STATIC_DRIVER_IMAGES,
        fastf1_can_load,
        get_circuit_history,
        get_circuit_image,
        get_f1_auth_status,
        get_mvapi_circuit_meta,
        get_season_driver_visuals,
        get_team_color,
        install_nonblocking_f1_auth,
        login_f1tv,
        logout_f1tv,
        openf1_get_drivers,
        openf1_get_lap_comparison,
        openf1_get_race_control,
        openf1_get_stints,
        openf1_get_team_radio,
        openf1_get_telemetry,
        openf1_get_track_data,
        openf1_get_weather,
        resolve_openf1_session,
        safe_float,
        safe_int,
        safe_iso,
        safe_seconds,
        safe_str,
    )

# Load optional .env files (project root or backend/)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

# Configure FastF1 Cache (FastF1 v3.9+ uses Cache.configure)
CACHE_DIR = (
    os.environ.get("FASTF1_CACHE_DIR")
    or os.environ.get("FASTF1_CACHE")
    or os.path.join(os.path.dirname(__file__), "cache")
)
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.configure(cache_dir=CACHE_DIR)

# Never hang API server waiting for interactive CLI credentials
install_nonblocking_f1_auth()

app = FastAPI(title="F1 View API", version="2.0.0")

import hmac
import ipaddress
import logging
import re
from fastapi import Depends, Request
try:
    from .data_providers import sanitize_https_url
except ImportError:
    from data_providers import sanitize_https_url

logger = logging.getLogger("f1view.api")

_LOCATION_RE = re.compile(r"^[A-Za-z0-9 .,'()_-]{1,100}$")
_SESSION_TYPE_RE = re.compile(r"^[A-Za-z0-9 _-]{1,40}$")


def _validate_year(year: int, min_year: int = 1950, max_year: int = 2035) -> int:
    if year < min_year or year > max_year:
        raise HTTPException(status_code=400, detail="Invalid season year")
    return year


def _validate_session_type(session_type: str) -> str:
    cleaned = urllib.parse.unquote(session_type).strip()
    if not cleaned or not _SESSION_TYPE_RE.fullmatch(cleaned):
        raise HTTPException(status_code=400, detail="Invalid session type")
    return cleaned


def _validate_common_path_params(request: Request) -> None:
    params = request.path_params
    if "year" in params:
        try:
            _validate_year(int(params["year"]))
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail="Invalid season year") from exc
    if "location" in params:
        _clean_location(str(params["location"]))
    if "session_type" in params:
        _validate_session_type(str(params["session_type"]))


def _safe_http_error(
    exc: Exception, status_code: int = 500, detail: str = "Unable to load requested telemetry data"
) -> HTTPException:
    if isinstance(exc, HTTPException):
        return exc
    logger.exception("API request failed: %s", type(exc).__name__)
    return HTTPException(status_code=status_code, detail=detail)


def _is_loopback_host(host: str) -> bool:
    if not host:
        return False
    if host == "testclient":
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


def _require_local_or_admin_auth(request: Request) -> None:
    forwarded = (
        request.headers.get("forwarded")
        or request.headers.get("x-forwarded-for")
        or request.headers.get("x-real-ip")
    )
    client_host = request.client.host if request.client else ""
    if _is_loopback_host(client_host) and not forwarded:
        return

    remote_enabled = os.environ.get("ENABLE_REMOTE_F1_LOGIN", "").lower() == "true"
    admin_token = os.environ.get("F1_ADMIN_TOKEN", "")
    auth_header = request.headers.get("authorization", "")
    provided_token = (
        auth_header[7:].strip() if auth_header.lower().startswith("bearer ") else ""
    )
    if remote_enabled and admin_token and provided_token:
        if hmac.compare_digest(provided_token, admin_token):
            return

    raise HTTPException(
        status_code=403,
        detail="F1TV account login/logout is restricted to direct localhost requests unless ENABLE_REMOTE_F1_LOGIN=true and F1_ADMIN_TOKEN are configured.",
    )


# Configure CORS
allowed_origins_env = os.environ.get("ALLOWED_ORIGINS", "")
allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if allowed_origins_env:
    for origin in allowed_origins_env.split(","):
        cleaned = origin.strip()
        if cleaned and cleaned != "*" and cleaned not in allowed_origins:
            allowed_origins.append(cleaned)

app.router.dependencies.append(Depends(_validate_common_path_params))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = f"{process_time:.4f}"
    return response


# Per-session cache & locks
_session_cache: dict[str, fastf1.core.Session] = {}
_session_locks: dict[str, Lock] = {}
_locks_guard = Lock()


def _get_session_lock(key: str) -> Lock:
    with _locks_guard:
        if key not in _session_locks:
            _session_locks[key] = Lock()
        return _session_locks[key]


def _clean_location(location: str) -> str:
    cleaned = urllib.parse.unquote(location).strip()
    if (
        not cleaned
        or ".." in cleaned
        or "/" in cleaned
        or "\\" in cleaned
        or any(ord(ch) < 32 for ch in cleaned)
        or not _LOCATION_RE.fullmatch(cleaned)
    ):
        raise HTTPException(status_code=400, detail="Invalid location parameter")
    return cleaned


def _get_cached_session(year: int, location: str, session_type: str) -> tuple[fastf1.core.Session, str]:
    loc = _clean_location(location)
    key = f"{year}_{loc}_{session_type}"
    with _locks_guard:
        if key not in _session_cache:
            _session_cache[key] = fastf1.get_session(year, loc, session_type)
        return _session_cache[key], key


def _ensure_fastf1_loaded(
    session: fastf1.core.Session,
    lock_key: str,
    laps: bool = False,
    telemetry: bool = False,
    weather: bool = False,
    messages: bool = False,
) -> bool:
    """Load requested FastF1 streams if cached locally or F1TV auth is configured."""
    if not fastf1_can_load(
        CACHE_DIR,
        session,
        require_laps=laps,
        require_telemetry=telemetry,
        require_weather=weather,
        require_messages=messages,
    ):
        return False

    lock = _get_session_lock(lock_key)
    with lock:
        need_basic = not getattr(session, "_f1v_basic", False)
        need_laps = laps and not getattr(session, "_f1v_laps", False)
        need_tel = telemetry and not getattr(session, "_f1v_tel", False)
        need_weather = weather and not getattr(session, "_f1v_weather", False)
        need_msg = messages and not getattr(session, "_f1v_msg", False)

        if not (need_basic or need_laps or need_tel or need_weather or need_msg):
            return True

        load_laps = getattr(session, "_f1v_laps", False) or laps or telemetry
        load_tel = getattr(session, "_f1v_tel", False) or telemetry
        load_weather = getattr(session, "_f1v_weather", False) or weather
        load_msg = getattr(session, "_f1v_msg", False) or messages

        try:
            session.load(
                laps=load_laps,
                telemetry=load_tel,
                weather=load_weather,
                messages=load_msg,
            )
            session._f1v_basic = True
            if load_laps:
                session._f1v_laps = True
            if load_tel:
                session._f1v_tel = True
            if load_weather:
                session._f1v_weather = True
            if load_msg:
                session._f1v_msg = True
            return True
        except Exception as exc:
            print(f"FastF1 load failed for {lock_key}: {exc}")
            return False


def _session_event_date(session: fastf1.core.Session) -> Any:
    return getattr(session, "date", None) or getattr(session.event, "EventDate", None)


class F1LoginRequest(BaseModel):
    username: str
    password: str


@app.get("/")
def read_root():
    return {"message": "Welcome to F1 View API", "fastf1_version": fastf1.__version__}


@app.get("/health")
def health_check():
    auth = get_f1_auth_status()
    return {
        "status": "ok",
        "fastf1_version": fastf1.__version__,
        "f1_authenticated": auth["authenticated"],
        "fallback_provider": "openf1+jolpica",
    }


@app.get("/api/auth/status")
def auth_status():
    return get_f1_auth_status()


@app.post("/api/auth/login")
def auth_login(payload: F1LoginRequest, request: Request):
    _require_local_or_admin_auth(request)
    username = payload.username.strip()
    password = payload.password
    if not username or len(username) > 254 or not password or len(password) > 256:
        raise HTTPException(status_code=400, detail="Invalid credentials format")
    try:
        return login_f1tv(username, password)
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("F1TV authentication failed (%s)", type(exc).__name__)
        raise HTTPException(
            status_code=401,
            detail="F1TV authentication failed. Please check credentials or try again later.",
        ) from exc


@app.post("/api/auth/logout")
def auth_logout(request: Request):
    _require_local_or_admin_auth(request)
    return logout_f1tv()


@app.get("/api/schedule/{year}")
def get_schedule(year: int, include_testing: bool = False):
    try:
        schedule = fastf1.get_event_schedule(year, include_testing=include_testing)
        if not include_testing and "EventFormat" in schedule.columns:
            schedule = schedule[schedule["EventFormat"] != "testing"]
        if not include_testing and "RoundNumber" in schedule.columns:
            schedule = schedule[schedule["RoundNumber"] > 0]

        date_cols = {
            "EventDate",
            "Session1Date",
            "Session1DateUtc",
            "Session2Date",
            "Session2DateUtc",
            "Session3Date",
            "Session3DateUtc",
            "Session4Date",
            "Session4DateUtc",
            "Session5Date",
            "Session5DateUtc",
        }
        columns = [
            "RoundNumber",
            "Country",
            "Location",
            "OfficialEventName",
            "EventName",
            "EventFormat",
            "EventDate",
            "Session1",
            "Session1Date",
            "Session1DateUtc",
            "Session2",
            "Session2Date",
            "Session2DateUtc",
            "Session3",
            "Session3Date",
            "Session3DateUtc",
            "Session4",
            "Session4Date",
            "Session4DateUtc",
            "Session5",
            "Session5Date",
            "Session5DateUtc",
        ]
        existing_columns = [c for c in columns if c in schedule.columns]

        events = []
        for _, row in schedule[existing_columns].iterrows():
            ev: dict[str, Any] = {}
            for col in existing_columns:
                val = row[col]
                if col in date_cols:
                    ev[col] = safe_iso(val)
                elif col == "RoundNumber":
                    ev[col] = safe_int(val, 0)
                else:
                    ev[col] = safe_str(val)
            ev["Image"] = get_circuit_image(ev.get("Location"))
            events.append(ev)

        return {"year": year, "events": events}
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/session/{year}/{location}/{session_type}")
def get_session_details(year: int, location: str, session_type: str):
    try:
        loc = _clean_location(location)
        session, lock_key = _get_cached_session(year, loc, session_type)
        loaded = _ensure_fastf1_loaded(session, lock_key)

        available_sessions = []
        for i in range(1, 6):
            sname = safe_str(session.event.get(f"Session{i}"))
            if sname:
                available_sessions.append(sname)

        source = "fastf1" if loaded else "fastf1-event"
        if not loaded:
            of1 = resolve_openf1_session(
                CACHE_DIR, year, loc, session_type, _session_event_date(session)
            )
            if of1:
                source = "openf1"

        return {
            "name": safe_str(session.name, session_type),
            "date": safe_iso(_session_event_date(session)),
            "event": safe_str(session.event.get("OfficialEventName"))
            or safe_str(session.event.get("EventName"), loc),
            "event_name": safe_str(session.event.get("EventName"), loc),
            "location": safe_str(session.event.get("Location"), loc),
            "country": safe_str(session.event.get("Country")),
            "round_number": safe_int(session.event.get("RoundNumber")),
            "event_format": safe_str(session.event.get("EventFormat")),
            "session_type": session_type,
            "available_sessions": available_sessions,
            "source": source,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc, status_code=404, detail="Session not found or unavailable") from exc


@app.get("/api/session/{year}/{location}/{session_type}/drivers")
def get_session_drivers(year: int, location: str, session_type: str):
    try:
        loc = _clean_location(location)
        session, lock_key = _get_cached_session(year, loc, session_type)
        loaded = _ensure_fastf1_loaded(session, lock_key)

        drivers = []
        if loaded and hasattr(session, "results") and session.results is not None and not session.results.empty:
            visuals = get_season_driver_visuals(CACHE_DIR, year)
            for driver_number, row in session.results.iterrows():
                code = safe_str(row.get("Abbreviation"), str(driver_number))
                team = safe_str(row.get("TeamName"), "Unknown")
                color = safe_str(row.get("TeamColor")) or get_team_color(team)
                headshot = (
                    sanitize_https_url(row.get("HeadshotUrl"))
                    or visuals.get(code, {}).get("image")
                    or STATIC_DRIVER_IMAGES.get(code)
                    or FALLBACK_DRIVER_IMAGE
                )
                drivers.append(
                    {
                        "id": str(driver_number),
                        "number": safe_str(row.get("DriverNumber"), str(driver_number)),
                        "code": code,
                        "name": safe_str(row.get("FullName"), code),
                        "team": team,
                        "color": color.lstrip("#"),
                        "position": safe_int(row.get("Position")),
                        "time": safe_str(row.get("Time")),
                        "status": safe_str(row.get("Status")),
                        "image": headshot,
                    }
                )
            drivers.sort(key=lambda x: x["position"] if x["position"] is not None else 999)

        if not drivers:
            drivers = openf1_get_drivers(
                CACHE_DIR, year, loc, session_type, _session_event_date(session)
            )

        if not drivers and loaded and getattr(session, "drivers", None):
            for driver_id in session.drivers:
                info = session.get_driver(driver_id)
                code = safe_str(info.get("Abbreviation"), str(driver_id))
                team = safe_str(info.get("TeamName"), "Unknown")
                drivers.append(
                    {
                        "id": str(driver_id),
                        "number": safe_str(info.get("DriverNumber"), str(driver_id)),
                        "code": code,
                        "name": safe_str(info.get("FullName"), code),
                        "team": team,
                        "color": (safe_str(info.get("TeamColor")) or get_team_color(team)).lstrip("#"),
                        "position": None,
                        "time": None,
                        "status": None,
                        "image": safe_str(info.get("HeadshotUrl"))
                        or STATIC_DRIVER_IMAGES.get(code)
                        or FALLBACK_DRIVER_IMAGE,
                    }
                )

        return {"drivers": drivers}
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/session/{year}/{location}/{session_type}/telemetry")
def get_telemetry(year: int, location: str, session_type: str, driver: str | None = None, limit: int = 300):
    """Get fastest-lap telemetry data for a driver (FastF1 with OpenF1 fallback)."""
    try:
        limit = max(50, min(limit, 2000))
        loc = _clean_location(location)
        session, lock_key = _get_cached_session(year, loc, session_type)
        loaded = _ensure_fastf1_loaded(session, lock_key, laps=True, telemetry=True)

        if not driver:
            if loaded and getattr(session, "drivers", None):
                driver = str(session.drivers[0])
            else:
                of1_drivers = openf1_get_drivers(
                    CACHE_DIR, year, loc, session_type, _session_event_date(session)
                )
                if of1_drivers:
                    driver = of1_drivers[0]["id"]
                else:
                    raise HTTPException(status_code=404, detail="No drivers found for session telemetry")

        if loaded:
            try:
                driver_laps = session.laps.pick_drivers(driver)
                if not driver_laps.empty:
                    fastest_lap = driver_laps.pick_fastest()
                    if fastest_lap is not None and not fastest_lap.empty:
                        telemetry = fastest_lap.get_telemetry()
                        if telemetry is not None and not telemetry.empty:
                            step = max(1, len(telemetry) // limit)
                            telemetry = telemetry.iloc[::step]
                            data = []
                            for _, row in telemetry.iterrows():
                                t_sec = safe_seconds(row.get("Time"))
                                x_val = safe_float(row.get("X"))
                                y_val = safe_float(row.get("Y"))
                                if t_sec is None or x_val is None or y_val is None:
                                    continue
                                brake_val = row.get("Brake")
                                brake_pct = (
                                    100
                                    if (isinstance(brake_val, bool) and brake_val)
                                    or (safe_float(brake_val, 0.0) or 0.0) > 0
                                    else 0
                                )
                                data.append(
                                    {
                                        "time": round(t_sec, 3),
                                        "distance": round(safe_float(row.get("Distance"), 0.0) or 0.0, 2),
                                        "speed": safe_float(row.get("Speed"), 0.0),
                                        "rpm": safe_float(row.get("RPM"), 0.0),
                                        "gear": safe_int(row.get("nGear"), 0),
                                        "throttle": safe_float(row.get("Throttle"), 0.0),
                                        "brake": brake_pct,
                                        "x": x_val,
                                        "y": y_val,
                                    }
                                )
                            if data:
                                return {
                                    "driver_id": driver,
                                    "driver_code": safe_str(fastest_lap.get("Driver"), driver),
                                    "lap_number": safe_int(fastest_lap.get("LapNumber")),
                                    "lap_time": safe_seconds(fastest_lap.get("LapTime")),
                                    "telemetry": data,
                                    "source": "fastf1",
                                }
            except Exception as exc:
                print(f"FastF1 telemetry extraction failed, trying OpenF1: {exc}")

        of1_data = openf1_get_telemetry(
            CACHE_DIR,
            year,
            loc,
            session_type,
            driver,
            limit=limit,
            event_date=_session_event_date(session),
        )
        if of1_data:
            return of1_data

        raise HTTPException(status_code=404, detail=f"No telemetry data available for driver {driver}")
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/track/{year}/{location}/{session_type}")
def get_track_data(year: int, location: str, session_type: str):
    try:
        loc = _clean_location(location)
        session, lock_key = _get_cached_session(year, loc, session_type)
        loaded = _ensure_fastf1_loaded(session, lock_key, laps=True, telemetry=True)

        if loaded:
            try:
                lap = session.laps.pick_fastest()
                if lap is not None and not lap.empty:
                    telemetry = lap.get_telemetry()
                    if telemetry is not None and not telemetry.empty:
                        step = max(1, len(telemetry) // 180)
                        telemetry = telemetry.iloc[::step]
                        track_data = []
                        for _, row in telemetry.iterrows():
                            x_val = safe_float(row.get("X"))
                            y_val = safe_float(row.get("Y"))
                            if x_val is None or y_val is None:
                                continue
                            track_data.append(
                                {
                                    "x": x_val,
                                    "y": y_val,
                                    "z": safe_float(row.get("Z"), 0.0),
                                    "speed": safe_float(row.get("Speed"), 0.0),
                                }
                            )
                        circuit_meta = {}
                        try:
                            ci = session.get_circuit_info()
                            if ci:
                                circuit_meta["rotation"] = safe_float(getattr(ci, "rotation", 0.0), 0.0)
                                circuit_meta["corners_count"] = len(ci.corners) if ci.corners is not None else 0
                        except Exception:
                            pass
                        if track_data:
                            return {
                                "circuit_name": safe_str(session.event.get("Location"), loc),
                                "track_data": track_data,
                                "source": "fastf1",
                                **circuit_meta,
                            }
            except Exception as exc:
                print(f"FastF1 track data failed, trying OpenF1: {exc}")

        of1_track = openf1_get_track_data(
            CACHE_DIR, year, loc, session_type, _session_event_date(session)
        )
        if of1_track and of1_track.get("track_data"):
            return of1_track

        return {
            "circuit_name": safe_str(session.event.get("Location"), loc),
            "track_data": [],
            "source": "unavailable",
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/weather/{year}/{location}/{session_type}")
def get_weather(year: int, location: str, session_type: str):
    try:
        loc = _clean_location(location)
        session, lock_key = _get_cached_session(year, loc, session_type)
        loaded = _ensure_fastf1_loaded(session, lock_key, weather=True)

        data = []
        if loaded and hasattr(session, "weather_data") and session.weather_data is not None and not session.weather_data.empty:
            for _, row in session.weather_data.iterrows():
                t_sec = safe_seconds(row.get("Time"))
                if t_sec is None:
                    continue
                data.append(
                    {
                        "time": round(t_sec, 2),
                        "air_temp": safe_float(row.get("AirTemp"), 0.0),
                        "track_temp": safe_float(row.get("TrackTemp"), 0.0),
                        "humidity": safe_float(row.get("Humidity"), 0.0),
                        "pressure": safe_float(row.get("Pressure"), 1013.0),
                        "rainfall": bool(row.get("Rainfall")) if pd.notna(row.get("Rainfall")) else False,
                        "wind_speed": safe_float(row.get("WindSpeed"), 0.0),
                        "wind_direction": safe_int(row.get("WindDirection"), 0),
                    }
                )

        if not data:
            data = openf1_get_weather(
                CACHE_DIR, year, loc, session_type, _session_event_date(session)
            )

        return {"weather": data}
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/race_control/{year}/{location}/{session_type}")
def get_race_control(year: int, location: str, session_type: str):
    try:
        loc = _clean_location(location)
        session, lock_key = _get_cached_session(year, loc, session_type)
        loaded = _ensure_fastf1_loaded(session, lock_key, messages=True)

        data = []
        if loaded:
            try:
                rcm = session.race_control_messages
                if rcm is not None and not rcm.empty:
                    t0 = rcm["Time"].iloc[0] if "Time" in rcm.columns and pd.notna(rcm["Time"].iloc[0]) else None
                    for _, row in rcm.iterrows():
                        msg_text = safe_str(row.get("Message"), "")
                        if not msg_text:
                            continue
                        t_val = row.get("Time")
                        if t0 is not None and pd.notna(t_val):
                            t_sec = max(0.0, float((t_val - t0).total_seconds()))
                        else:
                            t_sec = 0.0
                        data.append(
                            {
                                "time": round(t_sec, 2),
                                "utc": safe_iso(t_val),
                                "category": safe_str(row.get("Category"), "Other"),
                                "message": msg_text,
                                "flag": safe_str(row.get("Flag")),
                                "scope": safe_str(row.get("Scope")),
                                "sector": safe_int(row.get("Sector")),
                                "lap": safe_int(row.get("Lap")),
                            }
                        )
            except Exception as exc:
                print(f"FastF1 race_control_messages error: {exc}")

        if not data:
            data = openf1_get_race_control(
                CACHE_DIR, year, loc, session_type, _session_event_date(session)
            )

        return {"messages": data}
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/stints/{year}/{location}/{session_type}")
def get_tyre_stints(year: int, location: str, session_type: str):
    try:
        loc = _clean_location(location)
        session, lock_key = _get_cached_session(year, loc, session_type)
        loaded = _ensure_fastf1_loaded(session, lock_key, laps=True)

        stints = []
        if loaded and hasattr(session, "laps") and session.laps is not None and not session.laps.empty:
            results_map: dict[str, dict[str, Any]] = {}
            if hasattr(session, "results") and session.results is not None and not session.results.empty:
                for drv_num, r in session.results.iterrows():
                    results_map[str(drv_num)] = {
                        "code": safe_str(r.get("Abbreviation"), str(drv_num)),
                        "name": safe_str(r.get("FullName"), str(drv_num)),
                        "team": safe_str(r.get("TeamName"), "Unknown"),
                        "color": (safe_str(r.get("TeamColor")) or get_team_color(r.get("TeamName"))).lstrip("#"),
                        "position": safe_int(r.get("Position")),
                    }

            max_race_laps = safe_int(session.laps["LapNumber"].max(), 1) or 1
            for driver_num in session.drivers:
                driver_laps = session.laps.pick_drivers(driver_num)
                if driver_laps.empty or "Stint" not in driver_laps.columns:
                    continue

                valid_stints = driver_laps.dropna(subset=["Stint"])
                if valid_stints.empty:
                    continue

                driver_stint_data = []
                for stint_id, stint_laps in valid_stints.groupby("Stint"):
                    sid = safe_int(stint_id)
                    if sid is None:
                        continue
                    compounds = stint_laps["Compound"].dropna() if "Compound" in stint_laps.columns else pd.Series([], dtype=object)
                    compound = safe_str(compounds.iloc[0], "UNKNOWN") if not compounds.empty else "UNKNOWN"
                    lap_start = safe_int(stint_laps["LapNumber"].min(), 1) or 1
                    lap_end = safe_int(stint_laps["LapNumber"].max(), lap_start) or lap_start
                    driver_stint_data.append(
                        {
                            "stint": sid,
                            "compound": compound.upper(),
                            "laps": int(len(stint_laps)),
                            "lap_start": lap_start,
                            "lap_end": lap_end,
                        }
                    )

                if not driver_stint_data:
                    continue
                driver_stint_data.sort(key=lambda x: x["stint"])
                meta = results_map.get(str(driver_num), {})
                code = meta.get("code") or safe_str(driver_laps["Driver"].iloc[0], str(driver_num))
                stints.append(
                    {
                        "driver": code,
                        "number": str(driver_num),
                        "name": meta.get("name", code),
                        "team": meta.get("team", "Unknown"),
                        "color": meta.get("color", "71717A"),
                        "position": meta.get("position"),
                        "total_laps": int(sum(s["laps"] for s in driver_stint_data)),
                        "race_laps": max_race_laps,
                        "stints": driver_stint_data,
                    }
                )
            stints.sort(key=lambda x: x["position"] if x["position"] is not None else 999)

        if not stints:
            stints = openf1_get_stints(
                CACHE_DIR, year, loc, session_type, _session_event_date(session)
            )

        return {"stints": stints}
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/laps/{year}/{location}/{session_type}")
def get_lap_comparison(year: int, location: str, session_type: str):
    try:
        loc = _clean_location(location)
        session, lock_key = _get_cached_session(year, loc, session_type)
        loaded = _ensure_fastf1_loaded(session, lock_key, laps=True)

        data = []
        if loaded and hasattr(session, "laps") and session.laps is not None and not session.laps.empty:
            top_drivers: list[tuple[str, str, str, str]] = []
            if hasattr(session, "results") and session.results is not None and not session.results.empty:
                res_sorted = session.results.copy()
                if "Position" in res_sorted.columns:
                    res_sorted = res_sorted.sort_values(by="Position", na_position="last")
                for drv_num, row in res_sorted.head(3).iterrows():
                    code = safe_str(row.get("Abbreviation"), str(drv_num))
                    name = safe_str(row.get("FullName"), code)
                    color = (safe_str(row.get("TeamColor")) or get_team_color(row.get("TeamName"))).lstrip("#")
                    top_drivers.append((str(drv_num), code, name, color))
            else:
                for drv_num in session.drivers[:3]:
                    top_drivers.append((str(drv_num), str(drv_num), str(drv_num), "FF1801"))

            for drv_num, code, name, color in top_drivers:
                driver_laps = session.laps.pick_drivers(drv_num)
                if driver_laps.empty:
                    continue
                quick_laps = driver_laps.pick_quicklaps()
                if quick_laps.empty:
                    quick_laps = driver_laps.dropna(subset=["LapTime", "LapNumber"])

                laps_data = []
                for _, row in quick_laps.iterrows():
                    lap_num = safe_int(row.get("LapNumber"))
                    lap_sec = safe_seconds(row.get("LapTime"))
                    if lap_num is not None and lap_sec is not None:
                        laps_data.append({"lap": lap_num, "time": round(lap_sec, 3)})
                laps_data.sort(key=lambda x: x["lap"])
                if laps_data:
                    data.append(
                        {
                            "driver": code,
                            "name": name,
                            "color": color,
                            "laps": laps_data,
                        }
                    )

        if not data:
            data = openf1_get_lap_comparison(
                CACHE_DIR, year, loc, session_type, _session_event_date(session)
            )

        return {"comparison": data}
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/circuit/{year}/{location}/{session_type}")
def get_circuit_info(year: int, location: str, session_type: str):
    try:
        loc = _clean_location(location)
        session, lock_key = _get_cached_session(year, loc, session_type)
        loaded = _ensure_fastf1_loaded(session, lock_key, laps=True, telemetry=True)

        circuit_meta: dict[str, Any] = {}
        length_km: float | None = None

        if loaded:
            try:
                ci = session.get_circuit_info()
                if ci:
                    corners = []
                    if ci.corners is not None and not ci.corners.empty:
                        for _, r in ci.corners.iterrows():
                            corners.append(
                                {
                                    "x": safe_float(r.get("X")),
                                    "y": safe_float(r.get("Y")),
                                    "number": safe_int(r.get("Number")),
                                    "letter": safe_str(r.get("Letter"), ""),
                                }
                            )
                    circuit_meta = {
                        "rotation": safe_float(getattr(ci, "rotation", 0.0), 0.0),
                        "corners_count": len(corners),
                        "corners": corners,
                    }
            except Exception:
                pass
            try:
                lap = session.laps.pick_fastest()
                if lap is not None and not lap.empty:
                    tel = lap.get_telemetry()
                    if tel is not None and not tel.empty and "Distance" in tel.columns:
                        max_dist = safe_float(tel["Distance"].max())
                        if max_dist and max_dist > 1000:
                            length_km = round(max_dist / 1000.0, 3)
            except Exception:
                pass

        if not circuit_meta:
            of1 = resolve_openf1_session(
                CACHE_DIR, year, loc, session_type, _session_event_date(session)
            )
            if of1 and of1.get("circuit_key"):
                circuit_meta = get_mvapi_circuit_meta(year, safe_int(of1["circuit_key"]))

        if length_km is None:
            track_fallback = openf1_get_track_data(
                CACHE_DIR, year, loc, session_type, _session_event_date(session)
            )
            pts = (track_fallback or {}).get("track_data") or []
            if len(pts) > 20:
                import math
                total_dm = sum(
                    math.hypot(pts[i]["x"] - pts[i - 1]["x"], pts[i]["y"] - pts[i - 1]["y"])
                    for i in range(1, len(pts))
                )
                total_dm += math.hypot(pts[0]["x"] - pts[-1]["x"], pts[0]["y"] - pts[-1]["y"])
                if total_dm > 10000:
                    length_km = round(total_dm / 10000.0, 3)

        return {
            "name": safe_str(session.event.get("OfficialEventName"))
            or safe_str(session.event.get("EventName"), loc),
            "event_name": safe_str(session.event.get("EventName"), loc),
            "location": safe_str(session.event.get("Location"), loc),
            "country": safe_str(session.event.get("Country")),
            "date": safe_iso(session.event.get("EventDate")),
            "length_km": length_km,
            **circuit_meta,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/radio/{year}/{location}/{session_type}")
def get_team_radio(year: int, location: str, session_type: str):
    try:
        loc = _clean_location(location)
        session, _ = _get_cached_session(year, loc, session_type)
        radios = openf1_get_team_radio(
            CACHE_DIR, year, loc, session_type, _session_event_date(session)
        )
        return {"radios": radios}
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/standings/{year}")
def get_standings(year: int):
    try:
        ergast = Ergast()
        visuals = get_season_driver_visuals(CACHE_DIR, year)

        drivers_data = []
        try:
            d_standings = ergast.get_driver_standings(season=year)
            if d_standings.content:
                df = d_standings.content[0]
                for _, row in df.iterrows():
                    team_name = "Unknown"
                    if "constructorName" in row and pd.notna(row["constructorName"]):
                        team_name = str(row["constructorName"])
                    elif "constructorNames" in row and row["constructorNames"]:
                        team_name = str(row["constructorNames"][-1])

                    given = safe_str(row.get("givenName"), "")
                    family = safe_str(row.get("familyName"), "")
                    full_name = f"{given} {family}".strip()
                    code = safe_str(row.get("driverCode")) or family[:3].upper()
                    vis = visuals.get(code, {})
                    image = (
                        vis.get("image")
                        or STATIC_DRIVER_IMAGES.get(code)
                        or FALLBACK_DRIVER_IMAGE
                    )
                    color = vis.get("color") or get_team_color(team_name)

                    drivers_data.append(
                        {
                            "pos": safe_int(row.get("position"), 0),
                            "driverId": safe_str(row.get("driverId"), code.lower()),
                            "code": code,
                            "name": full_name,
                            "team": team_name,
                            "color": color.lstrip("#"),
                            "points": safe_float(row.get("points"), 0.0),
                            "wins": safe_int(row.get("wins"), 0),
                            "image": image,
                        }
                    )
        except Exception as exc:
            print(f"Error fetching driver standings: {exc}")

        constructors_data = []
        try:
            c_standings = ergast.get_constructor_standings(season=year)
            if c_standings.content:
                df = c_standings.content[0]
                for _, row in df.iterrows():
                    cname = safe_str(row.get("constructorName"), "Unknown")
                    constructors_data.append(
                        {
                            "pos": safe_int(row.get("position"), 0),
                            "name": cname,
                            "color": get_team_color(cname),
                            "points": safe_float(row.get("points"), 0.0),
                            "wins": safe_int(row.get("wins"), 0),
                        }
                    )
        except Exception as exc:
            print(f"Error fetching constructor standings: {exc}")

        return {
            "year": year,
            "drivers": drivers_data,
            "constructors": constructors_data,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/rivalry/{year}")
def get_rivalry(year: int):
    try:
        ergast = Ergast()
        visuals = get_season_driver_visuals(CACHE_DIR, year)
        d_standings = ergast.get_driver_standings(season=year)

        if not d_standings.content or d_standings.content[0].empty:
            return {"rivals": []}

        df = d_standings.content[0]
        top_2 = df.head(2)

        rivals = []
        for _, row in top_2.iterrows():
            team_name = "Unknown"
            if "constructorName" in row and pd.notna(row["constructorName"]):
                team_name = str(row["constructorName"])
            elif "constructorNames" in row and row["constructorNames"]:
                team_name = str(row["constructorNames"][-1])

            given = safe_str(row.get("givenName"), "")
            family = safe_str(row.get("familyName"), "")
            code = safe_str(row.get("driverCode")) or family[:3].upper()
            vis = visuals.get(code, {})
            color = vis.get("color") or get_team_color(team_name)

            rivals.append(
                {
                    "id": safe_str(row.get("driverId"), code.lower()),
                    "code": code,
                    "name": f"{given} {family}".strip(),
                    "team": team_name,
                    "color": color.lstrip("#"),
                    "points": safe_float(row.get("points"), 0.0),
                    "wins": safe_int(row.get("wins"), 0),
                    "image": vis.get("image")
                    or STATIC_DRIVER_IMAGES.get(code)
                    or FALLBACK_DRIVER_IMAGE,
                }
            )

        return {"rivals": rivals}
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc


@app.get("/api/history/{location}")
def get_history(location: str):
    try:
        loc = _clean_location(location)
        history = get_circuit_history(CACHE_DIR, loc)
        return {"location": loc, "history": history}
    except HTTPException:
        raise
    except Exception as exc:
        raise _safe_http_error(exc) from exc
