"use client"

import { useEffect, useMemo, useState } from "react"
import {
  getSchedule,
  getSessionDrivers,
  getAuthStatus,
  loginF1,
  logoutF1,
  ScheduleResponse,
  Driver,
  AuthStatusResponse,
  Event,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, MapPin, Flag, ArrowRight, History, ShieldCheck, KeyRound, X } from "lucide-react"
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

const CURRENT_YEAR = new Date().getFullYear()
const SEASON_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2, CURRENT_YEAR - 3]

function getRaceTimestamp(ev: Event): Date {
  return new Date(ev.Session5DateUtc || ev.Session5Date || ev.EventDate)
}

export default function Dashboard() {
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR)
  const [schedule, setSchedule] = useState<ScheduleResponse | null>(null)
  const [winnerDriver, setWinnerDriver] = useState<Driver | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatusResponse | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [f1Email, setF1Email] = useState("")
  const [f1Password, setF1Password] = useState("")
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAuthStatus().then(setAuthStatus).catch(() => null)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    setWinnerDriver(null)

    getSchedule(selectedYear)
      .then((data) => {
        if (active) setSchedule(data)
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load schedule")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [selectedYear])

  const { nextRace, lastCompletedRace, dataContextEvent, sessionType } = useMemo(() => {
    const now = new Date()
    const events = schedule?.events || []
    const upcoming = events.find((e) => getRaceTimestamp(e) > now)
    const completed = [...events].reverse().find((e) => getRaceTimestamp(e) <= now)

    let ctx = completed || upcoming || events[0]
    let sess = "Race"

    if (upcoming) {
      const s5 = upcoming.Session5DateUtc || upcoming.Session5Date
      const s4 = upcoming.Session4DateUtc || upcoming.Session4Date
      const s3 = upcoming.Session3DateUtc || upcoming.Session3Date
      const s2 = upcoming.Session2DateUtc || upcoming.Session2Date

      if (s5 && new Date(s5) < now) {
        sess = "Race"
        ctx = upcoming
      } else if (s4 && new Date(s4) < now) {
        sess = "Qualifying"
        ctx = upcoming
      } else if (s3 && new Date(s3) < now) {
        sess = upcoming.Session3 || (upcoming.EventFormat?.includes("sprint") ? "Sprint" : "Practice 3")
        ctx = upcoming
      } else if (s2 && new Date(s2) < now) {
        sess = upcoming.Session2 || (upcoming.EventFormat === "sprint_qualifying" ? "Sprint Qualifying" : "Practice 2")
        ctx = upcoming
      }
    }

    return {
      nextRace: upcoming,
      lastCompletedRace: completed,
      dataContextEvent: ctx,
      sessionType: sess,
    }
  }, [schedule])

  useEffect(() => {
    if (!lastCompletedRace) {
      setWinnerDriver(null)
      return
    }
    let active = true
    getSessionDrivers(selectedYear, lastCompletedRace.Location, "Race")
      .then((drivers) => {
        if (active && drivers.length > 0) {
          setWinnerDriver(drivers[0])
        }
      })
      .catch(() => {
        if (active) setWinnerDriver(null)
      })
    return () => { active = false }
  }, [selectedYear, lastCompletedRace])

  const handleF1Login = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthSubmitting(true)
    setAuthError(null)
    try {
      const res = await loginF1(f1Email, f1Password)
      setAuthStatus(res)
      setF1Password("")
      setShowAuthModal(false)
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleF1Logout = async () => {
    setAuthSubmitting(true)
    try {
      const res = await logoutF1()
      setAuthStatus(res)
    } finally {
      setAuthSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-background to-background dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
        <div className="relative z-10">
          <F1Loader />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-6">
        <div className="text-red-700 dark:text-red-400 font-mono text-lg border border-red-500/30 bg-red-500/10 p-8 rounded-xl backdrop-blur-md max-w-xl text-center space-y-4">
          <div>
            <span className="font-bold">BACKEND CONNECTION ERROR:</span> {error}
          </div>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-red-500/40 text-red-700 dark:text-red-400 hover:bg-red-500/15"
          >
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  const today = new Date()
  const raceYear = selectedYear
  const raceLocation = dataContextEvent?.Location || "Melbourne"
  const availableLocations = (schedule?.events || []).map((e) => e.Location)

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/40 via-background to-background dark:from-zinc-900 dark:via-zinc-950 dark:to-black -z-10" />
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-red-600/5 dark:from-red-600/10 to-transparent -z-10 pointer-events-none" />

      <div className="max-w-[1800px] mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6 animate-fade-in">
          <div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">
              F1 <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.35)]">{raceYear}</span>
            </h1>
            <p className="text-muted-foreground font-mono tracking-[0.2em] uppercase text-sm mt-2 flex items-center gap-2 flex-wrap">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
              Official Season Hub · Context: {raceLocation} ({sessionType})
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={String(selectedYear)}
              onValueChange={(val) => setSelectedYear(parseInt(val, 10))}
            >
              <SelectTrigger className="w-[130px] border-border bg-card font-mono font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEASON_OPTIONS.map((yr) => (
                  <SelectItem key={yr} value={String(yr)} className="font-mono">
                    {yr} Season
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAuthModal((prev) => !prev)}
              className={`border-border bg-card text-xs font-mono uppercase ${
                authStatus?.authenticated ? "text-emerald-700 dark:text-green-400 border-emerald-600/40 dark:border-green-900/60" : "text-muted-foreground"
              }`}
            >
              {authStatus?.authenticated ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> F1TV Connected
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" /> OpenF1 + FastF1
                </>
              )}
            </Button>

            <Button asChild variant="outline" className="hidden md:flex border-border bg-card hover:bg-foreground hover:text-background transition-all duration-300 uppercase font-bold tracking-wider backdrop-blur-sm">
              <Link href="/">Exit Paddock</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>

        {/* Optional F1TV Account Modal */}
        {showAuthModal && (
          <div className="mb-8 p-6 rounded-2xl bg-card/95 border border-border backdrop-blur-md shadow-lg dark:shadow-none">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-sm font-mono uppercase tracking-wider text-foreground font-bold">
                  FastF1 Live Timing Data Source (v{authStatus?.fastf1_version || "3.9+"})
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Cached FastF1 sessions and OpenF1/Jolpica telemetry work automatically without login. Sign in with an F1 account only if you want to pull fresh F1TV timing feeds directly into FastF1 cache.
                </p>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowAuthModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {authStatus?.authenticated ? (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                <div className="text-xs font-mono text-emerald-700 dark:text-green-400">
                  Signed in to F1 account · FastF1 direct downloads active
                </div>
                <Button type="button" variant="outline" size="sm" onClick={handleF1Logout} disabled={authSubmitting}>
                  Clear Token
                </Button>
              </div>
            ) : (
              <form onSubmit={handleF1Login} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={f1Email}
                  onChange={(e) => setF1Email(e.target.value)}
                  placeholder="F1 account email"
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                />
                <input
                  type="password"
                  required
                  value={f1Password}
                  onChange={(e) => setF1Password(e.target.value)}
                  placeholder="Password"
                  className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                />
                <Button type="submit" disabled={authSubmitting} className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-xs px-6">
                  {authSubmitting ? "Signing In..." : "Connect F1TV"}
                </Button>
              </form>
            )}
            {authError && <p className="text-xs text-red-600 dark:text-red-400 font-mono mt-3">{authError}</p>}
          </div>
        )}

        {/* Hero Section: Next Race Countdown & Last Race Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
          {nextRace && (
            <div className={`col-span-1 ${lastCompletedRace ? "lg:col-span-2" : "lg:col-span-3"} relative group animate-slide-up`}>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/15 to-blue-600/15 dark:from-red-600/20 dark:to-blue-600/20 blur-3xl opacity-50 group-hover:opacity-75 transition-opacity duration-500" />
              <div className="relative bg-card/90 dark:bg-zinc-900/80 border border-border rounded-3xl overflow-hidden h-full flex flex-col backdrop-blur-md shadow-xl dark:shadow-2xl p-8">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 font-bold uppercase tracking-widest text-xs mb-2 border border-red-500/30 bg-red-500/10 px-3 py-1 rounded-full w-fit">
                      <span className="w-1.5 h-1.5 bg-red-600 dark:bg-red-500 rounded-full animate-pulse" />
                      Next Grand Prix · Round {nextRace.RoundNumber}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic leading-[0.9] text-foreground mb-1">
                      {nextRace.Location}
                    </h2>
                    <h3 className="text-xl md:text-2xl text-muted-foreground uppercase font-medium">
                      {nextRace.OfficialEventName}
                    </h3>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-sm text-muted-foreground font-mono uppercase mb-1">Race Date</div>
                    <div className="text-xl font-bold text-foreground">
                      {getRaceTimestamp(nextRace).toLocaleDateString(undefined, { month: "long", day: "numeric" })}
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col md:flex-row items-center gap-8">
                  <NextRaceCountdown targetDate={nextRace.Session5DateUtc || nextRace.Session5Date || nextRace.EventDate} />

                  <Button asChild size="lg" className="w-full md:w-auto bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-black uppercase tracking-wider skew-x-[-10deg] ml-auto">
                    <Link href={`/session/${raceYear}/${encodeURIComponent(nextRace.Location)}/Race`} className="skew-x-[10deg]">
                      Race Hub <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {lastCompletedRace && (
            <div className={`${nextRace ? "col-span-1" : "col-span-1 lg:col-span-3"} relative group animate-slide-up`}>
              <div className="relative bg-card/80 dark:bg-zinc-900/50 border border-border rounded-3xl overflow-hidden h-full flex flex-col backdrop-blur-sm p-6 shadow-md dark:shadow-none">
                <div className="flex items-center gap-2 text-muted-foreground font-bold uppercase tracking-widest text-xs mb-4">
                  <History className="w-4 h-4" />
                  Latest Results · R{lastCompletedRace.RoundNumber}
                </div>
                <h3 className="text-2xl font-black uppercase italic text-foreground mb-1">
                  {lastCompletedRace.Location}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {lastCompletedRace.EventName || lastCompletedRace.OfficialEventName}
                </p>

                <div className="mt-auto">
                  <div className="p-4 bg-muted/60 dark:bg-zinc-950/50 rounded-xl border border-border mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground uppercase mb-1">Race Winner</div>
                      <div className="font-bold text-lg text-foreground">
                        {winnerDriver ? winnerDriver.name : "Loading winner..."}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {winnerDriver ? `${winnerDriver.team}${winnerDriver.time ? ` · ${winnerDriver.time}` : ""}` : "--"}
                      </div>
                    </div>
                    {winnerDriver && (
                      <div
                        className="w-2 h-10 rounded-full shrink-0"
                        style={{ backgroundColor: `#${(winnerDriver.color || "FF1801").replace(/^#/, "")}` }}
                      />
                    )}
                  </div>
                  <Button asChild variant="outline" className="w-full border-border hover:bg-accent uppercase font-bold text-xs">
                    <Link href={`/session/${raceYear}/${encodeURIComponent(lastCompletedRace.Location)}/Race`}>
                      View Full Analysis
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          <div className="col-span-1 row-span-2 animate-slide-up">
            <StandingsWidget year={raceYear} />
          </div>

          <div className="col-span-1 animate-slide-up">
            <WeatherDashboard year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          <div className="col-span-1 animate-slide-up">
            <CircuitGuide year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          <div className="col-span-1 md:col-span-2 animate-slide-up">
            <DriverComparison year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          <div className="col-span-1 animate-slide-up">
            <TyreStrategy year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          <div className="col-span-1 animate-slide-up">
            <RaceControlFeed year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          <div className="col-span-1 md:col-span-2 animate-slide-up">
            <LapComparison year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          <div className="col-span-1 animate-slide-up">
            <HistoryExplorer location={raceLocation} availableLocations={availableLocations} />
          </div>

          <div className="col-span-1 animate-slide-up">
            <DriverMarket year={raceYear} />
          </div>

          <div className="col-span-1 animate-slide-up">
            <RadioHighlights year={raceYear} location={raceLocation} sessionType={sessionType} />
          </div>

          <div className="col-span-1 animate-slide-up">
            <FantasyTeam year={raceYear} />
          </div>

          <div className="col-span-1 animate-slide-up">
            <NewsFeed year={raceYear} events={schedule?.events || []} />
          </div>

          <div className="col-span-1 animate-slide-up">
            <RivalryWatch year={raceYear} />
          </div>
        </div>

        {/* Schedule List */}
        <div className="max-w-5xl mx-auto mt-24 animate-fade-in">
          <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-12 flex items-center gap-4 border-b border-border pb-6">
            <Flag className="w-8 h-8 text-red-600" />
            {raceYear} Season Timeline
          </h3>

          <div className="relative border-l-2 border-border ml-4 space-y-12 pb-12">
            {schedule?.events.map((event) => {
              const eventTime = getRaceTimestamp(event)
              const isPast = eventTime <= today
              const isNext = event.RoundNumber === nextRace?.RoundNumber

              if (isNext) return null

              return (
                <div key={`${event.RoundNumber}-${event.Location}`} className="relative pl-12 group">
                  <div className={`absolute left-[-9px] top-6 w-4 h-4 rounded-full border-4 border-background ${isPast ? "bg-muted-foreground/50" : "bg-red-600"} transition-all duration-300 group-hover:scale-125 group-hover:shadow-[0_0_15px_rgba(220,38,38,0.5)]`} />

                  <div className={`flex flex-col md:flex-row md:items-center gap-6 p-8 bg-card/70 dark:bg-zinc-900/30 border border-border rounded-2xl hover:bg-card hover:border-zinc-400 dark:hover:bg-zinc-900 dark:hover:border-zinc-600 transition-all duration-300 shadow-sm dark:shadow-none ${isPast ? "opacity-80 hover:opacity-100" : ""}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded">R{event.RoundNumber}</span>
                        {isPast && <Badge variant="secondary" className="text-[10px]">COMPLETED</Badge>}
                      </div>
                      <h4 className="text-3xl font-black uppercase italic tracking-tight text-foreground group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors duration-300">
                        {event.Location}
                      </h4>
                      <div className="text-lg text-muted-foreground font-medium mt-1">
                        {event.OfficialEventName}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-muted-foreground font-mono border-l border-border pl-6">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="w-4 h-4 text-muted-foreground" />
                        {eventTime.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {event.Country}
                      </div>
                    </div>

                    <Button asChild size="lg" variant="ghost" className="md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:translate-x-[-10px] md:group-hover:translate-x-0 ml-auto hover:bg-red-600 hover:text-white uppercase font-bold tracking-wider">
                      <Link href={`/session/${raceYear}/${encodeURIComponent(event.Location)}/Race`}>
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
