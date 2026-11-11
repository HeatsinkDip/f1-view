import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { LandingClient } from "@/components/landing-client";
import { selectRaceScheduleContext } from "@/lib/schedule";
import { getServerSchedule, getServerStandings } from "@/lib/server-api";
import { SITE_URL } from "@/lib/site";

export const revalidate = 1800;

export const metadata: Metadata = {
    title: "F1 View - Formula 1 Telemetry & Race Analytics",
    description:
        "Explore live Formula 1 telemetry traces, track dominance maps, tyre stint strategy, championship standings, and session replays powered by FastF1 and OpenF1.",
    alternates: {
        canonical: "/",
    },
};

    export default async function LandingPage() {
        const currentYear = new Date().getFullYear();

                    const [primaryStandings, fallbackStandings, scheduleData] = await Promise.all([
                        getServerStandings(currentYear, revalidate),
                        getServerStandings(currentYear - 1, revalidate),
                        getServerSchedule(currentYear, revalidate),
                    ]);

                        const effectiveStandings =
                            primaryStandings?.drivers && primaryStandings.drivers.length > 0
                                ? primaryStandings.drivers
                                : fallbackStandings?.drivers || [];

            const events = scheduleData?.events || [];
            const ctx = selectRaceScheduleContext(events);
            const initialNextRace = ctx.nextRace || ctx.lastCompletedRace || events[0] || null;
            const initialFeaturedRace = ctx.lastCompletedRace
                ? { year: currentYear, location: ctx.lastCompletedRace.Location }
                : events[0]
                    ? { year: currentYear, location: events[0].Location }
                    : { year: 2025, location: "Lusail" };

        const hasInitialData = effectiveStandings.length > 0 || events.length > 0;

                const structuredData = [
                {
                    "@context": "https://schema.org",
                "@type": "WebSite",
                name: "F1 View",
                url: SITE_URL,
                description:
                "Formula 1 telemetry & race analytics platform powered by FastF1, OpenF1, FastAPI, and Next.js.",
    },
                {
                    "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: "F1 View",
                applicationCategory: "SportsApplication",
                operatingSystem: "Web",
                url: SITE_URL,
                offers: {
                    "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
      },
                featureList: [
                "Formula 1 speed, throttle, brake, and RPM telemetry traces",
                "Interactive Grand Prix circuit track maps",
                "Tyre stint strategy and weather radar analytics",
                "Drivers and constructors championship standings",
                ],
    },
                ];

        return (
            <>
                <JsonLd data={structuredData} />
                <LandingClient
                    currentYear={currentYear}
                    initialStandings={effectiveStandings.slice(0, 3)}
                    initialNextRace={initialNextRace}
                    initialFeaturedRace={initialFeaturedRace}
                    hasInitialData={hasInitialData}
                />
            </>
        );
    }
