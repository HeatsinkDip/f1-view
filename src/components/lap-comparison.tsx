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

const FALLBACK_COLORS = ["#FF1801", "#FF8700", "#00D2BE", "#3671C6"]

export function LapComparison({
    year = new Date().getFullYear(),
    location = "Lusail",
    sessionType = "Race",
}: LapComparisonProps) {
    const [data, setData] = useState<Record<string, number>[]>([])
    const [seriesMeta, setSeriesMeta] = useState<{ key: string; color: string }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        setLoading(true)
        getLapComparison(year, location, sessionType)
            .then((res) => {
                if (!active) return
                const comparisonData = res.comparison || []
                const lapMap = new Map<number, Record<string, number>>()
                const metas: { key: string; color: string }[] = []

                comparisonData.forEach((d, idx) => {
                    const colorHex = d.color
                        ? `#${d.color.replace(/^#/, "")}`
                        : FALLBACK_COLORS[idx % FALLBACK_COLORS.length]
                    metas.push({ key: d.driver, color: colorHex })
                    for (const pt of d.laps || []) {
                        if (!lapMap.has(pt.lap)) {
                            lapMap.set(pt.lap, { lap: pt.lap })
                        }
                        lapMap.get(pt.lap)![d.driver] = pt.time
                    }
                })

                const transformed = Array.from(lapMap.values()).sort((a, b) => a.lap - b.lap)
                setSeriesMeta(metas)
                setData(transformed)
            })
            .catch(() => {
                if (active) {
                    setData([])
                    setSeriesMeta([])
                }
            })
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => { active = false }
    }, [year, location, sessionType])

    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-muted-foreground">
                        Loading Laps...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[250px]" />
            </Card>
        )
    }

    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <Timer className="w-5 h-5 text-orange-600 dark:text-orange-500" />
                    Lap Comparison (Top 3)
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                {data.length === 0 ? (
                    <div className="h-[250px] flex items-center justify-center text-sm font-mono text-muted-foreground">
                        No representative lap pace data available.
                    </div>
                ) : (
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <XAxis
                                    dataKey="lap"
                                    stroke="var(--muted-foreground)"
                                    tickFormatter={(val) => `L${val}`}
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
                                    hide
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", color: "var(--card-foreground)", borderRadius: "0.5rem" }}
                                    itemStyle={{ color: "var(--card-foreground)" }}
                                    labelStyle={{ color: "var(--muted-foreground)" }}
                                    formatter={(val: number | string) => [`${val}s`]}
                                    labelFormatter={(lap) => `Lap ${lap}`}
                                />
                                <Legend />
                                {seriesMeta.map((series) => (
                                    <Line
                                        key={series.key}
                                        type="monotone"
                                        dataKey={series.key}
                                        stroke={series.color}
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
