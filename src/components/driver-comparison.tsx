"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { Users, Zap, AlertCircle } from "lucide-react"
import { getSessionDrivers, getDriverTelemetry, Driver, TelemetryPoint } from "@/lib/api"

interface DriverComparisonProps {
    year?: number
    location?: string
    sessionType?: string
}

function findClosestSpeed(points: TelemetryPoint[], distance: number): number | null {
    if (!points.length) return null
    let best: TelemetryPoint | null = null
    let bestDiff = Infinity
    for (const p of points) {
        const diff = Math.abs(p.distance - distance)
        if (diff < bestDiff) {
            bestDiff = diff
            best = p
        }
    }
    return best && bestDiff <= 150 ? best.speed : null
}

export function DriverComparison({
    year = new Date().getFullYear(),
    location = "Lusail",
    sessionType = "Race",
}: DriverComparisonProps) {
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [driver1Id, setDriver1Id] = useState<string>("")
    const [driver2Id, setDriver2Id] = useState<string>("")
    const [telemetryData, setTelemetryData] = useState<{ distance: number; speed1: number; speed2: number | null }[]>([])
    const [loading, setLoading] = useState(true)
    const [chartLoading, setChartLoading] = useState(false)

    useEffect(() => {
        let active = true
        setLoading(true)
        setDrivers([])
        setDriver1Id("")
        setDriver2Id("")
        setTelemetryData([])

        getSessionDrivers(year, location, sessionType)
            .then((driversList) => {
                if (!active) return
                setDrivers(driversList)
                if (driversList.length >= 2) {
                    setDriver1Id(driversList[0].id)
                    setDriver2Id(driversList[1].id)
                } else if (driversList.length === 1) {
                    setDriver1Id(driversList[0].id)
                }
            })
            .catch(() => {
                if (active) setDrivers([])
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [year, location, sessionType])

    useEffect(() => {
        if (!driver1Id || !driver2Id) return
        let active = true
        setChartLoading(true)

        Promise.all([
            getDriverTelemetry(year, location, sessionType, driver1Id, 180),
            getDriverTelemetry(year, location, sessionType, driver2Id, 180),
        ])
            .then(([t1, t2]) => {
                if (!active) return
                const data1 = t1.telemetry || []
                const data2 = t2.telemetry || []
                const merged = data1.map((pt) => ({
                    distance: pt.distance,
                    speed1: pt.speed,
                    speed2: findClosestSpeed(data2, pt.distance),
                }))
                setTelemetryData(merged)
            })
            .catch(() => {
                if (active) setTelemetryData([])
            })
            .finally(() => {
                if (active) setChartLoading(false)
            })

        return () => { active = false }
    }, [driver1Id, driver2Id, year, location, sessionType])

    const d1 = drivers.find((d) => d.id === driver1Id)
    const d2 = drivers.find((d) => d.id === driver2Id)

    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-border/60">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-muted-foreground">
                        Loading Analysis...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[300px]" />
            </Card>
        )
    }

    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/60">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Users className="w-5 h-5 text-red-600" />
                    Head-to-Head Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground uppercase font-mono">Driver 1</label>
                        <Select value={driver1Id} onValueChange={setDriver1Id}>
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Select driver" />
                            </SelectTrigger>
                            <SelectContent>
                                {drivers.map((d) => (
                                    <SelectItem key={d.id} value={d.id} disabled={d.id === driver2Id}>
                                        {d.code} - {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 mt-2">
                            <div
                                className="w-3 h-3 rounded-full border border-border/60"
                                style={{ backgroundColor: d1?.color ? `#${d1.color.replace(/^#/, "")}` : "#71717A" }}
                            />
                            <span className="text-sm font-bold text-foreground">{d1?.team || "--"}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground uppercase font-mono">Driver 2</label>
                        <Select value={driver2Id} onValueChange={setDriver2Id}>
                            <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Select driver" />
                            </SelectTrigger>
                            <SelectContent>
                                {drivers.map((d) => (
                                    <SelectItem key={d.id} value={d.id} disabled={d.id === driver1Id}>
                                        {d.code} - {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 mt-2">
                            <div
                                className="w-3 h-3 rounded-full border border-border/60"
                                style={{ backgroundColor: d2?.color ? `#${d2.color.replace(/^#/, "")}` : "#71717A" }}
                            />
                            <span className="text-sm font-bold text-foreground">{d2?.team || "--"}</span>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full relative">
                    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground font-mono uppercase">
                        <Zap className="w-4 h-4 text-amber-600 dark:text-yellow-500" />
                        Speed Comparison (km/h)
                    </div>

                    {chartLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm z-10">
                            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {telemetryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={telemetryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis
                                    dataKey="distance"
                                    stroke="var(--muted-foreground)"
                                    tickFormatter={(val) => `${(val / 1000).toFixed(1)}km`}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="var(--muted-foreground)"
                                    domain={["auto", "auto"]}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)", borderRadius: "0.5rem" }}
                                    itemStyle={{ color: "var(--card-foreground)" }}
                                    labelStyle={{ color: "var(--muted-foreground)" }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="speed1"
                                    name={d1?.code || "Driver 1"}
                                    stroke={d1?.color ? `#${d1.color.replace(/^#/, "")}` : "#3b82f6"}
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="speed2"
                                    name={d2?.code || "Driver 2"}
                                    stroke={d2?.color ? `#${d2.color.replace(/^#/, "")}` : "#ef4444"}
                                    strokeWidth={2}
                                    dot={false}
                                    strokeDasharray="5 5"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                            <p>No telemetry data available for comparison</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
