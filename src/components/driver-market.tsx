"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle } from "lucide-react"
import { getStandings, DriverStanding } from "@/lib/api"

interface DriverMarketProps {
    year?: number
}

export function DriverMarket({ year = new Date().getFullYear() }: DriverMarketProps) {
    const [drivers, setDrivers] = useState<DriverStanding[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        setLoading(true)
        getStandings(year)
            .then((data) => {
                if (active) setDrivers(data.drivers || [])
            })
            .catch(() => {
                if (active) setDrivers([])
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [year])

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Users className="w-5 h-5 text-blue-500" />
                    {year} Grid Lineup
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[340px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-6 text-xs font-mono text-zinc-500 animate-pulse">Loading grid seats...</div>
                ) : drivers.length === 0 ? (
                    <div className="p-6 text-xs text-zinc-500">No grid seat data available for {year}.</div>
                ) : (
                    <div className="divide-y divide-zinc-800/50">
                        {drivers.slice(0, 10).map((driver) => {
                            const teamHex = `#${(driver.color || "71717A").replace(/^#/, "")}`
                            return (
                                <div
                                    key={`${driver.pos}-${driver.driverId || driver.code}`}
                                    className="flex items-center justify-between p-3.5 hover:bg-zinc-800/30 transition-colors"
                                >
                                    <div className="min-w-0 pr-2">
                                        <div className="font-bold text-sm truncate flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0"
                                                style={{ backgroundColor: teamHex }}
                                            />
                                            {driver.name}
                                        </div>
                                        <div className="text-xs text-zinc-500 uppercase font-mono flex items-center gap-1 mt-0.5 truncate">
                                            Team: <span className="text-zinc-200">{driver.team}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-green-500 text-[10px] uppercase font-bold border border-green-900/50 bg-green-950/30 px-2 py-1 rounded shrink-0">
                                        <CheckCircle className="w-3 h-3" /> {driver.code || `P${driver.pos}`}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
