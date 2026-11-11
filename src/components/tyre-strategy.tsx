"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleDot } from "lucide-react"
import { getTyreStints, DriverStints } from "@/lib/api"

interface TyreStrategyProps {
    year?: number
    location?: string
    sessionType?: string
}

const COMPOUND_COLORS: Record<string, string> = {
    SOFT: "bg-red-600 text-white",
    MEDIUM: "bg-yellow-500 text-zinc-950",
    HARD: "bg-white text-zinc-950",
    INTERMEDIATE: "bg-green-500 text-zinc-950",
    WET: "bg-blue-600 text-white",
}

export function TyreStrategy({
    year = new Date().getFullYear(),
    location = "Lusail",
    sessionType = "Race",
}: TyreStrategyProps) {
    const [strategies, setStrategies] = useState<DriverStints[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        setLoading(true)
        getTyreStints(year, location, sessionType)
            .then((data) => {
                if (active) setStrategies(data.stints || [])
            })
            .catch(() => {
                if (active) setStrategies([])
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [year, location, sessionType])

    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-muted-foreground">
                        Loading Strategy...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[200px]" />
            </Card>
        )
    }

    const displayStrategies = strategies.slice(0, 5)
    const maxRaceLaps = Math.max(
        1,
        ...strategies.map((s) => s.race_laps || s.total_laps || 0)
    )

    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <CircleDot className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                    Tyre Strategy
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {displayStrategies.length === 0 ? (
                    <div className="h-[180px] flex items-center justify-center text-sm font-mono text-muted-foreground">
                        No tyre stint data available.
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {displayStrategies.map((strat) => {
                                const totalBase = Math.max(strat.race_laps || maxRaceLaps, strat.total_laps || 1, 1)
                                const stops = Math.max(0, (strat.stints?.length || 1) - 1)
                                return (
                                    <div key={strat.driver}>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className="font-bold text-base text-foreground flex items-center gap-2">
                                                <span
                                                    className="inline-block w-2 h-2 rounded-full border border-border/50"
                                                    style={{ backgroundColor: `#${(strat.color || "71717A").replace(/^#/, "")}` }}
                                                />
                                                {strat.driver}
                                            </div>
                                            <div className="text-xs text-muted-foreground uppercase font-mono">
                                                {stops} {stops === 1 ? "Stop" : "Stops"}
                                            </div>
                                        </div>
                                        <div className="flex h-7 rounded-full overflow-hidden bg-muted dark:bg-zinc-800 border border-border/70">
                                            {strat.stints.map((stint, sIdx) => {
                                                const color =
                                                    COMPOUND_COLORS[(stint.compound || "").toUpperCase()] || "bg-zinc-400 text-black"
                                                return (
                                                    <div
                                                        key={`${stint.stint}-${sIdx}`}
                                                        className={`${color} h-full flex items-center justify-center font-bold text-xs border-r border-black/20 last:border-0`}
                                                        style={{ width: `${(stint.laps / totalBase) * 100}%` }}
                                                        title={`${stint.compound} (${stint.laps} Laps)`}
                                                    >
                                                        {stint.laps > 4 ? `${stint.laps}L` : ""}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-7 grid grid-cols-3 gap-2 text-center text-foreground">
                            <div className="flex items-center gap-2 justify-center">
                                <div className="w-3 h-3 rounded-full bg-red-600" />
                                <span className="text-xs uppercase font-mono">Soft</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span className="text-xs uppercase font-mono">Medium</span>
                            </div>
                            <div className="flex items-center gap-2 justify-center">
                                <div className="w-3 h-3 rounded-full bg-white border border-zinc-400 dark:border-zinc-500" />
                                <span className="text-xs uppercase font-mono">Hard</span>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
