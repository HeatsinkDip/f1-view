import type { MetadataRoute } from "next";
import { getServerSchedule } from "@/lib/server-api";
import { SITE_URL } from "@/lib/site";

  export const revalidate = 3600;

  export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const lastModified = new Date();
    const currentYear = lastModified.getFullYear();

  const staticRoutes: MetadataRoute.Sitemap = [
      {
        url: SITE_URL,
        lastModified,
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${SITE_URL}/dashboard`,
        lastModified,
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${SITE_URL}/privacy`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.3,
      },
      {
        url: `${SITE_URL}/terms`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.3,
      },
    ];

    const seasonYears = [currentYear, currentYear - 1];
    const schedules = await Promise.all(
      seasonYears.map((yr) => getServerSchedule(yr, revalidate))
    );

    const seenUrls = new Set<string>(staticRoutes.map((entry) => entry.url));
    const sessionRoutes: MetadataRoute.Sitemap = [];

    schedules.forEach((schedule, index) => {
      const seasonYear = seasonYears[index];
      for (const event of schedule?.events || []) {
        if (!event.Location) continue;
        for (const sessionType of ["Race", "Qualifying"] as const) {
          const url = `${SITE_URL}/session/${seasonYear}/${encodeURIComponent(event.Location)}/${sessionType}`;
          if (seenUrls.has(url)) continue;
          seenUrls.add(url);
          sessionRoutes.push({
            url,
            lastModified,
            changeFrequency: "weekly",
            priority: sessionType === "Race" ? 0.8 : 0.7,
          });
        }
      }
    });

    return [...staticRoutes, ...sessionRoutes];
  }
