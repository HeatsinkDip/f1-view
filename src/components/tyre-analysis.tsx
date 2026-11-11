"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleDashed } from "lucide-react"
import { getTyreStints, DriverStints } from "@/lib/api"

interface TyreAnalysisProps {
    year?: number
    location?: string
    sessionType?: string
    driverId?: string
    driverCode?: string
}

const COMPOUND_STYLES: Record<string, { text: string; bg: string; badgeText: string; hex: string; glow: string }> = {
    SOFT: { text: "text-red-600 dark:text-red-500", bg: "bg-red-600", badgeText: "text-white", hex: "#ef4444", glow: "bg-red-600/5" },
    MEDIUM: { text: "text-amber-600 dark:text-yellow-500", bg: "bg-yellow-500", badgeText: "text-zinc-950", hex: "#eab308", glow: "bg-yellow-500/5" },
    HARD: { text: "text-zinc-700 dark:text-zinc-200", bg: "bg-white border border-zinc-400 dark:border-zinc-500", badgeText: "text-zinc-950", hex: "#ffffff", glow: "bg-zinc-300/10" },
    INTERMEDIATE: { text: "text-emerald-700 dark:text-green-500", bg: "bg-green-500", badgeText: "text-zinc-950", hex: "#22c55e", glow: "bg-green-500/5" },
    WET: { text: "text-blue-600 dark:text-blue-500", bg: "bg-blue-600", badgeText: "text-white", hex: "#3b82f6", glow: "bg-blue-500/5" },
}

export function TyreAnalysis({ year = 2025, location = "Lusail", sessionType = "Race", driverId, driverCode }: TyreAnalysisProps) {
    const queryKey = `${year}|${location}|${sessionType}`
    const driverKey = driverId || driverCode || ""
    const [stints, setStints] = useState<DriverStints[]>([])
    const [stintSelection, setStintSelection] = useState<{ driverKey: string; index: number }>({
        driverKey: "",
        index: 0,
    })
    const [loadedKey, setLoadedKey] = useState<string>("")
    const loading = loadedKey !== queryKey
    const selectedStintIndex = stintSelection.driverKey === driverKey ? stintSelection.index : 0

    useEffect(() => {
        let active = true
        getTyreStints(year, location, sessionType)
            .then((data) => {
                if (!active) return
                setStints(data.stints || [])
            })
            .catch(() => {
                if (active) setStints([])
            })
            .finally(() => {
                if (active) setLoadedKey(queryKey)
            })
        return () => { active = false }
    }, [year, location, sessionType, queryKey])

    const driverRecord =
        stints.find((s) => (driverId && s.number === driverId) || (driverCode && s.driver === driverCode)) ||
        stints[0]

    const driverStints = driverRecord?.stints || []
    const displayStint = driverStints[selectedStintIndex] || driverStints[0]

    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-zinc-900/50 border-border h-full animate-pulse">
                <CardHeader className="py-3 px-4 border-b border-border/60">
                    <CardTitle className="text-xs font-mono uppercase text-muted-foreground">Loading Tyres...</CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[200px]" />
            </Card>
        )
    }

    if (!displayStint || !driverRecord) {
        return (
            <Card className="bg-card/80 dark:bg-zinc-900/50 border-border h-full">
                <CardHeader className="py-3 px-4 border-b border-border/60">
                    <CardTitle className="text-xs font-mono uppercase text-muted-foreground">Tyre Data Unavailable</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-muted-foreground text-xs">No stint data available.</CardContent>
            </Card>
        )
    }

    const compound = (displayStint.compound || "UNKNOWN").toUpperCase()
    const style = COMPOUND_STYLES[compound] || { text: "text-foreground", bg: "bg-zinc-400", badgeText: "text-zinc-950", hex: "#a1a1aa", glow: "bg-zinc-500/5" }
    const totalSessionLaps = Math.max(driverRecord.race_laps || driverRecord.total_laps || 1, 1)
    const stintPct = Math.min(100, Math.round((displayStint.laps / totalSessionLaps) * 100))
    const circumference = 251.2
    const dashOffset = circumference - (circumference * Math.min(100, stintPct)) / 100

    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border h-full flex flex-col group hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-border/60 bg-card/80 dark:bg-zinc-900/50 backdrop-blur-sm flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                    <CircleDashed className={`w-3 h-3 ${style.text}`} />
                    {driverRecord.driver} Tyres
                </CardTitle>
                <div className="flex items-center gap-1.5">
                    {driverStints.length > 1 && (
                        <div className="flex gap-1">
                            {driverStints.map((st, idx) => (
                                <button
                                    key={st.stint}
                                    type="button"
                                    onClick={() => setStintSelection({ driverKey, index: idx })}
                                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                                        idx === selectedStintIndex
                                            ? "bg-foreground text-background font-bold"
                                            : "bg-muted text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    S{st.stint}
                                </button>
                            ))}
                        </div>
                    )}
                    <span className={`text-[10px] font-bold ${style.bg} ${style.badgeText} px-1.5 py-0.5 rounded-sm`}>
                        {compound}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-center relative">
                <div className={`absolute inset-0 ${style.glow} blur-3xl rounded-full transform scale-75`} />

                <div className="flex items-center justify-between gap-5 relative z-10">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-full border-[7px] border-zinc-800 relative flex items-center justify-center shadow-xl dark:shadow-2xl bg-zinc-950">
                            <svg className="absolute inset-0 w-full h-full -rotate-90 transform scale-110">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="40%"
                                    fill="none"
                                    stroke={style.hex}
                                    strokeWidth="3"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                />
                            </svg>

                            <div className="flex flex-col items-center">
                                <span className="text-xl font-black text-white leading-none">{displayStint.laps}</span>
                                <span className="text-[9px] uppercase tracking-widest text-zinc-400 mt-0.5">Laps</span>
                            </div>

                            <div className={`absolute -bottom-2 -right-2 ${style.bg} ${style.badgeText} font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-card shadow-lg text-xs`}>
                                {compound[0]}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Stint Share</span>
                                <span className="text-xs font-bold text-foreground">{displayStint.laps} / {totalSessionLaps} L</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border">
                                <div className="h-full bg-foreground/75 rounded-full" style={{ width: `${stintPct}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Window</span>
                                <span className="text-xs font-mono text-foreground">
                                    {displayStint.lap_start && displayStint.lap_end
                                        ? `L${displayStint.lap_start}–L${displayStint.lap_end}`
                                        : `${driverStints.length} Stint${driverStints.length > 1 ? "s" : ""}`}
                                </span>
                            </div>
                            <div className="flex gap-1 h-1.5 w-full">
                                {driverStints.map((st, idx) => {
                                    const stColor = COMPOUND_STYLES[(st.compound || "").toUpperCase()]?.bg || "bg-zinc-500"
                                    return (
                                        <div
                                            key={st.stint}
                                            className={`h-full rounded-full ${stColor} ${idx === selectedStintIndex ? "opacity-100" : "opacity-40"}`}
                                            style={{ width: `${Math.max(8, (st.laps / totalSessionLaps) * 100)}%` }}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
