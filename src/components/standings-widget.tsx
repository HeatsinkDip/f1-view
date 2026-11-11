"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, AlertCircle } from "lucide-react"
import { getStandings, DriverStanding, ConstructorStanding } from "@/lib/api"

const FALLBACK_AVATAR =
    "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/driver_fallback_image.png"

interface StandingsWidgetProps {
    year?: number
}

function teamHex(rawColor?: string): string {
    const clean = (rawColor || "").replace(/^#/, "").trim()
    return clean ? `#${clean}` : "#71717A"
}

export function StandingsWidget({ year = new Date().getFullYear() }: StandingsWidgetProps) {
    const [standings, setStandings] = useState<{
        drivers: DriverStanding[]
        constructors: ConstructorStanding[]
    }>({ drivers: [], constructors: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let active = true
        setLoading(true)
        setError(null)
        getStandings(year)
            .then((data) => {
                if (!active) return
                setStandings({
                    drivers: data.drivers || [],
                    constructors: data.constructors || [],
                })
            })
            .catch((err: unknown) => {
                if (!active) return
                setError(err instanceof Error ? err.message : "Failed to load standings")
                setStandings({ drivers: [], constructors: [] })
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [year])

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-zinc-500">
                        Loading {year} Standings...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[300px]" />
            </Card>
        )
    }

    const hasData = standings.drivers.length > 0 || standings.constructors.length > 0

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {year} Standings
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {!hasData ? (
                    <div className="flex flex-col items-center justify-center h-[300px] p-6 text-center text-zinc-500">
                        <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
                        <p className="text-lg font-bold uppercase">
                            {error ? "Standings Error" : "No Standings Data Available"}
                        </p>
                        <p className="text-sm mt-2">
                            {error || `The ${year} season standings are not published yet.`}
                        </p>
                    </div>
                ) : (
                    <Tabs defaultValue="drivers" className="w-full">
                        <TabsList className="w-full grid grid-cols-2 bg-zinc-950/50 p-1 rounded-none border-b border-zinc-800">
                            <TabsTrigger
                                value="drivers"
                                className="uppercase tracking-widest font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-sm"
                            >
                                Drivers
                            </TabsTrigger>
                            <TabsTrigger
                                value="constructors"
                                className="uppercase tracking-widest font-bold data-[state=active]:bg-red-600 data-[state=active]:text-white rounded-sm"
                            >
                                Constructors
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="drivers" className="m-0">
                            <div className="divide-y divide-zinc-800/50 max-h-[460px] overflow-y-auto custom-scrollbar">
                                {standings.drivers.map((driver) => {
                                    const barColor = teamHex(driver.color)
                                    const imageUrl = driver.image || FALLBACK_AVATAR

                                    return (
                                        <div
                                            key={`${driver.pos}-${driver.driverId || driver.code}`}
                                            className="flex items-center p-3 hover:bg-zinc-800/30 transition-colors group relative overflow-hidden"
                                        >
                                            <div
                                                className="absolute left-0 top-0 bottom-0 w-1"
                                                style={{ backgroundColor: barColor }}
                                            />

                                            <div className="w-8 font-black text-xl italic text-zinc-600 group-hover:text-white transition-colors text-center">
                                                {driver.pos}
                                            </div>

                                            <div className="w-11 h-11 relative mx-3 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 shrink-0">
                                                <img
                                                    src={imageUrl}
                                                    alt={driver.name}
                                                    className="w-full h-full object-cover object-top transform scale-125 pt-1"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = FALLBACK_AVATAR
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-base leading-none truncate">
                                                    {driver.name}
                                                </div>
                                                <div className="text-[10px] text-zinc-500 uppercase font-mono mt-1 truncate">
                                                    {driver.code ? `${driver.code} · ` : ""}{driver.team}
                                                </div>
                                            </div>
                                            <div className="text-right pl-2">
                                                <div className="font-black text-lg text-red-500">{driver.points}</div>
                                                <div className="text-[9px] text-zinc-600 uppercase font-mono">PTS</div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </TabsContent>

                        <TabsContent value="constructors" className="m-0">
                            <div className="divide-y divide-zinc-800/50 max-h-[460px] overflow-y-auto custom-scrollbar">
                                {standings.constructors.map((team) => (
                                    <div
                                        key={`${team.pos}-${team.name}`}
                                        className="flex items-center p-4 hover:bg-zinc-800/30 transition-colors group relative overflow-hidden"
                                    >
                                        <div
                                            className="absolute left-0 top-0 bottom-0 w-1"
                                            style={{ backgroundColor: teamHex(team.color) }}
                                        />

                                        <div className="w-8 font-black text-xl italic text-zinc-600 group-hover:text-white transition-colors text-center">
                                            {team.pos}
                                        </div>
                                        <div className="flex-1 pl-4 min-w-0">
                                            <div className="font-bold text-lg leading-none truncate">{team.name}</div>
                                            <div className="text-[10px] text-zinc-500 font-mono uppercase mt-1">
                                                {team.wins} {team.wins === 1 ? "Win" : "Wins"}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-xl text-red-500">{team.points}</div>
                                            <div className="text-[10px] text-zinc-600 uppercase font-mono">PTS</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    )
}
