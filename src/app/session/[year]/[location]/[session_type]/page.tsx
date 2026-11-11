import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { SessionBundle, SessionClient } from "@/components/session-client";
import {
  getServerSessionDetails,
  getServerSessionDrivers,
  getServerTrackData,
} from "@/lib/server-api";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

interface SessionRouteParams {
  year: string;
  location: string;
  session_type: string;
}

function decodeSegment(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function parseSessionParams(params: SessionRouteParams) {
  const year = parseInt(params.year, 10);
  const location = decodeSegment(params.location || "");
  const sessionType = decodeSegment(params.session_type || "Race");
  const valid = !Number.isNaN(year) && year >= 1950 && year <= 2035 && Boolean(location);
  const canonicalPath = `/session/${year}/${encodeURIComponent(location)}/${encodeURIComponent(sessionType)}`;
  return { year, location, sessionType, valid, canonicalPath };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<SessionRouteParams>;
}): Promise<Metadata> {
  const resolved = await params;
  const { year, location, sessionType, valid, canonicalPath } = parseSessionParams(resolved);

  if (!valid) {
    return {
      title: "Session Telemetry",
      description: "Interactive Formula 1 session telemetry and lap analysis.",
      robots: { index: false, follow: false },
    };
  }

  const sessionDetails = await getServerSessionDetails(year, location, sessionType, revalidate);
  const eventTitle = sessionDetails?.event_name || `${location} Grand Prix`;
  const title = `${year} ${eventTitle} ${sessionType} Telemetry & Lap Analysis`;
  const description = `Analyze ${year} ${eventTitle} ${sessionType} speed, throttle, brake traces, track map, tyre stints, weather radar, and team radio on F1 View.`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: `${SITE_URL}${canonicalPath}`,
      title: `${title} | F1 View`,
      description,
    },
  };
}

export default async function SessionPage({
  params,
}: {
  params: Promise<SessionRouteParams>;
}) {
  const resolved = await params;
  const { year, location, sessionType, valid, canonicalPath } = parseSessionParams(resolved);

  let initialBundle: SessionBundle | null = null;
  let initialSessionKey: string | null = null;

  if (valid) {
    const [sessionData, driversData, track] = await Promise.all([
      getServerSessionDetails(year, location, sessionType, revalidate),
      getServerSessionDrivers(year, location, sessionType, revalidate),
      getServerTrackData(year, location, sessionType, revalidate),
    ]);
    if (sessionData && driversData) {
      initialBundle = {
        session: sessionData,
        drivers: driversData,
        trackData: track?.track_data || [],
      };
      initialSessionKey = `${year}:${location}:${sessionType}`;
    }
  }

  const eventName = initialBundle?.session?.event_name || `${year} ${location} Grand Prix`;

  return (
    <>
      {valid && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SportsEvent",
            name: `${eventName} - ${sessionType}`,
            sport: "Formula 1",
            url: `${SITE_URL}${canonicalPath}`,
            location: {
              "@type": "Place",
              name: initialBundle?.session?.location || location,
            },
            ...(initialBundle?.session?.date ? { startDate: initialBundle.session.date } : {}),
          }}
        />
      )}
      <SessionClient
        year={year}
        location={location}
        sessionType={sessionType}
        initialBundle={initialBundle}
        initialSessionKey={initialSessionKey}
      />
    </>
  );
}
