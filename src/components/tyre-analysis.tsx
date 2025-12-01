"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleDashed } from "lucide-react"
import { getTyreStints } from "@/lib/api"

interface TyreAnalysisProps {
    year?: number
    location?: string
    sessionType?: string
}

export function TyreAnalysis({ year = 2025, location = "Lusail", sessionType = "Race" }: TyreAnalysisProps) {
    const [stints, setStints] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getTyreStints(year, location, sessionType)
            .then((data) => {
                if (data.stints) {
                    setStints(data.stints)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [year, location, sessionType])

    // Find Max Verstappen's or the winner's stints as default/example
    const displayStint = stints.find(s => s.driver === "VER")?.stints[0] || stints[0]?.stints[0]

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

    if (!displayStint) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 h-full">
                <CardHeader className="py-3 px-4 border-b border-zinc-800/50">
                    <CardTitle className="text-xs font-mono uppercase text-zinc-400">Tyre Data Unavailable</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-zinc-500 text-xs">No stint data available.</CardContent>
            </Card>
        )
    }

    const compoundColor = displayStint.compound === 'SOFT' ? 'text-red-500' :
        displayStint.compound === 'MEDIUM' ? 'text-yellow-500' :
            displayStint.compound === 'HARD' ? 'text-white' : 'text-green-500'

    const compoundBg = displayStint.compound === 'SOFT' ? 'bg-red-600' :
        displayStint.compound === 'MEDIUM' ? 'bg-yellow-500' :
            displayStint.compound === 'HARD' ? 'bg-zinc-200' : 'bg-green-600'

    const compoundBorder = displayStint.compound === 'SOFT' ? '#ef4444' :
        displayStint.compound === 'MEDIUM' ? '#eab308' :
            displayStint.compound === 'HARD' ? '#ffffff' : '#22c55e'

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 h-full flex flex-col group hover:border-zinc-700 transition-colors overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <CircleDashed className={`w-3 h-3 ${compoundColor}`} />
                    Tyre Analysis
                </CardTitle>
                <span className={`text-[10px] font-bold ${compoundBg} text-black px-1.5 py-0.5 rounded-sm`}>
                    {displayStint.compound}
                </span>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col justify-center relative">
                {/* Background Glow */}
                <div className={`absolute inset-0 ${displayStint.compound === 'SOFT' ? 'bg-red-600/5' : 'bg-yellow-500/5'} blur-3xl rounded-full transform scale-75`} />

                <div className="flex items-center justify-between gap-6 relative z-10">
                    {/* Tyre Graphic */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-[8px] border-zinc-800 relative flex items-center justify-center shadow-2xl bg-zinc-950">
                            {/* Tyre Wear Ring */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90 transform scale-110">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="40%"
                                    fill="none"
                                    stroke={compoundBorder}
                                    strokeWidth="3"
                                    strokeDasharray="251.2"
                                    strokeDashoffset="62.8" // 75% filled
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                                />
                            </svg>

                            {/* Inner Content */}
                            <div className="flex flex-col items-center">
                                <span className="text-2xl font-black text-white leading-none">{displayStint.laps}</span>
                                <span className="text-[9px] uppercase tracking-widest text-zinc-500 mt-1">Laps</span>
                            </div>

                            {/* Tyre Letter */}
                            <div className={`absolute -bottom-2 -right-2 ${compoundBg} text-black font-black w-8 h-8 rounded-full flex items-center justify-center border-4 border-zinc-950 shadow-lg text-sm`}>
                                {displayStint.compound[0]}
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Stint Length</span>
                                <span className="text-sm font-bold text-white">{displayStint.laps} <span className="text-[10px] text-zinc-500 font-normal">Laps</span></span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-800">
                                <div className="h-full w-[60%] bg-zinc-400 rounded-full" />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1.5">
                                <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Performance</span>
                                <span className="text-sm font-bold text-green-500">Optimal</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-800">
                                <div className="h-full w-[85%] bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.3)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
