"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Layers, Zap, Flag } from "lucide-react"
import { getTrackData, getCircuitInfo } from "@/lib/api"
import { Toggle } from "@/components/ui/toggle"

interface CircuitGuideProps {
    year?: number
    location?: string
    sessionType?: string
}

export function CircuitGuide({ year = 2025, location = "Lusail", sessionType = "Race" }: CircuitGuideProps) {
    const [trackData, setTrackData] = useState<any[]>([])
    const [circuitInfo, setCircuitInfo] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // View Controls
    const [showSectors, setShowSectors] = useState(false)
    const [showDRS, setShowDRS] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [track, info] = await Promise.all([
                    getTrackData(year, location, sessionType),
                    getCircuitInfo(year, location, sessionType)
                ])
                setTrackData(track.track_data || [])
                setCircuitInfo(info)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [year, location, sessionType])

    if (loading) {
        return (
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full animate-pulse">
                <CardHeader className="border-b border-zinc-800/50 pb-4">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg text-zinc-500">
                        Loading Circuit...
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 h-[200px]" />
            </Card>
        )
    }

    // Generate SVG Path from track data
    let pathD = ""
    let points: { x: number, y: number }[] = []

    if (trackData.length > 0) {
        // Normalize coordinates
        const xs = trackData.map(p => p.x)
        const ys = trackData.map(p => p.y)
        const minX = Math.min(...xs)
        const maxX = Math.max(...xs)
        const minY = Math.min(...ys)
        const maxY = Math.max(...ys)

        const width = 500
        const height = 300
        const padding = 40

        const scaleX = (width - padding * 2) / (maxX - minX)
        const scaleY = (height - padding * 2) / (maxY - minY)
        const scale = Math.min(scaleX, scaleY)

        points = trackData.map(p => ({
            x: (p.x - minX) * scale + padding + (width - (maxX - minX) * scale) / 2,
            y: (height - padding) - ((p.y - minY) * scale) // Flip Y for SVG
        }))

        pathD = "M " + points.map(p => `${p.x},${p.y}`).join(" L ")
    }

    // Simulate Sectors (just splitting the path into 3 chunks for visual demo)
    const sector1End = Math.floor(points.length / 3)
    const sector2End = Math.floor(points.length * 2 / 3)

    const pathS1 = points.length > 0 ? "M " + points.slice(0, sector1End).map(p => `${p.x},${p.y}`).join(" L ") : ""
    const pathS2 = points.length > 0 ? "M " + points.slice(sector1End, sector2End).map(p => `${p.x},${p.y}`).join(" L ") : ""
    const pathS3 = points.length > 0 ? "M " + points.slice(sector2End).map(p => `${p.x},${p.y}`).join(" L ") : ""

    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden h-full flex flex-col">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 uppercase tracking-wider text-lg">
                        <MapPin className="w-5 h-5 text-red-600" />
                        Circuit Guide
                    </CardTitle>
                    <div className="flex gap-2">
                        <Toggle
                            pressed={showSectors}
                            onPressedChange={setShowSectors}
                            className="data-[state=on]:bg-red-600/20 data-[state=on]:text-red-500 border border-transparent data-[state=on]:border-red-600/50 h-7 px-2"
                        >
                            <Layers className="w-3 h-3 mr-1" />
                            <span className="text-[10px] font-bold">SECTORS</span>
                        </Toggle>
                        <Toggle
                            pressed={showDRS}
                            onPressedChange={setShowDRS}
                            className="data-[state=on]:bg-green-600/20 data-[state=on]:text-green-500 border border-transparent data-[state=on]:border-green-600/50 h-7 px-2"
                        >
                            <Zap className="w-3 h-3 mr-1" />
                            <span className="text-[10px] font-bold">DRS</span>
                        </Toggle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex-1 min-h-[250px] bg-zinc-950/50 rounded-lg border border-zinc-800 flex items-center justify-center relative overflow-hidden mb-6 group">
                    {trackData.length > 0 ? (
                        <svg viewBox="0 0 500 300" className="w-full h-full p-4 filter drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                            {/* Base Track */}
                            <path d={pathD} fill="none" stroke="#e4e4e7" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" className="opacity-20" />

                            {showSectors ? (
                                <>
                                    <path d={pathS1} fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
                                    <path d={pathS2} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" style={{ animationDelay: '0.5s' }} />
                                    <path d={pathS3} fill="none" stroke="#dc2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-draw drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]" style={{ animationDelay: '1s' }} />
                                </>
                            ) : (
                                <path d={pathD} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
                            )}

                            {/* DRS Zones (Simulated) */}
                            {showDRS && points.length > 10 && (
                                <>
                                    <circle cx={points[10].x} cy={points[10].y} r="4" fill="#22c55e" className="animate-pulse" />
                                    <circle cx={points[Math.floor(points.length / 2)].x} cy={points[Math.floor(points.length / 2)].y} r="4" fill="#22c55e" className="animate-pulse" />
                                </>
                            )}

                            {/* Start/Finish */}
                            {points.length > 0 && (
                                <circle cx={points[0].x} cy={points[0].y} r="3" fill="#fff" stroke="#000" strokeWidth="1" />
                            )}
                        </svg>
                    ) : (
                        <div className="text-zinc-500">Map Unavailable</div>
                    )}

                    <div className="absolute bottom-4 right-4 flex gap-2">
                        <div className="bg-zinc-900/80 backdrop-blur px-3 py-1 rounded border border-zinc-700 text-xs font-mono flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                            LIVE TELEMETRY
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="text-xs text-zinc-500 uppercase font-mono">Location</div>
                        <div className="text-xl font-bold text-white">{circuitInfo?.location || location}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-zinc-500 uppercase font-mono">Country</div>
                        <div className="text-xl font-bold text-white">{circuitInfo?.country || "--"}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-zinc-500 uppercase font-mono">Date</div>
                        <div className="text-xl font-bold text-white">
                            {circuitInfo?.date ? new Date(circuitInfo.date).toLocaleDateString() : "--"}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-xs text-zinc-500 uppercase font-mono">Length</div>
                        <div className="text-xl font-bold text-white">5.419 km</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
