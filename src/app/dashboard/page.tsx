import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard-client";
import { JsonLd } from "@/components/json-ld";
import { selectRaceScheduleContext } from "@/lib/schedule";
import { getServerSchedule, getServerSessionDrivers } from "@/lib/server-api";
import { buildPageSocialMetadata, SITE_URL } from "@/lib/site";

export const revalidate = 900;

const DASHBOARD_TITLE = "Live Season Dashboard & Race Telemetry Hub";
const DASHBOARD_DESCRIPTION =
  "Full Formula 1 season schedule, driver standings, weather radar, tyre stint strategy, lap comparison, and race control feed powered by FastF1 and OpenF1.";

export const metadata: Metadata = {
  title: DASHBOARD_TITLE,
  description: DASHBOARD_DESCRIPTION,
  ...buildPageSocialMetadata({
    title: DASHBOARD_TITLE,
    description: DASHBOARD_DESCRIPTION,
    path: "/dashboard",
  }),
};

export default async function DashboardPage() {
  const initialYear = new Date().getFullYear();
  const initialSchedule = await getServerSchedule(initialYear, revalidate);
  const events = initialSchedule?.events || [];
  const { lastCompletedRace } = selectRaceScheduleContext(events);

        let initialWinnerDriver = null;
        let initialWinnerKey: string | null = null;
        if (lastCompletedRace) {
          const drivers = await getServerSessionDrivers(
            initialYear,
            lastCompletedRace.Location,
            "Race",
            revalidate
          );
          if (drivers && drivers.length > 0) {
            initialWinnerDriver = drivers[0];
            initialWinnerKey = `winner:${initialYear}:${lastCompletedRace.Location}`;
          }
    }

    return (
      <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${initialYear} Formula 1 Season Telemetry Dashboard`,
          url: `${SITE_URL}/dashboard`,
          description:
            "Interactive Formula 1 season timeline, live standings, weather analytics, tyre strategies, and Grand Prix session hubs.",
        }}
      />
      <DashboardClient
        initialYear={initialYear}
        initialSchedule={initialSchedule}
        initialWinnerDriver={initialWinnerDriver}
        initialWinnerKey={initialWinnerKey}
      />
    </>
  );
  }
