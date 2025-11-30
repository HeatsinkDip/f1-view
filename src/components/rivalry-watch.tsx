"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Swords } from "lucide-react"
import { getRivalry } from "@/lib/api"

export function RivalryWatch() {
    const [rivals, setRivals] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getRivalry(2025)
            .then((data) => {
                if (data.rivals) {
                    setRivals(data.rivals)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading || rivals.length < 2) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 h-full animate-pulse">
                <CardHeader className="py-3 px-4 border-b border-zinc-800">
                    <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                        <Swords className="w-3 h-3 text-white" />
                        Championship Battle
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center text-zinc-500 text-xs uppercase tracking-widest">
                    Loading Battle...
                </CardContent>
            </Card>
        )
    }

    const driver1 = rivals[0]
    const driver2 = rivals[1]
    const gap = Math.abs(driver1.points - driver2.points)

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 h-full">
            <CardHeader className="py-3 px-4 border-b border-zinc-800">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <Swords className="w-3 h-3 text-white" />
                    Championship Battle
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-2 divide-x divide-zinc-800">
                    {/* Driver 1 */}
                    <div className="p-4 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="text-4xl font-black italic mb-1">{driver1.code}</div>
                            <div className="text-[10px] font-mono text-zinc-500 uppercase mb-4 truncate px-2">{driver1.team}</div>
                            <div className="text-3xl font-bold text-white">{driver1.points}</div>
                            <div className="text-[10px] text-zinc-400 uppercase">Points</div>
                        </div>
                    </div>

                    {/* Driver 2 */}
                    <div className="p-4 text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <div className="text-4xl font-black italic mb-1">{driver2.code}</div>
                            <div className="text-[10px] font-mono text-zinc-500 uppercase mb-4 truncate px-2">{driver2.team}</div>
                            <div className="text-3xl font-bold text-white">{driver2.points}</div>
                            <div className="text-[10px] text-zinc-400 uppercase">Points</div>
                        </div>
                    </div>
                </div>

                {/* Gap */}
                <div className="border-t border-zinc-800 p-3 text-center bg-zinc-950/30">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest mr-2">Gap</span>
                    <span className="font-mono font-bold text-white">{gap} PTS</span>
                </div>
            </CardContent>
        </Card>
    )
}
