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

const COMPOUND_STYLES: Record<string, { text: string; bg: string; hex: string; glow: string }> = {
    SOFT: { text: "text-red-500", bg: "bg-red-600", hex: "#ef4444", glow: "bg-red-600/5" },
    MEDIUM: { text: "text-yellow-500", bg: "bg-yellow-500", hex: "#eab308", glow: "bg-yellow-500/5" },
    HARD: { text: "text-white", bg: "bg-zinc-200", hex: "#ffffff", glow: "bg-zinc-300/5" },
    INTERMEDIATE: { text: "text-green-500", bg: "bg-green-500", hex: "#22c55e", glow: "bg-green-500/5" },
    WET: { text: "text-blue-500", bg: "bg-blue-500", hex: "#3b82f6", glow: "bg-blue-500/5" },
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
            <Card className="bg-zinc-900/50 border-zinc-800 h-full animate-pulse">
                <CardHeader className="py-3 px-4 border-b border-zinc-800/50">
                    <CardTitle className="text-xs font-mono uppercase text-zinc-400">Loading Tyres...</CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[200px]" />
            </Card>
        )
    }

    if (!displayStint || !driverRecord) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 h-full">
                <CardHeader className="py-3 px-4 border-b border-zinc-800/50">
                    <CardTitle className="text-xs font-mono uppercase text-zinc-400">Tyre Data Unavailable</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-zinc-500 text-xs">No stint data available.</CardContent>
            </Card>
        )
    }

    const compound = (displayStint.compound || "UNKNOWN").toUpperCase()
    const style = COMPOUND_STYLES[compound] || { text: "text-zinc-300", bg: "bg-zinc-400", hex: "#a1a1aa", glow: "bg-zinc-500/5" }
    const totalSessionLaps = Math.max(driverRecord.race_laps || driverRecord.total_laps || 1, 1)
    const stintPct = Math.min(100, Math.round((displayStint.laps / totalSessionLaps) * 100))
    const circumference = 251.2
    const dashOffset = circumference - (circumference * Math.min(100, stintPct)) / 100

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 h-full flex flex-col group hover:border-zinc-700 transition-colors overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm flex flex-row items-center justify-between gap-2">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
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
                                            ? "bg-zinc-700 text-white font-bold"
                                            : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                                    }`}
                                >
                                    S{st.stint}
                                </button>
                            ))}
                        </div>
                    )}
                    <span className={`text-[10px] font-bold ${style.bg} text-black px-1.5 py-0.5 rounded-sm`}>
                        {compound}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-center relative">
                <div className={`absolute inset-0 ${style.glow} blur-3xl rounded-full transform scale-75`} />

                <div className="flex items-center justify-between gap-5 relative z-10">
                    <div className="relative shrink-0">
                        <div className="w-20 h-20 rounded-full border-[7px] border-zinc-800 relative flex items-center justify-center shadow-2xl bg-zinc-950">
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
                                <span className="text-[9px] uppercase tracking-widest text-zinc-500 mt-0.5">Laps</span>
                            </div>

                            <div className={`absolute -bottom-2 -right-2 ${style.bg} text-black font-black w-7 h-7 rounded-full flex items-center justify-center border-4 border-zinc-950 shadow-lg text-xs`}>
                                {compound[0]}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 min-w-0">
                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Stint Share</span>
                                <span className="text-xs font-bold text-white">{displayStint.laps} / {totalSessionLaps} L</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-800">
                                <div className="h-full bg-zinc-300 rounded-full" style={{ width: `${stintPct}%` }} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Window</span>
                                <span className="text-xs font-mono text-zinc-300">
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
