"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Timer } from "lucide-react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { getLapComparison } from "@/lib/api"

interface LapComparisonProps {
    year?: number
    location?: string
    sessionType?: string
}

export function LapComparison({ year = 2024, location = "Lusail", sessionType = "Race" }: LapComparisonProps) {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getLapComparison(year, location, sessionType)
            .then((res) => {
                // Transform data for Recharts
                // We need an array of objects like { lap: 1, ver: 90.1, ham: 90.2 }
                const comparisonData = res.comparison || []
                const transformedData: any[] = []

                // Find max laps
                let maxLaps = 0
                comparisonData.forEach((d: any) => {
                    if (d.laps.length > maxLaps) maxLaps = d.laps.length
                })

                for (let i = 0; i < maxLaps; i++) {
                    const lapPoint: any = { lap: i + 1 }
                    comparisonData.forEach((d: any) => {
                        if (d.laps[i]) {
                            lapPoint[d.driver] = d.laps[i].time
                        }
                    })
                    transformedData.push(lapPoint)
                }

                setData(transformedData)
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false))
    }, [year, location, sessionType])

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-zinc-500">
                        Loading Laps...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[250px]" />
            </Card>
        )
    }

    const drivers = Object.keys(data[0] || {}).filter(k => k !== 'lap')
    const colors = ["#FF1801", "#FF8700", "#00D2BE", "#0600EF"]

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Timer className="w-5 h-5 text-orange-500" />
                    Lap Comparison (Top 3)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis dataKey="lap" stroke="#666" tickFormatter={(val) => `L${val}`} fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" domain={['auto', 'auto']} fontSize={12} tickLine={false} axisLine={false} hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#888' }}
                            />
                            <Legend />
                            {drivers.map((driver, idx) => (
                                <Line
                                    key={driver}
                                    type="monotone"
                                    dataKey={driver}
                                    stroke={colors[idx % colors.length]}
                                    strokeWidth={2}
                                    dot={false}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
