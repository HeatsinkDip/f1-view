"use client"

import { useEffect, useState } from "react"
import { getSchedule, ScheduleResponse } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, MapPin, Flag, ArrowRight, Timer, History } from "lucide-react"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { RivalryWatch } from "@/components/rivalry-watch"
import { DriverComparison } from "@/components/driver-comparison"
import { StandingsWidget } from "@/components/standings-widget"
import { CircuitGuide } from "@/components/circuit-guide"
import { HistoryExplorer } from "@/components/history-explorer"
import { WeatherDashboard } from "@/components/weather-dashboard"
import { TyreStrategy } from "@/components/tyre-strategy"
import { RaceControlFeed } from "@/components/race-control-feed"
import { DriverMarket } from "@/components/driver-market"
import { RadioHighlights } from "@/components/radio-highlights"
import { FantasyTeam } from "@/components/fantasy-team"
import { LapComparison } from "@/components/lap-comparison"
import { NewsFeed } from "@/components/news-feed"
import { NextRaceCountdown } from "@/components/next-race-countdown"
import { F1Loader } from "@/components/f1-loader"

export default function Dashboard() {
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Explicitly fetch 2025 schedule
    getSchedule(2025)
      .then(setSchedule)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black" />
        <div className="relative z-10">
          <F1Loader />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-red-500 font-mono text-xl border border-red-900/50 bg-red-950/20 p-8 rounded-xl backdrop-blur-md">
          <span className="font-bold">CRITICAL ERROR:</span> {error}
        </div>
      </div>
    )
  }

  const today = new Date();

  // Find the next race (future) - Use Session5Date (Race Time) to ensure we don't skip the current day
  const nextRace = schedule?.events.find(e => new Date(e.Session5Date!) > today);

  // Find the last completed race (past)
  const lastCompletedRace = [...(schedule?.events || [])].reverse().find(e => new Date(e.Session5Date!) <= today);

  // Determine context for data widgets
  // If next race is very close (e.g. race weekend), we might want to show it.
  // But user requested "if current not available, show last race".
  // So we default to lastCompletedRace for data-heavy widgets if nextRace hasn't started.

  // SMART SESSION DETECTION
  // Check if we are in a race weekend (e.g. nextRace exists and we are past FP1)
  let dataContextEvent = lastCompletedRace || nextRace || schedule?.events[0];
  let sessionType = "Race";

  if (nextRace) {
    // Check if any session of the upcoming race has finished
    const now = new Date();
    // Note: API returns SessionXDate. We need to check them.
    // We prioritize: Race > Qualifying > Sprint > Sprint Qualifying > FP

    if (nextRace.Session5Date && new Date(nextRace.Session5Date) < now) {
      sessionType = "Race";
      dataContextEvent = nextRace;
    } else if (nextRace.Session4Date && new Date(nextRace.Session4Date) < now) {
      sessionType = "Qualifying";
      dataContextEvent = nextRace;
    } else if (nextRace.Session3Date && new Date(nextRace.Session3Date) < now) {
      sessionType = "Sprint"; // Or Practice 3 depending on format, but let's assume Sprint for 2025 logic if present
      dataContextEvent = nextRace;
    } else if (nextRace.Session2Date && new Date(nextRace.Session2Date) < now) {
      // Could be Sprint Qualifying or FP2
      sessionType = "Practice 2"; // Simplified, or check format
      if (nextRace.EventFormat === 'sprint_qualifying') sessionType = "Sprint Qualifying";
      dataContextEvent = nextRace;
    }
    // If no session finished, we fall back to lastCompletedRace (default above)
  }

  // Enforce 2025 context
  const raceYear = 2025;
  const raceLocation = dataContextEvent?.Location || "Melbourne";

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black -z-10" />
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-600/10 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1800px] mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-zinc-800/50 pb-6 animate-fade-in">
          <div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              F1 <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">2025</span>
            </h1>
            <p className="text-zinc-400 font-mono tracking-[0.2em] uppercase text-sm mt-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              Official Season Hub
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="hidden md:flex border-zinc-800 bg-zinc-900/50 hover:bg-white hover:text-black hover:border-white transition-all duration-300 uppercase font-bold tracking-wider backdrop-blur-sm">
              <Link href="/">Exit Paddock</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>

        {/* Hero Section: Next Race Countdown & Last Race Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {/* Next Race Countdown */}
          {nextRace && (
            <div className="col-span-1 lg:col-span-2 relative group animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-blue-600/20 blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="relative bg-zinc-900/80 border border-zinc-800 rounded-3xl overflow-hidden h-full flex flex-col backdrop-blur-md shadow-2xl p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs mb-2 border border-red-500/30 bg-red-500/10 px-3 py-1 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      Next Grand Prix
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic leading-[0.9] text-white mb-1">
                      {nextRace.Location}
                    </h2>
                    <h3 className="text-xl md:text-2xl text-zinc-400 uppercase font-medium">
                      {nextRace.OfficialEventName}
                    </h3>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-sm text-zinc-500 font-mono uppercase mb-1">Race Date</div>
                    <div className="text-xl font-bold text-white">
                      {new Date(nextRace.EventDate).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col md:flex-row items-center gap-8">
                  <NextRaceCountdown targetDate={nextRace.Session5Date || nextRace.EventDate} />

                  <Button asChild size="lg" className="w-full md:w-auto bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-wider skew-x-[-10deg] ml-auto">
                    <Link href={`/session/2025/${encodeURIComponent(nextRace.Location)}/Race`} className="skew-x-[10deg]">
                      Race Hub <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Last Race Context */}
          {lastCompletedRace && (
            <div className="col-span-1 relative group animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-zinc-800/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden h-full flex flex-col backdrop-blur-sm p-6">
                <div className="flex items-center gap-2 text-zinc-500 font-bold uppercase tracking-widest text-xs mb-4">
                  <History className="w-4 h-4" />
                  Latest Results
                </div>
                <h3 className="text-2xl font-black uppercase italic text-white mb-1">
                  {lastCompletedRace.Location}
                </h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Analyzing data from the last completed session.
                </p>

                <div className="mt-auto">
                  <div className="p-4 bg-zinc-950/50 rounded-xl border border-zinc-800 mb-4">
                    <div className="text-xs text-zinc-500 uppercase mb-1">Winner</div>
                    <div className="font-bold text-lg text-white">Max Verstappen</div>
                    <div className="text-xs text-zinc-600">Red Bull Racing</div>
                  </div>
                  <Button asChild variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 hover:text-white uppercase font-bold text-xs">
                    <Link href={`/session/2025/${encodeURIComponent(lastCompletedRace.Location)}/Race`}>
                      View Full Analysis
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Grid - Powered by Last Completed Race Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">

          {/* Standings Widget */}
          <div className="col-span-1 row-span-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <StandingsWidget />
          </div>

          {/* Weather Dashboard */}
          <div className="col-span-1 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <WeatherDashboard year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          {/* Circuit Guide */}
          <div className="col-span-1 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <CircuitGuide year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          {/* Driver Comparison */}
          <div className="col-span-1 md:col-span-2 animate-slide-up" style={{ animationDelay: '0.6s' }}>
            <DriverComparison year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          {/* Tyre Strategy */}
          <div className="col-span-1 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <TyreStrategy year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          {/* Race Control Feed */}
          <div className="col-span-1 animate-slide-up" style={{ animationDelay: '0.8s' }}>
            <RaceControlFeed year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          {/* Lap Comparison */}
          <div className="col-span-1 md:col-span-2 animate-slide-up" style={{ animationDelay: '0.9s' }}>
            <LapComparison year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          {/* History Explorer */}
          <div className="col-span-1 animate-slide-up" style={{ animationDelay: '1.0s' }}>
            <HistoryExplorer />
          </div>

          {/* Driver Market */}
          <div className="col-span-1 animate-slide-up" style={{ animationDelay: '1.1s' }}>
            <DriverMarket />
          </div>

          {/* Radio Highlights */}
          <div className="col-span-1 animate-slide-up" style={{ animationDelay: '1.2s' }}>
            <RadioHighlights />
          </div>

          {/* Fantasy Team */}
          <div className="col-span-1 animate-slide-up" style={{ animationDelay: '1.3s' }}>
            <FantasyTeam />
          </div>

          {/* News Feed */}
          <div className="col-span-1 animate-slide-up" style={{ animationDelay: '1.4s' }}>
            <NewsFeed />
          </div>

          {/* Rivalry Watch */}
          <div className="col-span-1 animate-slide-up" style={{ animationDelay: '1.5s' }}>
            <RivalryWatch />
          </div>

        </div>

        {/* Schedule List - Vertical Timeline */}
        <div className="max-w-5xl mx-auto mt-24 animate-fade-in" style={{ animationDelay: '1.6s' }}>
          <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-12 flex items-center gap-4 border-b border-zinc-800 pb-6">
            <Flag className="w-8 h-8 text-red-600" />
            Season Timeline
          </h3>

          <div className="relative border-l-2 border-zinc-800 ml-4 space-y-12 pb-12">
            {schedule?.events.map((event, index) => {
              const isPast = new Date(event.EventDate) < today;
              const isNext = event.RoundNumber === nextRace?.RoundNumber;

              if (isNext) return null;

              return (
                <div key={event.RoundNumber} className="relative pl-12 group">
                  {/* Timeline Dot */}
                  <div className={`absolute left-[-9px] top-6 w-4 h-4 rounded-full border-4 border-zinc-950 ${isPast ? 'bg-zinc-700' : 'bg-red-600'} transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]`} />

                  <div className={`flex flex-col md:flex-row md:items-center gap-6 p-8 bg-zinc-900/30 border border-zinc-800/50 rounded-2xl hover:bg-zinc-900 hover:border-zinc-600 transition-all duration-300 ${isPast ? 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0' : ''}`}>

                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded">R{event.RoundNumber}</span>
                        {isPast && <Badge variant="secondary" className="text-[10px] bg-zinc-800 text-zinc-400">COMPLETED</Badge>}
                      </div>
                      <h4 className="text-3xl font-black uppercase italic tracking-tight group-hover:text-red-500 transition-colors duration-300">
                        {event.Location}
                      </h4>
                      <div className="text-lg text-zinc-400 font-medium mt-1">
                        {event.OfficialEventName}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-zinc-500 font-mono border-l border-zinc-800 pl-6">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-4 h-4 text-zinc-400" />
                        {new Date(event.EventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-zinc-400" />
                        {event.Country}
                      </div>
                    </div>

                    <Button asChild size="lg" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-20px] group-hover:translate-x-0 ml-auto hover:bg-red-600 hover:text-white uppercase font-bold tracking-wider">
                      <Link href={`/session/2025/${encodeURIComponent(event.Location)}/Race`}>
                        View Session <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
