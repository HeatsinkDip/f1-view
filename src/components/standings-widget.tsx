"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, AlertCircle } from "lucide-react"
import { getStandings } from "@/lib/api"

export function StandingsWidget() {
    const [standings, setStandings] = useState<{ drivers: any[], constructors: any[] }>({ drivers: [], constructors: [] })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        getStandings(2025)
            .then((data) => {
                setStandings({
                    drivers: data.drivers || [],
                    constructors: data.constructors || []
                })
            })
            .catch((err) => {
                console.error(err)
                setError("Failed to load standings")
            })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-zinc-500">
                        Loading Standings...
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
                    Championship Standings
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {!hasData ? (
                    <div className="flex flex-col items-center justify-center h-[300px] p-6 text-center text-zinc-500">
                        <AlertCircle className="w-10 h-10 mb-4 opacity-50" />
                        <p className="text-lg font-bold uppercase">No Standings Data Available</p>
                        <p className="text-sm mt-2">The 2025 season has not started yet.</p>
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
                            <div className="divide-y divide-zinc-800/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {standings.drivers.map((driver: any) => (
                                    <div key={driver.pos} className="flex items-center p-4 hover:bg-zinc-800/30 transition-colors group">
                                        <div className="w-8 font-black text-xl italic text-zinc-600 group-hover:text-white transition-colors">
                                            {driver.pos}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-lg leading-none">{driver.name}</div>
                                            <div className="text-xs text-zinc-500 uppercase font-mono mt-1">{driver.team}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-black text-xl text-red-500">{driver.points}</div>
                                            <div className="text-[10px] text-zinc-600 uppercase font-mono">PTS</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="constructors" className="m-0">
                            <div className="divide-y divide-zinc-800/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {standings.constructors.map((team: any) => (
                                    <div key={team.pos} className="flex items-center p-4 hover:bg-zinc-800/30 transition-colors group">
                                        <div className="w-8 font-black text-xl italic text-zinc-600 group-hover:text-white transition-colors">
                                            {team.pos}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-lg leading-none">{team.name}</div>
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
