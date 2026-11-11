"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer, ArrowRight } from "lucide-react"
import { getTyreStints, DriverStints } from "@/lib/api"

interface StrategyPredictorProps {
    year?: number
    location?: string
    sessionType?: string
    driverId?: string
    driverCode?: string
}

const COMPOUND_DOT: Record<string, { dot: string; bar: string; label: string }> = {
    SOFT: { dot: "bg-red-500 ring-red-500/20", bar: "bg-red-500", label: "Soft" },
    MEDIUM: { dot: "bg-yellow-500 ring-yellow-500/20", bar: "bg-yellow-500", label: "Medium" },
    HARD: { dot: "bg-white ring-white/20", bar: "bg-zinc-200", label: "Hard" },
    INTERMEDIATE: { dot: "bg-green-500 ring-green-500/20", bar: "bg-green-500", label: "Inter" },
    WET: { dot: "bg-blue-500 ring-blue-500/20", bar: "bg-blue-500", label: "Wet" },
}

export function StrategyPredictor({
    year = 2025,
    location = "Lusail",
    sessionType = "Race",
    driverId,
    driverCode,
}: StrategyPredictorProps) {
    const queryKey = `${year}|${location}|${sessionType}`
    const [stints, setStints] = useState<DriverStints[]>([])
    const [loadedKey, setLoadedKey] = useState<string>("")
    const loading = loadedKey !== queryKey

    useEffect(() => {
        let active = true
        getTyreStints(year, location, sessionType)
            .then((data) => {
                if (active) setStints(data.stints || [])
            })
            .catch(() => {
                if (active) setStints([])
            })
            .finally(() => {
                if (active) setLoadedKey(queryKey)
            })
        return () => { active = false }
    }, [year, location, sessionType, queryKey])

    const targetDriver =
        stints.find((s) => (driverId && s.number === driverId) || (driverCode && s.driver === driverCode)) ||
        stints[0]

    const driverStints = targetDriver?.stints || []

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 h-full animate-pulse">
                <CardHeader className="py-3 px-4 border-b border-zinc-800">
                    <CardTitle className="text-xs font-mono uppercase text-zinc-400">Analyzing Strategy...</CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[150px]" />
            </Card>
        )
    }

    if (!targetDriver || driverStints.length === 0) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 h-full">
                <CardHeader className="py-3 px-4 border-b border-zinc-800">
                    <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                        <Timer className="w-3 h-3 text-purple-500" />
                        Stint Strategy
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs text-zinc-500">No stint breakdown available for this session.</CardContent>
            </Card>
        )
    }

    const totalLaps = Math.max(targetDriver.total_laps || driverStints.reduce((acc, s) => acc + s.laps, 0), 1)
    const pitStops = Math.max(0, driverStints.length - 1)
    const firstStint = driverStints[0]
    const firstPitPct = Math.min(92, Math.max(8, Math.round((firstStint.laps / totalLaps) * 100)))
    const firstPitLap = firstStint.lap_end || firstStint.laps
    const longestStint = driverStints.reduce((max, s) => (s.laps > max.laps ? s : max), driverStints[0])

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 h-full">
            <CardHeader className="py-3 px-4 border-b border-zinc-800 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <Timer className="w-3 h-3 text-purple-500" />
                    {targetDriver.driver} Strategy
                </CardTitle>
                <span className="text-[10px] font-bold bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                    {pitStops} {pitStops === 1 ? "STOP" : "STOPS"}
                </span>
            </CardHeader>
            <CardContent className="p-4">
                <div className="space-y-4">
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                        {driverStints.slice(0, 4).map((st, idx) => {
                            const meta = COMPOUND_DOT[(st.compound || "").toUpperCase()] || {
                                dot: "bg-zinc-400 ring-zinc-400/20",
                                bar: "bg-zinc-400",
                                label: st.compound || "?",
                            }
                            return (
                                <div key={st.stint} className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-2.5 rounded-full ring-2 ${meta.dot}`} />
                                    <span className="font-bold text-white">{meta.label}</span>
                                    <span className="text-[10px] font-mono text-zinc-500">({st.laps})</span>
                                    {idx < Math.min(driverStints.length, 4) - 1 && (
                                        <ArrowRight className="w-3 h-3 text-zinc-600 ml-0.5" />
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    <div className="relative pt-6 pb-2">
                        <div className="flex h-2 w-full bg-zinc-800 rounded-full overflow-hidden gap-0.5">
                            {driverStints.map((st) => {
                                const meta = COMPOUND_DOT[(st.compound || "").toUpperCase()] || {
                                    bar: "bg-zinc-400",
                                }
                                const widthPct = (st.laps / totalLaps) * 100
                                return (
                                    <div
                                        key={st.stint}
                                        className={`h-full ${meta.bar}`}
                                        style={{ width: `${widthPct}%` }}
                                        title={`Stint ${st.stint}: ${st.compound} (${st.laps} laps)`}
                                    />
                                )
                            })}
                        </div>

                        {pitStops > 0 && (
                            <div
                                className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                                style={{ left: `${firstPitPct}%` }}
                            >
                                <div className="text-[10px] font-mono text-zinc-400 mb-1 whitespace-nowrap">
                                    PIT L{firstPitLap}
                                </div>
                                <div className="w-0.5 h-7 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800">
                            <div className="text-zinc-500 mb-0.5">Total Distance</div>
                            <div className="font-mono font-bold text-white">{totalLaps} Laps</div>
                        </div>
                        <div className="bg-zinc-950/50 p-2 rounded border border-zinc-800">
                            <div className="text-zinc-500 mb-0.5">Longest Stint</div>
                            <div className="font-mono font-bold text-purple-400">
                                {longestStint.laps}L ({longestStint.compound?.[0] || "?"})
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
