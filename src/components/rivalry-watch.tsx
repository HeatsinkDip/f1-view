"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Swords } from "lucide-react"
import { getRivalry, RivalryDriver } from "@/lib/api"

interface RivalryWatchProps {
    year?: number
}

export function RivalryWatch({ year = new Date().getFullYear() }: RivalryWatchProps) {
    const [rivals, setRivals] = useState<RivalryDriver[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        setLoading(true)
        getRivalry(year)
            .then((data) => {
                if (active) setRivals(data.rivals || [])
            })
            .catch(() => {
                if (active) setRivals([])
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [year])

    if (loading || rivals.length < 2) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 h-full">
                <CardHeader className="py-3 px-4 border-b border-zinc-800">
                    <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                        <Swords className="w-3 h-3 text-white" />
                        Championship Battle
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center text-zinc-500 text-xs uppercase tracking-widest">
                    {loading ? "Loading Battle..." : `Awaiting ${year} Standings`}
                </CardContent>
            </Card>
        )
    }

    const driver1 = rivals[0]
    const driver2 = rivals[1]
    const gap = Math.abs(driver1.points - driver2.points)
    const c1 = `#${(driver1.color || "FF1801").replace(/^#/, "")}`
    const c2 = `#${(driver2.color || "FF8700").replace(/^#/, "")}`

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 h-full">
            <CardHeader className="py-3 px-4 border-b border-zinc-800 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <Swords className="w-3 h-3 text-white" />
                    {year} Title Battle
                </CardTitle>
                <span className="text-[10px] font-mono text-zinc-500">P1 vs P2</span>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-2 divide-x divide-zinc-800">
                    <div className="p-4 text-center relative overflow-hidden group">
                        <div
                            className="absolute inset-0 opacity-10 group-hover:opacity-25 transition-opacity"
                            style={{ background: `linear-gradient(to bottom, ${c1}, transparent)` }}
                        />
                        <div className="relative z-10">
                            <div className="text-4xl font-black italic mb-1">{driver1.code}</div>
                            <div className="text-[10px] font-mono text-zinc-400 uppercase mb-3 truncate px-1">{driver1.team}</div>
                            <div className="text-3xl font-bold text-white">{driver1.points}</div>
                            <div className="text-[10px] text-zinc-400 uppercase">{driver1.wins} Wins</div>
                        </div>
                    </div>

                    <div className="p-4 text-center relative overflow-hidden group">
                        <div
                            className="absolute inset-0 opacity-10 group-hover:opacity-25 transition-opacity"
                            style={{ background: `linear-gradient(to bottom, ${c2}, transparent)` }}
                        />
                        <div className="relative z-10">
                            <div className="text-4xl font-black italic mb-1">{driver2.code}</div>
                            <div className="text-[10px] font-mono text-zinc-400 uppercase mb-3 truncate px-1">{driver2.team}</div>
                            <div className="text-3xl font-bold text-white">{driver2.points}</div>
                            <div className="text-[10px] text-zinc-400 uppercase">{driver2.wins} Wins</div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-zinc-800 p-3 text-center bg-zinc-950/30">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest mr-2">Gap</span>
                    <span className="font-mono font-bold text-white">{gap} PTS</span>
                </div>
            </CardContent>
        </Card>
    )
}
