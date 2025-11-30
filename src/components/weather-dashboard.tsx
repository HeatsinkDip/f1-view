"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Thermometer, Wind, Droplets } from "lucide-react"
import { getWeather } from "@/lib/api"

interface WeatherDashboardProps {
    year?: number
    location?: string
    sessionType?: string
}

export function WeatherDashboard({ year = 2024, location = "Lusail", sessionType = "Race" }: WeatherDashboardProps) {
    const [weather, setWeather] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentWeather, setCurrentWeather] = useState<any>(null)

    useEffect(() => {
        getWeather(year, location, sessionType)
            .then((data) => {
                setWeather(data.weather)
                if (data.weather && data.weather.length > 0) {
                    // Set the latest weather data point
                    setCurrentWeather(data.weather[data.weather.length - 1])
                }
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false))
    }, [year, location, sessionType])

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-zinc-500">
                        Loading Weather...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[200px]" />
            </Card>
        )
    }

    // Fallback if no data
    const displayWeather = currentWeather || {
        air_temp: "--",
        track_temp: "--",
        wind_speed: "--",
        humidity: "--",
        rainfall: "0"
    }

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                    <CloudRain className="w-5 h-5 text-blue-500" />
                    Live Weather
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 flex flex-col items-center justify-center text-center">
                        <Thermometer className="w-6 h-6 text-red-500 mb-2" />
                        <div className="text-2xl font-bold">{displayWeather.air_temp}°C</div>
                        <div className="text-xs text-zinc-500 uppercase font-mono">Air Temp</div>
                    </div>
                    <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 flex flex-col items-center justify-center text-center">
                        <Thermometer className="w-6 h-6 text-orange-500 mb-2" />
                        <div className="text-2xl font-bold">{displayWeather.track_temp}°C</div>
                        <div className="text-xs text-zinc-500 uppercase font-mono">Track Temp</div>
                    </div>
                    <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 flex flex-col items-center justify-center text-center">
                        <Wind className="w-6 h-6 text-zinc-400 mb-2" />
                        <div className="text-2xl font-bold">{displayWeather.wind_speed} <span className="text-sm font-normal">km/h</span></div>
                        <div className="text-xs text-zinc-500 uppercase font-mono">Wind Speed</div>
                    </div>
                    <div className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800 flex flex-col items-center justify-center text-center">
                        <Droplets className="w-6 h-6 text-blue-400 mb-2" />
                        <div className="text-2xl font-bold">{displayWeather.humidity}%</div>
                        <div className="text-xs text-zinc-500 uppercase font-mono">Humidity</div>
                    </div>
                </div>

                <div className="mt-6">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-zinc-400">Rainfall</span>
                        <span className="font-bold text-blue-400">{displayWeather.rainfall ? "YES" : "NO"}</span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full w-full ${displayWeather.rainfall ? 'bg-blue-500' : 'bg-zinc-700'}`}
                            style={{ width: displayWeather.rainfall ? '100%' : '0%' }}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
