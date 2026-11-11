"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Thermometer, Wind, Droplets } from "lucide-react"
import { getWeather, WeatherPoint } from "@/lib/api"
import { useAsyncData } from "@/lib/use-async-data"

interface WeatherDashboardProps {
    year?: number
    location?: string
    sessionType?: string
}

function fmt(val: number | null | undefined, decimals = 1): string {
    return typeof val === "number" && Number.isFinite(val) ? val.toFixed(decimals) : "--"
}

export function WeatherDashboard({
    year = new Date().getFullYear(),
    location = "Lusail",
    sessionType = "Race",
}: WeatherDashboardProps) {
    const { data: currentWeather, loading } = useAsyncData<WeatherPoint | null>(
        `weather:${year}:${location}:${sessionType}`,
        async () => {
            const data = await getWeather(year, location, sessionType).catch(() => ({ weather: [] }))
            return data.weather && data.weather.length > 0
                ? data.weather[data.weather.length - 1]
                : null
        },
        null
    )

    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-border/60 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-muted-foreground">
                        Loading Weather...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[200px]" />
            </Card>
        )
    }

    const raining = Boolean(currentWeather?.rainfall)

    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <CloudRain className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                    Live Weather
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/60 dark:bg-zinc-950/50 p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center">
                        <Thermometer className="w-6 h-6 text-red-600 dark:text-red-500 mb-2" />
                        <div className="text-2xl font-bold text-foreground">{fmt(currentWeather?.air_temp)}°C</div>
                        <div className="text-xs text-muted-foreground uppercase font-mono">Air Temp</div>
                    </div>
                    <div className="bg-muted/60 dark:bg-zinc-950/50 p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center">
                        <Thermometer className="w-6 h-6 text-orange-600 dark:text-orange-500 mb-2" />
                        <div className="text-2xl font-bold text-foreground">{fmt(currentWeather?.track_temp)}°C</div>
                        <div className="text-xs text-muted-foreground uppercase font-mono">Track Temp</div>
                    </div>
                    <div className="bg-muted/60 dark:bg-zinc-950/50 p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center">
                        <Wind className="w-6 h-6 text-muted-foreground mb-2" />
                        <div className="text-2xl font-bold text-foreground">
                            {fmt(currentWeather?.wind_speed)} <span className="text-sm font-normal">m/s</span>
                        </div>
                        <div className="text-xs text-muted-foreground uppercase font-mono">Wind Speed</div>
                    </div>
                    <div className="bg-muted/60 dark:bg-zinc-950/50 p-4 rounded-lg border border-border flex flex-col items-center justify-center text-center">
                        <Droplets className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                        <div className="text-2xl font-bold text-foreground">{fmt(currentWeather?.humidity, 0)}%</div>
                        <div className="text-xs text-muted-foreground uppercase font-mono">Humidity</div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Rainfall</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{raining ? "YES" : "NO"}</span>
                    </div>
                    <div className="h-2 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${raining ? "bg-blue-600 dark:bg-blue-500" : "bg-muted-foreground/30"}`}
                            style={{ width: raining ? "100%" : "0%" }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
