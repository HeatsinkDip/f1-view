import type { Event } from "@/lib/api";

export function getRaceTimestamp(event: Event): Date {
  return new Date(event.Session5DateUtc || event.Session5Date || event.EventDate);
}

export interface ScheduleContext {
  nextRace?: Event;
  lastCompletedRace?: Event;
  dataContextEvent?: Event;
  sessionType: string;
}

/** Resolve upcoming, last completed, and active telemetry context event from a season schedule. */
export function selectRaceScheduleContext(
  events: Event[],
  now: Date = new Date()
): ScheduleContext {
  const upcoming = events.find((event) => getRaceTimestamp(event) > now);
  const completed = [...events].reverse().find((event) => getRaceTimestamp(event) <= now);

  let dataContextEvent = completed || upcoming || events[0];
  let sessionType = "Race";

  if (upcoming) {
    const s5 = upcoming.Session5DateUtc || upcoming.Session5Date;
    const s4 = upcoming.Session4DateUtc || upcoming.Session4Date;
    const s3 = upcoming.Session3DateUtc || upcoming.Session3Date;
    const s2 = upcoming.Session2DateUtc || upcoming.Session2Date;

    if (s5 && new Date(s5) < now) {
      sessionType = "Race";
      dataContextEvent = upcoming;
    } else if (s4 && new Date(s4) < now) {
      sessionType = "Qualifying";
      dataContextEvent = upcoming;
    } else if (s3 && new Date(s3) < now) {
      sessionType =
        upcoming.Session3 || (upcoming.EventFormat?.includes("sprint") ? "Sprint" : "Practice 3");
      dataContextEvent = upcoming;
    } else if (s2 && new Date(s2) < now) {
      sessionType =
        upcoming.Session2 ||
        (upcoming.EventFormat === "sprint_qualifying" ? "Sprint Qualifying" : "Practice 2");
      dataContextEvent = upcoming;
    }
  }

  return {
    nextRace: upcoming,
    lastCompletedRace: completed,
    dataContextEvent,
    sessionType,
  };
}

