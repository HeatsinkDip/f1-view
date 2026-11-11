"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Play, Pause, RotateCcw, Activity, Gauge } from "lucide-react"
import { getSessionDetails, getSessionDrivers, getDriverTelemetry, getTrackData, SessionDetails, Driver, TelemetryPoint, TrackPoint } from "@/lib/api"
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

export default function SessionPage() {
    const params = useParams()
    const router = useRouter()
    const year = parseInt(params.year as string, 10)
    const rawLocation = decodeURIComponent((params.location as string) || "")
    const sessionType = decodeURIComponent((params.session_type as string) || "Race")

    const [session, setSession] = useState<SessionDetails | null>(null)
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [trackData, setTrackData] = useState<TrackPoint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [selectedDriver, setSelectedDriver] = useState<string | null>(null)
    const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([])
    const [telemetryLoading, setTelemetryLoading] = useState(false)
    const [telemetryError, setTelemetryError] = useState<string | null>(null)

    const [comparisonDriver, setComparisonDriver] = useState<string | null>(null)
    const [comparisonTelemetryData, setComparisonTelemetryData] = useState<TelemetryPoint[]>([])

    // Animation State
    const [playbackIndex, setPlaybackIndex] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout
        if (isPlaying && telemetryData.length > 0) {
            interval = setInterval(() => {
                setPlaybackIndex(prev => {
                    if (prev >= telemetryData.length - 1) {
                        setIsPlaying(false)
                        return prev
                    }
                    return prev + 1
                })
            }, 50)
        }
        return () => clearInterval(interval)
    }, [isPlaying, telemetryData.length])

    useEffect(() => {
        let active = true
        setLoading(true)
        setError(null)
        setSelectedDriver(null)
        setComparisonDriver(null)
        setTelemetryData([])
        setComparisonTelemetryData([])
        setPlaybackIndex(0)
        setIsPlaying(false)

        const fetchData = async () => {
            try {
                const [sessionData, driversData, track] = await Promise.all([
                    getSessionDetails(year, rawLocation, sessionType),
                    getSessionDrivers(year, rawLocation, sessionType),
                    getTrackData(year, rawLocation, sessionType).catch(() => ({ circuit_name: rawLocation, track_data: [] }))
                ])
                if (!active) return
                setSession(sessionData)
                setDrivers(driversData)
                setTrackData(track.track_data || [])
                if (driversData.length > 0) {
                    setSelectedDriver(driversData[0].id)
                }
            } catch (err: unknown) {
                if (!active) return
                setError(err instanceof Error ? err.message : "Failed to load session")
            } finally {
                if (active) setLoading(false)
            }
        }

        if (!Number.isNaN(year) && rawLocation) {
            fetchData()
        } else {
            setError("Invalid session parameters")
            setLoading(false)
        }

        return () => { active = false }
    }, [year, rawLocation, sessionType])

    useEffect(() => {
        if (!selectedDriver) return
        let active = true
        setPlaybackIndex(0)
        setIsPlaying(false)
        setTelemetryError(null)

        const fetchTelemetry = async () => {
            setTelemetryLoading(true)
            try {
                const data = await getDriverTelemetry(year, rawLocation, sessionType, selectedDriver)
                if (!active) return
                setTelemetryData(data.telemetry || [])
            } catch (err: unknown) {
                if (!active) return
                setTelemetryData([])
                setTelemetryError(err instanceof Error ? err.message : "Failed to load telemetry")
            } finally {
                if (active) setTelemetryLoading(false)
            }
        }

        fetchTelemetry()
        return () => { active = false }
    }, [selectedDriver, year, rawLocation, sessionType])

    useEffect(() => {
        if (!comparisonDriver) {
            setComparisonTelemetryData([])
            return
        }
        let active = true

        const fetchComparisonTelemetry = async () => {
            try {
                const data = await getDriverTelemetry(year, rawLocation, sessionType, comparisonDriver)
                if (active) setComparisonTelemetryData(data.telemetry || [])
            } catch (err) {
                console.error("Failed to load comparison telemetry", err)
                if (active) setComparisonTelemetryData([])
            }
        }

        fetchComparisonTelemetry()
        return () => { active = false }
    }, [comparisonDriver, year, rawLocation, sessionType])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black" />
                <div className="relative z-10">
                    <F1Loader />
                </div>
            </div>
        )
    }
    if (error) return <div className="flex h-screen items-center justify-center text-red-500 bg-zinc-950">Error: {error}</div>

    const activeDriverObj = drivers.find(d => d.id === selectedDriver)
    const availableSessions = session?.available_sessions && session.available_sessions.length > 0
        ? session.available_sessions
        : ["Practice 1", "Qualifying", "Race"]

    // Handle future sessions where data is missing
    if (!trackData || trackData.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black -z-10" />

                <Button variant="ghost" size="sm" asChild className="absolute top-8 left-8 text-zinc-400 hover:text-white hover:bg-zinc-800">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>

                <div className="max-w-md space-y-8 relative z-10">
                    <div className="w-24 h-24 bg-zinc-900/50 rounded-full flex items-center justify-center mx-auto border border-zinc-800 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <Play className="w-10 h-10 text-zinc-500 ml-1" />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black italic uppercase mb-4 tracking-tighter">Session Upcoming</h1>
                        <p className="text-zinc-400 text-lg">
                            Telemetry for <span className="text-white font-bold">{sessionType}</span> at <span className="text-white font-bold">{rawLocation} ({year})</span> is not available yet.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        {sessionType !== "Qualifying" && (
                            <Button asChild size="lg" className="w-full bg-white text-black hover:bg-zinc-200 font-black uppercase tracking-wider h-14 text-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-[1.02]">
                                <Link href={`/session/${year}/${encodeURIComponent(rawLocation)}/Qualifying`}>
                                    View Qualifying Analysis <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
                                </Link>
                            </Button>
                        )}
                        <Button asChild variant="outline" className="w-full border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white uppercase tracking-wider h-12">
                            <Link href="/dashboard">Return to Paddock</Link>
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white overflow-hidden flex flex-col font-sans relative">
            {/* Animated Background */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-950/20 via-zinc-950 to-black -z-10" />
            <div className="fixed top-0 left-0 w-full h-[300px] bg-gradient-to-b from-red-600/5 to-transparent -z-10 pointer-events-none" />

            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] -z-10" />

            <div className="p-4 md:p-6 flex flex-col min-h-screen">
                {/* Enhanced Header */}
                <header className="mb-6 px-2 pb-6 border-b border-zinc-800/50 relative animate-fade-in">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-blue-600/5 blur-xl -z-10" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Left: Back Button + Title */}
                        <div className="flex items-center gap-4 md:gap-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                className="text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-full w-12 h-12 backdrop-blur-sm border border-zinc-800/50 transition-all hover:scale-110 hover:border-red-600/50 group"
                            >
                                <Link href="/dashboard">
                                    <ArrowLeft className="h-5 w-5 group-hover:text-red-500 transition-colors" />
                                </Link>
                            </Button>

                            <div>
                                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                                    {session?.location || rawLocation} <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.6)]">{year}</span>
                                </h1>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <Select
                                        value={sessionType}
                                        onValueChange={(nextSession) => {
                                            router.push(`/session/${year}/${encodeURIComponent(rawLocation)}/${encodeURIComponent(nextSession)}`)
                                        }}
                                    >
                                        <SelectTrigger className="h-7 w-auto min-w-[130px] text-xs font-mono text-zinc-200 uppercase border-zinc-700 bg-zinc-900/80 px-3">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                            {availableSessions.map((sName) => (
                                                <SelectItem key={sName} value={sName} className="text-xs font-mono uppercase">
                                                    {sName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <div className="flex items-center gap-2 text-[10px] font-mono text-red-500">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                        </span>
                                        {telemetryLoading ? "LOADING TELEMETRY..." : telemetryError ? "TELEMETRY PARTIAL" : "TELEMETRY READY"}
                                    </div>
                                    {session?.source && (
                                        <Badge className="text-[10px] font-mono uppercase border-zinc-800 bg-zinc-900 text-zinc-400">
                                            {session.source}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Driver Selection */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-zinc-900/80 p-2 rounded-xl border border-zinc-800/50 backdrop-blur-md shadow-xl">
                                <Select value={selectedDriver || ""} onValueChange={setSelectedDriver}>
                                    <SelectTrigger className="w-[200px] bg-transparent border-none text-white focus:ring-0 h-10 font-bold hover:bg-zinc-800/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-red-500" />
                                            <SelectValue placeholder="Select Driver" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        {drivers.map(d => (
                                            <SelectItem key={d.id} value={d.id} className="hover:bg-zinc-800">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{d.code}</span>
                                                    <span className="text-zinc-400">-</span>
                                                    <span className="text-sm">{d.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="h-6 w-[1px] bg-zinc-700/50" />

                                <Select value={comparisonDriver || "none"} onValueChange={(v) => setComparisonDriver(v === "none" ? null : v)}>
                                    <SelectTrigger className="w-[180px] bg-transparent border-none text-zinc-400 focus:ring-0 h-10 text-xs uppercase tracking-wider hover:bg-zinc-800/50 hover:text-white transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Gauge className="w-3.5 h-3.5" />
                                            <SelectValue placeholder="VS GHOST" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                                        <SelectItem value="none" className="hover:bg-zinc-800">
                                            <span className="text-zinc-500">NO COMPARISON</span>
                                        </SelectItem>
                                        {drivers.map(d => (
                                            <SelectItem
                                                key={d.id}
                                                value={d.id}
                                                disabled={d.id === selectedDriver}
                                                className="hover:bg-zinc-800"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold">{d.code}</span>
                                                    <span className="text-zinc-400">-</span>
                                                    <span className="text-sm">{d.name}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Mission Control Grid - Balanced Layout */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">

                    {/* Left Column: Track Map & Context */}
                    <div className="flex flex-col gap-6">
                        {/* Track Map */}
                        <div className="flex-[2] relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/20 shadow-2xl min-h-[400px]">
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
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-[90%] max-w-xl bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 rounded-full p-2 px-6 flex items-center gap-6 shadow-2xl">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsPlaying(!isPlaying)}
                                    className="hover:bg-white/10 rounded-full w-10 h-10 text-white"
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
                                            setPlaybackIndex(parseInt(e.target.value, 10) || 0)
                                            setIsPlaying(false)
                                        }}
                                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 hover:accent-red-500 transition-all disabled:opacity-40"
                                    />
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    disabled={telemetryData.length === 0}
                                    onClick={() => { setPlaybackIndex(0); setIsPlaying(false); }}
                                    className="hover:bg-white/10 rounded-full w-8 h-8 text-zinc-400 hover:text-white"
                                >
                                    <RotateCcw className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Widgets Deck */}
                        <div className="flex-1 grid grid-cols-2 gap-4 min-h-[200px]">
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-1 backdrop-blur-sm hover:bg-zinc-900/50 transition-colors">
                                <StrategyPredictor
                                    year={year}
                                    location={rawLocation}
                                    sessionType={sessionType}
                                    driverId={selectedDriver || undefined}
                                    driverCode={activeDriverObj?.code}
                                />
                            </div>
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-1 backdrop-blur-sm hover:bg-zinc-900/50 transition-colors">
                                <WeatherRadar year={year} location={rawLocation} sessionType={sessionType} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Telemetry Analysis */}
                    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1 custom-scrollbar">
                        {/* Radio & Tyres */}
                        <div className="grid grid-cols-2 gap-4 h-72 shrink-0">
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
                                <TeamRadio
                                    year={year}
                                    location={rawLocation}
                                    sessionType={sessionType}
                                    driverCode={activeDriverObj?.code}
                                />
                            </div>
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden">
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
                            <Card className="bg-zinc-900/30 border-zinc-800 flex-1 min-h-[180px] flex flex-col">
                                <CardHeader className="py-3 px-4 border-b border-zinc-800/50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                                        <Gauge className="w-4 h-4" /> Speed Trace
                                    </CardTitle>
                                    <span className="text-xs font-mono text-red-500">km/h</span>
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

                            <Card className="bg-zinc-900/30 border-zinc-800 flex-1 min-h-[180px] flex flex-col">
                                <CardHeader className="py-3 px-4 border-b border-zinc-800/50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Throttle
                                    </CardTitle>
                                    <span className="text-xs font-mono text-green-500">%</span>
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

                            <Card className="bg-zinc-900/30 border-zinc-800 flex-1 min-h-[180px] flex flex-col">
                                <CardHeader className="py-3 px-4 border-b border-zinc-800/50 flex flex-row items-center justify-between">
                                    <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                                        <Activity className="w-4 h-4" /> Brake
                                    </CardTitle>
                                    <span className="text-xs font-mono text-red-500">%</span>
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
