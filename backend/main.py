import os
import time
import fastf1
import pandas as pd
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from threading import Lock
from fastf1.ergast import Ergast

# Configure FastF1 Cache
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

fastf1.Cache.enable_cache(CACHE_DIR)

# Image Mappings
DRIVER_IMAGES = {
    "Max Verstappen": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png",
    "Lando Norris": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col/image.png",
    "Charles Leclerc": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col/image.png",
    "Oscar Piastri": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col/image.png",
    "Carlos Sainz": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col/image.png",
    "George Russell": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/2col/image.png",
    "Lewis Hamilton": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col/image.png",
    "Sergio Perez": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/2col/image.png",
    "Fernando Alonso": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/2col/image.png",
    "Nico Hulkenberg": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/2col/image.png",
}

CIRCUIT_IMAGES = {
    "Lusail": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop",
    "Yas Marina": "https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2832&auto=format&fit=crop",
    "Sakhir": "https://images.unsplash.com/photo-1532906619279-a798156785c7?q=80&w=2574&auto=format&fit=crop",
    "Jeddah": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=2670&auto=format&fit=crop",
    "Albert Park": "https://images.unsplash.com/photo-1580234550905-408e19d56482?q=80&w=2670&auto=format&fit=crop",
    "Suzuka": "https://images.unsplash.com/photo-1574781330855-d0db8cc6a79c?q=80&w=2670&auto=format&fit=crop",
    "Shanghai": "https://images.unsplash.com/photo-1535132011086-b8818f016104?q=80&w=2670&auto=format&fit=crop",
    "Miami": "https://images.unsplash.com/photo-1551524164-687a55dd1126?q=80&w=2525&auto=format&fit=crop",
    "Imola": "https://images.unsplash.com/photo-1621932953986-15fcf084da0f?q=80&w=2670&auto=format&fit=crop",
    "Monaco": "https://images.unsplash.com/photo-1516335096713-6652e9283c3e?q=80&w=2667&auto=format&fit=crop",
    "Montreal": "https://images.unsplash.com/photo-1573074617613-fc8443628f34?q=80&w=2670&auto=format&fit=crop",
    "Barcelona": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop",
    "Spielberg": "https://images.unsplash.com/photo-1595752393674-84c25925c40e?q=80&w=2670&auto=format&fit=crop",
    "Silverstone": "https://images.unsplash.com/photo-1519245659620-e859806a8d3b?q=80&w=2670&auto=format&fit=crop",
    "Budapest": "https://images.unsplash.com/photo-1532509854626-54754227793f?q=80&w=2670&auto=format&fit=crop",
    "Spa": "https://images.unsplash.com/photo-1596566427382-7d0434934e6d?q=80&w=2670&auto=format&fit=crop",
    "Zandvoort": "https://images.unsplash.com/photo-1629213506425-4c65e8c9d242?q=80&w=2670&auto=format&fit=crop",
    "Monza": "https://images.unsplash.com/photo-1596727147705-54a7d7501d7d?q=80&w=2670&auto=format&fit=crop",
    "Baku": "https://images.unsplash.com/photo-1575010726601-576a8a553e5d?q=80&w=2670&auto=format&fit=crop",
    "Singapore": "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop",
    "Austin": "https://images.unsplash.com/photo-1580234550905-408e19d56482?q=80&w=2670&auto=format&fit=crop",
    "Mexico City": "https://images.unsplash.com/photo-1584646098378-0874589d76b1?q=80&w=2670&auto=format&fit=crop",
    "Sao Paulo": "https://images.unsplash.com/photo-1505528638255-fd05908162dc?q=80&w=2670&auto=format&fit=crop",
    "Las Vegas": "https://images.unsplash.com/photo-1605836011078-71368d1638b6?q=80&w=2670&auto=format&fit=crop",
}

app = FastAPI(title="F1 View API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],  # Allow Next.js frontend and others
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Timing Middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"Request: {request.url.path} took {process_time:.4f}s")
    return response

# In-Memory Cache & Locking
session_cache = {}
data_loading_lock = Lock()

def get_cached_session(year, location, session_type):
    key = f"{year}_{location}_{session_type}"
    if key not in session_cache:
        session_cache[key] = fastf1.get_session(year, location, session_type)
    return session_cache[key]

@app.get("/")
def read_root():
    return {"message": "Welcome to F1 View API"}

@app.get("/health")
def health_check():
    return {"status": "ok", "cache_dir": CACHE_DIR}

@app.get("/api/schedule/{year}")
def get_schedule(year: int):
    try:
        schedule = fastf1.get_event_schedule(year)
        # Convert to JSON-friendly format
        # Replace NaT/NaN with None
        schedule = schedule.where(pd.notnull(schedule), None)
        
        # Select relevant columns to reduce payload size
        columns = [
            'RoundNumber', 'Country', 'Location', 'OfficialEventName', 'EventDate',
            'Session1', 'Session1Date', 'Session2', 'Session2Date',
            'Session3', 'Session3Date', 'Session4', 'Session4Date',
            'Session5', 'Session5Date'
        ]
        
        # Filter for columns that actually exist (handling older seasons vs new)
        existing_columns = [col for col in columns if col in schedule.columns]
        data = schedule[existing_columns].to_dict(orient='records')
        
        # Add images
        for event in data:
            location = event.get('Location', '')
            # Fuzzy match or direct match
            image = CIRCUIT_IMAGES.get(location, "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop")
            # Try to find partial match if direct match fails
            if location and location not in CIRCUIT_IMAGES:
                for key, url in CIRCUIT_IMAGES.items():
                    if key in location:
                        image = url
                        break
            event['Image'] = image
        
        return {"year": year, "events": data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/session/{year}/{location}/{session_type}")
def get_session_details(year: int, location: str, session_type: str):
    try:
        session = get_cached_session(year, location, session_type)
        
        # Thread-safe loading
        with data_loading_lock:
            if not getattr(session, 'basic_loaded', False):
                session.load(laps=False, telemetry=False, weather=False, messages=False)
                session.basic_loaded = True
        
        return {
            "name": session.name,
            "date": str(session.date),
            "event": session.event.OfficialEventName,
            "location": session.event.Location,
            "session_type": session_type
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/session/{year}/{location}/{session_type}/drivers")
def get_session_drivers(year: int, location: str, session_type: str):
    try:
        session = get_cached_session(year, location, session_type)
        
        with data_loading_lock:
            if not getattr(session, 'basic_loaded', False):
                session.load(laps=False, telemetry=False) 
                session.basic_loaded = True
        
        drivers = []
        if hasattr(session, 'results') and not session.results.empty:
            results = session.results
            # Replace NaT/NaN
            results = results.where(pd.notnull(results), None)
            
            for driver_number, row in results.iterrows():
                drivers.append({
                    "id": str(driver_number),
                    "number": str(row['DriverNumber']),
                    "code": row['Abbreviation'],
                    "name": row['FullName'],
                    "team": row['TeamName'],
                    "color": row['TeamColor'],
                    "position": row['Position'],
                    "time": str(row['Time']) if row['Time'] else None,
                    "status": row['Status']
                })
            
            # Sort by position
            drivers.sort(key=lambda x: x['position'] if x['position'] else 999)
        else:
            # Fallback if no results (e.g. upcoming session)
            for driver_id in session.drivers:
                driver_info = session.get_driver(driver_id)
                drivers.append({
                    "id": driver_id,
                    "number": driver_info.Abbreviation,
                    "code": driver_info.Abbreviation,
                    "name": driver_info.FullName,
                    "team": driver_info.TeamName,
                    "color": driver_info.TeamColor,
                    "position": None,
                    "time": None,
                    "status": None
                })

        return {"drivers": drivers}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/session/{year}/{location}/{session_type}/telemetry")
def get_telemetry(year: int, location: str, session_type: str, driver: str, limit: int = 1000):
    """Get telemetry data with optional limit for faster loading"""
    try:
        session = get_cached_session(year, location, session_type)
        
        with data_loading_lock:
            if not getattr(session, 'telemetry_loaded', False):
                session.load(laps=True, telemetry=True)
                session.telemetry_loaded = True
                session.basic_loaded = True # Telemetry implies basic
        
        driver_laps = session.laps.pick_driver(driver)
        if driver_laps.empty:
            return {"error": "Driver not found or no laps"}
            
        fastest_lap = driver_laps.pick_fastest()
        telemetry = fastest_lap.get_telemetry()
        
        # Downsample: Every 5th point
        telemetry = telemetry.iloc[::5]
        
        data = []
        for _, row in telemetry.iterrows():
            data.append({
                "time": row['Time'].total_seconds(),
                "distance": row['Distance'],
                "speed": row['Speed'],
                "rpm": row['RPM'],
                "gear": row['nGear'],
                "throttle": row['Throttle'],
                "brake": 100 if row['Brake'] else 0,
                "x": row['X'],
                "y": row['Y']
            })
            
        return {
            "driver_id": driver,
            "lap_time": fastest_lap['LapTime'].total_seconds(),
            "telemetry": data
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/track/{year}/{location}/{session_type}")
def get_track_data(year: int, location: str, session_type: str):
    try:
        session = get_cached_session(year, location, session_type)
        
        with data_loading_lock:
            if not getattr(session, 'telemetry_loaded', False):
                session.load(laps=True, telemetry=True)
                session.telemetry_loaded = True
                session.basic_loaded = True
        
        # Pick the fastest lap of the session to get a good reference lap for the track map
        lap = session.laps.pick_fastest()
        telemetry = lap.get_telemetry()
        
        # Downsample for map rendering: Every 20th point for faster loading
        telemetry = telemetry.iloc[::20]
        
        track_data = []
        for _, row in telemetry.iterrows():
            track_data.append({
                "x": row['X'],
                "y": row['Y'],
                "z": row['Z'],
                "speed": row['Speed']
            })
            
        return {
            "circuit_name": session.event.Location,
            "track_data": track_data
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/weather/{year}/{location}/{session_type}")
def get_weather(year: int, location: str, session_type: str):
    try:
        session = get_cached_session(year, location, session_type)
        
        with data_loading_lock:
            if not getattr(session, 'weather_loaded', False):
                session.load(laps=False, telemetry=False, weather=True, messages=False)
                session.weather_loaded = True
                session.basic_loaded = True
        
        weather_data = session.weather_data
        
        # Convert to list of dicts and handle timestamps
        data = []
        for _, row in weather_data.iterrows():
            data.append({
                "time": row['Time'].total_seconds(),
                "air_temp": row['AirTemp'],
                "track_temp": row['TrackTemp'],
                "humidity": row['Humidity'],
                "pressure": row['Pressure'],
                "rainfall": row['Rainfall'],
                "wind_speed": row['WindSpeed'],
                "wind_direction": row['WindDirection']
            })
            
        return {"weather": data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/race_control/{year}/{location}/{session_type}")
def get_race_control(year: int, location: str, session_type: str):
    try:
        session = get_cached_session(year, location, session_type)
        
        with data_loading_lock:
            if not getattr(session, 'messages_loaded', False):
                session.load(laps=False, telemetry=False, weather=False, messages=True)
                session.messages_loaded = True
                session.basic_loaded = True
        
        messages = session.session_info
        
        data = []
        # Fallback: use session status data if available
        # Let's try to return track status changes (Yellow/Red/Green flags)
        if hasattr(session, 'track_status'):
            for _, row in session.track_status.iterrows():
                status = row['Status']
                msg = "TRACK CLEAR"
                if status == '1': msg = "TRACK CLEAR"
                elif status == '2': msg = "YELLOW FLAG"
                elif status == '4': msg = "SC DEPLOYED"
                elif status == '5': msg = "RED FLAG"
                elif status == '6': msg = "VSC DEPLOYED"
                elif status == '7': msg = "VSC ENDING"
                
                data.append({
                    "time": row['Time'].total_seconds(),
                    "message": msg,
                    "flag": status
                })
                
        return {"messages": data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/stints/{year}/{location}/{session_type}")
def get_tyre_stints(year: int, location: str, session_type: str):
    try:
        session = get_cached_session(year, location, session_type)
        
        with data_loading_lock:
            if not getattr(session, 'laps_loaded', False):
                session.load(laps=True, telemetry=False)
                session.laps_loaded = True
                session.basic_loaded = True
        
        laps = session.laps
        stints = []
        
        # Group by driver and stint
        for driver in session.drivers:
            driver_laps = laps.pick_driver(driver)
            if driver_laps.empty: continue
            
            driver_stints = driver_laps.groupby('Stint')
            driver_stint_data = []
            
            for stint_id, stint_laps in driver_stints:
                compound = stint_laps['Compound'].iloc[0]
                lap_count = len(stint_laps)
                driver_stint_data.append({
                    "stint": int(stint_id),
                    "compound": compound,
                    "laps": lap_count
                })
                
            stints.append({
                "driver": driver,
                "stints": driver_stint_data
            })
            
        return {"stints": stints}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/laps/{year}/{location}/{session_type}")
def get_lap_comparison(year: int, location: str, session_type: str):
    try:
        session = get_cached_session(year, location, session_type)
        
        with data_loading_lock:
            if not getattr(session, 'laps_loaded', False):
                session.load(laps=True, telemetry=False)
                session.laps_loaded = True
                session.basic_loaded = True
        
        # Get top 3 drivers for comparison
        drivers = session.drivers[:3]
        data = []
        
        for driver in drivers:
            driver_laps = session.laps.pick_driver(driver)
            # Filter for quick laps only to reduce noise
            driver_laps = driver_laps.pick_quicklaps()
            
            laps_data = []
            for _, row in driver_laps.iterrows():
                laps_data.append({
                    "lap": int(row['LapNumber']),
                    "time": row['LapTime'].total_seconds()
                })
            
            data.append({
                "driver": driver,
                "laps": laps_data
            })
            
        return {"comparison": data}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/circuit/{year}/{location}/{session_type}")
def get_circuit_info(year: int, location: str, session_type: str):
    try:
        session = get_cached_session(year, location, session_type)
        
        return {
            "name": session.event.OfficialEventName,
            "location": session.event.Location,
            "country": session.event.Country,
            "date": str(session.event.EventDate)
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/standings/{year}")
def get_standings(year: int):
    try:
        ergast = Ergast()
        
        # Fetch Driver Standings
        drivers_data = []
        try:
            d_standings = ergast.get_driver_standings(season=year)
            if d_standings.content:
                df = d_standings.content[0]
                for _, row in df.iterrows():
                    # Handle constructor info which might be in a list or nested
                    team_name = "Unknown"
                    if 'constructorName' in row:
                        team_name = row['constructorName']
                    elif 'constructorNames' in row and row['constructorNames']: # fastf1 < 3.0
                         team_name = row['constructorNames'][0]
                    
                    drivers_data.append({
                        "pos": int(row['position']),
                        "name": f"{row['givenName']} {row['familyName']}",
                        "team": team_name, 
                        "points": float(row['points']),
                        "wins": int(row['wins']),
                        "image": DRIVER_IMAGES.get(f"{row['givenName']} {row['familyName']}", "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png")
                    })
        except Exception as e:
            print(f"Error fetching driver standings: {e}")

        # Fetch Constructor Standings
        constructors_data = []
        try:
            c_standings = ergast.get_constructor_standings(season=year)
            if c_standings.content:
                df = c_standings.content[0]
                for _, row in df.iterrows():
                    constructors_data.append({
                        "pos": int(row['position']),
                        "name": row['constructorName'],
                        "points": float(row['points']),
                        "wins": int(row['wins'])
                    })
        except Exception as e:
             print(f"Error fetching constructor standings: {e}")
        
        return {
            "year": year,
            "drivers": drivers_data,
            "constructors": constructors_data
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/rivalry/{year}")
def get_rivalry(year: int):
    try:
        ergast = Ergast()
        d_standings = ergast.get_driver_standings(season=year)
        
        if not d_standings.content:
            return {"error": "No standings data available"}
            
        df = d_standings.content[0]
        # Top 2
        top_2 = df.head(2)
        
        rivals = []
        for _, row in top_2.iterrows():
            team_name = "Unknown"
            if 'constructorName' in row:
                team_name = row['constructorName']
            elif 'constructorNames' in row and row['constructorNames']:
                    team_name = row['constructorNames'][0]

            rivals.append({
                "id": row['driverId'],
                "code": row['driverCode'], # e.g. VER
                "name": f"{row['givenName']} {row['familyName']}",
                "team": team_name,
                "points": float(row['points'])
            })
            
        return {"rivals": rivals}
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/history/{location}")
def get_history(location: str):
    try:
        # Simplified approach: Return mock data for now BUT served from backend
        # To be truly "Industry Ready", we should probably have a database of past results
        
        history = []
        if "Lusail" in location or "Qatar" in location:
             history = [
                 {"year": 2024, "driver": "Max Verstappen", "team": "Red Bull Racing", "time": "1:27:39.168"},
                 {"year": 2023, "driver": "Max Verstappen", "team": "Red Bull Racing", "time": "1:27:39.168"},
                 {"year": 2021, "driver": "Lewis Hamilton", "team": "Mercedes", "time": "1:24:28.471"}
             ]
        else:
             # Generic fallback or empty
             pass
        
        return {"history": history}
    except Exception as e:
        return {"error": str(e)}
