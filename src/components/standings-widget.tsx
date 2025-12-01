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
                                {standings.drivers.map((driver: any) => {
                                    // Helper to format driver name for F1 media URL
                                    // e.g. "Max Verstappen" -> "maxver01" or similar? 
                                    // Actually F1 uses a specific ID. Let's use a simpler source or a mapping if possible.
                                    // Let's try to use the driver code for a placeholder or a generic reliable source.
                                    // A better approach for now might be to use a mapping for the top drivers and a fallback.

                                    // Let's use a mapping for top drivers to ensure they look good.
                                    const driverImageMap: Record<string, string> = {
                                        "VER": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/2col/image.png",
                                        "NOR": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/2col/image.png",
                                        "HAM": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/2col/image.png",
                                        "LEC": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/2col/image.png",
                                        "PIA": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/2col/image.png",
                                        "SAI": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/2col/image.png",
                                        "RUS": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/2col/image.png",
                                        "PER": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/2col/image.png",
                                        "ALO": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/2col/image.png",
                                    }

                                    // Fallback to a generic pattern if not in map (might break, but better than nothing)
                                    // Actually, let's just use the map and a default avatar for others to be safe.
                                    const imageUrl = driverImageMap[driver.code] || "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/driver_fallback_image.png"

                                    return (
                                        <div key={driver.pos} className="flex items-center p-3 hover:bg-zinc-800/30 transition-colors group relative overflow-hidden">
                                            {/* Team Color Bar */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${driver.team.includes('Red Bull') ? 'bg-blue-600' :
                                                    driver.team.includes('McLaren') ? 'bg-orange-500' :
                                                        driver.team.includes('Ferrari') ? 'bg-red-600' :
                                                            driver.team.includes('Mercedes') ? 'bg-teal-500' :
                                                                driver.team.includes('Aston') ? 'bg-green-600' :
                                                                    'bg-zinc-600'
                                                }`} />

                                            <div className="w-8 font-black text-xl italic text-zinc-600 group-hover:text-white transition-colors text-center">
                                                {driver.pos}
                                            </div>

                                            {/* Driver Image */}
                                            <div className="w-12 h-12 relative mx-3 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900">
                                                <img
                                                    src={imageUrl}
                                                    alt={driver.name}
                                                    className="w-full h-full object-cover object-top transform scale-125 pt-1"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/driver_fallback_image.png"
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-base leading-none truncate">{driver.name}</div>
                                                <div className="text-[10px] text-zinc-500 uppercase font-mono mt-1 truncate">{driver.team}</div>
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
                            <div className="divide-y divide-zinc-800/50 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {standings.constructors.map((team: any) => (
                                    <div key={team.pos} className="flex items-center p-4 hover:bg-zinc-800/30 transition-colors group relative overflow-hidden">
                                        {/* Team Color Bar */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${team.name.includes('Red Bull') ? 'bg-blue-600' :
                                                team.name.includes('McLaren') ? 'bg-orange-500' :
                                                    team.name.includes('Ferrari') ? 'bg-red-600' :
                                                        team.name.includes('Mercedes') ? 'bg-teal-500' :
                                                            team.name.includes('Aston') ? 'bg-green-600' :
                                                                'bg-zinc-600'
                                            }`} />

                                        <div className="w-8 font-black text-xl italic text-zinc-600 group-hover:text-white transition-colors text-center">
                                            {team.pos}
                                        </div>
                                        <div className="flex-1 pl-4">
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
