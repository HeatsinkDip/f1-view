// Normalize base URL so both `http://localhost:8001` and `http://localhost:8001/api` work cleanly.
function normalizeApiBase(rawUrl: string): string {
    const trimmed = rawUrl.replace(/\/+$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

const API_BASE_URL = normalizeApiBase(
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'
);
const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api$/, '');

async function apiFetch<T>(url: string, init?: RequestInit, fallbackMsg = 'Request failed'): Promise<T> {
    const res = await fetch(url, init);
    if (!res.ok) {
        let detail = fallbackMsg;
        try {
            const payload = await res.json();
            if (typeof payload?.detail === 'string') {
                detail = payload.detail;
            } else if (typeof payload?.message === 'string') {
                detail = payload.message;
            } else if (typeof payload?.error === 'string') {
                detail = payload.error;
            }
        } catch {
            // Keep fallback message when response body is not JSON.
        }
        throw new Error(detail);
    }
    return res.json();
}

function sessionPath(prefix: string, year: number, location: string, sessionType: string): string {
    return `${API_BASE_URL}/${prefix}/${year}/${encodeURIComponent(location)}/${encodeURIComponent(sessionType)}`;
}

export interface Event {
    RoundNumber: number;
    Country: string;
    Location: string;
    OfficialEventName: string;
    EventName?: string;
    EventDate: string;
    Session1: string;
    Session1Date: string;
    Session1DateUtc?: string;
    Session2: string;
    Session2Date: string;
    Session2DateUtc?: string;
    Session3: string;
    Session3Date: string;
    Session3DateUtc?: string;
    Session4: string;
    Session4Date: string;
    Session4DateUtc?: string;
    Session5: string;
    Session5Date?: string;
    Session5DateUtc?: string;
    EventFormat?: string;
    Image?: string;
}

export interface ScheduleResponse {
    year: number;
    events: Event[];
}

export interface Driver {
    id: string;
    number: string;
    code: string;
    name: string;
    team: string;
    color: string;
    position?: number;
    time?: string;
    status?: string;
    image?: string;
}

export interface SessionDetails {
    name: string;
    date: string;
    event: string;
    event_name?: string;
    location: string;
    country?: string;
    round_number?: number;
    event_format?: string;
    session_type: string;
    available_sessions?: string[];
    source?: string;
}

export interface TelemetryPoint {
    time: number;
    distance: number;
    speed: number;
    rpm: number;
    gear: number;
    throttle: number;
    brake: number;
    x: number;
    y: number;
}

export interface TelemetryResponse {
    driver_id: string;
    driver_code?: string;
    lap_number?: number | null;
    lap_time: number | null;
    telemetry: TelemetryPoint[];
    source?: string;
}

export interface TrackPoint {
    x: number;
    y: number;
    z: number;
    speed?: number;
}

export interface TrackResponse {
    circuit_name: string;
    track_data: TrackPoint[];
    source?: string;
    rotation?: number;
    corners_count?: number;
    circuit_key?: number;
}

export interface WeatherPoint {
    time: number;
    air_temp: number | null;
    track_temp: number | null;
    humidity: number | null;
    pressure: number | null;
    rainfall: boolean;
    wind_speed: number | null;
    wind_direction: number | null;
}

export interface WeatherResponse {
    weather: WeatherPoint[];
}

export interface RaceControlMessage {
    time: string;
    utc?: string;
    category?: string;
    message: string;
    flag?: string;
    scope?: string;
    sector?: number | null;
    lap?: number | null;
}

export interface RaceControlResponse {
    messages: RaceControlMessage[];
}

export interface TyreStint {
    stint: number;
    compound: string;
    laps: number;
    lap_start?: number;
    lap_end?: number;
}

export interface DriverStints {
    driver: string;
    number?: string;
    name?: string;
    team?: string;
    color: string;
    position?: number;
    total_laps: number;
    race_laps?: number;
    stints: TyreStint[];
}

export interface StintsResponse {
    stints: DriverStints[];
}

export interface LapPoint {
    lap: number;
    time: number;
}

export interface LapComparisonDriver {
    driver: string;
    name?: string;
    color: string;
    laps: LapPoint[];
}

export interface LapComparisonResponse {
    comparison: LapComparisonDriver[];
}

export interface CircuitCorner {
    number: string | number;
    letter?: string;
    angle?: number;
    distance?: number;
    x?: number;
    y?: number;
}

export interface CircuitInfoResponse {
    name: string;
    event_name?: string;
    location: string;
    country: string;
    date: string;
    length_km: number;
    corners_count: number;
    rotation?: number;
    corners: CircuitCorner[];
}

export interface TeamRadioClip {
    driver_code: string;
    driver_name: string;
    driver_number: string;
    team: string;
    color: string;
    time: string;
    date: string;
    recording_url: string;
}

export interface TeamRadioResponse {
    radios: TeamRadioClip[];
}

export interface DriverStanding {
    pos: number;
    driverId: string;
    code: string;
    name: string;
    team: string;
    color: string;
    points: number;
    wins: number;
    image: string;
}

export interface ConstructorStanding {
    pos: number;
    name: string;
    color: string;
    points: number;
    wins: number;
}

export interface StandingsResponse {
    year: number;
    drivers: DriverStanding[];
    constructors: ConstructorStanding[];
}

export interface RivalryDriver {
    id: string;
    code: string;
    name: string;
    team: string;
    color: string;
    points: number;
    wins: number;
    image: string;
}

export interface RivalryResponse {
    rivals: RivalryDriver[];
}

export interface HistoryEntry {
    year: number;
    driver: string;
    code: string;
    team: string;
    time: string;
}

export interface HistoryResponse {
    location: string;
    history: HistoryEntry[];
}

export interface HealthResponse {
    status: string;
    fastf1_version?: string;
    f1_authenticated?: boolean;
    fallback_provider?: string;
}

export interface AuthStatusResponse {
    authenticated: boolean;
    username?: string | null;
    fastf1_version?: string;
    message?: string;
}

export async function getHealth(): Promise<HealthResponse> {
    return apiFetch<HealthResponse>(`${BACKEND_ORIGIN}/health`, undefined, 'Failed to check backend health');
}

export async function getAuthStatus(): Promise<AuthStatusResponse> {
    return apiFetch<AuthStatusResponse>(`${API_BASE_URL}/auth/status`, undefined, 'Failed to check F1TV auth status');
}

export async function loginF1(username: string, password: string): Promise<AuthStatusResponse> {
    return apiFetch<AuthStatusResponse>(
        `${API_BASE_URL}/auth/login`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        },
        'Failed to authenticate with F1TV'
    );
}

export async function logoutF1(): Promise<AuthStatusResponse> {
    return apiFetch<AuthStatusResponse>(
        `${API_BASE_URL}/auth/logout`,
        { method: 'POST' },
        'Failed to clear F1TV session'
    );
}

export async function getSchedule(year: number, includeTesting = false): Promise<ScheduleResponse> {
    const query = includeTesting ? '?include_testing=true' : '';
    return apiFetch<ScheduleResponse>(
        `${API_BASE_URL}/schedule/${year}${query}`,
        undefined,
        'Failed to fetch schedule'
    );
}

export async function getSessionDetails(year: number, location: string, sessionType: string): Promise<SessionDetails> {
    return apiFetch<SessionDetails>(
        sessionPath('session', year, location, sessionType),
        undefined,
        'Failed to fetch session details'
    );
}

export async function getSessionDrivers(year: number, location: string, sessionType: string): Promise<Driver[]> {
    const data = await apiFetch<{ drivers: Driver[] }>(
        `${sessionPath('session', year, location, sessionType)}/drivers`,
        undefined,
        'Failed to fetch drivers'
    );
    return data.drivers;
}

export async function getDriverTelemetry(
    year: number,
    location: string,
    sessionType: string,
    driverId: string,
    limit = 300
): Promise<TelemetryResponse> {
    const params = new URLSearchParams();
    if (driverId) params.set('driver', driverId);
    if (limit) params.set('limit', String(limit));
    return apiFetch<TelemetryResponse>(
        `${sessionPath('session', year, location, sessionType)}/telemetry?${params.toString()}`,
        undefined,
        'Failed to fetch telemetry'
    );
}

export async function getTrackData(year: number, location: string, sessionType: string): Promise<TrackResponse> {
    return apiFetch<TrackResponse>(
        sessionPath('track', year, location, sessionType),
        undefined,
        'Failed to fetch track data'
    );
}

export async function getWeather(year: number, location: string, sessionType: string): Promise<WeatherResponse> {
    return apiFetch<WeatherResponse>(
        sessionPath('weather', year, location, sessionType),
        undefined,
        'Failed to fetch weather data'
    );
}

export async function getRaceControl(year: number, location: string, sessionType: string): Promise<RaceControlResponse> {
    return apiFetch<RaceControlResponse>(
        sessionPath('race_control', year, location, sessionType),
        undefined,
        'Failed to fetch race control messages'
    );
}

export async function getTyreStints(year: number, location: string, sessionType: string): Promise<StintsResponse> {
    return apiFetch<StintsResponse>(
        sessionPath('stints', year, location, sessionType),
        undefined,
        'Failed to fetch tyre stints'
    );
}

export async function getLapComparison(year: number, location: string, sessionType: string): Promise<LapComparisonResponse> {
    return apiFetch<LapComparisonResponse>(
        sessionPath('laps', year, location, sessionType),
        undefined,
        'Failed to fetch lap comparison data'
    );
}

export async function getCircuitInfo(year: number, location: string, sessionType: string): Promise<CircuitInfoResponse> {
    return apiFetch<CircuitInfoResponse>(
        sessionPath('circuit', year, location, sessionType),
        undefined,
        'Failed to fetch circuit info'
    );
}

export async function getTeamRadio(year: number, location: string, sessionType: string): Promise<TeamRadioResponse> {
    return apiFetch<TeamRadioResponse>(
        sessionPath('radio', year, location, sessionType),
        undefined,
        'Failed to fetch team radio'
    );
}

export async function getStandings(year: number): Promise<StandingsResponse> {
    return apiFetch<StandingsResponse>(
        `${API_BASE_URL}/standings/${year}`,
        undefined,
        'Failed to fetch standings'
    );
}

export async function getRivalry(year: number): Promise<RivalryResponse> {
    return apiFetch<RivalryResponse>(
        `${API_BASE_URL}/rivalry/${year}`,
        undefined,
        'Failed to fetch rivalry data'
    );
}

export async function getHistory(location: string): Promise<HistoryResponse> {
    return apiFetch<HistoryResponse>(
        `${API_BASE_URL}/history/${encodeURIComponent(location)}`,
        undefined,
        'Failed to fetch history data'
    );
}
