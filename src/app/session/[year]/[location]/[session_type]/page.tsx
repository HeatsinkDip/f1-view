"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Play, Pause, RotateCcw, Activity, Gauge } from "lucide-react"
import { getSessionDetails, getSessionDrivers, getDriverTelemetry, getTrackData, SessionDetails, Driver, TelemetryPoint, TrackPoint } from "@/lib/api"
import { useAsyncData } from "@/lib/use-async-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TelemetryChart } from "@/components/telemetry-chart"
import { TrackMap } from "@/components/track-map"
import { TelemetryHUD } from "@/components/telemetry-hud"
import { StrategyPredictor } from "@/components/strategy-predictor"
import { WeatherRadar } from "@/components/weather-radar"
import { TeamRadio } from "@/components/team-radio"
import { TyreAnalysis } from "@/components/tyre-analysis"
import { F1Loader } from "@/components/f1-loader"
import { ModeToggle } from "@/components/mode-toggle"

const EMPTY_SESSION_BUNDLE: {
    session: SessionDetails | null
    drivers: Driver[]
    trackData: TrackPoint[]
} = { session: null, drivers: [], trackData: [] }

const EMPTY_TELEMETRY_POINTS: TelemetryPoint[] = []

export default function SessionPage() {
    const params = useParams()
    const router = useRouter()
    const year = parseInt(params.year as string, 10)
    const rawLocation = decodeURIComponent((params.location as string) || "")
    const sessionType = decodeURIComponent((params.session_type as string) || "Race")
    const validParams = !Number.isNaN(year) && Boolean(rawLocation)
    const sessionKey = validParams ? `${year}:${rawLocation}:${sessionType}` : null

    const { data: sessionBundle, loading: bundleLoading, error: bundleError } = useAsyncData(
        sessionKey,
        async () => {
            const [sessionData, driversData, track] = await Promise.all([
                getSessionDetails(year, rawLocation, sessionType),
                getSessionDrivers(year, rawLocation, sessionType),
                getTrackData(year, rawLocation, sessionType).catch(() => ({ circuit_name: rawLocation, track_data: [] })),
            ])
            return {
                session: sessionData,
                drivers: driversData,
                trackData: track.track_data || [],
            }
        },
        EMPTY_SESSION_BUNDLE
    )
    const { session, drivers, trackData } = sessionBundle
    const loading = validParams && bundleLoading
    const error = !validParams ? "Invalid session parameters" : bundleError

    const [driverPick, setDriverPick] = useState<{ key: string; id: string } | null>(null)
    const selectedDriver = (driverPick && driverPick.key === sessionKey ? driverPick.id : drivers[0]?.id) || null

    const [comparisonPick, setComparisonPick] = useState<{ key: string; id: string | null } | null>(null)
    const comparisonDriver = comparisonPick && comparisonPick.key === sessionKey ? comparisonPick.id : null

    const telemetryKey = sessionKey && selectedDriver ? `${sessionKey}:driver:${selectedDriver}` : null
    const { data: telemetryData, loading: telemetryLoading, error: telemetryError } = useAsyncData(
        telemetryKey,
        () => getDriverTelemetry(year, rawLocation, sessionType, selectedDriver!).then((d) => d.telemetry || []),
        EMPTY_TELEMETRY_POINTS
    )

    const comparisonKey = sessionKey && comparisonDriver ? `${sessionKey}:comp:${comparisonDriver}` : null
    const { data: comparisonTelemetryData } = useAsyncData(
        comparisonKey,
        () =>
            getDriverTelemetry(year, rawLocation, sessionType, comparisonDriver!)
                .then((d) => d.telemetry || [])
                .catch((err) => {
                    console.error("Failed to load comparison telemetry", err)
                    return []
                }),
        EMPTY_TELEMETRY_POINTS
    )

    // Animation State
    const activeTelemetryKey = telemetryKey || ""
    const [playback, setPlayback] = useState<{ key: string; index: number; playing: boolean }>({
        key: "",
        index: 0,
        playing: false,
    })
    const playbackIndex = playback.key === activeTelemetryKey ? playback.index : 0
    const isPlaying = playback.key === activeTelemetryKey ? playback.playing : false

    useEffect(() => {
        if (!isPlaying || telemetryData.length === 0) return
        const interval = setInterval(() => {
            setPlayback((prev) => {
                const cur = prev.key === activeTelemetryKey ? prev.index : 0
                if (cur >= telemetryData.length - 1) {
                    return { key: activeTelemetryKey, index: cur, playing: false }
                }
                return { key: activeTelemetryKey, index: cur + 1, playing: true }
            })
        }, 50)
        return () => clearInterval(interval)
    }, [isPlaying, telemetryData.length, activeTelemetryKey])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background text-foreground relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-background to-background dark:from-zinc-900 dark:via-zinc-950 dark:to-black" />
                <div className="relative z-10">
                    <F1Loader />
                </div>
            </div>
        )
    }
    if (error) return <div className="flex h-screen items-center justify-center text-red-600 dark:text-red-500 bg-background">Error: {error}</div>

    const activeDriverObj = drivers.find(d => d.id === selectedDriver)
    const availableSessions = session?.available_sessions && session.available_sessions.length > 0
        ? session.available_sessions
        : ["Practice 1", "Qualifying", "Race"]

    // Handle future sessions where data is missing
    if (!trackData || trackData.length === 0) {
        return (
            <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/5 via-background to-background dark:from-zinc-900 dark:via-zinc-950 dark:to-black -z-10" />

                <Button variant="ghost" size="sm" asChild className="absolute top-8 left-8 text-muted-foreground hover:text-foreground">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>

                <div className="absolute top-8 right-8">
                    <ModeToggle />
                </div>

                <div className="max-w-md space-y-8 relative z-10">
                    <div className="w-24 h-24 bg-card rounded-full flex items-center justify-center mx-auto border border-border shadow-lg dark:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Play className="w-10 h-10 text-muted-foreground ml-1" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black italic uppercase mb-4 tracking-tighter">Session Upcoming</h1>
                        <p className="text-muted-foreground text-lg">
                            Telemetry for <span className="text-foreground font-bold">{sessionType}</span> at <span className="text-foreground font-bold">{rawLocation} ({year})</span> is not available yet.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        {sessionType !== "Qualifying" && (
                            <Button asChild size="lg" className="w-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-black uppercase tracking-wider h-14 text-lg shadow-lg dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02]">
                                <Link href={`/session/${year}/${encodeURIComponent(rawLocation)}/Qualifying`}>
                                    View Qualifying Analysis <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
                                </Link>
                            </Button>
                        )}
                        <Button asChild variant="outline" className="w-full border-border text-muted-foreground hover:text-foreground uppercase tracking-wider h-12">
                            <Link href="/dashboard">Return to Paddock</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col font-sans relative">
            {/* Animated Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/10 via-background to-background dark:from-red-950/20 dark:via-zinc-950 dark:to-black -z-10" />
            <div className="fixed top-0 left-0 w-full h-[300px] bg-gradient-to-b from-red-600/5 to-transparent -z-10 pointer-events-none" />

            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

            <div className="p-4 md:p-6 flex flex-col min-h-screen">
                {/* Enhanced Header */}
                <header className="mb-6 px-2 pb-6 border-b border-border relative animate-fade-in">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-blue-600/5 blur-xl -z-10" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Back Button + Title */}
                        <div className="flex items-center gap-4 md:gap-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full w-12 h-12 backdrop-blur-sm border border-border transition-all hover:scale-110 hover:border-red-600/50 group"
                            >
                                <Link href="/dashboard">
                                    <ArrowLeft className="h-5 w-5 group-hover:text-red-500 transition-colors" />
                                </Link>
                            </Button>

                            <div>
                                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                                    <span className="bg-gradient-to-r from-zinc-950 via-zinc-800 to-zinc-600 dark:from-white dark:via-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
                                        {session?.location || rawLocation}
                                    </span>{" "}
                                    <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.4)]">{year}</span>
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <Select
                                        value={sessionType}
                                        onValueChange={(nextSession) => {
                                            router.push(`/session/${year}/${encodeURIComponent(rawLocation)}/${encodeURIComponent(nextSession)}`)
                                        }}
                                    >
                                        <SelectTrigger className="h-7 w-auto min-w-[130px] text-xs font-mono text-foreground uppercase border-border bg-card px-3">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSessions.map((sName) => (
                                                <SelectItem key={sName} value={sName} className="text-xs font-mono uppercase">
                                                    {sName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-red-600 dark:text-red-400">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                        </span>
                                        {telemetryLoading ? "LOADING TELEMETRY..." : telemetryError ? "TELEMETRY PARTIAL" : "TELEMETRY READY"}
                                    </div>
                                    {session?.source && (
                                        <Badge className="text-[10px] font-mono uppercase border-border bg-muted text-muted-foreground">
                                            {session.source}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Driver Selection */}
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center gap-2 bg-card/90 p-2 rounded-xl border border-border backdrop-blur-md shadow-md dark:shadow-xl">
                                <Select value={selectedDriver || ""} onValueChange={(id) => setDriverPick({ key: sessionKey || "", id })}>
                                    <SelectTrigger className="w-[200px] bg-transparent border-none text-foreground focus:ring-0 h-10 font-bold hover:bg-accent transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-red-600 dark:text-red-500" />
                                            <SelectValue placeholder="Select Driver" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {drivers.map(d => (
                                            <SelectItem key={d.id} value={d.id}>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{d.code}</span>
                                                    <span className="text-muted-foreground">-</span>
                                                    <span className="text-sm">{d.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="h-6 w-[1px] bg-border" />

                                <Select value={comparisonDriver || "none"} onValueChange={(v) => setComparisonPick({ key: sessionKey || "", id: v === "none" ? null : v })}>
                                    <SelectTrigger className="w-[180px] bg-transparent border-none text-muted-foreground focus:ring-0 h-10 text-xs uppercase tracking-wider hover:bg-accent hover:text-foreground transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Gauge className="w-3.5 h-3.5" />
                                            <SelectValue placeholder="VS GHOST" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            <span className="text-muted-foreground">NO COMPARISON</span>
                                        </SelectItem>
                                        {drivers.map(d => (
                                            <SelectItem
                                                key={d.id}
                                                value={d.id}
                                                disabled={d.id === selectedDriver}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{d.code}</span>
                                                    <span className="text-muted-foreground">-</span>
                                                    <span className="text-sm">{d.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <ModeToggle />
                        </div>
                    </div>
                </header>

                {/* Mission Control Grid - Balanced Layout */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">

                    {/* Left Column: Track Map & Context */}
                    <div className="flex flex-col gap-6">
                        {/* Track Map */}
                        <div className="flex-[2] relative rounded-2xl overflow-hidden border border-border bg-card/70 dark:bg-zinc-900/20 shadow-lg dark:shadow-2xl min-h-[400px]">
                            <TrackMap
                                data={trackData}
                                circuitName={session?.location || "Circuit"}
                                currentPosition={
                                    telemetryData.length > 0 && playbackIndex >= 0 && playbackIndex < telemetryData.length
                                        ? { x: telemetryData[playbackIndex].x, y: telemetryData[playbackIndex].y }
                                        : undefined
                                }
                                comparisonPosition={
                                    comparisonTelemetryData.length > 0 && playbackIndex >= 0 && playbackIndex < comparisonTelemetryData.length
                                        ? { x: comparisonTelemetryData[playbackIndex].x, y: comparisonTelemetryData[playbackIndex].y }
                                        : undefined
                                }
                                className="h-full w-full"
                            />

                            {/* Floating HUD */}
                            <div className="absolute top-6 right-6 z-10 w-64">
                                <TelemetryHUD data={telemetryData[playbackIndex]} />
                            </div>

                            {/* Playback Controls Bar */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-xl bg-card/95 backdrop-blur-xl border border-border rounded-full p-2 px-6 flex items-center gap-6 shadow-xl dark:shadow-2xl">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setPlayback((prev) => ({
                                        key: activeTelemetryKey,
                                        index: prev.key === activeTelemetryKey ? prev.index : 0,
                                        playing: !(prev.key === activeTelemetryKey && prev.playing),
                                    }))}
                                    className="hover:bg-accent rounded-full w-10 h-10 text-foreground"
                                >
                                    {isPlaying ? <Pause className="fill-current h-4 w-4" /> : <Play className="fill-current h-4 w-4" />}
                                </Button>

                                <div className="flex-1 flex flex-col gap-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.max(0, telemetryData.length - 1)}
                                        disabled={telemetryData.length === 0}
                                        value={Math.min(playbackIndex, Math.max(0, telemetryData.length - 1))}
                                        onChange={(e) => {
                                            setPlayback({
                                                key: activeTelemetryKey,
                                                index: parseInt(e.target.value, 10) || 0,
                                                playing: false,
                                            })
                                        }}
                                        className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-red-600 hover:accent-red-500 transition-all disabled:opacity-40"
                                    />
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={telemetryData.length === 0}
                                    onClick={() => setPlayback({ key: activeTelemetryKey, index: 0, playing: false })}
                                    className="hover:bg-accent rounded-full w-8 h-8 text-muted-foreground hover:text-foreground"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Widgets Deck */}
                        <div className="flex-1 grid grid-cols-2 gap-4 min-h-[200px]">
                            <div className="bg-card/60 dark:bg-zinc-900/30 border border-border rounded-xl p-1 backdrop-blur-sm hover:bg-card/90 dark:hover:bg-zinc-900/50 transition-colors">
                                <StrategyPredictor
                                    year={year}
                                    location={rawLocation}
                                    sessionType={sessionType}
                                    driverId={selectedDriver || undefined}
                                    driverCode={activeDriverObj?.code}
                                />
                            </div>
                            <div className="bg-card/60 dark:bg-zinc-900/30 border border-border rounded-xl p-1 backdrop-blur-sm hover:bg-card/90 dark:hover:bg-zinc-900/50 transition-colors">
                                <WeatherRadar year={year} location={rawLocation} sessionType={sessionType} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Telemetry Analysis */}
                    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">
                        {/* Radio & Tyres */}
                        <div className="grid grid-cols-2 gap-4 h-72 shrink-0">
                            <div className="bg-card/60 dark:bg-zinc-900/30 border border-border rounded-xl overflow-hidden">
                                <TeamRadio
                                    year={year}
                                    location={rawLocation}
                                    sessionType={sessionType}
                                    driverCode={activeDriverObj?.code}
                                />
                            </div>
                            <div className="bg-card/60 dark:bg-zinc-900/30 border border-border rounded-xl overflow-hidden">
                                <TyreAnalysis
                                    year={year}
                                    location={rawLocation}
                                    sessionType={sessionType}
                                    driverId={selectedDriver || undefined}
                                    driverCode={activeDriverObj?.code}
                                />
                            </div>
                        </div>

                        {/* Telemetry Stack */}
                        <div className="flex-1 flex flex-col gap-4 min-h-0">
                            <Card className="bg-card/70 dark:bg-zinc-900/30 border-border flex-1 min-h-[180px] flex flex-col">
                                <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                                        <Gauge className="w-4 h-4" /> Speed Trace
                                    </CardTitle>
                                    <span className="text-xs font-mono text-red-600 dark:text-red-400">km/h</span>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 relative">
                                    <div className="absolute inset-0">
                                        <TelemetryChart
                                            data={telemetryData}
                                            dataKey="speed"
                                            color="#ef4444"
                                            comparisonData={comparisonTelemetryData}
                                            activeIndex={playbackIndex}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/70 dark:bg-zinc-900/30 border-border flex-1 min-h-[180px] flex flex-col">
                                <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Throttle
                                    </CardTitle>
                                    <span className="text-xs font-mono text-emerald-700 dark:text-green-400">%</span>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 relative">
                                    <div className="absolute inset-0">
                                        <TelemetryChart
                                            data={telemetryData}
                                            dataKey="throttle"
                                            color="#22c55e"
                                            comparisonData={comparisonTelemetryData}
                                            activeIndex={playbackIndex}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-card/70 dark:bg-zinc-900/30 border-border flex-1 min-h-[180px] flex flex-col">
                                <CardHeader className="py-3 px-4 border-b border-border/60 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Brake
                                    </CardTitle>
                                    <span className="text-xs font-mono text-red-600 dark:text-red-400">%</span>
                                </CardHeader>
                                <CardContent className="p-0 flex-1 relative">
                                    <div className="absolute inset-0">
                                        <TelemetryChart
                                            data={telemetryData}
                                            dataKey="brake"
                                            color="#ef4444"
                                            unit="%"
                                            comparisonData={comparisonTelemetryData}
                                            activeIndex={playbackIndex}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
            {children}
        </span>
    )
}
