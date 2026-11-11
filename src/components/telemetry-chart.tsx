"use client"

import { useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TelemetryPoint } from "@/lib/api"

interface TelemetryChartProps {
    data: TelemetryPoint[];
    comparisonData?: TelemetryPoint[];
    dataKey: keyof TelemetryPoint;
    color?: string;
    unit?: string;
    activeIndex?: number;
}

function findClosestByDistance(points: TelemetryPoint[], targetDist: number): TelemetryPoint | null {
    if (!points || points.length === 0) return null;
    let best: TelemetryPoint | null = null;
    let bestDiff = Infinity;
    for (const p of points) {
        const diff = Math.abs(p.distance - targetDist);
        if (diff < bestDiff) {
            bestDiff = diff;
            best = p;
        }
    }
    return bestDiff <= 150 ? best : null;
}

export function TelemetryChart({ data, comparisonData, dataKey, color = "hsl(var(--primary))", unit = "", activeIndex }: TelemetryChartProps) {
    const chartData = useMemo(() => {
        const hasComp = comparisonData && comparisonData.length > 0;
        return data.map((point) => {
            const closest = hasComp ? findClosestByDistance(comparisonData, point.distance) : null;
            return {
                ...point,
                val2: closest ? closest[dataKey] : null
            };
        });
    }, [data, comparisonData, dataKey]);

    if (!data || data.length === 0) {
        return (
            <div className="h-full w-full flex items-center justify-center text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Telemetry unavailable
            </div>
        );
    }

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                        dataKey="distance"
                        hide
                    />
                    <YAxis
                        hide
                        domain={dataKey === 'gear' ? [0, 8] : ['auto', 'auto']}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)', borderRadius: '0.5rem' }}
                        itemStyle={{ color: 'var(--card-foreground)' }}
                        formatter={(value: number | string) => [`${value}${unit}`]}
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
                    {comparisonData && comparisonData.length > 0 && (
                        <Line
                            type="monotone"
                            dataKey="val2"
                            stroke="var(--foreground)"
                            strokeOpacity={0.5}
                            strokeDasharray="4 4"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                    )}
                    {activeIndex !== undefined && chartData[activeIndex] && (
                        <ReferenceLine x={chartData[activeIndex].distance} stroke="var(--foreground)" />
                    )}
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
