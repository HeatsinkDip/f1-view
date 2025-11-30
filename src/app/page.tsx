"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Activity, Map, Trophy, Timer } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Header */}
            <header className="relative z-10 p-6 flex justify-between items-center border-b border-white/10 bg-black/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black rounded-sm">F1</div>
                    <span className="font-bold tracking-tighter text-xl">VIEW</span>
                </div>
                <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-400">
                    <Link href="#" className="hover:text-white transition-colors">Features</Link>
                    <Link href="#" className="hover:text-white transition-colors">Telemetry</Link>
                    <Link href="#" className="hover:text-white transition-colors">About</Link>
                </nav>
                <Button asChild variant="outline" className="border-white/20 hover:bg-white hover:text-black transition-all">
                    <Link href="/dashboard">Launch App</Link>
                </Button>
            </header>

            {/* Hero Section */}
            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center p-6 pt-32 pb-24">
                <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-400 mb-4 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Telemetry Available
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] drop-shadow-2xl">
                        RACE DATA <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-500">
                            REIMAGINED
                        </span>
                    </h1>

                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
                        Experience Formula 1 like never before. Professional-grade telemetry,
                        real-time track visualization, and deep performance analytics in a
                        premium interface.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button asChild size="lg" className="h-14 px-8 text-lg bg-white text-black hover:bg-zinc-200 transition-all group">
                            <Link href="/dashboard">
                                Enter Paddock
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg border-white/20 hover:bg-white/10 backdrop-blur-sm">
                            <Link href="https://github.com/theOehrly/Fast-F1" target="_blank">
                                View Data Source
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl w-full animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-200">
                    <FeatureCard
                        icon={<Activity className="w-6 h-6 text-red-500" />}
                        title="Live Telemetry"
                        description="Real-time speed, throttle, brake, and RPM data visualization."
                    />
                    <FeatureCard
                        icon={<Map className="w-6 h-6 text-blue-500" />}
                        title="Track Dominance"
                        description="Interactive track maps with speed heatmaps and driver comparison."
                    />
                    <FeatureCard
                        icon={<Timer className="w-6 h-6 text-yellow-500" />}
                        title="Gap Analysis"
                        description="Precise lap time comparison and sector performance breakdown."
                    />
                </div>

                {/* Latest News Section */}
                <div className="mt-32 w-full max-w-6xl">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-center mb-12">
                        LATEST INSIGHTS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <NewsCard
                            category="TECHNICAL"
                            title="The Aerodynamic Evolution of the 2025 Front Wing"
                            date="Nov 29, 2024"
                            image="https://images.unsplash.com/photo-1599474924187-334a4ae513df?auto=format&fit=crop&w=800&q=80"
                        />
                        <NewsCard
                            category="STRATEGY"
                            title="Undercut vs Overcut: Analyzing Tire Degradation at Monaco"
                            date="Nov 28, 2024"
                            image="https://images.unsplash.com/photo-1532906619279-a782604d7c57?auto=format&fit=crop&w=800&q=80"
                        />
                    </div>
                </div>

                {/* Top Contenders Section */}
                <div className="mt-32 w-full max-w-6xl">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-center mb-12">
                        TOP CONTENDERS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <DriverCard
                            name="Max Verstappen"
                            team="Red Bull Racing"
                            points={575}
                            image="https://images.unsplash.com/photo-1632223867252-257a06655b36?auto=format&fit=crop&w=800&q=80"
                            rank={1}
                        />
                        <DriverCard
                            name="Lando Norris"
                            team="McLaren"
                            points={395}
                            image="https://images.unsplash.com/photo-1696446808759-398a9643f26e?auto=format&fit=crop&w=800&q=80"
                            rank={2}
                        />
                        <DriverCard
                            name="Lewis Hamilton"
                            team="Mercedes"
                            points={234}
                            image="https://images.unsplash.com/photo-1599474924187-334a4ae513df?auto=format&fit=crop&w=800&q=80"
                            rank={3}
                        />
                    </div>
                </div>

                {/* Technical Analysis Section */}
                <div className="mt-32 w-full max-w-7xl px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl opacity-20 group-hover:opacity-40 blur-xl transition-opacity duration-700" />
                            <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-[4/3]">
                                <img
                                    src="https://images.unsplash.com/photo-1532906619279-a782604d7c57?auto=format&fit=crop&w=1200&q=80"
                                    alt="Technical Analysis"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-6 left-6">
                                    <div className="flex items-center gap-2 text-blue-400 font-mono text-xs uppercase tracking-widest mb-2">
                                        <Activity className="w-4 h-4" />
                                        Telemetry Data
                                    </div>
                                    <div className="text-2xl font-bold">Precision Engineering</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
                                BEYOND THE <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                                    VISIBLE SPECTRUM
                                </span>
                            </h2>
                            <p className="text-xl text-zinc-400 leading-relaxed">
                                Dive deep into the data that powers champions. Analyze tire degradation curves,
                                fuel load effects, and aerodynamic efficiency with our professional-grade telemetry tools.
                            </p>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-3xl font-black text-white mb-1">ms</div>
                                    <div className="text-xs font-mono text-zinc-500 uppercase">Latency</div>
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                    <div className="text-3xl font-black text-white mb-1">1k+</div>
                                    <div className="text-xs font-mono text-zinc-500 uppercase">Data Points</div>
                                </div>
                            </div>
                            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Link href="/dashboard">Explore Telemetry</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Circuit Spotlight */}
                <div className="mt-32 w-full relative h-[600px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center fixed-bg" />
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="relative z-10 text-center max-w-4xl px-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/20 border border-red-600/50 text-red-500 font-bold uppercase tracking-widest text-sm mb-8">
                            <Map className="w-4 h-4" />
                            Circuit Spotlight
                        </div>
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter text-white mb-8">
                            MONACO GP
                        </h2>
                        <p className="text-2xl text-zinc-300 max-w-2xl mx-auto mb-12">
                            Master the streets of Monte Carlo. Every corner, every curb, every millisecond analyzed.
                        </p>
                        <Button asChild size="lg" className="h-16 px-10 text-xl bg-white text-black hover:bg-zinc-200 rounded-full">
                            <Link href="/session/2025/Monaco/Race">
                                View Track Analysis
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Season Highlights */}
                <div className="mt-32 w-full max-w-6xl mb-24">
                    <div className="rounded-3xl bg-zinc-900/50 border border-white/10 p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 space-y-6">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
                                    SEASON HIGHLIGHTS
                                </h2>
                                <p className="text-zinc-400 text-lg leading-relaxed">
                                    Relive the most intense moments of the 2024 season. From photo-finish victories to strategic masterclasses,
                                    analyze every overtake and pit stop with our advanced replay tools.
                                </p>
                                <Button asChild variant="outline" className="border-white/20 hover:bg-white hover:text-black">
                                    <Link href="/dashboard">Watch Replays</Link>
                                </Button>
                            </div>
                            <div className="flex-1 w-full aspect-video bg-zinc-950 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1516216628259-9474d32dce20?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-50 group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/50" />
                                <div className="relative z-10 w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform cursor-pointer">
                                    <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/10 bg-black/50 p-6 text-center text-zinc-600 text-sm">
                <p>© 2025 F1 View. Not affiliated with Formula 1 World Championship Ltd.</p>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left group">
            <div className="mb-4 p-3 rounded-lg bg-black/50 w-fit group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
        </div>
    )
}

function NewsCard({ category, title, date, image }: { category: string, title: string, date: string, image: string }) {
    return (
        <div className="group cursor-pointer">
            <div className="relative aspect-video rounded-xl overflow-hidden mb-4 border border-white/10 bg-zinc-900">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    onError={(e) => {
                        // Fallback to a solid color if image fails to load
                        e.currentTarget.style.display = 'none';
                    }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm">
                        {category}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono mb-2">
                <span>{date}</span>
                <span>•</span>
                <span>5 MIN READ</span>
            </div>
            <h3 className="text-xl font-bold leading-tight group-hover:text-red-500 transition-colors">
                {title}
            </h3>
        </div>
    )
}

function DriverCard({ name, team, points, image, rank }: { name: string, team: string, points: number, image: string, rank: number }) {
    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10 rounded-2xl" />
            <div className="relative h-[400px] rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
                <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 z-20">
                    <div className="w-10 h-10 rounded-full bg-white text-black font-black flex items-center justify-center text-xl">
                        {rank}
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">{team}</div>
                    <h3 className="text-2xl font-black uppercase italic mb-2">{name}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-white">{points}</span>
                        <span className="text-sm font-medium text-zinc-400">PTS</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
