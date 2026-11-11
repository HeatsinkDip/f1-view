"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Activity, Map, Trophy, ChevronRight, Play } from "lucide-react"
import { useEffect, useState } from "react"
import { getStandings, getSchedule, DriverStanding, Event, handleDriverImageError, toHighResDriverImage } from "@/lib/api"
import { ModeToggle } from "@/components/mode-toggle"

const CURRENT_YEAR = new Date().getFullYear()

export default function LandingPage() {
    const [standings, setStandings] = useState<DriverStanding[]>([])
    const [nextRace, setNextRace] = useState<Event | null>(null)
    const [featuredRace, setFeaturedRace] = useState<{ year: number; location: string }>({
        year: 2025,
        location: "Lusail",
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                let standingsData = await getStandings(CURRENT_YEAR).catch(() => null)
                if (!standingsData || !standingsData.drivers || standingsData.drivers.length === 0) {
                    standingsData = await getStandings(CURRENT_YEAR - 1).catch(() => null)
                }
                if (standingsData && standingsData.drivers) {
                    setStandings(standingsData.drivers.slice(0, 3))
                }

                const scheduleData = await getSchedule(CURRENT_YEAR).catch(() => null)
                if (scheduleData && scheduleData.events && scheduleData.events.length > 0) {
                    const now = new Date()
                    const upcoming = scheduleData.events.find(
                        (e) => new Date(e.Session5DateUtc || e.Session5Date || e.EventDate) > now
                    )
                    const completed = [...scheduleData.events]
                        .reverse()
                        .find((e) => new Date(e.Session5DateUtc || e.Session5Date || e.EventDate) <= now)

                    setNextRace(upcoming || completed || scheduleData.events[0])
                    if (completed) {
                        setFeaturedRace({ year: CURRENT_YEAR, location: completed.Location })
                    }
                }
            } catch (error) {
                console.error("Failed to fetch landing page data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden font-sans selection:bg-red-600 selection:text-white" suppressHydrationWarning>
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-500/10 via-background to-background dark:from-red-900/20 dark:via-zinc-950 dark:to-black" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-5 dark:opacity-20 mix-blend-multiply dark:mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808014_1px,transparent_1px),linear-gradient(to_bottom,#80808014_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Header */}
            <header className="relative z-50 px-6 py-4 flex justify-between items-center border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0">
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center font-black rounded-sm transform group-hover:skew-x-[-10deg] transition-transform duration-300 shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                        <span className="transform group-hover:skew-x-[10deg]">F1</span>
                    </div>
                    <span className="font-black tracking-tighter text-2xl italic">VIEW</span>
                </div>
                <nav className="hidden md:flex gap-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                    <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
                    <Link href="#telemetry" className="hover:text-foreground transition-colors">Telemetry</Link>
                    <Link href="#analysis" className="hover:text-foreground transition-colors">Analysis</Link>
                </nav>
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
                        <Link href="https://github.com/dipayon-dip/f1-view" target="_blank" rel="noopener noreferrer">GitHub</Link>
                    </Button>
                    <ModeToggle />
                    <Button asChild className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-black uppercase tracking-wider px-6 shadow-md dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105">
                        <Link href="/dashboard">Launch App</Link>
                    </Button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
                <div className="max-w-5xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-600/25 text-xs font-bold text-red-600 dark:text-red-400 mb-4 backdrop-blur-md uppercase tracking-widest animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-red-600 dark:bg-red-500 animate-ping" />
                        Live Telemetry Available
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] drop-shadow-sm dark:drop-shadow-2xl italic uppercase">
                        Race Data <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-200 dark:to-zinc-500 relative">
                            Unleashed
                            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/15 to-blue-600/15 blur-3xl -z-10" />
                        </span>
                    </h1>

                    <p className="text-xl md:text-1.5xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                        The ultimate Formula 1 companion. Professional-grade telemetry, real-time track visualization, and deep performance analytics.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
                        <Button asChild size="lg" className="h-16 px-10 text-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-wider shadow-[0_0_30px_rgba(220,38,38,0.35)] transition-all hover:scale-105 group rounded-xl">
                            <Link href="/dashboard">
                                Enter Paddock
                                <ChevronRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-16 px-10 text-xl border-zinc-300 dark:border-zinc-700 hover:bg-accent text-foreground font-bold uppercase tracking-wider backdrop-blur-sm rounded-xl transition-all">
                            <Link href={`/session/${featuredRace.year}/${encodeURIComponent(featuredRace.location)}/Race`}>
                                View Demo
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Feature Grid */}
                <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-40 max-w-6xl w-full">
                    <FeatureCard
                        icon={<Activity className="w-8 h-8 text-red-600 dark:text-red-500" />}
                        title="Live Telemetry"
                        description="Real-time speed, throttle, brake, and RPM data visualization directly from the track."
                    />
                    <FeatureCard
                        icon={<Map className="w-8 h-8 text-blue-600 dark:text-blue-500" />}
                        title="Track Dominance"
                        description="Interactive track maps with sector analysis and driver comparison overlays."
                    />
                    <FeatureCard
                        icon={<Trophy className="w-8 h-8 text-amber-600 dark:text-yellow-500" />}
                        title="Championship"
                        description="Live standings, points analysis, and constructor battle tracking."
                    />
                </div>

                {/* Latest News Section */}
                <div className="mt-40 w-full max-w-7xl">
                    <div className="flex items-end justify-between mb-12 px-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic">
                            Latest <span className="text-red-600">Insights</span>
                        </h2>
                        <Button variant="link" className="text-muted-foreground hover:text-foreground uppercase tracking-widest font-bold hidden md:flex">
                            View All News <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <NewsCard
                            category="TECHNICAL"
                            title={`${CURRENT_YEAR} Active Aerodynamics & Power Unit Efficiency`}
                            date={`${CURRENT_YEAR} Season`}
                            image="https://images.unsplash.com/photo-1699138346782-8a8b211c3da2?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
                        />
                        <NewsCard
                            category="STRATEGY"
                            title="Undercut vs Overcut: Analyzing Stint Degradation Across Compounds"
                            date="Race Craft"
                            image="https://images.unsplash.com/photo-1652090379496-4219a00c8ebf?q=80&w=1674&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
                        />
                    </div>
                </div>

                {/* Top Contenders Section */}
                <div className="mt-40 w-full max-w-7xl">
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-center mb-16 uppercase italic">
                        Championship <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-yellow-600 dark:from-yellow-400 dark:to-yellow-600">Leaders</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                        {loading ? (
                            // Loading Skeletons
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="h-[450px] rounded-3xl bg-muted border border-border animate-pulse" />
                            ))
                        ) : (
                            standings.map((driver) => (
                                <DriverCard
                                    key={driver.pos}
                                    name={driver.name}
                                    team={driver.team}
                                    points={driver.points}
                                    image={driver.image}
                                    rank={driver.pos}
                                    teamHex={`#${(driver.color || "FF1801").replace(/^#/, "")}`}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Technical Analysis Section */}
                <div id="analysis" className="mt-40 w-full max-w-7xl px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-15 dark:opacity-20 group-hover:opacity-35 blur-2xl transition-opacity duration-700" />
                            <div className="relative rounded-2xl overflow-hidden border border-border dark:border-white/10 aspect-[4/3] shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1700770956485-87150c75ad65?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
                                    alt="Technical Analysis"
                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                <div className="absolute bottom-8 left-8">
                                    <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-widest mb-3">
                                        <Activity className="w-4 h-4" />
                                        Telemetry Data
                                    </div>
                                    <div className="text-3xl font-black italic uppercase text-white">Precision Engineering</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8 text-left">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase italic">
                                Beyond The <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500">
                                    Visible
                                </span>
                            </h2>
                            <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                                Dive deep into the data that powers champions. Analyze tire degradation curves,
                                fuel load effects, and aerodynamic efficiency with our professional-grade telemetry tools.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-card/80 dark:bg-white/5 border border-border dark:border-white/10 backdrop-blur-sm shadow-sm dark:shadow-none">
                                    <div className="text-4xl font-black text-foreground mb-1">1ms</div>
                                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Latency</div>
                                </div>
                                <div className="p-6 rounded-2xl bg-card/80 dark:bg-white/5 border border-border dark:border-white/10 backdrop-blur-sm shadow-sm dark:shadow-none">
                                    <div className="text-4xl font-black text-foreground mb-1">1M+</div>
                                    <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Data Points</div>
                                </div>
                            </div>
                            <Button asChild size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-900/20">
                                <Link href="/dashboard">Explore Telemetry</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Circuit Spotlight */}
                <div className="mt-40 w-full relative h-[700px] flex items-center justify-center overflow-hidden bg-muted/40 dark:bg-zinc-900/40">
                    {nextRace ? (
                        <>
                            <div className="absolute inset-0 bg-cover bg-center fixed-bg transform scale-105" style={{ backgroundImage: `url('${nextRace.Image}')` }} />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/80" />
                            <div className="relative z-10 text-center max-w-5xl px-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/30 border border-red-500/50 text-red-200 font-bold uppercase tracking-widest text-sm mb-8 backdrop-blur-md">
                                    <Map className="w-4 h-4" />
                                    Circuit Spotlight
                                </div>
                                <h2 className="text-6xl md:text-9xl font-black tracking-tighter text-white mb-8 uppercase italic drop-shadow-2xl">
                                    {nextRace.Location.toUpperCase()}
                                </h2>
                                <p className="text-2xl md:text-3xl text-zinc-200 max-w-3xl mx-auto mb-12 font-medium leading-tight drop-shadow-lg">
                                    {nextRace.OfficialEventName}
                                </p>
                                <Button asChild size="lg" className="h-20 px-12 text-2xl bg-white text-black hover:bg-zinc-200 rounded-full font-black uppercase tracking-wider shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                                    <Link href={`/session/${CURRENT_YEAR}/${encodeURIComponent(nextRace.Location)}/Race`}>
                                        View Track Analysis
                                    </Link>
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="text-muted-foreground font-mono">Loading Circuit Data...</div>
                    )}
                </div>

                {/* Season Highlights */}
                <div className="mt-40 w-full max-w-7xl mb-32 px-6">
                    <div className="rounded-[2.5rem] bg-card/80 dark:bg-zinc-900/50 border border-border dark:border-white/10 p-8 md:p-16 relative overflow-hidden group shadow-lg dark:shadow-none">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-600/10 dark:bg-red-600/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 group-hover:bg-red-600/20 dark:group-hover:bg-red-600/30 transition-colors duration-1000" />
                        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16 text-left">
                            <div className="flex-1 space-y-8">
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none">
                                    Season <br />
                                    <span className="text-red-600">Highlights</span>
                                </h2>
                                <p className="text-muted-foreground text-xl leading-relaxed font-medium">
                                    Relive the most intense moments of the {CURRENT_YEAR} season. From photo-finish victories to strategic masterclasses,
                                    analyze every overtake and pit stop with our advanced replay tools.
                                </p>
                                <Button asChild variant="outline" size="lg" className="h-14 px-8 border-zinc-300 dark:border-white/20 hover:bg-foreground hover:text-background text-lg font-bold uppercase tracking-wider rounded-xl">
                                    <Link href="/dashboard">Watch Replays</Link>
                                </Button>
                            </div>
                            <div className="flex-1 w-full aspect-video bg-zinc-950 rounded-2xl border border-border dark:border-white/10 flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-2xl">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517672651691-24622a91b550?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                <div className="relative z-10 w-20 h-20 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-border bg-background/95 p-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center font-black rounded-sm">F1</div>
                        <span className="font-bold tracking-tighter text-xl text-muted-foreground">VIEW</span>
                    </div>
                    <p className="text-muted-foreground text-sm font-medium">© {CURRENT_YEAR} F1 View. Not affiliated with Formula 1 World Championship Ltd.</p>
                    <div className="flex gap-6 text-muted-foreground">
                        <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
                        <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-8 rounded-2xl bg-card/80 dark:bg-zinc-900/50 border border-border hover:bg-accent/50 hover:border-zinc-300 dark:hover:border-white/20 transition-all duration-300 text-left group hover:-translate-y-1 shadow-sm dark:shadow-lg">
            <div className="mb-6 p-4 rounded-xl bg-muted dark:bg-black/50 w-fit group-hover:scale-110 transition-transform border border-border group-hover:border-zinc-300 dark:group-hover:border-white/20">
                {icon}
            </div>
            <h3 className="text-xl font-black uppercase italic mb-3 text-foreground">{title}</h3>
            <p className="text-muted-foreground text-base leading-relaxed group-hover:text-foreground/90">{description}</p>
        </div>
    )
}

function NewsCard({ category, title, date, image }: { category: string, title: string, date: string, image: string }) {
    return (
        <div className="group cursor-pointer text-left">
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 border border-border bg-muted dark:bg-zinc-900 shadow-lg dark:shadow-xl">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.style.display = 'none';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest rounded-sm shadow-lg">
                        {category}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground text-xs font-bold tracking-widest uppercase mb-3">
                <span>{date}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                <span>5 MIN READ</span>
            </div>
            <h3 className="text-2xl font-bold leading-tight text-foreground group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors line-clamp-2">
                {title}
            </h3>
        </div>
    )
}

function DriverCard({ name, team, points, image, rank, teamHex }: { name: string, team: string, points: number, image: string, rank: number, teamHex: string }) {
    return (
        <div className="relative group hover:-translate-y-2 transition-transform duration-500 text-left">
            <div
                className="absolute inset-0 z-10 rounded-3xl opacity-35 group-hover:opacity-25 transition-opacity duration-500"
                style={{ background: `linear-gradient(to bottom, ${teamHex}, rgba(0, 0, 0, 0.9))` }}
            />
            <div className="relative h-[450px] rounded-3xl overflow-hidden border border-border dark:border-white/10 bg-zinc-900 shadow-2xl">
                <img
                    src={toHighResDriverImage(image)}
                    alt={name}
                    decoding="async"
                    onError={handleDriverImageError}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 pt-8"
                />

                <div className="absolute top-4 left-4 z-20">
                    <div className="w-12 h-12 rounded-xl bg-white text-black font-black flex items-center justify-center text-2xl shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                        {rank}
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 z-20 bg-gradient-to-t from-black via-black/80 to-transparent pt-20">
                    <div className="text-xs font-black uppercase tracking-widest text-white/75 mb-2">{team}</div>
                    <h3 className="text-3xl font-black uppercase italic mb-4 leading-none text-white">{name}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-4xl font-black" style={{ color: teamHex }}>{points}</span>
                        <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-2">PTS</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
