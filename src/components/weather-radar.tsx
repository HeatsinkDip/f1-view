"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Thermometer, Wind, Droplets } from "lucide-react"
import { getWeather, WeatherPoint } from "@/lib/api"

interface WeatherRadarProps {
    year?: number
    location?: string
    sessionType?: string
}

function fmt(val: number | null | undefined, decimals = 1): string {
    return typeof val === "number" && Number.isFinite(val) ? val.toFixed(decimals) : "--"
}

export function WeatherRadar({ year = 2025, location = "Lusail", sessionType = "Race" }: WeatherRadarProps) {
    const queryKey = `${year}|${location}|${sessionType}`
    const [weather, setWeather] = useState<WeatherPoint | null>(null)
    const [loadedKey, setLoadedKey] = useState<string>("")
    const loading = loadedKey !== queryKey

    useEffect(() => {
        let active = true
        getWeather(year, location, sessionType)
            .then((data) => {
                if (!active) return
                if (data.weather && data.weather.length > 0) {
                    setWeather(data.weather[data.weather.length - 1])
                } else {
                    setWeather(null)
                }
            })
            .catch(() => {
                if (active) setWeather(null)
            })
            .finally(() => {
                if (active) setLoadedKey(queryKey)
            })
        return () => { active = false }
    }, [year, location, sessionType, queryKey])

    if (loading) {
        return (
            <Card className="bg-card/80 dark:bg-zinc-900/50 border-border animate-pulse h-full">
                <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-xs font-mono uppercase text-muted-foreground">Loading Weather...</CardTitle>
                </CardHeader>
                <CardContent className="p-4 h-[150px]" />
            </Card>
        )
    }

    if (!weather) {
        return (
            <Card className="bg-card/80 dark:bg-zinc-900/50 border-border h-full">
                <CardHeader className="py-3 px-4 border-b border-border">
                    <CardTitle className="text-xs font-mono uppercase text-muted-foreground">Weather Unavailable</CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-muted-foreground text-xs">No data for this session.</CardContent>
            </Card>
        )
    }

    const humidityVal = typeof weather.humidity === "number" ? Math.min(100, Math.max(0, weather.humidity)) : 0

    return (
        <Card className="bg-card/80 dark:bg-zinc-900/50 border-border h-full">
            <CardHeader className="py-3 px-4 border-b border-border">
                <CardTitle className="text-xs font-mono uppercase text-muted-foreground flex items-center gap-2">
                    <CloudRain className="w-3 h-3 text-blue-600 dark:text-blue-500" />
                    Track Conditions
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-muted/60 dark:bg-zinc-950/50 rounded border border-border">
                        <Thermometer className="w-4 h-4 text-red-600 dark:text-red-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-foreground">{fmt(weather.track_temp)}°C</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Track</div>
                    </div>
                    <div className="text-center p-2 bg-muted/60 dark:bg-zinc-950/50 rounded border border-border">
                        <Thermometer className="w-4 h-4 text-orange-600 dark:text-orange-500 mx-auto mb-1" />
                        <div className="text-lg font-bold text-foreground">{fmt(weather.air_temp)}°C</div>
                        <div className="text-[10px] text-muted-foreground uppercase">Air</div>
                    </div>
                    <div className="text-center p-2 bg-muted/60 dark:bg-zinc-950/50 rounded border border-border">
                        <Wind className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                        <div className="text-lg font-bold text-foreground">{fmt(weather.wind_speed)}<span className="text-[10px]">m/s</span></div>
                        <div className="text-[10px] text-muted-foreground uppercase">Wind</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1"><Droplets className="w-3 h-3" /> Humidity</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{fmt(weather.humidity)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 dark:bg-blue-500" style={{ width: `${humidityVal}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground font-mono pt-1">
                        <span>Pressure: {fmt(weather.pressure, 0)} mbar</span>
                        <span>Rain: {weather.rainfall ? 'YES' : 'NO'}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
