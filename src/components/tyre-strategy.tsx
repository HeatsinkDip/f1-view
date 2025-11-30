"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleDot } from "lucide-react"
import { getTyreStints } from "@/lib/api"

interface TyreStrategyProps {
    year?: number
    location?: string
    sessionType?: string
}

export function TyreStrategy({ year = 2024, location = "Lusail", sessionType = "Race" }: TyreStrategyProps) {
    const [strategies, setStrategies] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getTyreStints(year, location, sessionType)
            .then((data) => {
                setStrategies(data.stints || [])
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false))
    }, [year, location, sessionType])

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-zinc-500">
                        Loading Strategy...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[200px]" />
            </Card>
        )
    }

    // Limit to top 5 drivers to avoid clutter
    const displayStrategies = strategies.slice(0, 5)

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <CircleDot className="w-5 h-5 text-purple-500" />
                    Tyre Strategy
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="space-y-8">
                    {displayStrategies.map((strat, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-bold text-lg">{strat.driver}</div>
                                <div className="text-xs text-zinc-500 uppercase font-mono">{strat.stints.length - 1} Stops</div>
                            </div>
                            <div className="flex h-8 rounded-full overflow-hidden bg-zinc-800">
                                {strat.stints.map((stint: any, sIdx: number) => {
                                    let color = "bg-white"
                                    if (stint.compound === "SOFT") color = "bg-red-600"
                                    if (stint.compound === "MEDIUM") color = "bg-yellow-500"
                                    if (stint.compound === "HARD") color = "bg-white"
                                    if (stint.compound === "INTERMEDIATE") color = "bg-green-500"
                                    if (stint.compound === "WET") color = "bg-blue-600"

                                    return (
                                        <div
                                            key={sIdx}
                                            className={`${color} h-full flex items-center justify-center text-black font-bold text-xs border-r border-black/20 last:border-0`}
                                            style={{ width: `${(stint.laps / 57) * 100}%` }} // Assuming 57 laps for now, ideally dynamic
                                            title={`${stint.compound} (${stint.laps} Laps)`}
                                        >
                                            {stint.laps > 5 ? `${stint.laps}L` : ''}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2 text-center">
                    <div className="flex items-center gap-2 justify-center">
                        <div className="w-3 h-3 rounded-full bg-red-600" />
                        <span className="text-xs uppercase font-mono">Soft</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <span className="text-xs uppercase font-mono">Medium</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <div className="w-3 h-3 rounded-full bg-white" />
                        <span className="text-xs uppercase font-mono">Hard</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
