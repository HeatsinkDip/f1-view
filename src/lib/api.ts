// Use environment variable for API URL, with fallback for local development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

export interface Event {
    RoundNumber: number;
    Country: string;
    Location: string;
    OfficialEventName: string;
    EventDate: string;
    Session1: string;
    Session1Date: string;
    Session2: string;
    Session2Date: string;
    Session3: string;
    Session3Date: string;
    Session4: string;
    Session4Date: string;
    Session5: string;
    Session5Date?: string;
    EventFormat?: string;
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
}

export interface SessionDetails {
    name: string;
    date: string;
    event: string;
    location: string;
    session_type: string;
}

export async function getSchedule(year: number): Promise<ScheduleResponse> {
    const res = await fetch(`${API_BASE_URL}/schedule/${year}`);
    if (!res.ok) throw new Error('Failed to fetch schedule');
    return res.json();
}

export async function getSessionDetails(year: number, location: string, sessionType: string): Promise<SessionDetails> {
    const res = await fetch(`${API_BASE_URL}/session/${year}/${location}/${sessionType}`);
    if (!res.ok) throw new Error('Failed to fetch session details');
    return res.json();
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
    lap_time: number;
    telemetry: TelemetryPoint[];
}

export async function getDriverTelemetry(year: number, location: string, sessionType: string, driverId: string): Promise<{ telemetry: TelemetryPoint[] }> {
    const response = await fetch(`${API_BASE_URL}/session/${year}/${encodeURIComponent(location)}/${sessionType}/telemetry?driver=${driverId}`);
    if (!response.ok) throw new Error('Failed to fetch telemetry');
    return response.json();
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
}

export async function getTrackData(year: number, location: string, sessionType: string) {
    const response = await fetch(`${API_BASE_URL}/track/${year}/${location}/${sessionType}`);
    if (!response.ok) {
        throw new Error('Failed to fetch track data');
    }
    return response.json();
}

export async function getWeather(year: number, location: string, sessionType: string) {
    const response = await fetch(`${API_BASE_URL}/weather/${year}/${location}/${sessionType}`);
    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }
    return response.json();
}

export async function getRaceControl(year: number, location: string, sessionType: string) {
    const response = await fetch(`${API_BASE_URL}/race_control/${year}/${location}/${sessionType}`);
    if (!response.ok) {
        throw new Error('Failed to fetch race control messages');
    }
    return response.json();
}

export async function getTyreStints(year: number, location: string, sessionType: string) {
    const response = await fetch(`${API_BASE_URL}/stints/${year}/${location}/${sessionType}`);
    if (!response.ok) {
        throw new Error('Failed to fetch tyre stints');
    }
    return response.json();
}

export async function getLapComparison(year: number, location: string, sessionType: string) {
    const response = await fetch(`${API_BASE_URL}/laps/${year}/${location}/${sessionType}`);
    if (!response.ok) {
        throw new Error('Failed to fetch lap comparison data');
    }
    return response.json();
}

export async function getCircuitInfo(year: number, location: string, sessionType: string) {
    const response = await fetch(`${API_BASE_URL}/circuit/${year}/${location}/${sessionType}`);
    if (!response.ok) {
        throw new Error('Failed to fetch circuit info');
    }
    return response.json();
}

export async function getStandings(year: number) {
    const response = await fetch(`${API_BASE_URL}/standings/${year}`);
    if (!response.ok) {
        throw new Error('Failed to fetch standings');
    }
    return response.json();
}

export async function getRivalry(year: number) {
    const response = await fetch(`${API_BASE_URL}/rivalry/${year}`);
    if (!response.ok) {
        throw new Error('Failed to fetch rivalry data');
    }
    return response.json();
}

export async function getHistory(location: string) {
    const response = await fetch(`${API_BASE_URL}/history/${location}`);
    if (!response.ok) {
        throw new Error('Failed to fetch history data');
    }
    return response.json();
}

export async function getSessionDrivers(year: number, location: string, sessionType: string): Promise<Driver[]> {
    const res = await fetch(`${API_BASE_URL}/session/${year}/${location}/${sessionType}/drivers`);
    if (!res.ok) throw new Error('Failed to fetch drivers');
    const data = await res.json();
    return data.drivers;
}
