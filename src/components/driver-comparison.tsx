"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { Users, Zap, AlertCircle } from "lucide-react"
import { getSessionDrivers, getDriverTelemetry } from "@/lib/api"

interface DriverComparisonProps {
    year?: number
    location?: string
    sessionType?: string
}

export function DriverComparison({ year = 2025, location = "Lusail", sessionType = "Race" }: DriverComparisonProps) {
    const [drivers, setDrivers] = useState<any[]>([])
    const [driver1Id, setDriver1Id] = useState<string>("")
    const [driver2Id, setDriver2Id] = useState<string>("")
    const [telemetryData, setTelemetryData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [chartLoading, setChartLoading] = useState(false)

    // Fetch drivers list
    useEffect(() => {
        getSessionDrivers(year, location, sessionType)
            .then((driversList) => {
                setDrivers(driversList)
                if (driversList.length >= 2) {
                    // Default to top 2 drivers
                    setDriver1Id(driversList[0].id)
                    setDriver2Id(driversList[1].id)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [year, location, sessionType])

    // Fetch telemetry when drivers change
    useEffect(() => {
        if (!driver1Id || !driver2Id) return

        setChartLoading(true)
        Promise.all([
            getDriverTelemetry(year, location, sessionType, driver1Id),
            getDriverTelemetry(year, location, sessionType, driver2Id)
        ])
            .then(([t1, t2]) => {
                // Merge telemetry data based on distance or time
                // For simplicity, we'll assume similar sampling and just map by index or distance
                // Real implementation would need interpolation for precise distance matching

                // Let's use t1 as base and find closest points in t2
                const merged = []
                const data1 = t1.telemetry || []
                const data2 = t2.telemetry || []

                // Simple merge by index for now (assuming same downsampling)
                const minLen = Math.min(data1.length, data2.length)
                for (let i = 0; i < minLen; i++) {
                    merged.push({
                        distance: data1[i].distance,
                        speed1: data1[i].speed,
                        speed2: data2[i].speed,
                    })
                }
                setTelemetryData(merged)
            })
            .catch(console.error)
            .finally(() => setChartLoading(false))
    }, [driver1Id, driver2Id, year, location, sessionType])

    const d1 = drivers.find(d => d.id === driver1Id)
    const d2 = drivers.find(d => d.id === driver2Id)

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-zinc-800/50">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-zinc-500">
                        Loading Analysis...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[300px]" />
            </Card>
        )
    }

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Users className="w-5 h-5 text-red-600" />
                    Head-to-Head Analysis
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 uppercase font-mono">Driver 1</label>
                        <Select value={driver1Id} onValueChange={setDriver1Id}>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {drivers.map(d => (
                                    <SelectItem key={d.id} value={d.id} disabled={d.id === driver2Id}>
                                        {d.code} - {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d1?.color ? `#${d1.color}` : '#fff' }} />
                            <span className="text-sm font-bold text-zinc-300">{d1?.team}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 uppercase font-mono">Driver 2</label>
                        <Select value={driver2Id} onValueChange={setDriver2Id}>
                            <SelectTrigger className="bg-zinc-950 border-zinc-800">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {drivers.map(d => (
                                    <SelectItem key={d.id} value={d.id} disabled={d.id === driver1Id}>
                                        {d.code} - {d.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d2?.color ? `#${d2.color}` : '#fff' }} />
                            <span className="text-sm font-bold text-zinc-300">{d2?.team}</span>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full relative">
                    <div className="flex items-center gap-2 mb-4 text-sm text-zinc-400 font-mono uppercase">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Speed Comparison (km/h)
                    </div>

                    {chartLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/50 backdrop-blur-sm z-10">
                            <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {telemetryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={telemetryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis
                                    dataKey="distance"
                                    stroke="#666"
                                    tickFormatter={(val) => `${(val / 1000).toFixed(1)}km`}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#666"
                                    domain={['auto', 'auto']}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#888' }}
                                />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="speed1"
                                    name={d1?.code || "Driver 1"}
                                    stroke={d1?.color ? `#${d1.color}` : "#3b82f6"}
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="speed2"
                                    name={d2?.code || "Driver 2"}
                                    stroke={d2?.color ? `#${d2.color}` : "#ef4444"}
                                    strokeWidth={2}
                                    dot={false}
                                    strokeDasharray="5 5"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                            <p>No telemetry data available for comparison</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
