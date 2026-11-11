import {
  toHighResDriverImage,
  type Driver,
  type ScheduleResponse,
  type SessionDetails,
  type StandingsResponse,
  type TrackResponse,
} from "@/lib/api";

const DEFAULT_SERVER_API_BASE = "https://f1-view-backendservice.onrender.com/api";

function getServerApiBase(): string {
  const raw = (
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_SERVER_API_BASE
  ).replace(/\/+$/, "");
  return raw.endsWith("/api") ? raw : `${raw}/api`;
}

async function fetchServerJson<T>(path: string, revalidate = 1800): Promise<T | null> {
  const url = `${getServerApiBase()}${path}`;
  try {
    const res = await fetch(url, {
      next: { revalidate },
      signal: AbortSignal.timeout(3500),
    });
    if (!res.ok) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getServerSchedule(
  year: number,
  revalidate = 1800
): Promise<ScheduleResponse | null> {
  return fetchServerJson<ScheduleResponse>(`/schedule/${year}`, revalidate);
}

export async function getServerStandings(
  year: number,
  revalidate = 1800
): Promise<StandingsResponse | null> {
  const data = await fetchServerJson<StandingsResponse>(`/standings/${year}`, revalidate);
  if (!data) {
    return null;
  }
  return {
    ...data,
    drivers: (data.drivers || []).map((driver) => ({
      ...driver,
      image: toHighResDriverImage(driver.image),
    })),
  };
}

export async function getServerSessionDetails(
  year: number,
  location: string,
  sessionType: string,
  revalidate = 3600
): Promise<SessionDetails | null> {
  return fetchServerJson<SessionDetails>(
    `/session/${year}/${encodeURIComponent(location)}/${encodeURIComponent(sessionType)}`,
    revalidate
  );
}

export async function getServerSessionDrivers(
  year: number,
  location: string,
  sessionType: string,
  revalidate = 3600
): Promise<Driver[] | null> {
  const data = await fetchServerJson<{ drivers?: Driver[] }>(
    `/session/${year}/${encodeURIComponent(location)}/${encodeURIComponent(sessionType)}/drivers`,
    revalidate
  );
  if (!data) {
    return null;
  }
  return (data.drivers || []).map((driver) => ({
    ...driver,
    image: toHighResDriverImage(driver.image),
  }));
}

export async function getServerTrackData(
  year: number,
  location: string,
  sessionType: string,
  revalidate = 3600
): Promise<TrackResponse | null> {
  return fetchServerJson<TrackResponse>(
    `/track/${year}/${encodeURIComponent(location)}/${encodeURIComponent(sessionType)}`,
    revalidate
  );
}

