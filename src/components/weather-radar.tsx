"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CloudRain, Thermometer, Wind } from "lucide-react"

export function WeatherRadar() {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader className="py-3 px-4 border-b border-zinc-800">
                <CardTitle className="text-xs font-mono uppercase text-zinc-400 flex items-center gap-2">
                    <CloudRain className="w-3 h-3 text-blue-500" />
                    Track Conditions
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-zinc-950/50 rounded border border-zinc-800">
                        <Thermometer className="w-4 h-4 text-red-500 mx-auto mb-1" />
                        <div className="text-lg font-bold">32°C</div>
                        <div className="text-[10px] text-zinc-500 uppercase">Track</div>
                    </div>
                    <div className="text-center p-2 bg-zinc-950/50 rounded border border-zinc-800">
                        <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                        <div className="text-lg font-bold">24°C</div>
                        <div className="text-[10px] text-zinc-500 uppercase">Air</div>
                    </div>
                    <div className="text-center p-2 bg-zinc-950/50 rounded border border-zinc-800">
                        <Wind className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                        <div className="text-lg font-bold">12<span className="text-[10px]">km/h</span></div>
                        <div className="text-[10px] text-zinc-500 uppercase">NW</div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Rain Probability</span>
                        <span className="font-bold text-blue-400">15%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full w-[15%] bg-blue-500" />
                    </div>
                    <div className="flex justify-between text-[10px] text-zinc-600 font-mono pt-1">
                        <span>NOW</span>
                        <span>10m</span>
                        <span>20m</span>
                        <span>30m</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
