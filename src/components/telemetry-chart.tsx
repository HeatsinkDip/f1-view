"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TelemetryPoint } from "@/lib/api"

interface TelemetryChartProps {
    data: TelemetryPoint[];
    comparisonData?: TelemetryPoint[];
    dataKey: keyof TelemetryPoint;
    color?: string;
    unit?: string;
    activeIndex?: number;
}

export function TelemetryChart({ data, comparisonData, dataKey, color = "hsl(var(--primary))", unit = "", activeIndex }: TelemetryChartProps) {
    const chartData = data.map((point, i) => {
        const betterMatch = comparisonData?.find(p => Math.abs(p.distance - point.distance) < 50);
        return {
            ...point,
            val2: betterMatch ? betterMatch[dataKey] : null
        }
    });

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-800" vertical={false} />
                    <XAxis
                        dataKey="distance"
                        hide
                    />
                    <YAxis
                        hide
                        domain={dataKey === 'gear' ? [0, 8] : ['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`${value}${unit}`]}
                        labelFormatter={() => ''}
                    />
                    <Line
                        type="monotone"
                        dataKey={dataKey}
                        stroke={color}
                        dot={false}
                        strokeWidth={2}
                        isAnimationActive={false}
                    />
                    {comparisonData && (
                        <Line
                            type="monotone"
                            dataKey="val2"
                            stroke="white"
                            strokeOpacity={0.5}
                            strokeDasharray="4 4"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    )}
                    {activeIndex !== undefined && chartData[activeIndex] && (
                        <ReferenceLine x={chartData[activeIndex].distance} stroke="white" />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
