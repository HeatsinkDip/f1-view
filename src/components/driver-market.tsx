"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CheckCircle } from "lucide-react"
import { getStandings, DriverStanding } from "@/lib/api"
import { useAsyncData } from "@/lib/use-async-data"

interface DriverMarketProps {
    year?: number
}

const EMPTY_DRIVERS: DriverStanding[] = []

export function DriverMarket({ year = new Date().getFullYear() }: DriverMarketProps) {
    const { data: drivers, loading } = useAsyncData(
        `market:${year}`,
        () => getStandings(year).then((data) => data.drivers || []).catch(() => []),
        EMPTY_DRIVERS
    )

    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                    {year} Grid Lineup
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[340px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-6 text-xs font-mono text-muted-foreground animate-pulse">Loading grid seats...</div>
                ) : drivers.length === 0 ? (
                    <div className="p-6 text-xs text-muted-foreground">No grid seat data available for {year}.</div>
                ) : (
                    <div className="divide-y divide-border/60">
                        {drivers.slice(0, 10).map((driver) => {
                            const teamHex = `#${(driver.color || "71717A").replace(/^#/, "")}`
                            return (
                                <div
                                    key={`${driver.pos}-${driver.driverId || driver.code}`}
                                    className="flex items-center justify-between p-3.5 hover:bg-accent/50 transition-colors"
                                >
                                    <div className="min-w-0 pr-2">
                                        <div className="font-bold text-sm truncate flex items-center gap-2">
                                            <span
                                                className="w-2 h-2 rounded-full shrink-0 border border-border/50"
                                                style={{ backgroundColor: teamHex }}
                                            />
                                            {driver.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground uppercase font-mono flex items-center gap-1 mt-0.5 truncate">
                                            Team: <span className="text-foreground">{driver.team}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-emerald-700 dark:text-green-400 text-[10px] uppercase font-bold border border-emerald-600/30 dark:border-green-900/50 bg-emerald-500/10 px-2 py-1 rounded shrink-0">
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
